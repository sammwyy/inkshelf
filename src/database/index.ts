import { PrismaClient } from '@prisma/client';
import { logger } from '@/utils/logger';

const prismaClientSingleton = () => {
    return new PrismaClient({
        log: [
            { level: 'query', emit: 'event' },
            { level: 'error', emit: 'event' },
            { level: 'warn', emit: 'event' },
        ],
    });
};

declare global {
    var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
    globalThis.prismaGlobal = prisma;
}

// Logging
// @ts-ignore
prisma.$on('query', (e: any) => {
    if (process.env.NODE_ENV === 'development') {
        logger.debug('Query', { query: e.query, params: e.params, duration: e.duration });
    }
});

// @ts-ignore
prisma.$on('error', (e: any) => {
    logger.error('Database error', { message: e.message, target: e.target });
});


