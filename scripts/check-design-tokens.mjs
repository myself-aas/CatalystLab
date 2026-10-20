#!/usr/bin/env node
/**
 * Design-token guardrails (see docs/design-system-audit.md).
 * Fails if semantic status colours collapse to one value, if the light-theme
 * primary/muted tokens regress to near-white-on-white, or if patch.css
 * re-introduces unscoped global element colour rules. No dependencies.
 */
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');
const patch = readFileSync(new URL('../patch.css', import.meta.url), 'utf8');
const errors = [];
const pick = (name) => [...css.matchAll(new RegExp(`${name}:\\s*([^;]+);`, 'g'))].map((m) => m[1].trim());

for (const name of ['--color-success', '--color-warning', '--color-danger', '--color-link']) {
  const values = new Set(pick(name));
  if (values.size < 2) errors.push(`${name} must differ between light and dark themes (got: ${[...values]})`);
}
const distinct = new Set(['--color-success', '--color-warning', '--color-danger'].flatMap(pick));
if (distinct.size < 4) errors.push(`success/warning/danger must be mutually distinct in both themes (got ${distinct.size} distinct values)`);
if (!/--app-primary:\s*#000000/i.test(css)) errors.push('Meta system: light --app-primary must be ink-button #000000 (marketing primary is black)');
if (!/--color-buy:\s*#0064E0/i.test(css)) errors.push('Meta system: --color-buy must be cobalt #0064E0 (purchase CTAs only)');
if (!/--color-buy-hover:\s*#0457CB/i.test(css)) errors.push('Meta system: --color-buy-hover must be primary-deep #0457CB');
if (/--app-background:\s*#1F2223/i.test(css)) errors.push('charcoal canvas #1F2223 must not return — canvas is #FFFFFF (light) / #0A1317 ink-deep (dark)');
if (/--app-muted-foreground:\s*rgba\(240,250,255/i.test(css)) errors.push('light --app-muted-foreground regressed to a white-based value');
if (!/--font-display:/.test(css)) errors.push('--font-display token missing (font-display utilities silently fall back)');
if (/^p,\s*\.text-muted-foreground\s*\{/m.test(patch) || /^h1,\s*h2,\s*h3,\s*h4\s*\{[^}]*color/m.test(patch))
  errors.push('patch.css re-introduced unscoped global h*/p colour rules — scope them under html.dark');

if (errors.length) { console.error('✗ design-token check failed:\n' + errors.map((e) => `  - ${e}`).join('\n')); process.exit(1); }
console.log('✓ design-token check passed (semantic colours distinct, light theme legible, display font defined)');
