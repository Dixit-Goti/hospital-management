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

        if (user.role === 'doctor') {
            const { email } = req.query;

            if (email) {
                const patient = await Patient.findOne({ email }).lean();
                if (!patient) {
                    throw new ApiError('Patient not found with this email', 404);
                }

                // Use aggregation to filter prescriptions by patientId in Visit
                prescriptions = await Prescription.aggregate([
                    {
                        $lookup: {
                            from: 'visits', // The name of the Visit collection in MongoDB
                            localField: 'visitId',
                            foreignField: '_id',
                            as: 'visit'
                        }
                    },
                    {
                        $unwind: '$visit'
                    },
                    {
                        $match: {
                            'visit.patientId': patient._id
                        }
                    },
                    {
                        $lookup: {
                            from: 'visits',
                            localField: 'visitId',
                            foreignField: '_id',
                            as: 'visitId'
                        }
                    },
                    {
                        $unwind: '$visitId'
                    },
                    {
                        $project: {
                            visitId: 1,
                            listOfMedicine: 1,
                            instructions: 1,
                            createdAt: 1,
                            updatedAt: 1
                        }
                    }
                ]).exec();
            } else {
                // Fetch all prescriptions with populated visitId
                prescriptions = await Prescription.find()
                    .populate('visitId')
                    .lean();
            }
        } else if (user.role === 'patient') {
            prescriptions = await Prescription.aggregate([
                {
                    $lookup: {
                        from: 'visits',
                        localField: 'visitId',
                        foreignField: '_id',
                        as: 'visit'
                    }
                },
                {
                    $unwind: '$visit'
                },
                {
                    $match: {
                        'visit.patientId': user._id
                    }
                },
                {
                    $lookup: {
                        from: 'visits',
                        localField: 'visitId',
                        foreignField: '_id',
                        as: 'visitId'
                    }
                },
                {
                    $unwind: '$visitId'
                },
                {
                    $project: {
                        visitId: 1,
                        listOfMedicine: 1,
                        instructions: 1,
                        createdAt: 1,
                        updatedAt: 1
                    }
                }
            ]).exec();
        } else {
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
