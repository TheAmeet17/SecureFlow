import { Request,Response } from "express";
import { Express } from "express";
import { PrismaClient } from "@prisma/client";
import prisma from "../connect/prisma";
import { createAccessToken } from "../jwt/token";
import * as bcrypt from 'bcryptjs'
import * as jwt from 'jsonwebtoken';
import { sendResetPasswordEmail } from "../utils/nodemailer";
// import passport from "passport";
// import { Strategy as GoogleStrategy } from "passport-google-oauth20";
// import cookieSession from "cookie-session";

import { promises } from "dns";



const Prisma =new PrismaClient();


export const signupUser = async (req: Request, res: Response): Promise<void> => {
    const { name, email, password } = req.body;

    // Validate the input
    if (!name || !email || !password) {
        res.status(400).json({ message: 'Name, email, and password are required' });
        return;
    }

    try {
        // Hash the password before saving it
        const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

        // Create a new user in the database
        const newUser = await prisma.user.create({
            data: {
                name:req.body.name,
                email:req.body.email,
                password: hashedPassword, // Store the hashed password
            },
        });

        // Generate JWT token after successful user creation
        const token = createAccessToken(newUser.id, newUser.email);

        // Send success response with token
        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
            },
            token, // Send the JWT token
            notification: `Hello ${name}, your account has been successfully created!`,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating user' });
    } finally {
        await prisma.$disconnect();
    }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    // Validate the input
    if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required' });
        return;
    }

    try {
        // Find the user by email (using email as a unique identifier)
        const user = await prisma.user.findUnique({
            where: {
                email: email, // Correct usage of email as the unique identifier
            },
        });

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // Compare the entered password with the stored hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ message: 'Invalid password' });
            return;
        }

        // Generate JWT token upon successful login
        const token = createAccessToken(user.id, user.email);

        // Send success response with token
        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
            token, // Send the JWT token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error logging in' });
    } finally {
        await prisma.$disconnect();
    }
};


    

 export const logoutUser = async (req: Request, res: Response): Promise<void> => {
        try {
            // Assuming you're using cookies to store the JWT token
            res.clearCookie('access_token');  // Clear the access token cookie
    
            
            res.status(200).json({
                message: 'Logout successful',
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error logging out' });
        }
    };
    
   
    export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
        const { email } = req.body;
    
        if (!email) {
            res.status(400).json({ message: 'Email is required' });
            return;
        }
    
        // Find user by email
        const user = await prisma.user.findUnique({ where: { email } });
    
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
    
        // Check if JWT_SECRET and FRONTEND_URL are defined
        const jwtSecret = process.env.JWT_SECRET;
        const frontendUrl = process.env.FRONTEND_URL;
    
        if (!jwtSecret || !frontendUrl) {
            res.status(500).json({ message: 'Server misconfiguration: Missing environment variables.' });
            return;
        }
    
        // Generate a reset token (valid for 15 minutes)
        const resetToken = jwt.sign({ userId: user.id }, jwtSecret, {
            expiresIn: '15m',
        });
    
        // Store token in the database (optional, but can be done for additional security)
        await prisma.passwordReset.create({
            data: {
                userId: user.id,
                token: resetToken,
                expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes expiration
            },
        });
    
        // Create reset link
        const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;
    
        try {
            // Send the reset email
            await sendResetPasswordEmail(user.email, resetLink);
            res.status(200).json({ message: 'Password reset link sent to email' });
        } catch (error: unknown) {
            // TypeScript requires 'unknown' error type in catch
            if (error instanceof Error) {
                res.status(500).json({ message: 'Failed to send email', error: error.message });
            } else {
                res.status(500).json({ message: 'An unknown error occurred during email sending.' });
            }
        }
    };
    



// // Replace with your Google API credentials
// const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID";
// const GOOGLE_CLIENT_SECRET = "YOUR_GOOGLE_CLIENT_SECRET";

// // Session configuration
// app.use(
//   cookieSession({
//     name: "session",
//     keys: ["secretKey"], // Change this key for better security
//     maxAge: 24 * 60 * 60 * 1000, // 1 day
//   })
// );

// // Passport configuration
// app.use(passport.initialize());
// app.use(passport.session());

// // Serialize user into session
// passport.serializeUser((user: any, done) => done(null, user));
// passport.deserializeUser((user: any, done) => done(null, user));

// // Configure Google OAuth Strategy
// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: GOOGLE_CLIENT_ID,
//       clientSecret: GOOGLE_CLIENT_SECRET,
//       callbackURL: "/auth/google/callback",
//     },
//     (accessToken, refreshToken, profile, done) => {
//       // This callback is triggered after successful Google login
//       return done(null, profile);
//     }
//   )
// );

// // Routes

// // Redirect to Google's OAuth consent screen
// app.get(
//   "/auth/google",
//   passport.authenticate("google", { scope: ["profile", "email"] })
// );

// // Callback after successful Google login
// app.get(
//   "/auth/google/callback",
//   passport.authenticate("google", { failureRedirect: "/auth/failure" }),
//   (req, res) => {
//     res.status(200).json({
//       message: "Logged in successfully",
//       user: req.user, // User's profile info from Google
//     });
//   }
// );

// // Route to handle failure
// app.get("/auth/failure", (req, res) => {
//   res.status(401).json({ message: "Failed to authenticate with Google" });
// });

// // Protected route (requires login)
// app.get("/profile", (req, res) => {
//   if (!req.user) {
//     return res.status(401).json({ message: "Unauthorized. Please log in." });
//   }
//   res.status(200).json({
//     message: "Access granted",
//     user: req.user,
//   });
// });

// // Logout route
// app.get("/logout", (req, res) => {
//   req.logout((err) => {
//     if (err) {
//       return res.status(500).json({ message: "Failed to log out" });
//     }
//     res.status(200).json({ message: "Logged out successfully" });
//   });
// });
