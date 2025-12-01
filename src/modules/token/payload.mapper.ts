import { Injectable } from '@nestjs/common';
import { UserPayload } from './interfaces/userPayload.interface';
import { UserEntity } from '../user/user.entity';
@Injectable()
export class PayloadMapper {
  public userEntityToUserPayload(userEntity: UserEntity): UserPayload {
    return {
      userId: userEntity.id,
      email: userEntity.email,
    };
  }
}
