import { Injectable } from '@nestjs/common';
import { EventEntity } from '../../event.entity';
import { SimilarityStrategy } from './similarity-strategy.interface';
import { RECOMMENDATION_THRESHOLDS } from '../recommendation.config';

@Injectable()
export class LocationSimilarityStrategy implements SimilarityStrategy {
  calculate(event1: EventEntity, event2: EventEntity): number {
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

    return Math.max(0, 1 - distance / RECOMMENDATION_THRESHOLDS.maxDistance);
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
}
