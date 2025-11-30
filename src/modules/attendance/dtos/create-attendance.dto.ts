import { ApiProperty } from '@nestjs/swagger';

export class CreateAttendanceDto {
  @ApiProperty({
    description: 'User ID',
    type: String,
  })
  userId: string;

  @ApiProperty({
    description: 'Event ID',
    type: String,
  })
  eventId: string;
}
