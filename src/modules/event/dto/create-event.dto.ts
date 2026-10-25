import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({
    description: 'Event title',
    minLength: 1,
    maxLength: 200,
    example: 'Kyiv React & Next.js Meetup',
  })
  title: string;

  @ApiProperty({
    description: 'Event description',
    minLength: 1,
    maxLength: 1000,
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
    description: 'When the event ends, not earlier than startDate',
    type: String,
    format: 'date-time',
  })
  endDate: Date;

  @ApiProperty({
    description: 'Event address',
    minLength: 1,
    maxLength: 500,
    example: 'UNIT.City, Dorohozhytska St 3, Kyiv, Ukraine',
  })
  location: string;

  @ApiProperty({
    description: 'Event latitude',
    type: Number,
    required: false,
    nullable: true,
    minimum: -90,
    maximum: 90,
  })
  latitude?: number;

  @ApiProperty({
    description: 'Event longitude',
    type: Number,
    required: false,
    nullable: true,
    minimum: -180,
    maximum: 180,
  })
  longitude?: number;

  // Set by the server from the authenticated user
  @ApiHideProperty()
  createdById: string;

  @ApiProperty({
    description: 'Identifier of the event category',
    format: 'uuid',
    required: false,
    nullable: true,
  })
  categoryId?: string;
}
