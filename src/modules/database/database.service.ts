import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '../../../generated/prisma/client';
import { PrismaPostgresAdapter } from '@prisma/adapter-ppg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class DatabaseService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger: Logger = new Logger(DatabaseService.name);

  constructor() {
    const connectionString = `${process.env.DATABASE_URL}`;

    const adapter = new PrismaPg({ connectionString });
    super({
      adapter,
      omit: {
        user: {
          password: true,
        },
      },
    });
  }

  public async onModuleInit() {
    this.logger.log('Connecting to database...');
    await this.$connect();
    this.logger.log(
      'Database connected successfully, user repository initialized',
    );
  }

  public async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Disconnected from database successfully');
  }
}
