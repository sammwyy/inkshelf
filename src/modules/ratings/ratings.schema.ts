import { z } from 'zod';

export const createRatingSchema = z.object({
    rating: z.number().int().min(1).max(10),
});

export type CreateRatingDto = z.infer<typeof createRatingSchema>;


