import slugify from 'slugify';
import { prisma, dbProvider } from '@/database/provider';
import { cacheService } from '@/cache/index';
import { NotFoundError } from '@/utils/errors';
import type { CreateSeriesDto, UpdateSeriesDto, GetSeriesQueryDto } from './series.schema';
import { Prisma } from '@prisma/client';
import { SeriesStatus } from '@/database/enums';

export class SeriesService {
    async createSeries(data: CreateSeriesDto) {
        const slug = this.generateUniqueSlug(data.title);

        const series = await prisma.series.create({
            data: {
                ...this.prepareData(data),
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

        return this.formatSeries(series);
    }

    async getSeries(query: GetSeriesQueryDto) {
        const { page, limit, status, tags, search, sortBy, sortOrder } = query;
        const skip = (page - 1) * limit;

        // Build where clause
        const searchFields = ['title', 'description', 'author'];
        const where: any = {
            isPublished: true,
            deletedAt: null,
            ...(status && { status } as any),
            ...(tags && tags.length > 0 && dbProvider.getArrayFilter('tags', tags, 'hasSome')),
            ...(search && {
                OR: [
                    ...dbProvider.getSearchFilter(searchFields, search).OR,
                    dbProvider.getArrayFilter('alternativeTitles', [search], 'hasSome')
                ],
            }),
        };

        // Try to get from cache for common queries
        const cacheKey = this.buildCacheKey('series:list', query);
        const cached = await cacheService.get<any>(cacheKey);

        if (cached) {
            return cached;
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

        const formattedSeries = series.map(s => this.formatSeries(s));

        const result = {
            data: formattedSeries,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };

        // Cache for 5 minutes
        await cacheService.set(cacheKey, result, 300);

        return result;
    }

    async getSeriesById(id: string) {
        const cacheKey = `series:${id}`;
        const cached = await cacheService.get<any>(cacheKey);

        if (cached) {
            return cached;
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

        const formatted = this.formatSeries(series);

        // Increment view count asynchronously
        prisma.series.update({
            where: { id },
            data: { viewCount: { increment: 1 } },
        }).catch(() => { }); // Don't block on failure

        // Cache for 10 minutes
        await cacheService.set(cacheKey, formatted, 600);

        return formatted;
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
                ...this.prepareData(data),
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

        return this.formatSeries(series);
    }

    async deleteSeries(id: string) {
        await prisma.series.update({
            where: { id },
            data: { deletedAt: new Date() },
        });

        // Invalidate cache
        await this.invalidateSeriesCache(id);
    }



    private prepareData(data: any) {
        const prepared = { ...data };
        if (dbProvider.type === 'sqlite') {
            if (prepared.alternativeTitles !== undefined) {
                prepared.alternativeTitles = dbProvider.stringifyArray(prepared.alternativeTitles);
            }
            if (prepared.tags !== undefined) {
                prepared.tags = dbProvider.stringifyArray(prepared.tags);
            }
        }
        return prepared;
    }

    private formatSeries(series: any) {
        if (!series) return series;
        const formatted = { ...series };
        if (dbProvider.type === 'sqlite') {
            formatted.alternativeTitles = dbProvider.parseArray(formatted.alternativeTitles);
            formatted.tags = dbProvider.parseArray(formatted.tags);
        }
        return formatted;
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
        await cacheService.deletePattern('series:list:*');
        if (seriesId) {
            await cacheService.delete(`series:${seriesId}`);
        }
    }
}


