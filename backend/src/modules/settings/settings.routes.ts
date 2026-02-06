import { Router } from 'express';

import { SettingsController } from './settings.controller';
import { validate } from '@/middlewares/validation.middleware';
import { authenticate, requireAdmin } from '@/middlewares/auth.middleware';
import { updateSettingSchema } from './settings.schema';

const router = Router();
const settingsController = new SettingsController();

// Public endpoint to get all settings
router.get('/', settingsController.getAll);

// Admin only endpoint to update settings
router.patch('/', authenticate, requireAdmin, validate(updateSettingSchema), settingsController.update);

export default router;
