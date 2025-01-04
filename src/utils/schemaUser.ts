import { z } from 'zod';

// User Validation Schema
export const createUserSchema = z.object({
  // Basic user information
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters long') // Minimum length of 3 characters
    .max(50, 'Name must be at most 50 characters long') // Maximum length of 50 characters
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces') // Alphanumeric + space validation
    .nonempty('Name is required'), // Field is required

  email: z
    .string()
    .email('Invalid email format') // Must be a valid email format
    .transform((value) => value.toLowerCase()), // Convert email to lowercase

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long') // Minimum password length
    .max(32, 'Password must be at most 32 characters long') // Maximum password length
    .regex(
      /(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&])/,
      'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'
    ), // Complex password validation

  address: z
    .string()
    .max(200, 'Address must be at most 200 characters long') // Maximum length of address
    .optional(), // Field is optional

  isAdmin: z
    .boolean()
    .default(false) // Default value is false
    .optional(), // Field is optional
});

// Export schema
export default createUserSchema;
