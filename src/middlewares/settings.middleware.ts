import { Response, NextFunction } from 'express';
import { SettingsService } from '@/modules/settings/settings.service';
import { ForbiddenError, UnauthorizedError } from '@/utils/errors';
import { AuthRequest, authenticate } from './auth.middleware';

/**
 * Middleware to check if signup is allowed based on system settings
 */
export const checkSignupMode = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const signupMode = await SettingsService.getSetting('app_signup_mode');

    if (signupMode !== 'allow') {
        return next(new ForbiddenError('Signups are currently disabled or restricted'));
    }

    // Note: 'invitation' mode would require additional logic (e.g. checking an invite code in req.body)
    // For now, if it's not 'none', we proceed. 'allow' is fully public.
    next();
};

/**
 * Middleware to restrict anonymous access based on system settings
 */
export const checkAnonymousAccess = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const allowAnonymous = await SettingsService.getSetting('app_allow_anonymous_view');

    if (allowAnonymous) {
        return next();
    }

    // If anonymous access is NOT allowed, we must ensure the user is authenticated.
    // We try to call the authenticate middleware logic.
    // However, some routes might still need to be public (login, signup, health, etc.)
    // These should be handled by not applying this middleware or using a whitelist.

    const publicPaths = [
        '/api/v1/auth/login',
        '/api/v1/auth/signup',
        '/api/v1/auth/refresh',
        '/api/v1/auth/password-reset',
        '/api/v1/health',
        '/api/v1/settings'
    ];

    const isPublic = publicPaths.some(path => req.originalUrl.startsWith(path));

    if (isPublic) {
        return next();
    }

    // Use existing authenticate middleware
    return authenticate(req, res, next);
};


