import { prisma } from '@/config/database';
import { NotFoundError, BadRequestError } from '@/utils/errors';
import { Prisma, Role } from '@prisma/client';
import * as argon2 from 'argon2';
import type { UpdateUserDto, BanUserDto, GetUsersQueryDto, CreateUserDto } from './users.schema';

export class UsersService {
    async getUsers(query: GetUsersQueryDto) {
        const { page, limit, search, role, isBanned, sortBy, sortOrder } = query;
        const skip = (page - 1) * limit;

        const where: Prisma.UserWhereInput = {
            deletedAt: null,
            ...(role && { role }),
            ...(isBanned !== undefined && { bannedAt: isBanned ? { not: null } : null }),
            ...(search && {
                OR: [
                    { email: { contains: search, mode: 'insensitive' } },
                    { profile: { username: { contains: search, mode: 'insensitive' } } },
                ],
            }),
        };

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: {
                    profile: {
                        select: {
                            username: true,
                            avatar: true,
                        },
                    },
                },
            }),
            prisma.user.count({ where }),
        ]);

        return {
            data: users,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getUserById(id: string) {
        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                profile: true,
            },
        });

        if (!user) {
            throw new NotFoundError('User not found');
        }

        return user;
    }

    async createUser(data: CreateUserDto) {
        const existingEmail = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (existingEmail) {
            throw new BadRequestError('Email already in use');
        }

        const existingUsername = await prisma.userProfile.findUnique({
            where: { username: data.username },
        });

        if (existingUsername) {
            throw new BadRequestError('Username already in use');
        }

        const passwordHash = await argon2.hash(data.password);

        const user = await prisma.user.create({
            data: {
                email: data.email,
                passwordHash,
                role: data.role,
                profile: {
                    create: {
                        username: data.username,
                    },
                },
            },
            include: {
                profile: true,
            },
        });

        return user;
    }

    async updateUser(id: string, data: UpdateUserDto) {
        const user = await prisma.user.findUnique({ where: { id }, include: { profile: true } });
        if (!user) throw new NotFoundError('User not found');

        const updateData: Prisma.UserUpdateInput = {};

        if (data.email && data.email !== user.email) {
            const existing = await prisma.user.findUnique({ where: { email: data.email } });
            if (existing) throw new BadRequestError('Email already in use');
            updateData.email = data.email;
        }

        if (data.password) {
            updateData.passwordHash = await argon2.hash(data.password);
        }

        if (data.role) updateData.role = data.role;
        if (data.emailVerified !== undefined) updateData.emailVerified = data.emailVerified;
        if (data.isActive !== undefined) updateData.isActive = data.isActive;

        // Perform updates
        // If username changes, we need to update profile
        let updatedProfile = undefined;
        if (data.username && user.profile && data.username !== user.profile.username) {
            const existing = await prisma.userProfile.findUnique({ where: { username: data.username } });
            if (existing) throw new BadRequestError('Username already in use');

            updatedProfile = await prisma.userProfile.update({
                where: { userId: id },
                data: { username: data.username }
            });
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: updateData,
            include: { profile: true },
        });

        return updatedUser;
    }

    async banUser(id: string, data: BanUserDto) {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) throw new NotFoundError('User not found');

        if (user.role === Role.ADMIN) {
            throw new BadRequestError('Cannot ban an admin');
        }

        const updated = await prisma.user.update({
            where: { id },
            data: {
                bannedAt: new Date(),
                banReason: data.reason,
                isActive: false,
            },
        });

        // Revoke all tokens?
        await prisma.refreshToken.deleteMany({ where: { userId: id } });

        return updated;
    }

    async unbanUser(id: string) {
        const updated = await prisma.user.update({
            where: { id },
            data: {
                bannedAt: null,
                banReason: null,
                isActive: true,
            },
        });
        return updated;
    }
}
