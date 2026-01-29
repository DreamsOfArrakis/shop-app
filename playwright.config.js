const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'], // Human-readable console output
    ['html'], // HTML report for detailed view
  ],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on',
  },
  projects: [
    {
      name: 'e2e',
      testDir: './tests/e2e',
      testMatch: /.*\.spec\.js$/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'api',
      testDir: './tests/api',
      testMatch: /.*\.spec\.js$/,
      use: {
        baseURL: process.env.API_BASE_URL || 'https://shop-app-hazel-one.vercel.app',
      },
    },
  ],
});

