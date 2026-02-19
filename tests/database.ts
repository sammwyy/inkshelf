import { PrismaClient } from '@prisma/client';

export const prismaTest = new PrismaClient();

export const teardown = async () => {
    await prismaTest.$disconnect();
};
