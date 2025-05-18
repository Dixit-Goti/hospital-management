import nodemailer from 'nodemailer';

const sendEmail = async (to, subject, html) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            secure: true,
            tls: {
                rejectUnauthorized: false
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent: " + info.response);
        return true;
    } catch (err) {
        console.error("Error sending email:", err);
        return false;
    }
};

export default sendEmail;
