import { DatabaseService } from 'src/database/database.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventFilterDto } from './dto/event-filter.dto';
import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma';
import { EventFilterBuilder } from './event-filter.builder';

@Injectable()
export class EventRepository {
  private readonly eventRepository: Prisma.EventDelegate;
  
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
    return this.eventRepository.findUnique({
      where: { id: eventId },
      include: {
        category: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  private getFilter(eventFilterDto: EventFilterDto) {
    return new EventFilterBuilder()
      .addSearch(eventFilterDto.search)
      .addCategoryFilter(eventFilterDto.categoryId)
      .addDateRangeFilter(eventFilterDto.startDate, eventFilterDto.endDate)
      .addSorting(eventFilterDto.sortBy, eventFilterDto.sortOrder)
      .addExcludeEventIds(eventFilterDto.excludeEventIds)
      .build() 
  }

  async findPageableEvents(eventFilterDto: EventFilterDto) {
    const { where, orderBy } = this.getFilter(eventFilterDto);
    return this.eventRepository.findMany({
      where,
      orderBy,
      skip: eventFilterDto.skip,
      take: eventFilterDto.take,
      include: {
        category: true,
        createdBy: true,
      },
    });
  }

  async countEvents(eventFilterDto: EventFilterDto) {
    const { where } = this.getFilter(eventFilterDto);
    return this.eventRepository.count({ where });
  }
  
  async findUserAttendedEvents(userId: string) {
    return this.eventRepository.findMany({
      where: {
        attendances: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        category: true,
      },
    });
  }

  async findEventsByIds(eventIds: string[]) {
    return this.eventRepository.findMany({
      where: {
        id: {
          in: eventIds,
        },
      },
      include: {
        category: true,
        createdBy: true
      },
    });
  }

  async findAllEventsExcept(excludeIds: string[]) {
    return this.eventRepository.findMany({
      where: {
        id: {
          notIn: excludeIds,
        },
      },
      include: {
        category: true,
        createdBy: true
      },
    });
  }
}
