import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

import { config } from '@/config/index';
import { prisma } from '@/config/database';
import { redisClient } from '@/config/redis';
import { UnauthorizedError, ConflictError, NotFoundError, ForbiddenError } from '@/utils/errors';
import type { SignupDto, LoginDto, VerifyEmailDto } from './auth.schema';

export class AuthService {
    async signup(data: SignupDto) {
        const existingEmail = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (existingEmail) {
            throw new ConflictError('Email already exists');
        }

        const existingUsername = await prisma.userProfile.findUnique({
            where: { username: data.username },
        });

        if (existingUsername) {
            throw new ConflictError('Username already exists');
        }

        const passwordHash = await argon2.hash(data.password);

        const user = await prisma.user.create({
            data: {
                email: data.email,
                passwordHash,
                profile: {
                    create: {
                        username: data.username,
                    },
                },
                preferences: {
                    create: {},
                },
            },
            select: {
                id: true,
                email: true,
                role: true,
                emailVerified: true,
                emailVerificationSentAt: true,
                createdAt: true,
                profile: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
            },
        });

        const tokens = await this.generateTokens(user.id, user.role, user.profile?.id);

        return {
            user: {
                id: user.id,
                email: user.email,
                username: user.profile?.username,
                role: user.role,
                emailVerified: user.emailVerified,
                emailVerificationSentAt: user.emailVerificationSentAt,
                createdAt: user.createdAt,
                profile: user.profile,
            },
            tokens
        };
    }

    async login(data: LoginDto) {
        const user = await prisma.user.findUnique({
            where: { email: data.email },
            include: {
                profile: {
                    select: {
                        id: true,
                        username: true,
                    }
                }
            },
        });

        if (!user || !user.isActive) {
            throw new UnauthorizedError('Invalid credentials');
        }

        const isPasswordValid = await argon2.verify(user.passwordHash, data.password);

        if (!isPasswordValid) {
            throw new UnauthorizedError('Invalid credentials');
        }

        const tokens = await this.generateTokens(user.id, user.role, user.profile?.id);

        return {
            user: {
                id: user.id,
                email: user.email,
                username: user.profile?.username,
                role: user.role,
                emailVerified: user.emailVerified,
                emailVerificationSentAt: user.emailVerificationSentAt,
                profileId: user.profile?.id,
            },
            tokens,
        };
    }

