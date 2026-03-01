import {
  setupTestEnvironment,
  TestEnvironment,
} from '../../utils/test-setup.util';
import { EventService } from '@/modules/event/event.service';
import { CreateEventDto } from '@/modules/event/dto/create-event.dto';
import { UpdateEventDto } from '@/modules/event/dto/update-event.dto';
import { EventFilterDto } from '@/modules/event/dto/event-filter.dto';
import { NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

describe('EventService (Integration)', () => {
  const env: TestEnvironment = setupTestEnvironment();
  let eventService: EventService;

  // We need a user and a category in the DB to associate with events
  let testUserId: string;
  let testCategoryId: string;

  beforeAll(() => {
    eventService = env.app.get(EventService);
  });

  beforeEach(async () => {
    // Seed prerequisite data (User & Category) before each test
    const user = await env.dbEnv.prisma.user.create({
      data: {
        email: `testuser_${Date.now()}@example.com`,
        password: 'hashed_password',
        firstName: 'Event',
        lastName: 'Tester',
      },
    });
    testUserId = user.id;

    const category = await env.dbEnv.prisma.category.create({
      data: {
        name: `Test Category ${Date.now()}`,
        description: 'Category for integration tests',
        createdById: testUserId,
      },
    });
    testCategoryId = category.id;
  });

  describe('createEvent', () => {
    it('should successfully create an event in the database', async () => {
      const dto: CreateEventDto = {
        title: 'Integration Test Event',
        description: 'This is a test event',
        startDate: new Date(Date.now() + 86400000), // Tomorrow
        endDate: new Date(Date.now() + 172800000), // Day after tomorrow
        location: 'Virtual',
        latitude: 50.4501,
        longitude: 30.5234,
        categoryId: testCategoryId,
        createdById: testUserId,
      };

      const result = await eventService.createEvent(dto);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.title).toBe(dto.title);
      expect(result.categoryId).toBe(testCategoryId);
      expect(result.createdById).toBe(testUserId);

      // Verify in DB directly
      const eventInDb = await env.dbEnv.prisma.event.findUnique({
        where: { id: result.id },
      });
      expect(eventInDb).toBeDefined();
      expect(eventInDb?.title).toBe(dto.title);
    });
  });

  describe('findEventByIdOrThrow', () => {
    it('should return the event with category and creator included', async () => {
      const dto: CreateEventDto = {
        title: 'Find Me Event',
        description: 'Event to find',
        startDate: new Date(),
        endDate: new Date(),
        location: 'Local',
        categoryId: testCategoryId,
        createdById: testUserId,
      };
      const createdEvent = await eventService.createEvent(dto);

      const foundEvent = await eventService.findEventByIdOrThrow(
        createdEvent.id,
      );

      expect(foundEvent).toBeDefined();
      expect(foundEvent.id).toBe(createdEvent.id);
      expect(foundEvent.category).toBeDefined();
      expect(foundEvent.category?.id).toBe(testCategoryId);
      expect(foundEvent.createdBy).toBeDefined();
      expect(foundEvent.createdBy.id).toBe(testUserId);
      expect(foundEvent.createdBy.email).toBeDefined();
    });

    it('should throw NotFoundException if event does not exist', async () => {
      const fakeId = randomUUID();
      await expect(eventService.findEventByIdOrThrow(fakeId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateEvent', () => {
    it('should update event details successfully', async () => {
      const createDto: CreateEventDto = {
        title: 'Original Title',
        description: 'Original Desc',
        startDate: new Date(),
        endDate: new Date(),
        location: 'Old Location',
        categoryId: testCategoryId,
        createdById: testUserId,
      };
      const event = await eventService.createEvent(createDto);

      const updateDto: UpdateEventDto = {
        title: 'Updated Title',
        location: 'New Location',
      };

      const result = await eventService.updateEvent(event.id, updateDto);
      expect(result.title).toBe(updateDto.title);
      expect(result.location).toBe(updateDto.location);
      expect(result.description).toBe(createDto.description); // Should remain unchanged

      // Verify in DB
      const eventInDb = await env.dbEnv.prisma.event.findUnique({
        where: { id: event.id },
      });
      expect(eventInDb?.title).toBe(updateDto.title);
      expect(eventInDb?.location).toBe(updateDto.location);
    });

    it('should throw NotFoundException if trying to update non-existing event', async () => {
      const fakeId = randomUUID();
      await expect(
        eventService.updateEvent(fakeId, { title: 'New Title' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteEvent', () => {
    it('should completely delete the event from database', async () => {
      const createDto: CreateEventDto = {
        title: 'Event to Delete',
        description: 'Delete me',
        startDate: new Date(),
        endDate: new Date(),
        location: 'Trash',
        categoryId: testCategoryId,
        createdById: testUserId,
      };
      const event = await eventService.createEvent(createDto);

      await eventService.deleteEvent(event.id);

      const eventInDb = await env.dbEnv.prisma.event.findUnique({
        where: { id: event.id },
      });
      expect(eventInDb).toBeNull();
    });

    it('should throw NotFoundException if trying to delete non-existing event', async () => {
      const fakeId = randomUUID();
      await expect(eventService.deleteEvent(fakeId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findPageableEvents', () => {
    beforeEach(async () => {
      // Create a few events for filtering tests
      await eventService.createEvent({
        title: 'Tech Conference 2026',
        description: 'A large tech conference',
        startDate: new Date('2026-05-10T10:00:00Z'),
        endDate: new Date('2026-05-12T18:00:00Z'),
        location: 'Kyiv',
        latitude: 50.45,
        longitude: 30.52,
        categoryId: testCategoryId,
        createdById: testUserId,
      });

      await eventService.createEvent({
        title: 'Local Music Festival',
        description: 'Live bands and food',
        startDate: new Date('2026-06-15T16:00:00Z'),
        endDate: new Date('2026-06-15T23:00:00Z'),
        location: 'Lviv',
        latitude: 49.83,
        longitude: 24.02,
        categoryId: testCategoryId,
        createdById: testUserId,
      });
    });

    it('should return all events when no filters are applied', async () => {
      const filter = new EventFilterDto(); // Default page=1, limit=10
      filter.pageNumber = 1;
      filter.pageSize = 10;

      const result = await eventService.findPageableEvents(filter);

      expect(result.content.length).toBeGreaterThanOrEqual(2);
      expect(result.totalCount).toBeGreaterThanOrEqual(2);
    });

    it('should filter events by search term (title or description)', async () => {
      const filter = new EventFilterDto();
      filter.pageNumber = 1;
      filter.pageSize = 10;
      filter.search = 'Tech';

      const result = await eventService.findPageableEvents(filter);

      expect(result.content.length).toBe(1);
      expect(result.content[0].title).toBe('Tech Conference 2026');
    });

    it('should filter events by category', async () => {
      // Create a different category
      const otherCategory = await env.dbEnv.prisma.category.create({
        data: {
          name: 'Other Category',
          description: 'Other',
          createdById: testUserId,
        },
      });

      await eventService.createEvent({
        title: 'Other Event',
        description: '...',
        startDate: new Date(),
        endDate: new Date(),
        location: 'Nowhere',
        categoryId: otherCategory.id,
        createdById: testUserId,
      });

      const filter = new EventFilterDto();
      filter.pageNumber = 1;
      filter.pageSize = 10;
      filter.categoryId = otherCategory.id;

      const result = await eventService.findPageableEvents(filter);

      expect(result.content.length).toBe(1);
      expect(result.content[0].categoryId).toBe(otherCategory.id);
    });

    it('should apply pagination correctly', async () => {
      const filterPage1 = new EventFilterDto();
      filterPage1.pageNumber = 1;
      filterPage1.pageSize = 1;

      const res1 = await eventService.findPageableEvents(filterPage1);
      expect(res1.content.length).toBe(1);
      expect(res1.pageNumber).toBe(1);

      const filterPage2 = new EventFilterDto();
      filterPage2.pageNumber = 2;
      filterPage2.pageSize = 1;

      const res2 = await eventService.findPageableEvents(filterPage2);
      expect(res2.content.length).toBe(1);
      expect(res2.pageNumber).toBe(2);

      // Verify they are different events
      expect(res1.content[0].id).not.toBe(res2.content[0].id);
    });

    it('should apply geo-radius filtering correctly', async () => {
      const filter = new EventFilterDto();
      filter.pageNumber = 1;
      filter.pageSize = 10;
      filter.latitude = 50.45; // Kyiv coordinates
      filter.longitude = 30.52;
      filter.radiusKm = 100; // Only tech conference should be within 100km

      const result = await eventService.findPageableEvents(filter);

      expect(result.content.length).toBe(1);
      expect(result.content[0].title).toBe('Tech Conference 2026');
    });
  });
});
