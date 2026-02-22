import { ResponseInterceptor } from './response.interceptor';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { RESPONSE_MESSAGE_KEY } from '../utils';
import { SuccessResponse } from '../utils/responses';
import { createMock } from '@golevelup/ts-jest';

describe('ResponseInterceptor', () => {
  let interceptor: ResponseInterceptor;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    interceptor = new ResponseInterceptor(reflector);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should wrap the response in a SuccessResponse the correct status code and default message', (done) => {
    const data = { id: 1, name: 'Test' };
    const statusCode = 200;

    const mockResponse = {
      statusCode,
    };

    const mockHttpContext = {
      getResponse: jest.fn().mockReturnValue(mockResponse),
    };

    const mockExecutionContext = createMock<ExecutionContext>({
      switchToHttp: jest.fn().mockReturnValue(mockHttpContext as any),
      getHandler: jest.fn().mockReturnValue(() => {}),
    });

    const mockCallHandler = createMock<CallHandler>({
      handle: jest.fn().mockReturnValue(of(data)),
    });

    // By default, reflector.get will return undefined if no metadata is set
    jest.spyOn(reflector, 'get').mockReturnValue(undefined);

    interceptor
      .intercept(mockExecutionContext, mockCallHandler)
      .subscribe((result) => {
        expect(result).toBeInstanceOf(SuccessResponse);
        expect(result.data).toEqual(data);
        expect(result.statusCode).toBe(statusCode);
        expect(result.message).toBe('Success'); // default message from SuccessResponse

        expect(mockExecutionContext.switchToHttp).toHaveBeenCalled();
        expect(mockHttpContext.getResponse).toHaveBeenCalled();
        expect(mockExecutionContext.getHandler).toHaveBeenCalled();
        expect(reflector.get).toHaveBeenCalledWith(
          RESPONSE_MESSAGE_KEY,
          expect.any(Function),
        );

        done();
      });
  });

  it('should wrap the response in a SuccessResponse with a custom message from reflector', (done) => {
    const data = [{ id: 1 }, { id: 2 }];
    const statusCode = 201;
    const customMessage = 'Items created successfully';

    const mockResponse = {
      statusCode,
    };

    const mockHttpContext = {
      getResponse: jest.fn().mockReturnValue(mockResponse),
    };

    const mockExecutionContext = createMock<ExecutionContext>({
      switchToHttp: jest.fn().mockReturnValue(mockHttpContext as any),
      getHandler: jest.fn().mockReturnValue(() => {}),
    });

    const mockCallHandler = createMock<CallHandler>({
      handle: jest.fn().mockReturnValue(of(data)),
    });

    jest.spyOn(reflector, 'get').mockReturnValue(customMessage);

    interceptor
      .intercept(mockExecutionContext, mockCallHandler)
      .subscribe((result) => {
        expect(result).toBeInstanceOf(SuccessResponse);
        expect(result.data).toEqual(data);
        expect(result.statusCode).toBe(statusCode);
        expect(result.message).toBe(customMessage);

        done();
      });
  });
});
