import mongoose from "mongoose";

const habitLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    habitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Habit",
      required: true,
      index: true,
    },

    completeDate: {
      type: String,
      required: true,
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate completion per day
habitLogSchema.index(
  {
    userId: 1,
    habitId: 1,
    completeDate: 1,
  },
  {
    unique: true,
  }
);

const HabitLog = mongoose.model("HabitLog", habitLogSchema);

export default HabitLog;