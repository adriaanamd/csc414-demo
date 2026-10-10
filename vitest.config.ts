import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
    environmentMatchGlobs: [
      ['tests/unit/**', 'node'],
      ['tests/ui/**', 'jsdom'],
      ['tests/e2e/**', 'jsdom'],
    ],
    restoreMocks: true,
  },
});
