import { execFileSync } from 'child_process';
import { readFileSync } from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';

// Ruling R3: repo-relative paths resolve from the vitest cwd (repo root).
const root = process.cwd();
const keysOf = (f: string) =>
  readFileSync(path.join(root, f), 'utf8')
    .split('\n')
    .map((l) => /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=/.exec(l)?.[1])
    .filter(Boolean) as string[];

describe('env template parity (.env.example is the base)', () => {
  const base = keysOf('.env.example');

  it('has the same key set as both deployment templates', () => {
    for (const f of ['.env.staging.example', '.env.production.example']) {
      expect(new Set(keysOf(f)), f).toEqual(new Set(base));
    }
  });

  it('documents the runtime variables the server and workflows actually read', () => {
    expect(base).toContain('NODE_ENV');
    expect(base).toContain('PORT');
  });

  it('carries no variable that no code reads', () => {
    expect(base).not.toContain('GEMINI_API_KEY');
  });

  it('passes scripts/check-env.mjs in CI mode', () => {
    expect(() =>
      execFileSync(process.execPath, ['scripts/check-env.mjs'], {
        cwd: root,
        env: {
          ...process.env,
          CI: 'true',
          NODE_ENV: 'production',
          APP_ORIGIN: 'https://www.catalystlab.tech',
          FIREBASE_SERVICE_ACCOUNT_PATH: '.github/fixtures/ci-service-account.json',
        },
        stdio: 'pipe',
      })
    ).not.toThrow();
  });
});
