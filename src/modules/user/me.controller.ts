import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { ResponseMessage, UserDetails } from 'src/decorators';
import { UserEntity } from './user.entity';
import { UpdateUserDto } from './dtos/update-user.dto';
import { AuthGuard } from 'src/guards/user.guard';
import { ValidationPipe } from 'src/pipes/validation.pipe';
import { updateUserSchema } from './schemas/update-user.schema';

@ApiBearerAuth()
@Controller('user/me')
export class MeController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard)
  @Get()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User found successfully',
    type: UserEntity,
  })
  @ResponseMessage('User found successfully')
  public async findMe(@UserDetails() user: UserEntity) {
    return this.userService.findUserByIdOrThrow(user.id);
  }

  @Patch()
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe(updateUserSchema))
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: UserEntity,
  })
  @ResponseMessage('User updated successfully')
  public async updateMe(
    @UserDetails() user: UserEntity,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUser(user.id, updateUserDto);
  }

  @Delete()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Delete current user account' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ResponseMessage('User deleted successfully')
  async deleteMe(@UserDetails() user: UserEntity) {
    return this.userService.deleteUser(user.id);
  }
}
