import { Router } from 'express';
import { PreferencesController } from './preferences.controller';
import { authenticate } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validation.middleware';
import { updatePreferencesSchema } from './preferences.schema';

const router = Router();
const preferencesController = new PreferencesController();

router.use(authenticate);

router.get('/', preferencesController.get);
router.patch('/', validate(updatePreferencesSchema), preferencesController.update);

export default router;
