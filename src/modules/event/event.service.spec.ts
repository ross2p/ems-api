import { Test, TestingModule } from '@nestjs/testing';
import { EventService } from './event.service';
import { EventRepository } from './event.repository';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { EventFilterDto } from './dto/event-filter.dto';
import { NotFoundException } from '@nestjs/common';

import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

describe('EventService', () => {
  let service: EventService;
  let eventRepository: DeepMocked<EventRepository>;

  const mockEvent = {
    id: 'event-id',
    title: 'Test Event',
    description: 'Test Description',
    startDate: new Date(),
    endDate: new Date(),
    location: 'Test Location',
    createdById: 'user-id',
    latitude: null,
    longitude: null,
    categoryId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    category: null,
    createdBy: {
      id: 'user-id',
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@example.com',
      password: 'hashedPassword',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        {
          provide: EventRepository,
          useValue: createMock<EventRepository>(),
        },
      ],
    }).compile();

    service = module.get<EventService>(EventService);
    eventRepository = module.get(EventRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findPageableEvents', () => {
    it('should return page response of events', async () => {
      const filterDto = new EventFilterDto();
      filterDto.pageNumber = 1;
      filterDto.pageSize = 10;
      // Mock toPageResponse since it's a method on the DTO instance
      filterDto.toPageResponse = jest.fn().mockReturnValue({
        data: [mockEvent],
        meta: {
          page: 1,
          take: 10,
          itemCount: 1,
          pageCount: 1,
          hasPreviousPage: false,
          hasNextPage: false,
        },
      });

      eventRepository.findPageableEvents.mockResolvedValue([mockEvent] as any);
      eventRepository.countEvents.mockResolvedValue(1);

      const result = await service.findPageableEvents(filterDto);

      expect(eventRepository.findPageableEvents).toHaveBeenCalledWith(
        filterDto,
      );
      expect(eventRepository.countEvents).toHaveBeenCalledWith(filterDto);
      expect((result as any).data).toEqual([mockEvent]);
      expect((result as any).meta.itemCount).toBe(1);
    });
  });

  describe('findEventByIdOrThrow', () => {
    it('should return event if found', async () => {
      eventRepository.findEventById.mockResolvedValue(mockEvent as any);

      const result = await service.findEventByIdOrThrow(mockEvent.id);

      expect(result).toEqual(mockEvent);
      expect(eventRepository.findEventById).toHaveBeenCalledWith(mockEvent.id);
    });

    it('should throw NotFoundException if event not found', async () => {
      eventRepository.findEventById.mockResolvedValue(null);

      await expect(service.findEventByIdOrThrow('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
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

      eventRepository.createEvent.mockResolvedValue(mockEvent as any);

      const result = await service.createEvent(createDto);

      expect(result).toEqual(mockEvent);
      expect(eventRepository.createEvent).toHaveBeenCalledWith(createDto);
    });
  });

  describe('updateEvent', () => {
    it('should update an event if found', async () => {
      const updateDto: UpdateEventDto = {
        title: 'Updated Event',
      };

      const updatedEvent = { ...mockEvent, ...updateDto };

      eventRepository.findEventById.mockResolvedValue(mockEvent as any);
      eventRepository.updateEvent.mockResolvedValue(updatedEvent as any);

      const result = await service.updateEvent(mockEvent.id, updateDto);

      expect(result).toEqual(updatedEvent);
      expect(eventRepository.findEventById).toHaveBeenCalledWith(mockEvent.id);
      expect(eventRepository.updateEvent).toHaveBeenCalledWith(
        mockEvent.id,
        updateDto,
      );
    });

    it('should throw NotFoundException if event not found during update', async () => {
      eventRepository.findEventById.mockResolvedValue(null);

      await expect(service.updateEvent('invalid-id', {})).rejects.toThrow(
        NotFoundException,
      );

      expect(eventRepository.updateEvent).not.toHaveBeenCalled();
    });
  });

  describe('deleteEvent', () => {
    it('should delete an event if found', async () => {
      eventRepository.findEventById.mockResolvedValue(mockEvent as any);
      eventRepository.deleteEvent.mockResolvedValue(mockEvent as any);

      const result = await service.deleteEvent(mockEvent.id);

      expect(result).toEqual(mockEvent);
      expect(eventRepository.findEventById).toHaveBeenCalledWith(mockEvent.id);
      expect(eventRepository.deleteEvent).toHaveBeenCalledWith(mockEvent.id);
    });

    it('should throw NotFoundException if event not found during delete', async () => {
      eventRepository.findEventById.mockResolvedValue(null);

      await expect(service.deleteEvent('invalid-id')).rejects.toThrow(
        NotFoundException,
      );

      expect(eventRepository.deleteEvent).not.toHaveBeenCalled();
    });
  });
});
