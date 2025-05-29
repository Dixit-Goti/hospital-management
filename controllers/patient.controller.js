import Patient from "../models/Patient.js";
import User from "../models/User.js";
import { validationResult } from "express-validator";
import bcrypt from "bcrypt";
import { successResponse } from "../utils/response.js";
import { ApiError } from "../utils/error.js";
import sendEmail from "../utils/sendEmail.js";
import { getWelcomeEmailHTML } from "../utils/emailTemplates/welcomeTemplate.js";

// Generate secure random password
const generateRandomPassword = (length = 12) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

export const registerPatient = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw ApiError.BadRequest(errors.array()[0].msg, "VALIDATION_ERROR");
    }

    const {
      firstName,
      lastName,
      email,
      mobile,
      dob,
      gender,
      address,
      profileImage,
    } = req.body;

    // Check if patient already exists
    const existing = await Patient.findOne({ email });
    if (existing) {
      throw ApiError.BadRequest(
        "Patient already exists with this email",
        "EMAIL_EXISTS",
        { email }
      );
    }

    // Generate and hash password
    const rawPassword = `${firstName}@1234`; //generateRandomPassword();

    // Create patient
    const newPatient = new Patient({
      firstName,
      lastName,
      email,
      mobile,
      dob,
      gender,
      address,
      profileImage,
      password: rawPassword,
      joinDate: new Date(),
      role: "patient",
    });

    await newPatient.save();

    // Send welcome email
    // try {
    //   const emailBody = getWelcomeEmailHTML(firstName, rawPassword, email);
    //   await sendEmail(email, "Welcome to HealthCare App", emailBody);
    // } catch (emailErr) {
    //   // Continue despite email failure
    // }

    return successResponse(res, null, "Patient registered successfully", 201);
  } catch (err) {
    next(err);
  }
};

export const getAllPatients = async (req, res, next) => {
  try {
    const { email } = req.query;
    const filter = { isDeleted: false };
    if (email) filter.email = email;

    const patients = await Patient.find(filter).select("-password -__v");
    return successResponse(res, patients, "Patients fetched successfully");
  } catch (err) {
    next(err);
  }
};

export const getPatientProfile = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({
      _id: req.user.id,
      isDeleted: false,
    }).select("-password -__v");
    if (!patient) {
      throw ApiError.NotFound(
        "Patient not found or deleted",
        "PATIENT_NOT_FOUND"
      );
    }

    return successResponse(res, patient, "Your profile details");
  } catch (err) {
    next(err);
  }
};

export const updatePatient = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw ApiError.BadRequest(errors.array()[0].msg, "VALIDATION_ERROR");
    }

    const { id } = req.params;
    const updates = req.body;

    // Check if patient exists
    const patient = await Patient.findOne({ _id: id, isDeleted: false });
    if (!patient) {
      throw ApiError.NotFound(
        "Patient not found or already deleted",
        "PATIENT_NOT_FOUND"
      );
    }

    // Check for email conflict
    if (updates.email && updates.email !== patient.email) {
      const existing = await Patient.findOne({
        email: updates.email,
        isDeleted: false,
      });
      if (existing) {
        throw ApiError.BadRequest("Email already in use", "EMAIL_EXISTS", {
          email: updates.email,
        });
      }
    }

    // Update fields
    const allowedFields = [
      "firstName",
      "lastName",
      "email",
      "mobile",
      "dob",
      "gender",
      "address",
      "profileImage",
    ];
    Object.keys(updates).forEach((key) => {
      if (allowedFields.includes(key)) {
        patient[key] = updates[key];
      }
    });

    await patient.save();

    return successResponse(
      res,
      patient.toObject({
        versionKey: false,
        transform: (doc, ret) => {
          delete ret.password;
        },
      }),
      "Patient updated successfully"
    );
  } catch (err) {
    next(err);
  }
};

export const softDeletePatient = async (req, res, next) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findOne({ _id: id, isDeleted: false });
    if (!patient) {
      throw ApiError.NotFound(
        "Patient not found or already deleted",
        "PATIENT_NOT_FOUND"
      );
    }

    patient.isDeleted = true;
    await patient.save();

    return successResponse(res, null, "Patient record deleted (soft delete)");
  } catch (err) {
    next(err);
  }
};

export const changePatientPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw ApiError.BadRequest(errors.array()[0].msg, "VALIDATION_ERROR");
    }

    const { currentPassword, newPassword } = req.body;
    const patient = await Patient.findOne({
      _id: req.user.id,
      isDeleted: false,
    }).select("+password");
    if (!patient) {
      throw ApiError.NotFound(
        "Patient not found or deleted",
        "PATIENT_NOT_FOUND"
      );
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, patient.password);
    if (!isMatch) {
      throw ApiError.Unauthorized(
        "Current password is incorrect",
        "INVALID_PASSWORD"
      );
    }

    // Hash and update new password
    patient.password = await bcrypt.hash(newPassword, 10);
    await patient.save();

    return successResponse(res, null, "Password changed successfully");
  } catch (err) {
    next(err);
  }
};

// async function addDoctor() {
//     const newUSer = new User({
//         firstName: "John",
//         lastName: "Doe",
//         email: "doctor@example.com",
//         password: "Doctor@1234",
//         mobileNo: 9876543210,
//         gender: "male",
//         address: "123 Clinic Street, Cityville",
//         role: "doctor"
//     });

//     await newUSer.save();
// }

// addDoctor()
