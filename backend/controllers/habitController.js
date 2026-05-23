import Habit from "../models/Habit.js";
import HabitLog from "../models/HabitLog.js";

// ==========================================
// @desc Create Habit
// @route POST /api/habits
// @access Private
// ==========================================

export const createHabit = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      frequency,
      targetDays,
      icon,
      color,
    } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({

        message: "Habit name is required",
      });
    }

    // Create Habit
    const count=await Habit.countDocuments({userId:req.user._id})
    const habit = await Habit.create({
      userId: req.user._id,
      name,
      description,
      category,
      frequency,
      targetDays,
      icon,
      color,
      order:count
    });

    res.status(201).json(habit);
  } catch (error) {
    res.status(500).json({
     
      message: error.message,
    });
  }
};

// ==========================================
// @desc Get All Habits
// @route GET /api/habits
// @access Private
// ==========================================

export const getHabits = async (req, res) => {
  try {
    const {includeArchived}=req.query;
    const filter={userId:req.user._id};
    if(includeArchived!=="true") filter.isArchived=false;
    const habits = await Habit.find(filter).sort({order:1, createdAt: -1 });

    res.json(habits);
  } catch (error) {
    res.status(500).json({
      
      message: error.message,
    });
  }
};

// ==========================================
// @desc Get Single Habit
// @route GET /api/habits/:id
// @access Private
// ==========================================

// export const getHabitById = async (req, res) => {
//   try {
//     const habit = await Habit.findOne({
//       _id: req.params.id,
//       userId: req.user._id,
//     });

//     if (!habit) {
//       return res.status(404).json({
//         success: false,
//         message: "Habit not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       habit,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// ==========================================
// @desc Update Habit
// @route PUT /api/habits/:id
// @access Private
// ==========================================

export const updateHabit = async (req, res) => {
  try {
    const habit = await Habit.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!habit) {
      return res.status(404).json({

        message: "Habit not found",
      });
    }
    const fields = [
        
        "name",
        "description",
        "category",
        "frequency",
        "targetDays",
        "icon",
        "color",
        "order"
    ];
    for(const f of fields){
        if(req.body[f]!==undefined) habit[f]=req.body[f]
    }


    await habit.save();

    res.json(habit);
  } catch (error) {
    res.status(500).json({
     
      message: error.message,
    });
  }
};

// ==========================================
// @desc Delete Habit
// @route DELETE /api/habits/:id
// @access Private
// ==========================================

export const deleteHabit = async (req, res) => {
  try {
    const habit = await Habit.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!habit) {
      return res.status(404).json({
     
        message: "Habit not found",
      });
    }

    // Delete logs first
    await HabitLog.deleteMany({
      habitId: habit._id,
      userId:req.user._id
    });

    // Delete habit
    

    res.status(200).json({
      success: true,
      message: "Habit deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// @desc Mark Habit Complete
// @route POST /api/habits/:id/complete
// @access Private
// ==========================================

// export const completeHabit = async (req, res) => {
//   try {
//     const habit = await Habit.findOne({
//       _id: req.params.id,
//       userId: req.user._id,
//     });

//     if (!habit) {
//       return res.status(404).json({
//         success: false,
//         message: "Habit not found",
//       });
//     }

//     // Today's date
//     const today = new Date().toISOString().split("T")[0];

//     // Already completed?
//     const alreadyCompleted = await HabitLog.findOne({
//       userId: req.user._id,
//       habitId: habit._id,
//       completeDate: today,
//     });

//     if (alreadyCompleted) {
//       return res.status(400).json({
//         success: false,
//         message: "Habit already completed today",
//       });
//     }

//     // Create log
//     await HabitLog.create({
//       userId: req.user._id,
//       habitId: habit._id,
//       completeDate: today,
//     });

//     res.status(201).json({
//       success: true,
//       message: "Habit marked as completed",
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// ==========================================
// @desc Get Habit Logs
// @route GET /api/habits/:id/logs
// @access Private
// ==========================================

// export const getHabitLogs = async (req, res) => {
//   try {
//     const logs = await HabitLog.find({
//       userId: req.user._id,
//       habitId: req.params.id,
//     }).sort({ createdAt: -1 });

//     res.status(200).json({
//       success: true,
//       count: logs.length,
//       logs,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


export const archiveHabit = async (req, res) => {
    try {
      const habit = await Habit.findOne({
        _id: req.params.id,
        userId: req.user._id,
      });
  
      if (!habit) {
        return res.status(404).json({
          message: "Habit not found",
        });
      }
  
      // Toggle archive status
      habit.isArchived = !habit.isArchived;
  
      await habit.save();
  
      res.json(habit);
    } catch (err) {
      res.status(500).json({
        message: err.message,
      });
    }
  };
// ==========================================
// @desc Reorder Habits
// @route PUT /api/habits/reorder
// @access Private
// ==========================================

export const reorderHabits = async (req, res) => {
    try {
      const { order } = req.body;
  
      if (!Array.isArray(order)) {
        return res.status(400).json({
          success: false,
          message: "order must be an array",
        });
      }
  
      await Promise.all(
        order.map(({ id, idx }) =>
          Habit.updateOne(
            {
              _id: id,
              userId: req.user._id,
            },
            {
              $set: { order: idx },
            }
          )
        )
      );
  
      res.json({
        success: true,
        message: "Habits reordered successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };