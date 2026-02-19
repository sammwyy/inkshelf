import { Router } from 'express';
import { RatingsController } from './ratings.controller';
import { authenticate } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validation.middleware';
import { createRatingSchema } from './ratings.schema';

const router = Router({ mergeParams: true });
const ratingsController = new RatingsController();

router.use(authenticate);

router.get('/', ratingsController.getUserRating);
router.post('/', validate(createRatingSchema), ratingsController.rateSeries);
router.delete('/', ratingsController.deleteRating);

export default router;


