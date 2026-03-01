import { NestFactory } from '@nestjs/core';
import { ScraperModule } from './scraper.module';
import { ScenarioRunnerService } from './scenario-runner.service';
import { ScenarioResult } from './interfaces';
import { ScrapedEvent } from './interfaces';

function formatResult(result: ScenarioResult): void {
  const status = result.success ? '✓' : '✗';
  const duration = `${result.durationMs}ms`;
  console.log(`\n${status} ${result.scenario} (${duration})`);

  if (result.success && result.data !== undefined) {
    if (Array.isArray(result.data) && result.data.length > 0) {
      const first = result.data[0];
      if (
        first &&
        typeof first === 'object' &&
        'title' in first &&
        'date' in first
      ) {
        console.table(result.data as ScrapedEvent[]);
      } else {
        console.log(JSON.stringify(result.data, null, 2));
      }
    } else if (typeof result.data === 'object' && result.data !== null) {
      console.log(JSON.stringify(result.data, null, 2));
    }
  }

  if (!result.success && result.error) {
    console.error(`  Error: ${result.error}`);
  }
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(ScraperModule, {
    logger: ['log', 'error', 'warn'],
  });

  const runner = app.get(ScenarioRunnerService);
  const scenarioKey = process.argv[2];

  if (scenarioKey) {
    const result = await runner.runScenario(scenarioKey);
    formatResult(result);
  } else {
    console.log(
      `Available scenarios: ${runner.getAvailableScenarios().join(', ')}`,
    );
    console.log('Usage: npm run test:scrape -- <scenario-key>');
    console.log('Running all scenarios...\n');

    const results = await runner.runAllScenarios();
    results.forEach(formatResult);
  }

  await app.close();
}

void bootstrap();
