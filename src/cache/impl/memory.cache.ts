import { ICacheService } from '../cache.interface';

interface CacheEntry<T> {
    value: T;
    expiresAt: number | null;
}

export class MemoryCacheService implements ICacheService {
    private cache = new Map<string, CacheEntry<any>>();

    async get<T>(key: string): Promise<T | null> {
        const entry = this.cache.get(key);
        if (!entry) return null;

        if (entry.expiresAt && entry.expiresAt < Date.now()) {
            this.cache.delete(key);
            return null;
        }

        return entry.value;
    }

    async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
        const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
        this.cache.set(key, { value, expiresAt });
    }

    async delete(key: string): Promise<void> {
        this.cache.delete(key);
    }

    async deletePattern(pattern: string): Promise<void> {
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                this.cache.delete(key);
            }
        }
    }

    async clear(): Promise<void> {
        this.cache.clear();
    }
}


