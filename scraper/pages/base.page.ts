import { Injectable } from '@nestjs/common';
import { By, WebElement } from 'selenium-webdriver';
import { until } from 'selenium-webdriver';
import { BrowserService } from '../browser';
import { ScraperConfigService } from '../scraper.config';

@Injectable()
export abstract class BasePage {
  constructor(
    protected readonly browserService: BrowserService,
    protected readonly config: ScraperConfigService,
  ) {}

  protected get driver() {
    return this.browserService.getDriver();
  }

  protected get timeout(): number {
    return this.config.timeout;
  }

  protected async waitForElement(selector: string): Promise<WebElement> {
    const element = await this.driver.wait(
      until.elementLocated(By.css(selector)),
      this.timeout,
      `Element not found: ${selector}`,
    );
    await this.driver.wait(until.elementIsVisible(element), this.timeout);
    return element;
  }

  protected async fillInput(element: WebElement, value: string): Promise<void> {
    await element.clear();
    await element.sendKeys(value);
  }

  protected async clickButton(element: WebElement): Promise<void> {
    await this.driver.wait(until.elementIsEnabled(element), this.timeout);
    await element.click();
  }

  protected async getText(parent: WebElement, selector: string): Promise<string> {
    try {
      const element = await parent.findElement(By.css(selector));
      return await element.getText();
    } catch {
      return 'N/A';
    }
  }

  protected async waitForUrl(partialUrl: string): Promise<void> {
    await this.driver.wait(
      until.urlContains(partialUrl),
      this.timeout,
      `URL did not contain: ${partialUrl}`,
    );
  }
}
