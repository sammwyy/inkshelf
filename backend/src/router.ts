import { Router } from 'express';
import authRoutes from '@/modules/auth/auth.routes';
import seriesRoutes from '@/modules/series/series.routes';
import progressRoutes from '@/modules/progress/progress.routes';
import favoritesRoutes from '@/modules/favorites/favorites.routes';
import commentsRoutes from '@/modules/comments/comments.routes';
import chaptersRoutes from '@/modules/chapters/chapters.routes';

import settingsRoutes from '@/modules/settings/settings.routes';
import profilesRoutes from '@/modules/profiles/profiles.routes';
import preferencesRoutes from '@/modules/preferences/preferences.routes';
import adminRoutes from '@/modules/admin/admin.routes';
import usersRoutes from '@/modules/users/users.routes';

import { checkAnonymousAccess } from '@/middlewares/settings.middleware';

const router = Router();

// Apply global system settings checks
router.use(checkAnonymousAccess);

// Health check
router.get('/health', (req, res) => {
    res.json({
        success: true,
        data: {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        },
    });
});

// API routes
router.use('/auth', authRoutes);
router.use('/series', seriesRoutes);
router.use('/chapters', chaptersRoutes);
router.use('/progress', progressRoutes);
router.use('/favorites', favoritesRoutes);
router.use('/settings', settingsRoutes);
router.use('/profiles', profilesRoutes);
router.use('/me/preferences', preferencesRoutes);
router.use('/admin', adminRoutes);
router.use('/users', usersRoutes);

export default router;