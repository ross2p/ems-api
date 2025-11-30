import { ApiProperty } from '@nestjs/swagger';

export class AccessToken {
  @ApiProperty({
    description: 'The access token',
    type: String,
  })
  accessToken: string;
}
