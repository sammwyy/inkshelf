export interface IDatabaseProvider {
    type: 'postgresql' | 'sqlite';
    getArrayFilter(field: string, values: string[], mode: 'hasSome' | 'hasEvery'): any;
    getSearchFilter(fields: string[], search: string): any;

    // Data transformation
    parseArray<T>(value: any): T[];
    stringifyArray(value: any[]): any;
}
