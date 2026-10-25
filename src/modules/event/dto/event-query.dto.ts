import { ApiProperty } from '@nestjs/swagger';
import { PageRequest } from '../../../utils/pageables/page-request.utils';

export class EventQueryDto extends PageRequest {
  @ApiProperty({
    description: 'Search in event title and description',
    required: false,
    minLength: 1,
    maxLength: 255,
    example: 'react',
  })
  search?: string;

  @ApiProperty({
    description: 'Filter by category identifier',
    format: 'uuid',
    required: false,
  })
  categoryId?: string;

  @ApiProperty({
    description: 'Only events starting from this moment',
    type: String,
    format: 'date-time',
    required: false,
  })
  startDate?: Date;

  @ApiProperty({
    description: 'Only events ending before this moment',
    type: String,
    format: 'date-time',
    required: false,
  })
  endDate?: Date;

  @ApiProperty({
    description: 'Sort field, "date" means startDate',
    required: false,
    enum: ['date', 'title', 'createdAt'],
  })
  sortBy?: 'date' | 'title' | 'createdAt';

  @ApiProperty({
    description: 'Sort direction',
    required: false,
    enum: ['asc', 'desc'],
  })
  sortOrder?: 'asc' | 'desc';
}
