import { Inject, Injectable, Logger } from '@nestjs/common';
import { BrowserService } from './browser';
import { ScraperConfigService } from './scraper.config';
import {
  SCENARIO_TOKEN,
  Scenario,
  ScenarioResult,
} from './interfaces';

@Injectable()
export class ScenarioRunnerService {
  private readonly logger = new Logger(ScenarioRunnerService.name);

  constructor(
    private readonly browserService: BrowserService,
    private readonly config: ScraperConfigService,
    @Inject(SCENARIO_TOKEN) private readonly scenarios: Scenario[],
  ) {}

  getAvailableScenarios(): string[] {
    return this.scenarios.map((s) => s.key);
  }

  async runScenario(key: string): Promise<ScenarioResult> {
    const scenario = this.scenarios.find((s) => s.key === key);

    if (!scenario) {
      const available = this.getAvailableScenarios().join(', ');
      throw new Error(`Unknown scenario: "${key}". Available: ${available}`);
    }

    const { baseUrl, headless } = this.config.get();

    this.logger.log('=== EMS Scraper ===');
    this.logger.log(`Target: ${baseUrl}`);
    this.logger.log(`Headless: ${headless}`);
    this.logger.log(`Scenario: ${scenario.name}`);

    const start = Date.now();

    try {
      await this.browserService.launch();
      const data = await scenario.run();
      const durationMs = Date.now() - start;

      this.logger.log(`Scenario "${scenario.name}" completed successfully`);
      return {
        scenario: scenario.name,
        success: true,
        data,
        durationMs,
      };
    } catch (error) {
      const durationMs = Date.now() - start;
      const message = error instanceof Error ? error.message : String(error);

      this.logger.error(`Scenario "${scenario.name}" failed: ${message}`);
      return {
        scenario: scenario.name,
        success: false,
        error: message,
        durationMs,
      };
    } finally {
      await this.browserService.quit();
    }
  }

  async runAllScenarios(): Promise<ScenarioResult[]> {
    const results: ScenarioResult[] = [];

    for (const scenario of this.scenarios) {
      const result = await this.runScenario(scenario.key);
      results.push(result);
    }

    return results;
  }
}
