import { Injectable, Logger } from '@nestjs/common';
import { Builder, WebDriver } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import 'chromedriver';
import { ScraperConfigService } from '../scraper.config';

@Injectable()
export class BrowserService {
  private readonly logger = new Logger(BrowserService.name);
  private driver: WebDriver | null = null;

  constructor(private readonly config: ScraperConfigService) {}

  async launch(): Promise<WebDriver> {
    this.logger.log('Launching Chrome browser...');

    const options = new chrome.Options();

    if (this.config.headless) {
      options.addArguments('--headless=new');
    }

    options.addArguments(
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--window-size=1920,1080',
    );

    this.driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();

    this.logger.log(`Browser launched (headless: ${this.config.headless})`);
    return this.driver;
  }

  getDriver(): WebDriver {
    if (!this.driver) {
      throw new Error('Browser not launched. Call launch() first.');
    }
    return this.driver;
  }

  async quit(): Promise<void> {
    if (this.driver) {
      await this.driver.quit();
      this.driver = null;
      this.logger.log('Browser closed');
    }
  }
}
