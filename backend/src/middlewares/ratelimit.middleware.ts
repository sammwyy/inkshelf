import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { connectRedis, redisClient } from '@/config/redis';
import { config } from '@/config/index';

export const createRateLimiter = (options?: {
    windowMs?: number;
    max?: number;
    prefix?: string;
    skip?: (req: any, res: any) => boolean;
}) => {
    return rateLimit({
        windowMs: options?.windowMs || config.security.rateLimit.windowMs,
        max: options?.max || config.security.rateLimit.maxRequests,
        standardHeaders: true,
        legacyHeaders: false,
        skip: options?.skip || (() => process.env.NODE_ENV === 'test'),
        store: new RedisStore({
            sendCommand: async (...args: string[]) => {
                if (!redisClient.isOpen) {
                    await connectRedis();
                }
                return redisClient.sendCommand(args);
            },
            prefix: options?.prefix || 'inkshelf_rl:',
        }),
        handler: (req, res) => {
            res.status(429).json({
                success: false,
                error: {
                    message: 'Too many requests, please try again later',
                    code: 'TOO_MANY_REQUESTS',
                },
            });
        },
    });
};

const isDev = process.env.NODE_ENV === 'development';

export const authRateLimiter = createRateLimiter({
    windowMs: isDev ? 0 : 1 * 60 * 1000, // 1 minute
    max: isDev ? 100 : 5, // 5 requests per window
    prefix: 'inkshelf_rl:auth:',
});

export const apiRateLimiter = createRateLimiter({
    skip: (req) => {
        // Skip progress updates, they have their own limiter
        return req.method === 'PUT' && req.originalUrl.includes('/progress/');
    }
});

export const progressRateLimiter = createRateLimiter({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 60, // 60 requests per window
    prefix: 'inkshelf_rl:progress:',
});