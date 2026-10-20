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
      // Ratchet (production-readiness-plan.md §4b.6): these numbers are the
      // measured baseline of the whole suite as of 2026-10-19 (statements
      // 68.36, branches 55.89, functions 72.58, lines 69.86), rounded down to
      // the nearest integer so a run is green only if it does not regress.
      // They may be raised when coverage improves, never lowered to make a
      // regression pass. `npm run test:coverage` is the gate that enforces it;
      // `npm run ci` runs the suite without the coverage budget.
      thresholds: {
        statements: 68,
        branches: 55,
        functions: 72,
        lines: 69
      }
    },
  },
});
