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
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventFilterDto } from './dto/event-filter.dto';
import { ResponseMessage, UserDetails } from 'src/decorators';
import { AuthGuard } from 'src/guards/user.guard';
import { UserEntity } from '../user/user.entity';
import { ValidationPipe } from 'src/pipes/validation.pipe';
import { createEventSchema } from './schemas/create-event.schema';
import { updateEventSchema } from './schemas/update-event.schema';
import { uuidSchema } from 'src/schemas/uuid.schema';
import { EventRecommendationService } from './event-recommendation.service';

@ApiTags('Events')
@ApiBearerAuth()
@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService, 
    private readonly eventRecommendationService: EventRecommendationService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all events with pagination and filtering' })
  @ApiResponse({ status: 200, description: 'List of events' })
  @ResponseMessage('Events retrieved successfully')
  async getEvents(@Query() eventFilterDto: EventFilterDto) {
    return this.eventService.findPageableEvents(eventFilterDto);
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
  @ApiOperation({ summary: 'Get event by ID' })
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiResponse({ status: 200, description: 'Event found' })
  @ResponseMessage('Event found successfully')
  async getEventById(
    @Param('id', new ValidationPipe(uuidSchema)) eventId: string,
  ) {
    return this.eventService.findEventByIdOrThrow(eventId);
  }

  @Get(':id/similar')
  @ApiOperation({ 
    summary: 'Get similar events with personalized recommendations',
    description: 'Returns personalized event recommendations if user is authenticated. Uses collaborative filtering and content-based filtering.'
  })
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiResponse({ status: 200, description: 'Similar events retrieved' })
  @ResponseMessage('Similar events retrieved successfully')
  @UseGuards(AuthGuard)
  async getSimilarEvents(
    @Param('id', new ValidationPipe(uuidSchema)) eventId: string,
    @Query('limit') limit?: string,
    @UserDetails() user?: UserEntity,
  ) {
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    const userId = user?.id;
    
    return this.eventRecommendationService.getRecommendedEvents(eventId, userId, limitNumber);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe(updateEventSchema))
  @ApiOperation({ summary: 'Update event by ID' })
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiResponse({ status: 200, description: 'Event updated successfully' })
  @ResponseMessage('Event updated successfully')
  async updateEvent(
    @Param('id', new ValidationPipe(uuidSchema)) eventId: string,
    @Body() updateEventDto: UpdateEventDto,
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
