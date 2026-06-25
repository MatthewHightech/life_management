import { defineConfig, devices } from "@playwright/test";

const apiEnv = {
  DATABASE_URL: process.env.DATABASE_URL ?? "postgresql://life:life@localhost:5432/life_management",
  AUTH_SECRET: process.env.AUTH_SECRET ?? "ci-auth-secret",
  API_URL: "http://localhost:4000",
  WEB_URL: "http://localhost:3000",
  ALLOWED_EMAILS: process.env.ALLOWED_EMAILS ?? "test@example.com",
};

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: process.env.CI
    ? [
        {
          command: "npm run start -w @life/api",
          url: "http://localhost:4000/health",
          reuseExistingServer: false,
          timeout: 120_000,
          env: apiEnv,
        },
        {
          command: "npm run start -w @life/web",
          url: "http://localhost:3000/sign-in",
          reuseExistingServer: false,
          timeout: 120_000,
          env: {
            ...apiEnv,
            NEXT_PUBLIC_API_URL: "http://localhost:4000",
          },
        },
      ]
    : undefined,
});
