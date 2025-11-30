import { GlobalResponse } from './global-response';

export class SuccessResponse<T = any> extends GlobalResponse<T> {
  constructor(
    data: T,
    message: string = 'Success',
    statusCode: number = 200,
    name?: string,
  ) {
    super(statusCode, message, data, name);
  }
}
