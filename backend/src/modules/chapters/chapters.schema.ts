import { z } from 'zod';
import { ChapterLanguage } from '@prisma/client';

export const createChapterSchema = z.object({
    seriesId: z.string().uuid(),
    volumeId: z.string().uuid().optional(),
    number: z.coerce.number().min(0),
    title: z.string().max(255).optional(),
    language: z.nativeEnum(ChapterLanguage).default(ChapterLanguage.EN),
    releaseGroup: z.string().max(100).optional(),
    publishedAt: z.string().datetime().optional(), // ISO date string
    isPublished: z.preprocess(val => val === 'true' || val === true, z.boolean()).default(true),
    pages: z.array(z.string()).optional(),
});

export const updateChapterSchema = createChapterSchema.partial().omit({ seriesId: true });

export const getChaptersQuerySchema = z.object({
    page: z.preprocess((val) => val === '' ? undefined : val, z.coerce.number().int().min(1).default(1)),
    limit: z.preprocess((val) => val === '' ? undefined : val, z.coerce.number().int().min(1).max(100).default(20)),
    language: z.preprocess((val) => val === '' ? undefined : val, z.nativeEnum(ChapterLanguage).optional()),
    sortBy: z.enum(['number', 'publishedAt', 'createdAt']).default('number'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateChapterDto = z.infer<typeof createChapterSchema>;
export type UpdateChapterDto = z.infer<typeof updateChapterSchema>;
export type GetChaptersQueryDto = z.infer<typeof getChaptersQuerySchema>;
