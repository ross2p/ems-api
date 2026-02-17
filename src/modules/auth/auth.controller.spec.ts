import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { LoginDto } from './dtos/login.dto';
import { CreateUserDto } from '../user/dtos/create-user.dto';
import { RefreshToken } from '../token/dtos/refresh.token.dto';
import { AuthResponseDto } from './dtos/auth-response.dto';
import { UserEntity } from '../user/user.entity';
import { AccessToken } from '../token/dtos/accessToken.dto';

const mockUser: UserEntity = {
  id: 'user-id',
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  password: 'hashed-password',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockAuthResponse: AuthResponseDto = {
  user: mockUser,
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
};

describe('AuthController', () => {
  let controller: AuthController;
  let authService: DeepMocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: createMock<AuthService>(),
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should login user', async () => {
      const dto: LoginDto = {
        email: 'test@example.com',
        password: 'password',
      };
      authService.login.mockResolvedValue(mockAuthResponse);

      const result = await controller.login(dto);

      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockAuthResponse);
    });
  });

  describe('register', () => {
    it('should register user', async () => {
      const dto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password',
        firstName: 'John',
        lastName: 'Doe',
      };
      authService.register.mockResolvedValue(mockAuthResponse);

      const result = await controller.register(dto);

      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockAuthResponse);
    });
  });

  describe('refresh', () => {
    it('should refresh token', async () => {
      const dto: RefreshToken = { refreshToken: 'refresh-token' };
      const expectedResponse: AccessToken = { accessToken: 'new-access-token' };
      authService.refreshToken.mockResolvedValue(expectedResponse);

      const result = await controller.refresh(dto);

      expect(authService.refreshToken).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResponse);
    });
  });
});
