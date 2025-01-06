// import { Request, Response } from "express";
// import { PrismaClient } from "@prisma/client";
// import prisma from "../connect/prisma";
// import { createAccessToken } from "../jwt/token";
// import * as bcrypt from 'bcryptjs';
// import * as jwt from 'jsonwebtoken';
// import { sendResetPasswordEmail } from "../utils/nodemailer";

// const prismaClient = new PrismaClient(); // Using lowercase 'prismaClient'

// //Validates the user's input.
// // Hashes the password.
// // Determines the user's role and approval status.
// // Creates a new user in the database.
// // Provides special handling for the first user.
// // Returns a success response or an error.

//use this code if we need to define error message in json format ;

// export const signupUser = async (req: Request, res: Response): Promise<void> => {
//     const { name, email, password } = req.body;

//     // Validate the input
//     if (!name || !email || !password) {
//         res.status(400).json({ message: 'Name, email, and password are required.' });
//         return;
//     }

//     try {
//         // Hash the password
//         const hashedPassword = await bcrypt.hash(password, 10);

//         // Check total user count
//         const userCount = await prisma.user.count();

//         let role = 'pending'; // Default role is 'pending'
//         let isApproved = false; // Default approval status is false

//         if (userCount === 0) {
//             // First user is the admin and automatically approved
//             role = 'admin';
//             isApproved = true;
//         }

//         // Create the new user in the database
//         const user = await prisma.user.create({
//             data: {
//                 name,
//                 email,
//                 password: hashedPassword,
//                 role,
//                 isApproved,
//             },
//         });

//         // Generate JWT token for the first admin user
//         const token =
//             userCount === 0 ? createAccessToken(user.id, user.email, user.role) : undefined;

//         // Send response
//         res.status(201).json({
//             message: 'User created successfully.',
//             user: {
//                 id: user.id,
//                 name: user.name,
//                 email: user.email,
//                 role: user.role,
//                 isApproved: user.isApproved,
//             },
//             token, // Send token only for the first user
//             notification:
//                 userCount === 0
//                     ? `Hello ${name}, you are the first user and have been automatically approved as an admin.`
//                     : `Hello ${name}, your account has been created and is awaiting admin approval.`,
//         });
//     } catch (error) {
//         console.error('Error creating user:', error);
//         res.status(500).json({ message: 'An error occurred while creating the user.' });
//     } finally {
//         await prisma.$disconnect();
//     }
// };


// export const loginUser = async (req: Request, res: Response): Promise<void> => {
//     const { email, password } = req.body;

//     // Validate the input
//     if (!email || !password) {
//         res.status(400).json({ message: 'Email and password are required' });
//         return;
//     }

//     try {
//         // Find the user by email (using email as a unique identifier)
//         const user = await prisma.user.findUnique({
//             where: { email: email }, // Correct usage of email as the unique identifier
//         });

//         if (!user) {
//             res.status(404).json({ message: 'User not found' });
//             return;
//         }

//         // Compare the entered password with the stored hashed password
//         const isPasswordValid = await bcrypt.compare(password, user.password);
//         if (!isPasswordValid) {
//             res.status(401).json({ message: 'Invalid password' });
//             return;
//         }

//         // Generate JWT token upon successful login
//         const token = createAccessToken(user.id, user.email, user.role); // Added role

//         // Send success response with token
//         res.status(200).json({
//             message: 'Login successful',
//             user: {
//                 id: user.id,
//                 name: user.name,
//                 email: user.email,
//                 role: user.role, // Include role in the response
//             },
//             token, // Send the JWT token
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Error logging in' });
//     } finally {
//         await prisma.$disconnect(); // Ensure disconnection from the Prisma client
//     }
// };

// export const logoutUser = async (req: Request, res: Response): Promise<void> => {
//     try {
//         // Assuming you're using JWT stored in a cookie
//         res.clearCookie('access_token'); // Clear the access token cookie (if stored in cookies)
    
//         // Optionally, you can send a response confirming logout
//         res.status(200).json({
//             message: 'Logout successful',
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Error logging out' });
//     }
// };


// //ysko aalik baki xa code milauna
// export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
//     const { email } = req.body;

//     if (!email) {
//         res.status(400).json({ message: 'Email is required' });
//         return;
//     }

//     // Find user by email
//     const user = await prisma.user.findUnique({ where: { email } });

//     if (!user) {
//         res.status(404).json({ message: 'User not found' });
//         return;
//     }

//     // Check if JWT_SECRET and FRONTEND_URL are defined
//     const jwtSecret = process.env.JWT_SECRET;
//     const frontendUrl = process.env.FRONTEND_URL;

//     if (!jwtSecret || !frontendUrl) {
//         res.status(500).json({ message: 'Server misconfiguration: Missing environment variables.' });
//         return;
//     }

//     // Generate a reset token (valid for 15 minutes)
//     const resetToken = jwt.sign({ userId: user.id }, jwtSecret, {
//         expiresIn: '15m',
//     });

//     // Store token in the database (optional, but can be done for additional security)
//     await prisma.passwordReset.create({
//         data: {
//             userId: user.id,
//             token: resetToken,
//             expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes expiration
//         },
//     });

//     // Create reset link
//     const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

//     try {
//         // Send the reset email
//         await sendResetPasswordEmail(user.email, resetLink);
//         res.status(200).json({ message: 'Password reset link sent to email' });
//     } catch (error: unknown) {
//         // TypeScript requires 'unknown' error type in catch
//         if (error instanceof Error) {
//             res.status(500).json({ message: 'Failed to send email', error: error.message });
//         } else {
//             res.status(500).json({ message: 'An unknown error occurred during email sending.' });
//         }
//     } finally {
//         await prismaClient.$disconnect(); // Changed `Prisma` to `prismaClient`
//     }
// };






//use this code if we need to use builderror instead of apperror;


// export const loginUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//   const { email, password } = req.body;

//   // Validate the input
//   if (!email || !password) {
//     return next(buildError(new Error('Email and password are required'))); // Pass error to next()
//   }

//   try {
//     // Find the user by email (using email as a unique identifier)
//     const user = await prisma.user.findUnique({
//       where: { email: email },
//     });

//     if (!user) {
//       return next(buildError(new Error('User not found'))); // Pass error to next()
//     }

//     // Compare the entered password with the stored hashed password
//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) {
//       return next(buildError(new Error('Invalid password'))); // Pass error to next()
//     }

//     // Generate JWT token upon successful login
//     const token = 'some-jwt-token'; // Replace with actual token creation logic

//     // Send success response with token
//     res.status(200).json({
//       message: 'Login successful',
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//       },
//       token,
//     });
//   } catch (error) {
//     // Pass any unexpected errors to the next middleware using buildError
//     return next(buildError(error)); // Pass error to next()
//   }
// };
