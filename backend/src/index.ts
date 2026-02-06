import "dotenv/config";

import app from './app';
import { config } from '@/config/index';
import { prisma } from '@/config/database';
import { connectRedis, disconnectRedis, redisClient } from '@/config/redis';
import { logger } from '@/utils/logger';

async function startServer() {
    try {
        // Connect to Redis
        await connectRedis();
        logger.info('Redis connected successfully');

        // Test database connection
        await prisma.$connect();
        logger.info('Database connected successfully');

        // Ensure admin exists
        const { ensureAdminExists } = await import('@/utils/setup');
        await ensureAdminExists();

        // Start server
        const server = app.listen(config.port, () => {
            logger.info(`Server running on port ${config.port} in ${config.env} mode`);
        });

        // Graceful shutdown
        const gracefulShutdown = async (signal: string) => {
            logger.info(`${signal} received, starting graceful shutdown`);

            server.close(async () => {
                logger.info('HTTP server closed');

                try {
                    await disconnectRedis();
                    logger.info('Redis disconnected');

                    await prisma.$disconnect();
                    logger.info('Database disconnected');

                    logger.info('Graceful shutdown completed');
                    process.exit(0);
                } catch (error) {
                    logger.error('Error during graceful shutdown', error);
                    process.exit(1);
                }
            });

            // Force shutdown after timeout
            setTimeout(() => {
                logger.error('Forced shutdown due to timeout');
                process.exit(1);
            }, 10000);
        };

        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

        // Handle uncaught errors
        process.on('uncaughtException', (error) => {
            logger.error('Uncaught Exception', error);
            gracefulShutdown('uncaughtException');
        });

        process.on('unhandledRejection', (reason, promise) => {
            logger.error('Unhandled Rejection at:', { promise, reason });
            gracefulShutdown('unhandledRejection');
        });

    } catch (error) {
        logger.error('Failed to start server', error);
        process.exit(1);
    }
}

startServer();