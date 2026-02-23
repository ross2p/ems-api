import { Injectable } from '@nestjs/common';
import { EventService } from '../event.service';
import {
  RECOMMENDATION_CANDIDATE_CONFIG,
  RECOMMENDATION_THRESHOLDS,
  RECOMMENDATION_WEIGHTS,
} from './recommendation.config';
import { AttendanceService } from '../../attendance/attendance.service';
import { EventEntity } from '../event.entity';
import { CategorySimilarityStrategy } from './strategies/category-similarity.strategy';
import { LocationSimilarityStrategy } from './strategies/location-similarity.strategy';
import { TimeSimilarityStrategy } from './strategies/time-similarity.strategy';

import { EventWithScoreDto } from './dto/event-with-score.dto';

export interface SimilarUser {
  userId: string;
  similarity: number;
}

export interface RecommendationContext {
  currentEvent: EventEntity;
  userId?: string;
  excludeIds: string[];
  userEventIds: string[];
  similarUsers: SimilarUser[];
  similarUserEvents: EventEntity[][];
}

import { SimilarityStrategy } from './strategies/similarity-strategy.interface';

@Injectable()
export class EventRecommendationService {
  private readonly scoringPipeline: Array<{
    strategy: SimilarityStrategy;
    weight: number;
  }>;

  constructor(
    private readonly eventService: EventService,
    private readonly attendanceService: AttendanceService,
    private readonly categoryStrategy: CategorySimilarityStrategy,
    private readonly locationStrategy: LocationSimilarityStrategy,
    private readonly timeStrategy: TimeSimilarityStrategy,
  ) {
    this.scoringPipeline = [
      {
        strategy: this.categoryStrategy,
        weight: RECOMMENDATION_WEIGHTS.category,
      },
      {
        strategy: this.locationStrategy,
        weight: RECOMMENDATION_WEIGHTS.location,
      },
      { strategy: this.timeStrategy, weight: RECOMMENDATION_WEIGHTS.time },
    ];
  }

  async getRecommendedEvents(
    eventId: string,
    userId?: string,
    limit: number = RECOMMENDATION_THRESHOLDS.maxRecommendations,
  ): Promise<EventWithScoreDto[]> {
    const currentEvent = await this.eventService.findEventByIdOrThrow(eventId);

    const context = await this.buildContext(currentEvent, userId);
    const candidateEvents = await this.generateCandidates(context);

    if (candidateEvents.length === 0) {
      return [];
    }

    const eventsWithScores = this.scoreCandidates(candidateEvents, context);

    eventsWithScores.sort((a, b) => b.score - a.score);

    return eventsWithScores.slice(0, limit);
  }

  private async buildContext(
    currentEvent: EventEntity,
    userId?: string,
  ): Promise<RecommendationContext> {
    const excludeIds = [currentEvent.id];
    let userEventIds: string[] = [];
    let similarUsers: SimilarUser[] = [];
    let similarUserEvents: EventEntity[][] = [];

    if (userId) {
      const userEvents = await this.eventService.findUserAttendedEvents(userId);
      userEventIds = userEvents.map((e) => e.id);

      if (userEventIds.length > 0) {
        similarUsers = await this.findSimilarUsers(userId, userEventIds);

        if (similarUsers.length >= RECOMMENDATION_THRESHOLDS.minSimilarUsers) {
          const topSimilarUsers = similarUsers.slice(0, 10);
          similarUserEvents = await Promise.all(
            topSimilarUsers.map((su) =>
              this.eventService.findUserAttendedEvents(su.userId),
            ),
          );
        }
      }
    }

    return {
      currentEvent,
      userId,
      excludeIds,
      userEventIds,
      similarUsers,
      similarUserEvents,
    };
  }

