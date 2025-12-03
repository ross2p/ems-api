import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateAttendanceDto } from './dtos/create-attendance.dto';
import { UpdateAttendanceDto } from './dtos/update-attendance.dto';
import { AttendanceFilterDto } from './dtos/attendance-filter.dto';

@Injectable()
export class AttendanceRepository {
  private readonly attendanceRepository;

  constructor(db: DatabaseService) {
    this.attendanceRepository = db.attendance;
  }

  async createAttendance(data: CreateAttendanceDto) {
    return this.attendanceRepository.create({ data });
  }

  async findAttendanceById(attendanceId: string) {
    return this.attendanceRepository.findUnique({
      where: { id: attendanceId },
    });
  }

  async findAllAttendance(attendanceFilterDto: AttendanceFilterDto) {
    return this.attendanceRepository.findMany({
      where: { eventId: attendanceFilterDto.eventId },
      skip: attendanceFilterDto.skip,
      take: attendanceFilterDto.pageSize,
    });
  }

  async findAttendanceByUserId(userId: string) {
    return this.attendanceRepository.findMany({
      where: { userId },
    });
  }

  async findAttendanceByEventId(eventId: string) {
    return this.attendanceRepository.findMany({
      where: { eventId },
    });
  }

  async updateAttendance(attendanceId: string, data: UpdateAttendanceDto) {
    return this.attendanceRepository.update({
      where: { id: attendanceId },
      data,
    });
  }

  async deleteAttendance(attendanceId: string) {
    return this.attendanceRepository.delete({
      where: { id: attendanceId },
    });
  }

  async findUsersWhoAttendedEvents(eventIds: string[]) {
    const attendances = await this.attendanceRepository.findMany({
      where: {
        eventId: {
          in: eventIds,
        },
      },
    });
    return attendances;
  }
}
