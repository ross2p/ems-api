import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { CreateUserDto } from '../src/modules/user/dtos/create-user.dto';
import { LoginDto } from '../src/modules/auth/dtos/login.dto';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let refreshToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const uniqueId = Date.now();
  const testUser: CreateUserDto = {
    email: `test-${uniqueId}@example.com`,
    firstName: 'Test',
    lastName: 'User',
    password: 'password123',
  };

  it('/auth/register (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser)
      .expect(201);

    expect(response.body.data).toHaveProperty('accessToken');
    expect(response.body.data).toHaveProperty('refreshToken');
    expect(response.body.data.user).toHaveProperty('email', testUser.email);

    refreshToken = response.body.data.refreshToken;
  });

  it('/auth/login (POST)', async () => {
    const loginDto: LoginDto = {
      email: testUser.email,
      password: testUser.password,
    };

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(loginDto)
      .expect(200);

    expect(response.body.data).toHaveProperty('accessToken');
    expect(response.body.data).toHaveProperty('refreshToken');
    expect(response.body.data.user).toHaveProperty('email', testUser.email);
  });

  it('/auth/login (POST) - Invalid credentials', async () => {
    const loginDto: LoginDto = {
      email: testUser.email,
      password: 'wrongpassword',
    };

    await request(app.getHttpServer())
      .post('/auth/login')
      .send(loginDto)
      .expect(400);
  });

  it('/auth/refresh (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken })
      .expect(200);

    expect(response.body.data).toHaveProperty('accessToken');
  });
});
