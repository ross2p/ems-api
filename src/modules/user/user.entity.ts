import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { User } from '../../../generated/prisma';

export class UserEntity implements User {
  @ApiProperty({ description: 'User identifier', format: 'uuid' })
  id: string;

  @ApiProperty({ description: 'User first name', example: 'John' })
  firstName: string;

  @ApiProperty({ description: 'User last name', example: 'Doe' })
  lastName: string;

  @ApiProperty({
    description: 'User email',
    format: 'email',
    example: 'john.doe@example.com',
  })
  email: string;

  // Password hash is never exposed in the API docs
  @ApiHideProperty()
  password: string | null;

  @ApiProperty({
    description: 'When the user was created',
    type: String,
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'When the user was last updated',
    type: String,
    format: 'date-time',
  })
  updatedAt: Date;
}
