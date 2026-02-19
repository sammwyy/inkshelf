import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { config } from '@/config/index';
import { logger } from '@/utils/logger';

export async function setupDatabase() {
    const isSqlite = config.database.type === 'sqlite';
    const schemaFile = isSqlite ? 'schema.sqlite.prisma' : 'schema.postgresql.prisma';
    const schemaPath = path.resolve('prisma', schemaFile);

    if (!fs.existsSync(schemaPath)) {
        throw new Error(`Prisma schema not found at ${schemaPath}`);
    }

    logger.info(`Checking database schema for ${config.database.type}...`);
    try {
        // Ensure directory for SQLite exists
        if (config.database.type === 'sqlite' && config.database.url.startsWith('file:')) {
            const dbPath = config.database.url.replace('file:', '');
            const dbDir = path.dirname(dbPath);
            if (!fs.existsSync(dbDir)) {
                logger.info(`Creating database directory: ${dbDir}`);
                fs.mkdirSync(dbDir, { recursive: true });
            }
        }

        // Set dynamic environment variable for Prisma
        process.env.DATABASE_URL = config.database.url;

        // Generate client
        // We always try to generate if it's the first time or schema changed
        // But to avoid EPERM, we'll skip if node_modules/.prisma exists and we are not in a "reload"
        const clientPath = path.resolve('node_modules/.prisma/client');
        const lastSchemaVar = process.env.LAST_SCHEMA;

        if (!fs.existsSync(clientPath) || lastSchemaVar !== schemaFile) {
            logger.info('Generating Prisma client...');
            try {
                execSync(`bunx prisma generate --schema=${schemaPath}`, {
                    stdio: 'inherit',
                    env: { ...process.env, DATABASE_URL: config.database.url }
                });
                process.env.LAST_SCHEMA = schemaFile;
            } catch (err) {
                logger.warn('Prisma generate failed (potentially file lock), skipping if client exists');
                if (!fs.existsSync(clientPath)) {
                    throw err;
                }
            }
        }

        // Push schema to database
        if (process.env.NODE_ENV !== 'production') {
            logger.info('Pushing database schema (syncing tables)...');
            execSync(`bunx prisma db push --skip-generate --schema=${schemaPath}`, {
                stdio: 'inherit',
                env: { ...process.env, DATABASE_URL: config.database.url }
            });
        }

        logger.info('Database setup completed');
    } catch (error) {
        logger.error('Failed to setup database', error);
        throw error;
    }
}
