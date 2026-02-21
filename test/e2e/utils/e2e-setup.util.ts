import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../../src/app.module';
import { TestDatabaseEnvironment } from '../../utils/database.util';

export interface E2ETestEnvironment {
  app: INestApplication;
  dbEnv: TestDatabaseEnvironment;
}

export function setupE2ETestEnvironment(): E2ETestEnvironment {
  const env: E2ETestEnvironment = {
    app: null as any,
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

  return env;
}
