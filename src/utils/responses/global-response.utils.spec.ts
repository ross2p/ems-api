import { HttpStatus } from '@nestjs/common';
import { GlobalResponse } from './global-response.utils';

describe('GlobalResponse', () => {
  it('should set all fields from constructor', () => {
    const response = new GlobalResponse({
      statusCode: 200,
      message: 'OK',
      data: { id: 1 },
      name: 'CUSTOM_NAME',
    });

    expect(response.statusCode).toBe(200);
    expect(response.message).toBe('OK');
    expect(response.data).toEqual({ id: 1 });
    expect(response.name).toBe('CUSTOM_NAME');
    expect(response.isError).toBe(false);
  });

  it('should derive name from HttpStatus when name is not provided', () => {
    const response = new GlobalResponse({
      statusCode: 200,
      message: 'OK',
      data: null,
    });

    expect(response.name).toBe(HttpStatus[200]);
  });

  it('should use UNKNOWN_STATUS when name is not provided and status code is unknown', () => {
    const response = new GlobalResponse({
      statusCode: 999,
      message: 'Unknown',
      data: null,
    });

    expect(response.name).toBe('UNKNOWN_STATUS');
  });

  it('should support generic data type', () => {
    const data = [1, 2, 3];
    const response = new GlobalResponse<number[]>({
      statusCode: 200,
      message: 'OK',
      data,
    });

    expect(response.data).toEqual([1, 2, 3]);
  });

  it('should support null data', () => {
    const response = new GlobalResponse({
      statusCode: 200,
      message: 'OK',
      data: null,
    });

    expect(response.data).toBeNull();
  });
});
