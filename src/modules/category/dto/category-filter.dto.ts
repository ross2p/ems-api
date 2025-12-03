import { ApiProperty } from '@nestjs/swagger';
import { PageRequest } from 'src/utils/pageables/page-request.utils';

export class CategoryFilterDto extends PageRequest {
  @ApiProperty({
    description: 'Search by category name',
    required: false,
    example: 'tech',
  })
  search?: string;
}
