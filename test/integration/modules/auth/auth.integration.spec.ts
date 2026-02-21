import { setupE2ETestEnvironment } from '../../../e2e/utils/e2e-setup.util';
import { AuthService } from '../../../../src/modules/auth/auth.service';
import { CreateUserDto } from '../../../../src/modules/user/dtos/create-user.dto';
import { LoginDto } from '../../../../src/modules/auth/dtos/login.dto';
import { BadRequestException } from '@nestjs/common';

describe('AuthService (Integration)', () => {
  const env = setupE2ETestEnvironment();
  let authService: AuthService;

  beforeAll(() => {
    authService = env.app.get(AuthService);
  });

  describe('register', () => {
    it('should successfully register a new user in the database', async () => {
      const dto: CreateUserDto = {
        firstName: 'Integration',
        lastName: 'TestUser',
        email: 'integration.register@example.com',
        password: 'password123',
      };

      const result = await authService.register(dto);

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(dto.email);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();

      // Verify the user was actually inserted into the database
      const userInDb = await env.dbEnv.prisma.user.findUnique({
        where: { email: dto.email },
      });
      expect(userInDb).toBeDefined();
      expect(userInDb?.email).toBe(dto.email);
    });

    it('should throw an error if the email is already in use', async () => {
      const dto: CreateUserDto = {
        firstName: 'Integration',
        lastName: 'TestUser',
        email: 'integration.duplicate@example.com',
        password: 'password123',
      };

      // Register first time
      await authService.register(dto);

      // Attempt to register again
      await expect(authService.register(dto)).rejects.toThrow();
    });
  });

  describe('login', () => {
    it('should successfully login an existing user', async () => {
      const dto: CreateUserDto = {
        firstName: 'Integration',
        lastName: 'TestUser',
        email: 'integration.login@example.com',
        password: 'password123',
      };

      await authService.register(dto);

      const loginDto: LoginDto = {
        email: dto.email,
        password: dto.password,
      };

      const result = await authService.login(loginDto);

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(loginDto.email);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw BadRequestException on invalid password', async () => {
      const dto: CreateUserDto = {
        firstName: 'Integration',
        lastName: 'TestUser',
        email: 'integration.login.invalid@example.com',
        password: 'password123',
      };

      await authService.register(dto);

      const loginDto: LoginDto = {
        email: dto.email,
        password: 'wrong_password',
      };

      await expect(authService.login(loginDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('refreshToken', () => {
    it('should generate a new access token using a valid refresh token', async () => {
      const dto: CreateUserDto = {
        firstName: 'Integration',
        lastName: 'TestUser',
        email: 'integration.refresh@example.com',
        password: 'password123',
      };

      const registerResult = await authService.register(dto);
      const oldAccessToken = registerResult.accessToken;

      const refreshResult = await authService.refreshToken({
        refreshToken: registerResult.refreshToken,
      });

      expect(refreshResult.accessToken).toBeDefined();
      expect(refreshResult.accessToken).not.toEqual(oldAccessToken);
    });
  });
});
