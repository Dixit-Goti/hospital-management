import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/error.js';
import { successResponse, errorResponse } from '../utils/response.js';
import Patient from '../models/Patient.js';


export const loginDoctor = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            throw new ApiError('Email and Password are required', 400);
        }

        // Find doctor by email
        const user = await User.findOne({ email, role: 'doctor' }).select('+password');;

        if (!user) {
            throw new ApiError('Doctor with this email does not exist', 404);
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            throw new ApiError('Invalid email or password', 401);
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return successResponse(res, { token, user: { id: user._id, name: user.firstName, role: user.role } }, 'Doctor logged in successfully');
    } catch (err) {
        next(err);
    }
};


export const loginPatient = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate email and password
        if (!email || !password) {
            throw new ApiError("Email and password are required", 400);
        }

        // Find patient by email
        const patient = await Patient.findOne({ email });
        if (!patient) {
            throw new ApiError("Invalid credentials", 401);
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, patient.password);
        if (!isMatch) {
            throw new ApiError("Invalid credentials", 401);
        }

        // Generate JWT
        const token = jwt.sign(
            {
                id: patient._id,
                email: patient.email,
                role: 'patient',
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return successResponse(res, { token }, "Patient logged in successfully");

    } catch (err) {
        next(err);
    }
};
