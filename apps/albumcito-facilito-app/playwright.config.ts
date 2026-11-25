import { defineConfig, devices } from "@playwright/test";
import { defineBddConfig } from "playwright-bdd";

const API_PORT = 3101;
const APP_PORT = 3102;

const testDir = defineBddConfig({
  features: "e2e/features/*.feature",
  steps: "e2e/steps/*.ts",
  outputDir: ".features-gen",
});

export default defineConfig({
  testDir,
  // La API guarda usuarios en memoria: un solo worker evita colisiones de slugs.
  workers: 1,
  fullyParallel: false,
  reporter: [["list"], ["html", { open: "never" }]],
  use: { baseURL: `http://localhost:${APP_PORT}`, trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "pnpm build && node dist/main.js",
      cwd: "../../services/albumcito-facilito-api",
      url: `http://localhost:${API_PORT}`,
      env: { PORT: String(API_PORT), JWT_SECRET: "e2e-secret" },
      // Siempre una API limpia: los usuarios viven en memoria.
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      command: `pnpm exec next dev -p ${APP_PORT}`,
      url: `http://localhost:${APP_PORT}/login`,
      env: { API_URL: `http://localhost:${API_PORT}` },
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
