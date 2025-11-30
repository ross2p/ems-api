import { HttpStatus } from '@nestjs/common';

export class GlobalResponse<T = any> {
  statusCode: number;
  message: string;
  name: string;
  data: T;

  constructor(statusCode: number, message: string, data: T, name?: string) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.name = name || HttpStatus[statusCode] || 'UNKNOWN_STATUS';
  }
}
