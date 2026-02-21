import { HttpException, NotFoundException } from '@nestjs/common';
import { isObservable, Observable, lastValueFrom } from 'rxjs';

type AsyncOrSync<T> = Promise<T> | Observable<T> | T;

const createException = (error?: string | HttpException): HttpException => {
  if (!error) return new NotFoundException('Record not found');
  if (typeof error === 'string') return new NotFoundException(error);
  return error;
};

export async function checkExists<T>(
  value: AsyncOrSync<T | null | undefined>,
  error?: string | HttpException,
): Promise<T> {
  let result: T | null | undefined;

  if (isObservable(value)) {
    result = await lastValueFrom(value);
  } else if (value instanceof Promise) {
    result = await value;
  } else {
    result = value;
  }

  if (result === null || result === undefined) {
    throw createException(error);
  }

  return result;
}
