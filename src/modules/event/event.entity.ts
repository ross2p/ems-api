import { Event } from '../../../generated/prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class EventEntity implements Event {
  @ApiProperty({ description: 'Event identifier', format: 'uuid' })
  id: string;

  @ApiProperty({
    description: 'Event title',
    example: 'Kyiv React & Next.js Meetup',
  })
  title: string;

  @ApiProperty({
    description: 'Event description',
    example: 'Talks, live demos and networking for React developers.',
  })
  description: string;

  @ApiProperty({
    description: 'When the event starts',
    type: String,
    format: 'date-time',
  })
  startDate: Date;

  @ApiProperty({
    description: 'When the event ends',
    type: String,
    format: 'date-time',
  })
  endDate: Date;

  @ApiProperty({
    description: 'Event address',
    example: 'UNIT.City, Dorohozhytska St 3, Kyiv, Ukraine',
  })
  location: string;

  @ApiProperty({
    description: 'Event latitude',
    type: Number,
    nullable: true,
    minimum: -90,
    maximum: 90,
  })
  latitude: number | null;

  @ApiProperty({
    description: 'Event longitude',
    type: Number,
    nullable: true,
    minimum: -180,
    maximum: 180,
  })
  longitude: number | null;

  @ApiProperty({
    description: 'Identifier of the event category',
    type: String,
    format: 'uuid',
    nullable: true,
  })
  categoryId: string | null;

  @ApiProperty({
    description: 'Identifier of the user who created the event',
    format: 'uuid',
  })
  createdById: string;

  @ApiProperty({
    description: 'When the event was created',
    type: String,
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'When the event was last updated',
    type: String,
    format: 'date-time',
  })
  updatedAt: Date;
}
