import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceRepository } from './attendance.repository';
import { DatabaseService } from '../database/database.service';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { CreateAttendanceDto } from './dtos/create-attendance.dto';
import { UpdateAttendanceDto } from './dtos/update-attendance.dto';
import { AttendanceFilterDto } from './dtos/attendance-filter.dto';

const mockAttendance = {
  id: 'attendance-id',
  userId: 'user-id',
  eventId: 'event-id',
  createdAt: new Date(),
  updatedAt: new Date(),
  hasAttended: false,
};

describe('AttendanceRepository', () => {
  let repository: AttendanceRepository;
  let databaseService: DeepMocked<DatabaseService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceRepository,
        {
          provide: DatabaseService,
          useValue: createMock<DatabaseService>(),
        },
      ],
    }).compile();

    repository = module.get<AttendanceRepository>(AttendanceRepository);
    databaseService = module.get(DatabaseService);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('createAttendance', () => {
    it('should create attendance', async () => {
      const dto: CreateAttendanceDto = {
        userId: 'user-id',
        eventId: 'event-id',
      };
      databaseService.attendance.create.mockResolvedValue(mockAttendance);

      const result = await repository.createAttendance(dto);

      expect(databaseService.attendance.create).toHaveBeenCalledWith({
        data: dto,
      });
      expect(result).toEqual(mockAttendance);
    });
  });

  describe('findAttendanceById', () => {
    it('should find attendance by id', async () => {
      databaseService.attendance.findUnique.mockResolvedValue(mockAttendance);

      const result = await repository.findAttendanceById(mockAttendance.id);

      expect(databaseService.attendance.findUnique).toHaveBeenCalledWith({
        where: { id: mockAttendance.id },
      });
      expect(result).toEqual(mockAttendance);
    });
  });

  describe('findAllAttendance', () => {
    it('should return all attendance with filters', async () => {
      const filters = new AttendanceFilterDto();
      filters.eventId = 'event-id';

      const attendances = [mockAttendance];
      const count = 1;

      databaseService.attendance.findMany.mockResolvedValue(attendances);
      databaseService.attendance.count.mockResolvedValue(count);

      const result = await repository.findAllAttendance(filters);

      expect(databaseService.attendance.findMany).toHaveBeenCalledWith({
        where: { eventId: filters.eventId },
        skip: expect.any(Number),
        take: expect.any(Number),
      });
      expect(databaseService.attendance.count).toHaveBeenCalledWith({
        where: { eventId: filters.eventId },
      });
      expect(result).toEqual({ attendances, count });
    });
  });

  describe('findAttendanceByUserId', () => {
    it('should return attendance by user id', async () => {
      databaseService.attendance.findMany.mockResolvedValue([mockAttendance]);

      const result = await repository.findAttendanceByUserId('user-id');

      expect(databaseService.attendance.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-id' },
      });
      expect(result).toEqual([mockAttendance]);
    });
  });

  describe('findAttendanceByEventId', () => {
    it('should return attendance by event id', async () => {
      databaseService.attendance.findMany.mockResolvedValue([mockAttendance]);

      const result = await repository.findAttendanceByEventId('event-id');

      expect(databaseService.attendance.findMany).toHaveBeenCalledWith({
        where: { eventId: 'event-id' },
      });
      expect(result).toEqual([mockAttendance]);
    });
  });

  describe('updateAttendance', () => {
    it('should update attendance', async () => {
      const dto: UpdateAttendanceDto = { userId: 'new-user-id' };
      const updatedAttendance = { ...mockAttendance, ...dto };
      databaseService.attendance.update.mockResolvedValue(updatedAttendance);

      const result = await repository.updateAttendance(mockAttendance.id, dto);

      expect(databaseService.attendance.update).toHaveBeenCalledWith({
        where: { id: mockAttendance.id },
        data: dto,
      });
      expect(result).toEqual(updatedAttendance);
    });
  });

  describe('deleteAttendance', () => {
    it('should delete attendance', async () => {
      databaseService.attendance.delete.mockResolvedValue(mockAttendance);

      const result = await repository.deleteAttendance(mockAttendance.id);

      expect(databaseService.attendance.delete).toHaveBeenCalledWith({
        where: { id: mockAttendance.id },
      });
      expect(result).toEqual(mockAttendance);
    });
  });

  describe('findUsersWhoAttendedEvents', () => {
    it('should return users who attended events', async () => {
      const eventIds = ['event-1', 'event-2'];
      const attendances = [mockAttendance];
      databaseService.attendance.findMany.mockResolvedValue(attendances);

      const result = await repository.findUsersWhoAttendedEvents(eventIds);

      expect(databaseService.attendance.findMany).toHaveBeenCalledWith({
        where: {
          eventId: {
            in: eventIds,
          },
        },
      });
      expect(result).toEqual(attendances);
    });
  });
});
