import { Router } from 'express';
import { ChaptersController } from './chapters.controller';
import { authenticate, requireAdmin } from '@/middlewares/auth.middleware';
import { validate, validateQuery } from '@/middlewares/validation.middleware';
import { upload } from '@/middlewares/upload.middleware';
import { createChapterSchema, updateChapterSchema, getChaptersQuerySchema } from './chapters.schema';
import commentsRoutes from '@/modules/comments/comments.routes';

const router = Router({ mergeParams: true });
const chaptersController = new ChaptersController();

// Public routes
router.get('/:id', chaptersController.getChapter);
router.get('/', validateQuery(getChaptersQuerySchema), chaptersController.getChapters);

// Series chapters
router.get('/series/:seriesId', validateQuery(getChaptersQuerySchema), chaptersController.getChapters);

// Protected routes
router.post('/series/:seriesId', authenticate, requireAdmin, upload.single('thumbnail'), validate(createChapterSchema), chaptersController.createChapter);

router.patch('/:id', authenticate, requireAdmin, upload.single('thumbnail'), validate(updateChapterSchema), chaptersController.updateChapter);
router.delete('/:id', authenticate, requireAdmin, chaptersController.deleteChapter);

// Upload pages
router.post('/:id/pages', authenticate, requireAdmin, upload.array('pages'), chaptersController.uploadPages);

// Nested routes
router.use('/:chapterId/comments', commentsRoutes);

export default router;



