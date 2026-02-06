import { z } from 'zod';

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().transform(Number).default('3000'),

    // Database
    DATABASE_URL: z.string().url(),

    // Redis
    REDIS_HOST: z.string().default('localhost'),
    REDIS_PORT: z.string().transform(Number).default('6379'),
    REDIS_PASSWORD: z.string().optional(),

    // JWT
    JWT_ACCESS_SECRET: z.string().min(32),
    JWT_REFRESH_SECRET: z.string().min(32),
    JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
    JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

    // Security
    BCRYPT_ROUNDS: z.string().transform(Number).default('10'),
    RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'),
    RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),

    // Storage
    STORAGE_TYPE: z.enum(['local', 's3']).default('local'),
    STORAGE_LOCAL_PATH: z.string().default('./uploads'),
    STORAGE_S3_BUCKET: z.string().optional(),
    STORAGE_S3_REGION: z.string().optional(),
    STORAGE_S3_ACCESS_KEY: z.string().optional(),
    STORAGE_S3_SECRET_KEY: z.string().optional(),
    STORAGE_S3_ENDPOINT: z.string().optional(),

    // CORS
    CORS_ORIGIN: z.string().default('http://localhost:5173'),

    // App
    MAX_REQUEST_SIZE: z.string().default('10mb'),
    COOKIE_SECURE: z.string().transform(val => val === 'true').default('false'),
    COOKIE_DOMAIN: z.string().default('localhost'),

    // Feature Flags
    FEATURE_COMMENTS_ENABLED: z.string().transform(val => val === 'true').default('true'),
    FEATURE_RATINGS_ENABLED: z.string().transform(val => val === 'true').default('true'),
    FEATURE_PUBLIC_LISTS_ENABLED: z.string().transform(val => val === 'true').default('true'),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(): Env {
    try {
        return envSchema.parse(process.env);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const missingVars = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
            throw new Error(`Environment validation failed:\n${missingVars.join('\n')}`);
        }
        throw error;
    }
}
