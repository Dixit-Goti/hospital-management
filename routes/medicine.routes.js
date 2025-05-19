import express from 'express';
import { body } from "express-validator";
import { addMedicine, updateMedicine, deleteMedicine, getAllMedicines } from '../controllers/medicine.controller.js';
import authenticate from '../middlewares/auth.js';
import authorize from "../middlewares/authorize.js";

const router = express.Router();


router.post(
    '/add',
    authenticate,
    authorize('doctor'),
    [
        body('name').notEmpty().withMessage('Medicine name is required'),
        body('strength').notEmpty().withMessage('Strength is required'),
        body('form').notEmpty().withMessage('Form is required'),
    ],
    addMedicine
);


// Get all the medicined
router.get('/', authenticate, authorize('doctor'), getAllMedicines);


// Update Medicine
router.put(
    '/:id',
    authenticate,
    authorize('doctor'),
    [
        body('name').optional().notEmpty().withMessage('Name cannot be empty'),
        body('strength').optional().notEmpty().withMessage('Strength cannot be empty'),
        body('form').optional().notEmpty().withMessage('Form cannot be empty'),
    ],
    updateMedicine
);


// Delete Medicine
router.delete('/:id', authenticate, authorize('doctor'), deleteMedicine);


export default router;
