import { Request, Response, NextFunction } from 'express';
import { AppError, BadRequestError } from '@/utils/errors';
import { logger } from '@/utils/logger';
import { config } from '@/config/index';
import { Prisma } from '@prisma/client';

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Log error
    logger.error('Error occurred', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
    });

    // Operational errors (known errors)
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            error: {
                message: err.message,
                code: err.code,
                ...(err instanceof BadRequestError && { errors: err.errors }),
            },
        });
    }

    // Prisma errors
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
            return res.status(409).json({
                success: false,
                error: {
                    message: 'Resource already exists',
                    code: 'CONFLICT',
                },
            });
        }
        if (err.code === 'P2025') {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'Resource not found',
                    code: 'NOT_FOUND',
                },
            });
        }
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            error: {
                message: 'Invalid token',
                code: 'UNAUTHORIZED',
            },
        });
    }

    // Default to 500 server error
    const statusCode = 500;
    const message = config.env === 'production'
        ? 'Internal server error'
        : err.message;

    return res.status(statusCode).json({
        success: false,
        error: {
            message,
            code: 'INTERNAL_SERVER_ERROR',
            ...(config.env !== 'production' && { stack: err.stack }),
        },
    });
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response) => {
    return res.status(404).json({
        success: false,
        error: {
            message: `Route ${req.method} ${req.path} not found`,
            code: 'NOT_FOUND',
        },
    });
};