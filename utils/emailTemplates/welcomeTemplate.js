export const getWelcomeEmailHTML = (name, password) => {
    return `
        <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
            <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
                <h2 style="color: #4CAF50; border-bottom: 1px solid #eee; padding-bottom: 10px;">Welcome to HealthCare!</h2>
                <p>Dear <strong>${name}</strong>,</p>
                <p>We’re excited to have you on board. Your account has been created successfully. Please find your login details below:</p>
                <table style="width: 100%; margin: 20px 0;">
                    <tr>
                        <td style="padding: 10px 0;"><strong>Email:</strong></td>
                        <td style="padding: 10px 0;">${name.toLowerCase().replace(" ", ".")}@healthcare.com</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 0;"><strong>Temporary Password:</strong></td>
                        <td style="padding: 10px 0; color: #d32f2f;"><strong>${password}</strong></td>
                    </tr>
                </table>
                <p style="margin-top: 20px;">For your security, we recommend you <strong>log in and change this password</strong> immediately.</p>
                <p style="margin-top: 30px;">Best regards,<br><strong>HealthCare Team</strong></p>
                <hr style="margin-top: 40px;" />
                <small style="color: #777;">This is an automated message. Please do not reply to this email.</small>
            </div>
        </div>
    `;
};
