import { Response } from 'express';
import { CommentsService } from './comments.service';
import { ApiResponse } from '@/utils/response';
import { asyncHandler } from '@/utils/asyncHandler';
import { AuthRequest } from '@/middlewares/auth.middleware';

export class CommentsController {
    private commentsService: CommentsService;

    constructor() {
        this.commentsService = new CommentsService();
    }

    createComment = asyncHandler(async (req: AuthRequest, res: Response) => {
        const comment = await this.commentsService.createComment(
            req.user!.profileId!,
            req.params.chapterId,
            req.body
        );
        return ApiResponse.created(res, comment);
    });

    getChapterComments = asyncHandler(async (req: AuthRequest, res: Response) => {
        const result = await this.commentsService.getChapterComments(
            req.params.chapterId,
            Number(req.query.page) || 1,
            Number(req.query.limit) || 20
        );
        return ApiResponse.paginated(res, result.data, result.pagination);
    });

    updateComment = asyncHandler(async (req: AuthRequest, res: Response) => {
        const comment = await this.commentsService.updateComment(
            req.params.id,
            req.user!.profileId!,
            req.body
        );
        return ApiResponse.success(res, comment);
    });

    deleteComment = asyncHandler(async (req: AuthRequest, res: Response) => {
        await this.commentsService.deleteComment(
            req.params.id,
            req.user!.profileId!,
            req.user!.role === 'ADMIN'
        );
        return ApiResponse.noContent(res);
    });
}
