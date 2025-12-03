import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { swaggerSetup } from './utils';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = new Logger(app.constructor.name);
  const configService = app.get(ConfigService);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true,
  });

  app.setGlobalPrefix(`/api`, {
    exclude: ['/app'],
  });

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useStaticAssets('public', {
    prefix: '/public',
  });

  swaggerSetup(app, configService);
  logger.log('Application initialized successfully');

  const PORT = configService.get<number>('PORT') || 3000;
  await app.listen(PORT);

  logger.log(`🚀 Application is running on port ${PORT}`);
}
void bootstrap();
