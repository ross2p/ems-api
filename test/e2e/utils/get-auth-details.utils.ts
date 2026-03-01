import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { ApiBody, httpServer } from './typed-request.utils';

interface AuthData {
  user: { id: string; email: string };
  accessToken: string;
  refreshToken: string;
}

interface AuthDetails {
  token: string;
  userId: string;
  email: string;
  password: string;
}

export async function getAuthDetails(
  app: INestApplication,
): Promise<AuthDetails> {
  const uniqueEmail = `user_${Date.now()}_${Math.floor(Math.random() * 1000)}@example.com`;

  const registerResponse = await request(httpServer(app))
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

  const body = registerResponse.body as ApiBody<AuthData>;

  return {
    token: body.data.accessToken,
    userId: body.data.user.id,
    email: uniqueEmail,
    password: 'password123',
  };
}
