import express from "express";

import {
  weeklyReport,
  suggestHabits,
  recoveryPlan,
  chatAnalysis,
  morningMotivation,
} from "../controllers/aiController.js";

import { protect } from "../middleware/auth.js";

const router = express.Router();

// ==========================================
// Weekly AI Report
// GET /api/ai/weekly
// ==========================================

router.post(
  "/weekly-report",
  protect,
  weeklyReport
);

// ==========================================
// AI Habit Suggestions
// POST /api/ai/suggestions
// ==========================================

router.post(
  "/suggest-habits",
  protect,
  suggestHabits
);

// ==========================================
// Recovery Plan
// POST /api/ai/recovery
// ==========================================

router.post(
  "/recovery-plan",
  protect,
  recoveryPlan
);

// ==========================================
// AI Chat Analysis
// POST /api/ai/chat
// ==========================================

router.post(
  "/chat",
  protect,
  chatAnalysis
);

// ==========================================
// Morning Motivation
// GET /api/ai/morning
// ==========================================

router.get(
  "/morning",
  protect,
  morningMotivation
);

export default router;