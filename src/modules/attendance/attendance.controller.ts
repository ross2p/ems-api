import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dtos/create-attendance.dto';
import { UpdateAttendanceDto } from './dtos/update-attendance.dto';
import { AttendanceFilterDto } from './dtos/attendance-filter.dto';
import { AttendanceEntity } from './attendance.entity';
import {
  ApiAuth,
  ApiErrorResponse,
  ApiPageResponse,
  ApiSuccessResponse,
  ResponseMessage,
} from '../../decorators';
import { AuthGuard } from '../../guards/user.guard';
import { ValidationPipe } from '../../pipes/validation.pipe';
import { createAttendanceSchema } from './schemas/create-attendance.schema';
import { updateAttendanceSchema } from './schemas/update-attendance.schema';
import { uuidSchema } from '../../schemas/uuid.schema';
import { attendanceFilterSchema } from './schemas/attendance-filter.schema';

@ApiTags('Attendance')
@ApiAuth()
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Get attendances',
    description: 'Paginated attendances, optionally for one event.',
  })
  @ApiPageResponse({
    type: AttendanceEntity,
    description: 'Attendance records retrieved successfully',
  })
  @ApiErrorResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Invalid query parameters or access token is invalid or expired',
  })
  @ResponseMessage('Attendance records retrieved successfully')
  async getAllAttendance(
    @Query(new ValidationPipe(attendanceFilterSchema))
    attendanceFilterDto: AttendanceFilterDto,
  ) {
    return this.attendanceService.findAllAttendance(attendanceFilterDto);
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Create attendance',
    description: 'Registers a user for an event.',
  })
  @ApiSuccessResponse({
    type: AttendanceEntity,
    status: HttpStatus.CREATED,
    description: 'Attendance record created successfully',
  })
  @ApiErrorResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Validation failed, malformed JSON or access token is invalid or expired',
  })
  @ApiErrorResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User or event not found or access token user not found',
  })
  @ResponseMessage('Attendance record created successfully')
  async createAttendance(
    @Body(new ValidationPipe(createAttendanceSchema))
    createAttendanceDto: CreateAttendanceDto,
  ) {
    return this.attendanceService.createAttendance(createAttendanceDto);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get attendance by ID' })
  @ApiParam({
    name: 'id',
    description: 'Attendance identifier',
    format: 'uuid',
  })
  @ApiSuccessResponse({
    type: AttendanceEntity,
    description: 'Attendance record found successfully',
  })
  @ApiErrorResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid attendance ID or access token is invalid or expired',
  })
  @ApiErrorResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Attendance not found or access token user not found',
  })
  @ResponseMessage('Attendance record found successfully')
  async getAttendanceById(
    @Param('id', new ValidationPipe(uuidSchema)) attendanceId: string,
  ) {
    return this.attendanceService.findAttendanceByIdOrThrow(attendanceId);
  }

  @Get('user/:userId')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get attendances of a user' })
  @ApiParam({ name: 'userId', description: 'User identifier', format: 'uuid' })
  @ApiSuccessResponse({
    type: AttendanceEntity,
    isArray: true,
    description: 'User attendance records retrieved successfully',
  })
  @ApiErrorResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid user ID or access token is invalid or expired',
  })
  @ResponseMessage('User attendance records retrieved successfully')
  async getAttendanceByUserId(
    @Param('userId', new ValidationPipe(uuidSchema)) userId: string,
  ) {
    return this.attendanceService.findAttendanceByUserId(userId);
  }

  @Get('event/:eventId')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get attendances of an event' })
  @ApiParam({
    name: 'eventId',
    description: 'Event identifier',
    format: 'uuid',
  })
  @ApiSuccessResponse({
    type: AttendanceEntity,
    isArray: true,
    description: 'Event attendance records retrieved successfully',
  })
  @ApiErrorResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid event ID or access token is invalid or expired',
  })
  @ResponseMessage('Event attendance records retrieved successfully')
  async getAttendanceByEventId(
    @Param('eventId', new ValidationPipe(uuidSchema)) eventId: string,
  ) {
    return this.attendanceService.findAttendanceByEventId(eventId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Update attendance',
    description: 'Updates only the provided fields, at least one is required.',
  })
  @ApiParam({
    name: 'id',
    description: 'Attendance identifier',
    format: 'uuid',
  })
  @ApiSuccessResponse({
    type: AttendanceEntity,
    description: 'Attendance record updated successfully',
  })
  @ApiErrorResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Invalid attendance ID, validation failed, no fields given, malformed JSON or access token is invalid or expired',
  })
  @ApiErrorResponse({
    status: HttpStatus.NOT_FOUND,
    description:
      'Attendance, user or event not found or access token user not found',
  })
  @ResponseMessage('Attendance record updated successfully')
  async updateAttendance(
    @Param('id', new ValidationPipe(uuidSchema)) attendanceId: string,
    @Body(new ValidationPipe(updateAttendanceSchema))
    updateAttendanceDto: UpdateAttendanceDto,
  ) {
    return this.attendanceService.updateAttendance(
      attendanceId,
      updateAttendanceDto,
    );
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Delete attendance', description: 'Returns it.' })
  @ApiParam({
    name: 'id',
    description: 'Attendance identifier',
    format: 'uuid',
  })
  @ApiSuccessResponse({
    type: AttendanceEntity,
    description: 'Attendance record deleted successfully',
  })
  @ApiErrorResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid attendance ID or access token is invalid or expired',
  })
  @ApiErrorResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Attendance not found or access token user not found',
  })
  @ResponseMessage('Attendance record deleted successfully')
  async deleteAttendance(
    @Param('id', new ValidationPipe(uuidSchema)) attendanceId: string,
  ) {
    return this.attendanceService.deleteAttendance(attendanceId);
  }
}
