import { z } from 'zod';

export const updateProfileSchema = z.object({
    username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/).optional(),
    bio: z.string().max(500).optional().nullable(),
    location: z.string().max(100).optional().nullable(),
    website: z.string().url().max(255).optional().nullable(),
});

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
