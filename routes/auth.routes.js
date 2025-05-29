import express from "express";
import { body } from "express-validator";
import { loginDoctor, loginPatient } from "../controllers/auth.controller.js";

const router = express.Router();

/**
 * @route POST /api/auth/doctor
 * @desc Login a doctor
 * @access Public
 */
router.post(
  "/doctor",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  loginDoctor
);

/**
 * @route POST /api/auth/patient
 * @desc Login a patient
 * @access Public
 */
router.post(
  "/patient",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  loginPatient
);

export default router;
