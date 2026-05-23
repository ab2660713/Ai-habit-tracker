import mongoose from "mongoose";

const CATEGORIES = [
  "Health",
  "Fitness",
  "Learning",
  "Mindfulness",
  "Productivity",
  "Social",
  "Finance",
  "Creative",
  "Other",
];

const habitSchema = new mongoose.Schema(
  {
    // Habit Owner
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Habit Name
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Description
    description: {
      type: String,
      default: "",
      trim: true,
    },

    // Category
    category: {
      type: String,
      enum: CATEGORIES,
      default: "Other",
    },

    // Frequency
    frequency: {
      type: String,
      enum: ["daily", "weekly"],
      default: "daily",
    },

    // Target Days
    targetDays: {
      type: Number,
      default: 7,
      min: 1,
      max: 7,
    },

    // Icon
    icon: {
      type: String,
      default: "🔥",
    },

    // Theme Color
    color: {
      type: String,
      default: "#6366f1",
    },

    // Archive Status
    isArchived: {
      type: Boolean,
      default: false,
    },
    order: {
  type: Number,
  default: 0,
},
  },
  {
    timestamps: true,
  }
);

export const HABIT_CATEGORIES = CATEGORIES;

const Habit = mongoose.model("Habit", habitSchema);

export default Habit;