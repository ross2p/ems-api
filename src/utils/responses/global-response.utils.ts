import { HttpStatus } from '@nestjs/common';

export class GlobalResponse<T = any> {
  readonly statusCode: number;
  readonly message: string;
  readonly name: string;
  readonly data: T;

  constructor(statusCode: number, message: string, data: T, name?: string) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.name = name || HttpStatus[statusCode] || 'UNKNOWN_STATUS';
  }
}
