import { Request, Response, NextFunction } from 'express';
import createUserSchema from '../utils/schemaUser';

export const validateUser = (req: Request, res: Response, next: NextFunction): void => {
    try {
        createUserSchema.parse(req.body);
        next();
    } catch (error: any) {
        res.status(400).json({ error: error.errors ?? error.message });
    }
};
