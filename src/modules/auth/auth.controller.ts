import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dtos/login.dto';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dtos/create-user.dto';
import { ResponseMessage } from '../../decorators/response-message.decorator';
import { RefreshToken } from '../token/dtos/refresh.token.dto';
import { AuthResponseDto } from './dtos/auth-response.dto';
import { ValidationPipe } from '../../pipes/validation.pipe';
import { loginSchema } from './schemas/login.schema';
import { createUserSchema } from './schemas/create-user.schema';
import { refreshTokenSchema } from './schemas/refresh-token.schema';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post("login")
    @UsePipes(new ValidationPipe(loginSchema))
    @ApiOperation({ summary: 'Login user' })
    @ApiResponse({ status: 200, description: 'User logged in successfully', type: AuthResponseDto })
    @ResponseMessage("User logged in successfully")
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Post("register")
    @UsePipes(new ValidationPipe(createUserSchema))
    @ApiOperation({ summary: 'Register a new user' })
    @ApiResponse({ status: 201, description: 'User registered successfully', type: AuthResponseDto })
    @ResponseMessage("User registered successfully")
    async register(@Body() registerDto: CreateUserDto) {
        return this.authService.register(registerDto);
    }

    @Post("refresh")
    @UsePipes(new ValidationPipe(refreshTokenSchema))
    @ApiOperation({ summary: 'Refresh access token' })
    @ApiResponse({ status: 200, description: 'Token refreshed successfully', type: AuthResponseDto })
    @ResponseMessage("Token refreshed successfully")
    async refresh(@Body() refreshDto: RefreshToken) {
        return this.authService.refreshToken(refreshDto)
    }
}
