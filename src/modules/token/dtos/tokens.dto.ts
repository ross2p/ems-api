import { ApiProperty } from '@nestjs/swagger';
import { AccessToken } from './accessToken.dto';
import { RefreshToken } from './refresh.token.dto';

export class TokensDto implements AccessToken, RefreshToken {
  @ApiProperty({
    description: 'The access token',
    type: String,
  })
  accessToken: string;

  @ApiProperty({
    description: 'The refresh token',
    type: String,
  })
  refreshToken: string;
}
