import { BadRequestException } from '@nestjs/common';
import { ValidationPipe } from './validation.pipe';
import * as joi from 'joi';
import { VALIDATION_MESSAGE } from '../utils';

describe('ValidationPipe', () => {
  it('should return the validated value if validation succeeds', () => {
    const schema = joi.object({
      name: joi.string().required(),
      age: joi.number().min(0).required(),
    });
    type Schema = {
      name: string;
      age: number;
    };

    const pipe = new ValidationPipe<Schema>(schema);

    const validData: Schema = { name: 'John Doe', age: 30 };
    const result = pipe.transform(validData);

    expect(result).toEqual(validData);
  });

  it('should format errors and throw BadRequestException if validation fails', () => {
    const schema = joi.object({
      name: joi.string().required(),
      age: joi.number().min(0).required(),
    });
    type Schema = { name: string; age: number };

    const pipe = new ValidationPipe<Schema>(schema);

    const invalidData: Schema = { name: 'John Doe', age: -5 };

    expect(() => pipe.transform(invalidData)).toThrow(BadRequestException);
  });

  it('should format multiple errors and throw BadRequestException if multiple validation fields fail (abortEarly: false)', () => {
    const schema = joi.object({
      name: joi.string().required(),
      age: joi.number().min(0).required(),
    });
    type Schema = { name: string; age: number };

    const pipe = new ValidationPipe<Schema>(schema);

    const invalidData = { age: -5 } as Schema;

    let caughtError: unknown;
    try {
      pipe.transform(invalidData);
    } catch (error) {
      caughtError = error;
    }

    expect(caughtError).toBeInstanceOf(BadRequestException);

    const response = (
      caughtError as BadRequestException
    ).getResponse() as Record<string, unknown>;
    expect(response).toEqual({
      message: VALIDATION_MESSAGE,
      data: expect.arrayContaining([
        { path: 'name', message: '"name" is required' },
        { path: 'age', message: '"age" must be greater than or equal to 0' },
      ]) as unknown,
    });
  });

  it('should handle nested validation paths properly', () => {
    type Schema = { user: { profile: { age: number } } };

    const schema = joi.object({
      user: joi
        .object({
          profile: joi
            .object({
              age: joi.number().required(),
            })
            .required(),
        })
        .required(),
    });

    const pipe = new ValidationPipe<Schema>(schema);

    let caughtError: unknown;
    try {
      pipe.transform({ user: { profile: {} } });
    } catch (error) {
      caughtError = error;
    }

    expect(caughtError).toBeInstanceOf(BadRequestException);

    const response = (
      caughtError as BadRequestException
    ).getResponse() as Record<string, unknown>;
    const data = response['data'] as Array<Record<string, string>>;
    expect(data[0]).toEqual({
      path: 'user.profile.age',
      message: '"user.profile.age" is required',
    });
  });
});
