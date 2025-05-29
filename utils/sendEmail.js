import nodemailer from "nodemailer";
import validator from "validator";
import winston from "winston";
import { ApiError } from "./error.js";

// Initialize logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logs/email.log" }),
  ],
});

// Initialize transporter once
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  secure: true,
  tls: {
    rejectUnauthorized: false,
  },
});

/**
 * Sends an email using Nodemailer
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - HTML content of the email
 * @returns {Promise<boolean>} - True if email sent successfully
 * @throws {ApiError} - If email sending fails
 */
const sendEmail = async (to, subject, html) => {
  if (!validator.isEmail(to)) {
    throw ApiError.BadRequest("Invalid email address", "INVALID_EMAIL");
  }
  if (!subject || !html) {
    throw ApiError.BadRequest(
      "Subject and HTML content are required",
      "MISSING_FIELDS"
    );
  }

  try {
    const mailOptions = {
      from: `"HealthCare Team" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${to}: ${info.response}`);
    return true;
  } catch (err) {
    logger.error(`Error sending email to ${to}: ${err.message}`);
    throw new ApiError(
      "Failed to send email",
      500,
      "EMAIL_SEND_FAILED",
      err.message
    );
  }
};

export default sendEmail;
