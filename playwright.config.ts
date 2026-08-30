import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  // resilience.spec.ts has its own config (playwright.resilience.config.ts)
  // and its own webServer pair; it must never run under this one.
  testIgnore: /resilience\.spec\.ts/,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    // Port 3300, not 3000, and that is the whole point. `reuseExistingServer`
    // reuses whatever already answers on this port, and on 3000 that is a
    // developer's `next dev`. The suite then silently measured a dev build:
    // Lighthouse scored it 0.84 on unminified, HMR-laden JS, and the visual
    // baselines were captured with the Next devtools badge burned into the
    // corner. On a port only this config's production server ever uses, reuse
    // can only ever reuse a previous production server, so local runs stay fast
    // and stay correct. E2E_BASE_URL still overrides for a deployed target.
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3300',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'mobile',
      use: { ...devices['Desktop Chrome'], viewport: { width: 375, height: 812 } },
    },
    {
      name: 'tablet',
      use: { ...devices['Desktop Chrome'], viewport: { width: 768, height: 1024 } },
    },
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'pnpm build && pnpm start --port 3300',
        url: 'http://localhost:3300',
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
      },
});
