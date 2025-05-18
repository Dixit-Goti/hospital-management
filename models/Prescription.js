import mongoose from 'mongoose';

const medicineItemSchema = new mongoose.Schema({
    medicineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Medicine',
        required: true,
    },
    dosage: {
        type: String,
        required: true,
        trim: true,
    },
    frequency: {
        type: String,
        required: true,
        trim: true,
    },
    duration: {
        type: String,
        required: true,
        trim: true,
    },
    instructions: {
        type: String,
        trim: true,
    },
}, { _id: false });

const prescriptionSchema = new mongoose.Schema(
    {
        visitId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Visit',
            required: true,
        },
        listOfMedicine: {
            type: [medicineItemSchema],
            default: [],
        },
        instructions: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// Export model
const Prescription = mongoose.model('Prescription', prescriptionSchema);
export default Prescription;
