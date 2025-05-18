import mongoose from 'mongoose';

const vitalsSchema = new mongoose.Schema({
    weight: Number, // in kg
    height: Number, // in cm
    bloodPressure: String, // e.g. '120/80 mmHg'
    temperature: Number, // in Celsius
    pulse: Number, // bpm
    respirationRate: Number // breaths per minute
}, { _id: false });

const visitSchema = new mongoose.Schema(
    {
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Patient',
            required: true,
        },
        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        date: {
            type: Date,
            required: true,
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
        notes: {
            type: String,
            trim: true,
        },
        recommendedFollowUpDate: {
            type: Date,
        },
        followUpNotes: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// Export model
const Visit = mongoose.model('Visit', visitSchema);
export default Visit;
