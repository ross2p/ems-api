import { HttpServer, INestApplication } from '@nestjs/common';
import { OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { Request, Response } from 'express';
import basicAuth from 'express-basic-auth';
import { ConfigService } from '@nestjs/config';
import { swaggerConfig } from 'src/configs/swagger.config';

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
  adapter.get('/api-docs/json', (_req: Request, res: Response) =>
    res.json(document),
  );

  // Swagger UI
  SwaggerModule.setup('api-docs', app, document);
};
