import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { createAccessToken } from "../jwt/token";
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient(); // Initialize PrismaClient instance

// Admins use this function to create new users.
//
export const createUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password } = req.body;

        // Validate input fields
        if (!name || !email || !password) {
            res.status(400).json({ message: 'Name, email, and password are required' });
            return;
        }

        // Check if the email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            res.status(400).json({ message: 'Email is already registered' });
            return;
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
        console.error(error);
        res.status(500).json({ message: 'Failed to create user' });
    }
};

export const approveUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const { role } = req.body;
  
      const user = await prisma.user.findUnique({
        where: { id: Number(userId) },
      });
  
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      console.log(role)
  
      if ( typeof(user.isApproved) === 'boolean' &&  user.isApproved) {
        res.status(400).json({ message: 'User is already approved' });
        return;
      }
  
      const approvedUser = await prisma.user.update({
        where: { id: Number(userId) },
        data: {
          isApproved : true,
          role: role || 'user',
        },
      });
  
      res.status(200).json({
        message: 'User approved and role assigned successfully',
        data: approvedUser,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to approve user' });
    }
  };
/**
 * Fetch users with specific username and count total users
 */

export const getUser = async (req: Request, res: Response): Promise<void> => {
    try {
        // Get the 'name' query parameter (if available)
        const { name } = req.query;

        if (!name) {
            // If no 'name' is provided, return an error response
             res.status(400).json({
                message: "Name parameter is required",
            });
        }

        // Find users with the provided name
        const users = await prisma.user.findMany({
            where: { name: String(name) }, // Convert 'name' to string just in case
        });

        if (users.length === 0) {
            // If no users found, send 404 response
             res.status(404).json({
                message: `No users found with the name: ${name}`,
            });
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
        // Handle any other errors
        res.status(500).json({
            message: "An error occurred while fetching users",
            error: error.message,
        });
    }
};
// /**
//  * Update user by ID with new details
//  */

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
 */export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;

    // Validate the input
    if (!email) {
        res.status(400).json({ message: 'Email is required' });
        return;
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
        console.error(error);
        res.status(500).json({ message: 'Error deleting user' });
    } finally {
        await prisma.$disconnect(); // Disconnect Prisma client
    }
};
