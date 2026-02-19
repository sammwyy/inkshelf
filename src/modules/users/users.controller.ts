import { Response } from 'express';
import { UsersService } from './users.service';
import { ApiResponse } from '@/utils/response';
import { asyncHandler } from '@/utils/asyncHandler';
import { AuthRequest } from '@/middlewares/auth.middleware';

export class UsersController {
    private usersService: UsersService;

    constructor() {
        this.usersService = new UsersService();
    }

    getUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
        const result = await this.usersService.getUsers(req.query as any);
        return ApiResponse.paginated(res, result.data, result.pagination);
    });

    getUserById = asyncHandler(async (req: AuthRequest, res: Response) => {
        const user = await this.usersService.getUserById(req.params.id);
        return ApiResponse.success(res, user);
    });

    createUser = asyncHandler(async (req: AuthRequest, res: Response) => {
        const user = await this.usersService.createUser(req.body);
        return ApiResponse.created(res, user);
    });

    updateUser = asyncHandler(async (req: AuthRequest, res: Response) => {
        const user = await this.usersService.updateUser(req.params.id, req.body);
        return ApiResponse.success(res, user);
    });

    banUser = asyncHandler(async (req: AuthRequest, res: Response) => {
        const user = await this.usersService.banUser(req.params.id, req.body);
        return ApiResponse.success(res, user);
    });

    unbanUser = asyncHandler(async (req: AuthRequest, res: Response) => {
        const user = await this.usersService.unbanUser(req.params.id);
        return ApiResponse.success(res, user);
    });
}


