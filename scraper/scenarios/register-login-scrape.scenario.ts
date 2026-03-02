import { Injectable } from '@nestjs/common';
import { Scenario } from '../interfaces';
import { RegisterPage } from '../pages/register.page';
import { DashboardPage } from '../pages/dashboard.page';
import { LoginPage } from '../pages/login.page';
import { EventsPage } from '../pages/events.page';
import { ScrapedEvent } from '../interfaces';

@Injectable()
export class RegisterLoginScrapeScenario implements Scenario {
  readonly key = 'register-login-scrape';
  readonly name = 'Register, Login & Scrape Events';

  constructor(
    private readonly registerPage: RegisterPage,
    private readonly dashboardPage: DashboardPage,
    private readonly loginPage: LoginPage,
    private readonly eventsPage: EventsPage,
  ) {}

  async run(): Promise<ScrapedEvent[]> {
    const email = `test_${Date.now()}@example.com`;
    const password = 'TestPassword123!';

    await this.registerPage.register('Test', 'User', email, password);
    await this.dashboardPage.logout();
    await this.loginPage.login(email, password);
    await this.eventsPage.navigate();
    const events = await this.eventsPage.scrapeAllPages();
    return events;
  }
}
