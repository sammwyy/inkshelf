import slugify from 'slugify';
import { prisma } from '@/config/database';
import { redisClient } from '@/config/redis';
import { NotFoundError } from '@/utils/errors';
import type { CreateSeriesDto, UpdateSeriesDto, GetSeriesQueryDto } from './series.schema';
import { Prisma } from '@prisma/client';

export class SeriesService {
    async createSeries(data: CreateSeriesDto) {
        const slug = this.generateUniqueSlug(data.title);

        const series = await prisma.series.create({
            data: {
                ...data,
                slug,
            },
            include: {
                _count: {
                    select: {
                        chapters: true,
                        favorites: true,
                    },
                },
            },
        });

        // Invalidate cache
        await this.invalidateSeriesCache();

        return series;
    }

    async getSeries(query: GetSeriesQueryDto) {
        const { page, limit, status, tags, search, sortBy, sortOrder } = query;
        const skip = (page - 1) * limit;

        // Build where clause
        const where: Prisma.SeriesWhereInput = {
            isPublished: true,
            deletedAt: null,
            ...(status && { status }),
            ...(tags && tags.length > 0 && { tags: { hasSome: tags } }),
            ...(search && {
                OR: [
                    { title: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                    { author: { contains: search, mode: 'insensitive' } },
                    { alternativeTitles: { hasSome: [search] } },
                ],
            }),
        };

        // Try to get from cache for common queries
        const cacheKey = this.buildCacheKey('series:list', query);
        const cached = await redisClient.get(cacheKey);

        if (cached) {
            return JSON.parse(cached);
        }

        const [series, total] = await Promise.all([
            prisma.series.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: {
                    _count: {
                        select: {
                            chapters: true,
                            favorites: true,
                        },
                    },
                },
            }),
            prisma.series.count({ where }),
        ]);

        const result = {
            data: series,
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

    async getSeriesById(id: string) {
        const cacheKey = `series:${id}`;
        const cached = await redisClient.get(cacheKey);

        if (cached) {
            return JSON.parse(cached);
        }

        const series = await prisma.series.findFirst({
            where: { id, deletedAt: null },
            include: {
                volumes: {
                    where: { deletedAt: null },
                    orderBy: { number: 'asc' },
                    include: {
                        _count: {
                            select: { chapters: true },
                        },
                    },
                },
                chapters: {
                    where: { deletedAt: null, isPublished: true },
                    orderBy: { number: 'asc' },
                    select: {
                        id: true,
                        number: true,
                        title: true,
                        language: true,
                        publishedAt: true,
                        pageCount: true,
                    },
                    take: 10, // Latest 10 chapters
                },
                _count: {
                    select: {
                        chapters: true,
                        favorites: true,
                    },
                },
            },
        });

        if (!series) {
            throw new NotFoundError('Series not found');
        }

        // Increment view count asynchronously
        prisma.series.update({
            where: { id },
            data: { viewCount: { increment: 1 } },
        }).catch(() => { }); // Don't block on failure

        // Cache for 10 minutes
        await redisClient.setEx(cacheKey, 600, JSON.stringify(series));

        return series;
    }

    async getSeriesBySlug(slug: string) {
        const series = await prisma.series.findFirst({
            where: { slug, deletedAt: null },
        });

        if (!series) {
            throw new NotFoundError('Series not found');
        }

        return this.getSeriesById(series.id);
    }

    async updateSeries(id: string, data: UpdateSeriesDto) {
        const series = await prisma.series.update({
            where: { id },
            data: {
                ...data,
                ...(data.title && { slug: this.generateUniqueSlug(data.title) }),
            },
            include: {
                _count: {
                    select: {
                        chapters: true,
                        favorites: true,
                    },
                },
            },
        });

        // Invalidate cache
        await this.invalidateSeriesCache(id);

        return series;
    }

    async deleteSeries(id: string) {
        await prisma.series.update({
            where: { id },
            data: { deletedAt: new Date() },
        });

        // Invalidate cache
        await this.invalidateSeriesCache(id);
    }



    private generateUniqueSlug(title: string): string {
        const baseSlug = slugify(title, { lower: true, strict: true });
        const timestamp = Date.now().toString(36);
        return `${baseSlug}-${timestamp}`;
    }

    private buildCacheKey(prefix: string, params: any): string {
        return `${prefix}:${JSON.stringify(params)}`;
    }

    private async invalidateSeriesCache(seriesId?: string) {
        const keys = await redisClient.keys('series:list:*');
        if (keys.length > 0) {
            await redisClient.del(keys);
        }
        if (seriesId) {
            await redisClient.del(`series:${seriesId}`);
        }
    }
}
