import { config } from '@/config/index';
import { ICacheService } from './cache.interface';
import { MemoryCacheService } from './impl/memory.cache';
import { RedisCacheService } from './impl/redis.cache';

let cacheService: ICacheService;

if (config.cache.type === 'redis') {
    cacheService = new RedisCacheService();
} else {
    cacheService = new MemoryCacheService();
}

export { cacheService };
export * from './cache.interface';


