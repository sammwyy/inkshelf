import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

import { BadRequestError } from '@/utils/errors';

export const validate = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errors = error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message,
                }));
                next(new BadRequestError('Validation failed', errors));
            } else {
                next(error);
            }
        }
    };
};

export const validateQuery = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            req.query = schema.parse(req.query);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errors = error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message,
                }));

                if (process.env.NODE_ENV == "development") {
                    console.log(errors);
                }

                next(new BadRequestError('Query validation failed', errors));
            } else {
                next(error);
            }
        }
    };
};