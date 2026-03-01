import { Test, TestingModule } from '@nestjs/testing';
import { EventRecommendationService } from './event-recommendation.service';
import { EventService } from '../event.service';
import { AttendanceService } from '../../attendance/attendance.service';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { NotFoundException } from '@nestjs/common';
import { CategorySimilarityStrategy } from './strategies/category-similarity.strategy';
import { LocationSimilarityStrategy } from './strategies/location-similarity.strategy';
import { TimeSimilarityStrategy } from './strategies/time-similarity.strategy';
import { EventEntity } from '../event.entity';
import { AttendanceEntity } from '../../attendance/attendance.entity';

describe('EventRecommendationService', () => {
  let service: EventRecommendationService;
  let eventService: DeepMocked<EventService>;
  let attendanceService: DeepMocked<AttendanceService>;

  const mockDate = new Date();

  const createMockEvent = (
    id: string,
    overrides?: Partial<EventEntity>,
  ): EventEntity => ({
    id,
    title: `Event ${id}`,
    description: 'Desc',
    categoryId: 'cat-1',
    startDate: mockDate,
    endDate: mockDate,
    latitude: 10,
    longitude: 10,
    location: 'Test Location',
    createdById: 'creator-id',
    createdAt: mockDate,
    updatedAt: mockDate,
    ...overrides,
  });

  const targetEvent = createMockEvent('target-1', {
    categoryId: 'cat-target',
    startDate: new Date('2024-01-01T12:00:00Z'),
    latitude: 40.7128,
    longitude: -74.006,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventRecommendationService,
        CategorySimilarityStrategy,
        LocationSimilarityStrategy,
        TimeSimilarityStrategy,
        {
          provide: EventService,
          useValue: createMock<EventService>(),
        },
        {
          provide: AttendanceService,
          useValue: createMock<AttendanceService>(),
        },
      ],
    }).compile();

    service = module.get<EventRecommendationService>(
      EventRecommendationService,
    );
    eventService = module.get(EventService);
    attendanceService = module.get(AttendanceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getRecommendedEvents', () => {
    it('should throw NotFoundException if event not found', async () => {
      eventService.findEventByIdOrThrow.mockRejectedValue(
        new NotFoundException(),
      );

      await expect(service.getRecommendedEvents('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return empty array if no candidates found', async () => {
      eventService.findEventByIdOrThrow.mockResolvedValue(targetEvent);
      // Mock all candidate sources to return empty
      eventService.findEventsByFilter.mockResolvedValue([]);
      // Mock collaborative part (if userId provided, but here undefined)

      const result = await service.getRecommendedEvents(targetEvent.id);
      expect(result).toEqual([]);
    });

    it('should score and sort candidates correctly', async () => {
      const candidate1 = createMockEvent('c1', {
        categoryId: 'cat-target', // Match
        latitude: 40.7128, // Match
        longitude: -74.006,
        startDate: new Date('2024-01-01T12:00:00Z'), // Match
      }); // Should have high score

      const candidate2 = createMockEvent('c2', {
        categoryId: 'cat-other', // No match
        latitude: 0, // Far
        longitude: 0,
        startDate: new Date('2025-01-01T12:00:00Z'), // Different time
      }); // Should have low score

      eventService.findEventByIdOrThrow.mockResolvedValue(targetEvent);

      // Mock candidates
      eventService.findEventsByFilter
        .mockResolvedValueOnce([candidate1]) // category match
        .mockResolvedValueOnce([candidate2]) // upcoming match
        .mockResolvedValueOnce([]); // nearby matches

      const result = await service.getRecommendedEvents(targetEvent.id);

      expect(result.length).toBe(2);
      expect(result[0].id).toBe('c1');
      expect(result[1].id).toBe('c2');
    });

    it('should incorporate collaborative filtering scores if userId provided', async () => {
      const userId = 'user-1';
      const candidate1 = createMockEvent('c1');

      eventService.findEventByIdOrThrow.mockResolvedValue(targetEvent);

      // Basic candidates
      eventService.findEventsByFilter
        .mockResolvedValueOnce([candidate1])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]); // collaborative

      // Mock collaborative logic
      // 1. findSimilarUsers via attendance service
      const mockAttendances: AttendanceEntity[] = [
        {
          id: 'a1',
          userId: userId,
          eventId: 'past-event',
          createdAt: mockDate,
          updatedAt: mockDate,
        },
        {
          id: 'a2',
          userId: 'sim-user',
          eventId: 'past-event',
          createdAt: mockDate,
          updatedAt: mockDate,
        },
        {
          id: 'a3',
          userId: 'sim-user',
          eventId: 'c1',
          createdAt: mockDate,
          updatedAt: mockDate,
        },
      ];
      attendanceService.findUsersWhoAttendedEvents.mockResolvedValue(
        mockAttendances,
      );

      eventService.findUserAttendedEvents
        .mockResolvedValueOnce([createMockEvent('past-event')]) // For user
        .mockResolvedValueOnce([createMockEvent('past-event'), candidate1]); // For sim-user

      const result = await service.getRecommendedEvents(targetEvent.id, userId);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('c1');
    });

    it('should handle pagination limit', async () => {
      const candidates = Array.from({ length: 15 }, (_, i) =>
        createMockEvent(`c${i}`, { categoryId: 'cat-target' }),
      );

      eventService.findEventByIdOrThrow.mockResolvedValue(targetEvent);
      eventService.findEventsByFilter
        .mockResolvedValueOnce(candidates)
        .mockResolvedValue([]);

      const limit = 5;
      const result = await service.getRecommendedEvents(
        targetEvent.id,
        undefined,
        limit,
      );

      expect(result).toHaveLength(limit);
    });
  });
});
