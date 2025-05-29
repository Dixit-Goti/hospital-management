import Prescription from "../models/Prescription.js";
import Patient from "../models/Patient.js";
import Medicine from "../models/Medicine.js";
import { validationResult } from "express-validator";
import { successResponse } from "../utils/response.js";
import { ApiError } from "../utils/error.js";

export const addPrescription = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw ApiError.BadRequest(errors.array()[0].msg, "VALIDATION_ERROR");
    }

    const { patientEmail, listOfMedicine, instructions } = req.body;

    // Create prescription
    const prescription = new Prescription({
      patientEmail,
      listOfMedicine,
      instructions,
      isDeleted: false,
    });

    await prescription.save();

    return successResponse(
      res,
      prescription.toObject({ versionKey: false }),
      "Prescription created successfully",
      201
    );
  } catch (err) {
    next(err);
  }
};

export const getPrescriptions = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw ApiError.BadRequest(errors.array()[0].msg, "VALIDATION_ERROR");
    }

    const { patientEmail } = req.query;
    const user = req.user;

    const query = { isDeleted: false };

    // Doctors can query any patient; patients can only see their own
    if (user.role === "patient") {
      const patient = await Patient.findOne({ _id: user.id, isDeleted: false });
      if (!patient) {
        throw ApiError.NotFound("Patient not found", "PATIENT_NOT_FOUND");
      }
      query.patientEmail = patient.email;
    } else if (patientEmail) {
      query.patientEmail = patientEmail.toLowerCase();
    }

    const prescriptions = await Prescription.find(query)
      .select("-__v")
      .populate("listOfMedicine.medicineId", "name strength form");

    return successResponse(
      res,
      prescriptions,
      "Prescriptions fetched successfully"
    );
  } catch (err) {
    next(err);
  }
};

export const updatePrescription = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw ApiError.BadRequest(errors.array()[0].msg, "VALIDATION_ERROR");
    }

    const { id } = req.params;
    const updates = req.body;

    const prescription = await Prescription.findOne({
      _id: id,
      isDeleted: false,
    });
    if (!prescription) {
      throw ApiError.NotFound(
        "Prescription not found or already deleted",
        "PRESCRIPTION_NOT_FOUND"
      );
    }

    // Update fields
    if (updates.patientEmail) {
      prescription.patientEmail = updates.patientEmail.toLowerCase();
    }
    if (updates.listOfMedicine) {
      prescription.listOfMedicine = updates.listOfMedicine;
    }
    if (updates.instructions !== undefined) {
      prescription.instructions = updates.instructions;
    }

    await prescription.save();

    return successResponse(
      res,
      prescription.toObject({ versionKey: false }),
      "Prescription updated successfully"
    );
  } catch (err) {
    next(err);
  }
};

export const softDeletePrescription = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw ApiError.BadRequest(errors.array()[0].msg, "VALIDATION_ERROR");
    }

    const { id } = req.params;

    const prescription = await Prescription.findOne({
      _id: id,
      isDeleted: false,
    });
    if (!prescription) {
      throw ApiError.NotFound(
        "Prescription not found or already deleted",
        "PRESCRIPTION_NOT_FOUND"
      );
    }

    prescription.isDeleted = true;
    await prescription.save();

    return successResponse(res, null, "Prescription deleted successfully");
  } catch (err) {
    next(err);
  }
};
