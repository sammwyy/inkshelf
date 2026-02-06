import { Response } from 'express';
import { FavoritesService } from './favorites.service';
import { ApiResponse } from '@/utils/response';
import { asyncHandler } from '@/utils/asyncHandler';
import { AuthRequest } from '@/middlewares/auth.middleware';

export class FavoritesController {
    private favoritesService: FavoritesService;

    constructor() {
        this.favoritesService = new FavoritesService();
    }

    addToFavorites = asyncHandler(async (req: AuthRequest, res: Response) => {
        const favorite = await this.favoritesService.addToFavorites(
            req.user!.profileId!,
            req.body.seriesId
        );
        return ApiResponse.created(res, favorite);
    });

    removeFromFavorites = asyncHandler(async (req: AuthRequest, res: Response) => {
        await this.favoritesService.removeFromFavorites(
            req.user!.profileId!,
            req.params.seriesId
        );
        return ApiResponse.noContent(res);
    });

    getUserFavorites = asyncHandler(async (req: AuthRequest, res: Response) => {
        const result = await this.favoritesService.getUserFavorites(
            req.user!.profileId!,
            Number(req.query.page) || 1,
            Number(req.query.limit) || 20
        );
        return ApiResponse.paginated(res, result.data, result.pagination);
    });
}
