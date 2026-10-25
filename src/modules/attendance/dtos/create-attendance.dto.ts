import { ApiProperty } from '@nestjs/swagger';

export class CreateAttendanceDto {
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
}
