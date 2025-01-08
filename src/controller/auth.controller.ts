import { Request, Response ,NextFunction} from "express";
import { PrismaClient } from "@prisma/client";
import prisma from "../connect/prisma";
import { createAccessToken } from "../jwt/token";
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { sendResetPasswordEmail } from "../utils/nodemailer";
import QRCode from 'qrcode'
import { AppError } from '../utils/appError';
import path from 'path'
const prismaClient = new PrismaClient(); // Using lowercase 'prismaClient'

//Validates the user's input.
// Hashes the password.
// Determines the user's role and approval status.
// Creates a new user in the database.
// Provides special handling for the first user.
// Returns a success response or an error.

export const signupUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { name, email, password } = req.body;

    // Validate the input
    if (!name || !email || !password) {
        // Instead of directly returning a response, pass an error to next()
        return next(new AppError('Name, email, and password are required.', 400));
    }

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check total user count
        const userCount = await prisma.user.count();

        let role = 'pending'; // Default role is 'pending'
        let isApproved = false; // Default approval status is false

        if (userCount === 0) {
            // First user is the admin and automatically approved
            role = 'admin';
            isApproved = true;
        }

        // Create the new user in the database
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
                isApproved,
            },
        });

        // Generate JWT token for the first admin user
        const token =
            userCount === 0 ? createAccessToken(user.id, user.email, user.role) : undefined;

        // Send response
        res.status(201).json({
            message: 'User created successfully.',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                isApproved: user.isApproved,
            },
            token, // Send token only for the first user
            notification:
                userCount === 0
                    ? `Hello ${name}, you are the first user and have been automatically approved as an admin.`
                    : `Hello ${name}, your account has been created and is awaiting admin approval.`,
        });
    } catch (error) {
        // Instead of directly logging the error, pass it to next()
        return next(new AppError('An error occurred while creating the user.', 500));
    } finally {
        await prisma.$disconnect();
    }
};


console.log("hello");
console.log(signupUser);



export const loginUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, password } = req.body;

    // Validate the input
    if (!email || !password) {
        return next(new AppError('Email and password are required', 400));
    }

    try {
        // Find the user by email
        const user = await prisma.user.findUnique({
            where: { email: email },
        });

        if (!user) {
            return next(new AppError('User not found', 404));
        }

        // Compare the entered password with the stored hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return next(new AppError('Invalid password', 401));
        }

        // Generate JWT token upon successful login
        const token = createAccessToken(user.id, user.email, user.role);

        // Send success response with token
        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            token,
        });
    } catch (error) {
        // Pass any unexpected errors to the error handler middleware
        next(new AppError('An error occurred while logging in', 500));
    } finally {
        await prisma.$disconnect(); // Ensure disconnection from the Prisma client
    }
};

console.log("hello")


export const logoutUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Assuming you're using JWT stored in a cookie
        res.clearCookie('access_token'); // Clear the access token cookie (if stored in cookies)

        // Send a response confirming logout
        res.status(200).json({
            message: 'Logout successful',
        });
    } catch (error) {
        // Pass the error to the error handler middleware
        next(new AppError('Error logging out', 500));
    }
};
//ysko aalik baki xa code milauna
export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email } = req.body;

    if (!email) {
        return next(new AppError('Email is required', 400));
    }

    try {
        // Find user by email
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return next(new AppError('User not found', 404));
        }

        // Check for required environment variables
        const jwtSecret = process.env.JWT_SECRET;
        const frontendUrl = process.env.FRONTEND_URL;
        if (!jwtSecret || !frontendUrl) {
            return next(new AppError('Server misconfiguration: Missing environment variables', 500));
        }

        // Generate a reset token (valid for 15 minutes)
        const resetToken = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: '15m' });

        // Store token in the database (optional for additional security)
        await prisma.passwordReset.create({
            data: {
                userId: user.id,
                token: resetToken,
                expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes expiration
            },
        });

        // Create the reset link
        const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

        // Generate QR code image buffer
        const qrCodeBuffer = await QRCode.toBuffer(resetLink, { type: 'png' });

        // Send the reset email with the QR code attached
        await sendResetPasswordEmail(user.email, resetLink, qrCodeBuffer);

        res.status(200).json({ message: 'Password reset link sent to email' });
    } catch (error) {
        next(new AppError('Failed to process the password reset request', 500));
    } finally {
        await prisma.$disconnect(); // Ensure the database connection is closed
    }
};