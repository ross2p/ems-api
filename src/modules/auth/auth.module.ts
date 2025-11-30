import { Global, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokenModule } from '../token/token.module';
import { UserModule } from '../user/user.module';
import { AuthGuard } from 'src/guards/user.guard';

@Global()
@Module({
  controllers: [AuthController],
  imports: [TokenModule, UserModule],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
