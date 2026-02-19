import { IDatabaseProvider } from '../database.interface';

export class SQLiteProvider implements IDatabaseProvider {
    type = 'sqlite' as const;

    getArrayFilter(field: string, values: string[], mode: 'hasSome' | 'hasEvery'): any {
        if (!values || values.length === 0) return {};

        // SQLite: We use LIKE/contains on the JSON string.
        // This is not perfect but works for simple contains checks.
        return {
            OR: values.map(val => ({
                [field]: { contains: val }
            }))
        };
    }

    getSearchFilter(fields: string[], search: string): any {
        return {
            OR: fields.map(field => ({
                [field]: { contains: search }
            }))
        };
    }

    parseArray<T>(value: any): T[] {
        if (!value) return [];
        if (Array.isArray(value)) return value;
        try {
            return JSON.parse(value);
        } catch {
            return [];
        }
    }

    stringifyArray(value: any[]): any {
        return JSON.stringify(value || []);
    }
}
