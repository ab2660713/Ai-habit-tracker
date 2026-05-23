import User from "../models/User.js";
import jwt from "jsonwebtoken";

// Generate JWT Token
const signToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "30d",
    }
  );
};

// ==========================================
// @desc Register User
// @route POST /api/auth/register
// @access Public
// ==========================================

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate Fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Password Validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // Check Existing User
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Create User
    const user = await User.create({
      name,
      email,
      password,
      avatar: name.charAt(0).toUpperCase(),
    });

    // Generate Token
    const token = signToken(user._id);

    // Response
    res.status(201).json({
      success: true,
      token,

      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        morningMotivation: user.morningMotivation,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// @desc Login User
// @route POST /api/auth/login
// @access Public
// ==========================================

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate Fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password required",
      });
    }

    // Find User
    const user = await User.findOne({ email });

    // Check Password
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate Token
    const token = signToken(user._id);

    // Response
    res.status(200).json({
      success: true,
      token,

      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        morningMotivation: user.morningMotivation,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// @desc Get Current User
// @route GET /api/auth/me
// @access Private
// ==========================================

export const me = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

// ==========================================
// @desc Update User Profile
// @route PUT /api/auth/profile
// @access Private
// ==========================================

export const updateProfile = async (req, res) => {
  try {
    const { name, morningMotivation } = req.body;

    // Find Logged In User
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update Name
    if (name !== undefined) {
      user.name = name;
      user.avatar = name.charAt(0).toUpperCase();
    }

    // Update Motivation
    if (morningMotivation !== undefined) {
      user.morningMotivation = morningMotivation;
    }

    // Save Changes
    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",

      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        morningMotivation: user.morningMotivation,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};