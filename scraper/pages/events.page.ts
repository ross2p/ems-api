import { Injectable } from '@nestjs/common';
import { By, WebElement } from 'selenium-webdriver';
import { BasePage } from './base.page';
import { BrowserService } from '../browser';
import { ScraperConfigService } from '../scraper.config';
import { ScrapedEvent } from '../interfaces';

@Injectable()
export class EventsPage extends BasePage {
  private readonly SELECTORS = {
    card: '.MuiCard-root',
    noEventsText: "//*[contains(text(),'No events found')]",
    nextPageButton: 'button[aria-label="Go to next page"]',
    cardTitle: 'h2, h5',
    iconRow: ".//*[contains(@class,'MuiSvgIcon-root')]/ancestor::div[1]",
    bodyText: '.MuiCardContent-root .MuiTypography-body2',
    chipLabel: '.MuiChip-label',
  } as const;

  constructor(
    browserService: BrowserService,
    config: ScraperConfigService,
  ) {
    super(browserService, config);
  }

  async navigate(): Promise<void> {
    const { baseUrl } = this.config.get();
    await this.driver.get(`${baseUrl}/dashboard/events`);

    await this.driver.wait(
      async () => {
        const cards = await this.driver.findElements(By.css(this.SELECTORS.card));
        const noEvents = await this.driver.findElements(
          By.xpath(this.SELECTORS.noEventsText),
        );
        return cards.length > 0 || noEvents.length > 0;
      },
      this.timeout,
      'Events page did not load',
    );
  }

  async scrapeAllPages(): Promise<ScrapedEvent[]> {
    const allEvents: ScrapedEvent[] = [];

    while (true) {
      const events = await this.scrapeCurrentPage();
      allEvents.push(...events);

      const hasNextPage = await this.goToNextPage();
      if (!hasNextPage) {
        break;
      }

      await this.driver.sleep(1000);
    }

    return allEvents;
  }

  private async scrapeCurrentPage(): Promise<ScrapedEvent[]> {
    const cards = await this.driver.findElements(By.css(this.SELECTORS.card));
    const events: ScrapedEvent[] = [];

    for (const card of cards) {
      const event = await this.extractEventFromCard(card);
      if (event) {
        events.push(event);
      }
    }

    return events;
  }

  private async extractEventFromCard(
    card: WebElement,
  ): Promise<ScrapedEvent | null> {
    try {
      const title = await this.getText(card, this.SELECTORS.cardTitle);
      const date = await this.extractIconRowText(card, 0);
      const location = await this.extractIconRowText(card, 1);
      const description = await this.extractLastBodyText(card);
      const category = await this.extractChipText(card);

      return { title, date, location, description, category };
    } catch {
      return null;
    }
  }

  private async extractIconRowText(
    parent: WebElement,
    index: number,
  ): Promise<string> {
    try {
      const rows = await parent.findElements(
        By.xpath(this.SELECTORS.iconRow),
      );
      return rows[index] ? await rows[index].getText() : 'N/A';
    } catch {
      return 'N/A';
    }
  }

  private async extractLastBodyText(parent: WebElement): Promise<string> {
    try {
      const bodyTexts = await parent.findElements(
        By.css(this.SELECTORS.bodyText),
      );
      return bodyTexts.length > 0
        ? await bodyTexts[bodyTexts.length - 1].getText()
        : 'N/A';
    } catch {
      return 'N/A';
    }
  }

  private async extractChipText(parent: WebElement): Promise<string | null> {
    try {
      const chip = await parent.findElement(By.css(this.SELECTORS.chipLabel));
      return await chip.getText();
    } catch {
      return null;
    }
  }

  private async goToNextPage(): Promise<boolean> {
    try {
      const nextButton = await this.driver.findElement(
        By.css(this.SELECTORS.nextPageButton),
      );
      const isDisabled = await nextButton.getAttribute('disabled');

      if (isDisabled) {
        return false;
      }

      await nextButton.click();
      return true;
    } catch {
      return false;
    }
  }
}
