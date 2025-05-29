import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minLength: [2, "First name must be at least 2 characters"],
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      minLength: [2, "Last name must be at least 2 characters"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (email) => validator.isEmail(email),
        message: "Invalid email format",
      },
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["doctor", "receptionist", "admin"],
      default: "doctor",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for role
userSchema.index({ role: 1 });
userSchema.index({ email: 1 });

// Pre-save hook to hash password
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Pre-find hook to exclude inactive users
userSchema.pre(["find", "findOne", "findOneAndUpdate"], function (next) {
  this.where({ isActive: true });
  next();
});

const User = mongoose.model("User", userSchema);
export default User;
