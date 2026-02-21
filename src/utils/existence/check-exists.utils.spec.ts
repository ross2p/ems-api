import { NotFoundException, BadRequestException } from '@nestjs/common';
import { of } from 'rxjs';
import { checkExists } from './check-exists.utils';

describe('checkExists Utils', () => {
  describe('with raw values', () => {
    it('should return the value if it is not null or undefined', async () => {
      const result = await checkExists({ id: 1 });
      expect(result).toEqual({ id: 1 });
    });

    it('should throw NotFoundException if value is null', async () => {
      await expect(checkExists(null)).rejects.toThrow(NotFoundException);
      await expect(checkExists(null)).rejects.toThrow('Record not found');
    });

    it('should throw NotFoundException if value is undefined', async () => {
      await expect(checkExists(undefined)).rejects.toThrow(NotFoundException);
    });

    it('should not throw if value is a falsy value like 0 or empty string', async () => {
      await expect(checkExists(0)).resolves.toBe(0);
      await expect(checkExists('')).resolves.toBe('');
      await expect(checkExists(false)).resolves.toBe(false);
    });
  });

  describe('with Promises', () => {
    it('should return the resolved value if it exists', async () => {
      const promise = Promise.resolve({ id: 2 });
      const result = await checkExists(promise);
      expect(result).toEqual({ id: 2 });
    });

    it('should throw NotFoundException if promise resolves to null', async () => {
      const promise = Promise.resolve(null);
      await expect(checkExists(promise)).rejects.toThrow(NotFoundException);
    });
  });

  describe('with Observables', () => {
    it('should return the emitted value if it exists', async () => {
      const observable = of({ id: 3 });
      const result = await checkExists(observable);
      expect(result).toEqual({ id: 3 });
    });

    it('should throw NotFoundException if observable emits null', async () => {
      const observable = of(null);
      await expect(checkExists(observable)).rejects.toThrow(NotFoundException);
    });
  });

  describe('custom errors', () => {
    it('should throw NotFoundException with custom string error', async () => {
      await expect(checkExists(null, 'Custom not found error')).rejects.toThrow(
        NotFoundException,
      );
      await expect(checkExists(null, 'Custom not found error')).rejects.toThrow(
        'Custom not found error',
      );
    });

    it('should throw custom HttpException', async () => {
      const customException = new BadRequestException('Bad Request');
      await expect(checkExists(null, customException)).rejects.toThrow(
        BadRequestException,
      );
      await expect(checkExists(null, customException)).rejects.toThrow(
        'Bad Request',
      );
    });
  });
});
