import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { EventEntity } from './event.entity';
import { UpdateEventDto } from './dto/update-event.dto';
import { PageRequest } from 'src/utils/pageables/page-request.utils';
import { EventFilterDto } from './dto/event-filter.dto';
import { EventRepository } from './event.repository';
import { checkExists } from 'src/utils';

@Injectable()
export class EventService {
  constructor(private readonly eventRepository: EventRepository) {}

  async findPageableEvents(pageRequest: EventFilterDto) {
    return this.eventRepository.findPageableEvents(pageRequest);
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
}
