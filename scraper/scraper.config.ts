import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ScraperConfig {
  baseUrl: string;
  headless: boolean;
  timeout: number;
}

@Injectable()
export class ScraperConfigService {
  private readonly config: ScraperConfig;

  constructor(private readonly configService: ConfigService) {
    this.config = {
      baseUrl: this.configService.get<string>(
        'SCRAPER_BASE_URL',
        'http://localhost:3001',
      ),
      headless:
        this.configService.get<string>('SCRAPER_HEADLESS', 'true') === 'true',
      timeout: this.configService.get<number>('SCRAPER_TIMEOUT', 10_000),
    };
  }

  get(): ScraperConfig {
    return this.config;
  }

  get baseUrl(): string {
    return this.config.baseUrl;
  }

  get headless(): boolean {
    return this.config.headless;
  }

  get timeout(): number {
    return this.config.timeout;
  }
}
