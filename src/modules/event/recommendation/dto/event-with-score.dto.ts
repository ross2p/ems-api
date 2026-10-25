import { ApiProperty } from '@nestjs/swagger';
import { EventListItemDto } from '../../dto/event-response.dto';

export class EventWithScoreDto extends EventListItemDto {
  @ApiProperty({
    description: 'Recommendation relevance score, higher is more relevant',
    type: Number,
  })
  score: number;
}
