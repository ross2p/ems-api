import { Test, TestingModule } from '@nestjs/testing';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { EventRecommendationService } from './event-recommendation.service';
import { CacheService } from '../cache/cache.service';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventFilterDto } from './dto/event-filter.dto';
import { UserEntity } from '../user/user.entity';

import { PageRequest } from '../../utils/pageables/page-request.utils';
import { AuthGuard } from '../../guards/user.guard';

describe('EventController', () => {
  let controller: EventController;
  let eventService: DeepMocked<EventService>;
  let recommendationService: DeepMocked<EventRecommendationService>;
  let cacheService: DeepMocked<CacheService>;

  const mockUser: UserEntity = {
    id: 'user-id',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    password: 'hashedPassword',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

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
      controllers: [EventController],
      providers: [
        {
          provide: EventService,
          useValue: createMock<EventService>(),
        },
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

    controller = module.get<EventController>(EventController);
    eventService = module.get(EventService);
    recommendationService = module.get(EventRecommendationService);
    cacheService = module.get(CacheService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getEvents', () => {
    it('should return a list of events', async () => {
      const filterDto = new EventFilterDto();
      const mockResult = {
        data: [mockEvent],
        meta: {
          page: 1,
          take: 10,
          itemCount: 1,
          pageCount: 1,
          hasPreviousPage: false,
          hasNextPage: false,
        },
      };

      eventService.findPageableEvents.mockResolvedValue(mockResult as any);

      const result = await controller.getEvents(filterDto);

      expect(result).toEqual(mockResult);
      expect(eventService.findPageableEvents).toHaveBeenCalledWith(filterDto);
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

      eventService.createEvent.mockResolvedValue(mockEvent as any);

      const result = await controller.createEvent(createDto, mockUser);

      expect(result).toEqual(mockEvent);
      expect(createDto.createdById).toBe(mockUser.id);
      expect(eventService.createEvent).toHaveBeenCalledWith(createDto);
    });
  });

  describe('getEventById', () => {
    it('should return an event by id', async () => {
      eventService.findEventByIdOrThrow.mockResolvedValue(mockEvent as any);

      const result = await controller.getEventById(mockEvent.id);

      expect(result).toEqual(mockEvent);
      expect(eventService.findEventByIdOrThrow).toHaveBeenCalledWith(
        mockEvent.id,
      );
    });
  });

  describe('getSimilarEvents', () => {
    it('should return similar events', async () => {
      const pageRequest = new PageRequest();
      pageRequest.pageNumber = 1;
      pageRequest.pageSize = 5;
      const mockRecommendations = [mockEvent];

      cacheService.getOrSet.mockImplementation(async (key, fn) => {
        return fn();
      });
      recommendationService.getRecommendedEvents.mockResolvedValue(
        mockRecommendations,
      );

      const result = await controller.getSimilarEvents(
        mockEvent.id,
        mockUser,
        pageRequest,
      );

      expect(result).toEqual(mockRecommendations);
      expect(cacheService.getOrSet).toHaveBeenCalled();
      expect(recommendationService.getRecommendedEvents).toHaveBeenCalledWith(
        mockEvent.id,
        mockUser.id,
        pageRequest.take,
      );
    });
  });

  describe('updateEvent', () => {
    it('should update an event', async () => {
      const updateDto: UpdateEventDto = { title: 'Updated Title' };
      const updatedEvent = { ...mockEvent, ...updateDto };

      eventService.updateEvent.mockResolvedValue(updatedEvent as any);

      const result = await controller.updateEvent(mockEvent.id, updateDto);

      expect(result).toEqual(updatedEvent);
      expect(eventService.updateEvent).toHaveBeenCalledWith(
        mockEvent.id,
        updateDto,
      );
    });
  });

  describe('deleteEvent', () => {
    it('should delete an event', async () => {
      eventService.deleteEvent.mockResolvedValue(mockEvent as any);

      const result = await controller.deleteEvent(mockEvent.id);

      expect(result).toEqual(mockEvent);
      expect(eventService.deleteEvent).toHaveBeenCalledWith(mockEvent.id);
    });
  });
});
