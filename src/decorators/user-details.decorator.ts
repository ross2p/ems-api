import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { UserEntity } from '../modules/user/user.entity';

declare module 'express' {
  interface Request {
    user?: UserEntity;
  }
}

export const UserDetails = createParamDecorator(
  (_, ctx: ExecutionContext): UserEntity => {
    const request = ctx.switchToHttp().getRequest<Request>();
    if (!request.user) {
      throw new UnauthorizedException('User is not logged in.');
    }
    return request.user;
  },
);
