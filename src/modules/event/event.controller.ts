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
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventFilterDto } from './dto/event-filter.dto';
import { ResponseMessage, UserDetails } from '../../decorators';
import { AuthGuard } from '../../guards/user.guard';
import { UserEntity } from '../user/user.entity';
import { ValidationPipe } from '../../pipes/validation.pipe';
import { createEventSchema } from './schemas/create-event.schema';
import { updateEventSchema } from './schemas/update-event.schema';
import { uuidSchema } from '../../schemas/uuid.schema';
import { EventQueryDto } from './dto/event-query.dto';
import { eventQuerySchema } from './schemas/event-query.schema';

@ApiTags('Events')
@ApiBearerAuth()
@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get all events with pagination and filtering' })
  @ApiResponse({ status: 200, description: 'List of events' })
  @ResponseMessage('Events retrieved successfully')
  async getEvents(
    @Query(new ValidationPipe(eventQuerySchema)) query: EventQueryDto,
  ) {
    return this.eventService.findPageableEvents(query as EventFilterDto);
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Create a new event' })
  @ApiResponse({ status: 201, description: 'Event created successfully' })
  @ResponseMessage('Event created successfully')
  async createEvent(
    @Body(new ValidationPipe(createEventSchema)) createEventDto: CreateEventDto,
    @UserDetails() user: UserEntity,
  ) {
    createEventDto.createdById = user.id;
    return this.eventService.createEvent(createEventDto);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get event by ID' })
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiResponse({ status: 200, description: 'Event found' })
  @ResponseMessage('Event found successfully')
  async getEventById(
    @Param('id', new ValidationPipe(uuidSchema)) eventId: string,
  ) {
    return this.eventService.findEventByIdOrThrow(eventId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Update event by ID' })
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiResponse({ status: 200, description: 'Event updated successfully' })
  @ResponseMessage('Event updated successfully')
  async updateEvent(
    @Param('id', new ValidationPipe(uuidSchema)) eventId: string,
    @Body(new ValidationPipe(updateEventSchema)) updateEventDto: UpdateEventDto,
  ) {
    return this.eventService.updateEvent(eventId, updateEventDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Delete event by ID' })
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiResponse({ status: 200, description: 'Event deleted successfully' })
  @ResponseMessage('Event deleted successfully')
  async deleteEvent(
    @Param('id', new ValidationPipe(uuidSchema)) eventId: string,
  ) {
    return this.eventService.deleteEvent(eventId);
  }
}
