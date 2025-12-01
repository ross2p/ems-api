import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Category name',
    type: String,
    example: 'Work',
  })
  name: string;

  @ApiProperty({
    description: 'Category description',
    type: String,
    example: 'Work related events',
  })
  description: string;

  createdById: string;
}
