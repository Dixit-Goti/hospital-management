import Medicine from "../models/Medicine.js";
import { validationResult } from "express-validator";
import { successResponse } from "../utils/response.js";
import { ApiError } from "../utils/error.js";

export const addMedicine = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw ApiError.BadRequest(errors.array()[0].msg, "VALIDATION_ERROR");
    }

    const { name, strength, form, manufacturer } = req.body;

    // Check if medicine already exists (case-insensitive for name)
    const existing = await Medicine.findOne({
      name: name.toLowerCase(),
      strength,
      form,
    });
    if (existing) {
      throw ApiError.BadRequest("Medicine already exists", "MEDICINE_EXISTS", {
        name,
        strength,
        form,
      });
    }

    const medicine = new Medicine({
      name,
      strength,
      form,
      manufacturer,
      isDeleted: false,
    });

    await medicine.save();

    return successResponse(
      res,
      medicine.toObject({ versionKey: false }),
      "Medicine added successfully",
      201
    );
  } catch (err) {
    next(err);
  }
};

export const getAllMedicines = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw ApiError.BadRequest(errors.array()[0].msg, "VALIDATION_ERROR");
    }

    const { name } = req.query;
    const query = { isDeleted: false };

    if (name) {
      query.name = new RegExp(name.toLowerCase(), "i");
    }

    const medicines = await Medicine.find(query)
      .select("-__v")
      .sort({ createdAt: -1 });

    return successResponse(res, medicines, "Medicines fetched successfully");
  } catch (err) {
    next(err);
  }
};

export const updateMedicine = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw ApiError.BadRequest(errors.array()[0].msg, "VALIDATION_ERROR");
    }

    const { id } = req.params;
    const updates = req.body;

    const medicine = await Medicine.findOne({ _id: id, isDeleted: false });
    if (!medicine) {
      throw ApiError.NotFound(
        "Medicine not found or already deleted",
        "MEDICINE_NOT_FOUND"
      );
    }

    // Check for unique constraint if name, strength, or form is updated
    if (updates.name || updates.strength || updates.form) {
      const query = {
        name: updates.name ? updates.name.toLowerCase() : medicine.name,
        strength: updates.strength || medicine.strength,
        form: updates.form || medicine.form,
        _id: { $ne: id }, // Exclude current medicine
        isDeleted: false,
      };
      const existing = await Medicine.findOne(query);
      if (existing) {
        throw ApiError.BadRequest(
          "Medicine with this name, strength, and form already exists",
          "MEDICINE_EXISTS"
        );
      }
    }

    // Update allowed fields
    const allowedFields = ["name", "strength", "form", "manufacturer"];
    Object.keys(updates).forEach((key) => {
      if (allowedFields.includes(key)) {
        medicine[key] = updates[key];
      }
    });

    await medicine.save();

    return successResponse(
      res,
      medicine.toObject({ versionKey: false }),
      "Medicine updated successfully"
    );
  } catch (err) {
    next(err);
  }
};

export const softDeleteMedicine = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw ApiError.BadRequest(errors.array()[0].msg, "VALIDATION_ERROR");
    }

    const { id } = req.params;

    const medicine = await Medicine.findOne({ _id: id, isDeleted: false });
    if (!medicine) {
      throw ApiError.NotFound(
        "Medicine not found or already deleted",
        "MEDICINE_NOT_FOUND"
      );
    }

    medicine.isDeleted = true;
    await medicine.save();

    return successResponse(res, null, "Medicine deleted successfully");
  } catch (err) {
    next(err);
  }
};
