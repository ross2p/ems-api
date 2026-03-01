import { Injectable } from '@nestjs/common';
import { By } from 'selenium-webdriver';
import { until } from 'selenium-webdriver';
import { BasePage } from './base.page';
import { BrowserService } from '../browser';
import { ScraperConfigService } from '../scraper.config';

@Injectable()
export class LoginPage extends BasePage {
  private readonly SELECTORS = {
    emailInput: 'input[type="email"]',
    passwordInput: 'input[type="password"]',
    submitButton: "//button[@type='submit']",
  } as const;

  constructor(
    browserService: BrowserService,
    config: ScraperConfigService,
  ) {
    super(browserService, config);
  }

  async navigate(): Promise<void> {
    const { baseUrl } = this.config.get();
    await this.driver.get(`${baseUrl}/auth/login`);
  }

  async login(email: string, password: string): Promise<void> {
    await this.navigate();

    const emailInput = await this.driver.wait(
      until.elementLocated(By.css(this.SELECTORS.emailInput)),
      this.timeout,
      'Email input not found',
    );
    await this.driver.wait(until.elementIsVisible(emailInput), this.timeout);

    await this.fillInput(emailInput, email);

    const passwordInput = await this.driver.findElement(
      By.css(this.SELECTORS.passwordInput),
    );
    await this.fillInput(passwordInput, password);

    const submitButton = await this.driver.findElement(
      By.xpath(this.SELECTORS.submitButton),
    );
    await this.clickButton(submitButton);

    await this.waitForUrl('/dashboard');
  }
}
