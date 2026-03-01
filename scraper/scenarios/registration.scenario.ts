import { Injectable } from '@nestjs/common';
import { Scenario } from '../interfaces';
import { RegisterPage } from '../pages/register.page';

@Injectable()
export class RegistrationScenario implements Scenario {
  readonly key = 'registration';
  readonly name = 'Registration';

  constructor(private readonly registerPage: RegisterPage) {}

  async run(): Promise<{ email: string; registered: boolean }> {
    const uniqueEmail = `test_${Date.now()}@example.com`;
    const password = 'TestPassword123!';

    await this.registerPage.register('Test', 'User', uniqueEmail, password);

    return { email: uniqueEmail, registered: true };
  }
}
