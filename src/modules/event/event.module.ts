import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { EventRepository } from './event.repository';
import { EventRecommendationService } from './event-recommendation.service';
import { AttendanceModule } from '../attendance/attendance.module';

@Module({
  imports: [AttendanceModule],
  controllers: [EventController],
  providers: [EventService, EventRepository, EventRecommendationService],
  exports: [EventService],
})
export class EventModule {}
