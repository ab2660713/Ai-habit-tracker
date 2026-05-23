import Habit from "../models/Habit.js";
import HabitLog from "../models/HabitLog.js";

import {
  todayKey,
  lastNDays,
  last90Days,
  calcStreak,
} from "../utils/dateHelper.js";
export const markComplete = async (req, res) => {
    try {
      const { habitId, date } = req.body;
  
      const completeDate = date || todayKey();
  
      // Find Habit
      const habit = await Habit.findOne({
        _id: habitId,
        userId: req.user._id,
      });
  
      if (!habit) {
        return res.status(404).json({
          success: false,
          message: "Habit not found",
        });
      }
  
      // Create Log
      const log = await HabitLog.findOneAndUpdate(
        {
          userId: req.user._id,
          habitId,
          completeDate,
        },
        {
          $setOnInsert: {
            userId: req.user._id,
            habitId,
            completeDate,
          },
        },
        {
          upsert: true,
          new: true,
        }
      );
  
      res.status(201).json({
        _id: log._id,
        habitId: log.habitId,
        completedDate: log.completeDate,
        userId: log.userId,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
  
  export const unmarkComplete = async (req, res) => {
    try {
      const { habitId, date } = req.body;
  
      const completeDate = date || todayKey();
  
      await HabitLog.findOneAndDelete({
        userId: req.user._id,
        habitId,
        completeDate,
      });
  
      res.json({
        success: true,
        message: "Unmarked",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
export const getToday = async (req, res) => {
  try {
    const logs = await HabitLog.find({
      userId: req.user._id,
      completeDate:todayKey(),
    });

    res.json(logs.map(l => ({ _id: l._id, habitId: l.habitId, completedDate: l.completeDate, userId: l.userId })));
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const getRange = async (req, res) => {
  try {
    const {start,end}=req.query;
    const logs = await HabitLog.find({
      userId: req.user._id,
      completeDate:{$gte:start,$lte:end},
    });

    
    res.json(logs.map(l => ({ _id: l._id, habitId: l.habitId, completedDate: l.completeDate, userId: l.userId })));
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



export const getHeatmap = async (req, res) => {
  try {
    const days = last90Days();

    const logs = await HabitLog.find({
      userId: req.user._id,
      
      completeDate: {
        $gte: days[0],$lte:days[days.length-1]
      },
    });
const count={};
for (const d of days) count[d]=0;
for (const l of logs) count[l.completeDate]=(count[l.completeDate]||0)+1;


    const data = days.map((d) => ({
      date: d,
      count: count[d]||0
    }));

    res.json(data);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const getHabitStats = async (req, res) => {
    try {
      const { habitId } = req.params;
  
      // Find habit
      const habit = await Habit.findOne({
        _id: habitId,
        userId: req.user._id,
      });
  
      if (!habit) {
        return res.status(404).json({
          success: false,
          message: "Habit not found",
        });
      }
  
      // Get all logs
      const logs = await HabitLog.find({
        userId: req.user._id,
        habitId:habit._id,
      }).sort({
        completeDate: -1,
      });
      const dateKey=logs.map((l)=>l.completeDate)
      const {current,longest} = calcStreak(dateKey);
  const createdKey=habit.createdAt.toISOString().slice(0,10);
  const today=todayKey();
  const start=new Date(createdKey);
  const end=new Date(today);
  const totalDays=
  Math.max(1,Math.round((end-start)/(1000*60*60*24)))+1;
      const completionRate =Math.round((logs.length/totalDays)*100);

   const monthly={};
   for(const l of logs){
    const m=l.completeDate.slice(0,7);
    monthly[m]=(monthly[m]||0)+1;
   }
   res.json({
    success: true,
  
    habit,
  
    stats: {
      totalCompletions: logs.length,
  
      currentStreak: current,
  
      longestStreak: longest,
  
      completionRate,
  
      monthly,
    },
  });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
}

export const getAllStats = async (req, res) => {
    try {
      const userId = req.user._id;
  const days=last90Days();
      // Get all active habits
      const habits = await Habit.find({
        userId,
        isArchived: false,
      });
  
      // Get all logs
      const logs = await HabitLog.find({
        userId: req.user._id,
        
        completeDate: {
          $gte: days[0],$lte:days[days.length-1]
        },
      });
  const perHabit=habits.map((h)=>{
      const hLogs=logs.filter((l)=>String(l.habitId)===String(h._id));
      const keys=hLogs.map((l)=>l.completeDate).sort().reverse();
    const {current,longest} = calcStreak(keys);
    return{
           habitId:h._id,
           name:h.name,
           icon:h.icon,
           color:h.color,
  
          completions30d: hLogs.length,
          currentStreak: current,
  
          longestStreak: longest,
  
          category:h.category,
  
          
    }
  });
   
      res.json({
        perHabit,days
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
