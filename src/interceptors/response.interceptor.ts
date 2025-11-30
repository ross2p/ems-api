import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RESPONSE_MESSAGE_KEY } from '../utils';
import { SuccessResponse } from '../filters/responses';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();
    const handler = context.getHandler();

    const message = this.reflector.get<string>(RESPONSE_MESSAGE_KEY, handler);
    const status: number = response.statusCode;
    return next
      .handle()
      .pipe(map((data: unknown) => new SuccessResponse(data, message, status)));
  }
}
