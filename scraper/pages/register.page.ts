import { Injectable } from '@nestjs/common';
import { By } from 'selenium-webdriver';
import { until } from 'selenium-webdriver';
import { BasePage } from './base.page';
import { BrowserService } from '../browser';
import { ScraperConfigService } from '../scraper.config';

@Injectable()
export class RegisterPage extends BasePage {
  private readonly SELECTORS = {
    firstNameInput: 'input[autocomplete="given-name"]',
    lastNameInput: 'input[autocomplete="family-name"]',
    emailInput: 'input[type="email"]',
    passwordInputs: 'input[type="password"]',
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
    await this.driver.get(`${baseUrl}/auth/register`);
  }

  async register(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
  ): Promise<void> {
    await this.navigate();

    const firstNameInput = await this.driver.wait(
      until.elementLocated(By.css(this.SELECTORS.firstNameInput)),
      this.timeout,
      'Registration form not found',
    );
    await this.driver.wait(until.elementIsVisible(firstNameInput), this.timeout);

    await this.fillInput(firstNameInput, firstName);

    const lastNameInput = await this.driver.findElement(
      By.css(this.SELECTORS.lastNameInput),
    );
    await this.fillInput(lastNameInput, lastName);

    const emailInput = await this.driver.findElement(
      By.css(this.SELECTORS.emailInput),
    );
    await this.fillInput(emailInput, email);

    const passwordInputs = await this.driver.findElements(
      By.css(this.SELECTORS.passwordInputs),
    );
    await this.fillInput(passwordInputs[0], password);
    await this.fillInput(passwordInputs[1], password);

    const submitButton = await this.driver.findElement(
      By.xpath(this.SELECTORS.submitButton),
    );
    await this.clickButton(submitButton);

    await this.waitForUrl('/dashboard');
  }
}
