import { ApiProperty } from '@nestjs/swagger';
import { EventEntity } from '../../event.entity';

export class EventWithScoreDto extends EventEntity {
  @ApiProperty({
    description: 'Calculated recommendation relevance score',
    example: 0.85,
  })
  score: number;
}
