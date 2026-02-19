import { Router } from 'express';

import { SettingsController } from './settings.controller';
import { validate } from '@/middlewares/validation.middleware';
import { authenticate, requireAdmin } from '@/middlewares/auth.middleware';
import { updateSettingSchema } from './settings.schema';

const router = Router();
const settingsController = new SettingsController();

// Public endpoint to get all settings
router.get('/', settingsController.getAll);

// Admin only endpoint to get private settings
router.get('/private', authenticate, requireAdmin, settingsController.getPrivate);

// Admin only endpoint to update settings (public)
router.patch('/', authenticate, requireAdmin, validate(updateSettingSchema), settingsController.update);

// Admin only endpoint to update private settings
router.patch('/private', authenticate, requireAdmin, validate(updateSettingSchema), settingsController.updatePrivate);

export default router;


