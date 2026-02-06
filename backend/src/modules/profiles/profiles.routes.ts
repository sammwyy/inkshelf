import { Router } from 'express';
import { ProfilesController } from './profiles.controller';
import { authenticate } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validation.middleware';
import { updateProfileSchema } from './profiles.schema';

const router = Router();
const profilesController = new ProfilesController();

// Update self profile
router.patch('/me', authenticate, validate(updateProfileSchema), profilesController.updateMyProfile);

// Publicly accessible, but service handles privacy check
router.get('/:identifier', (req, res, next) => {
    // If token is provided, authenticate but don't fail if not
    const authHeader = req.headers.authorization;
    if (authHeader) {
        return authenticate(req as any, res, next);
    }
    next();
}, profilesController.getProfile);

export default router;
