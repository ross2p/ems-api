import { Test, TestingModule } from '@nestjs/testing';
import { CacheService } from './cache.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { CategoryService } from '../category/category.service';
import { DEFAULT_TTL } from './cache.constants';

describe('CacheService', () => {
  const mockedKey = 'test-key';
  const mockedValue = 'test-value';

  let service: CacheService;
  let mockCacheManager: DeepMocked<Cache>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        {
          provide: CACHE_MANAGER,
          useValue: createMock<Cache>(),
        },
      ],
    }).compile();

    service = module.get<CacheService>(CacheService);
    mockCacheManager = module.get(CACHE_MANAGER);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('get', () => {
    it('should return cached value', async () => {
      mockCacheManager.get.mockResolvedValue(mockedValue);

      const result = await service.get(mockedKey);

      expect(mockCacheManager.get).toHaveBeenCalledWith(mockedKey);
      expect(result).toBe(mockedValue);
    });
  });

  describe('set', () => {
    it('should set cache with default ttl', async () => {
      await service.set(mockedKey, mockedValue);

      expect(mockCacheManager.set).toHaveBeenCalledWith(
        mockedKey,
        mockedValue,
        DEFAULT_TTL,
      );
    });

    it('should set cache with custom ttl', async () => {
      const ttl = 1000;

      await service.set(mockedKey, mockedValue, ttl);

      expect(mockCacheManager.set).toHaveBeenCalledWith(
        mockedKey,
        mockedValue,
        ttl,
      );
    });
  });

  describe('del', () => {
    it('should delete from cache', async () => {
      await service.del(mockedKey);

      expect(mockCacheManager.del).toHaveBeenCalledWith(mockedKey);
    });
  });

  describe('getOrSet', () => {
    it('should return cached value if exists', async () => {
      const cachedValue = 'cached-value';
      mockCacheManager.get.mockResolvedValue(cachedValue);
      const fn = jest.fn();

      const result = await service.getOrSet(mockedKey, fn);

      expect(mockCacheManager.get).toHaveBeenCalledWith(mockedKey);
      expect(fn).not.toHaveBeenCalled();
      expect(result).toBe(cachedValue);
    });

    it('should execute function and set cache if value does not exist', async () => {
      const newValue = 'new-value';
      mockCacheManager.get.mockResolvedValue(undefined);
      const fn = jest.fn().mockResolvedValue(newValue);

      const result = await service.getOrSet(mockedKey, fn);

      expect(mockCacheManager.get).toHaveBeenCalledWith(mockedKey);
      expect(fn).toHaveBeenCalled();
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        mockedKey,
        newValue,
        DEFAULT_TTL,
      );
      expect(result).toBe(newValue);
    });
  });
});
