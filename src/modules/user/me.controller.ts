import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import {
  ApiAuth,
  ApiErrorResponse,
  ApiSuccessResponse,
  ResponseMessage,
  UserDetails,
} from '../../decorators';
import { UserEntity } from './user.entity';
import { UpdateUserDto } from './dtos/update-user.dto';
import { AuthGuard } from '../../guards/user.guard';
import { ValidationPipe } from '../../pipes/validation.pipe';
import { updateUserSchema } from './schemas/update-user.schema';

@ApiTags('User')
@ApiAuth()
@Controller('user/me')
export class MeController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard)
  @Get()
  @ApiOperation({ summary: 'Get current user' })
  @ApiSuccessResponse({
    type: UserEntity,
    description: 'User found successfully',
  })
  @ResponseMessage('User found successfully')
  public async findMe(@UserDetails() user: UserEntity) {
    return this.userService.findUserByIdOrThrow(user.id);
  }

  @Patch()
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Update current user',
    description: 'Updates only the provided fields, at least one is required.',
  })
  @ApiSuccessResponse({
    type: UserEntity,
    description: 'User updated successfully',
  })
  @ApiErrorResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Validation failed, no fields given, malformed JSON or access token is invalid or expired',
  })
  @ApiErrorResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email is already taken',
  })
  @ResponseMessage('User updated successfully')
  public async updateMe(
    @UserDetails() user: UserEntity,
    @Body(new ValidationPipe(updateUserSchema)) updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUser(user.id, updateUserDto);
  }

  @Delete()
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Delete current user',
    description:
      'Deletes the account with its events, categories and attendances, returns the user.',
  })
  @ApiSuccessResponse({
    type: UserEntity,
    description: 'User deleted successfully',
  })
  @ResponseMessage('User deleted successfully')
  async deleteMe(@UserDetails() user: UserEntity) {
    return this.userService.deleteUser(user.id);
  }
}
