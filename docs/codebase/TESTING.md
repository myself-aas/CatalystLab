# Testing Strategy

> Regenerated 2026-11-12 against branch `arena/b1761471-catalystlab` (`1babd3a`).
> All numbers below are from runs executed in this session.

## Core Sections (Required)

### 1) Test Frameworks and Runners

| Layer | Runner | Config | Command |
|---|---|---|---|
| Unit + UI + server-route | **Vitest 5** (`globals: true`, jsdom default, `@testing-library/react` + `jest-dom`) | `vitest.config.ts` | `npm test` (`vitest run --sequence.shuffle`), `npm run test:coverage` |
| Browser smoke | **Playwright 1.64** (Chromium only, 2 workers, 1 retry in CI) | `playwright.config.ts` (`testDir: './e2e'`, boots `dist/server.cjs` on port 3098) | `npm run test:e2e` |
| Load / SLO | Node script + k6 script | `scripts/run-loadtest.mjs` boots `dist/server.cjs` on 3099; `ops/loadtest/k6-peak.js` | `npm run test:load`, `k6 run …` |
| Payment state machine e2e | `tsx` script over real Express app | `scripts/e2e-payment-sandbox.ts` | `npm run test:payments-sandbox` |
| Backup/restore drill | `tsx` script | `scripts/run-restore-drill.ts` | `npm run drill:restore` |
| Secrets | `node` script | `scripts/scan-secrets.mjs` (+ `.gitleaks.toml`, gitleaks in CI) | `npm run sec:secrets` |
| Python | pytest (+ pytest-cov), ruff, mypy strict, black | `pyproject.toml` (`testpaths = scripts/tests`) | CI `python-tooling` job |

Assertions are Vitest `expect` (with jest-dom matchers registered through
`@testing-library/jest-dom/vitest`) and Playwright `expect` (`expect(response?.status()).toBe(200)`).

### 2) Test File Organization

All Vitest tests live under `src/tests/` — never beside source — in four buckets:

| Directory | Files | Purpose |
|---|---|---|
| `src/tests/server/` | 19 | Express route/integration suites (jsdom **overridden per-file** with `// @vitest-environment node` where needed) |
| `src/tests/ui/` | 12 | React page/component rendering with providers wrapped in `MemoryRouter` |
| `src/tests/unit/` | 7 | Pure logic (engine output parsing, SEO/sitemap tables, webhook guards) |
| `src/tests/` (root) | 6 | Cross-cutting: rate limiter, network security, webhook security, telemetry parser, export engine, Phase-1 hardening |
| `src/tests/helpers/` | 1 | `MemorySubscriptionStore` (in-memory transactional store contract) |

Suite inventory (44 files, **420 tests, all passing** this session): `api.test.ts` (844 lines,
the largest test), `apiKeys`, `backupRestore`, `compression`, `contact`, `dailyQuota`,
`dependabotWorkflowGuard`, `domainAccess`, `errorTracking`, `logger`, `multiInstanceState`,
`paymentWebhookRetry`, `rateLimit`, `retention`, `subscriptions`, `telemetryRateLimit`,
`tlsProbe`, `webhookDispatch`, `workerProxy` (server); `accessibilityAndContrast`,
`auditScoreMatrixRadar`, `cardsAndParallax`, `engineReportHonesty`,
`interactiveEnginesAndForms`, `legalPages`, `modalsAndOverlays`, `partnerMarquee`,
`PlateImage`, `routes`, `trailCard`, `unifiedNavigationMenu` (ui); `nodeEngines`,
`parseEngineOutput`, `programmaticSeo`, `seoAeo`, `seoRoutes`, `sitemapSections`,
`webhookGuards` (unit).

Out-of-Vitest suites: `e2e/smoke/release-smoke.spec.ts` (Playwright, asserts zero CSP
violations and strict headers on `/`, `/pricing`, `/blogs`, `/docs/llmo`, `/contact`),
`scripts/e2e-payment-sandbox.ts`, `scripts/tests/test_replace_images.py` (pytest),
`src/tests/server/workerProxy.test.ts` (Worker proxy unit-tested inside Vitest).

### 3) Mocking Strategy

- **Prefer injection over module mocks.** Server services expose test seams:
  `setDailyQuotaBackendForTests` (Redis replacement), `setSubscriptionStoreForTests` and
  `MemorySubscriptionStore` (transactional Firestore replacement), `MemoryRouter` +
  provider stack for UI. This lets route suites run the *real* Express app (`createApp()`)
  against in-memory stores — e.g. `src/tests/server/paymentWebhookRetry.test.ts`,
  `scripts/e2e-payment-sandbox.ts`.
