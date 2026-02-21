import { INestApplication } from '@nestjs/common';
import request from 'supertest';

export async function getAuthDetails(app: INestApplication) {
  const uniqueEmail = `user_${Date.now()}_${Math.floor(Math.random() * 1000)}@example.com`;

  const registerResponse = await request(app.getHttpServer())
    .post('/auth/register')
    .send({
      firstName: 'Test',
      lastName: 'User',
      email: uniqueEmail,
      password: 'password123',
    })
    .expect(201);

  return {
    token: registerResponse.body.data.accessToken,
    userId: registerResponse.body.data.user.id,
    email: uniqueEmail,
    password: 'password123',
  };
}

export async function createEvent(
  app: INestApplication,
  token: string,
  categoryId?: string,
) {
  const payload: any = {
    title: `Test Event ${Date.now()}`,
    description: 'A test event created by helper',
    startDate: new Date(Date.now() + 86400000).toISOString(),
    endDate: new Date(Date.now() + 172800000).toISOString(),
    location: 'Helper Location',
  };

  if (categoryId) {
    payload.categoryId = categoryId;
  }

  const response = await request(app.getHttpServer())
    .post('/event')
    .set('Authorization', `Bearer ${token}`)
    .send(payload)
    .expect(201);

  return response.body.data.id;
}

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
