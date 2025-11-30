import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { JwtModule } from '@nestjs/jwt';
import { PayloadMapper } from './payload.mapper';

@Module({
  imports: [
    JwtModule.register({
      global: true,
    }),
  ],
  providers: [TokenService, PayloadMapper],
  exports: [TokenService],
})
export class TokenModule {}
