#!/usr/bin/env node
/**
 * CatalystLab environment preflight.
 *
 * Verifies that required runtime secrets are present before the Express
 * server (or CI) starts. In production, missing required variables are a
 * hard failure; in development/test they degrade to warnings so local
 * onboarding stays frictionless.
 *
 * Run with:  node scripts/check-env.mjs            (dev/test warning mode)
 *            NODE_ENV=production node scripts/check-env.mjs   (hard fail)
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const isProd = process.env.NODE_ENV === 'production';
const isCi = Boolean(process.env.CI);

const required = {
  // Secure server that verifies Firebase ID tokens.
  'FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH': () =>
    !!(process.env.FIREBASE_SERVICE_ACCOUNT_JSON || process.env.FIREBASE_SERVICE_ACCOUNT_PATH),
  // Helmets/HSTS/transport security expects to know what host the app is on.
  'APP_ORIGIN or VITE_APP_ORIGIN': () => !!((process.env.APP_ORIGIN || process.env.VITE_APP_ORIGIN)),
};

const optional = {
  'JWT_SECRET / PAYMENT_SIGNING_SECRET': () =>
    !!(process.env.JWT_SECRET || process.env.PAYMENT_SIGNING_SECRET),
  'VALID_API_KEYS': () => !!process.env.VALID_API_KEYS,
  'UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN': () =>
    !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN),
  'V2CHECKOUT_MERCHANT_CODE or DODOPAY_API_KEY': () =>
    !!(process.env.V2CHECKOUT_MERCHANT_CODE || process.env.DODOPAY_API_KEY),
  'MONGODB_URI': () => !!process.env.MONGODB_URI,
  'TRUST_PROXY=true (behind a proxy)': () => process.env.TRUST_PROXY === 'true',
};

function readEnvFile(path, into) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const key = m[1];
    let val = m[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (into[key] === undefined) into[key] = val;
  }
}

// Support .env / .env.local / .env.production (existing values win).
const envFromFile = {};
for (const f of ['.env.production.local', '.env.production', '.env.local', '.env']) {
  try {
    readEnvFile(resolve(process.cwd(), f), envFromFile);
  } catch {
    /* ignore unreadable env files */
  }
}
for (const [k, v] of Object.entries(envFromFile)) {
  if (process.env[k] === undefined) process.env[k] = v;
}

const failures = [];
const warnings = [];

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
  console.warn('[check-env] ⚠️  Environment notices:');
  for (const w of warnings) console.warn(`  - ${w}`);
}

if (failures.length) {
  console.error('\n[check-env] ❌ Production environment is not fully configured:');
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log(`[check-env] ✅ Environment preflight passed${isProd ? ' (production)' : ''}.`);
