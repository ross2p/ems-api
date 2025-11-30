import { Catch } from '@nestjs/common';
import { IExceptionHandler } from './i-exception.filter';
import { ErrorResponse } from './responses';

@Catch()
export class GlobalFilter extends IExceptionHandler {
  handle(): ErrorResponse {
    return new ErrorResponse('Unexpected error');
  }
}
