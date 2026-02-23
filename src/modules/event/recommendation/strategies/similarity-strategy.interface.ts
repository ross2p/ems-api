import { EventEntity } from '../../event.entity';

export interface SimilarityStrategy {
  calculate(event1: EventEntity, event2: EventEntity): number;
}
