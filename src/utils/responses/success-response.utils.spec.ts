import { SuccessResponse } from './success-response.utils';

describe('SuccessResponse', () => {
  it('should use default values when only data is provided', () => {
    const response = new SuccessResponse({ id: 1 });

    expect(response.statusCode).toBe(200);
    expect(response.message).toBe('Success');
    expect(response.data).toEqual({ id: 1 });
  });

  it('should use provided message', () => {
    const response = new SuccessResponse({ id: 1 }, 'Created');

    expect(response.message).toBe('Created');
  });

  it('should use provided statusCode', () => {
    const response = new SuccessResponse({ id: 1 }, 'Created', 201);

    expect(response.statusCode).toBe(201);
  });

  it('should use provided name', () => {
    const response = new SuccessResponse({ id: 1 }, 'Created', 201, 'CREATED');

    expect(response.name).toBe('CREATED');
  });

  it('should work with string data', () => {
    const response = new SuccessResponse('hello');

    expect(response.data).toBe('hello');
  });

  it('should work with null data', () => {
    const response = new SuccessResponse(null);

    expect(response.data).toBeNull();
  });
});
