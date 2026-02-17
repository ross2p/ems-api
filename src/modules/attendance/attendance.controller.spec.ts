import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { AttendanceFilterDto } from './dtos/attendance-filter.dto';
import { CreateAttendanceDto } from './dtos/create-attendance.dto';
import { UpdateAttendanceDto } from './dtos/update-attendance.dto';
import { PageResponse } from '../../utils/pageables/page-response.utils';
import { AttendanceEntity } from './attendance.entity';

import { AuthGuard } from '../../guards/user.guard';

const mockAttendance = {
  id: 'attendance-id',
  userId: 'user-id',
  eventId: 'event-id',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('AttendanceController', () => {
  let controller: AttendanceController;
  let service: DeepMocked<AttendanceService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttendanceController],
      providers: [
        {
          provide: AttendanceService,
          useValue: createMock<AttendanceService>(),
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AttendanceController>(AttendanceController);
    service = module.get(AttendanceService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllAttendance', () => {
    it('should return all attendance', async () => {
      const filters = new AttendanceFilterDto();
      filters.pageNumber = 1;
      filters.pageSize = 10;

      const response = new PageResponse<AttendanceEntity>(
        filters,
        [mockAttendance],
        10,
      );
      service.findAllAttendance.mockResolvedValue(response);

      const result = await controller.getAllAttendance(filters);

      expect(service.findAllAttendance).toHaveBeenCalledWith(filters);
      expect(result).toEqual(response);
    });
  });

  describe('createAttendance', () => {
    it('should create attendance', async () => {
      const dto: CreateAttendanceDto = {
        userId: 'user-id',
        eventId: 'event-id',
      };
      service.createAttendance.mockResolvedValue(mockAttendance);

      const result = await controller.createAttendance(dto);

      expect(service.createAttendance).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockAttendance);
    });
  });

  describe('getAttendanceById', () => {
    it('should return attendance by id', async () => {
      service.findAttendanceByIdOrThrow.mockResolvedValue(mockAttendance);

      const result = await controller.getAttendanceById(mockAttendance.id);

      expect(service.findAttendanceByIdOrThrow).toHaveBeenCalledWith(
        mockAttendance.id,
      );
      expect(result).toEqual(mockAttendance);
    });
  });

  describe('getAttendanceByUserId', () => {
    it('should return attendance by user id', async () => {
      service.findAttendanceByUserId.mockResolvedValue([mockAttendance]);

      const result = await controller.getAttendanceByUserId('user-id');

      expect(service.findAttendanceByUserId).toHaveBeenCalledWith('user-id');
      expect(result).toEqual([mockAttendance]);
    });
  });

  describe('getAttendanceByEventId', () => {
    it('should return attendance by event id', async () => {
      service.findAttendanceByEventId.mockResolvedValue([mockAttendance]);

      const result = await controller.getAttendanceByEventId('event-id');

      expect(service.findAttendanceByEventId).toHaveBeenCalledWith('event-id');
      expect(result).toEqual([mockAttendance]);
    });
  });

  describe('updateAttendance', () => {
    it('should update attendance', async () => {
      const dto: UpdateAttendanceDto = { userId: 'new-user-id' };
      const updatedAttendance = { ...mockAttendance, ...dto };
      service.updateAttendance.mockResolvedValue(updatedAttendance);

      const result = await controller.updateAttendance(mockAttendance.id, dto);

      expect(service.updateAttendance).toHaveBeenCalledWith(
        mockAttendance.id,
        dto,
      );
      expect(result).toEqual(updatedAttendance);
    });
  });

  describe('deleteAttendance', () => {
    it('should delete attendance', async () => {
      service.deleteAttendance.mockResolvedValue(mockAttendance);

      const result = await controller.deleteAttendance(mockAttendance.id);

      expect(service.deleteAttendance).toHaveBeenCalledWith(mockAttendance.id);
      expect(result).toEqual(mockAttendance);
    });
  });
});
