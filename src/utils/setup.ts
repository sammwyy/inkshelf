import argon2 from 'argon2';
import crypto from 'crypto';
import { prisma } from '@/database';
import { logger } from './logger';

export async function ensureAdminExists() {
    try {
        const adminCount = await prisma.user.count({
            where: { role: 'ADMIN' },
        });

        if (adminCount === 0) {
            const email = 'admin@localhost.com';
            const username = 'admin';
            // Generate a password that satisfies common complexity requirements
            const randomString = crypto.randomBytes(4).toString('hex');
            const rawPassword = `Admin_${randomString}_!1`;
            const passwordHash = await argon2.hash(rawPassword);

            await prisma.user.create({
                data: {
                    email,
                    passwordHash,
                    role: 'ADMIN',
                    emailVerified: true,
                    profile: {
                        create: {
                            username,
                        },
                    },
                    preferences: {
                        create: {},
                    },
                },
            });

            const separator = '='.repeat(50);
            const title = 'ADMIN ACCOUNT CREATED';
            const padding = ' '.repeat((50 - title.length) / 2);

            console.log('\n' + separator);
            console.log(padding + title + padding);
            console.log(separator);
            console.log(`  Email:    ${email}`);
            console.log(`  Username: ${username}`);
            console.log(`  Password: ${rawPassword}`);
            console.log(separator);
            console.log('  PLEASE SAVE THIS PASSWORD SECURELY!\n');
        }
    } catch (error) {
        logger.error('Error ensuring admin exists:', error);
    }
}


