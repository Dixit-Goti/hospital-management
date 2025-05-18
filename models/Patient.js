import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        mobile: {
            type: String,
            required: true,
            trim: true,
        },
        dob: {
            type: Date,
            required: false,
        },
        gender: {
            type: String,
            enum: ['Male', 'Female', 'Other'],
            required: false,
        },
        address: {
            type: String,
            required: false,
        },
        hashedPassword: {
            type: String,
            required: true,
        },
        profileImage: {
            type: String, // URL of the uploaded image
            required: false,
        },
        joinDate: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true, // adds createdAt and updatedAt automatically
    }
);

// Export model
const Patient = mongoose.model('Patient', patientSchema);
export default Patient;
