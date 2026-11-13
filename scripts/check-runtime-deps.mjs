#!/usr/bin/env node
/**
 * Runtime dependency contract gate.
 *
 * `dist/server.cjs` is bundled with `--packages=external`, so every module it
 * requires must be installed in the production image (`npm ci --omit=dev`).
 * This script fails the build when the bundle requires a package that is not a
 * production dependency — the failure mode that made `vite` a *runtime*
 * dependency (server.ts:3 imports it unconditionally for the dev middleware).
 *
 * Usage: node scripts/check-runtime-deps.mjs
 * Exit: 0 = contract holds (or dist/ absent), 1 = a runtime require is undeclared.
 */
import { existsSync, readFileSync } from 'fs';
import { builtinModules } from 'module';
import path from 'path';
import { pathToFileURL } from 'url';

const REQUIRE_RE = /require\(\s*["']([^"']+)["']\s*\)/g;
const NODE_BUILTINS = new Set([...builtinModules, ...builtinModules.map((m) => `node:${m}`)]);
const RELATIVE_PREFIXES = ['./', '../', '/'];

/**
 * Extracts bare module specifiers from require() calls in a bundle.
 * Relative/absolute paths and Node builtins (bare `fs` and `node:fs` alike) are
 * not packages, so they are dropped; scoped packages keep both path segments.
 */
export function collectBareRequires(bundleSource) {
  const names = new Set();
  for (const match of String(bundleSource).matchAll(REQUIRE_RE)) {
    const specifier = match[1];
    if (NODE_BUILTINS.has(specifier) || specifier.startsWith('node:')) continue;
    if (RELATIVE_PREFIXES.some((prefix) => specifier.startsWith(prefix))) continue;
    const segments = specifier.split('/');
    names.add(specifier.startsWith('@') ? segments.slice(0, 2).join('/') : segments[0]);
  }
  return [...names];
}

function main() {
  const root = process.cwd();
  const bundle = path.join(root, 'dist/server.cjs');
  if (!existsSync(bundle)) {
    console.log('✓ runtime dependency contract: dist/server.cjs absent, nothing to check');
    return 0;
  }

  const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
  const runtimeDeps = new Set(Object.keys(pkg.dependencies || {}));
  const required = collectBareRequires(readFileSync(bundle, 'utf8'));
  const missing = required.filter((name) => !runtimeDeps.has(name));

  for (const name of missing) {
    console.error(`✗ ${name} is required by dist/server.cjs but missing from dependencies`);
  }
  if (missing.length > 0) {
    console.error(`\n✗ runtime dependency contract broken (${missing.length} module(s)).`);
    return 1;
  }

  console.log(`✓ runtime dependency contract holds (${required.length} modules)`);
  return 0;
}

// Ruling R2 (extended): only run as a CLI; importing this module from a test
// must not terminate the test worker.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(main());
}
