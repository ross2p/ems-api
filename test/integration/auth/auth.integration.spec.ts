import { AuthService } from '@/modules/auth/auth.service';
import { LoginDto } from '@/modules/auth/dtos/login.dto';
import { CreateUserDto } from '@/modules/user/dtos/create-user.dto';
import { BadRequestException } from '@nestjs/common';
import { setupTestEnvironment } from '../../utils/test-setup.util';
import { AccessToken } from '@/modules/token/dtos/accessToken.dto';

describe('AuthService (Integration)', () => {
  const env = setupTestEnvironment();
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

      // Wait 1 second so the "iat" and "exp" claims in the new token are different, producing a different JWT string
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const refreshResult = await authService.refreshToken({
        refreshToken: registerResult.refreshToken,
      });

      expect(refreshResult.accessToken).toBeDefined();
      expect(refreshResult.accessToken).not.toEqual(oldAccessToken);
    });
  });
});
