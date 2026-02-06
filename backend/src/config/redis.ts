import { createClient } from 'redis';

import { config } from './index';
import { logger } from '@/utils/logger';

export const redisClient = createClient({
    socket: {
        host: config.redis.host,
        port: config.redis.port,
    },
    password: config.redis.password,
});

redisClient.on('error', (err) => {
    logger.error('Redis Client Error', err);
});

redisClient.on('connect', () => {
    logger.info('Redis connected');
});

redisClient.on('ready', () => {
    logger.info('Redis ready');
});

export async function connectRedis() {
    if (!redisClient.isOpen) {
        await redisClient.connect();
    }
}

export async function disconnectRedis() {
    if (redisClient.isOpen) {
        await redisClient.quit();
    }
}