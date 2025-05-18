// controllers/patient.controller.js
import Patient from '../models/Patient.js';
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
        const rawPassword = crypto.randomBytes(8).toString('hex');
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
            joinDate: new Date()
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

