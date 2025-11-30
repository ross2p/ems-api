import { ArgumentsHost, ExceptionFilter, Logger } from '@nestjs/common';
import { Response } from 'express';
import { ErrorResponse } from './responses';

export abstract class IExceptionHandler<
  T = unknown,
> implements ExceptionFilter<T> {
  private readonly logger: Logger = new Logger(this.constructor.name);
  abstract handle(exception: unknown): ErrorResponse;

  catch(exception: T, host: ArgumentsHost) {
    const contextType = host.getType();
    const result = this.handle(exception);
    this.logger.error(`Exception: ${String(exception)}`, exception as Error);

    switch (contextType) {
      case 'http': {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        response.status(result.statusCode).json(result);
        return;
      }
      case 'rpc': {
        return result;
      }
      case 'ws': {
        const wsContext = host.switchToWs();
        break;
      }
      default:
        this.logger.warn(`Unhandled context type. Returning error response.`);
    }
  }
}
