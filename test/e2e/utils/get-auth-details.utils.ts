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
    });

  if (registerResponse.status !== 201) {
    console.error('Registration failed:', registerResponse.body);
    throw new Error(
      'Registration failed with status ' + registerResponse.status,
    );
  }

  return {
    token: registerResponse.body.data.accessToken,
    userId: registerResponse.body.data.user.id,
    email: uniqueEmail,
    password: 'password123',
  };
}
