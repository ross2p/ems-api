import { TokenType } from '../token-type.enum';
import { Payload } from './payload.interface';

export interface UserPayload extends Payload<
  TokenType.ACCESS | TokenType.REFRESH
> {
  userId?: string;
  email?: string;
}
