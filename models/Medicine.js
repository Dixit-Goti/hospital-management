import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        strength: {
            type: String,
            required: true,
            trim: true,
        },
        form: {
            type: String,
            required: true,
            trim: true,
        },
        manufacturer: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// Export model
const Medicine = mongoose.model('Medicine', medicineSchema);
export default Medicine;
