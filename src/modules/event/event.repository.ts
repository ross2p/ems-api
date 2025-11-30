import { DatabaseService } from 'src/database/database.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventFilterDto } from './dto/event-filter.dto';
import { Injectable } from '@nestjs/common';


@Injectable()
export class EventRepository {
  private readonly eventRepository;
  constructor(db: DatabaseService) {
    this.eventRepository = db.event;
  }

  async createEvent(data: CreateEventDto) {
    return this.eventRepository.create({ data });
  }

  async updateEvent(eventId: string, data: UpdateEventDto) {
    return this.eventRepository.update({ where: { id: eventId }, data });
  }

  async deleteEvent(eventId: string) {
    return this.eventRepository.delete({ where: { id: eventId } });
  }

  async findEventById(eventId: string) {
    return this.eventRepository.findUnique({ where: { id: eventId } });
  }

  async findPageableEvents(filters: EventFilterDto) {
    return this.eventRepository.findMany({});
  }
}
