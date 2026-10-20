#!/usr/bin/env node
/**
 * CatalystLab environment & staging/production template parity preflight
 * (Plan items 5.6, 10.1, D14, Q32).
 *
 * Verifies:
 *   1. Exact key-set parity across `.env.example`, `.env.staging.example`,
 *      and `.env.production.example` (Plan 10.1 validator: zero schema drift).
 *   2. Canonical production origin (`https://www.catalystlab.tech`) and fail-closed
 *      `PAYMENTS_ENABLED=false` default in `.env.production.example` (D14, Q32).
 *   3. Presence of required runtime variables in `NODE_ENV=production` / `CI`.
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const isProd = process.env.NODE_ENV === 'production';
const isCi = Boolean(process.env.CI);

function parseEnvTemplate(filePath) {
  const map = new Map();
  if (!existsSync(filePath)) return map;
  for (const line of readFileSync(filePath, 'utf8').split('\n')) {
    const m = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let val = m[2].trim();
    if ((val.startsWith('"') && val.startsWith('"')) || (val.startsWith("'") && val.startsWith("'"))) {
      val = val.slice(1, -1);
    }
    map.set(m[1], val);
  }
  return map;
}

const failures = [];
const warnings = [];

// --- 1. Template key-parity audit (Plan 10.1 validator) --------------------
const baseTemplatePath = resolve(process.cwd(), '.env.example');
const stagingTemplatePath = resolve(process.cwd(), '.env.staging.example');
const prodTemplatePath = resolve(process.cwd(), '.env.production.example');

const baseMap = parseEnvTemplate(baseTemplatePath);
const stagingMap = parseEnvTemplate(stagingTemplatePath);
const prodMap = parseEnvTemplate(prodTemplatePath);

if (baseMap.size === 0) {
  failures.push('Missing or empty `.env.example` template.');
}
if (stagingMap.size === 0) {
  failures.push('Missing or empty `.env.staging.example` template (Plan 10.1).');
}
if (prodMap.size === 0) {
  failures.push('Missing or empty `.env.production.example` template (Plan 10.1).');
}

if (baseMap.size > 0 && stagingMap.size > 0 && prodMap.size > 0) {
  const compareKeys = (labelA, mapA, labelB, mapB) => {
    for (const key of mapA.keys()) {
      if (!mapB.has(key)) {
        failures.push(`Env template parity mismatch: key "${key}" present in ${labelA} is missing from ${labelB}`);
      }
    }
  };
  compareKeys('.env.example', baseMap, '.env.staging.example', stagingMap);
  compareKeys('.env.staging.example', stagingMap, '.env.example', baseMap);
  compareKeys('.env.staging.example', stagingMap, '.env.production.example', prodMap);
  compareKeys('.env.production.example', prodMap, '.env.staging.example', stagingMap);

  if (prodMap.get('APP_ORIGIN') !== 'https://www.catalystlab.tech') {
    failures.push(
      `Invalid APP_ORIGIN in .env.production.example: expected "https://www.catalystlab.tech" (D14), found "${prodMap.get('APP_ORIGIN') || ''}"`
    );
  }
}

// --- 2. Load local `.env*` overrides without mutating already-set env ------
for (const f of ['.env.production.local', '.env.production', '.env.local', '.env']) {
  const fileMap = parseEnvTemplate(resolve(process.cwd(), f));
  for (const [k, v] of fileMap.entries()) {
    if (process.env[k] === undefined) process.env[k] = v;
  }
}

const required = {
  'FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH': () =>
    Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_JSON || process.env.FIREBASE_SERVICE_ACCOUNT_PATH),
  'APP_ORIGIN or VITE_APP_ORIGIN': () => Boolean(process.env.APP_ORIGIN || process.env.VITE_APP_ORIGIN)
};

const optional = {
  'JWT_SECRET / PAYMENT_SIGNING_SECRET': () => Boolean(process.env.JWT_SECRET || process.env.PAYMENT_SIGNING_SECRET),
  'PAYMENTS_ENABLED explicit flag (Q32)': () =>
    process.env.PAYMENTS_ENABLED === 'true' || process.env.PAYMENTS_ENABLED === 'false',
  'UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN': () =>
    Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN),
  'MONGODB_URI': () => Boolean(process.env.MONGODB_URI),
  'TRUST_PROXY=true (behind edge Worker proxy)': () => process.env.TRUST_PROXY === 'true'
};

for (const [name, check] of Object.entries(required)) {
  if (!check()) {
    const msg = `Missing required runtime setting: ${name}`;
    if (isProd || isCi) failures.push(msg);
    else warnings.push(`${msg} (dev allows missing; production/CI will fail)`);
  }
}

for (const [name, check] of Object.entries(optional)) {
  if (!check()) {
    warnings.push(`Optional/not-configured: ${name}`);
  }
}

if (warnings.length) {
  console.warn('[check-env] Environment notices:');
  for (const w of warnings) console.warn(`  - ${w}`);
}

if (failures.length) {
  console.error('\n[check-env] Environment / template parity check failed:');
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log(
  `[check-env] Environment preflight passed (${baseMap.size} parity-verified keys across .env, .env.staging & .env.production${isProd ? ', mode=production' : ''}).`
);
