#!/usr/bin/env node
/**
 * Raw color-literal ratchet (design-system audit 2026-10-22, finding T1 / rec R3).
 *
 * Counts raw #RGB / #RRGGBB hex literals in src/**\/*.ts(x) and fails when the
 * count exceeds the frozen baseline — new color decisions must go through the
 * semantic tokens in src/index.css (--app-*, --chart-*, --color-*). The count
 * is allowed (and encouraged) to go down; when it does, tighten BASELINE below.
 *
 * Complements scripts/check-design-tokens.mjs (which guards the token
 * definitions themselves). No dependencies.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

// Frozen 2026-10-22 after the T1 brand-constant migration (cream/ink/fog/...
// tokens in src/index.css @theme + existing accent-* and buy tokens). The
// residue is deliberate: single-use deep-ink panel fills (#0A1317, #0B111A,
// #090D16), the brand node gradient stop (#0066FF), one graphite label style
// (#374151), and 8-digit alpha-suffixed grid-line hexes that cannot use var()
// with an alpha multiplier (they also fall outside this check's \b-anchored
// pattern). src/lib/emailService.ts is exempt: email clients
// do not support CSS custom properties, so its inline CSS must stay literal.
const BASELINE = 0; // fully tokenized 2026-10-22 (cream-promotion + residue pass)

const HEX = /(?<!&)#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b(?!:)/g;
const EXEMPT = /src[\\/]lib[\\/]emailService\.ts$/;

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.tsx?$/.test(entry) && !/\.d\.ts$/.test(entry) && !EXEMPT.test(p)) out.push(p);
  }
  return out;
}

const perFile = new Map();
let total = 0;
for (const file of walk(new URL('../src', import.meta.url).pathname)) {
  const content = readFileSync(file, 'utf8');
  const hits = content.match(HEX);
  if (hits) {
    perFile.set(file, hits.length);
    total += hits.length;
  }
}

if (process.argv.includes('--report')) {
  const rows = [...perFile.entries()].sort((a, b) => b[1] - a[1]);
  for (const [file, n] of rows.slice(0, 25)) console.log(`${String(n).padStart(5)}  ${file}`);
  console.log(`\n${total} raw hex literals across ${perFile.size} files (baseline ${BASELINE})`);
}

if (total > BASELINE) {
  const worst = [...perFile.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
  console.error(
    `✗ raw-color-literal ratchet failed: ${total} hex literals in src/**/*.ts(x) exceeds baseline ${BASELINE}.\n` +
      `  New colors must use semantic tokens from src/index.css (--app-*, --chart-*, --color-*).\n` +
      `  Top offenders:\n${worst.map(([f, n]) => `    ${n}  ${f}`).join('\n')}\n` +
      `  Run with --report for the full breakdown.`,
  );
  process.exit(1);
}

console.log(
  `✓ raw-color-literal ratchet passed: ${total} hex literals in src/**/*.ts(x) (baseline ${BASELINE})` +
    (total < BASELINE ? ` — consider tightening BASELINE to ${total}` : ''),
);
