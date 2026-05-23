import Habit from "../models/Habit.js";
import HabitLog from "../models/HabitLog.js";
import AIInsight from "../models/AIInsight.js";

import {
  chatCompletion,
  SYSTEM_PROMPTS,
  parseJSON,
} from "../utils/aiService.js";

import {
  lastNDays,
  calcStreak,
  todayKey,
} from "../utils/dateHelper.js";

// ==========================================
// Build Weekly Context
// ==========================================

const buildWeeklyContext = async (userId) => {
  const habits = await Habit.find({
    userId,
    isArchived: false,
  });

  const days = lastNDays(7);

  const logs = await HabitLog.find({
    userId,
    completeDate: {
      $gte: days[0],
      $lte: days[days.length - 1],
    },
  });

  const perHabit = habits.map((h) => {
    const completed = logs.filter(
      (l) => String(l.habitId) === String(h._id)
    ).length;

    return {
      name: h.name,
      category: h.category,
      frequency: h.frequency,
      completedDays: completed,
      targetDays: h.targetDays,
    };
  });

  return {
    days,
    perHabit,
  };
};

// ==========================================
// Weekly Report
// ==========================================

export const weeklyReport = async (req, res) => {
  try {
    const ctx = await buildWeeklyContext(req.user._id);

    if (!ctx.perHabit.length) {
      return res.json({
        content:
          "You don't have any active habits yet. Create your first habit to start tracking progress.",
      });
    }

    const userMsg = `
Here is the user's habit data for the past 7 days (${ctx.days[0]} to ${ctx.days[6]}):

${ctx.perHabit
  .map(
    (h) =>
      `- ${h.name} (${h.category}, ${h.frequency}): completed ${h.completedDays} of 7 days, target ${h.targetDays}`
  )
  .join("\n")}

Please write the personalised weekly report now.
`;

    const result = await chatCompletion({
      system: SYSTEM_PROMPTS.weekly,
      user: userMsg,
    });

    await AIInsight.create({
      userId: req.user._id,
      type: "weekly",
      content: result.content,
    });

    res.json({
      content: result.content,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// ==========================================
// Suggest Habits
// ==========================================

export const suggestHabits = async (req, res) => {
  try {
    const {
      goals,
      productiveTime,
      struggles,
    } = req.body;

    const userMsg = `
User goals: ${goals || "not provided"}

Most productive time:
${productiveTime || "not provided"}

User struggles:
${struggles || "not provided"}

Suggest 3 habits in JSON format:
{
  "suggestions":[]
}
`;

    const result = await chatCompletion({
      system: SYSTEM_PROMPTS.suggestion,
      user: userMsg,
    });

    let suggestions = [];

    const parsed = parseJSON(result.content);

    if (parsed?.suggestions) {
      suggestions = parsed.suggestions;
    }

    // Fallback suggestions
    if (!suggestions.length) {
      suggestions = [
        {
          name: "10-minute morning walk",
          description:
            "Start the day with light movement and fresh air.",
          frequency: "daily",
          category: "Fitness",
          icon: "🚶",
          reason:
            "Low-friction way to build consistency.",
        },

        {
          name: "Read 5 pages",
          description:
            "Short daily reading habit.",
          frequency: "daily",
          category: "Learning",
          icon: "📚",
          reason:
            "Builds long-term knowledge.",
        },

        {
          name: "2 minutes breathing",
          description:
            "Mindful breathing to reduce stress.",
          frequency: "daily",
          category: "Mindfulness",
          icon: "🧘",
          reason:
            "Easy habit that fits any schedule.",
        },
      ];
    }

    await AIInsight.create({
      userId: req.user._id,
      type: "suggestion",
      content: JSON.stringify(suggestions),
      meta: {
        goals,
        productiveTime,
        struggles,
      },
    });

    res.json({
      suggestions,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// ==========================================
// Recovery Plan
// ==========================================

export const recoveryPlan = async (req, res) => {
  try {
    const { habitId } = req.body;

    const habit = await Habit.findOne({
      _id: habitId,
      userId: req.user._id,
    });

    if (!habit) {
      return res.status(404).json({
        message: "Habit not found",
      });
    }

    const logs = await HabitLog.find({
      userId: req.user._id,
      habitId,
    }).sort({
      completeDate: -1,
    });

    const keys = logs.map(
      (l) => l.completeDate
    );

    const {
      current,
      longest,
    } = calcStreak(keys);

    const userMsg = `
Habit: ${habit.name} (${habit.category})

Description:
${habit.description || "none"}

Current streak: ${current}

Longest streak: ${longest}

Write a 3-day recovery plan.
`;

    const result = await chatCompletion({
      system: SYSTEM_PROMPTS.recovery,
      user: userMsg,
    });

    await AIInsight.create({
      userId: req.user._id,
      type: "recovery",
      content: result.content,
      meta: {
        habitId,
      },
    });

    res.json({
      content: result.content,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// ==========================================
// Chat Analysis
// ==========================================

export const chatAnalysis = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        message: "Question is required",
      });
    }

    const habits = await Habit.find({
      userId: req.user._id,
      isArchived: false,
    });

    const days = lastNDays(30);

    const logs = await HabitLog.find({
      userId: req.user._id,
      completeDate: {
        $gte: days[0],
        $lte: days[days.length - 1],
      },
    });

    const context = habits
      .map((h) => {
        const hLogs = logs.filter(
          (l) =>
            String(l.habitId) === String(h._id)
        );

        const byDow = [
          0, 0, 0, 0, 0, 0, 0,
        ];

        for (const l of hLogs) {
          const dow = new Date(
            l.completeDate
          ).getDay();

          byDow[dow] += 1;
        }

        return `
${h.name} (${h.category})

Completed:
${hLogs.length}/30 days

Weekday pattern:
${JSON.stringify(byDow)}
`;
      })
      .join("\n");

    const userMsg = `
User question:
"${question}"

User data (last 30 days):

${context}

Answer now.
`;

    const result = await chatCompletion({
      system: SYSTEM_PROMPTS.chat,
      user: userMsg,
    });

    await AIInsight.create({
      userId: req.user._id,
      type: "chat",
      content: result.content,
      meta: {
        question,
      },
    });

    res.json({
      content: result.content,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// ==========================================
// Morning Motivation
// ==========================================

export const morningMotivation = async (
  req,
  res
) => {
  try {
    const habits = await Habit.find({
      userId: req.user._id,
      isArchived: false,
    });

    if (!habits.length) {
      return res.json({
        content:
          "Good morning! Add your first habit today and let's build momentum 🚀",
      });
    }

    const days = lastNDays(30);

    const logs = await HabitLog.find({
      userId: req.user._id,
      completeDate: {
        $gte: days[0],
        $lte: days[days.length - 1],
      },
    });

    const ctx = habits
      .map((h) => {
        const hLogs = logs
          .filter(
            (l) =>
              String(l.habitId) ===
              String(h._id)
          )
          .map((l) => l.completeDate)
          .sort()
          .reverse();

        const { current } =
          calcStreak(hLogs);

        return `${h.name}: current streak ${current}`;
      })
      .join("\n");

    const today = todayKey();

    const todayLogs = logs.filter(
      (l) => l.completeDate === today
    );

    const done = todayLogs.length;

    const total = habits.length;

    const userMsg = `
Today's habits and streaks:

${ctx}

Done today:
${done}/${total}

Write the morning motivation.
`;

    const result = await chatCompletion({
      system: SYSTEM_PROMPTS.morning,
      user: userMsg,
      temperature: 0.8,
    });

    await AIInsight.create({
      userId: req.user._id,
      type: "morning",
      content: result.content,
    });

    res.json({
      content: result.content,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};