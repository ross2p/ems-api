import { ApiProperty } from '@nestjs/swagger';

export class RefreshToken {
  @ApiProperty({
    description: 'JWT refresh token used to get a new access token',
    type: String,
  })
  refreshToken: string;
}
