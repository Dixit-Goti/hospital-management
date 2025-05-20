import Patient from "../models/Patient.js";
import Prescription from "../models/Prescription.js";
import { ApiError } from "../utils/error.js";
import { successResponse } from "../utils/response.js";


export const addPrescription = async (req, res, next) => {
    try {
        const { visitId, listOfMedicine, instructions } = req.body;

        if (!visitId || !Array.isArray(listOfMedicine) || listOfMedicine.length === 0) {
            throw new ApiError('Visit ID and list of medicine are required', 400);
        }

        const newPrescription = new Prescription({
            visitId,
            listOfMedicine,
            instructions,
        });

        await newPrescription.save();

        return successResponse(res, newPrescription, 'Prescription added successfully', 201);
    } catch (err) {
        next(err);
    }
};


export const getPrescriptions = async (req, res, next) => {
    try {
        const user = req.user;

        let prescriptions;

        // Doctor: all or filter by patient email
        if (user.role === 'docotr') {
            const { email } = req.query;

            if (email) {
                const patient = await Patient.findOne({ email });
                if (!patient) {
                    throw new ApiError('Patient not found with this email', 404);
                }

                prescriptions = await Prescription.find()
                    .populate({
                        path: 'visitId',
                        match: { patientId: patient._id }
                    })
                    .populate('visitId')
                    .lean();

                // Filter out prescriptions where visitId was not matched
                prescriptions = prescriptions.filter(p => p.visitId);
            } else {
                prescriptions = await Prescription.find()
                    .populate('visitId')
                    .lean();
            }
        }
        // Patient: only own prescriptions
        else if (user.role === 'patient') {
            const prescriptionsAll = await Prescription.find()
                .populate({
                    path: 'visitId',
                    match: { patientId: user._id }
                })
                .populate('visitId')
                .lean();

            prescriptions = prescriptionsAll.filter(p => p.visitId);
        }

        else {
            throw new ApiError('Unauthorized access', 403);
        }

        return successResponse(res, prescriptions, 'Prescriptions fetched successfully');
    } catch (err) {
        next(err);
    }
};


// Update prescription
export const updatePrescription = async (req, res, next) => {
    try {
        const user = req.user;
        if (user.role !== 'doctor') {
            throw new ApiError('Only doctors can update prescriptions', 403);
        }

        const { id } = req.params;
        const updatedData = req.body;

        const prescription = await Prescription.findByIdAndUpdate(id, updatedData, {
            new: true,
            runValidators: true
        });

        if (!prescription) {
            throw new ApiError('Prescription not found', 404);
        }

        return successResponse(res, prescription, 'Prescription updated successfully');
    } catch (err) {
        next(err);
    }
};

// Delete prescription
export const deletePrescription = async (req, res, next) => {
    try {
        const user = req.user;
        if (user.role !== 'doctor') {
            throw new ApiError('Only doctors can delete prescriptions', 403);
        }

        const { id } = req.params;
        const deleted = await Prescription.findByIdAndDelete(id);

        if (!deleted) {
            throw new ApiError('Prescription not found', 404);
        }

        return successResponse(res, null, 'Prescription deleted successfully');
    } catch (err) {
        next(err);
    }
};
