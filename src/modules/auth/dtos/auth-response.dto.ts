import { ApiProperty } from '@nestjs/swagger';
import { TokensDto } from '../../token/dtos/tokens.dto';
import { UserEntity } from '../../user/user.entity';

export class AuthResponseDto extends TokensDto {
  @ApiProperty({ description: 'Authenticated user', type: UserEntity })
  user: Omit<UserEntity, 'password'>;
}
