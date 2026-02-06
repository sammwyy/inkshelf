import { Router } from 'express';
import { FavoritesController } from './favorites.controller';
import { authenticate } from '@/middlewares/auth.middleware';

const router = Router();
const favoritesController = new FavoritesController();

router.use(authenticate);

router.get('/', favoritesController.getUserFavorites);
router.post('/', favoritesController.addToFavorites);
router.delete('/:seriesId', favoritesController.removeFromFavorites);

export default router;
