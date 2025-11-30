import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { checkExists, SALT_ROUND } from 'src/utils';
import * as bcrypt from 'bcrypt';
 

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}
  async findUserByIdOrThrow(userId: string) {
    return checkExists(
      this.userRepository.findUserById(userId),
      'User not found',
    );
  }

  async createUser(newUser: CreateUserDto) {
    if (newUser.password) {
      newUser.password = this.hashPassword(newUser.password);
    }
    return this.userRepository.createUser(newUser);
  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto) {
    await this.findUserByIdOrThrow(userId);
    if (updateUserDto.password) {
      updateUserDto.password = this.hashPassword(updateUserDto.password);
    }
    return this.userRepository.updateUser(userId, updateUserDto);
  }

  private hashPassword(password: string) {
    return bcrypt.hash(password, SALT_ROUND);
  }

  async deleteUser(userId: string) {
    await this.findUserByIdOrThrow(userId);
    return this.userRepository.deleteUser(userId);
  }

  async findUserByEmailandPassword(email: string, password: string) {
    return this.userRepository.findUserByEmailAndPassword(email, this.hashPassword(password));
  }
}
