import nodemailer from 'nodemailer';

// Function to send the reset password email
export const sendResetPasswordEmail = async (email: string, resetLink: string): Promise<void> => {
  // Set up Nodemailer transporter using Gmail as an example
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Using Gmail's service for email sending
    auth: {
      user: "ameetabd17@getMaxListeners.com", // Your email address (e.g., your email)
      pass: "modernphysics", // Your email password (use App Password for Gmail)
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
