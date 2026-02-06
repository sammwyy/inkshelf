import { z } from 'zod';

export const updatePreferencesSchema = z.object({
    isProfilePublic: z.boolean().optional(),
    showFavorites: z.boolean().optional(),
    showRatings: z.boolean().optional(),
    showComments: z.boolean().optional(),
    showLists: z.boolean().optional(),
    showProgress: z.boolean().optional(),
});

export type UpdatePreferencesDto = z.infer<typeof updatePreferencesSchema>;
