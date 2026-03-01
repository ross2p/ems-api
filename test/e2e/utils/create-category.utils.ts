import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { ApiBody, httpServer } from './typed-request.utils';

export async function createCategory(
  app: INestApplication,
  token: string,
): Promise<string> {
  const response = await request(httpServer(app))
    .post('/category')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: `Test Category ${Date.now()}`,
      description: 'A test category created by helper',
    })
    .expect(201);

  const body = response.body as ApiBody<{ id: string }>;
  return body.data.id;
}
