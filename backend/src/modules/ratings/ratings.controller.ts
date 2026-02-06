import { Response } from 'express';
import { RatingsService } from './ratings.service';
import { ApiResponse } from '@/utils/response';
import { asyncHandler } from '@/utils/asyncHandler';
import { AuthRequest } from '@/middlewares/auth.middleware';

export class RatingsController {
    private ratingsService: RatingsService;

    constructor() {
        this.ratingsService = new RatingsService();
    }

    rateSeries = asyncHandler(async (req: AuthRequest, res: Response) => {
        const rating = await this.ratingsService.rateSeries(
            req.user!.profileId!,
            req.params.seriesId,
            req.body
        );
        return ApiResponse.success(res, rating);
    });

    getUserRating = asyncHandler(async (req: AuthRequest, res: Response) => {
        const rating = await this.ratingsService.getUserRating(
            req.user!.profileId!,
            req.params.seriesId
        );
        return ApiResponse.success(res, rating);
    });

    deleteRating = asyncHandler(async (req: AuthRequest, res: Response) => {
        await this.ratingsService.deleteRating(
            req.user!.profileId!,
            req.params.seriesId
        );
        return ApiResponse.noContent(res);
    });
}
