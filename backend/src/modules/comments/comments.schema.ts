import { z } from 'zod';

export const createCommentSchema = z.object({
    content: z.string().min(1, 'Comment cannot be empty').max(2000, 'Comment too long'),
    parentId: z.string().uuid().optional(),
});

export const updateCommentSchema = z.object({
    content: z.string().min(1, 'Comment cannot be empty').max(2000, 'Comment too long'),
});

export type CreateCommentDto = z.infer<typeof createCommentSchema>;
export type UpdateCommentDto = z.infer<typeof updateCommentSchema>;