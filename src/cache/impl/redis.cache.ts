import { createClient } from 'redis';

import { ICacheService } from '../cache.interface';
import { logger } from '@/utils/logger';
import { config } from '@/config';

export class RedisCacheService implements ICacheService {
    async get<T>(key: string): Promise<T | null> {
        const value = await redisClient.get(key);
        if (!value) return null;
        try {
            return JSON.parse(value) as T;
        } catch {
            return value as any;
        }
    }

    async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        if (ttlSeconds) {
            await redisClient.set(key, stringValue, { EX: ttlSeconds });
        } else {
            await redisClient.set(key, stringValue);
        }
    }

    async delete(key: string): Promise<void> {
        await redisClient.del(key);
    }

    async deletePattern(pattern: string): Promise<void> {
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
            await redisClient.del(keys);
        }
    }

    async clear(): Promise<void> {
        await redisClient.flushDb();
    }
}


export const redisClient = createClient({
    socket: {
        host: config.redis.host,
        port: config.redis.port,
    },
    password: config.redis.password,
});

redisClient.on('error', (err: Error) => {
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


