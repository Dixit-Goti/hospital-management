import express from 'express';
import { body } from 'express-validator';
import { registerPatient, updatePatient, softDeletePatient, getPatients } from '../controllers/patient.controller.js';
import authenticate from '../middlewares/auth.js';
import authorize from '../middlewares/authorize.js';

const router = express.Router();


router.post(
    '/register',
    authenticate,
    authorize('doctor'),
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

router.get('/', authenticate, getPatients);

router.put('/:id', authenticate, updatePatient);

router.delete('/:id', authenticate, authorize('doctor'), softDeletePatient);

export default router;
