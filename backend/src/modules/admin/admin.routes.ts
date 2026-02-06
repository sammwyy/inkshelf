import { Router } from 'express';
import { AdminController } from './admin.controller';
import { authenticate, requireAdmin } from '@/middlewares/auth.middleware';

const router = Router();
const adminController = new AdminController();

router.use(authenticate, requireAdmin);

router.get('/stats', adminController.getDashboardStats);

export default router;
