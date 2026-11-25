import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    env: { JWT_SECRET: 'test-secret' },
    root: './',
    include: ['test/bdd/**/*.bdd-spec.ts'],
  },
});
