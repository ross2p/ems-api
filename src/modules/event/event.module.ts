import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { EventRepository } from './event.repository';
import { EventRecommendationService } from './recommendation/event-recommendation.service';
import { AttendanceModule } from '../attendance/attendance.module';
import { CategorySimilarityStrategy } from './recommendation/strategies/category-similarity.strategy';
import { LocationSimilarityStrategy } from './recommendation/strategies/location-similarity.strategy';
import { TimeSimilarityStrategy } from './recommendation/strategies/time-similarity.strategy';

@Module({
  imports: [AttendanceModule],
  controllers: [EventController],
  providers: [
    EventService,
    EventRepository,
    EventRecommendationService,
    CategorySimilarityStrategy,
    LocationSimilarityStrategy,
    TimeSimilarityStrategy,
  ],
  exports: [EventService],
})
export class EventModule {}
