import { ApiProperty } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({
    description: 'Event title',
    type: String,
    example: 'Team Meeting',
  })
  title: string;

  @ApiProperty({
    description: 'Event description',
    type: String,
    example: 'Weekly team sync meeting',
  })
  description: string;

  @ApiProperty({
    description: 'Event start date and time',
    type: Date,
    example: '2024-01-15T10:00:00Z',
  })
  startDate: Date;

  @ApiProperty({
    description: 'Event end date and time',
    type: Date,
    example: '2024-01-15T11:00:00Z',
  })
  endDate: Date;

  @ApiProperty({
    description: 'ID of the user who created this event',
    type: String,
  })
  createdById: string;

  @ApiProperty({
    description: 'Category ID for this event',
    type: String,
    required: false,
  })
  categoryId?: string;
}
