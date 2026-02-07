import { Response } from 'express';
import { SeriesService } from './series.service';
import { StorageService } from '@/services/storage/storage.service';
import { ApiResponse } from '@/utils/response';
import { asyncHandler } from '@/utils/asyncHandler';
import { AuthRequest } from '@/middlewares/auth.middleware';

export class SeriesController {
    private seriesService: SeriesService;
    private storageService: StorageService;

    constructor() {
        this.seriesService = new SeriesService();
        this.storageService = new StorageService();
    }

    createSeries = asyncHandler(async (req: AuthRequest, res: Response) => {
        let series = await this.seriesService.createSeries(req.body);

        if (req.file) {
            const coverPath = `series/${series.id}/thumbnail.jpg`;
            const coverUrl = await this.storageService.upload(req.file.buffer, coverPath, req.file.mimetype);
            series = await this.seriesService.updateSeries(series.id, { coverImage: coverUrl });
        }

        return ApiResponse.created(res, series);
    });

    getSeries = asyncHandler(async (req: AuthRequest, res: Response) => {
        const result = await this.seriesService.getSeries(req.query as any);
        return ApiResponse.paginated(res, result.data, result.pagination);
    });

    getSeriesById = asyncHandler(async (req: AuthRequest, res: Response) => {
        const series = await this.seriesService.getSeriesById(req.params.id);
        return ApiResponse.success(res, series);
    });

    getSeriesBySlug = asyncHandler(async (req: AuthRequest, res: Response) => {
        const series = await this.seriesService.getSeriesBySlug(req.params.slug);
        return ApiResponse.success(res, series);
    });

    updateSeries = asyncHandler(async (req: AuthRequest, res: Response) => {
        let data = req.body;

        if (req.file) {
            const coverPath = `series/${req.params.id}/thumbnail.jpg`;
            const coverUrl = await this.storageService.upload(req.file.buffer, coverPath, req.file.mimetype);
            data = { ...data, coverImage: coverUrl };
        }

        const series = await this.seriesService.updateSeries(req.params.id, data);
        return ApiResponse.success(res, series);
    });

    deleteSeries = asyncHandler(async (req: AuthRequest, res: Response) => {
        await this.seriesService.deleteSeries(req.params.id);
        return ApiResponse.noContent(res);
    });
}