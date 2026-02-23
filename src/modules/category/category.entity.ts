import { ApiProperty } from '@nestjs/swagger';
import { Category } from '../../../generated/prisma';

export class CategoryEntity implements Category {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false, nullable: true })
  description: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  createdById: string;
}
