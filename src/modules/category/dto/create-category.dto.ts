import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Category name',
    type: String,
    example: 'Work',
  })
  name: string;

  @ApiProperty({
    description: 'Category color in hex format',
    type: String,
    example: '#FF5733',
  })
  color: string;

  @ApiProperty({
    description: 'Category description',
    type: String,
    example: 'Work related events',
  })
  description: string;

  @ApiProperty({
    description: 'ID of the user who created this category',
    type: String,
  })
  createdById: string;
}
