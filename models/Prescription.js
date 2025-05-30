import mongoose from "mongoose";
import validator from "validator";
import Patient from "./Patient.js";
import Medicine from "./Medicine.js";
import { ApiError } from "../utils/error.js";

const medicineItemSchema = new mongoose.Schema(
  {
    medicineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medicine",
      required: true,
    },
    dosage: {
      type: String,
      required: true,
      trim: true,
      minLength: [1, "Dosage must be at least 1 character"],
    },
    frequency: {
      type: String,
      required: true,
      trim: true,
      minLength: [1, "Frequency must be at least 1 character"],
    },
    duration: {
      type: String,
      required: true,
      trim: true,
      minLength: [1, "Duration must be at least 1 character"],
    },
    instructions: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const vitalsSchema = new mongoose.Schema(
  {
    weight: {
      type: Number,
      min: [0, "Weight cannot be negative"],
    },
    height: {
      type: Number,
      min: [0, "Height cannot be negative"],
    },
    bloodPressure: {
      type: String,
    },
    temperature: {
      type: Number,
    },
    pulse: {
      type: Number,
      min: [0, "Pulse cannot be negative"],
    },
    respirationRate: {
      type: Number,
      min: [0, "Respiration rate cannot be negative"],
    },
  },
  { _id: false }
);

const prescriptionSchema = new mongoose.Schema(
  {
    patientEmail: {
      type: String,
      required: [true, "Patient email is required"],
      trim: true,
      lowercase: true,
      validate: {
        validator: (email) => validator.isEmail(email),
        message: "Invalid patient email format",
      },
    },
    diagnosis: {
      type: String,
      required: true,
      trim: true,
    },
    symptoms: {
      type: [String],
      default: [],
    },
    vitals: vitalsSchema,
    listOfMedicine: {
      type: [medicineItemSchema],
      default: [],
    },
    instructions: {
      type: String,
      trim: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries by patientEmail
prescriptionSchema.index({ patientEmail: 1 });

// Pre-save hook to validate patientEmail and medicineIds
prescriptionSchema.pre("save", async function (next) {
  try {
    // Validate patientEmail exists in Patient collection
    const patient = await Patient.findOne({
      email: this.patientEmail,
      isDeleted: false,
    });
    if (!patient) {
      throw ApiError.BadRequest(
        "Patient with this email does not exist or is deleted",
        "PATIENT_NOT_FOUND"
      );
    }

    // Validate all medicineIds
    const medicineIds = this.listOfMedicine.map((item) => item.medicineId);
    if (medicineIds.length > 0) {
      const medicines = await Medicine.find({
        _id: { $in: medicineIds },
        isDeleted: false,
      });
      if (medicines.length !== medicineIds.length) {
        throw ApiError.BadRequest(
          "One or more medicines not found or deleted",
          "MEDICINE_NOT_FOUND"
        );
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-find hook to exclude deleted prescriptions
prescriptionSchema.pre(/^find/, function (next) {
  this.where({ isDeleted: false });
  next();
});

const Prescription = mongoose.model("Prescription", prescriptionSchema);
export default Prescription;
