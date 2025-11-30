import { ApiProperty } from '@nestjs/swagger';

export class RefreshToken {
  @ApiProperty({
    description: 'The refresh token',
    type: String,
  })
  refreshToken: string;
}
