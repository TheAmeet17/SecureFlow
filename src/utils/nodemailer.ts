import nodemailer from 'nodemailer';
import { AppError } from './appError'; // Custom error class

export const sendResetPasswordEmail = async (email: string, resetLink: any): Promise<void> => {
    const emailUser = process.env.EMAIL_USER;
    const emailPassword = process.env.EMAIL_PASS;

    if (!emailUser || !emailPassword) {
        throw new AppError('Email configuration is missing in environment variables', 500);
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: emailUser, // Environment variable for email
            pass: emailPassword, // Environment variable for app-specific password
        },
    });

    const mailOptions = {
        from: emailUser,
        to: email,
        subject: 'Password Reset Request',
        text: `You requested a password reset. Click the link below to reset your password:\n\n${resetLink}`,
        attachment : [
          {
            filename: 'qr.png',
          }
        ]
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error: unknown) {
        if (error instanceof Error) {
            throw new AppError('Failed to send email: ' + error.message, 500);
        }
        throw new AppError('An unknown error occurred while sending the email', 500);
    }
};
