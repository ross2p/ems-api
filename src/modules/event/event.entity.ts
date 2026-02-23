import { Event } from '../../../generated/prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class EventEntity implements Event {
  @ApiProperty({
    description: 'Unique identifier for the event',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'Title of the event',
    example: 'Tech Conference 2026',
  })
  title: string;

  @ApiProperty({
    description: 'Detailed description of the event',
    example: 'Annual developer gathering.',
  })
  description: string;

  @ApiProperty({ description: 'Start date and time of the event' })
  startDate: Date;

  @ApiProperty({ description: 'End date and time of the event' })
  endDate: Date;

  @ApiProperty({
    description: 'Physical or virtual location address',
    example: '123 Main St, New York',
  })
  location: string;

  @ApiProperty({
    description: 'Geographical latitude',
    example: 40.7128,
    required: false,
    nullable: true,
  })
  latitude: number | null;

  @ApiProperty({
    description: 'Geographical longitude',
    example: -74.006,
    required: false,
    nullable: true,
  })
  longitude: number | null;

  @ApiProperty({
    description: 'Associated category UUID',
    format: 'uuid',
    required: false,
    nullable: true,
  })
  categoryId: string | null;

  @ApiProperty({ description: 'Creator user UUID', format: 'uuid' })
  createdById: string;

  @ApiProperty({ description: 'Record creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Record last updated timestamp' })
  updatedAt: Date;
}
