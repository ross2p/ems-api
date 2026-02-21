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

    const pipe = new ValidationPipe(schema);

    const validData = { name: 'John Doe', age: 30 };
    const result = pipe.transform(validData);

    expect(result).toEqual(validData);
  });

  it('should format errors and throw BadRequestException if validation fails', () => {
    const schema = joi.object({
      name: joi.string().required(),
      age: joi.number().min(0).required(),
    });

    const pipe = new ValidationPipe(schema);

    const invalidData = { name: 'John Doe', age: -5 };

    let caughtError: any;
    try {
      pipe.transform(invalidData);
    } catch (error) {
      caughtError = error;
    }

    expect(caughtError).toBeInstanceOf(BadRequestException);

    const response = caughtError.getResponse();
    expect(response).toEqual({
      message: VALIDATION_MESSAGE,
      data: [
        {
          path: 'age',
          message: '"age" must be greater than or equal to 0',
        },
      ],
    });
  });

  it('should format multiple errors and throw BadRequestException if multiple validation fields fail (abortEarly: false)', () => {
    const schema = joi.object({
      name: joi.string().required(),
      age: joi.number().min(0).required(),
    });

    const pipe = new ValidationPipe(schema);

    const invalidData = { age: -5 }; // Missing `name`, invalid `age`

    let caughtError: any;
    try {
      pipe.transform(invalidData);
    } catch (error) {
      caughtError = error;
    }

    expect(caughtError).toBeInstanceOf(BadRequestException);

    const response = caughtError.getResponse();
    expect(response).toEqual({
      message: VALIDATION_MESSAGE,
      data: expect.arrayContaining([
        { path: 'name', message: '"name" is required' },
        { path: 'age', message: '"age" must be greater than or equal to 0' },
      ]),
    });
  });

  it('should handle nested validation paths properly', () => {
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

    const pipe = new ValidationPipe(schema);

    let caughtError: any;
    try {
      pipe.transform({ user: { profile: {} } });
    } catch (error) {
      caughtError = error;
    }

    expect(caughtError).toBeInstanceOf(BadRequestException);

    const response = caughtError.getResponse();
    expect(response.data[0]).toEqual({
      path: 'user.profile.age',
      message: '"user.profile.age" is required',
    });
  });
});
