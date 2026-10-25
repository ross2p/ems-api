import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Category name',
    minLength: 1,
    maxLength: 100,
    example: 'Technology',
  })
  name: string;

  @ApiProperty({
    description: 'Category description',
    minLength: 1,
    maxLength: 500,
    example: 'Tech related events',
  })
  description: string;

  // Set by the server from the authenticated user
  @ApiHideProperty()
  createdById: string;
}
