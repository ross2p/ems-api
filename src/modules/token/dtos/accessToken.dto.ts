import { ApiProperty } from '@nestjs/swagger';

export class AccessToken {
  @ApiProperty({
    description: 'JWT access token for the Authorization header',
    type: String,
  })
  accessToken: string;
}
