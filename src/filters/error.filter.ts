import { Catch, HttpStatus } from '@nestjs/common';
import { IExceptionHandler } from './i-exception.filter';
import { ErrorResponse } from './responses/error-response';

@Catch(Error)
export class ErrorFilter extends IExceptionHandler {
  handle(exception: Error): ErrorResponse {
    return new ErrorResponse(
      exception.message,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
