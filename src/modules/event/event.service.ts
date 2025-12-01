import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventFilterDto } from './dto/event-filter.dto';
import { EventRepository } from './event.repository';
import { checkExists } from 'src/utils';

@Injectable()
export class EventService {
  constructor(private readonly eventRepository: EventRepository) {}

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

  async findSimilarEvents(eventId: string) {
    const event = await this.findEventByIdOrThrow(eventId);

    const eventFilterDto = new EventFilterDto();
    eventFilterDto.categoryId = event.categoryId;
    eventFilterDto.excludeEventIds = [eventId];

    return this.findPageableEvents(eventFilterDto);
  }
}
