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

  // The 2026-11-11 CI outage: `main` had no .nvmrc, so *every* job on every
  // workflow died inside setup-node before its first real step. These two tests
  // pin the properties that made it a total failure rather than one red job.
  it('gives every setup-node step a Node version to install', () => {
    // A step's `with:` block is indented to the same level as its `uses:` key,
    // so scan forward until the indentation drops below the step.
    const dir = path.join(root, '.github/workflows');
    const unpinned: string[] = [];
    for (const file of readdirSync(dir).filter((f) => /\.ya?ml$/.test(f))) {
      const lines = readFileSync(path.join(dir, file), 'utf8').split('\n');
      lines.forEach((line, i) => {
        if (!/uses:\s*actions\/setup-node@/.test(line)) return;
        const stepIndent = line.search(/\S/);
        const options: string[] = [];
        for (let j = i + 1; j < lines.length; j++) {
          if (lines[j].trim() === '') continue;
          if (lines[j].search(/\S/) < stepIndent) break;
          options.push(lines[j]);
        }
        if (!options.some((o) => /node-version(-file)?:/.test(o))) {
          unpinned.push(`${file}:${i + 1}`);
        }
      });
    }
    expect(unpinned).toEqual([]);
  });

  it('pins third-party actions to a version, never a floating major tag', () => {
    // `actions/setup-node@v7` declares `using: node24`; a bare `@v7` can change the
    // action's own runtime (or its behaviour) between two identical runs.
    const dir = path.join(root, '.github/workflows');
    const floating: string[] = [];
    for (const file of readdirSync(dir).filter((f) => /\.ya?ml$/.test(f))) {
      const body = readFileSync(path.join(dir, file), 'utf8');
      for (const m of body.matchAll(/uses:\s*([\w.-]+\/[\w.-]+@v\d+)\s*$/gm)) {
        if (!m[1].includes('docker/')) floating.push(`${file}: ${m[1]}`);
      }
    }
    expect(floating).toEqual([]);
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