  private async generateCandidates(
    context: RecommendationContext,
  ): Promise<EventEntity[]> {
    const candidatesMap = new Map<string, EventEntity>();
    const config = RECOMMENDATION_CANDIDATE_CONFIG;

    const [
      sameCategoryEvents,
      upcomingEvents,
      nearbyEvents,
      collaborativeEvents,
    ] = await Promise.all([
      context.currentEvent.categoryId
        ? this.eventService.findEventsByFilter({
            categoryId: context.currentEvent.categoryId,
            excludeEventIds: context.excludeIds,
            take: config.sameCategoryLimit,
          })
        : Promise.resolve([]),
      this.eventService.findEventsByFilter({
        startDate: context.currentEvent.startDate,
        endDate: new Date(
          new Date(context.currentEvent.startDate).getTime() +
            config.upcomingTimeRange,
        ),
        excludeEventIds: context.excludeIds,
        take: config.nearbyEventsLimit,
      }),
      context.currentEvent.latitude && context.currentEvent.longitude
        ? this.eventService.findEventsByFilter({
            latitude: context.currentEvent.latitude,
            longitude: context.currentEvent.longitude,
            radiusKm: RECOMMENDATION_THRESHOLDS.maxDistance,
            excludeEventIds: context.excludeIds,
            take: config.nearbyEventsLimit,
          })
        : Promise.resolve([]),
      context.userId
        ? this.getCollaborativeCandidates(context)
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
    context: RecommendationContext,
  ): Promise<EventEntity[]> {
    if (
      context.userEventIds.length === 0 ||
      context.similarUsers.length < RECOMMENDATION_THRESHOLDS.minSimilarUsers
    ) {
      return [];
    }

    const topSimilarUserEvents = context.similarUserEvents.slice(0, 5);
    const eventIdsSet = new Set<string>();

    topSimilarUserEvents.flat().forEach((event) => {
      if (
        !context.excludeIds.includes(event.id) &&
        !context.userEventIds.includes(event.id)
      ) {
        eventIdsSet.add(event.id);
      }
    });

    const collaborativeEventIds = Array.from(eventIdsSet);

    if (collaborativeEventIds.length === 0) {
      return [];
    }

    return this.eventService.findEventsByFilter({
      includeEventIds: collaborativeEventIds,
      excludeEventIds: context.excludeIds,
      take: 30,
    });
  }

  private scoreCandidates(
    candidates: EventEntity[],
    context: RecommendationContext,
  ): EventWithScoreDto[] {
    const similarUsersEventMap = new Map<string, number>();
    let maxCollaborativeScore = 1;

    if (
      context.userId &&
      context.userEventIds.length > 0 &&
      context.similarUsers.length >= RECOMMENDATION_THRESHOLDS.minSimilarUsers
    ) {
      const topSimilarUsers = context.similarUsers.slice(0, 10);

      topSimilarUsers.forEach((similarUser, index) => {
        const theirEvents = context.similarUserEvents[index];

        for (const event of theirEvents) {
          if (
            event.id === context.currentEvent.id ||
            context.userEventIds.includes(event.id)
          ) {
            continue;
          }

          const currentWeight = similarUsersEventMap.get(event.id) || 0;
          similarUsersEventMap.set(
            event.id,
            currentWeight + similarUser.similarity,
          );
        }
      });

      maxCollaborativeScore = Math.max(
        ...Array.from(similarUsersEventMap.values()),
        1,
      );
    }

    return candidates.map((candidate) => {
      const internalScore = this.scoringPipeline.reduce(
        (sum, { strategy, weight }) => {
          return (
            sum + strategy.calculate(context.currentEvent, candidate) * weight
          );
        },
        0,
      );

      const collaborativeRawScore = similarUsersEventMap.get(candidate.id) || 0;
      const collaborativeScore =
        (collaborativeRawScore / maxCollaborativeScore) *
        RECOMMENDATION_WEIGHTS.collaborative;

      const dto = new EventWithScoreDto();
      Object.assign(dto, candidate);
      dto.score = internalScore + collaborativeScore;
      return dto;
    });
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
