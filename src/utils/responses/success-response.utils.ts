import { GlobalResponse } from './global-response.utils';

export class SuccessResponse<T = any> extends GlobalResponse<T> {
  constructor(options: {
    data?: T | null;
    message?: string;
    statusCode?: number;
    name?: string;
  }) {
    super({
      statusCode: options.statusCode ?? 200,
      message: options.message ?? 'Success',
      data: options.data ?? null,
      name: options.name,
      isError: false,
    });
  }
}
