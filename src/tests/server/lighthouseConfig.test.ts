import { readFileSync } from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';

// Ruling R3: repo-relative paths resolve from the vitest cwd (repo root).
const root = process.cwd();
const lhci = JSON.parse(readFileSync(path.join(root, '.lighthouserc.json'), 'utf8'));

describe('Lighthouse CI can detect the production server starting', () => {
  it('uses a ready pattern that matches the line server.ts actually logs', () => {
    const serverSrc = readFileSync(path.join(root, 'server.ts'), 'utf8');
    const logged = /\[CatalystLab\]\s*Server (listening|running)[^`'"\n]*/.exec(serverSrc);
    expect(logged, 'server.ts must log a startup line').not.toBeNull();
    const pattern = new RegExp(lhci.ci.collect.startServerReadyPattern);
    expect(pattern.test(`[CatalystLab] ${logged![0].replace('[CatalystLab] ', '')}`)).toBe(true);
  });

  it('boots the real production host rather than a bare static directory', () => {
    expect(lhci.ci.collect.startServerCommand).toBe('node dist/server.cjs');
  });
});
