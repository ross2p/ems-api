import { JwtPayload } from 'jsonwebtoken';
import { TokenType } from '../token-type.enum';

export interface Payload<T extends TokenType = TokenType> extends JwtPayload {
  type?: T;
}
