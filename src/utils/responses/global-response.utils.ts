import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class GlobalResponse<T = any> {
  @ApiProperty({ description: 'HTTP status code', type: Number })
  readonly statusCode: number;

  @ApiProperty({ description: 'Human-readable result message', type: String })
  readonly message: string;

  @ApiProperty({ description: 'HTTP status name', type: String })
  readonly name: string;

  // Documented per endpoint by ApiSuccessResponse / ApiPageResponse / ApiErrorResponse
  readonly data: T | null;

  @ApiProperty({ description: 'Whether the request failed', type: Boolean })
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
