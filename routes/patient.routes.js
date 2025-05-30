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
import multer from "multer";
import path from "path";

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/patients/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error("Only JPEG/PNG images are allowed"));
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

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
  upload.single("profileImage"), // Handle single file upload for profileImage
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
  upload.single("profileImage"), // Handle single file upload for profileImage
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
