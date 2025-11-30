import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import type { AnySchema, ValidationResult } from 'joi';

@Injectable()
export class ValidationPipe<T = unknown> implements PipeTransform {
  constructor(private schema: AnySchema<T>) {}

  transform(value: T) {
    const validationResult: ValidationResult = this.schema.validate(value, {
      abortEarly: false,
    });

    if (validationResult.error) {
      const formattedErrors = validationResult.error.details.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      }));

      throw new BadRequestException({
        data: formattedErrors,
        message: 'Validation failed',
      });
    }

    return validationResult.value as T;
  }
}
