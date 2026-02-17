import { Test, TestingModule } from '@nestjs/testing';
import { TokenService } from './token.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PayloadMapper } from './payload.mapper';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { TokenType } from './token-type.enum';
import { UserEntity } from '../user/user.entity';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { UserPayload } from './interfaces/userPayload.interface';

describe('TokenService', () => {
  let service: TokenService;
  let jwtService: DeepMocked<JwtService>;
  let configService: DeepMocked<ConfigService>;
  let payloadMapper: DeepMocked<PayloadMapper>;

  const mockUserPayload: UserPayload = {
    userId: 'user-id',
    email: 'test@example.com',
  };

  const mockUser: UserEntity = {
    id: 'user-id',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    password: 'password',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        {
          provide: JwtService,
          useValue: createMock<JwtService>(),
        },
        {
          provide: ConfigService,
          useValue: createMock<ConfigService>(),
        },
        {
          provide: PayloadMapper,
          useValue: createMock<PayloadMapper>(),
        },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
    payloadMapper = module.get(PayloadMapper);

    configService.get.mockImplementation((key: string) => {
      switch (key) {
        case 'ACCESS_TOKEN_EXPIRE':
          return 3600;
        case 'REFRESH_TOKEN_EXPIRE':
          return 7200;
        case 'JWT_SECRET_KEY':
          return 'secret';
        default:
          return null;
      }
    });
  });

  beforeEach(async () => {
    const mockConfigService = createMock<ConfigService>();
    mockConfigService.get.mockImplementation((key: string) => {
      if (key === 'ACCESS_TOKEN_EXPIRE') return 3600;
      if (key === 'REFRESH_TOKEN_EXPIRE') return 7200;
      if (key === 'JWT_SECRET_KEY') return 'secret';
      return null;
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        {
          provide: JwtService,
          useValue: createMock<JwtService>(),
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: PayloadMapper,
          useValue: createMock<PayloadMapper>(),
        },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
    payloadMapper = module.get(PayloadMapper);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateTokenByType', () => {
    it('should generate an access token', () => {
      jwtService.sign.mockReturnValue('access-token');
      const payload = { ...mockUserPayload };

      const token = service.generateTokenByType(payload, TokenType.ACCESS);

      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({ type: TokenType.ACCESS }),
        expect.objectContaining({ expiresIn: 3600, secret: 'secret' }),
      );
      expect(token).toBe('access-token');
    });

    it('should generate a refresh token', () => {
      jwtService.sign.mockReturnValue('refresh-token');
      const payload = { ...mockUserPayload };

      const token = service.generateTokenByType(payload, TokenType.REFRESH);

      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({ type: TokenType.REFRESH }),
        expect.objectContaining({ expiresIn: 7200, secret: 'secret' }),
      );
      expect(token).toBe('refresh-token');
    });
  });

  describe('verifyTokenByType', () => {
    it('should throw UnauthorizedException if token is missing', () => {
      expect(() => service.verifyTokenByType('', TokenType.ACCESS)).toThrow(
        UnauthorizedException,
      );
    });

    it('should throw BadRequestException if jwt verification fails', () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() =>
        service.verifyTokenByType('invalid-token', TokenType.ACCESS),
      ).toThrow(BadRequestException);
    });

    it('should throw BadRequestException if token type mismatches', () => {
      jwtService.verify.mockReturnValue({
        ...mockUserPayload,
        type: TokenType.REFRESH,
      });

      expect(() =>
        service.verifyTokenByType('refresh-token', TokenType.ACCESS),
      ).toThrow(BadRequestException);
    });

    it('should verify and return payload for valid access token', () => {
      const payload = { ...mockUserPayload, type: TokenType.ACCESS };
      jwtService.verify.mockReturnValue(payload);

      const result = service.verifyTokenByType('valid-token', TokenType.ACCESS);

      expect(result).toEqual(payload);
      expect(jwtService.verify).toHaveBeenCalledWith('valid-token', {
        secret: 'secret',
      });
    });
  });

  describe('generateAccessTokens', () => {
    it('should generate both access and refresh tokens', () => {
      payloadMapper.userEntityToUserPayload.mockReturnValue(mockUserPayload);
      jwtService.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');

      const tokens = service.generateAccessTokens(mockUser);

      expect(tokens).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });
  });
});
