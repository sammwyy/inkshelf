import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
import crypto from 'crypto';
import { validateEnv } from '../src/config/env';

enum Role {
    ADMIN = 'ADMIN',
    USER = 'USER'
}

validateEnv();

const prisma = new PrismaClient();

async function main() {
    console.log('\n🔒 Generating Admin User...\n');

    try {
        // Try to find an existing admin
        const existingAdmin = await prisma.user.findFirst({
            where: { role: Role.ADMIN }
        });

        const password = crypto.randomBytes(8).toString('hex');
        const passwordHash = await argon2.hash(password);

        if (existingAdmin) {
            // Update existing admin
            await prisma.user.update({
                where: { id: existingAdmin.id },
                data: { passwordHash }
            });

            console.log('✅ Admin password updated!');
            console.log(`📧 Email:    ${existingAdmin.email}`);
            console.log(`🔑 Password: ${password}`);
        } else {
            // Create new admin
            const email = 'admin@localhost.com';
            await prisma.user.create({
                data: {
                    email,
                    passwordHash,
                    role: Role.ADMIN,
                    isActive: true,
                    emailVerified: true // Auto verify admin
                }
            });

            console.log('✅ Admin user created!');
            console.log(`📧 Email:    ${email}`);
            console.log(`🔑 Password: ${password}`);
        }

    } catch (error) {
        console.error('❌ Error generating admin:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
