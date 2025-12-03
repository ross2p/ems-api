import { Injectable, NotFoundException } from '@nestjs/common';
import { EventRepository } from './event.repository';
import { RECOMMENDATION_CONFIG } from './recommendation.config';
import { AttendanceService } from '../attendance/attendance.service';
import { EventEntity } from './event.entity';

interface EventWithScore {
  event: EventEntity;
  score: number;
  details?: {
    categoryScore: number;
    locationScore: number;
    timeScore: number;
    collaborativeScore: number;
  };
}

interface SimilarUser {
  userId: string;
  similarity: number;
}

@Injectable()
export class EventRecommendationService {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly attendanceService: AttendanceService,
  ) {}

  async getRecommendedEvents(
    eventId: string,
    userId?: string,
    limit: number = RECOMMENDATION_CONFIG.maxRecommendations,
  ) {
    const currentEvent = await this.eventRepository.findEventById(eventId);

    if (!currentEvent) {
      throw new NotFoundException('Event not found');
    }

    const candidateEvents = await this.generateCandidates(currentEvent, userId);

    if (candidateEvents.length === 0) {
      return [];
    }

    const eventsWithScores: EventWithScore[] = [];

    for (const candidate of candidateEvents) {
      const categoryScore = this.calculateCategorySimilarity(
        currentEvent,
        candidate,
      );
      const locationScore = this.calculateLocationSimilarity(
        currentEvent,
        candidate,
      );
      const timeScore = this.calculateTimeSimilarity(currentEvent, candidate);

      const totalScore =
        categoryScore * RECOMMENDATION_CONFIG.weights.category +
        locationScore * RECOMMENDATION_CONFIG.weights.location +
        timeScore * RECOMMENDATION_CONFIG.weights.time;

      const details = {
        categoryScore,
        locationScore,
        timeScore,
        collaborativeScore: 0,
      };

      eventsWithScores.push({
        event: candidate,
        score: totalScore,
        details,
      });
    }

    if (userId) {
      await this.addCollaborativeScores(
        eventsWithScores,
        userId,
        currentEvent.id,
      );
    }

    eventsWithScores.sort((a, b) => b.score - a.score);

    return eventsWithScores.slice(0, limit).map((item) => item.event);
  }

  private async generateCandidates(
    currentEvent: EventEntity,
    userId?: string,
  ): Promise<EventEntity[]> {
    const excludeIds = [currentEvent.id];
    const candidatesMap = new Map<string, EventEntity>();
    const config = RECOMMENDATION_CONFIG.candidateGeneration;

    const [
      sameCategoryEvents,
      upcomingEvents,
      nearbyEvents,
      collaborativeEvents,
    ] = await Promise.all([
      currentEvent.categoryId
        ? this.eventRepository.findEventsByCategory(
            currentEvent.categoryId,
            excludeIds,
            config.sameCategoryLimit,
          )
        : Promise.resolve([]),
      this.eventRepository.findUpcomingEvents(
        new Date(currentEvent.startDate),
        config.upcomingDaysRange,
        excludeIds,
        config.nearbyEventsLimit,
      ),
      currentEvent.latitude && currentEvent.longitude
        ? this.eventRepository.findNearbyEvents(
            currentEvent.latitude,
            currentEvent.longitude,
            RECOMMENDATION_CONFIG.maxDistance,
            excludeIds,
            config.nearbyEventsLimit,
          )
        : Promise.resolve([]),
      userId
        ? this.getCollaborativeCandidates(userId, excludeIds)
        : Promise.resolve([]),
    ]);

    [
      ...sameCategoryEvents,
      ...upcomingEvents,
      ...nearbyEvents,
      ...collaborativeEvents,
    ].forEach((event) => {
      if (!candidatesMap.has(event.id)) {
        candidatesMap.set(event.id, event);
      }
    });

    const candidates = Array.from(candidatesMap.values());

    if (candidates.length > config.maxCandidates) {
      return candidates.slice(0, config.maxCandidates);
    }

    return candidates;
  }

  private async getCollaborativeCandidates(
    userId: string,
    excludeIds: string[],
  ): Promise<EventEntity[]> {
    const userEvents =
      await this.eventRepository.findUserAttendedEvents(userId);

    if (userEvents.length === 0) {
      return [];
    }

    const userEventIds = userEvents.map((e) => e.id);
    const similarUsers = await this.findSimilarUsers(userId, userEventIds);

    if (similarUsers.length < RECOMMENDATION_CONFIG.minSimilarUsers) {
      return [];
    }

    const topSimilarUsers = similarUsers.slice(0, 5);

    const eventIdsSet = new Set<string>();

    const allSimilarUserEvents = await Promise.all(
      topSimilarUsers.map((su) =>
        this.eventRepository.findUserAttendedEvents(su.userId),
      ),
    );

    allSimilarUserEvents.flat().forEach((event) => {
      if (!excludeIds.includes(event.id) && !userEventIds.includes(event.id)) {
        eventIdsSet.add(event.id);
      }
    });

    const collaborativeEventIds = Array.from(eventIdsSet);

    if (collaborativeEventIds.length === 0) {
      return [];
    }

    return this.eventRepository.findEventsByMultipleIds(
      collaborativeEventIds,
      excludeIds,
      30,
    );
  }

  private calculateCategorySimilarity(
    event1: EventEntity,
    event2: EventEntity,
  ): number {
    if (!event1.categoryId || !event2.categoryId) {
      return 0;
    }
    return event1.categoryId === event2.categoryId ? 1 : 0;
  }

  private calculateLocationSimilarity(
    event1: EventEntity,
    event2: EventEntity,
  ): number {
    if (
      !event1.latitude ||
      !event1.longitude ||
      !event2.latitude ||
      !event2.longitude
    ) {
      return 0;
    }

    const distance = this.calculateDistance(
      event1.latitude,
      event1.longitude,
      event2.latitude,
      event2.longitude,
    );

    const score = Math.max(0, 1 - distance / RECOMMENDATION_CONFIG.maxDistance);
    return score;
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371;
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private calculateTimeSimilarity(
    event1: EventEntity,
    event2: EventEntity,
  ): number {
    const date1 = new Date(event1.startDate);
    const date2 = new Date(event2.startDate);

    const dayOfWeek1 = date1.getDay();
    const dayOfWeek2 = date2.getDay();
    const dayDifference = Math.abs(dayOfWeek1 - dayOfWeek2);

    const daySimilarity = Math.max(0, 1 - dayDifference / 3.5);

    // Time of day similarity (0-1)
    const hour1 = date1.getHours();
    const hour2 = date2.getHours();
    const hourDifference = Math.abs(hour1 - hour2);
    // Normalize: same hour = 1, 12 hours apart = 0
    const timeSimilarity = Math.max(0, 1 - hourDifference / 12);

    // Combine both factors (equal weight)
    return (daySimilarity + timeSimilarity) / 2;
  }

  private async addCollaborativeScores(
    eventsWithScores: EventWithScore[],
    userId: string,
    currentEventId: string,
  ): Promise<void> {
    const userEvents =
      await this.eventRepository.findUserAttendedEvents(userId);

    if (userEvents.length === 0) {
      return;
    }

    const userEventIds = userEvents.map((e) => e.id);
    const similarUsers = await this.findSimilarUsers(userId, userEventIds);

    if (similarUsers.length < RECOMMENDATION_CONFIG.minSimilarUsers) {
      return;
    }

    const similarUsersEventMap = new Map<string, number>();

    const topSimilarUsers = similarUsers.slice(0, 10);

    const allSimilarUserEvents = await Promise.all(
      topSimilarUsers.map((su) =>
        this.eventRepository.findUserAttendedEvents(su.userId),
      ),
    );

    topSimilarUsers.forEach((similarUser, index) => {
      const theirEvents = allSimilarUserEvents[index];

      for (const event of theirEvents) {
        if (event.id === currentEventId || userEventIds.includes(event.id)) {
          continue;
        }

        const currentWeight = similarUsersEventMap.get(event.id) || 0;
        similarUsersEventMap.set(
          event.id,
          currentWeight + similarUser.similarity,
        );
      }
    });

    const maxCollaborativeScore = Math.max(
      ...Array.from(similarUsersEventMap.values()),
      1,
    );

    for (const eventWithScore of eventsWithScores) {
      const collaborativeRawScore =
        similarUsersEventMap.get(eventWithScore.event.id) || 0;
      const collaborativeScore = collaborativeRawScore / maxCollaborativeScore;

      if (eventWithScore.details) {
        eventWithScore.details.collaborativeScore = collaborativeScore;
      }

      eventWithScore.score +=
        collaborativeScore * RECOMMENDATION_CONFIG.weights.collaborative;
    }
  }

  private async findSimilarUsers(
    userId: string,
    userEventIds: string[],
  ): Promise<SimilarUser[]> {
    const attendances =
      await this.attendanceService.findUsersWhoAttendedEvents(userEventIds);

    const userEventMap = new Map<string, Set<string>>();

    for (const attendance of attendances) {
      if (attendance.userId === userId) {
        continue;
      }

      if (!userEventMap.has(attendance.userId)) {
        userEventMap.set(attendance.userId, new Set());
      }
      userEventMap.get(attendance.userId)!.add(attendance.eventId);
    }

    const similarUsers: SimilarUser[] = [];
    const userEventSet = new Set(userEventIds);

    for (const [otherUserId, otherUserEvents] of userEventMap.entries()) {
      const intersection = new Set(
        [...userEventSet].filter((x) => otherUserEvents.has(x)),
      );
      const union = new Set([...userEventSet, ...otherUserEvents]);

      const similarity = intersection.size / union.size;

      if (similarity > 0) {
        similarUsers.push({
          userId: otherUserId,
          similarity,
        });
      }
    }

    similarUsers.sort((a, b) => b.similarity - a.similarity);

    return similarUsers;
  }
}
