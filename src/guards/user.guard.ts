import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../modules/auth/auth.service';
import { UserEntity } from '../modules/user/user.entity';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const authHeader: string | undefined = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Missing or malformed token');
    }

    const token: string | undefined = authHeader.split(' ').at(-1);

    if (!token) {
      throw new UnauthorizedException('Missing or malformed token');
    }

    const user: UserEntity = await this.authService.validateAccessToken(token);

    if (!user) {
      throw new UnauthorizedException('c token or user not found');
    }

    req.user = user;
    return true;
  }
}
