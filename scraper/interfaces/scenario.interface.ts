export const SCENARIO_TOKEN = Symbol('SCENARIO_TOKEN');

export interface Scenario {
  readonly key: string;
  readonly name: string;
  run(): Promise<unknown>;
}

export interface ScenarioResult {
  scenario: string;
  success: boolean;
  data?: unknown;
  error?: string;
  durationMs: number;
}
