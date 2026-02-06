import { Router } from 'express';
import { ProgressController } from './progress.controller';
import { authenticate } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validation.middleware';
import { progressRateLimiter } from '@/middlewares/ratelimit.middleware';
import { updateProgressSchema } from './progress.schema';

const router = Router();
const progressController = new ProgressController();

router.use(authenticate); // All routes require authentication

router.get('/continue-reading', progressController.getContinueReading);
router.get('/history', progressController.getReadingHistory);
router.get('/', progressController.getUserProgress);
router.put('/:chapterId', progressRateLimiter, validate(updateProgressSchema), progressController.updateProgress);
router.delete('/:chapterId', progressController.deleteProgress);
router.delete('/', progressController.clearAllProgress);

export default router;