import { Injectable } from '@nestjs/common';
import { EventEntity } from '../../event.entity';
import { SimilarityStrategy } from './similarity-strategy.interface';

@Injectable()
export class CategorySimilarityStrategy implements SimilarityStrategy {
  calculate(event1: EventEntity, event2: EventEntity): number {
    if (!event1.categoryId || !event2.categoryId) {
      return 0;
    }
    return event1.categoryId === event2.categoryId ? 1 : 0;
  }
}
