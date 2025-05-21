// controllers/patient.controller.js
import Patient from '../models/Patient.js';
import User from '../models/User.js';
import { validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import { successResponse } from '../utils/response.js';
import { ApiError } from '../utils/error.js';
import sendEmail from '../utils/sendEmail.js'; // using your original function
import crypto from 'crypto';
import { getWelcomeEmailHTML } from '../utils/emailTemplates/welcomeTemplate.js';


export const registerPatient = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ApiError(errors.array()[0].msg, 400));
        }

        const {
            firstName,
            lastName,
            email,
            mobile,
            dob,
            gender,
            address,
            profileImage
        } = req.body;

        // Check if patient already exists
        const existing = await Patient.findOne({ email });
        if (existing) {
            throw new ApiError('Patient already exists with this email', 409);
        }

        // Generate password and hash it
        const rawPassword = `${firstName}@1234`// crypto.randomBytes(8).toString('hex');
        const hashedPassword = await bcrypt.hash(rawPassword, 10);

        // Create patient document
        const newPatient = new Patient({
            firstName,
            lastName,
            email,
            mobile,
            dob,
            gender,
            address,
            profileImage,
            password: hashedPassword,
            joinDate: new Date(),
            role: 'patient',
        });

        await newPatient.save();

        // Send email with password
        const emailBody = getWelcomeEmailHTML(firstName, rawPassword);
        // const mailSent = await sendEmail(email, 'Welcome to HealthCare App', emailBody);

        // if (!mailSent) {
        //     console.warn('Email sending failed, but patient record created.');
        // }

        return successResponse(res, null, 'Patient registered successfully', 201);
    } catch (err) {
        next(err);
    }
};


export const getPatients = async (req, res, next) => {
    try {
        const user = req.user;

        // Doctor can view all or specific patient by email (via query param)
        if (user.role === 'doctor') {
            const { email } = req.query;

            const filter = { isDeleted: false };
            if (email) {
                filter.email = email;
            }

            const patients = await Patient.find(filter).select('-password');
            return successResponse(res, patients, 'Patient(s) fetched successfully');
        }

        // Patient can view only their own details
        if (user.role === 'patient') {
            const patient = await Patient.findOne({ _id: user.id, isDeleted: false });

            if (!patient) {
                throw new ApiError('Patient not found or deleted', 404);
            }

            return successResponse(res, patient, 'Your profile details');
        }

        // Unauthorized role
        throw new ApiError('Unauthorized access', 403);
    } catch (err) {
        next(err);
    }
};


export const updatePatient = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Validate if patient exists and is not deleted
        const patient = await Patient.findOne({ _id: id, isDeleted: false });
        if (!patient) {
            throw new ApiError('Patient not found or already deleted', 404);
        }

        // Update patient fields
        Object.keys(updates).forEach(key => {
            if (key in patient) {
                patient[key] = updates[key];
            }
        });

        await patient.save();

        return successResponse(res, patient, 'Patient updated successfully');
    } catch (err) {
        next(err);
    }
};


export const softDeletePatient = async (req, res, next) => {
    try {
        const { id } = req.params;

        const patient = await Patient.findOne({ _id: id, isDeleted: false });
        if (!patient) {
            throw new ApiError('Patient not found or already deleted', 404);
        }

        patient.isDeleted = true;
        await patient.save();

        return successResponse(res, null, 'Patient record deleted (soft delete)');
    } catch (err) {
        next(err);
    }
};

// async function addDoctor() {
//     const newUSer = new User({
//         firstName: "John",
//         lastName: "Doe",
//         email: "doctor@example.com",
//         password: "$2b$10$ri62/Bo0VIZq8ioKlwKAtOxgkUXe12vbGkB7dj.aSUjK7QvhvrGyK",
//         mobileNo: 9876543210,
//         gender: "male",
//         address: "123 Clinic Street, Cityville",
//         role: "doctor"
//     });

//     await newUSer.save();
// }

// // addDoctor()
