import { GlobalResponse } from './global-response';

export class ErrorResponse<T = any> extends GlobalResponse<T | null> {
  constructor(
    message: string,
    statusCode: number = 500,
    data: T | null = null,
    name?: string,
  ) {
    super(statusCode, message, data, name);
  }
}
