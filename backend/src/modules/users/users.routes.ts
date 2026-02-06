import { Router } from 'express';
import { UsersController } from './users.controller';
import { authenticate, requireAdmin } from '@/middlewares/auth.middleware';
import { validate, validateQuery } from '@/middlewares/validation.middleware';
import {
    updateUserSchema,
    banUserSchema,
    getUsersQuerySchema,
    createUserSchema
} from './users.schema';

const router = Router();
const usersController = new UsersController();

// Use authenticate and requireAdmin for all routes
router.use(authenticate, requireAdmin);

router.get('/', validateQuery(getUsersQuerySchema), usersController.getUsers);
router.post('/', validate(createUserSchema), usersController.createUser);
router.get('/:id', usersController.getUserById);
router.patch('/:id', validate(updateUserSchema), usersController.updateUser);
router.post('/:id/ban', validate(banUserSchema), usersController.banUser);
router.post('/:id/unban', usersController.unbanUser);

export default router;
