import { ErrorResponse } from './error-response.utils';

describe('ErrorResponse', () => {
  it('should use default values when only message is provided', () => {
    const response = new ErrorResponse({ message: 'Something went wrong' });

    expect(response.statusCode).toBe(500);
    expect(response.message).toBe('Something went wrong');
    expect(response.data).toBeNull();
  });

  it('should use provided statusCode', () => {
    const response = new ErrorResponse({
      message: 'Not Found',
      statusCode: 404,
    });

    expect(response.statusCode).toBe(404);
  });

  it('should use provided data', () => {
    const data = { field: 'email', issue: 'invalid' };
    const response = new ErrorResponse({
      message: 'Validation failed',
      statusCode: 422,
      data,
    });

    expect(response.data).toEqual(data);
  });

  it('should use provided name', () => {
    const response = new ErrorResponse({
      message: 'Not Found',
      statusCode: 404,
      data: null,
      name: 'NOT_FOUND',
    });

    expect(response.name).toBe('NOT_FOUND');
  });

  it('should derive name from status code when name is not provided', () => {
    const response = new ErrorResponse({
      message: 'Not Found',
      statusCode: 404,
    });

    expect(response.name).toBe('NOT_FOUND');
  });
});
