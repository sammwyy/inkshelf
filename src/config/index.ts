import path from 'path';

import { validateEnv } from './env';

const env = validateEnv();

export const config = {
    env: env.NODE_ENV,
    port: env.PORT,
    appPath: env.APP_PATH,

    database: {
        type: env.DATABASE_TYPE,
        url: (env.DATABASE_TYPE === 'sqlite'
            ? (env.DATABASE_URL || `file:${path.resolve(env.APP_PATH, 'data.db')}`)
            : env.DATABASE_URL) as string,
    },

    cache: {
        type: env.CACHE_TYPE,
    },

    redis: {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
        password: env.REDIS_PASSWORD,
    },

    jwt: {
        accessSecret: env.JWT_ACCESS_SECRET,
        refreshSecret: env.JWT_REFRESH_SECRET,
        accessExpiresIn: env.JWT_ACCESS_EXPIRES_IN,
        refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
    },

    security: {
        bcryptRounds: env.BCRYPT_ROUNDS,
        rateLimit: {
            windowMs: env.RATE_LIMIT_WINDOW_MS,
            maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
        },
    },

    storage: {
        type: env.STORAGE_TYPE,
        local: {
            path: path.join(env.APP_PATH, 'content'),
        },
        s3: {
            bucket: env.STORAGE_S3_BUCKET,
            region: env.STORAGE_S3_REGION,
            accessKey: env.STORAGE_S3_ACCESS_KEY,
            secretKey: env.STORAGE_S3_SECRET_KEY,
            endpoint: env.STORAGE_S3_ENDPOINT,
        },
    },

    cors: {
        origin: env.CORS_ORIGIN,
    },

    app: {
        maxRequestSize: env.MAX_REQUEST_SIZE,
        cookieSecure: env.COOKIE_SECURE,
        cookieDomain: env.COOKIE_DOMAIN,
    },
} as const;


