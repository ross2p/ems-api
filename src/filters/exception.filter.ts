import { Catch } from '@nestjs/common';
import { IExceptionHandler } from './i-exception.filter';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { ErrorResponse } from '../utils/responses';
@Catch(HttpException)
export class ExceptionFilter extends IExceptionHandler<HttpException> {
  handle(exception: HttpException): ErrorResponse {
    const response = exception.getResponse() as {
      message?: string;
      error?: string;
      statusCode?: number;
      [key: string]: any;
    };
    const { message, ...data } = response;
    delete data.statusCode;
    delete data.error;

    return new ErrorResponse({
      message: message || 'Unexpected error',
      statusCode: exception.getStatus(),
      data: data || null,
    });
  }
}
