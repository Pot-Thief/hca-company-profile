import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  testMatch: /resilience\.spec\.ts/,
  reporter: 'list',
  use: { baseURL: 'http://localhost:3100', ...devices['Desktop Chrome'] },
  webServer: [
    {
      command: `FIXTURE_SET=${process.env.FIXTURE_SET ?? 'live'} node e2e/fixture-server.mjs`,
      url: 'http://localhost:4321/site.json',
      reuseExistingServer: false,
    },
    {
      command:
        'CONTENT_BASE_URL=http://localhost:4321 CONTENT_REVALIDATE=0 pnpm build && ' +
        'CONTENT_BASE_URL=http://localhost:4321 CONTENT_REVALIDATE=0 pnpm start -p 3100',
      url: 'http://localhost:3100',
      reuseExistingServer: false,
      timeout: 180_000,
    },
  ],
});
