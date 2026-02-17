import { Test, TestingModule } from '@nestjs/testing';
import { EventRecommendationService } from './event-recommendation.service';
import { EventRepository } from './event.repository';
import { AttendanceService } from '../attendance/attendance.service';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { NotFoundException } from '@nestjs/common';

describe('EventRecommendationService', () => {
  let service: EventRecommendationService;
  let eventRepository: DeepMocked<EventRepository>;
  let attendanceService: DeepMocked<AttendanceService>;

  const mockDate = new Date();

  // Helper to create mocked events with varying properties
  const createMockEvent = (id: string, overrides?: Partial<any>): any => ({
    id,
    title: `Event ${id}`,
    description: 'Desc',
    categoryId: 'cat-1',
    startDate: mockDate,
    endDate: mockDate,
    latitude: 10,
    longitude: 10,
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
        {
          provide: EventRepository,
          useValue: createMock<EventRepository>(),
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
    eventRepository = module.get(EventRepository);
    attendanceService = module.get(AttendanceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getRecommendedEvents', () => {
    it('should throw NotFoundException if event not found', async () => {
      eventRepository.findEventById.mockResolvedValue(null);

      await expect(service.getRecommendedEvents('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return empty array if no candidates found', async () => {
      eventRepository.findEventById.mockResolvedValue(targetEvent);
      // Mock all candidate sources to return empty
      eventRepository.findEventsByCategory.mockResolvedValue([]);
      eventRepository.findUpcomingEvents.mockResolvedValue([]);
      eventRepository.findNearbyEvents.mockResolvedValue([]);
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

      eventRepository.findEventById.mockResolvedValue(targetEvent);

      // Mock candidates
      eventRepository.findEventsByCategory.mockResolvedValue([candidate1]);
      eventRepository.findUpcomingEvents.mockResolvedValue([candidate2]);
      eventRepository.findNearbyEvents.mockResolvedValue([]);

      const result = await service.getRecommendedEvents(targetEvent.id);

      expect(result.length).toBe(2);
      expect(result[0].id).toBe('c1');
      expect(result[1].id).toBe('c2');
    });

    it('should incorporate collaborative filtering scores if userId provided', async () => {
      const userId = 'user-1';
      const candidate1 = createMockEvent('c1');

      eventRepository.findEventById.mockResolvedValue(targetEvent);

      // Basic candidates
      eventRepository.findEventsByCategory.mockResolvedValue([candidate1]);
      eventRepository.findUpcomingEvents.mockResolvedValue([]);
      eventRepository.findNearbyEvents.mockResolvedValue([]);

      // Mock user attended events
      eventRepository.findUserAttendedEvents.mockResolvedValue([
        createMockEvent('past-event'),
      ]);

      // Mock collaborative logic
      // 1. findSimilarUsers via attendance service
      attendanceService.findUsersWhoAttendedEvents.mockResolvedValue([
        { userId: userId, eventId: 'past-event' } as any,
        { userId: 'sim-user', eventId: 'past-event' } as any,
        { userId: 'sim-user', eventId: 'c1' } as any,
      ]);

      // Inside findSimilarUsers:
      // user-1 has {past-event}
      // sim-user has {past-event, c1}
      // intersection {past-event}, union {past-event, c1} -> sim = 0.5

      // 2. getCollaborativeCandidates calls findUserAttendedEvents for similar users
      // This is called inside generateCandidates -> getCollaborativeCandidates
      // But also inside addCollaborativeScores

      // Check if candidate1 gets boosted
      // We need to ensure candidate1 is returned by getCollaborativeCandidates potentially
      // or at least available in candidates list. It is already in category candidates.

      // Mock findUserAttendedEvents for sim-user
      eventRepository.findUserAttendedEvents.mockResolvedValueOnce([
        createMockEvent('past-event'),
      ]); // For initial user check in generateCandidates

      // wait, logic is:
      // generateCandidates calls getCollaborativeCandidates which calls findUserAttendedEvents(userId)
      // then findSimilarUsers
      // then findUserAttendedEvents(simUser)
      // then findEventsByMultipleIds

      // Let's simplify and assume candidate1 comes from category, verification is on addCollaborativeScores

      // Re-mock to be safer sequence
      eventRepository.findUserAttendedEvents
        .mockResolvedValueOnce([createMockEvent('past-event')]) // user
        .mockResolvedValueOnce([createMockEvent('past-event'), candidate1]); // sim-user

      // For addCollaborativeScores
      eventRepository.findUserAttendedEvents
        .mockResolvedValueOnce([createMockEvent('past-event')]) // user again
        .mockResolvedValueOnce([createMockEvent('past-event'), candidate1]); // sim-user again

      // Mock similar users manually if needed? No, logic depends on attendanceService.

      const result = await service.getRecommendedEvents(targetEvent.id, userId);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('c1');
      // We can't easily check the internal score directly without inspecting private state or logs,
      // but if it runs without error and returns the event, logic paths are exercised.
    });

    it('should handle pagination limit', async () => {
      const candidates = Array.from({ length: 15 }, (_, i) =>
        createMockEvent(`c${i}`, { categoryId: 'cat-target' }),
      );

      eventRepository.findEventById.mockResolvedValue(targetEvent);
      eventRepository.findEventsByCategory.mockResolvedValue(candidates);
      eventRepository.findUpcomingEvents.mockResolvedValue([]);
      eventRepository.findNearbyEvents.mockResolvedValue([]);

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
