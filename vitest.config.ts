/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@server': path.resolve(__dirname, './server'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    include: ['src/tests/**/*.test.{ts,tsx}'],
    fileParallelism: false,
    testTimeout: 10000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      // Server-route suite guard (Phase 3, item 16): track coverage of the
      // Express layer only — client UI coverage is out of scope for now.
      // Branch threshold sits at 50: the residual branches are live-Mongo /
      // live-gateway error paths that require real infrastructure to reach.
      include: ['server/**/*.ts'],
      thresholds: {
        statements: 70,
        branches: 50,
        functions: 85,
        lines: 70
      }
    },
  },
});
