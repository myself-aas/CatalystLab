#!/usr/bin/env node
/**
 * scripts/generate-image-variants.mjs
 * ============================================================================
 * Modern-format variants for the plate images (design-system audit 2026-10-22,
 * rec 7). Emits <name>.webp (q80, method 6) and <name>.avif (q50) next to each
 * source JPEG listed in TARGETS, so PlateImage can serve them via <picture>.
 *
 * Usage: node scripts/generate-image-variants.mjs [--force]
 * Requires ImageMagick (`convert`) with webp + heif/avif delegates.
 * Add a base name to TARGETS when wiring another plate through PlateImage;
 * re-run and commit the two variant files alongside the source.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIR = new URL('../src/assets/images', import.meta.url).pathname;

/** Plates currently wired through <PlateImage> (see src/components/common/PlateImage.tsx). */
const TARGETS = [
  'page-contact.jpg',
  'page-api.jpg',
  'page-pricing.jpg',
  'page-security.jpg',
  'page-products.jpg',
  'about_us_hero_1787216854874.jpg',
];

const force = process.argv.includes('--force');

for (const name of TARGETS) {
  const src = join(DIR, name);
  if (!existsSync(src)) {
    console.error(`missing source: ${name}`);
    process.exit(1);
  }
  for (const [ext, args] of [
    ['webp', ['-quality', '80', '-define', 'webp:method=6']],
    ['avif', ['-quality', '50', '-define', 'heic:speed=6']],
  ]) {
    const out = src.replace(/\.jpg$/i, `.${ext}`);
    if (existsSync(out) && !force) {
      console.log(`skip ${name} -> ${ext} (exists)`);
      continue;
    }
    execFileSync('convert', [src, ...args, '-strip', out]);
    const kb = (n) => `${Math.round(statSync(n).size / 1024)}KB`;
    console.log(`${name}: jpg ${kb(src)} -> ${ext} ${kb(out)}`);
  }
}
