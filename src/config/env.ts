import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

    // App
    APP_PATH: z.string().default('./data'),
    PORT: z.string().transform(Number).default('8642'),

    // Database
    DATABASE_TYPE: z.enum(['postgresql', 'sqlite']).default('sqlite'),
    DATABASE_URL: z.string().optional(),

    // Redis / Cache
    CACHE_TYPE: z.enum(['redis', 'memory']).default('memory'),
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

    // S3 (Only if type is s3)
    STORAGE_S3_BUCKET: z.string().optional(),
    STORAGE_S3_REGION: z.string().optional(),
    STORAGE_S3_ACCESS_KEY: z.string().optional(),
    STORAGE_S3_SECRET_KEY: z.string().optional(),
    STORAGE_S3_ENDPOINT: z.string().optional(),

    // CORS
    CORS_ORIGIN: z.string().default('*'),

    // App Limits
    MAX_REQUEST_SIZE: z.string().default('10mb'),
    COOKIE_SECURE: z.string().transform(val => val === 'true').default('true'),
    COOKIE_DOMAIN: z.string().default('localhost'),
}).superRefine((data, ctx) => {
    if (data.DATABASE_TYPE === 'postgresql' && !data.DATABASE_URL) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'DATABASE_URL is required when DATABASE_TYPE is postgresql',
            path: ['DATABASE_URL'],
        });
    }
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(): Env {
    const appPath = process.env.APP_PATH || './data';
    const secretsPath = path.join(appPath, 'secrets.env');
    const accessSecretPath = path.join(appPath, '.access_secret');
    const refreshSecretPath = path.join(appPath, '.refresh_secret');

    // Ensure directory exists
    if (!fs.existsSync(appPath)) {
        fs.mkdirSync(appPath, { recursive: true });
    }

    // Load secrets.env if exists
    const secretsExist = fs.existsSync(secretsPath);
    if (secretsExist) {
        dotenv.config({ path: secretsPath, override: true });
    }

    // Handle JWT secrets
    if (!fs.existsSync(accessSecretPath)) {
        const secret = crypto.randomBytes(32).toString('hex');
        fs.writeFileSync(accessSecretPath, secret);
    }
    process.env.JWT_ACCESS_SECRET = fs.readFileSync(accessSecretPath, 'utf-8').trim();

    if (!fs.existsSync(refreshSecretPath)) {
        const secret = crypto.randomBytes(32).toString('hex');
        fs.writeFileSync(refreshSecretPath, secret);
    }
    process.env.JWT_REFRESH_SECRET = fs.readFileSync(refreshSecretPath, 'utf-8').trim();

    try {
        const env = envSchema.parse(process.env);

        // Auto-set DATABASE_URL for SQLite if not provided
        if (env.DATABASE_TYPE === 'sqlite' && !process.env.DATABASE_URL) {
            process.env.DATABASE_URL = `file:${path.resolve(env.APP_PATH, 'data.db')}`;
        }

        // If secrets.env didn't exist, create it with sanitized defaults/values
        if (!secretsExist) {
            const lines = Object.entries(env).map(([key, value]) => `${key}=${value}`);
            fs.writeFileSync(secretsPath, lines.join('\n'));
        }

        return env;
    } catch (error) {
        if (error instanceof z.ZodError) {
            const missingVars = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
            throw new Error(`Environment validation failed:\n${missingVars.join('\n')}`);
        }
        throw error;
    }
}
