import { z } from 'zod';

import { SeriesStatus } from '@/database/enums';

export const createSeriesSchema = z.object({
    title: z.string().min(1, 'Title is required').max(255),
    alternativeTitles: z.array(z.string()).optional().default([]),
    description: z.string().min(1, 'Description is required'),
    author: z.string().min(1, 'Author is required'),
    artist: z.string().optional(),
    status: z.nativeEnum(SeriesStatus).default(SeriesStatus.ONGOING),
    tags: z.preprocess((val) => Array.isArray(val) ? val : [val], z.array(z.string())).optional().default([]),
    year: z.coerce.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
    coverImage: z.string().url().optional(),
});

export const updateSeriesSchema = createSeriesSchema.partial();

export const getSeriesQuerySchema = z.object({
    page: z.preprocess((val) => val === '' ? undefined : val, z.coerce.number().int().min(1).default(1)),
    limit: z.preprocess((val) => val === '' ? undefined : val, z.coerce.number().int().min(1).max(100).default(20)),
    status: z.preprocess((val) => val === '' ? undefined : val, z.nativeEnum(SeriesStatus).optional()),
    tags: z.string().optional().transform(val => val ? val.split(',') : undefined),
    search: z.string().optional(),
    sortBy: z.enum(['createdAt', 'updatedAt', 'rating', 'viewCount', 'title']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateSeriesDto = z.infer<typeof createSeriesSchema>;
export type UpdateSeriesDto = z.infer<typeof updateSeriesSchema>;
export type GetSeriesQueryDto = z.infer<typeof getSeriesQuerySchema>;


