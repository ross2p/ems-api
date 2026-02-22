import { GlobalFilter } from './global.filter';
import { ErrorResponse } from '../utils/responses';

describe('GlobalFilter', () => {
  let filter: GlobalFilter;

  beforeEach(() => {
    filter = new GlobalFilter();
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  describe('handle', () => {
    it('should return ErrorResponse with "Unexpected error" message', () => {
      const result = filter.handle();

      expect(result).toBeInstanceOf(ErrorResponse);
      expect(result.message).toBe('Unexpected error');
    });

    it('should return ErrorResponse with 500 status code', () => {
      const result = filter.handle();

      expect(result.statusCode).toBe(500);
    });
  });
});
