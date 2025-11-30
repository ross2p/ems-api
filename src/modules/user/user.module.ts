import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { MeController } from './me.controller';

@Module({
  controllers: [MeController],
  providers: [UserService, UserRepository],
  exports: [UserService],
})
export class UserModule {}
