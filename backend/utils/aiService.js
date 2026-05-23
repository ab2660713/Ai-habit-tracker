import { GoogleGenAI } from "@google/genai";

let client = null;

// ==========================================
// Get Gemini Client
// ==========================================

const getClient = () => {
  if (client) return client;

  const key = process.env.GEMINI_API_KEY;

  // If API key missing
  if (!key) return null;

  client = new GoogleGenAI({
    apiKey: key,
  });

  return client;
};

// ==========================================
// Model
// ==========================================

const MODEL =
  process.env.GEMINI_MODEL ||
  "gemini-2.5-flash";

// ==========================================
// AI Enabled Check
// ==========================================

export const isAIEnabled = () => {
  return !!process.env.GEMINI_API_KEY;
};

// ==========================================
// Parse JSON Safely
// ==========================================

export const parseJSON = (text) => {
  try {
    let cleaned = (text || "").trim();

    // Remove ```json
    if (cleaned.startsWith("```json")) {
      cleaned = cleaned
        .replace(/```json\n?/g, "")
        .replace(/```$/g, "");
    }

    // Remove ```
    cleaned = cleaned.replace(/```/g, "");

    return JSON.parse(cleaned.trim());
  } catch (error) {
    console.error("JSON Parse Error:", error);

    return null;
  }
};

// ==========================================
// Chat Completion
// ==========================================

export const chatCompletion = async ({
  system,
  user,
  temperature = 0.7,
}) => {
  const c = getClient();

  // AI Disabled
  if (!c) {
    return {
      ok: false,
      content:
        "AI features are disabled. Set GEMINI_API_KEY in backend .env file.",
    };
  }

  try {
    const res = await c.models.generateContent({
      model: MODEL,

      contents: user,

      config: {
        systemInstruction: system,

        temperature,
      },
    });

    return {
      ok: true,

      content: (res.text || "").trim(),
    };
  } catch (err) {
    console.error("AI Error:", err.message);

    return {
      ok: false,

      content:
        "AI request failed. Please try again later.",
    };
  }
};

// ==========================================
// System Prompts
// ==========================================

export const SYSTEM_PROMPTS = {
  weekly: `
You are a warm and encouraging habit coach.

Analyse the user's last 7 days of habit data.

Write:
- a short summary
- praise achievements
- identify weak areas
- give motivation

Keep response friendly and concise.
`,

  suggestion: `
You are a helpful habit coach.

Based on the user's goals, struggles, and productivity patterns:

- suggest better routines
- suggest realistic improvements
- avoid generic advice

Keep suggestions actionable.
`,

  recovery: `
You are a compassionate recovery coach.

The user broke a streak.

Create:
- a simple 3-day recovery plan
- emotional encouragement
- easy restart strategy

Do not shame the user.
`,

  chat: `
You are a habit analysis assistant.

Answer ONLY using the user's habit data.

If data is insufficient, say so clearly.
`,

  morning: `
You are a warm motivational friend.

Write:
- one short morning motivation
- 30-60 words
- positive and energetic tone
- personalized if possible
`,
};