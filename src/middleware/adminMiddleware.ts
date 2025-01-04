// src/middleware/adminMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv'
dotenv.config()

// Type for the decoded JWT payload
interface CustomJwtPayload extends JwtPayload {
  role: any;
}

// Admin middleware

export const adminMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  let token : string | any



  if(   req.headers.authorization &&    req.headers.authorization.startsWith('Bearer')){
    token = req.headers.authorization?.split(' ')[1]; // Assuming Bearer token

  }else{
    token = req.headers.authorization;
  }
   
  if (!token) {
    res.status(403).json({ message: 'No token provided' });
    return; // Ensure we exit the function after sending the response
  }

  try {
    const decoded = jwt.verify(token,process.env.JWT_SECRET as string) as CustomJwtPayload;

    console.log(decoded)
    
    if (decoded.role !== 'admin') {
      res.status(403).json({ message: 'Forbidden' });
      return; // Ensure we exit the function after sending the response
    }

    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    if (err instanceof Error) {
      res.status(401).json({ message: 'Invalid or expired token', error: err.message });
      return; // Ensure we exit the function after sending the response
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};
