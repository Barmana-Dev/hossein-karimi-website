import { defineConfig, devices } from "@playwright/test";

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: isCI ? 2 : undefined,
  reporter: isCI ? [["list"], ["github"]] : [["list"]],
  use: {
    baseURL: process.env.E2E_BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    locale: "fa-IR",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "npm run dev:api",
      url: "http://localhost:4000/api/health",
      reuseExistingServer: !isCI,
      timeout: 120_000,
    },
    {
      command: process.env.E2E_WEB_COMMAND || "npm run dev",
      url: process.env.E2E_BASE_URL || "http://localhost:3000",
      reuseExistingServer: !isCI,
      timeout: 180_000,
    },
  ],
});
