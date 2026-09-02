#!/usr/bin/env node
// Phase 3 (item 18): bundle budget gate. Parses dist/ after `vite build`,
// measures raw + gzip sizes, and fails when any budget is exceeded.
//
// Budgets are a regression RATCHET set ~5-10% above current reality (see
// CODE_REVIEW.md item 18). Tighten them after each chunk-splitting win;
// never loosen them to make a failing build pass — split the chunk instead.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const dist = path.join(process.cwd(), 'dist');
const assetsDir = path.join(dist, 'assets');

if (!fs.existsSync(assetsDir)) {
  console.error('✗ dist/assets not found — run `npm run build` first.');
  process.exit(1);
}

/**
 * Budgets in kilobytes. `initial` = scripts referenced by dist/index.html
 * (loaded before first paint); everything else is a lazy route chunk.
 */
const BUDGETS = {
  initialRawKb: 2100,
  initialGzipKb: 540,
  totalRawKb: 3400,
  totalGzipKb: 900,
  largestChunkRawKb: 1050,
  largestChunkGzipKb: 280
};

function sizeOf(file) {
  const raw = fs.readFileSync(file);
  return { raw: raw.length, gzip: zlib.gzipSync(raw, { level: 9 }).length };
}

const jsFiles = fs.readdirSync(assetsDir).filter((f) => f.endsWith('.js'));
const sizes = new Map(jsFiles.map((f) => [f, sizeOf(path.join(assetsDir, f))]));

// Initial chunks come from the built index.html: the module entry script plus
// every statically-imported vendor chunk surfaced as a modulepreload link.
const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const initialFiles = new Set();
for (const match of html.matchAll(/<script[^>]+src="\/assets\/([^"]+\.js)"/g)) {
  if (sizes.has(match[1])) initialFiles.add(match[1]);
}
for (const match of html.matchAll(/<link[^>]+rel="modulepreload"[^>]+href="\/assets\/([^"]+\.js)"/g)) {
  if (sizes.has(match[1])) initialFiles.add(match[1]);
}

const kb = (bytes) => bytes / 1024;
const sum = (files, key) => files.reduce((acc, f) => acc + sizes.get(f)[key], 0);

const initialFilesArr = [...initialFiles];
const allFilesArr = jsFiles;
const largest = allFilesArr.reduce((max, f) => (sizes.get(f).raw > sizes.get(max).raw ? f : max), allFilesArr[0]);

const measured = {
  initialRawKb: kb(sum(initialFilesArr, 'raw')),
  initialGzipKb: kb(sum(initialFilesArr, 'gzip')),
  totalRawKb: kb(sum(allFilesArr, 'raw')),
  totalGzipKb: kb(sum(allFilesArr, 'gzip')),
  largestChunkRawKb: kb(sizes.get(largest).raw),
  largestChunkGzipKb: kb(sizes.get(largest).gzip)
};

const fmt = (v) => `${v.toFixed(0)} kB`;
let failed = false;

console.log('\nBundle budget report');
console.log('─────────────────────────────────────────────────────────────');
for (const [key, budget] of Object.entries(BUDGETS)) {
  const value = measured[key];
  const ok = value <= budget;
  if (!ok) failed = true;
  const overBy = value - budget;
  console.log(
    `${ok ? '✓' : '✗'} ${key.padEnd(22)} ${fmt(value).padStart(9)} / ${fmt(budget).padEnd(9)} ` +
      (ok ? `(${fmt(budget - value)} headroom)` : `OVER by ${fmt(overBy)}`)
  );
}
console.log('─────────────────────────────────────────────────────────────');
console.log(`initial chunks: ${initialFilesArr.length}, total JS chunks: ${allFilesArr.length}, largest: ${largest}\n`);

if (failed) {
  console.error('✗ Bundle budget exceeded. Split the chunk or tighten code — do not raise the budget to pass.');
  process.exit(1);
}
console.log('✓ All bundle budgets satisfied.');
