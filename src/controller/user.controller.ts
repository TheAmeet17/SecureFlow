import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import prisma from "../connect/prisma";
import { createAccessToken } from "../jwt/token";
import * as bcrypt from 'bcryptjs';

const Prisma = new PrismaClient();

// Admins use this function to create new users. 
// An admin uses POST /users to create accounts for new employees with specific roles.
// Example: A company HR admin pre-creates accounts for a new batch of hires.
export const createUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, role } = req.body;

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user in database
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                
            },
        });

        res.status(201).json({
            message: "User created successfully",
            data: newUser,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to create user",
          //  error: error.message,
        });
    }
};

/**
 * Fetch users with specific username and count total users
 */
export const getUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await prisma.user.findMany({
            where: { name: "Stokes" },
        });

        if (users.length === 0) {
             res.status(404).json({
                message: "No users found with the specified username",
            });
        }

        const userCount = await prisma.user.count();

        res.status(200).json({
            message: "Users fetched successfully",
            totalUsers: userCount,
            data: users,
        });
    } catch (error: any) {
        res.status(500).json({
            message: "An error occurred while fetching users",
            error: error.message,
        });
    }
};

/**
 * Update user by ID with new details
 */

export const updateUser = async (req: Request, res: Response): Promise<void> => {
    const { id, name, password, email } = req.body; // Ensure `id` is part of the request body

    if (!id) {
        res.status(400).json({
            message: "User ID is required",
        });
        return;
    }

    try {
        // Find the user by ID
        const user = await prisma.user.findUnique({
            where: { id: parseInt(id) }, // Ensure `id` is an integer
        });

        if (!user) {
            res.status(404).json({
                message: "User not found",
            });
            return;
        }

        // Update the user
        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: { name, password, email },
        });

        res.status(200).json({
            message: "User updated successfully",
            data: updatedUser,
        });
    } catch (error: any) {
        res.status(500).json({
            message: "Failed to update user",
            error: error.message,
        });
    }
};
/**
 * Delete user by ID
 */
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        const user = await prisma.user.findUnique({
            where: { id: Number(id) },
        });

        if (!user) {
             res.status(404).json({
                message: "User not found",
            });
        }

        const deletedUser = await prisma.user.delete({
            where: { id: Number(id) },
        });

         res.status(200).json({
            message: "User deleted successfully",
            data: deletedUser,
        });
    } catch (error: any) {
        res.status(500).json({
            message: "Failed to delete user",
            error: error.message,
        });
    }
};
