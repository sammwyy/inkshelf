import { Router } from 'express';
import { SeriesController } from './series.controller';
import { authenticate, requireAdmin } from '@/middlewares/auth.middleware';
import { validate, validateQuery } from '@/middlewares/validation.middleware';
import { upload } from '@/middlewares/upload.middleware';
import { createSeriesSchema, updateSeriesSchema, getSeriesQuerySchema } from './series.schema';
import ratingsRoutes from '@/modules/ratings/ratings.routes';


const router = Router();
const seriesController = new SeriesController();

// Nested routes
router.use('/:seriesId/ratings', ratingsRoutes);

// Public routes
router.get('/', validateQuery(getSeriesQuerySchema), seriesController.getSeries);
router.get('/:id', seriesController.getSeriesById);
router.get('/slug/:slug', seriesController.getSeriesBySlug);

// Admin routes
router.post('/', authenticate, requireAdmin, upload.single('thumbnail'), validate(createSeriesSchema), seriesController.createSeries);
router.patch('/:id', authenticate, requireAdmin, upload.single('thumbnail'), validate(updateSeriesSchema), seriesController.updateSeries);
router.delete('/:id', authenticate, requireAdmin, seriesController.deleteSeries);

export default router;


