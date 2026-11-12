import { existsSync, readFileSync, readdirSync } from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';

// Ruling R3: the suite is ESM with no __dirname; repo-relative reads use cwd
// (vitest is invoked from the repo root), matching
// src/tests/server/dependabotWorkflowGuard.test.ts.
const root = process.cwd();

describe('Node runtime contract (D5: Node 24 everywhere)', () => {
  it('pins .nvmrc to 24', () => {
    expect(readFileSync(path.join(root, '.nvmrc'), 'utf8').trim()).toBe('24');
  });

  it('declares a >=24 engine floor that accepts newer majors', () => {
    const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
    expect(pkg.engines.node).toBe('>=24');
    expect(pkg.engines.node.startsWith('>=')).toBe(true);
  });

  it('resolves every node-version-file reference in .github/workflows', () => {
    const dir = path.join(root, '.github/workflows');
    const refs = readdirSync(dir)
      .filter((f) => f.endsWith('.yml') || f.endsWith('.yaml'))
      .flatMap((f) => readFileSync(path.join(dir, f), 'utf8').match(/node-version-file:\s*(\S+)/g) ?? []);
    expect(refs.length).toBeGreaterThan(0);
    for (const ref of refs) {
      const target = ref.split(':')[1].trim();
      expect(existsSync(path.join(root, target)), `${target} referenced by a workflow must exist`).toBe(true);
    }
  });
});
