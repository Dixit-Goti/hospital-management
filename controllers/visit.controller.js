import { validationResult } from 'express-validator';
import Visit from '../models/Visit.js';
import Patient from '../models/Patient.js';
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

        const doctorId = req.user.id;

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


export const getVisits = async (req, res, next) => {
    try {
        const user = req.user;
        const { email } = req.query;

        // Doctor can view all visits or visits for a specific patient by email
        if (user.role === 'doctor') {
            let filter = { isDeleted: false };

            if (email) {
                // Find patient by email first
                const patient = await Patient.findOne({ email, isDeleted: false });
                if (!patient) {
                    return successResponse(res, [], 'No visits found for this email');
                }
                filter.patientId = patient._id;
            }

            const visits = await Visit.find(filter)
                .populate('patientId', 'firstName lastName email')
                .populate('doctorId', 'firstName lastName email');

            return successResponse(res, visits, 'Visit(s) fetched successfully');
        }

        // Patient can view only their own visits
        if (user.role === 'patient') {
            const visits = await Visit.find({ patientId: user.id, isDeleted: false })
                .populate('patientId', 'firstName lastName email')
                .populate('doctorId', 'firstName lastName email');

            return successResponse(res, visits, 'Your visits fetched successfully');
        }

        // Unauthorized role
        throw new ApiError('Unauthorized access', 403);
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
