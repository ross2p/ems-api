import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UsePipes,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dtos/login.dto';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dtos/create-user.dto';
import { ResponseMessage } from '../../decorators/response-message.decorator';
import {
  ApiErrorResponse,
  ApiServerErrorResponse,
  ApiSuccessResponse,
} from '../../decorators';
import { RefreshToken } from '../token/dtos/refresh.token.dto';
import { AccessToken } from '../token/dtos/accessToken.dto';
import { AuthResponseDto } from './dtos/auth-response.dto';
import { ValidationPipe } from '../../pipes/validation.pipe';
import { loginSchema } from './schemas/login.schema';
import { createUserSchema } from './schemas/create-user.schema';
import { refreshTokenSchema } from './schemas/refresh-token.schema';

@ApiTags('Auth')
@ApiServerErrorResponse()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @UsePipes(new ValidationPipe(loginSchema))
  @ApiOperation({
    summary: 'Login user',
    description: 'Checks email and password, returns the user and tokens.',
  })
  @ApiSuccessResponse({
    type: AuthResponseDto,
    description: 'User logged in successfully',
  })
  @ApiErrorResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation failed, malformed JSON or invalid credentials',
  })
  @ResponseMessage('User logged in successfully')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @UsePipes(new ValidationPipe(createUserSchema))
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Creates a user account, returns the user and tokens.',
  })
  @ApiSuccessResponse({
    type: AuthResponseDto,
    status: HttpStatus.CREATED,
    description: 'User registered successfully',
  })
  @ApiErrorResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation failed or malformed JSON',
  })
  @ApiErrorResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email is already taken',
  })
  @ResponseMessage('User registered successfully')
  async register(@Body() registerDto: CreateUserDto) {
    return this.authService.register(registerDto);
  }

  @Post('refresh')
  @HttpCode(200)
  @UsePipes(new ValidationPipe(refreshTokenSchema))
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Returns a new access token for a valid refresh token.',
  })
  @ApiSuccessResponse({
    type: AccessToken,
    description: 'Token refreshed successfully',
  })
  @ApiErrorResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Validation failed, malformed JSON or refresh token is invalid or expired',
  })
  @ApiErrorResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Refresh token has no user',
  })
  @ApiErrorResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Refresh token user not found',
  })
  @ResponseMessage('Token refreshed successfully')
  async refresh(@Body() refreshDto: RefreshToken) {
    return this.authService.refreshToken(refreshDto);
  }
}
