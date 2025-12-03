import { Injectable } from '@nestjs/common';
import { AttendanceRepository } from './attendance.repository';
import { checkExists } from '../../utils';
import { CreateAttendanceDto } from './dtos/create-attendance.dto';
import { UpdateAttendanceDto } from './dtos/update-attendance.dto';
import { AttendanceFilterDto } from './dtos/attendance-filter.dto';

@Injectable()
export class AttendanceService {
  constructor(private attendanceRepository: AttendanceRepository) {}

  async createAttendance(createAttendanceDto: CreateAttendanceDto) {
    return this.attendanceRepository.createAttendance(createAttendanceDto);
  }

  async findAttendanceByIdOrThrow(attendanceId: string) {
    return checkExists(
      this.attendanceRepository.findAttendanceById(attendanceId),
      'Attendance not found',
    );
  }

  async findAllAttendance(attendanceFilterDto: AttendanceFilterDto) {
    return this.attendanceRepository.findAllAttendance(attendanceFilterDto);
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
    return this.attendanceRepository.updateAttendance(
      attendanceId,
      updateAttendanceDto,
    );
  }

  async deleteAttendance(attendanceId: string) {
    await this.findAttendanceByIdOrThrow(attendanceId);
    return this.attendanceRepository.deleteAttendance(attendanceId);
  }

  async findUsersWhoAttendedEvents(eventIds: string[]) {
    return this.attendanceRepository.findUsersWhoAttendedEvents(eventIds);
  }
}
