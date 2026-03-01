import { HttpException, HttpStatus } from '@nestjs/common';
import { ExceptionFilter } from './exception.filter';
import { ErrorResponse } from '../utils/responses';

describe('ExceptionFilter', () => {
  let filter: ExceptionFilter;

  beforeEach(() => {
    filter = new ExceptionFilter();
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  describe('handle', () => {
    it('should use the exception status code', () => {
      const exception = new HttpException('Not Found', HttpStatus.NOT_FOUND);

      const result = filter.handle(exception);

      expect(result).toBeInstanceOf(ErrorResponse);
      expect(result.statusCode).toBe(HttpStatus.NOT_FOUND);
    });

    it('should fall back to "Unexpected error" when response is a plain string', () => {
      // When HttpException is constructed with a plain string, getResponse() returns
      // that string directly, not an object with a message property.
      const exception = new HttpException('Forbidden', HttpStatus.FORBIDDEN);

      const result = filter.handle(exception);

      expect(result.statusCode).toBe(HttpStatus.FORBIDDEN);
      expect(result.message).toBe('Unexpected error');
    });

    it('should extract message from object response', () => {
      const exception = new HttpException(
        { message: 'Validation failed', error: 'Bad Request', statusCode: 400 },
        HttpStatus.BAD_REQUEST,
      );

      const result = filter.handle(exception);

      expect(result.message).toBe('Validation failed');
      expect(result.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should strip statusCode and error from data', () => {
      const exception = new HttpException(
        {
          message: 'Validation failed',
          error: 'Bad Request',
          statusCode: 400,
          field: 'email',
        },
        HttpStatus.BAD_REQUEST,
      );

      const result = filter.handle(exception);

      expect(result.data).not.toHaveProperty('statusCode');
      expect(result.data).not.toHaveProperty('error');
    });

    it('should include extra fields in data', () => {
      const exception = new HttpException(
        {
          message: 'Validation failed',
          error: 'Bad Request',
          statusCode: 400,
          field: 'email',
        },
        HttpStatus.BAD_REQUEST,
      );

      const result = filter.handle(exception);

      expect(result.data).toEqual({ field: 'email' });
    });

    it('should use "Unexpected error" when message is missing from object response', () => {
      const exception = new HttpException(
        { statusCode: 500 } as Record<string, number>,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

      const result = filter.handle(exception);

      expect(result.message).toBe('Unexpected error');
    });
  });
});
