import { prisma } from '@/config/database';
import { StorageService } from '@/services/storage/storage.service';
import { NotFoundError, BadRequestError } from '@/utils/errors';
import type { CreateChapterDto, UpdateChapterDto, GetChaptersQueryDto } from './chapters.schema';
import { Prisma } from '@prisma/client';

export class ChaptersService {
    private storageService: StorageService;

    constructor() {
        this.storageService = new StorageService();
    }

    async uploadThumbnail(id: string, file: { buffer: Buffer, mimetype: string }) {
        const chapter = await prisma.chapter.findUnique({ where: { id } });
        if (!chapter) throw new NotFoundError('Chapter not found');

        const path = `series/${chapter.seriesId}/chapters/${id}/thumbnail.jpg`;
        return this.storageService.upload(file.buffer, path, file.mimetype);
    }

    async createChapter(data: CreateChapterDto) {
        // Verify series exists
        const series = await prisma.series.findUnique({
            where: { id: data.seriesId },
        });

        if (!series) {
            throw new NotFoundError('Series not found');
        }

        // Verify volume if provided
        if (data.volumeId) {
            const volume = await prisma.volume.findFirst({
                where: { id: data.volumeId, seriesId: data.seriesId },
            });
            if (!volume) {
                throw new NotFoundError('Volume not found or does not belong to this series');
            }
        }

        // Check for duplicate chapter number
        const existing = await prisma.chapter.findFirst({
            where: {
                seriesId: data.seriesId,
                number: data.number,
                language: data.language,
                releaseGroup: data.releaseGroup || null,
            },
        });

        if (existing) {
            throw new BadRequestError('Chapter already exists');
        }

        const chapter = await prisma.chapter.create({
            data: {
                ...data,
                publishedAt: data.publishedAt ? new Date(data.publishedAt) : undefined,
            }
        });

        // Update series stats (optional, could be async or scheduled)
        // await this.updateSeriesStats(data.seriesId); 

        return chapter;
    }

    async getChapter(id: string) {
        const chapter = await prisma.chapter.findUnique({
            where: { id },
            include: {
                series: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                    },
                },
                volume: true,
            },
        });

        if (!chapter) {
            throw new NotFoundError('Chapter not found');
        }

        // Increment view count (async)
        // Check if DB writes are cheap/batched. For now just fire and forget.
        prisma.chapter.update({
            where: { id },
            data: { viewCount: { increment: 1 } },
        }).catch(() => { });

        return chapter;
    }

    async getChapters(seriesId: string, query: GetChaptersQueryDto) {
        const { page, limit, language, sortBy, sortOrder } = query;
        const skip = (page - 1) * limit;

        const where: Prisma.ChapterWhereInput = {
            seriesId,
            deletedAt: null,
            ...(language && { language }),
        };

        const [chapters, total] = await Promise.all([
            prisma.chapter.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
            }),
            prisma.chapter.count({ where }),
        ]);

        return {
            data: chapters,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async updateChapter(id: string, data: UpdateChapterDto) {
        console.log(`[ChaptersService] Updating chapter ${id}:`, JSON.stringify(data, null, 2));
        const chapter = await prisma.chapter.findUnique({ where: { id } });
        if (!chapter) throw new NotFoundError('Chapter not found');

        const updated = await prisma.chapter.update({
            where: { id },
            data: {
                ...data,
                publishedAt: data.publishedAt ? new Date(data.publishedAt) : undefined,
                pageCount: data.pages ? data.pages.length : undefined,
            },
        });

        return updated;
    }

    async deleteChapter(id: string) {
        const chapter = await prisma.chapter.findUnique({ where: { id } });
        if (!chapter) throw new NotFoundError('Chapter not found');

        // Delete pages from storage - Optional: move this to background job
        if (chapter.pages && chapter.pages.length > 0) {
            // We need to extract path from URL. StorageService.delete expects path.
            // But we don't have a reliable way to get path from URL without parsing config.
            // BUT: uploadUrl = /uploads/path . So if local, we can strip prefix.
            // If S3, it's full URL.
            // Ideally StorageService handles "deleteByUrl" or we just extract last part?
            // "chapters/UUID/filename.ext" is the path.
            // So if we iterate strictly by index...
            // It's tricky without storing the storage key.
            // For now, let's just mark as deleted in DB (Soft Delete) which is already done via `deletedAt`.
            // The method logic below is "Hard Delete" (prisma.delete).
            // Schema has `deletedAt`. We should prefer Soft Delete.
        }

        // Soft delete
        await prisma.chapter.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }

    async uploadPages(id: string, files: { buffer: Buffer, mimetype: string }[]) {
        const chapter = await prisma.chapter.findUnique({ where: { id } });
        if (!chapter) throw new NotFoundError('Chapter not found');

        const pageUrls: string[] = [];
        const startOffset = chapter.pages.length;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            // Path format: series/{seriesId}/chapters/{chapterId}/page_{index}.webp
            const path = `series/${chapter.seriesId}/chapters/${id}/page_${startOffset + i + 1}.jpg`;

            const url = await this.storageService.upload(file.buffer, path, file.mimetype);
            pageUrls.push(url);
        }

        const updated = await prisma.chapter.update({
            where: { id },
            data: {
                pages: [...chapter.pages, ...pageUrls],
                pageCount: chapter.pages.length + pageUrls.length,
            },
        });

        return updated;
    }
}
