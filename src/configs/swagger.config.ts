import { HttpServer, INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import basicAuth from 'express-basic-auth';
import { Request, Response } from 'express';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Event Management System (EMS) API')
  .setDescription('The EMS API description')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

export const swaggerSetup = (
  app: INestApplication,
  configureService: ConfigService,
) => {
  const SWAGGER_USER = configureService.get<string>('SWAGGER_USER')!;
  const SWAGGER_PASSWORD = configureService.get<string>('SWAGGER_PASSWORD')!;

  const document: OpenAPIObject = SwaggerModule.createDocument(
    app,
    swaggerConfig,
  );
  const adapter: HttpServer = app.getHttpAdapter();

  app.use(
    ['/api-docs/json', '/api-docs'],
    basicAuth({
      challenge: true,
      users: { [SWAGGER_USER]: SWAGGER_PASSWORD },
    }),
  );

  // JSON endpoint
  adapter.get('/api/docs/json', (_req: Request, res: Response) =>
    res.json(document),
  );

  // Swagger UI
  SwaggerModule.setup('api/docs', app, document);
};
