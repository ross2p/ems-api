import { Test, TestingModule } from '@nestjs/testing';
import { EventRecommendationController } from './event-recommendation.controller';
import { EventRecommendationService } from './event-recommendation.service';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { CacheService } from '../../cache/cache.service';
import { UserEntity } from '../../user/user.entity';
import { AuthGuard } from '../../../guards/user.guard';

describe('EventRecommendationController', () => {
  let controller: EventRecommendationController;
  let service: DeepMocked<EventRecommendationService>;
  let cacheService: DeepMocked<CacheService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventRecommendationController],
      providers: [
        {
          provide: EventRecommendationService,
          useValue: createMock<EventRecommendationService>(),
        },
        {
          provide: CacheService,
          useValue: createMock<CacheService>(),
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<EventRecommendationController>(
      EventRecommendationController,
    );
    service = module.get(EventRecommendationService);
    cacheService = module.get(CacheService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getRecommendations', () => {
    it('should return recommended events through cache', async () => {
      const eventId = 'event-1';
      const user = { id: 'user-1' } as UserEntity;
      const expectedResult = [{ id: 'rec-1' }];

      cacheService.getOrSet.mockImplementation(async (key, fn) => {
        return fn();
      });

      service.getRecommendedEvents.mockResolvedValue(expectedResult as any);

      const result = await controller.getRecommendations(eventId, user);

      expect(result).toEqual(expectedResult);
      expect(service.getRecommendedEvents).toHaveBeenCalledWith(
        eventId,
        user.id,
      );
    });
  });
});
