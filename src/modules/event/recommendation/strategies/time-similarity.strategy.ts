import { Injectable } from '@nestjs/common';
import { EventEntity } from '../../event.entity';
import { SimilarityStrategy } from './similarity-strategy.interface';

@Injectable()
export class TimeSimilarityStrategy implements SimilarityStrategy {
  calculate(event1: EventEntity, event2: EventEntity): number {
    const date1 = new Date(event1.startDate);
    const date2 = new Date(event2.startDate);

    const dayDifference = Math.abs(date1.getDay() - date2.getDay());
    const daySimilarity = Math.max(0, 1 - dayDifference / 3.5);

    const hourDifference = Math.abs(date1.getHours() - date2.getHours());
    const timeSimilarity = Math.max(0, 1 - hourDifference / 12);

    return (daySimilarity + timeSimilarity) / 2;
  }
}
