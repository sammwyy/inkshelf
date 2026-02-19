import { Response } from 'express';
import { ProgressService } from './progress.service';
import { ApiResponse } from '@/utils/response';
import { asyncHandler } from '@/utils/asyncHandler';
import { AuthRequest } from '@/middlewares/auth.middleware';

export class ProgressController {
    private progressService: ProgressService;

    constructor() {
        this.progressService = new ProgressService();
    }

    updateProgress = asyncHandler(async (req: AuthRequest, res: Response) => {
        const progress = await this.progressService.updateProgress(
            req.user!.profileId!,
            req.params.chapterId,
            req.body
        );
        return ApiResponse.success(res, progress);
    });

    getProgress = asyncHandler(async (req: AuthRequest, res: Response) => {
        const progress = await this.progressService.getProgress(
            req.user!.profileId!,
            req.params.chapterId
        );
        return ApiResponse.success(res, progress);
    });

    getUserProgress = asyncHandler(async (req: AuthRequest, res: Response) => {
        const result = await this.progressService.getUserProgress(
            req.user!.profileId!,
            Number(req.query.page) || 1,
            Number(req.query.limit) || 20
        );
        return ApiResponse.paginated(res, result.data, result.pagination);
    });

    getContinueReading = asyncHandler(async (req: AuthRequest, res: Response) => {
        const progress = await this.progressService.getContinueReading(
            req.user!.profileId!,
            Number(req.query.limit) || 10
        );
        return ApiResponse.success(res, progress);
    });

    getReadingHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
        const result = await this.progressService.getReadingHistory(
            req.user!.profileId!,
            Number(req.query.page) || 1,
            Number(req.query.limit) || 20
        );
        return ApiResponse.paginated(res, result.data, result.pagination);
    });

    deleteProgress = asyncHandler(async (req: AuthRequest, res: Response) => {
        await this.progressService.deleteProgress(
            req.user!.profileId!,
            req.params.chapterId
        );
        return ApiResponse.noContent(res);
    });

    clearAllProgress = asyncHandler(async (req: AuthRequest, res: Response) => {
        await this.progressService.clearAllProgress(req.user!.profileId!);
        return ApiResponse.noContent(res);
    });
}


