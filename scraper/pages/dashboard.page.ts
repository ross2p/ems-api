import { Injectable } from '@nestjs/common';
import { By } from 'selenium-webdriver';
import { until } from 'selenium-webdriver';
import { BasePage } from './base.page';
import { BrowserService } from '../browser';
import { ScraperConfigService } from '../scraper.config';

@Injectable()
export class DashboardPage extends BasePage {
  private readonly SELECTORS = {
    accountMenuButton: '.MuiAppBar-root button.MuiIconButton-root',
    logoutMenuItem: "//li[contains(@role,'menuitem') and contains(.,'Logout')]",
  } as const;

  constructor(
    browserService: BrowserService,
    config: ScraperConfigService,
  ) {
    super(browserService, config);
  }

  async logout(): Promise<void> {
    const menuButton = await this.driver.wait(
      until.elementLocated(By.css(this.SELECTORS.accountMenuButton)),
      this.timeout,
      'Account menu button not found',
    );
    await this.driver.wait(until.elementIsVisible(menuButton), this.timeout);
    await menuButton.click();

    const logoutItem = await this.driver.wait(
      until.elementLocated(By.xpath(this.SELECTORS.logoutMenuItem)),
      this.timeout,
      'Logout menu item not found',
    );
    await this.driver.wait(until.elementIsVisible(logoutItem), this.timeout);
    await logoutItem.click();

    await this.waitForUrl('/auth/login');
  }
}
