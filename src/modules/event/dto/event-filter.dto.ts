import { EventQueryDto } from './event-query.dto';

export class EventFilterDto extends EventQueryDto {
  radiusKm?: number;
  latitude?: number;
  longitude?: number;

  excludeEventIds?: string[];
  includeEventIds?: string[];
}
