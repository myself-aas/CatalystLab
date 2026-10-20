import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const yaml = require('js-yaml') as { load: (input: string) => unknown };

const ROOT = process.cwd();

describe('GitHub Actions Workflows & Dependabot Peer-Integrity Guards', () => {
  it('parses all .github workflow & Dependabot YAML files cleanly with zero comment-truncated names', () => {
    const yamlFiles = [
      '.github/dependabot.yml',
      '.github/workflows/ci.yml',
      '.github/workflows/media-verify.yml',
      '.github/workflows/deploy.yml',
      '.github/workflows/backup.yml',
      '.github/workflows/rollback.yml',
    ];

    for (const relPath of yamlFiles) {
      const raw = fs.readFileSync(path.join(ROOT, relPath), 'utf8');
      const parsed = yaml.load(raw) as Record<string, any>;
      expect(parsed, `${relPath} must parse as a non-empty YAML document`).toBeTruthy();

      if (parsed.jobs && typeof parsed.jobs === 'object') {
        for (const [jobId, job] of Object.entries<any>(parsed.jobs)) {
          if (typeof job?.name === 'string') {
            const openParens = (job.name.match(/\(/g) || []).length;
            const closeParens = (job.name.match(/\)/g) || []).length;
            expect(
              openParens,
              `${relPath} job "${jobId}" name "${job.name}" has unbalanced parentheses (likely unquoted # comment truncation)`
            ).toBe(closeParens);
          }
          for (const step of job?.steps ?? []) {
            if (typeof step?.name === 'string') {
              const openParens = (step.name.match(/\(/g) || []).length;
              const closeParens = (step.name.match(/\)/g) || []).length;
              expect(
                openParens,
                `${relPath} step "${step.name}" has unbalanced parentheses (likely unquoted # comment truncation)`
              ).toBe(closeParens);
            }
          }
        }
      }
    }
  });

  it('guards Dependabot npm updates against peer-incompatible upstream majors that break strict npm ci', () => {
    const raw = fs.readFileSync(path.join(ROOT, '.github/dependabot.yml'), 'utf8');
    const parsed = yaml.load(raw) as { updates: Array<Record<string, any>> };
    const npmEntry = parsed.updates.find((u) => u['package-ecosystem'] === 'npm');
    expect(npmEntry).toBeDefined();

    const group = npmEntry?.groups?.['npm-dependencies'];
    expect(group?.['update-types']).toEqual([
      'version-update:semver-minor',
      'version-update:semver-patch',
    ]);

    const ignoredNames = new Set((npmEntry?.ignore ?? []).map((i: any) => i['dependency-name']));
    expect(ignoredNames.has('eslint')).toBe(true);
    expect(ignoredNames.has('@eslint/js')).toBe(true);
    expect(ignoredNames.has('typescript')).toBe(true);
  });

  it('keeps Cloudflare Pages project target aligned across deploy.yml and rollback.yml', () => {
    const deployRaw = fs.readFileSync(path.join(ROOT, '.github/workflows/deploy.yml'), 'utf8');
    const rollbackRaw = fs.readFileSync(path.join(ROOT, '.github/workflows/rollback.yml'), 'utf8');
    const extractProjects = (s: string) =>
      [...s.matchAll(/wrangler\s+pages\s+deploy\s+\S+\s+--project-name=([A-Za-z0-9_-]+)/g)].map((m) => m[1]);

    const deployProjects = extractProjects(deployRaw);
    const rollbackProjects = extractProjects(rollbackRaw);
    expect(deployProjects.length).toBeGreaterThan(0);
    expect(new Set(rollbackProjects)).toEqual(new Set(deployProjects));
  });

  it('keeps Express 5 path-to-regexp v8 route definitions free of bare splat wildcards', () => {
    const serverFiles = [
      path.join(ROOT, 'server.ts'),
      ...fs.readdirSync(path.join(ROOT, 'server')).flatMap((entry) => {
        const full = path.join(ROOT, 'server', entry);
        if (fs.statSync(full).isDirectory()) {
          return fs
            .readdirSync(full)
            .filter((f) => f.endsWith('.ts'))
            .map((f) => path.join(full, f));
        }
        return entry.endsWith('.ts') ? [full] : [];
      }),
    ];

    const forbiddenBareWildcardRoute = /\bapp\.(?:get|post|put|delete|patch|all|use)\s*\(\s*(?:\[[^\]]*)?['"`](?:\*|\/[^'"`]*\/\*)['"`]/;
    for (const file of serverFiles) {
      const content = fs.readFileSync(file, 'utf8');
      expect(
        forbiddenBareWildcardRoute.test(content),
        `${path.relative(ROOT, file)} contains an Express 4 bare '*' wildcard route incompatible with Express 5`
      ).toBe(false);
    }
  });
});
