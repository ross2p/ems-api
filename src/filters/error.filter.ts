import { Catch, HttpStatus } from '@nestjs/common';
import { IExceptionHandler } from './i-exception.filter';
import { ErrorResponse } from '../utils/responses/error-response.utils';

@Catch(Error)
export class ErrorFilter extends IExceptionHandler {
  handle(exception: Error): ErrorResponse {
    return new ErrorResponse({
      message: exception.message,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    });
  }
}
