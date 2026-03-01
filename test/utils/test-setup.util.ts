import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '@/app.module';
import { TestDatabaseEnvironment } from './database.util';

export interface TestEnvironment {
  app: INestApplication;
  dbEnv: TestDatabaseEnvironment;
}

export function setupTestEnvironment(): TestEnvironment {
  const env: {
    app: INestApplication | null;
    dbEnv: TestDatabaseEnvironment;
  } = {
    app: null,
    dbEnv: new TestDatabaseEnvironment(),
  };

  beforeAll(async () => {
    await env.dbEnv.start();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    env.app = moduleFixture.createNestApplication();
    await env.app.init();
  }, 60000);

  afterAll(async () => {
    if (env.app) {
      await env.app.close();
    }
    await env.dbEnv.stop();
  });

  beforeEach(async () => {
    await env.dbEnv.reset();
  });

  return env as TestEnvironment;
}
