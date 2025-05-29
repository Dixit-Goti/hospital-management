import User from "../models/User.js";
import Patient from "../models/Patient.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator";
import { ApiError } from "../utils/error.js";
import { successResponse } from "../utils/response.js";

export const loginDoctor = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      throw ApiError.BadRequest(
        "Email and password are required",
        "MISSING_FIELDS"
      );
    }
    if (!validator.isEmail(email)) {
      throw ApiError.BadRequest("Invalid email format", "INVALID_EMAIL");
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase();

    // Find doctor by email
    const user = await User.findOne({
      email: normalizedEmail,
      role: "doctor",
    }).select("+password");
    if (!user) {
      throw ApiError.Unauthorized("Invalid credentials", "INVALID_CREDENTIALS");
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw ApiError.Unauthorized("Invalid credentials", "INVALID_CREDENTIALS");
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return successResponse(
      res,
      {
        token,
        user: { id: user._id, name: user.firstName, role: user.role },
      },
      "Doctor logged in successfully"
    );
  } catch (err) {
    next(err);
  }
};

export const loginPatient = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      throw ApiError.BadRequest(
        "Email and password are required",
        "MISSING_FIELDS"
      );
    }
    if (!validator.isEmail(email)) {
      throw ApiError.BadRequest("Invalid email format", "INVALID_EMAIL");
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase();

    // Find patient by email
    const patient = await Patient.findOne({ email: normalizedEmail }).select(
      "+password"
    );
    if (!patient) {
      throw ApiError.Unauthorized("Invalid credentials", "INVALID_CREDENTIALS");
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, patient.password);
    if (!isMatch) {
      throw ApiError.Unauthorized("Invalid credentials", "INVALID_CREDENTIALS");
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: patient._id,
        email: patient.email,
        role: "patient",
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return successResponse(
      res,
      {
        token,
        patient: { id: patient._id, name: patient.firstName, role: "patient" },
      },
      "Patient logged in successfully"
    );
  } catch (err) {
    next(err);
  }
};
