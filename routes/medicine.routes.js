import express from "express";
import { body, param, query } from "express-validator";
import {
  addMedicine,
  updateMedicine,
  softDeleteMedicine,
  getAllMedicines,
} from "../controllers/medicine.controller.js";
import authenticate from "../middlewares/auth.js";
import authorize from "../middlewares/authorize.js";

const router = express.Router();

/**
 * @route POST /api/medicines
 * @desc Add a new medicine (by doctor)
 * @access Private (Doctor only)
 */
router.post(
  "/",
  authenticate,
  authorize(["doctor"]),
  [
    body("name")
      .notEmpty()
      .withMessage("Medicine name is required")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Medicine name must be at least 2 characters"),
    body("strength")
      .notEmpty()
      .withMessage("Strength is required")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Strength must be at least 1 character"),
    body("form")
      .notEmpty()
      .withMessage("Form is required")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Form must be at least 1 character"),
    body("manufacturer")
      .optional()
      .trim()
      .isLength({ min: 1 })
      .withMessage("Manufacturer must be at least 1 character if provided"),
  ],
  addMedicine
);

/**
 * @route GET /api/medicines
 * @desc Get all medicines (for doctors)
 * @access Private (Doctor only)
 */
router.get(
  "/",
  authenticate,
  authorize(["doctor"]),
  [
    query("name")
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage("Name query must be at least 2 characters"),
  ],
  getAllMedicines
);

/**
 * @route PUT /api/medicines/:id
 * @desc Update medicine details (by doctor)
 * @access Private (Doctor only)
 */
router.put(
  "/:id",
  authenticate,
  authorize(["doctor"]),
  [
    param("id").isMongoId().withMessage("Invalid medicine ID"),
    body("name")
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage("Name must be at least 2 characters if provided"),
    body("strength")
      .optional()
      .trim()
      .isLength({ min: 1 })
      .withMessage("Strength must be at least 1 character if provided"),
    body("form")
      .optional()
      .trim()
      .isLength({ min: 1 })
      .withMessage("Form must be at least 1 character if provided"),
    body("manufacturer")
      .optional()
      .trim()
      .isLength({ min: 1 })
      .withMessage("Manufacturer must be at least 1 character if provided"),
  ],
  updateMedicine
);

/**
 * @route PATCH /api/medicines/:id/deactivate
 * @desc Soft delete a medicine (by doctor)
 * @access Private (Doctor only)
 */
router.patch(
  "/:id/deactivate",
  authenticate,
  authorize(["doctor"]),
  [param("id").isMongoId().withMessage("Invalid medicine ID")],
  softDeleteMedicine
);

export default router;
