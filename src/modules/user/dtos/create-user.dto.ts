import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'User email',
    type: String,
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'User first name',
    type: String,
    example: 'John',
  })
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    type: String,
    example: 'Doe',
  })
  lastName: string;

  @ApiProperty({
    description: 'User password',
    type: String,
    example: 'password123',
  })
  password: string;
}
