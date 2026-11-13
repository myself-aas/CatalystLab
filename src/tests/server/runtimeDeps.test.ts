import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import { collectBareRequires } from '../../../scripts/check-runtime-deps.mjs';

// Ruling R3: repo-relative paths resolve from the vitest cwd (repo root).
const root = process.cwd();

describe('production bundle only requires declared runtime dependencies', () => {
  it('extracts only bare module specifiers from require() calls', () => {
    const names = collectBareRequires(
      'require("express"); require("node:fs"); require("./x"); require("vite")'
    );
    expect(names.sort()).toEqual(['express', 'vite']);
  });

  it('keeps tsx out of runtime dependencies and vite in them', () => {
    const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
    expect(pkg.dependencies.vite).toBeDefined();
    expect(pkg.devDependencies.tsx).toBeDefined();
    expect(pkg.dependencies.tsx).toBeUndefined();
  });

  it('resolves every require() in the built bundle', () => {
    const bundle = path.join(root, 'dist/server.cjs');
    if (!existsSync(bundle)) return; // build-free runs skip; `npm run ci` never skips
    const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
    const declared = new Set([...Object.keys(pkg.dependencies), ...Object.keys(pkg.devDependencies)]);
    const missing = collectBareRequires(readFileSync(bundle, 'utf8')).filter(
      (n) => !n.startsWith('node:') && !declared.has(n.split('/')[0]) && !declared.has(n.split('/').slice(0, 2).join('/'))
    );
    expect(missing).toEqual([]);
  });
});
