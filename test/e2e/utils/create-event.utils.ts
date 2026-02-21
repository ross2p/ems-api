import { INestApplication } from '@nestjs/common';
import request from 'supertest';

type CreateEventDto = {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  categoryId?: string;
};

export async function createEvent(
  app: INestApplication,
  token: string,
  categoryId?: string,
) {
  const payload: CreateEventDto = {
    title: `Test Event ${Date.now()}`,
    description: 'A test event created by helper',
    startDate: new Date(Date.now() + 86400000),
    endDate: new Date(Date.now() + 172800000),
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
