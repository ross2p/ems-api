import { UnprocessableEntityException, ValidationPipe } from '@nestjs/common';

const globalPipe = new ValidationPipe({
  transform: true,
  forbidNonWhitelisted: true,
  transformOptions: {
    enableImplicitConversion: true,
  },
  exceptionFactory: (errors) => {
    return new UnprocessableEntityException(errors);
  },
});

export { globalPipe };
