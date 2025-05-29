import express from "express";
import { body } from "express-validator";
import {
  registerPatient,
  getAllPatients,
  getPatientProfile,
  updatePatient,
  softDeletePatient,
  changePatientPassword,
} from "../controllers/patient.controller.js";
import authenticate from "../middlewares/auth.js";
import authorize from "../middlewares/authorize.js";

const router = express.Router();

/**
 * @route POST /api/patients/register
 * @desc Register a new patient (by doctor)
 * @access Private (Doctor only)
 */
router.post(
  "/register",
  authenticate,
  authorize(["doctor"]),
  [
    body("firstName").notEmpty().withMessage("First name is required"),
    body("lastName").notEmpty().withMessage("Last name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("mobile").notEmpty().withMessage("Mobile number is required"),
    body("dob")
      .optional()
      .isISO8601()
      .withMessage("Date of birth must be a valid date"),
    body("gender")
      .optional()
      .isIn(["Male", "Female", "Other"])
      .withMessage("Invalid gender"),
    body("address")
      .optional()
      .notEmpty()
      .withMessage("Address is required if provided"),
    body("profileImage")
      .optional()
      .isURL()
      .withMessage("Profile image must be a valid URL if provided"),
  ],
  registerPatient
);

/**
 * @route GET /api/patients
 * @desc Get all patients (for doctors)
 * @access Private (Doctor only)
 */
router.get("/", authenticate, authorize(["doctor"]), getAllPatients);

/**
 * @route GET /api/patients/me
 * @desc Get logged-in patient's profile
 * @access Private (Patient only)
 */
router.get("/me", authenticate, authorize(["patient"]), getPatientProfile);

/**
 * @route PUT /api/patients/:id
 * @desc Update patient details (by doctor)
 * @access Private (Doctor only)
 */
router.put(
  "/:id",
  authenticate,
  authorize(["doctor"]),
  [
    body("firstName")
      .optional()
      .notEmpty()
      .withMessage("First name is required if provided"),
    body("lastName")
      .optional()
      .notEmpty()
      .withMessage("Last name is required if provided"),
    body("email")
      .optional()
      .isEmail()
      .withMessage("Valid email is required if provided"),
    body("mobile")
      .optional()
      .notEmpty()
      .withMessage("Mobile number is required if provided"),
    body("dob")
      .optional()
      .isISO8601()
      .withMessage("Date of birth must be a valid date"),
    body("gender")
      .optional()
      .isIn(["Male", "Female", "Other"])
      .withMessage("Invalid gender"),
    body("address")
      .optional()
      .notEmpty()
      .withMessage("Address is required if provided"),
    body("profileImage")
      .optional()
      .isURL()
      .withMessage("Profile image must be a valid URL if provided"),
  ],
  updatePatient
);

/**
 * @route PATCH /api/patients/:id/deactivate
 * @desc Soft delete a patient (by doctor)
 * @access Private (Doctor only)
 */
router.patch(
  "/:id/deactivate",
  authenticate,
  authorize(["doctor"]),
  softDeletePatient
);

/**
 * @route PATCH /api/patients/me/password
 * @desc Change logged-in patient's password
 * @access Private (Patient only)
 */
router.patch(
  "/me/password",
  authenticate,
  authorize(["patient"]),
  [
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),
    body("newPassword")
      .notEmpty()
      .withMessage("New password is required")
      .isLength({ min: 8 })
      .withMessage("New password must be at least 8 characters")
      .matches(/[A-Z]/)
      .withMessage("New password must contain at least one uppercase letter")
      .matches(/[0-9]/)
      .withMessage("New password must contain at least one number")
      .matches(/[!@#$%^&*]/)
      .withMessage("New password must contain at least one special character"),
  ],
  changePatientPassword
);

export default router;
