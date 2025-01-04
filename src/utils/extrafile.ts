
// import { Request, Response } from 'express';
// import prisma from '../database/prisma'; // Adjust this to your Prisma client import
// import { generateAccessToken } from '../utils/token.utils'; // Import the token generation function

// export const createUser = async (req: Request, res: Response): Promise<Response> => {
//     const { username, password, email }: { username: string, password: string, email: string } = req.body;

//     if (!username || !password || !email) {
//         return res.status(409).json({
//             message: "Invalid Credentials",
//         });
//     }

//     if (password.length < 5) {
//         return res.status(409).json({
//             message: "Password must be at least 5 characters long",
//         });
//     }

//     try {
//         // Create the user in the database
//         const savedUser = await prisma.user.create({
//             data: {
//                 email,
//                 username,
//                 password,
//             },
//         });

//         // Generate the access token
//         const accessToken = generateAccessToken(savedUser.id, savedUser.username);

//         return res.status(201).json({
//             message: "User is registered successfully",
//             accessToken, // Return the access token
//             data: savedUser,
//         });
//     } catch (error) {
//         return res.status(500).json({
//             message: "Error creating user",
//             error: (error as Error).message,
//         });
//     }
// };

// export const getUser = async (req: Request, res: Response) => {
//     try {
//         // Fetch all users
//         const users = await prisma.user.findMany({
//             where:{
//                 username:"Manoj"
//             }});
        
//         if (!users.length) {
//             return res.status(404).json({
//                 message: "No users found",
//             });
//         }

//         // Count the number of users
//         const userNumbers = await prisma.user.count();

//         return res.status(200).json({
//             message: "Users fetched successfully",
//             no_of_users: userNumbers,
//             data: users,
//         });
//     } catch (error) {
//         return res.status(500).json({
//             message: "An error occurred while fetching users",
//             error: error.message,
//         });
//     }
// };



// export const updateUser = async (req: Request, res: Response) => {
//     const { id } = req.params; // ID of the user to update
//     const { username, password,email} = req.body; // Data to update

//     try {
//         // Find the user by ID
//         const user = await prisma.user.findUnique({
//             where: { id: Number(id) },
//         });

//         // If user not found, return a 404 error
//         if (!user) {
//             return res.status(404).json({
//                 message: "The user you request is not available",
//             });
//         }

//         // Update the user with new username and password
//         const updatedUser = await prisma.user.update({
//             where: { id: Number(id) },
//             data: {
//                 username: username,
//                 password: password,
//                 email:email
//             },
//         });

//         // If update is successful, return 200 with success message
//         return res.status(200).json({
//             message: "User updated successfully",
//             data: updatedUser, // Returning the updated user data
//         });
//     } catch (error) {
//         // Error handling for failed update
//         return res.status(500).json({
//             message: "Update operation failed",
//             error: error.message,
//         });
//     }
// };


// export const deleteUser = async (req: Request, res: Response) => {
//     const { id } = req.params;

//     try {
//         const user = await prisma.user.findUnique({
//             where: { id: Number(id) },
//         });
//         if (!user) {
//             return res.status(404).json({
//                 message: "The user you request is not available",
//             });
//         }
//         const result = await prisma.user.delete({
//             where: { id: Number(id) },
//         });
//         return res.status(200).json({
//             message: "Deleted successfully",
//             data: result,
//         });
//     } catch (error) {
//         return res.status(500).json({
//             message: "Delete operation failed",
//             error: error.message,
//         });
//     }
// };