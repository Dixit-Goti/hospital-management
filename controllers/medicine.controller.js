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

    } catch (err) {
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
        const { id } = req.params;
        const updates = req.body;

        const medicine = await Medicine.findOne({ _id: id });
        if (!medicine) {
            console.log("Here")
            throw new ApiError('Medicine not found or already deleted', 404);
        }

        Object.keys(updates).forEach(key => {
            if (key in medicine) {
                medicine[key] = updates[key];
            }
        });

        await medicine.save();

        return successResponse(res, medicine, 'Medicine updated successfully');

    } catch (err) {
        next(err);
    }
};


export const deleteMedicine = async (req, res, next) => {
    try {
        const medicineId = req.params.id;

        const deleted = await Medicine.findByIdAndDelete(medicineId);

        if (!deleted) {
            throw new ApiError('Medicine not found or already deleted', 404);
        }

        return successResponse(res, null, "Medicine deleted successfully");
    } catch (err) {
        next(err);
    }
};
