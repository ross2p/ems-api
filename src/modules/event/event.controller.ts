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
import { ApiOperation, ApiTags, ApiParam } from '@nestjs/swagger';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventFilterDto } from './dto/event-filter.dto';
import { EventDetailsDto, EventListItemDto } from './dto/event-response.dto';
import { EventEntity } from './event.entity';
import {
  ApiAuth,
  ApiErrorResponse,
  ApiPageResponse,
  ApiSuccessResponse,
  ResponseMessage,
  UserDetails,
} from '../../decorators';
import { AuthGuard } from '../../guards/user.guard';
import { UserEntity } from '../user/user.entity';
import { ValidationPipe } from '../../pipes/validation.pipe';
import { createEventSchema } from './schemas/create-event.schema';
import { updateEventSchema } from './schemas/update-event.schema';
import { uuidSchema } from '../../schemas/uuid.schema';
import { EventQueryDto } from './dto/event-query.dto';
import { eventQuerySchema } from './schemas/event-query.schema';

@ApiTags('Events')
@ApiAuth()
@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Get events',
    description: 'Paginated events with search, filters and sorting.',
  })
  @ApiPageResponse({
    type: EventListItemDto,
    description: 'Events retrieved successfully',
  })
  @ApiErrorResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Invalid query parameters or access token is invalid or expired',
  })
  @ResponseMessage('Events retrieved successfully')
  async getEvents(
    @Query(new ValidationPipe(eventQuerySchema)) query: EventQueryDto,
  ) {
    return this.eventService.findPageableEvents(query as EventFilterDto);
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Create event',
    description: 'Creates an event owned by the current user.',
  })
  @ApiSuccessResponse({
    type: EventEntity,
    status: HttpStatus.CREATED,
    description: 'Event created successfully',
  })
  @ApiErrorResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Validation failed, malformed JSON or access token is invalid or expired',
  })
  @ApiErrorResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Category not found or access token user not found',
  })
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
  @ApiOperation({
    summary: 'Get event by ID',
    description: 'Event with its category and creator.',
  })
  @ApiParam({ name: 'id', description: 'Event identifier', format: 'uuid' })
  @ApiSuccessResponse({
    type: EventDetailsDto,
    description: 'Event found successfully',
  })
  @ApiErrorResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid event ID or access token is invalid or expired',
  })
  @ApiErrorResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Event not found or access token user not found',
  })
  @ResponseMessage('Event found successfully')
  async getEventById(
    @Param('id', new ValidationPipe(uuidSchema)) eventId: string,
  ) {
    return this.eventService.findEventByIdOrThrow(eventId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Update event',
    description: 'Updates only the provided fields.',
  })
  @ApiParam({ name: 'id', description: 'Event identifier', format: 'uuid' })
  @ApiSuccessResponse({
    type: EventEntity,
    description: 'Event updated successfully',
  })
  @ApiErrorResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Invalid event ID, validation failed, malformed JSON or access token is invalid or expired',
  })
  @ApiErrorResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Event or category not found or access token user not found',
  })
  @ResponseMessage('Event updated successfully')
  async updateEvent(
    @Param('id', new ValidationPipe(uuidSchema)) eventId: string,
    @Body(new ValidationPipe(updateEventSchema)) updateEventDto: UpdateEventDto,
  ) {
    return this.eventService.updateEvent(eventId, updateEventDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Delete event',
    description: 'Deletes the event and its attendances, returns the event.',
  })
  @ApiParam({ name: 'id', description: 'Event identifier', format: 'uuid' })
  @ApiSuccessResponse({
    type: EventEntity,
    description: 'Event deleted successfully',
  })
  @ApiErrorResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid event ID or access token is invalid or expired',
  })
  @ApiErrorResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Event not found or access token user not found',
  })
  @ResponseMessage('Event deleted successfully')
  async deleteEvent(
    @Param('id', new ValidationPipe(uuidSchema)) eventId: string,
  ) {
    return this.eventService.deleteEvent(eventId);
  }
}
