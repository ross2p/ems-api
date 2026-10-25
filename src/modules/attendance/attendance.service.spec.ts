import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceService } from './attendance.service';
import { AttendanceRepository } from './attendance.repository';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { CreateAttendanceDto } from './dtos/create-attendance.dto';
import { UpdateAttendanceDto } from './dtos/update-attendance.dto';
import { AttendanceFilterDto } from './dtos/attendance-filter.dto';
import { NotFoundException } from '@nestjs/common';
import { PageResponse } from '../../utils/pageables/page-response.utils';
import { AttendanceEntity } from './attendance.entity';
import { UserService } from '../user/user.service';
import { EventService } from '../event/event.service';

const mockAttendance = {
  id: 'attendance-id',
  userId: 'user-id',
  eventId: 'event-id',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('AttendanceService', () => {
  let service: AttendanceService;
  let repository: DeepMocked<AttendanceRepository>;
  let userService: DeepMocked<UserService>;
  let eventService: DeepMocked<EventService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceService,
        {
          provide: AttendanceRepository,
          useValue: createMock<AttendanceRepository>(),
        },
        { provide: UserService, useValue: createMock<UserService>() },
        { provide: EventService, useValue: createMock<EventService>() },
      ],
    }).compile();

    service = module.get<AttendanceService>(AttendanceService);
    repository = module.get(AttendanceRepository);
    userService = module.get(UserService);
    eventService = module.get(EventService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAttendance', () => {
    it('should create attendance', async () => {
      const dto: CreateAttendanceDto = {
        userId: 'user-id',
        eventId: 'event-id',
      };
      repository.createAttendance.mockResolvedValue(mockAttendance);

      const result = await service.createAttendance(dto);

      expect(repository.createAttendance).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockAttendance);
    });
  });

  describe('createAttendance relations', () => {
    const dto: CreateAttendanceDto = {
      userId: 'missing-user-id',
      eventId: 'event-id',
    };

    it('should throw NotFoundException if user does not exist', async () => {
      userService.findUserByIdOrThrow.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(service.createAttendance(dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.createAttendance).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if event does not exist', async () => {
      eventService.findEventByIdOrThrow.mockRejectedValue(
        new NotFoundException('Event not found'),
      );

      await expect(service.createAttendance(dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.createAttendance).not.toHaveBeenCalled();
    });
  });

  describe('findAttendanceByIdOrThrow', () => {
    it('should return attendance if found', async () => {
      repository.findAttendanceById.mockResolvedValue(mockAttendance);

      const result = await service.findAttendanceByIdOrThrow(mockAttendance.id);

      expect(repository.findAttendanceById).toHaveBeenCalledWith(
        mockAttendance.id,
      );
      expect(result).toEqual(mockAttendance);
    });

    it('should throw NotFoundException if not found', async () => {
      repository.findAttendanceById.mockResolvedValue(null);

      await expect(
        service.findAttendanceByIdOrThrow('non-existent-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllAttendance', () => {
    it('should return all attendance', async () => {
      const filters = new AttendanceFilterDto();
      filters.pageNumber = 1;
      filters.pageSize = 2;

      const expectedResponse = new PageResponse<AttendanceEntity>(
        filters,
        [mockAttendance],
        10,
      );

      repository.findAllAttendance.mockResolvedValue({
        attendances: [mockAttendance],
        count: 10,
      });

      const result = await service.findAllAttendance(filters);

      expect(repository.findAllAttendance).toHaveBeenCalledWith(filters);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('findAttendanceByUserId', () => {
    it('should return attendance by user id', async () => {
      repository.findAttendanceByUserId.mockResolvedValue([mockAttendance]);

      const result = await service.findAttendanceByUserId('user-id');

      expect(repository.findAttendanceByUserId).toHaveBeenCalledWith('user-id');
      expect(result).toEqual([mockAttendance]);
    });
  });

  describe('findAttendanceByEventId', () => {
    it('should return attendance by event id', async () => {
      repository.findAttendanceByEventId.mockResolvedValue([mockAttendance]);

      const result = await service.findAttendanceByEventId('event-id');

      expect(repository.findAttendanceByEventId).toHaveBeenCalledWith(
        'event-id',
      );
      expect(result).toEqual([mockAttendance]);
    });
  });

  describe('updateAttendance', () => {
    it('should update attendance', async () => {
      const dto: UpdateAttendanceDto = { userId: 'new-user-id' };
      const updatedAttendance = { ...mockAttendance, ...dto };

      repository.findAttendanceById.mockResolvedValue(mockAttendance);
      repository.updateAttendance.mockResolvedValue(updatedAttendance);

      const result = await service.updateAttendance(mockAttendance.id, dto);

      expect(repository.findAttendanceById).toHaveBeenCalledWith(
        mockAttendance.id,
      );
      expect(repository.updateAttendance).toHaveBeenCalledWith(
        mockAttendance.id,
        dto,
      );
      expect(result).toEqual(updatedAttendance);
    });

    it('should throw if attendance not found', async () => {
      repository.findAttendanceById.mockResolvedValue(null);

      await expect(
        service.updateAttendance('non-existent-id', {}),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteAttendance', () => {
    it('should delete attendance', async () => {
      repository.findAttendanceById.mockResolvedValue(mockAttendance);
      repository.deleteAttendance.mockResolvedValue(mockAttendance);

      const result = await service.deleteAttendance(mockAttendance.id);

      expect(repository.findAttendanceById).toHaveBeenCalledWith(
        mockAttendance.id,
      );
      expect(repository.deleteAttendance).toHaveBeenCalledWith(
        mockAttendance.id,
      );
      expect(result).toEqual(mockAttendance);
    });

    it('should throw if attendance not found', async () => {
      repository.findAttendanceById.mockResolvedValue(null);

      await expect(service.deleteAttendance('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findUsersWhoAttendedEvents', () => {
    it('should return users who attended events', async () => {
      const eventIds = ['event-id-1', 'event-id-2'];
      const users: AttendanceEntity[] = [
        { ...mockAttendance, userId: 'user-id-1' },
        { ...mockAttendance, userId: 'user-id-2' },
      ];
      repository.findUsersWhoAttendedEvents.mockResolvedValue(users);

      const result = await service.findUsersWhoAttendedEvents(eventIds);

      expect(repository.findUsersWhoAttendedEvents).toHaveBeenCalledWith(
        eventIds,
      );
      expect(result).toEqual(users);
    });
  });
});
