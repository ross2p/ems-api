import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { TokenService } from '../token/token.service';
import { UserService } from '../user/user.service';
import { TokenType } from '../token/token-type.enum';
import { UserPayload } from '../token/interfaces/userPayload.interface';
import { CreateUserDto } from '../user/dtos/create-user.dto';
import { AuthResponseDto } from './dtos/auth-response.dto';
import { LoginDto } from './dtos/login.dto';
import { AccessToken } from '../token/dtos/accessToken.dto';
import { RefreshToken } from '../token/dtos/refresh.token.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<AuthResponseDto> {
    const user = await this.userService.createUser(createUserDto);
    const tokenPair = this.tokenService.generateAccessTokens(user);
    return {
      user,
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
    };
  }

  async login(data: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userService.findUserByEmailWithPassword(data.email);

    if (
      !user ||
      !user.password ||
      !(await bcrypt.compare(data.password, user.password))
    ) {
      throw new BadRequestException('Invalid credentials');
    }

    const tokenPair = this.tokenService.generateAccessTokens(user);

    return {
      user,
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
    };
  }

  private async getUserByToken(token: string, tokenType: TokenType) {
    const tokenPayload = this.tokenService.verifyTokenByType<UserPayload>(
      token,
      tokenType,
    );
    if (!tokenPayload.userId) {
      throw new UnauthorizedException('Invalid payload');
    }
    return this.userService.findUserByIdOrThrow(tokenPayload.userId);
  }
  async refreshToken(data: RefreshToken): Promise<AccessToken> {
    const user = await this.getUserByToken(
      data.refreshToken,
      TokenType.REFRESH,
    );
    const { accessToken } = this.tokenService.generateAccessTokens(user);
    return {
      accessToken,
    };
  }
  async validateAccessToken(accessToken: string) {
    return this.getUserByToken(accessToken, TokenType.ACCESS);
  }
}
