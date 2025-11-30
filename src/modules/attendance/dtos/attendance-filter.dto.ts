import { ApiProperty } from '@nestjs/swagger';
import { PageRequest } from 'src/utils/pageables/page-request.utils';

export class AttendanceFilterDto extends PageRequest {
  @ApiProperty({
    description: 'Filter by event ID',
    type: String,
    required: false,
  })
  eventId?: string;
}
