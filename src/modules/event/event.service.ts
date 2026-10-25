import { Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventFilterDto } from './dto/event-filter.dto';
import { EventRepository } from './event.repository';
import { checkExists } from '../../utils';
import { CategoryService } from '../category/category.service';

@Injectable()
export class EventService {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly categoryService: CategoryService,
  ) {}

  async findPageableEvents(pageRequest: EventFilterDto) {
    const [events, totalCount] = await Promise.all([
      this.eventRepository.findPageableEvents(pageRequest),
      this.eventRepository.countEvents(pageRequest),
    ]);
    return pageRequest.toPageResponse(events, totalCount);
  }

  async findEventByIdOrThrow(eventId: string) {
    return checkExists(
      this.eventRepository.findEventById(eventId),
      'Event not found',
    );
  }

  async createEvent(createEventDto: CreateEventDto) {
    await this.checkCategoryExists(createEventDto.categoryId);
    return this.eventRepository.createEvent(createEventDto);
  }

  async updateEvent(eventId: string, updateEventDto: UpdateEventDto) {
    await this.findEventByIdOrThrow(eventId);
    await this.checkCategoryExists(updateEventDto.categoryId);
    return this.eventRepository.updateEvent(eventId, updateEventDto);
  }

  async deleteEvent(eventId: string) {
    await this.findEventByIdOrThrow(eventId);
    return this.eventRepository.deleteEvent(eventId);
  }

  private async checkCategoryExists(categoryId?: string | null) {
    if (categoryId) {
      await this.categoryService.findCategoryByIdOrThrow(categoryId);
    }
  }

  async findUserAttendedEvents(userId: string) {
    return this.eventRepository.findUserAttendedEvents(userId);
  }

  async findEventsByFilter(filter: Partial<EventFilterDto>) {
    return this.eventRepository.findEventsByFilter(filter);
  }
}
