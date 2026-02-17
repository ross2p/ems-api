import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { TokenService } from '../token/token.service';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../user/dtos/create-user.dto';
import { UserEntity } from '../user/user.entity';
import { LoginDto } from './dtos/login.dto';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { RefreshToken } from '../token/dtos/refresh.token.dto';

jest.mock('bcrypt');

const mockUser: UserEntity = {
  id: 'user-id',
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  password: 'hashed-password',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockTokens = {
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
};

describe('AuthService', () => {
  let service: AuthService;
  let userService: DeepMocked<UserService>;
  let tokenService: DeepMocked<TokenService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: createMock<UserService>(),
        },
        {
          provide: TokenService,
          useValue: createMock<TokenService>(),
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get(UserService);
    tokenService = module.get(TokenService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a user and return tokens', async () => {
      const dto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password',
        firstName: 'John',
        lastName: 'Doe',
      };

      userService.createUser.mockResolvedValue(mockUser);
      tokenService.generateAccessTokens.mockReturnValue(mockTokens);

      const result = await service.register(dto);

      expect(result).toEqual({
        user: mockUser,
        ...mockTokens,
      });
    });
  });

  describe('login', () => {
    it('should login user and return tokens', async () => {
      const dto: LoginDto = {
        email: 'test@example.com',
        password: 'password',
      };

      userService.findUserByEmailWithPassword.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      tokenService.generateAccessTokens.mockReturnValue(mockTokens);

      const result = await service.login(dto);

      expect(result).toEqual({
        user: mockUser,
        ...mockTokens,
      });
    });

    it('should throw BadRequestException on invalid credentials', async () => {
      const dto: LoginDto = {
        email: 'test@example.com',
        password: 'wrong-password',
      };

      userService.findUserByEmailWithPassword.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if user not found', async () => {
      const dto: LoginDto = {
        email: 'notfound@example.com',
        password: 'password',
      };

      userService.findUserByEmailWithPassword.mockRejectedValue(new Error());

      await expect(service.login(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('refreshToken', () => {
    it('should return new access token', async () => {
      const dto: RefreshToken = { refreshToken: 'refresh-token' };
      const payload = { userId: mockUser.id, email: mockUser.email };

      tokenService.verifyTokenByType.mockReturnValue(payload);
      userService.findUserByIdOrThrow.mockResolvedValue(mockUser);
      tokenService.generateAccessTokens.mockReturnValue(mockTokens);

      const result = await service.refreshToken(dto);

      expect(result).toEqual({ accessToken: mockTokens.accessToken });
    });

    it('should throw UnauthorizedException if payload invalid', () => {
      const dto: RefreshToken = { refreshToken: 'refresh-token' };
      tokenService.verifyTokenByType.mockReturnValue({});

      expect(() => service.refreshToken(dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('validateAccessToken', () => {
    it('should return user for valid token', async () => {
      const token = 'access-token';
      const payload = { userId: mockUser.id, email: mockUser.email };

      tokenService.verifyTokenByType.mockReturnValue(payload);
      userService.findUserByIdOrThrow.mockResolvedValue(mockUser);

      const result = await service.validateAccessToken(token);

      expect(result).toEqual(mockUser);
    });
  });
});
