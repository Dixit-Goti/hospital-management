import validator from "validator";

/**
 * Generates HTML for patient welcome email
 * @param {string} name - Patient's name
 * @param {string} password - Temporary password
 * @param {string} [email] - Patient's email (optional, if not using generated email)
 * @returns {string} - HTML email content
 * @throws {Error} - If inputs are invalid
 */
export const getWelcomeEmailHTML = (name, password, email = null) => {
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    throw new Error("Invalid or missing name");
  }
  if (!password || typeof password !== "string" || password.trim().length < 6) {
    throw new Error("Invalid or missing password");
  }

  const safeName = validator.escape(name); // Prevent XSS
  const loginEmail =
    email || `${safeName.toLowerCase().replace(/\s+/g, ".")}@healthcare.com`;

  if (!validator.isEmail(loginEmail)) {
    throw new Error("Generated email is invalid");
  }

  return `
        <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
            <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
                <h2 style="color: #4CAF50; border-bottom: 1px solid #eee; padding-bottom: 10px;">Welcome to HealthCare!</h2>
                <p>Dear <strong>${safeName}</strong>,</p>
                <p>We’re excited to have you on board. Your account has been created successfully. Please find your login details below:</p>
                <table style="width: 100%; margin: 20px 0;">
                    <tr>
                        <td style="padding: 10px 0;"><strong>Email:</strong></td>
                        <td style="padding: 10px 0;">${loginEmail}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 0;"><strong>Temporary Password:</strong></td>
                        <td style="padding: 10px 0; color: #d32f2f;"><strong>${password}</strong></td>
                    </tr>
                </table>
                <p style="margin-top: 20px;">
                    For your security, please <a href="${process.env.APP_URL}/login" style="color: #4CAF50; text-decoration: none;">log in</a> and change your password immediately.
                </p>
                <p style="margin-top: 30px;">Best regards,<br><strong>HealthCare Team</strong></p>
                <hr style="margin-top: 40px;" />
                <small style="color: #777;">This is an automated message. Please do not reply to this email.</small>
            </div>
        </div>
    `;
};
