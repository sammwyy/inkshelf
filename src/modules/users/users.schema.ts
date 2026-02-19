import { z } from 'zod';

import { Role } from '@/database/enums';

export const updateUserSchema = z.object({
    username: z.string().min(3).max(30).optional(),
    email: z.string().email().optional(),
    password: z.string().min(8).optional(),
    role: z.nativeEnum(Role).optional(),
    emailVerified: z.boolean().optional(),
    isActive: z.boolean().optional(),
});

export const banUserSchema = z.object({
    reason: z.string().min(1).max(255),
});

export const getUsersQuerySchema = z.object({
    page: z.preprocess((val) => val === '' ? undefined : val, z.coerce.number().int().min(1).default(1)),
    limit: z.preprocess((val) => val === '' ? undefined : val, z.coerce.number().int().min(1).max(100).default(20)),
    search: z.string().optional(),
    role: z.nativeEnum(Role).optional(),
    isBanned: z.string().transform(val => val === 'true').optional(),
    sortBy: z.enum(['createdAt', 'username', 'email']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const createUserSchema = z.object({
    username: z.string().min(3).max(30),
    email: z.string().email(),
    password: z.string().min(8),
    role: z.nativeEnum(Role).default(Role.USER),
});

export type UpdateUserDto = z.infer<typeof updateUserSchema>;
export type BanUserDto = z.infer<typeof banUserSchema>;
export type GetUsersQueryDto = z.infer<typeof getUsersQuerySchema>;
export type CreateUserDto = z.infer<typeof createUserSchema>;


