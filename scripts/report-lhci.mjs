#!/usr/bin/env node
/**
 * Turns the raw Lighthouse CI output into a Markdown report.
 *
 * `lhci autorun` writes one `lhr-*.json` per run into `.lighthouseci/`. Its own
 * log output is long and, when the job runs in CI, only readable by downloading
 * the run log. This script reads the same files and prints a compact table of
 * the four asserted categories per audited URL, judged against the thresholds in
 * `.lighthouserc.json`, so the numbers can go into the job summary and into a PR
 * comment where anyone can see them without the raw log.
 *
 * Usage:
 *   node scripts/report-lhci.mjs                 # print Markdown, always exit 0
 *   node scripts/report-lhci.mjs --strict        # exit 1 if an "error" assertion failed
 *   node scripts/report-lhci.mjs --dir <path>    # read reports from another directory
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
const strict = args.includes('--strict');
const dirFlag = args.indexOf('--dir');
const reportDir = resolve(dirFlag >= 0 ? args[dirFlag + 1] : '.lighthouseci');
const configPath = resolve('.lighthouserc.json');

const CATEGORY_LABELS = new Map([
  ['performance', 'Perf'],
  ['accessibility', 'A11y'],
  ['best-practices', 'Best practices'],
  ['seo', 'SEO'],
]);

const CATEGORIES = [
  { id: 'performance', label: 'Perf' },
  { id: 'accessibility', label: 'A11y' },
  { id: 'best-practices', label: 'Best practices' },
  { id: 'seo', label: 'SEO' },
];

function readAssertions() {
  try {
    const config = JSON.parse(readFileSync(configPath, 'utf8'));
    const assertions = config?.ci?.assert?.assertions || {};
    const out = new Map();
    for (const [key, value] of Object.entries(assertions)) {
      const match = /^categories:(.+)$/.exec(key);
      if (!match) continue;
      const [level, options] = Array.isArray(value) ? value : [value, {}];
      if (level === 'off') continue;
      out.set(match[1], { level, minScore: options?.minScore ?? 0 });
    }
    return out;
  } catch {
    return new Map();
  }
}

function readReports() {
  if (!existsSync(reportDir)) return [];
  const files = readdirSync(reportDir).filter((name) => /^lhr-.*\.json$/.test(name));
  const reports = [];
  for (const file of files) {
    try {
      const lhr = JSON.parse(readFileSync(resolve(reportDir, file), 'utf8'));
      if (lhr && lhr.categories) reports.push(lhr);
    } catch {
      /* an unreadable partial report is not worth failing the job over */
    }
  }
  return reports;
}

function scoreOf(lhr, categoryId) {
  const score = lhr.categories?.[categoryId]?.score;
  return typeof score === 'number' ? score : null;
}

function pathOf(lhr) {
  const raw = lhr.finalDisplayedUrl || lhr.finalUrl || lhr.requestedUrl || '';
  try {
    const url = new URL(raw);
    return url.pathname === '/' ? '/' : url.pathname.replace(/\/+$/, '');
  } catch {
    return raw || '(unknown)';
  }
}

/**
 * Routes the prerender step marked `noindex, nofollow` (D11). They are
 * application shells, not landing pages, so the SEO category does not apply to
 * them: Lighthouse's `is-crawlable` audit fails on purpose there. Read from
 * dist/routes.json so the exemption follows the router instead of a hard-coded
 * list.
 */
function readNoindexRoutes() {
  const manifestPath = resolve('dist/routes.json');
  if (!existsSync(manifestPath)) {
    // Only happens when dist/ has not been built (local runs): every route is
    // then treated as indexable, so SEO is asserted everywhere.
    console.error('[report-lhci] dist/routes.json not found: noindex SEO exemptions disabled.');
    return new Set();
  }
  try {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    const routes = (manifest?.appRoutes || []).map((route) => (Array.isArray(route) ? route[0] : route));
    return new Set(
      routes.filter((route) => typeof route === 'string').map((route) => (route === '/' ? '/' : route.replace(/\/+$/, '')))
    );
  } catch {
    return new Set();
  }
}

/**
 * Pulls the first couple of concrete details out of a failing audit, so the
 * report says what to fix ("TypeError: ... at main.js") and not only which audit
 * lost points. Kept short on purpose: this ends up in a PR comment.
 */
