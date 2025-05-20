import express from 'express';
import { body } from 'express-validator';
import authenticate from '../middlewares/auth.js';
import authorize from '../middlewares/authorize.js';
import { addVisit, getAllVisits, getVisitsByPatient, updateVisit, softDeleteVisit } from '../controllers/visit.controller.js';

const router = express.Router();

// Add a new patient visit
router.post(
    '/',
    authenticate,
    authorize(['doctor']),
    [
        body('patientId').notEmpty().withMessage('Patient ID is required'),
        body('date').notEmpty().withMessage('Date of visit is required'),
        body('diagnosis').notEmpty().withMessage('Diagnosis is required'),
    ],
    addVisit
);


router.get('/', authenticate, getAllVisits);

router.get('/patient/:patientId', authenticate, getVisitsByPatient);

router.put('/:id', authenticate, updateVisit);

router.delete('/:id', authenticate, softDeleteVisit);


export default router;
