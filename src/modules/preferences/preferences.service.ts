import { prisma } from '@/database';
import { NotFoundError } from '@/utils/errors';

export class PreferencesService {
    static async getPreferences(userId: string) {
        const preferences = await prisma.userPreferences.findUnique({
            where: { userId },
        });

        if (!preferences) {
            throw new NotFoundError('Preferences not found');
        }

        return preferences;
    }

    static async updatePreferences(userId: string, data: any) {
        return await prisma.userPreferences.upsert({
            where: { userId },
            update: data,
            create: {
                userId,
                ...data,
            },
        });
    }
}


