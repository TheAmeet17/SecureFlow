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

  // Email content and reset link
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset Request',
    text: `You requested a password reset. Click the link below to reset your password:\n\n${resetLink}`,
  };

  // Send email
  try {
    await transporter.sendMail(mailOptions);
  } catch (error: unknown) {
    // Check if the error is an instance of Error
    if (error instanceof Error) {
      throw new Error('Failed to send email: ' + error.message);
    } else {
      throw new Error('An unknown error occurred while sending the email');
    }
  }
};
