import { ArgumentsHost } from '@nestjs/common';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { IExceptionHandler } from './i-exception.filter';
import { ErrorResponse } from '../utils/responses';

class ConcreteFilter extends IExceptionHandler {
  handle(_exception: unknown): ErrorResponse {
    return new ErrorResponse({ message: 'test error', statusCode: 500 });
  }
}

describe('IExceptionHandler', () => {
  let filter: ConcreteFilter;
  let host: DeepMocked<ArgumentsHost>;

  beforeEach(() => {
    filter = new ConcreteFilter();
    host = createMock<ArgumentsHost>();
  });

  describe('catch - http context', () => {
    it('should call response.status and response.json with the error response', () => {
      const mockJson = jest.fn();
      const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
      const mockGetResponse = jest.fn().mockReturnValue({ status: mockStatus });

      host.getType.mockReturnValue('http');
      host.switchToHttp.mockReturnValue({
        getResponse: mockGetResponse,
      } as any);

      filter.catch(new Error('test'), host);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 500,
          message: 'test error',
        }),
      );
    });
  });

  describe('catch - rpc context', () => {
    it('should return the ErrorResponse', () => {
      host.getType.mockReturnValue('rpc');

      const result = filter.catch(new Error('test'), host);

      expect(result).toBeInstanceOf(ErrorResponse);
      expect(result).toMatchObject({ statusCode: 500, message: 'test error' });
    });
  });

  describe('catch - ws context', () => {
    it('should return undefined', () => {
      host.getType.mockReturnValue('ws');

      const result = filter.catch(new Error('test'), host);

      expect(result).toBeUndefined();
    });
  });

  describe('catch - unknown context', () => {
    it('should return undefined', () => {
      host.getType.mockReturnValue('graphql' as any);

      const result = filter.catch(new Error('test'), host);

      expect(result).toBeUndefined();
    });
  });
});
