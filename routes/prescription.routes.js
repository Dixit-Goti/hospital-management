import express from 'express';
import { body } from 'express-validator';
import { addPrescription, getPrescriptions, updatePrescription, deletePrescription } from '../controllers/prescription.controller.js';
import authenticate from '../middlewares/auth.js';
import authorize from '../middlewares/authorize.js';

const router = express.Router();

// POST /api/prescriptions
router.post(
    '/',
    authenticate,
    authorize(['doctor']),
    [
        body('visitId').notEmpty().withMessage('Visit ID is required'),
        body('listOfMedicine').isArray({ min: 1 }).withMessage('List of medicine must be a non-empty array'),
        body('listOfMedicine.*.medicineId').notEmpty().withMessage('Medicine ID is required'),
        body('listOfMedicine.*.dosage').notEmpty().withMessage('Dosage is required'),
        body('listOfMedicine.*.frequency').notEmpty().withMessage('Frequency is required'),
        body('listOfMedicine.*.duration').notEmpty().withMessage('Duration is required'),
    ],
    addPrescription
);


// GET all prescriptions
router.get('/', authenticate, getPrescriptions);


// PUT - Update prescription by ID
router.put('/:id', authenticate, updatePrescription);


// DELETE - Delete prescription by ID
router.delete('/:id', authenticate, deletePrescription);

export default router;
