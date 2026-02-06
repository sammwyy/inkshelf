import { prisma } from '@/config/database';
import { NotFoundError, ForbiddenError, ConflictError } from '@/utils/errors';
import type { UpdateProfileDto } from './profiles.schema';
import { Prisma } from '@prisma/client';

export class ProfilesService {
    private static async fetchProfile(where: Prisma.UserProfileWhereUniqueInput, requesterId?: string) {
        const profile = await prisma.userProfile.findUnique({
            where,
            include: {
                user: {
                    select: {
                        createdAt: true,
                        preferences: true,
                    },
                },
                favorites: {
                    include: { series: true },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
                ratings: {
                    include: { series: true },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
                comments: {
                    include: { chapter: { include: { series: true } } },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
                lists: {
                    where: { isPublic: true },
                    include: { items: { include: { series: true } } },
                    take: 5,
                },
                readingProgress: {
                    include: { chapter: { include: { series: true } } },
                    orderBy: { updatedAt: 'desc' },
                    take: 10,
                },
            },
        });

        if (!profile) {
            throw new NotFoundError('Profile not found');
        }

        const { user } = profile;
        const { preferences } = user;

        const isOwner = requesterId === profile.userId;

        // Privacy check
        if (!isOwner && preferences && !preferences.isProfilePublic) {
            throw new ForbiddenError('This profile is private');
        }

        // Filter results based on preferences
        return {
            id: profile.id,
            userId: profile.userId,
            username: profile.username,
            bio: profile.bio,
            avatar: profile.avatar,
            location: profile.location,
            website: profile.website,
            createdAt: profile.createdAt,
            favorites: (isOwner || (preferences?.showFavorites)) ? profile.favorites : [],
            ratings: (isOwner || (preferences?.showRatings)) ? profile.ratings : [],
            comments: (isOwner || (preferences?.showComments)) ? profile.comments : [],
            lists: (isOwner || (preferences?.showLists)) ? profile.lists : [],
            readingProgress: (isOwner || (preferences?.showProgress)) ? profile.readingProgress : [],
        };
    }

    static async getProfileById(id: string, requesterId?: string) {
        return this.fetchProfile({ id }, requesterId);
    }

    static async getProfileByUsername(username: string, requesterId?: string) {
        return this.fetchProfile({ username }, requesterId);
    }

    static async updateProfile(userId: string, data: UpdateProfileDto) {
        const profile = await prisma.userProfile.findUnique({
            where: { userId },
        });

        if (!profile) {
            throw new NotFoundError('Profile not found');
        }

        // If username is being updated, check for conflicts
        if (data.username && data.username !== profile.username) {
            const existingUsername = await prisma.userProfile.findFirst({
                where: {
                    username: {
                        equals: data.username,
                        mode: 'insensitive'
                    },
                    NOT: { userId }
                },
            });

            if (existingUsername) {
                throw new ConflictError('Username already taken');
            }
        }

        return await prisma.userProfile.update({
            where: { userId },
            data,
        });
    }
}
