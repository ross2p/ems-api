import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'User email',
    format: 'email',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'User first name',
    minLength: 1,
    maxLength: 100,
    example: 'John',
  })
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    minLength: 1,
    maxLength: 100,
    example: 'Doe',
  })
  lastName: string;

  @ApiProperty({
    description: 'User password',
    format: 'password',
    minLength: 6,
  })
  password: string;
}
