import { HttpStatus } from '@nestjs/common';
import { ErrorFilter } from './error.filter';
import { ErrorResponse } from '../utils/responses';

describe('ErrorFilter', () => {
  let filter: ErrorFilter;

  beforeEach(() => {
    filter = new ErrorFilter();
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  describe('handle', () => {
    it('should return ErrorResponse with exception message and 500 status', () => {
      const exception = new Error('Something broke');

      const result = filter.handle(exception);

      expect(result).toBeInstanceOf(ErrorResponse);
      expect(result.message).toBe('Something broke');
      expect(result.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('should use the exact error message from the exception', () => {
      const exception = new Error('Database connection failed');

      const result = filter.handle(exception);

      expect(result.message).toBe('Database connection failed');
    });
  });
});
