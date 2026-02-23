import { GlobalResponse } from './global-response.utils';

export class ErrorResponse<T = any> extends GlobalResponse<T | null> {
  constructor(options: {
    message: string;
    statusCode?: number;
    data?: T | null;
    name?: string;
  }) {
    super({
      statusCode: options.statusCode ?? 500,
      message: options.message,
      data: options.data ?? null,
      name: options.name,
      isError: true,
    });
  }
}
