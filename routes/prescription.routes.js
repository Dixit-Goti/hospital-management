import express from "express";
import { body, param, query } from "express-validator";
import {
  addPrescription,
  getPrescriptions,
  updatePrescription,
  softDeletePrescription,
} from "../controllers/prescription.controller.js";
import authenticate from "../middlewares/auth.js";
import authorize from "../middlewares/authorize.js";

const router = express.Router();

/**
 * @route POST /api/prescriptions
 * @desc Create a new prescription (by doctor)
 * @access Private (Doctor only)
 */
router.post(
  "/",
  authenticate,
  authorize(["doctor"]),
  [
    body("patientEmail")
      .isEmail()
      .withMessage("Valid patient email is required")
      .normalizeEmail({ gmail_remove_dots: false }),
    body("listOfMedicine")
      .isArray({ min: 1 })
      .withMessage("List of medicines must be a non-empty array"),
    body("listOfMedicine.*.medicineId")
      .isMongoId()
      .withMessage("Valid medicine ID is required"),
    body("listOfMedicine.*.dosage")
      .notEmpty()
      .withMessage("Dosage is required")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Dosage must be at least 1 character"),
    body("listOfMedicine.*.frequency")
      .notEmpty()
      .withMessage("Frequency is required")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Frequency must be at least 1 character"),
    body("listOfMedicine.*.duration")
      .notEmpty()
      .withMessage("Duration is required")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Duration must be at least 1 character"),
    body("listOfMedicine.*.instructions").optional().trim(),
    body("instructions").optional().trim(),
  ],
  addPrescription
);

/**
 * @route GET /api/prescriptions
 * @desc Get prescriptions (for doctors or patients)
 * @access Private (Doctor or Patient)
 */
router.get(
  "/",
  authenticate,
  authorize(["doctor", "patient"]),
  [
    query("patientEmail")
      .optional()
      .isEmail()
      .withMessage("Valid patient email is required")
      .normalizeEmail({ gmail_remove_dots: false }),
  ],
  getPrescriptions
);

/**
 * @route PUT /api/prescriptions/:id
 * @desc Update prescription details (by doctor)
 * @access Private (Doctor only)
 */
router.put(
  "/:id",
  authenticate,
  authorize(["doctor"]),
  [
    param("id").isMongoId().withMessage("Invalid prescription ID"),
    body("patientEmail")
      .optional()
      .isEmail()
      .withMessage("Valid patient email is required")
      .normalizeEmail({ gmail_remove_dots: false }),
    body("listOfMedicine")
      .optional()
      .isArray({ min: 1 })
      .withMessage("List of medicines must be a non-empty array if provided"),
    body("listOfMedicine.*.medicineId")
      .optional()
      .isMongoId()
      .withMessage("Valid medicine ID is required"),
    body("listOfMedicine.*.dosage")
      .optional()
      .trim()
      .isLength({ min: 1 })
      .withMessage("Dosage must be at least 1 character if provided"),
    body("listOfMedicine.*.frequency")
      .optional()
      .trim()
      .isLength({ min: 1 })
      .withMessage("Frequency must be at least 1 character if provided"),
    body("listOfMedicine.*.duration")
      .optional()
      .trim()
      .isLength({ min: 1 })
      .withMessage("Duration must be at least 1 character if provided"),
    body("listOfMedicine.*.instructions").optional().trim(),
    body("instructions").optional().trim(),
  ],
  updatePrescription
);

/**
 * @route PATCH /api/prescriptions/:id/deactivate
 * @desc Soft delete a prescription (by doctor)
 * @access Private (Doctor only)
 */
router.patch(
  "/:id/deactivate",
  authenticate,
  authorize(["doctor"]),
  [param("id").isMongoId().withMessage("Invalid prescription ID")],
  softDeletePrescription
);

export default router;
