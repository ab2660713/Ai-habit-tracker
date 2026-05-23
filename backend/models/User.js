import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },

    avatar: {
      type: String,
      default: "",
    },

    morningMotivation: {
      type: Boolean,

      default: false,
    },

   
  },
  {
    timestamps: true,
  }
);

// Hash password before save
userSchema.pre("save", async function (next) {
  // Only hash if password modified
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);

  this.password = await bcrypt.hash(this.password, salt);

  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
userSchema.methods.toJSON=function(){
    const obj=this.toObject();
    delete obj.password;
    return obj;
}
const User = mongoose.model("User", userSchema);

export default User;