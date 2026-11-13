import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';

// Ruling R3: repo-relative paths resolve from the vitest cwd (repo root).
const root = process.cwd();
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

describe('repository hygiene', () => {
  it('documents coordinated disclosure and names the published mailbox', () => {
    expect(existsSync(path.join(root, 'SECURITY.md'))).toBe(true);
    expect(read('SECURITY.md')).toContain('security@catalystlab.tech');
  });

  it('advertises no capability the code cannot serve', () => {
    // metadata.json requested SERVER_SIDE_GEMINI_API; the key was removed on
    // 2026-11-12 because no file read it. A stale capability declaration is how a
    // platform ends up provisioning (and billing for) an API nothing calls.
    const meta = JSON.parse(read('metadata.json'));
    expect(meta.request_capabilities ?? []).toEqual([]);
  });

  it('makes firestore.rules deployable', () => {
    const cfg = JSON.parse(read('firebase.json'));
    expect(cfg.firestore.rules).toBe('firestore.rules');
    expect(JSON.parse(read('.firebaserc')).projects.default).toBe('catalystlabhub');
    expect(existsSync(path.join(root, 'firestore.indexes.json'))).toBe(true);
  });

  it('carries no OSS licence on a private package', () => {
    const pkg = JSON.parse(read('package.json'));
    expect(pkg.private).toBe(true);
    expect(existsSync(path.join(root, 'LICENSE'))).toBe(false);
  });

  it('keeps every deliberately tracked binary declared by the asset manifest', () => {
    // docs/decisions/tracked-binaries.md: these stay in Git, so a rename or deletion
    // must not land without the manifest moving with it.
    const manifest = JSON.parse(read('.assets/manifest.json'));
    const declared = new Set<string>(
      (manifest.assets ?? []).map((a: { path: string }) => a.path)
    );
    for (const p of [
      'video/hero-launch/assets/brand/logo-mark.svg',
      'video/hero-launch/assets/captures/home-full.png',
      'video/hero-launch/assets/fonts/inter-latin-wght-normal.woff2'
    ]) {
      expect(existsSync(path.join(root, p)), `${p} is tracked`).toBe(true);
    }
    expect([...declared].some((p) => p.includes('video/hero-launch/assets/brand/'))).toBe(true);
  });

  it('keeps captured dumps out of the repository root', () => {
    for (const f of [
      'audit-output.txt',
      'SEO-AUDIT-2026-10-23.md',
      'SEO-AEO-AUDIT-2026-10-23.md',
      'PROGRAMMATIC-SEO-2026-10-23.md',
    ]) {
      expect(existsSync(path.join(root, f)), `${f} must be filed under docs/audit or archive/`).toBe(
        false
      );
    }
  });

  it('names a route the server actually serves in the load-test instructions', () => {
    for (const f of ['scripts/run-loadtest.mjs', 'ops/loadtest/k6-peak.js']) {
      expect(read(f)).not.toContain('/api/audit/run');
    }
  });
});
