import { config } from '@/config/index';
import { IDatabaseProvider } from './database.interface';
import { PostgreSQLProvider } from './impl/postgresql.provider';
import { SQLiteProvider } from './impl/sqlite.provider';

function createDatabaseProvider(): IDatabaseProvider {
    switch (config.database.type) {
        case 'postgresql':
            return new PostgreSQLProvider();
        case 'sqlite':
            return new SQLiteProvider();
        default:
            throw new Error(`Unsupported database type: ${config.database.type}`);
    }
}

export const dbProvider = createDatabaseProvider();
export * from './index'; // Re-export prisma


