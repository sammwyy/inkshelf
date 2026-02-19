import { IDatabaseProvider } from '../database.interface';

export class PostgreSQLProvider implements IDatabaseProvider {
    type = 'postgresql' as const;

    getArrayFilter(field: string, values: string[], mode: 'hasSome' | 'hasEvery'): any {
        return { [field]: { [mode]: values } };
    }

    getSearchFilter(fields: string[], search: string): any {
        return {
            OR: fields.map(field => ({
                [field]: { contains: search, mode: 'insensitive' }
            }))
        };
    }

    parseArray<T>(value: any): T[] {
        return Array.isArray(value) ? value : [];
    }

    stringifyArray(value: any[]): any {
        return value;
    }
}
