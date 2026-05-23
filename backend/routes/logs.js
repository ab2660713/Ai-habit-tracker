import express from "express";

import {
  markComplete,
  unmarkComplete,
  getToday,
  getRange,
  getHeatmap,
  getHabitStats,
  getAllStats,
} from "../controllers/logController.js";

import { protect } from "../middleware/auth.js";

const router = express.Router();


router.post(
  "/",
  protect,
  markComplete
);


router.delete(
  "/",
  protect,
  unmarkComplete
);



router.get(
  "/today",
  protect,
  getToday
);


router.get(
  "/range",
  protect,
  getRange
);


router.get(
  "/heatmap",
  protect,
  getHeatmap
);



router.get(
  "/stats/:habitId",
  protect,
  getHabitStats
);


router.get(
  "/stats",
  protect,
  getAllStats
);

export default router;