    async getCurrentUser(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                profile: {
                    select: {
                        id: true,
                        username: true,
                    }
                }
            },
        });

        if (!user || !user.isActive) {
            throw new NotFoundError('User not found');
        }

        return {
            id: user.id,
            email: user.email,
            username: user.profile?.username,
            role: user.role,
            emailVerified: user.emailVerified,
            emailVerificationSentAt: user.emailVerificationSentAt,
            profileId: user.profile?.id,
        };
    }

    async refreshToken(refreshToken: string) {
        try {
            const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as { userId: string; tokenId: string };

            const storedToken = await prisma.refreshToken.findUnique({
                where: { token: refreshToken },
            });

            if (!storedToken || storedToken.revokedAt) {
                throw new UnauthorizedError('Invalid refresh token');
            }

            if (storedToken.expiresAt < new Date()) {
                throw new UnauthorizedError('Refresh token expired');
            }

            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: { id: true, role: true, isActive: true, profile: { select: { id: true } } },
            });

            if (!user || !user.isActive) {
                throw new UnauthorizedError('User not found or inactive');
            }

            // Revoke old token and generate new ones (token rotation)
            await prisma.refreshToken.update({
                where: { id: storedToken.id },
                data: { revokedAt: new Date() },
            });

            const tokens = await this.generateTokens(user.id, user.role, user.profile?.id);

            return tokens;
        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                throw new UnauthorizedError('Invalid refresh token');
            }
            throw error;
        }
    }

    async logout(refreshToken: string) {
        await prisma.refreshToken.updateMany({
            where: { token: refreshToken },
            data: { revokedAt: new Date() },
        });
    }

    async requestPasswordReset(email: string) {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            // Don't reveal if user exists
            return;
        }

        const token = uuidv4();
        const expiresAt = new Date(Date.now() + 3600000); // 1 hour

        await prisma.passwordReset.create({
            data: {
                userId: user.id,
                token,
                expiresAt,
            },
        });

        // In production, send email here
        // await emailService.sendPasswordResetEmail(user.email, token);

        return token; // Only for development
    }

    async resetPassword(token: string, newPassword: string) {
        const resetToken = await prisma.passwordReset.findUnique({
            where: { token },
            include: { user: true },
        });

        if (!resetToken || resetToken.usedAt) {
            throw new UnauthorizedError('Invalid or expired reset token');
        }

        if (resetToken.expiresAt < new Date()) {
            throw new UnauthorizedError('Reset token expired');
        }

        const passwordHash = await argon2.hash(newPassword);

        await prisma.$transaction([
            prisma.user.update({
                where: { id: resetToken.userId },
                data: { passwordHash },
            }),
            prisma.passwordReset.update({
                where: { id: resetToken.id },
                data: { usedAt: new Date() },
            }),
            // Revoke all refresh tokens
            prisma.refreshToken.updateMany({
                where: { userId: resetToken.userId },
                data: { revokedAt: new Date() },
            }),
        ]);
    }

    async requestEmailVerification(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, emailVerified: true, emailVerificationSentAt: true },
        });

        if (!user) {
            throw new NotFoundError('User not found');
        }

        if (user.emailVerified) {
            throw new ConflictError('Email already verified');
        }

        // Check 1 minute cooldown
        if (user.emailVerificationSentAt) {
            const now = new Date();
            const diff = now.getTime() - user.emailVerificationSentAt.getTime();
            if (diff < 60000) {
                throw new ForbiddenError('Wait at least 1 minute before requesting another verification email');
            }
        }

        const code = this.generateRandomCode(6);
        await prisma.user.update({
            where: { id: userId },
            data: {
                emailVerificationCode: code,
                emailVerificationSentAt: new Date(),
            },
        });

        // In production, send email here
        return code; // Only for development
    }

    async verifyEmail(userId: string, data: VerifyEmailDto) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundError('User not found');
        }

        if (user.emailVerified) {
            throw new ConflictError('Email already verified');
        }

        const isDev = process.env.NODE_ENV === 'development';
        const isDefaultCode = isDev && data.code === '000000';

        if (!isDefaultCode) {
            if (!user.emailVerificationCode || user.emailVerificationCode !== data.code) {
                throw new UnauthorizedError('Invalid verification code');
            }

            // Check 1 day expiry
            if (user.emailVerificationSentAt) {
                const now = new Date();
                const diff = now.getTime() - user.emailVerificationSentAt.getTime();
                if (diff > 86400000) { // 24 hours
                    throw new UnauthorizedError('Verification code expired');
                }
            }
        }

        await prisma.user.update({
            where: { id: userId },
            data: {
                emailVerified: true,
                emailVerificationCode: null,
            },
        });
    }

    private generateRandomCode(length: number): string {
        const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    private async generateTokens(userId: string, role: string, profileId?: string) {
        const accessToken = jwt.sign(
            { userId, role, profileId },
            config.jwt.accessSecret,
            { expiresIn: config.jwt.accessExpiresIn as any }
        );

        const refreshTokenId = uuidv4();
        const refreshToken = jwt.sign(
            { userId, tokenId: refreshTokenId },
            config.jwt.refreshSecret,
            { expiresIn: config.jwt.refreshExpiresIn as any }
        );

        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        await prisma.refreshToken.create({
            data: {
                id: refreshTokenId,
                userId,
                token: refreshToken,
                expiresAt,
            },
        });

        // Cache access token in Redis for fast validation
        await redisClient.setEx(
            `session:${userId}`,
            900, // 15 minutes
            accessToken
        );

        return { accessToken, refreshToken };
    }
}
