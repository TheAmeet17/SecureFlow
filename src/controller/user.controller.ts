import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { createAccessToken } from "../jwt/token";
import { AppError } from "../utils/appError";
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient(); // Initialize PrismaClient instance

// Admins use this function to create new users.
//

export const createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name, email, password } = req.body;

        // Validate input fields
        if (!name || !email || !password) {
            return next(new AppError('Name, email, and password are required', 400));
        }

        // Check if the email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return next(new AppError('Email is already registered', 400));
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: 'user',
            },
        });

        // Send success response
        res.status(201).json({
            message: 'User created successfully, awaiting admin approval',
            data: newUser,
        });
    } catch (error) {
        // If any error occurs, pass it to the error handler
        return next(new AppError('Failed to create user', 500));
    }
};

export const approveUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        const user = await prisma.user.findUnique({
            where: { id: Number(userId) },
        });

        if (!user) {
            return next(new AppError('User not found', 404));
        }

        if (typeof user.isApproved === 'boolean' && user.isApproved) {
            return next(new AppError('User is already approved', 400));
        }

        const approvedUser = await prisma.user.update({
            where: { id: Number(userId) },
            data: {
                isApproved: true,
                role: role || 'user',
            },
        });

        res.status(200).json({
            message: 'User approved and role assigned successfully',
            data: approvedUser,
        });
    } catch (error) {
        // If any error occurs, pass it to the error handler
        return next(new AppError('Failed to approve user', 500));
    }
};
/**
 * Fetch users with specific username and count total users
 */

export const getUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Get the 'name' query parameter (if available)
        const { name } = req.query;

        if (!name) {
            // If no 'name' is provided, return an error using AppError
            return next(new AppError("Name parameter is required", 400));
        }

        // Find users with the provided name
        const users = await prisma.user.findMany({
            where: { name: String(name) }, // Convert 'name' to string just in case
        });

        if (users.length === 0) {
            // If no users found, send 404 response using AppError
            return next(new AppError(`No users found with the name: ${name}`, 404));
        }

        // Get the total user count
        const userCount = await prisma.user.count();

        // Send successful response
        res.status(200).json({
            message: "Users fetched successfully",
            totalUsers: userCount,
            data: users,
        });
    } catch (error: any) {
        // Handle any other errors and pass them through AppError
        return next(new AppError("An error occurred while fetching users", 500));
    }
};
// /**
//  * Update user by ID with new details
//  */
export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id, name, password, email } = req.body; // Ensure `id` is part of the request body

    if (!id) {
        // Return error using AppError
        return next(new AppError("User ID is required", 400));
    }

    try {
        // Find the user by ID
        const user = await prisma.user.findUnique({
            where: { id: parseInt(id) }, // Ensure `id` is an integer
        });

        if (!user) {
            // Return error using AppError
            return next(new AppError("User not found", 404));
        }

        // Prepare update data
        const updateData: any = { name, email }; // Initialize update data with name and email
        if (password) {
            // Hash the new password if provided
            const hashedPassword = await bcrypt.hash(password, 12); // Use a salt of 12 rounds
            updateData.password = hashedPassword;
        }

        // Update the user
        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: updateData,
        });

        res.status(200).json({
            message: "User updated successfully",
            data: updatedUser,
        });
    } catch (error: any) {
        // Pass the error to AppError and forward to errorHandler
        return next(new AppError("Failed to update user", 500));
    }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email } = req.body;

    // Validate the input
    if (!email) {
        // Return error using AppError
        return next(new AppError('Email is required', 400));
    }

    try {
        // Delete the user from the database by email
        const user = await prisma.user.delete({
            where: { email: email },
        });

        res.status(200).json({
            message: 'User deleted successfully',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        // Pass the error to AppError and forward to errorHandler
        return next(new AppError('Error deleting user', 500,));
    } finally {
        await prisma.$disconnect(); // Disconnect Prisma client
    }
};