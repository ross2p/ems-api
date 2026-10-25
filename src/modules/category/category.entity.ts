import { ApiProperty } from '@nestjs/swagger';
import { Category } from '../../../generated/prisma';

export class CategoryEntity implements Category {
  @ApiProperty({ description: 'Category identifier', format: 'uuid' })
  id: string;

  @ApiProperty({ description: 'Category name', example: 'Technology' })
  name: string;

  @ApiProperty({
    description: 'Category description',
    type: String,
    nullable: true,
    example: 'Tech related events',
  })
  description: string | null;

  @ApiProperty({
    description: 'When the category was created',
    type: String,
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'When the category was last updated',
    type: String,
    format: 'date-time',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Identifier of the user who created the category',
    format: 'uuid',
  })
  createdById: string;
}
