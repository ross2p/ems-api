import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { DEFAULT_TTL } from './cache.constants';

@Injectable()
export class CacheService {
  private readonly DEFAULT_TTL = DEFAULT_TTL;

  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async getOrSet<T>(
    key: string,
    fn: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    const cached = await this.get<T>(key);

    if (cached !== undefined && cached !== null) {
      return cached;
    }

    const result = await fn();
    await this.set(key, result, ttl ?? this.DEFAULT_TTL);

    return result;
  }

  async get<T>(key: string): Promise<T | undefined> {
    return this.cacheManager.get<T>(key);
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl ?? this.DEFAULT_TTL);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }
}
