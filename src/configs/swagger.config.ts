import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Event Management System (EMS) API')
  .setDescription('The EMS API description')
  .setVersion('1.0')
  .addBearerAuth()
  .build();
