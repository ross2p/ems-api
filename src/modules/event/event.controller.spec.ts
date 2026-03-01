import { Test, TestingModule } from '@nestjs/testing';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventQueryDto } from './dto/event-query.dto';
import { UserEntity } from '../user/user.entity';
import { AuthGuard } from '../../guards/user.guard';
import { CacheService } from '../cache/cache.service';
import { EventEntity } from './event.entity';
import { PageResponse } from '../../utils/pageables/page-response.utils';

type EventWithRelations = EventEntity & {
  category: null;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
  };
};

describe('EventController', () => {
  let controller: EventController;
  let eventService: DeepMocked<EventService>;

  const mockUser: UserEntity = {
    id: 'user-id',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    password: 'hashedPassword',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockEvent: EventWithRelations = {
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
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getEvents', () => {
    it('should return a list of events', async () => {
      const queryDto = new EventQueryDto();
      queryDto.pageNumber = 1;
      queryDto.pageSize = 10;
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

      eventService.findPageableEvents.mockResolvedValue(
        mockResult as unknown as PageResponse<EventWithRelations>,
      );

      const result = await controller.getEvents(queryDto);

      expect(result).toEqual(mockResult);
      expect(eventService.findPageableEvents).toHaveBeenCalled();
      const calledFilterDto = eventService.findPageableEvents.mock.calls[0][0];
      expect(calledFilterDto.pageNumber).toBe(1);
      expect(calledFilterDto.pageSize).toBe(10);
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

      eventService.createEvent.mockResolvedValue(mockEvent);

      const result = await controller.createEvent(createDto, mockUser);

      expect(result).toEqual(mockEvent);
      expect(createDto.createdById).toBe(mockUser.id);
      expect(eventService.createEvent).toHaveBeenCalledWith(createDto);
    });
  });

  describe('getEventById', () => {
    it('should return an event by id', async () => {
      eventService.findEventByIdOrThrow.mockResolvedValue(mockEvent);

      const result = await controller.getEventById(mockEvent.id);

      expect(result).toEqual(mockEvent);
      expect(eventService.findEventByIdOrThrow).toHaveBeenCalledWith(
        mockEvent.id,
      );
    });
  });

  describe('updateEvent', () => {
    it('should update an event', async () => {
      const updateDto: UpdateEventDto = { title: 'Updated Title' };
      const updatedEvent = { ...mockEvent, ...updateDto };

      eventService.updateEvent.mockResolvedValue(updatedEvent);

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
      eventService.deleteEvent.mockResolvedValue(mockEvent);

      const result = await controller.deleteEvent(mockEvent.id);

      expect(result).toEqual(mockEvent);
      expect(eventService.deleteEvent).toHaveBeenCalledWith(mockEvent.id);
    });
  });
});
