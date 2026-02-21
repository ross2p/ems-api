import { UnauthorizedException, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from './user.guard';
import { AuthService } from '../modules/auth/auth.service';
import { UserEntity } from '../modules/user/user.entity';
import { createMock, DeepMocked } from '@golevelup/ts-jest';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  let authService: DeepMocked<AuthService>;

  beforeEach(() => {
    authService = createMock<AuthService>();

    authGuard = new AuthGuard(authService);
  });

  it('should be defined', () => {
    expect(authGuard).toBeDefined();
  });

  it('should throw UnauthorizedException if authorization header is missing', async () => {
    const mockRequest = { headers: {} };
    const mockContext = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    });

    await expect(authGuard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
    await expect(authGuard.canActivate(mockContext)).rejects.toThrow(
      'Missing or malformed token',
    );
  });

  it('should throw UnauthorizedException if token is missing from authorization header', async () => {
    const mockRequest = { headers: { authorization: 'Bearer   ' } };
    const mockContext = {
      switchToHttp: jest
        .fn()
        .mockReturnValue({ getRequest: () => mockRequest }),
    } as unknown as ExecutionContext;

    // Splitting 'Bearer   ' by space and taking the last gives empty string
    await expect(authGuard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException if authService.validateAccessToken returns null/undefined', async () => {
    const mockRequest = { headers: { authorization: 'Bearer valid_token' } };
    const mockContext = {
      switchToHttp: jest
        .fn()
        .mockReturnValue({ getRequest: () => mockRequest }),
    } as unknown as ExecutionContext;

    authService.validateAccessToken.mockResolvedValue(null as any);

    await expect(authGuard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
    await expect(authGuard.canActivate(mockContext)).rejects.toThrow(
      'Missing token or user not found',
    );
    expect(authService.validateAccessToken).toHaveBeenCalledWith('valid_token');
  });

  it('should attach user to request and return true if token is valid', async () => {
    const mockUser: UserEntity = {
      id: 'id',
      email: 'test@test.com',
      firstName: 'FirstName',
      lastName: 'LastName',
      password: null,
      updatedAt: new Date(),
      createdAt: new Date(),
    };
    const mockRequest = {
      headers: { authorization: 'Bearer valid_token' },
      user: null,
    };
    const mockContext = {
      switchToHttp: jest
        .fn()
        .mockReturnValue({ getRequest: () => mockRequest }),
    } as unknown as ExecutionContext;

    authService.validateAccessToken.mockResolvedValue(mockUser);

    const result = await authGuard.canActivate(mockContext);

    expect(result).toBe(true);
    expect(mockRequest.user).toEqual(mockUser);
    expect(authService.validateAccessToken).toHaveBeenCalledWith('valid_token');
  });
});
