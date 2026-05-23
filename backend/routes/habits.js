import express from "express";

import {
  createHabit,
  getHabits,
  updateHabit,
  deleteHabit,
  archiveHabit,
  reorderHabits,
} from "../controllers/habitController.js";

import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect)
// Create Habit
router.post("/", createHabit);

// Get All Habits
router.get("/", getHabits);

// Update Habit
router.put("/:id", updateHabit);

// Delete Habit
router.delete("/:id", deleteHabit);

// Archive / Unarchive Habit
router.put("/:id/archive", archiveHabit);

// Reorder Habits
router.put("/reorder", reorderHabits);

export default router;