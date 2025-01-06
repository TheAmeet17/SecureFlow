import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
import { AppError } from '../utils/appError'; // Import AppError

dotenv.config();

// Type for the decoded JWT payload
interface CustomJwtPayload extends JwtPayload {
  role: any;
}

// Admin middleware
export const adminMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  let token: string | any;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization?.split(' ')[1]; // Assuming Bearer token
  } else {
    token = req.headers.authorization;
  }

  if (!token) {
    return next(new AppError('No token provided', 403)); // Pass error to next() instead of sending a response directly
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as CustomJwtPayload;

    console.log(decoded);

    if (decoded.role !== 'admin') {
      return next(new AppError('Forbidden', 403)); // Pass error to next() instead of sending a response directly
    }

    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    if (err instanceof Error) {
      return next(new AppError('Invalid or expired token', 401)); // Pass error to next() instead of sending a response directly
    }
    return next(new AppError('Internal server error', 500)); // Pass error to next() instead of sending a response directly
  }
};
