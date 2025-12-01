import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dtos/create-attendance.dto';
import { UpdateAttendanceDto } from './dtos/update-attendance.dto';
import { AttendanceFilterDto } from './dtos/attendance-filter.dto';
import { ResponseMessage } from '../../decorators';
import { AuthGuard } from '../../guards/user.guard';
import { ValidationPipe } from '../../pipes/validation.pipe';
import { createAttendanceSchema } from './schemas/create-attendance.schema';
import { updateAttendanceSchema } from './schemas/update-attendance.schema';

@ApiBearerAuth()
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get all attendance records with filtering' })
  @ApiResponse({ status: 200, description: 'List of attendance records' })
  @ResponseMessage('Attendance records retrieved successfully')
  async getAllAttendance(@Query() attendanceFilterDto: AttendanceFilterDto) {
    return this.attendanceService.findAllAttendance(attendanceFilterDto);
  }

  @Post()
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe(createAttendanceSchema))
  @ApiOperation({ summary: 'Create a new attendance record' })
  @ApiResponse({
    status: 201,
    description: 'Attendance record created successfully',
  })
  @ResponseMessage('Attendance record created successfully')
  async createAttendance(@Body() createAttendanceDto: CreateAttendanceDto) {
    return this.attendanceService.createAttendance(createAttendanceDto);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get attendance record by ID' })
  @ApiParam({ name: 'id', description: 'Attendance ID' })
  @ApiResponse({ status: 200, description: 'Attendance record found' })
  @ResponseMessage('Attendance record found successfully')
  async getAttendanceById(@Param('id') attendanceId: string) {
    return this.attendanceService.findAttendanceByIdOrThrow(attendanceId);
  }

  @Get('user/:userId')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get all attendance records for a user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User attendance records' })
  @ResponseMessage('User attendance records retrieved successfully')
  async getAttendanceByUserId(@Param('userId') userId: string) {
    return this.attendanceService.findAttendanceByUserId(userId);
  }

  @Get('event/:eventId')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get all attendance records for an event' })
  @ApiParam({ name: 'eventId', description: 'Event ID' })
  @ApiResponse({ status: 200, description: 'Event attendance records' })
  @ResponseMessage('Event attendance records retrieved successfully')
  async getAttendanceByEventId(@Param('eventId') eventId: string) {
    return this.attendanceService.findAttendanceByEventId(eventId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe(updateAttendanceSchema))
  @ApiOperation({ summary: 'Update attendance record by ID' })
  @ApiParam({ name: 'id', description: 'Attendance ID' })
  @ApiResponse({
    status: 200,
    description: 'Attendance record updated successfully',
  })
  @ResponseMessage('Attendance record updated successfully')
  async updateAttendance(
    @Param('id') attendanceId: string,
    @Body() updateAttendanceDto: UpdateAttendanceDto,
  ) {
    return this.attendanceService.updateAttendance(
      attendanceId,
      updateAttendanceDto,
    );
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Delete attendance record by ID' })
  @ApiParam({ name: 'id', description: 'Attendance ID' })
  @ApiResponse({
    status: 200,
    description: 'Attendance record deleted successfully',
  })
  @ResponseMessage('Attendance record deleted successfully')
  async deleteAttendance(@Param('id') attendanceId: string) {
    return this.attendanceService.deleteAttendance(attendanceId);
  }
}
