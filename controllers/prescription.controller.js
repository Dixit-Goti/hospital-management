import Patient from "../models/Patient.js";
import Prescription from "../models/Prescription.js";
import Medicine from "../models/Medicine.js";
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

                prescriptions = await Prescription.aggregate([
                    {
                        $lookup: {
                            from: 'Visit', // Correct collection name for visits
                            localField: 'visitId',
                            foreignField: '_id',
                            as: 'visit'
                        }
                    },
                    {
                        $unwind: {
                            path: '$visit',
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $match: {
                            'visit.patientId': patient._id
                        }
                    },
                    {
                        $lookup: {
                            from: 'Medicine', // Correct collection name for medicines
                            localField: 'listOfMedicine.medicineId',
                            foreignField: '_id',
                            as: 'medicineDetails'
                        }
                    },
                    {
                        $project: {
                            visitId: '$visit',
                            listOfMedicine: {
                                $map: {
                                    input: '$listOfMedicine',
                                    as: 'med',
                                    in: {
                                        medicineId: '$$med.medicineId',
                                        name: {
                                            $let: {
                                                vars: {
                                                    matchedMedicine: {
                                                        $arrayElemAt: [
                                                            '$medicineDetails',
                                                            {
                                                                $indexOfArray: ['$medicineDetails._id', '$$med.medicineId']
                                                            }
                                                        ]
                                                    }
                                                },
                                                in: { $ifNull: ['$$matchedMedicine.name', 'Unknown Medicine'] }
                                            }
                                        },
                                        dosage: '$$med.dosage',
                                        frequency: '$$med.frequency',
                                        duration: '$$med.duration',
                                        instructions: '$$med.instructions',
                                    }
                                }
                            },
                            instructions: 1,
                            createdAt: 1,
                            updatedAt: 1
                        }
                    }
                ]).exec();
            } else {
                prescriptions = await Prescription.find()
                    .populate('visitId')
                    .lean()
                    .then(async (docs) => {
                        return await Promise.all(docs.map(async (prescription) => {
                            const medicines = await Medicine.find({
                                '_id': { $in: prescription.listOfMedicine.map(m => m.medicineId) }
                            }).lean();
                            prescription.listOfMedicine = prescription.listOfMedicine.map(med => ({
                                ...med,
                                name: medicines.find(m => m._id.toString() === med.medicineId.toString())?.name || 'Unknown Medicine'
                            }));
                            return prescription;
                        }));
                    });
            }
        } else if (user.role === 'patient') {
            prescriptions = await Prescription.aggregate([
                {
                    $lookup: {
                        from: 'Visit', // Correct collection name for visits
                        localField: 'visitId',
                        foreignField: '_id',
                        as: 'visit'
                    }
                },
                {
                    $unwind: {
                        path: '$visit',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $match: {
                        'visit.patientId': user._id
                    }
                },
                {
                    $lookup: {
                        from: 'Medicine', // Correct collection name for medicines
                        localField: 'listOfMedicine.medicineId',
                        foreignField: '_id',
                        as: 'medicineDetails'
                    }
                },
                {
                    $project: {
                        visitId: '$visit',
                        listOfMedicine: {
                            $map: {
                                input: '$listOfMedicine',
                                as: 'med',
                                in: {
                                    medicineId: '$$med.medicineId',
                                    name: {
                                        $let: {
                                            vars: {
                                                matchedMedicine: {
                                                    $arrayElemAt: [
                                                        '$medicineDetails',
                                                        {
                                                            $indexOfArray: ['$medicineDetails._id', '$$med.medicineId']
                                                        }
                                                    ]
                                                }
                                            },
                                            in: { $ifNull: ['$$matchedMedicine.name', 'Unknown Medicine'] }
                                        }
                                    },
                                    dosage: '$$med.dosage',
                                    frequency: '$$med.frequency',
                                    duration: '$$med.duration',
                                    instructions: '$$med.instructions',

                                }
                            }
                        },
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
