import { prisma } from '@/database';
import { NotFoundError } from '@/utils/errors';
import type { CreateRatingDto } from './ratings.schema';

export class RatingsService {
    async rateSeries(profileId: string, seriesId: string, data: CreateRatingDto) {
        // Verify series exists
        const series = await prisma.series.findFirst({
            where: { id: seriesId, deletedAt: null },
        });

        if (!series) {
            throw new NotFoundError('Series not found');
        }

        // Upsert rating
        const rating = await prisma.rating.upsert({
            where: {
                profileId_seriesId: {
                    profileId,
                    seriesId,
                },
            },
            update: {
                rating: data.rating,
            },
            create: {
                profileId,
                seriesId,
                rating: data.rating,
            },
        });

        // Recalculate series average rating
        await this.updateSeriesRating(seriesId);

        return rating;
    }

    async getUserRating(profileId: string, seriesId: string) {
        return prisma.rating.findUnique({
            where: {
                profileId_seriesId: {
                    profileId,
                    seriesId,
                },
            },
        });
    }

    async deleteRating(profileId: string, seriesId: string) {
        await prisma.rating.delete({
            where: {
                profileId_seriesId: {
                    profileId,
                    seriesId,
                },
            },
        });

        await this.updateSeriesRating(seriesId);
    }

    private async updateSeriesRating(seriesId: string) {
        const result = await prisma.rating.aggregate({
            where: { seriesId },
            _avg: {
                rating: true,
            },
            _count: {
                rating: true,
            },
        });

        await prisma.series.update({
            where: { id: seriesId },
            data: {
                rating: result._avg.rating || 0,
                ratingCount: result._count.rating,
            },
        });
    }
}


