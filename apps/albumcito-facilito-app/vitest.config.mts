import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true },
  test: {
    environment: "jsdom",
    // Cada step Gherkin es un test; evita que RTL limpie el DOM entre steps
    // (se limpia por escenario con AfterEachScenario).
    env: { RTL_SKIP_AUTO_CLEANUP: "true" },
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
