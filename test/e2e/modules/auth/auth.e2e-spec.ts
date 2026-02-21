import request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { setupTestEnvironment } from '../../../utils/test-setup.util';
import { VALIDATION_MESSAGE } from '../../utils/constants';

describe('AuthController (e2e)', () => {
  const env = setupTestEnvironment();

  describe('/auth/register (POST)', () => {
    it('should successfully register a new user', async () => {
      const registerDto = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test-register@example.com',
        password: 'password123',
      };

      const response = await request(env.app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.email).toBe(registerDto.email);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
    });

    it('should fail if email is already in use', async () => {
      const registerDto = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test-duplicate@example.com',
        password: 'password123',
      };

      await request(env.app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(HttpStatus.CREATED);

      const response = await request(env.app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(HttpStatus.CONFLICT);

      expect(response.body.statusCode).toBe(HttpStatus.CONFLICT);
    });

    it('should fail validation when fields are missing', async () => {
      const response = await request(env.app.getHttpServer())
        .post('/auth/register')
        .send({})
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toBe(VALIDATION_MESSAGE);
      expect(response.body.data.data).toContainEqual({
        path: 'firstName',
        message: 'First name is required',
      });
      expect(response.body.data.data).toContainEqual({
        path: 'email',
        message: 'Email is required',
      });
    });
    it('should fail validation with invalid email format', async () => {
      const registerDto = {
        firstName: 'Test',
        lastName: 'User',
        email: 'invalid-email',
        password: 'password123',
      };

      const response = await request(env.app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(400);

      expect(response.body.message).toBe(VALIDATION_MESSAGE);
      const str = JSON.stringify(response.body.data);
      expect(str).toContain('Email must be a valid email');
    });
  });

  describe('/auth/login (POST)', () => {
    it('should successfully login an existing user', async () => {
      const registerDto = {
        firstName: 'Test',
        lastName: 'User',
        email: 'testlogin@example.com',
        password: 'password123',
      };

      await request(env.app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(HttpStatus.CREATED);

      const loginDto = {
        email: registerDto.email,
        password: 'password123',
      };

      const response = await request(env.app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(HttpStatus.OK);

      expect(response.body.message).toBe('User logged in successfully');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.email).toBe(loginDto.email);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
    });

    it('should fail login with invalid password', async () => {
      const registerDto = {
        firstName: 'Test',
        lastName: 'User',
        email: 'testlogin2@example.com',
        password: 'password123',
      };

      await request(env.app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(HttpStatus.CREATED);

      const loginDto = {
        email: registerDto.email,
        password: 'wrongpassword',
      };

      const response = await request(env.app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toBe('Invalid credentials');
    });
    it('should fail login with invalid email', async () => {
      const loginDto = {
        email: 'testlogin3@example.com',
        password: 'password123',
      };

      const response = await request(env.app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(HttpStatus.BAD_REQUEST);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should fail login validation with empty body', async () => {
      const response = await request(env.app.getHttpServer())
        .post('/auth/login')
        .send({})
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toBe(VALIDATION_MESSAGE);
      const str = JSON.stringify(response.body.data);
      expect(str).toContain('Email is required');
      expect(str).toContain('Password is required');
    });
  });

  describe('/auth/refresh (POST)', () => {
    it('should successfully refresh token', async () => {
      const registerDto = {
        firstName: 'Test',
        lastName: 'User',
        email: 'testrefresh@example.com',
        password: 'password123',
      };

      const registerResponse = await request(env.app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(HttpStatus.CREATED);

      const refreshToken = registerResponse.body.data.refreshToken;

      const refreshResponse = await request(env.app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(HttpStatus.OK);

      expect(refreshResponse.body.message).toBe('Token refreshed successfully');
      expect(refreshResponse.body.data).toHaveProperty('accessToken');
    });

    it('should fail to refresh with invalid token', async () => {
      await request(env.app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid-token-string' })
        .expect(400);
    });

    it('should fail to refresh with empty body', async () => {
      const response = await request(env.app.getHttpServer())
        .post('/auth/refresh')
        .send({})
        .expect(400);

      expect(response.body.message).toBe(VALIDATION_MESSAGE);
      expect(JSON.stringify(response.body.data)).toContain(
        'Refresh token is required',
      );
    });
  });
});
