import { Response } from 'express';
import { ProfilesService } from './profiles.service';
import { ApiResponse } from '@/utils/response';
import { asyncHandler } from '@/utils/asyncHandler';
import { AuthRequest } from '@/middlewares/auth.middleware';

export class ProfilesController {
    getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
        const { identifier } = req.params;
        const requesterId = req.user?.userId;

        let profile;
        if (identifier.startsWith('@')) {
            const username = identifier.substring(1);
            profile = await ProfilesService.getProfileByUsername(username, requesterId);
        } else {
            profile = await ProfilesService.getProfileById(identifier, requesterId);
        }

        return ApiResponse.success(res, profile);
    });

    updateMyProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
        const profile = await ProfilesService.updateProfile(
            req.user!.userId,
            req.body
        );
        return ApiResponse.success(res, profile);
    });
}


