import { Test, TestingModule } from '@nestjs/testing';
import { EventRepository } from './event.repository';
import { DatabaseService } from '../database/database.service';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventFilterDto } from './dto/event-filter.dto';
import { EventEntity } from './event.entity';
import { Prisma } from '@generated/prisma';

describe('EventRepository', () => {
  let repository: EventRepository;
  let mockEventRepository: DeepMocked<Prisma.EventDelegate>;

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
    mockEventRepository = createMock<Prisma.EventDelegate>();

    const mockDatabaseService = createMock<DatabaseService>();
    Object.defineProperty(mockDatabaseService, 'event', {
      value: mockEventRepository,
      configurable: true,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventRepository,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    repository = module.get<EventRepository>(EventRepository);
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
      expect(callArgs?.where?.OR).toBeDefined();
      expect(callArgs?.skip).toBe(0);
      expect(callArgs?.take).toBe(10);
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

  describe('findEventsByFilter', () => {
    it('should find events based on various filters', async () => {
      mockEventRepository.findMany.mockResolvedValue([mockEvent]);
      const filterDto: Partial<EventFilterDto> = {
        categoryId: 'cat-id',
        includeEventIds: ['id1', 'id2'],
        excludeEventIds: ['exclude-id'],
        take: 10,
        startDate: new Date('2024-01-01'),
        latitude: 10,
        longitude: 10,
        radiusKm: 50,
      };

      const result = await repository.findEventsByFilter(filterDto);

      expect(mockEventRepository.findMany).toHaveBeenCalled();

      const callArgs = mockEventRepository.findMany.mock.calls[0][0];

      expect(callArgs?.where?.categoryId).toBe('cat-id');
      expect(callArgs?.where?.AND).toEqual(
        expect.arrayContaining([
          { startDate: { gte: new Date(filterDto.startDate!) } },
          { id: { notIn: ['exclude-id'] } },
          { id: { in: ['id1', 'id2'] } },
        ]),
      );
      // specific overrides by context
      expect(callArgs?.take).toBe(10);
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
