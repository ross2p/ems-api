import { Test, TestingModule } from '@nestjs/testing';
import { EventRepository } from './event.repository';
import { DatabaseService } from '../database/database.service';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventFilterDto } from './dto/event-filter.dto';
import { EventEntity } from './event.entity';

describe('EventRepository', () => {
  let repository: EventRepository;
  let databaseService: DeepMocked<DatabaseService>;
  let mockEventRepository: any;

  const mockEvent: EventEntity = {
    id: 'event-id',
    title: 'Test Event',
    description: 'Test Description',
    startDate: new Date(),
    endDate: new Date(),
    location: 'Test Location',
    createdById: 'user-id',
    latitude: 10,
    longitude: 10,
    categoryId: 'category-id',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockEventRepository = {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventRepository,
        {
          provide: DatabaseService,
          useValue: createMock<DatabaseService>(),
        },
      ],
    }).compile();

    repository = module.get<EventRepository>(EventRepository);
    databaseService = module.get(DatabaseService);
    // Mock the property access
    (repository as any).eventRepository = mockEventRepository;
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('createEvent', () => {
    it('should create an event', async () => {
      const createDto: CreateEventDto = {
        title: 'New Event',
        description: 'Description',
        startDate: new Date(),
        endDate: new Date(),
        location: 'Location',
        createdById: 'user-id',
      };

      mockEventRepository.create.mockResolvedValue(mockEvent);

      const result = await repository.createEvent(createDto);

      expect(mockEventRepository.create).toHaveBeenCalledWith({
        data: createDto,
      });
      expect(result).toEqual(mockEvent);
    });
  });

  describe('updateEvent', () => {
    it('should update an event', async () => {
      const updateDto: UpdateEventDto = {
        title: 'Updated Title',
      };

      mockEventRepository.update.mockResolvedValue({
        ...mockEvent,
        ...updateDto,
      });

      const result = await repository.updateEvent(mockEvent.id, updateDto);

      expect(mockEventRepository.update).toHaveBeenCalledWith({
        where: { id: mockEvent.id },
        data: updateDto,
      });
      expect(result.title).toBe(updateDto.title);
    });
  });

  describe('deleteEvent', () => {
    it('should delete an event', async () => {
      mockEventRepository.delete.mockResolvedValue(mockEvent);

      const result = await repository.deleteEvent(mockEvent.id);

      expect(mockEventRepository.delete).toHaveBeenCalledWith({
        where: { id: mockEvent.id },
      });
      expect(result).toEqual(mockEvent);
    });
  });

  describe('findEventById', () => {
    it('should find event by id', async () => {
      mockEventRepository.findUnique.mockResolvedValue(mockEvent);

      const result = await repository.findEventById(mockEvent.id);

      expect(mockEventRepository.findUnique).toHaveBeenCalledWith({
        where: { id: mockEvent.id },
        include: {
          category: true,
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });
      expect(result).toEqual(mockEvent);
    });
  });

  describe('findPageableEvents', () => {
    it('should find pageable events', async () => {
      const filterDto = new EventFilterDto();
      filterDto.pageNumber = 1;
      filterDto.pageSize = 10;
      filterDto.search = 'Title';

      mockEventRepository.findMany.mockResolvedValue([mockEvent]);

      const result = await repository.findPageableEvents(filterDto);

      expect(mockEventRepository.findMany).toHaveBeenCalled();
      const callArgs = mockEventRepository.findMany.mock.calls[0][0];
      expect(callArgs.where.OR).toBeDefined(); // Search clause
      expect(callArgs.skip).toBe(0);
      expect(callArgs.take).toBe(10);
      expect(result).toEqual([mockEvent]);
    });
  });

  describe('countEvents', () => {
    it('should count events', async () => {
      const filterDto = new EventFilterDto();
      mockEventRepository.count.mockResolvedValue(1);

      const result = await repository.countEvents(filterDto);

      expect(mockEventRepository.count).toHaveBeenCalled();
      expect(result).toBe(1);
    });
  });

  describe('findEventsByCategory', () => {
    it('should find events by category', async () => {
      mockEventRepository.findMany.mockResolvedValue([mockEvent]);

      const result = await repository.findEventsByCategory(
        'cat-id',
        ['exclude-id'],
        10,
      );

      expect(mockEventRepository.findMany).toHaveBeenCalledWith({
        where: {
          categoryId: 'cat-id',
          id: {
            notIn: ['exclude-id'],
          },
        },
        include: {
          category: true,
          createdBy: true,
        },
        take: 10,
        orderBy: {
          startDate: 'asc',
        },
      });
      expect(result).toEqual([mockEvent]);
    });
  });

  describe('findUpcomingEvents', () => {
    it('should find upcoming events', async () => {
      mockEventRepository.findMany.mockResolvedValue([mockEvent]);
      const startDate = new Date('2024-01-01');

      const result = await repository.findUpcomingEvents(
        startDate,
        7,
        ['exclude-id'],
        10,
      );

      expect(mockEventRepository.findMany).toHaveBeenCalled();
      const callArgs = mockEventRepository.findMany.mock.calls[0][0];
      expect(callArgs.where.startDate.gte).toEqual(startDate);
      // Logic inside calculates endDate as startDate + daysRange
      // We assume date logic is correct, just checking call made
      expect(result).toEqual([mockEvent]);
    });
  });

  describe('findNearbyEvents', () => {
    it('should find nearby events', async () => {
      mockEventRepository.findMany.mockResolvedValue([mockEvent]);

      const result = await repository.findNearbyEvents(
        10,
        10,
        50,
        ['exclude-id'],
        10,
      );

      expect(mockEventRepository.findMany).toHaveBeenCalled();
      const callArgs = mockEventRepository.findMany.mock.calls[0][0];
      expect(callArgs.where.latitude.gte).toBeLessThan(10);
      expect(callArgs.where.latitude.lte).toBeGreaterThan(10);
      expect(result).toEqual([mockEvent]);
    });
  });

  describe('findEventsByMultipleIds', () => {
    it('should find events by multiple ids', async () => {
      mockEventRepository.findMany.mockResolvedValue([mockEvent]);
      const ids = ['id1', 'id2'];

      const result = await repository.findEventsByMultipleIds(
        ids,
        ['exclude-id'],
        10,
      );

      expect(mockEventRepository.findMany).toHaveBeenCalledWith({
        where: {
          id: {
            in: ids,
            notIn: ['exclude-id'],
          },
        },
        include: {
          category: true,
          createdBy: true,
        },
        take: 10,
      });
      expect(result).toEqual([mockEvent]);
    });
  });

  describe('findUserAttendedEvents', () => {
    it('should find user attended events', async () => {
      mockEventRepository.findMany.mockResolvedValue([mockEvent]);

      const result = await repository.findUserAttendedEvents('user-id');

      expect(mockEventRepository.findMany).toHaveBeenCalledWith({
        where: {
          attendances: {
            some: {
              userId: 'user-id',
            },
          },
        },
        include: {
          category: true,
        },
      });
      expect(result).toEqual([mockEvent]);
    });
  });
});
