import { Module } from '@nestjs/common';
import { EventRecommendationService } from './event-recommendation.service';
import { EventRecommendationController } from './event-recommendation.controller';
import { CategorySimilarityStrategy } from './strategies/category-similarity.strategy';
import { LocationSimilarityStrategy } from './strategies/location-similarity.strategy';
import { TimeSimilarityStrategy } from './strategies/time-similarity.strategy';
import { EventModule } from '../event.module';
import { AttendanceModule } from '../../attendance/attendance.module';

@Module({
  imports: [EventModule, AttendanceModule],
  controllers: [EventRecommendationController],
  providers: [
    EventRecommendationService,
    CategorySimilarityStrategy,
    LocationSimilarityStrategy,
    TimeSimilarityStrategy,
  ],
  exports: [EventRecommendationService],
})
export class EventRecommendationModule {}
