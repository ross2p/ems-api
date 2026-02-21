import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

export class TestDatabaseEnvironment {
  private container: StartedPostgreSqlContainer;
  public prisma: PrismaClient;
  private pool: Pool;

  async start() {
    this.container = await new PostgreSqlContainer(
      'postgres:15-alpine',
    ).start();
    const databaseUrl = this.container.getConnectionUri();

    process.env.DATABASE_URL = databaseUrl;

    await execAsync('npx prisma db push --accept-data-loss', {
      env: { ...process.env, DATABASE_URL: databaseUrl },
    });

    this.pool = new Pool({ connectionString: databaseUrl });
    const adapter = new PrismaPg(this.pool);

    this.prisma = new PrismaClient({ adapter });
    await this.prisma.$connect();
  }

  async stop() {
    if (this.prisma) {
      await this.prisma.$disconnect();
    }
    if (this.pool) {
      await this.pool.end();
    }
    if (this.container) {
      await this.container.stop();
    }
  }

  async reset() {
    const tablenames = await this.prisma.$queryRaw<
      Array<{ tablename: string }>
    >`
      SELECT tablename FROM pg_tables WHERE schemaname='public'
    `;

    const tables = tablenames
      .map(({ tablename }) => tablename)
      .filter((name) => name !== '_prisma_migrations')
      .map((name) => `"public"."${name}"`)
      .join(', ');

    if (tables.length > 0) {
      await this.prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
    }
  }
}
