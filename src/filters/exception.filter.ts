import { Catch } from '@nestjs/common';
import { IExceptionHandler } from './i-exception.filter';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { ErrorResponse } from './responses';
@Catch(HttpException)
export class ExceptionFilter extends IExceptionHandler<HttpException> {
  handle(exception: HttpException): ErrorResponse {

    console.log(exception)
    const response = exception.getResponse() as {
      message?: string;
      error?: string;
      statusCode?: number;
      [key: string]: any;
    };
    const { message, ...data } = response;
    delete data.statusCode;
    delete data.error;

    return new ErrorResponse(
      message || 'Unexpected error',
      exception.getStatus(),
      data || null,
    );
  }
}
