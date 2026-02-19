import type { Request, Response, NextFunction } from 'express';

import { Role } from '@/database/enums';
import jwt from 'jsonwebtoken';

import { config } from '@/config/index';
import { UnauthorizedError, ForbiddenError } from '@/utils/errors';

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        role: Role;
        profileId?: string;
    };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedError('No token provided');
        }

        const token = authHeader.substring(7);

        const decoded = jwt.verify(token, config.jwt.accessSecret) as {
            userId: string;
            role: Role;
            profileId?: string;
        };

        req.user = {
            userId: decoded.userId,
            role: decoded.role,
            profileId: decoded.profileId,
        };

        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            next(new UnauthorizedError('Invalid token'));
        } else if (error instanceof jwt.TokenExpiredError) {
            next(new UnauthorizedError('Token expired'));
        } else {
            next(error);
        }
    }
};

export const requireRole = (...roles: Role[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new UnauthorizedError());
        }

        if (!roles.includes(req.user.role)) {
            return next(new ForbiddenError('Insufficient permissions'));
        }

        next();
    };
};

export const requireAdmin = requireRole(Role.ADMIN);


