import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventFilterDto } from './dto/event-filter.dto';
import { EventRepository } from './event.repository';
import { EventRecommendationService } from './event-recommendation.service';
import { checkExists } from 'src/utils';
import { AttendanceService } from '../attendance/attendance.service';

@Injectable()
export class EventService {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly attendanceService: AttendanceService,
    private readonly recommendationService: EventRecommendationService,
  ) {}

  async findPageableEvents(pageRequest: EventFilterDto) {
    const [events, totalCount] = await Promise.all([this.eventRepository.findPageableEvents(
      pageRequest), this.eventRepository.countEvents(pageRequest)]);
    return  pageRequest.toPageResponse(events, totalCount);
  }

  async findEventByIdOrThrow(eventId: string) {
    return checkExists(
      this.eventRepository.findEventById(eventId),
      'Event not found',
    );
  }

  async createEvent(createEventDto: CreateEventDto) {
    return this.eventRepository.createEvent(createEventDto);
  }

  async updateEvent(eventId: string, updateEventDto: UpdateEventDto) {
    await this.findEventByIdOrThrow(eventId);
    return this.eventRepository.updateEvent(eventId, updateEventDto);
  }

  async deleteEvent(eventId: string) {
    await this.findEventByIdOrThrow(eventId);
    return this.eventRepository.deleteEvent(eventId);
  }

  async findSimilarEvents(eventId: string, userId?: string, limit: number = 10) {
    await this.findEventByIdOrThrow(eventId);
    
    return this.recommendationService.getRecommendedEvents(eventId, userId, limit);
  }
}
