import { Router } from 'express';
import { CommentsController } from './comments.controller';
import { authenticate, requireAdmin } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validation.middleware';
import { createCommentSchema, updateCommentSchema } from './comments.schema';

const router = Router({ mergeParams: true }); // Enable access to parent params (chapterId)
const commentsController = new CommentsController();


router.get('/', commentsController.getChapterComments);

// Protected routes
router.post('/', authenticate, validate(createCommentSchema), commentsController.createComment);
router.patch('/:id', authenticate, validate(updateCommentSchema), commentsController.updateComment);
router.delete('/:id', authenticate, commentsController.deleteComment);

export default router;


