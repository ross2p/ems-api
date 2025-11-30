import { ConfigModule } from '@nestjs/config';
import { Global, Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { envSchema } from '../schemas';

@Global()
@Module({
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
