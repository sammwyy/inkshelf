import { Response } from 'express';
import { AdminService } from './admin.service';
import { ApiResponse } from '@/utils/response';
import { asyncHandler } from '@/utils/asyncHandler';
import { AuthRequest } from '@/middlewares/auth.middleware';

export class AdminController {
    private adminService: AdminService;

    constructor() {
        this.adminService = new AdminService();
    }

    getDashboardStats = asyncHandler(async (req: AuthRequest, res: Response) => {
        const stats = await this.adminService.getDashboardStats();
        return ApiResponse.success(res, stats);
    });
}


