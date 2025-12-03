import { DatabaseService } from '../database/database.service';
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
      .addRadiusFilter(
        eventFilterDto.latitude,
        eventFilterDto.longitude,
        eventFilterDto.radiusKm,
      )
      .build();
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

  async findEventsByCategory(
    categoryId: string,
    excludeIds: string[],
    limit: number,
  ) {
    return this.eventRepository.findMany({
      where: {
        categoryId,
        id: {
          notIn: excludeIds,
        },
      },
      include: {
        category: true,
        createdBy: true,
      },
      take: limit,
      orderBy: {
        startDate: 'asc',
      },
    });
  }

  async findUpcomingEvents(
    startDate: Date,
    daysRange: number,
    excludeIds: string[],
    limit: number,
  ) {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + daysRange);

    return this.eventRepository.findMany({
      where: {
        startDate: {
          gte: startDate,
          lte: endDate,
        },
        id: {
          notIn: excludeIds,
        },
      },
      include: {
        category: true,
        createdBy: true,
      },
      take: limit,
      orderBy: {
        startDate: 'asc',
      },
    });
  }

  async findNearbyEvents(
    latitude: number,
    longitude: number,
    maxDistanceKm: number,
    excludeIds: string[],
    limit: number,
  ) {
    const latDelta = maxDistanceKm / 111;
    const lonDelta =
      maxDistanceKm / (111 * Math.cos((latitude * Math.PI) / 180));

    return this.eventRepository.findMany({
      where: {
        latitude: {
          gte: latitude - latDelta,
          lte: latitude + latDelta,
        },
        longitude: {
          gte: longitude - lonDelta,
          lte: longitude + lonDelta,
        },
        id: {
          notIn: excludeIds,
        },
      },
      include: {
        category: true,
        createdBy: true,
      },
      take: limit,
    });
  }

  async findEventsByMultipleIds(
    eventIds: string[],
    excludeIds: string[],
    limit: number,
  ) {
    return this.eventRepository.findMany({
      where: {
        id: {
          in: eventIds,
          notIn: excludeIds,
        },
      },
      include: {
        category: true,
        createdBy: true,
      },
      take: limit,
    });
  }
}
