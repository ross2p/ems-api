import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SCENARIO_TOKEN } from './interfaces';
import { ScraperConfigService } from './scraper.config';
import { BrowserService } from './browser';
import {
  DashboardPage,
  LoginPage,
  RegisterPage,
  EventsPage,
} from './pages';
import { RegisterLoginScrapeScenario, RegistrationScenario } from './scenarios';
import { ScenarioRunnerService } from './scenario-runner.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env.test',
      isGlobal: true,
    }),
  ],
  providers: [
    ScraperConfigService,
    BrowserService,
    DashboardPage,
    LoginPage,
    RegisterPage,
    EventsPage,
    RegisterLoginScrapeScenario,
    RegistrationScenario,
    {
      provide: SCENARIO_TOKEN,
      useFactory: (
        registerLoginScrape: RegisterLoginScrapeScenario,
        registration: RegistrationScenario,
      ) => [registerLoginScrape, registration],
      inject: [RegisterLoginScrapeScenario, RegistrationScenario],
    },
    ScenarioRunnerService,
  ],
  exports: [ScenarioRunnerService],
})
export class ScraperModule {}
