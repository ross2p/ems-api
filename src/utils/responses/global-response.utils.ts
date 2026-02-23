import { HttpStatus } from '@nestjs/common';

export class GlobalResponse<T = any> {
  readonly statusCode: number;
  readonly message: string;
  readonly name: string;
  readonly data: T | null;
  readonly isError: boolean;

  constructor(options: {
    statusCode: number;
    message: string;
    data?: T | null;
    name?: string;
    isError?: boolean;
  }) {
    this.statusCode = options.statusCode;
    this.message = options.message;
    this.data = options.data ?? null;
    this.name =
      options.name || HttpStatus[options.statusCode] || 'UNKNOWN_STATUS';
    this.isError = options.isError ?? false;
  }
}
