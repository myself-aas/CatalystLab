import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.E2E_PORT || 3098);
const BASE_URL = process.env.E2E_BASE_URL || `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 2,
  reporter: 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `NODE_ENV=production HOST=127.0.0.1 PORT=${PORT} APP_ORIGIN=${BASE_URL} PAYMENTS_ENABLED=false node dist/server.cjs`,
        url: `${BASE_URL}/api/v1/system/health`,
        reuseExistingServer: !process.env.CI,
        timeout: 30_000,
      },
});
