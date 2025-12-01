import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserEntity } from './user.entity';
import { Prisma } from '../../../generated/prisma/client';

const selectWithPassword: Record<keyof UserEntity, true> = Object.fromEntries(
  Object.keys(new UserEntity()).map((key) => [key, true]),
) as Record<keyof UserEntity, true>;

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

  async findUserByEmailAndPassword(email: string, password: string) {
    return this.userRepository.findUnique({
      where: { email, password },
    });
  }

  async updateUser(userId: string, data: UpdateUserDto) {
    return this.userRepository.update({ where: { id: userId }, data });
  }

  async deleteUser(userId: string) {
    return this.userRepository.delete({ where: { id: userId } });
  }
}
