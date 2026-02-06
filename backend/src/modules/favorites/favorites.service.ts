import { prisma } from '@/config/database';
import { ConflictError } from '@/utils/errors';
import { Prisma } from '@prisma/client';

export class FavoritesService {
    async addToFavorites(profileId: string, seriesId: string) {
        try {
            const favorite = await prisma.favorite.create({
                data: {
                    profileId,
                    seriesId,
                },
            });

            return favorite;
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new ConflictError('Series already in favorites');
            }
            throw error;
        }
    }

    async removeFromFavorites(profileId: string, seriesId: string) {
        await prisma.favorite.delete({
            where: {
                profileId_seriesId: {
                    profileId,
                    seriesId,
                },
            },
        });
    }

    async getUserFavorites(profileId: string, page = 1, limit = 20) {
        const skip = (page - 1) * limit;

        const [favorites, total] = await Promise.all([
            prisma.favorite.findMany({
                where: { profileId },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    series: {
                        include: {
                            _count: {
                                select: {
                                    chapters: true,
                                    favorites: true,
                                },
                            },
                        },
                    },
                },
            }),
            prisma.favorite.count({ where: { profileId } }),
        ]);

        return {
            data: favorites.map(f => f.series),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
}