function describeAudit(audit) {
  const items = audit?.details?.items;
  if (!Array.isArray(items) || items.length === 0) return '';
  const snippets = items
    .slice(0, 2)
    .map((item) => {
      if (!item || typeof item !== 'object') return String(item);
      const location = item.sourceLocation?.url || item.url || item.href || '';
      const raw =
        item.text ?? item.description ?? item.message ?? item.label ?? item.source ?? item.failureMessage ?? '';
      // A console error is only actionable with the URL that produced it.
      if (location && !String(raw).includes(location)) return `${String(raw).replace(/\s+/g, ' ').trim()} [${location}]`;
      const text = String(raw).replace(/\s+/g, ' ').trim();
      return text.length > 220 ? `${text.slice(0, 217)}...` : text;
    })
    .filter(Boolean);
  if (snippets.length === 0) return '';
  return `\n    - ${snippets.join('\n    - ')}`;
}

const assertions = readAssertions();

/**
 * Route-specific baselines (D17, owner decision 2026-10-20).
 *
 * These work exactly like the coverage ratchet in vitest.config.ts: each number
 * is a measured value that may be raised when the route improves and must never
 * be lowered to make a regression pass. A baseline is only ever narrower than the
 * site-wide budget, and the report prints the reason whenever one is applied, so
 * it cannot quietly become a way to hide a failure.
 *
 * The landing page loads Firebase Auth eagerly, so Chrome reports third-party
 * cookies and DevTools inspector issues that no other route has. Measured
 * 2026-10-20: best-practices 0.74 against a site-wide budget of 0.85. The honest
 * fix is lazy-initialising Firebase on the landing page (docs/ops/runbook.md §8),
 * after which this baseline should be deleted, not raised.
 */
const ROUTE_BASELINES = {
  '/': {
    'best-practices': {
      minScore: 0.74,
      reason: 'eager Firebase Auth on the landing page: third-party cookies + inspector issues (D17)',
    },
  },
};

function assertionFor(url, categoryId) {
  const override = ROUTE_BASELINES[url]?.[categoryId];
  if (override) return { level: 'error', minScore: override.minScore, baseline: override.reason };
  return assertions.get(categoryId);
}

// SEO is asserted here rather than by Lighthouse CI because the budget is
// route-aware: `categories:seo` is off in .lighthouserc.json (a `noindex` app
// shell fails Lighthouse's is-crawlable audit on purpose, D11), so this script
// applies the 0.85 budget to every indexable route and skips the shells listed
// in dist/routes.json. A11y, best-practices and performance stay enforced by
// Lighthouse CI itself for all routes.
if (!assertions.has('seo')) assertions.set('seo', { level: 'error', minScore: 0.85 });

// Best-practices is asserted here for the same reason (D17): the site-wide budget
// is 0.85, and the landing page carries a recorded 0.74 baseline in
// ROUTE_BASELINES. Both categories stay `off` in .lighthouserc.json so that
// Lighthouse CI does not fail a route this script has already judged.
if (!assertions.has('best-practices')) assertions.set('best-practices', { level: 'error', minScore: 0.85 });

const noindexRoutes = readNoindexRoutes();
const reports = readReports();

if (reports.length === 0) {
  console.log('## Lighthouse CI\n');
  console.log(`No Lighthouse reports were found in \`${reportDir}\`.`);
  console.log('\nThis usually means Chrome could not start or the static server never came up;');
  console.log('check the `Lighthouse CI` step output for the collection error.');
  process.exit(strict ? 1 : 0);
}

// Worst score per URL across runs: if any run regresses, the report shows it.
const byUrl = new Map();
for (const lhr of reports) {
  const key = pathOf(lhr);
  const entry = byUrl.get(key) || { runs: 0, scores: {}, failingAudits: new Set() };
  entry.runs += 1;
  for (const category of CATEGORIES) {
    const score = scoreOf(lhr, category.id);
    if (score === null) continue;
    entry.scores[category.id] = Math.min(entry.scores[category.id] ?? 1, score);
  }
  for (const [id, group] of Object.entries(lhr.categories || {})) {
    for (const ref of group.auditRefs || []) {
      if (!(ref.weight > 0)) continue; // unweighted audits cannot move the score
      const audit = lhr.audits?.[ref.id];
      if (!audit || audit.score === null || audit.score >= 0.9) continue;
      const label = CATEGORY_LABELS.get(id) || id;
      entry.failingAudits.add(`${label} \u2014 ${audit.title || ref.id} (\`${ref.id}\`)${describeAudit(audit)}`);
    }
  }
  byUrl.set(key, entry);
}

