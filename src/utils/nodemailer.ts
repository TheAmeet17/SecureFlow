import nodemailer from 'nodemailer';
import { AppError } from './appError';
import QRCode from 'qrcode'; // Import QRCode library to generate QR code
import dotenv from 'dotenv';

dotenv.config();

const emailUser = process.env.EMAIL_USER || "your-email@gmail.com";
const emailPass = process.env.EMAIL_PASS || "your-email-password";

// Function to send the reset password email
export const sendResetPasswordEmail = async (email: string, resetLink: string): Promise<void> => {
  // Generate QR code buffer from the reset link
  const qrCodeBuffer = await QRCode.toBuffer(resetLink);

  // Set up Nodemailer transporter using Gmail
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  const mailOptions = {
    from: emailUser,
    to: email,
    subject: 'Password Reset Request',
    text: `Hello,\n\nWe received a request to reset your password. Use the link below to reset it:\n\n${resetLink}\n\nYou can also scan the attached QR code.\n\nIf you didn’t request this, ignore this email.`,
    attachments: [
      {
        filename: 'qr.png',
        content: qrCodeBuffer,
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
