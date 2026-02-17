import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { Prisma } from '../../../generated/prisma/client';

@Injectable()
export class UserRepository {
  private readonly userRepository: Prisma.UserDelegate;
  constructor(db: DatabaseService) {
    this.userRepository = db.user;
  }

  async createUser(data: CreateUserDto) {
    return this.userRepository.create({ data });
  }

  async findUserById(userId: string) {
    return this.userRepository.findUnique({ where: { id: userId } });
  }

  async findUserByEmailWithPassword(email: string) {
    return this.userRepository.findUnique({
      where: { email },
      omit: { password: false },
    });
  }

  async updateUser(userId: string, data: UpdateUserDto) {
    return this.userRepository.update({ where: { id: userId }, data });
  }

  async deleteUser(userId: string) {
    return this.userRepository.delete({ where: { id: userId } });
  }
}