const failures = [];
const warnings = [];
for (const [url, entry] of byUrl) {
  for (const category of CATEGORIES) {
    const assertion = assertionFor(url, category.id);
    const score = entry.scores[category.id];
    if (!assertion || score === undefined) continue;
    // A noindex app shell is exempt from SEO only (D11); everything else applies.
    if (category.id === 'seo' && noindexRoutes.has(url)) continue;
    if (score < assertion.minScore) {
      const line = `\`${url}\` ${category.label} ${(score * 100).toFixed(0)} < ${(assertion.minScore * 100).toFixed(0)}`;
      (assertion.level === 'error' ? failures : warnings).push(line);
    }
  }
}

console.log('## Lighthouse CI');
console.log('');
console.log(
  `${reports.length} report(s) across ${byUrl.size} URL(s), ${Math.max(
    ...[...byUrl.values()].map((entry) => entry.runs)
  )} run(s) per URL at most. The worst score per URL is shown; thresholds come from \`.lighthouserc.json\`.`
);
console.log('');
console.log(`| URL | ${CATEGORIES.map((category) => category.label).join(' | ')} | Result |`);
console.log(`| --- | ${CATEGORIES.map(() => '---').join(' | ')} | --- |`);
for (const [url, entry] of [...byUrl.entries()].sort()) {
  const cells = CATEGORIES.map((category) => {
    const score = entry.scores[category.id];
    if (score === undefined) return 'n/a';
    if (category.id === 'seo' && noindexRoutes.has(url)) return `${(score * 100).toFixed(0)} (noindex)`;
    const assertion = assertionFor(url, category.id);
    const percent = (score * 100).toFixed(0);
    if (!assertion) return percent;
    if (score < assertion.minScore) return assertion.level === 'error' ? `❌ ${percent}` : `⚠️ ${percent}`;
    return assertion.baseline ? `✅ ${percent} (baseline ${(assertion.minScore * 100).toFixed(0)})` : `✅ ${percent}`;
  });
  const urlFailures = failures.filter((line) => line.startsWith(`\`${url}\``));
  const result = urlFailures.length > 0 ? 'fail' : warnings.some((line) => line.startsWith(`\`${url}\``)) ? 'warn' : 'pass';
  console.log(`| \`${url}\` | ${cells.join(' | ')} | ${result} |`);
}

if (failures.length > 0 || warnings.length > 0) {
  console.log('');
  console.log('### Below threshold');
  console.log('');
  for (const line of [...failures, ...warnings]) console.log(`- ${line}`);
}

const appliedBaselines = [];
for (const url of byUrl.keys()) {
  for (const category of CATEGORIES) {
    const override = ROUTE_BASELINES[url]?.[category.id];
    if (override) appliedBaselines.push(`\`${url}\` ${category.label}: floor ${(override.minScore * 100).toFixed(0)} instead of ${((assertions.get(category.id)?.minScore ?? 0) * 100).toFixed(0)} — ${override.reason}`);
  }
}
if (appliedBaselines.length > 0) {
  console.log('');
  console.log('### Route baselines in effect (D17)');
  console.log('');
  for (const line of appliedBaselines.sort()) console.log(`- ${line}`);
}

const withFailures = [...byUrl.entries()].filter(([, entry]) => entry.failingAudits.size > 0);
if (withFailures.length > 0) {
  console.log('');
  console.log('### Weighted audits that lost points');
  console.log('');
  for (const [url, entry] of withFailures.sort()) {
    console.log(`- \`${url}\``);
    for (const audit of [...entry.failingAudits].sort()) console.log(`  - ${audit}`);
  }
}

console.log('');
console.log(
  failures.length > 0
    ? `**${failures.length} assertion failure(s)** — the job is red until they are fixed or the threshold is re-based by an owner decision.`
    : warnings.length > 0
      ? `No hard failures; ${warnings.length} warning(s) above the "warn" threshold.`
      : 'All asserted categories are within their thresholds.'
);

if (strict && failures.length > 0) process.exit(1);
