import { Test, TestingModule } from '@nestjs/testing';
import { spawn } from 'node:child_process';
import * as path from 'node:path';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

import '../main.test';
import { AppModule } from '../../src/app.module';
import { TestDatabaseEnvironment } from '../utils/database.util';

async function runArtillery(scenario: string, targetUrl: string) {
  return new Promise((resolve, reject) => {
    const jsonReport = path.join(__dirname, `reports/${scenario}.json`);
    const yamlScenario = path.join(__dirname, `scenarios/${scenario}.yml`);

    const args = ['artillery', 'run', yamlScenario, '-o', jsonReport];

    if (targetUrl) {
      args.push('--target', targetUrl);
    }

    if (process.env.ARTILLERY_CLOUD_API_KEY) {
      args.push('--record', '--key', process.env.ARTILLERY_CLOUD_API_KEY);
    }

    console.log(`\n--- Running scenario: ${scenario} ---`);
    const proc = spawn('npx', args, {
      stdio: 'inherit',
      env: { ...process.env },
    });

    proc.on('close', (code) => {
      if (code !== 0) {
        return reject(
          new Error(`Artillery run failed for ${scenario} with code ${code}`),
        );
      }

      console.log(`✅ Generated JSON report: ${jsonReport}`);
      resolve(null);
    });
  });
}

function generateRandomString(length: number) {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length);
}

async function bootstrap() {
  const dbEnv = new TestDatabaseEnvironment();
  await dbEnv.start();

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  const configService = app.get(ConfigService);

  await app.listen(configService.getOrThrow('PORT'));

  const scenarios = [
    'spike-registration',
    'load-events',
    'heavy-auth',
    'e2e-journey',
    'soak-test',
  ];

  try {
    for (const scenario of scenarios) {
      console.log(`\nCleaning database before ${scenario}...`);
      await dbEnv.reset();

      console.log(`Seeding initial data for ${scenario}...`);
      const passwordHash = await bcrypt.hash('Pass123!', 10);
      const hostUser = await dbEnv.prisma.user.create({
        data: {
          email: `host_${generateRandomString(5)}@example.com`,
          password: passwordHash,
          firstName: 'Host',
          lastName: 'User',
        },
      });

      const category = await dbEnv.prisma.category.create({
        data: {
          name: `Tech ${generateRandomString(5)}`,
          createdById: hostUser.id,
        },
      });

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const event = await dbEnv.prisma.event.create({
        data: {
          title: `Target Event ${generateRandomString(5)}`,
          description: 'A very large event',
          startDate: tomorrow,
          endDate: new Date(tomorrow.getTime() + 86400000),
          location: 'Conference Hall',
          categoryId: category.id,
          createdById: hostUser.id,
        },
      });

      // Provide Target Event ID for Artillery variables
      process.env.TARGET_EVENT_ID = event.id;

      const port = configService.getOrThrow<string>('PORT');
      const targetUrl = process.env.BASE_URL || `http://localhost:${port}`;

      await runArtillery(scenario, targetUrl);
    }
    console.log('\n🎉 All performance tests completed successfully!');
  } catch (err) {
    console.error('❌ Performance tests failed', err);
    process.exitCode = 1;
  } finally {
    await app.close();
    await dbEnv.stop();
  }
}

void bootstrap();
