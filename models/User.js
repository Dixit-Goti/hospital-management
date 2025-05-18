import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true,
        },
        lastName: {
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
        hashedPassword: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            required: true,
            enum: ['doctor', 'receptionist', 'admin'],
            default: 'doctor',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt
    }
);

// Export model
const User = mongoose.model('User', userSchema);
export default User;
