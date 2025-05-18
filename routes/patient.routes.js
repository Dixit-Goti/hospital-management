import express from 'express';
import { body } from 'express-validator';
import { registerPatient } from '../controllers/patient.controller.js';
import authenticate from '../middlewares/auth.js';

const router = express.Router();

/**
 * @route POST /api/patient/register
 * @desc  Register a new patient
 */

router.post(
    '/register',
    authenticate,
    [
        body('firstName').notEmpty().withMessage('First name is required'),
        body('lastName').notEmpty().withMessage('Last name is required'),
        body('email').isEmail().withMessage('Valid email is required'),
        body('mobile').notEmpty().withMessage('Mobile number is required'),
        body('dob').optional().isISO8601().withMessage('Date of birth must be valid date'),
        body('gender').optional().isIn(['Male', 'Female', 'Other']).withMessage('Invalid gender'),
        body('address').optional().notEmpty().withMessage('Address is required if provided'),
    ],
    registerPatient
);

export default router;