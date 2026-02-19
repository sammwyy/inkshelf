import { Response } from 'express';
import { PreferencesService } from './preferences.service';
import { ApiResponse } from '@/utils/response';
import { asyncHandler } from '@/utils/asyncHandler';
import { AuthRequest } from '@/middlewares/auth.middleware';

export class PreferencesController {
    get = asyncHandler(async (req: AuthRequest, res: Response) => {
        const preferences = await PreferencesService.getPreferences(req.user!.userId);
        return ApiResponse.success(res, preferences);
    });

    update = asyncHandler(async (req: AuthRequest, res: Response) => {
        const preferences = await PreferencesService.updatePreferences(req.user!.userId, req.body);
        return ApiResponse.success(res, preferences);
    });
}


