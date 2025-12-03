import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TokenType } from './token-type.enum';
import { JwtService } from '@nestjs/jwt';
import { Payload } from './interfaces/payload.interface';
import { UserEntity } from '../user/user.entity';
import { PayloadMapper } from './payload.mapper';
import { TokensDto } from './dtos/tokens.dto';

@Injectable()
export class TokenService {
  private readonly ACCESS_TOKEN_EXPIRE: number;
  private readonly REFRESH_TOKEN_EXPIRE: number;
  private readonly JWT_SECRET_KEY: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly payloadMapper: PayloadMapper,
    configService: ConfigService,
  ) {
    this.ACCESS_TOKEN_EXPIRE = configService.get<number>(
      'ACCESS_TOKEN_EXPIRE',
    )!;
    this.REFRESH_TOKEN_EXPIRE = configService.get<number>(
      'REFRESH_TOKEN_EXPIRE',
    )!;
    this.JWT_SECRET_KEY = configService.get<string>('JWT_SECRET_KEY')!;
  }

  private generateToken(
    data: Payload,
    expiresIn: number,
    secret: string,
  ): string {
    return this.jwtService.sign(data, { secret, expiresIn });
  }

  public generateTokenByType(data: Payload, type: TokenType): string {
    data.type = type;

    switch (type) {
      case TokenType.ACCESS:
        return this.generateToken(
          data,
          this.ACCESS_TOKEN_EXPIRE,
          this.JWT_SECRET_KEY,
        );
      case TokenType.REFRESH:
        return this.generateToken(
          data,
          this.REFRESH_TOKEN_EXPIRE,
          this.JWT_SECRET_KEY,
        );
    }
  }

  private verifyToken<T extends Payload>(token: string, secretKey: string): T {
    try {
      return this.jwtService.verify<T>(token, { secret: secretKey });
    } catch {
      throw new BadRequestException('Invalid token');
    }
  }

  public verifyTokenByType<T extends Payload>(token: string, type: TokenType) {
    if (!token) {
      throw new UnauthorizedException(
        'Access denied. No access token provided.',
      );
    }
    let data: T;

    switch (type) {
      case TokenType.ACCESS:
      case TokenType.REFRESH:
        data = this.verifyToken<T>(token, this.JWT_SECRET_KEY);
        break;
    }
    if (data.type !== type) {
      throw new BadRequestException('Invalid token');
    }
    return data;
  }

  public generateAccessTokens(user: UserEntity): TokensDto {
    const userPayload = this.payloadMapper.userEntityToUserPayload(user);

    const accessToken = this.generateTokenByType(userPayload, TokenType.ACCESS);
    const refreshToken = this.generateTokenByType(
      userPayload,
      TokenType.REFRESH,
    );
    return { accessToken, refreshToken };
  }
}
