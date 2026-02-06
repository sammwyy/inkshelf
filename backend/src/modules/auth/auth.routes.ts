import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validate } from '@/middlewares/validation.middleware';
import { authRateLimiter } from '@/middlewares/ratelimit.middleware';
import { authenticate } from '@/middlewares/auth.middleware';
import {
    signupSchema,
    loginSchema,
    refreshTokenSchema,
    requestPasswordResetSchema,
    resetPasswordSchema,
    verifyEmailSchema,
} from './auth.schema';

import { checkSignupMode } from '@/middlewares/settings.middleware';

const router = Router();
const authController = new AuthController();

router.post('/signup', authRateLimiter, checkSignupMode, validate(signupSchema), authController.signup);
router.post('/login', authRateLimiter, validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshTokenSchema), authController.refresh);
router.post('/logout', authController.logout);
router.post('/password-reset/request', authRateLimiter, validate(requestPasswordResetSchema), authController.requestPasswordReset);
router.post('/password-reset/confirm', authRateLimiter, validate(resetPasswordSchema), authController.resetPassword);
router.get('/me', authenticate, authController.me);

// Email verification
router.post('/verify-email/request', authenticate, authRateLimiter, authController.requestEmailVerification);
router.post('/verify-email/confirm', authenticate, authRateLimiter, validate(verifyEmailSchema), authController.verifyEmail);

export default router;
