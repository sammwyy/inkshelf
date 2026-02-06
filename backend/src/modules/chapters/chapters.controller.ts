import { Response } from 'express';
import { ChaptersService } from './chapters.service';
import { ApiResponse } from '@/utils/response';
import { asyncHandler } from '@/utils/asyncHandler';
import { AuthRequest } from '@/middlewares/auth.middleware';

export class ChaptersController {
    private chaptersService: ChaptersService;

    constructor() {
        this.chaptersService = new ChaptersService();
    }

    createChapter = asyncHandler(async (req: AuthRequest, res: Response) => {
        const data = { ...req.body };
        if (req.params.seriesId && !data.seriesId) {
            data.seriesId = req.params.seriesId;
        }
        const chapter = await this.chaptersService.createChapter(data);

        if (req.file) {
            await this.chaptersService.uploadThumbnail(chapter.id, {
                buffer: req.file.buffer,
                mimetype: req.file.mimetype
            });
        }

        return ApiResponse.created(res, chapter);
    });


    getChapter = asyncHandler(async (req: AuthRequest, res: Response) => {
        const chapter = await this.chaptersService.getChapter(req.params.id);
        return ApiResponse.success(res, chapter);
    });

    getChapters = asyncHandler(async (req: AuthRequest, res: Response) => {
        const seriesId = req.params.seriesId || req.query.seriesId as string;
        if (!seriesId) {
            return ApiResponse.error(res, 'Series ID is required', 400);
        }

        const result = await this.chaptersService.getChapters(
            seriesId,
            req.query as any
        );
        return ApiResponse.paginated(res, result.data, result.pagination);
    });

    updateChapter = asyncHandler(async (req: AuthRequest, res: Response) => {
        const chapter = await this.chaptersService.updateChapter(req.params.id, req.body);

        if (req.file) {
            await this.chaptersService.uploadThumbnail(chapter.id, {
                buffer: req.file.buffer,
                mimetype: req.file.mimetype
            });
        }

        return ApiResponse.success(res, chapter);
    });

    deleteChapter = asyncHandler(async (req: AuthRequest, res: Response) => {
        await this.chaptersService.deleteChapter(req.params.id);
        return ApiResponse.noContent(res);
    });

    uploadPages = asyncHandler(async (req: AuthRequest, res: Response) => {
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
            return ApiResponse.error(res, 'No files uploaded', 400);
        }

        const files = (req.files as Express.Multer.File[]).map(file => ({
            buffer: file.buffer,
            mimetype: file.mimetype,
        }));

        const chapter = await this.chaptersService.uploadPages(req.params.id, files);
        return ApiResponse.success(res, chapter);
    });
}
