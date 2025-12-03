import { ApiProperty } from '@nestjs/swagger';
import { PageRequest } from 'src/utils/pageables/page-request.utils';

export class EventFilterDto extends PageRequest {
  @ApiProperty({
    description: 'Search by event title or description',
    required: false,
    example: 'team meeting',
  })
  search?: string;

  @ApiProperty({
    description: 'Filter by category ID',
    required: false,
    example: 'a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8',
  })
  categoryId?: string | null;

  @ApiProperty({
    description: 'Filter events starting from this date',
    required: false,
    type: Date,
    example: '2024-01-01T00:00:00Z',
  })
  startDate?: Date;

  @ApiProperty({
    description: 'Filter events ending before this date',
    required: false,
    type: Date,
    example: '2024-12-31T23:59:59Z',
  })
  endDate?: Date;

  @ApiProperty({
    description: 'Sort field (date refers to startDate)',
    required: false,
    enum: ['date', 'title', 'createdAt'],
    example: 'date',
  })
  sortBy?: 'date' | 'title' | 'createdAt';

  @ApiProperty({
    description: 'Sort order',
    required: false,
    enum: ['asc', 'desc'],
    example: 'asc',
  })
  sortOrder?: 'asc' | 'desc';

  radiusKm?: number;
  latitude?: number;
  longitude?: number;

  excludeEventIds: string[];
}
