import request from 'supertest';
import { setupE2ETestEnvironment } from '../../utils/e2e-setup.util';

describe('AuthController (e2e)', () => {
  const env = setupE2ETestEnvironment();

  describe('/auth/register (POST)', () => {
    it('should successfully register a new user', async () => {
      const registerDto = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
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
        email: 'test@example.com',
        password: 'password123',
      };

      // Register first time
      await request(env.app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      // Try registering again
      const response = await request(env.app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(500); // Unique constraint throws Prisma Client Error (caught as 500)

      expect(response.body.statusCode).toBe(500);
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

      // Need to register before login
      await request(env.app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      const loginDto = {
        email: 'testlogin@example.com',
        password: 'password123',
      };

      const response = await request(env.app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(200);

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
        .expect(201);

      const loginDto = {
        email: 'testlogin2@example.com',
        password: 'wrongpassword',
      };

      await request(env.app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(400); // Invalid credentials returns Bad Request
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
        .expect(201);

      const refreshToken = registerResponse.body.data.refreshToken;

      const refreshResponse = await request(env.app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(refreshResponse.body.message).toBe('Token refreshed successfully');
      expect(refreshResponse.body.data).toHaveProperty('accessToken');
    });
  });
});
