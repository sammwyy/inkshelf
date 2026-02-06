import { z } from 'zod';

export const updateProgressSchema = z.object({
    currentPage: z.number().int().min(0),
    totalPages: z.number().int().min(1).optional(),
    isCompleted: z.boolean().optional(),
});

export const getProgressQuerySchema = z.object({
    page: z.preprocess((val) => val === '' ? undefined : val, z.coerce.number().int().min(1).default(1)),
    limit: z.preprocess((val) => val === '' ? undefined : val, z.coerce.number().int().min(1).max(100).default(20)),
});

export type UpdateProgressDto = z.infer<typeof updateProgressSchema>;
export type GetProgressQueryDto = z.infer<typeof getProgressQuerySchema>;