import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { AttendanceRepository } from './attendance.repository';
import { checkExists } from '../../utils';
import { CreateAttendanceDto } from './dtos/create-attendance.dto';
import { UpdateAttendanceDto } from './dtos/update-attendance.dto';
import { AttendanceFilterDto } from './dtos/attendance-filter.dto';
import { PageResponse } from '../../utils/pageables/page-response.utils';
import { UserService } from '../user/user.service';
import { EventService } from '../event/event.service';

@Injectable()
export class AttendanceService {
  constructor(
    private readonly attendanceRepository: AttendanceRepository,
    private readonly userService: UserService,
    @Inject(forwardRef(() => EventService))
    private readonly eventService: EventService,
  ) {}

  async createAttendance(createAttendanceDto: CreateAttendanceDto) {
    await this.checkRelationsExist(createAttendanceDto);
    return this.attendanceRepository.createAttendance(createAttendanceDto);
  }

  async findAttendanceByIdOrThrow(attendanceId: string) {
    return checkExists(
      this.attendanceRepository.findAttendanceById(attendanceId),
      'Attendance not found',
    );
  }

  async findAllAttendance(attendanceFilterDto: AttendanceFilterDto) {
    const { attendances, count } =
      await this.attendanceRepository.findAllAttendance(attendanceFilterDto);
    return new PageResponse(attendanceFilterDto, attendances, count);
  }

  async findAttendanceByUserId(userId: string) {
    return this.attendanceRepository.findAttendanceByUserId(userId);
  }

  async findAttendanceByEventId(eventId: string) {
    return this.attendanceRepository.findAttendanceByEventId(eventId);
  }

  async updateAttendance(
    attendanceId: string,
    updateAttendanceDto: UpdateAttendanceDto,
  ) {
    await this.findAttendanceByIdOrThrow(attendanceId);
    await this.checkRelationsExist(updateAttendanceDto);
    return this.attendanceRepository.updateAttendance(
      attendanceId,
      updateAttendanceDto,
    );
  }

  async deleteAttendance(attendanceId: string) {
    await this.findAttendanceByIdOrThrow(attendanceId);
    return this.attendanceRepository.deleteAttendance(attendanceId);
  }

  private async checkRelationsExist({ userId, eventId }: UpdateAttendanceDto) {
    if (userId) {
      await this.userService.findUserByIdOrThrow(userId);
    }
    if (eventId) {
      await this.eventService.findEventByIdOrThrow(eventId);
    }
  }

  async findUsersWhoAttendedEvents(eventIds: string[]) {
    return this.attendanceRepository.findUsersWhoAttendedEvents(eventIds);
  }
}
