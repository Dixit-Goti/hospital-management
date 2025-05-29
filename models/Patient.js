import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";

const patientSchema = new mongoose.Schema(
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
    mobile: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minLength: [10, "Mobile number must be at least 10 characters"],
    },
    dob: {
      type: Date,
      required: false,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: false,
    },
    address: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: true,
    },
    profileImage: {
      type: String,
      required: false,
    },
    joinDate: {
      type: Date,
      default: Date.now,
    },
    role: {
      type: String,
      enum: ["patient"],
      default: "patient",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for mobile
patientSchema.index({ mobile: 1 });
patientSchema.index({ email: 1 });

// Pre-save hook to hash password
patientSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Pre-find hook to exclude soft-deleted patients
patientSchema.pre(["find", "findOne", "findOneAndUpdate"], function (next) {
  this.where({ isDeleted: false });
  next();
});

const Patient = mongoose.model("Patient", patientSchema);
export default Patient;
