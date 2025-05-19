import Medicine from '../models/Medicine.js';
import { successResponse } from '../utils/response.js';
import { ApiError } from '../utils/error.js';


export const addMedicine = async (req, res, next) => {
    try {
        const { name, strength, form, manufacturer } = req.body;

        // Check if medicine already exists
        const existing = await Medicine.findOne({ name, strength, form });
        if (existing) {
            throw new ApiError('Medicine already exists', 409);
        }

        const medicine = new Medicine({
            name,
            strength,
            form,
            manufacturer
        });

        await medicine.save();

        return successResponse(res, medicine, 'Medicine added successfully', 201);

    } catch (error) {
        next(err);
    }
};


export const getAllMedicines = async (req, res, next) => {
    try {
        const medicine = await Medicine.find().sort({ createdAt: -1 });

        return successResponse(res, medicine, "'Medicines fetched successfully'");
    } catch (err) {
        next(err);
    }
}


export const updateMedicine = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ApiError(errors.array()[0].msg, 400);
        }

        const medicineId = req.params.id;
        const updateData = req.body;

        const updated = await Medicine.findByIdAndUpdate(medicineId, updateData, {
            new: true,
            runValidators: true,
        });

        if (!updated) {
            throw new ApiError('Medicine not found', 404);
        }

        return successResponse(res, updated, 'Medicine updated successfully');

    } catch (err) {
        next(err);
    }
};


export const deleteMedicine = async (req, res, next) => {
    try {
        const medicineId = req.params.id;

        const deleted = await Medicine.findByIdAndDelete(medicineId);

        if (!deleted) {
            throw new ApiError('Medicine not found', 404);
        }

        return successResponse(res, null, "Medicine deleted successfully");
    } catch {
        next(err);
    }
};
