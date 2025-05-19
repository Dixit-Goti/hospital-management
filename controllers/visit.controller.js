import { validationResult } from 'express-validator';
import Visit from '../models/Visit.js';
import { ApiError } from '../utils/error.js';
import { successResponse } from '../utils/response.js';


export const addVisit = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ApiError(errors.array()[0].msg, 400);
        }

        const {
            patientId,
            date,
            diagnosis,
            symptoms,
            vitals,
            notes,
            recommendedFollowUpDate,
            followUpNotes,
        } = req.body;

        const doctorId = req.user._id;

        const visit = new Visit({
            patientId,
            doctorId,
            date,
            diagnosis,
            symptoms,
            vitals,
            notes,
            recommendedFollowUpDate,
            followUpNotes,
        });

        await visit.save();

        return successResponse(res, visit, 'Visit added successfully', 201);
    } catch (err) {
        next(err);
    }
};


export const getAllVisits = async (req, res, next) => {
    try {
        // Only doctors can view all visits
        if (req.user.role !== 'doctor') {
            throw new ApiError('Unauthorized access', 403);
        }

        const visits = await Visit.find({ isDeleted: false })
            .populate('patientId', 'firstName lastName email')
            .populate('doctorId', 'firstName lastName email');


        return successResponse(res, visits, 'All visits fetched successfully');
    } catch (err) {
        next(err);
    }
};


export const getVisitsByPatient = async (req, res, next) => {
    try {
        const { patientId } = req.params;

        // Only the doctor or the patient themselves can view the data
        if (
            req.user.role !== 'doctor' &&
            req.user.role !== 'patient'
        ) {
            throw new ApiError('Unauthorized access', 403);
        }

        if (req.user.role === 'patient' && req.user._id.toString() !== patientId) {
            throw new ApiError('You are not allowed to access other patient records', 403);
        }

        const visits = await Visit.find({ patientId, isDeleted: false })
            .populate('patientId', 'firstName lastName email')
            .populate('doctorId', 'firstName lastName email');

        return successResponse(res, visits, 'Patient visits fetched successfully');
    } catch (err) {
        next(err);
    }
};


export const updateVisit = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (req.user.role !== 'doctor') {
            throw new ApiError('Only doctors can update visits', 403);
        }

        const updatedVisit = await Visit.findByIdAndUpdate(
            id,
            { ...req.body, updatedAt: new Date() },
            { new: true }
        );

        if (!updatedVisit) {
            throw new ApiError('Visit not found', 404);
        }

        return successResponse(res, updatedVisit, 'Visit updated successfully');
    } catch (err) {
        next(err);
    }
};


export const softDeleteVisit = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (req.user.role !== 'doctor') {
            throw new ApiError('Only doctors can delete visits', 403);
        }

        const visit = await Visit.findByIdAndUpdate(
            id,
            { isDeleted: true, updatedAt: new Date() },
            { new: true }
        );

        if (!visit) {
            throw new ApiError('Visit not found', 404);
        }

        return successResponse(res, null, 'Visit deleted successfully');
    } catch (err) {
        next(err);
    }
};
