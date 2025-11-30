import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'User email',
    type: String,
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'User password',
    type: String,
    example: 'password123',
  })
  password: string;
}
