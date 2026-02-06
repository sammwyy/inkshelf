import { prisma } from '@/config/database';
import { redisClient } from '@/config/redis';
import { NotFoundError } from '@/utils/errors';
import type { UpdateProgressDto } from './progress.schema';

export class ProgressService {
    async updateProgress(profileId: string, chapterId: string, data: UpdateProgressDto) {
        const chapter = await prisma.chapter.findFirst({
            where: { id: chapterId, deletedAt: null },
        });

        if (!chapter) {
            throw new NotFoundError('Chapter not found');
        }

        const totalPages = data.totalPages || chapter.pageCount;
        const isCompleted = data.isCompleted ?? (data.currentPage >= totalPages);

        const progress = await prisma.readingProgress.upsert({
            where: {
                profileId_chapterId: {
                    profileId,
                    chapterId,
                },
            },
            update: {
                currentPage: data.currentPage,
                totalPages,
                isCompleted,
            },
            create: {
                profileId,
                chapterId,
                currentPage: data.currentPage,
                totalPages,
                isCompleted,
            },
        });

        // Add to reading history
        await prisma.readingHistory.create({
            data: {
                profileId,
                seriesId: chapter.seriesId,
                chapterId,
            },
        });

        // Invalidate cache
        await this.invalidateProgressCache(profileId);

        return progress;
    }

    async getProgress(profileId: string, chapterId: string) {
        const progress = await prisma.readingProgress.findUnique({
            where: {
                profileId_chapterId: {
                    profileId,
                    chapterId,
                },
            },
            include: {
                chapter: {
                    include: {
                        series: {
                            select: {
                                id: true,
                                title: true,
                                slug: true,
                                coverImage: true,
                            },
                        },
                    },
                },
            },
        });

        return progress;
    }

    async getUserProgress(profileId: string, page = 1, limit = 20) {
        const skip = (page - 1) * limit;

        // Try cache first
        const cacheKey = `progress:profile:${profileId}:${page}:${limit}`;
        const cached = await redisClient.get(cacheKey);

        if (cached) {
            return JSON.parse(cached);
        }

        const [progress, total] = await Promise.all([
            prisma.readingProgress.findMany({
                where: { profileId },
                skip,
                take: limit,
                orderBy: { updatedAt: 'desc' },
                include: {
                    chapter: {
                        include: {
                            series: {
                                select: {
                                    id: true,
                                    title: true,
                                    slug: true,
                                    coverImage: true,
                                },
                            },
                        },
                    },
                },
            }),
            prisma.readingProgress.count({ where: { profileId } }),
        ]);

        const result = {
            data: progress,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };

        // Cache for 5 minutes
        await redisClient.setEx(cacheKey, 300, JSON.stringify(result));

        return result;
    }

    async getContinueReading(profileId: string, limit = 10) {
        // Get user's most recent reading progress
        const cacheKey = `continue:profile:${profileId}`;
        const cached = await redisClient.get(cacheKey);

        if (cached) {
            return JSON.parse(cached);
        }

        const progress = await prisma.readingProgress.findMany({
            where: {
                profileId,
                isCompleted: false,
            },
            take: limit,
            orderBy: { updatedAt: 'desc' },
            include: {
                chapter: {
                    include: {
                        series: {
                            select: {
                                id: true,
                                title: true,
                                slug: true,
                                coverImage: true,
                            },
                        },
                    },
                },
            },
        });

        // Cache for 5 minutes
        await redisClient.setEx(cacheKey, 300, JSON.stringify(progress));

        return progress;
    }

    async getReadingHistory(profileId: string, page = 1, limit = 20) {
        const skip = (page - 1) * limit;

        const [history, total] = await Promise.all([
            prisma.readingHistory.findMany({
                where: { profileId },
                skip,
                take: limit,
                orderBy: { readAt: 'desc' },
                include: {
                    series: {
                        select: {
                            id: true,
                            title: true,
                            slug: true,
                            coverImage: true,
                        },
                    },
                    chapter: {
                        select: {
                            id: true,
                            number: true,
                            title: true,
                        },
                    },
                },
                distinct: ['seriesId'], // Show unique series
            }),
            prisma.readingHistory.count({ where: { profileId } }),
        ]);

        return {
            data: history,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async deleteProgress(profileId: string, chapterId: string) {
        await prisma.readingProgress.delete({
            where: {
                profileId_chapterId: {
                    profileId,
                    chapterId,
                },
            },
        });

        await this.invalidateProgressCache(profileId);
    }

    async clearAllProgress(profileId: string) {
        await prisma.readingProgress.deleteMany({
            where: { profileId },
        });

        await this.invalidateProgressCache(profileId);
    }

    private async invalidateProgressCache(profileId: string) {
        const keys = await redisClient.keys(`progress:profile:${profileId}:*`);
        keys.push(`continue:profile:${profileId}`);
        const validKeys = keys.filter(k => k);
        if (validKeys.length > 0) {
            await redisClient.del(validKeys);
        }
    }
}