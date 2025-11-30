import { PartialType, PickType, ApiProperty } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(
  PickType(CreateUserDto, ['email', 'firstName', 'lastName', 'password']),
) {
  @ApiProperty({
    description: 'User email',
    type: String,
    example: 'user@example.com',
    required: false,
  })
  email?: string;

  @ApiProperty({
    description: 'User first name',
    type: String,
    example: 'John',
    required: false,
  })
  firstName?: string;

  @ApiProperty({
    description: 'User last name',
    type: String,
    example: 'Doe',
    required: false,
  })
  lastName?: string;

  @ApiProperty({
    description: 'User password',
    type: String,
    example: 'password123',
    required: false,
  })
  password?: string;
}
