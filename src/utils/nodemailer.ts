import nodemailer from 'nodemailer';
import { AppError } from './appError'; // Custom error class
import QRCode from 'qrcode'; // Import the qrcode package

export const sendResetPasswordEmail = async (email: string, resetLink: string, qrCodeBuffer: Buffer): Promise<void> => {
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
        text: `Hello,\n\nWe received a request to reset your password. Please use the link below to reset your password:\n\n${resetLink}\n\nFor your convenience, we've also included a QR code below. Simply scan it to reset your password.\n\nIf you didn't request a password reset, please ignore this email.`,
        attachments: [
            {
                filename: 'qr.png',
                content: qrCodeBuffer, // Attach the QR code buffer
                encoding: 'base64',
            },
        ],
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