- **`vi.mock` is used sparingly** — 8 files only, always for an external boundary:
  `firebase-admin/app|auth|firestore` (`phase1Hardening.test.tsx`),
  `@/lib/analyticsEngine` (`domainAccess.test.ts`), `@sentry/node` (`errorTracking.test.ts`).
- **HTTP-level tests** use `supertest` against `createApp()` (3 files) or a real
  `http.createServer(app).listen(0)` for SSE/webhook signature flows, and
  `createHmac`/`sign()` helpers to forge-or-verify HMAC headers.
- **Environment:** `src/tests/setup.ts` pins `NODE_ENV=test`,
  `ALLOW_UNAUTH_DEMO=true`, polyfills `matchMedia`, `ResizeObserver`,
  `IntersectionObserver`, and silences known `act(...)`/React-Router warnings.
- **No network in tests:** engines are exercised against fixtures/`runNativeEngine` mocks;
  only the load-test and e2e scripts touch a live server.
- **Determinism:** `fileParallelism: false` in `vitest.config.ts` (serial files because
  several suites mutate process env and module-level rate-limit stores).

### 4) Coverage and Gates

- `npm run test:coverage` measures **`server/**/*.ts` only** (client UI coverage explicitly
  out of scope) with v8.
- Ratchet thresholds in `vitest.config.ts`: statements **68**, branches **55**,
  functions **72**, lines **69** — measured 2026-10-19 and only raisable.
- Measured this session: **71.3% stmts / 59.22% branches / 75.3% funcs / 72.53% lines** —
  the ratchet passes.
- Additional gates wired into CI (`ci.yml` `gates` job): `npm audit --audit-level=low`,
  `drill:restore`, `test:payments-sandbox`, `sec:secrets`, `test:load`,
  the production smoke (`verify-deployment.mjs` + legacy `.html` 301 + `/api/v1/reports`
  501 + canonical tag), `media:check`; then `security-and-container` (gitleaks, semgrep,
  promtool, Docker build), `e2e-chromium`, `lighthouse`, `python-tooling`.

### 5) What the Suites Actually Cover (security-weighted)

- Payment fail-closed `503`, HMAC verification (valid / forged / unknown), duplicate-event
  idempotency (`DUPLICATE_EVENT`), out-of-order staleness (`STALE_EVENT`), refund →
  free tier — `paymentWebhookRetry.test.ts` and the sandbox script (verified green).
- Identity spoof resistance, state-sync `401`, API-key lifecycle, log allowlists,
  SSRF blocking (`networkSecurity.test.ts`, `tlsProbe.test.ts`), telemetry batch caps
  (`413`) and XFF spoof protection (`telemetryRateLimit.test.ts`), Worker origin
  validation (`workerProxy.test.ts`), compression content-type matrix
  (`compression.test.ts`), multi-instance shared-state behaviour
  (`multiInstanceState.test.ts`), retention TTLs, backup/restore integrity with a tamper
  check (`backupRestore.test.ts`).
- UI: a11y/contrast, route rendering with real providers, engine-report honesty (no
  synthesised scores), legal page presence.

### 6) Evidence

- `vitest.config.ts` (include glob, coverage include + thresholds, `fileParallelism: false`), `playwright.config.ts`, `pyproject.toml`
- `src/tests/setup.ts`, `src/tests/helpers/memorySubscriptionStore.ts`
- `src/tests/server/api.test.ts`, `src/tests/server/paymentWebhookRetry.test.ts`, `src/tests/server/workerProxy.test.ts`, `src/tests/server/errorTracking.test.ts`, `src/tests/ui/routes.test.tsx`
- `scripts/e2e-payment-sandbox.ts`, `scripts/run-loadtest.mjs`, `scripts/run-restore-drill.ts`, `ops/loadtest/k6-peak.js`, `e2e/smoke/release-smoke.spec.ts`
- `.github/workflows/ci.yml` (gates + 4 extra jobs)
- Session runs: `npx vitest run` → **44 files / 420 tests passed**; `npm run test:coverage` → 71.3 / 59.22 / 75.3 / 72.53; `npm run drill:restore` → green (`withinRto: true`); `npm run test:payments-sandbox` → all 6 contract checks listed

## Extended Sections (Optional)

### Gaps observed

- No test asserts that the **Lighthouse ready pattern** matches the server log line
  (`.lighthouserc.json` expects "Server running", `server.ts` logs "Server listening").
- No test exercises `npm run check:env`'s three-template parity (the gate itself fails and
  nothing in `src/tests` covers it).
- No Vitest coverage for `scripts/*.mjs` (excluded from coverage and from ESLint).
- `worker/api-proxy.d.ts` is hand-maintained; only `workerProxy.test.ts` guards its contract.
- No coverage for `src/lib/media/registry.ts` remote-fallback behaviour (only `PlateImage.test.tsx`).
