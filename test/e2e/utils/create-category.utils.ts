import { INestApplication } from '@nestjs/common';
import request from 'supertest';

export async function createCategory(app: INestApplication, token: string) {
  const response = await request(app.getHttpServer())
    .post('/category')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: `Test Category ${Date.now()}`,
      description: 'A test category created by helper',
    })
    .expect(201);

  return response.body.data.id;
}
