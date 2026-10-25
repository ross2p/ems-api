import { ApiProperty } from '@nestjs/swagger';
import { AccessToken } from './accessToken.dto';
import { RefreshToken } from './refresh.token.dto';

export class TokensDto implements AccessToken, RefreshToken {
  @ApiProperty({
    description: 'JWT access token for the Authorization header',
    type: String,
  })
  accessToken: string;

  @ApiProperty({
    description: 'JWT refresh token used to get a new access token',
    type: String,
  })
  refreshToken: string;
}
