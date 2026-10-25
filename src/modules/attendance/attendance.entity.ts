import { ApiProperty } from '@nestjs/swagger';
import { Attendance } from '../../../generated/prisma';

export class AttendanceEntity implements Attendance {
  @ApiProperty({ description: 'Attendance identifier', format: 'uuid' })
  id: string;

  @ApiProperty({
    description: 'Identifier of the attending user',
    format: 'uuid',
  })
  userId: string;

  @ApiProperty({
    description: 'Identifier of the attended event',
    format: 'uuid',
  })
  eventId: string;

  @ApiProperty({
    description: 'When the attendance was created',
    type: String,
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'When the attendance was last updated',
    type: String,
    format: 'date-time',
  })
  updatedAt: Date;
}
