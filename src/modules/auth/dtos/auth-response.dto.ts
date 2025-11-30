import { TokensDto } from '../../token/dtos/tokens.dto';
import { UserEntity } from '../../user/user.entity';

export class AuthResponseDto extends TokensDto {
  user: UserEntity;
}
