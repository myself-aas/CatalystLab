# Testing Patterns

> Regenerated 2026-10-21 by the `acquire-codebase-knowledge` workflow; **suite executed and green the same day** after the pipeline restore (Q43): `npm ci` (1102 packages) → `npm test` → **330 passed / 36 files** on sandbox Node v22.22.3 (declared runtime Node 24 via `.nvmrc`). 3 UI tests that were red at pristine HEAD `d2c26ef` (broken by the design refactor itself) were re-based on the new hero/navbar contract — see §2/§5.

## Core Sections (Required)

### 1) Test Stack and Commands

- **Primary framework:** Vitest ^5.0.5 (`vitest.config.ts`), globals enabled, jsdom default environment, `fileParallelism: false`, `testTimeout: 10000`, setup file `src/tests/setup.ts`, runs shuffled (`npm test` = `vitest run --sequence.shuffle`).
- **Assertion/mocking tools:** Vitest `expect` + `vi` (mocks/spies); `@testing-library/react` + `@testing-library/jest-dom/vitest` (imported in setup per owner decision Q38); `supertest` ^7.3.1 for in-process HTTP against `createApp()`.
- **E2E:** Playwright ^1.64.1 (chromium only), config `playwright.config.ts`.
- **Other harnesses:** k6 (`ops/loadtest/k6-peak.js` via `scripts/run-loadtest.mjs`), Lighthouse CI (`@lhci/cli`, `.lighthouserc.json`), tsx scripts (`scripts/e2e-payment-sandbox.ts`, `scripts/run-restore-drill.ts`), pytest for the Python tooling (`pyproject.toml`, `scripts/tests/test_replace_images.py` — **wired into CI 2026-10-21**, Q52: the `python-tooling` job in `ci.yml` runs pytest + ruff + mypy-strict + black on Python 3.11; all four verified green locally first: 32 tests passed).
- Commands:

```bash
npm test                     # all 36 Vitest files, shuffled
npm run test:coverage        # same + v8 coverage ratchet (server/** only)
npm run test:e2e             # Playwright smoke vs production server build
npm run test:load            # k6 peak-load + D16 p95 SLO verification
npm run test:payments-sandbox # payment gateway sandbox, 503-outage retry, idempotency (Q32 gate)
npm run drill:restore        # clean-instance Firestore backup/restore drill (Plan 4.6)
npm run ci                   # lint+typecheck+test+build+bundle budget (no coverage)
npm run ci:full              # ci + coverage + drill + payments sandbox + secrets scan
```

### 2) Test Layout

- **Placement:** all Vitest tests under `src/tests/` (never co-located); Playwright under `e2e/`; Python tooling tests under `scripts/tests/`.
- **Naming:** `camelCase.test.ts(x)` after the module or behavior under test.
- **Inventory (36 files, counted this session):**
  - `src/tests/server/` — 18 files: API/security suite keyed to CODE_REVIEW findings (`api.test.ts` describes are literally `C1: payments fail closed`, `C2: identity cannot be spoofed…`, `C3: GitHub webhook HMAC verification`; ~192 `it()` blocks across server tests), plus `rateLimit`, `dailyQuota`, `telemetryRateLimit`, `subscriptions`, `paymentWebhookRetry`, `webhookDispatch`, `workerProxy`, `tlsProbe`, `backupRestore`, `retention`, `domainAccess`, `apiKeys`, `errorTracking`, `logger`, `contact`, `multiInstanceState`, `dependabotWorkflowGuard`.
  - `src/tests/ui/` — 10 files (testing-library + jsdom): routes, legal pages, modals/overlays, accessibility & contrast, cards/parallax, interactive engines & forms, radar chart, partner marquee, trail card, unified navigation.
  - `src/tests/unit/` — 2 files: `parseEngineOutput`, `webhookGuards`.
  - `src/tests/` root — 6 files: `networkSecurity`, `rateLimiter`, `webhookSecurity`, `telemetryParser`, `exportEngine`, `phase1Hardening.test.tsx`.
  - `e2e/smoke/release-smoke.spec.ts` — 4 Playwright tests: renders `/`, `/pricing`, `/blogs`, `/docs/llmo`, `/contact` with **zero CSP violations** (asserts no `'unsafe-inline'` in the CSP header, captures `securitypolicyviolation` events), strict security headers (Plan 3.8/9.2/10.4).
- **Setup:** `src/tests/setup.ts` — imports `@testing-library/jest-dom/vitest`; forces `NODE_ENV=test` and `ALLOW_UNAUTH_DEMO=true` (so route suites can exercise GitHub/notifications without Firebase Admin); suppresses known act()/React-Router-future-flag warnings; polyfills `matchMedia` etc.

### 3) Test Scope Matrix

| Scope | Covered? | Typical target | Notes |
|-------|----------|----------------|-------|
| Unit | Yes | `src/lib` pure logic (SSRF guard, webhook guards, telemetry parser, engine output parsing), `server/core` (quota, retention, apiKeys, logger) | node env via `// @vitest-environment node` pragma (10 files) |
| Integration (in-process HTTP) | Yes | Every Express route module through `createApp()` with supertest; security-critical flows: payment fail-closed, webhook HMAC valid/forged/unknown, identity-spoof resistance, state-sync auth, telemetry schema validation, client-log sink | No live Mongo/Firebase/gateway — memory fakes (`src/tests/helpers/memorySubscriptionStore.ts`); `FIREBASE_SERVICE_ACCOUNT_PATH` points at the CI placeholder fixture |
| E2E (browser) | Yes (smoke-only) | Production `dist/server.cjs` on port 3098; CSP/header contract + route rendering | Playwright `webServer` boots the real built server; `reuseExistingServer` outside CI; trace `retain-on-failure` |
| Load / SLO | Yes | k6 peak-load script; CI asserts D16 p95 SLO | `ops/loadtest/k6-peak.js`, ci.yml "Production server peak load test" |
| Perf budgets (frontend) | Yes | Lighthouse CI vs the running production server (not a static dir, D17): a11y ≥ 0.9, SEO/best-practices ≥ 0.85 hard, perf < 0.5 warn; documented exception: landing best-practices re-based to measured 0.74 (eager Firebase Auth) | `.lighthouserc.json`, ci.yml `lighthouse` job, `docs/plan/decisions.md` D17 |
| Ops drills | Yes | Backup→restore on clean instance; payment sandbox incl. 503-outage retry & idempotency | `scripts/run-restore-drill.ts`, `scripts/e2e-payment-sandbox.ts`, both CI gates |
| Container contract | Yes | Docker build, non-root `node` user assertion, health probe, `scripts/verify-deployment.mjs` contract checks | ci.yml `security-and-container` job |
| Python tooling | Partial | `pytest scripts/tests/test_replace_images.py` configured | `[TODO]` no CI job runs pytest (grep of `.github/workflows/`) |

### 4) Mocking and Isolation Strategy

- **Main mocking approach:** module-level `vi.mock` + hand-written fakes; server suites avoid network entirely by injecting env (demo flags, placeholder service-account path) and using in-memory stores; UI suites mock `matchMedia`, Firebase auth listeners (setup.ts warning filters acknowledge async act updates).
- **Isolation guarantees:** `fileParallelism: false` serializes files (shared env mutation in setup.ts is safe); `--sequence.shuffle` randomizes intra-file order to catch order coupling; `NODE_ENV`/`ALLOW_UNAUTH_DEMO` set once in setup.
- **Common failure mode (documented in-code):** act() warnings from the async Firebase auth listener and React Router future-flag warnings are deliberately filtered rather than fixed (`src/tests/setup.ts:10-33`).
- **CI credential isolation:** `.github/fixtures/ci-service-account.json` is an invalid placeholder by design — `firebase-admin` rejects it, `serverAuth` catches and returns null, identity routes answer 401 (fixture `_note`).

### 5) Coverage and Quality Signals

- **Coverage tool + threshold:** `@vitest/coverage-v8`; scope deliberately limited to `include: ['server/**/*.ts']` ("client UI coverage is out of scope for now" — config comment). Ratchet thresholds: statements 68, branches 55, functions 72, lines 69 — measured baseline of 2026-10-19 rounded down; policy: may be raised, never lowered (comments in `vitest.config.ts`, README).
- **Current reported coverage (measured 2026-10-21, Node 22 sandbox):** global `server/**` — statements **70.02**, branches **58.53**, functions **73.66**, lines **71.40** ⇒ ratchet (68/55/72/69) met, `npm run test:coverage` exit 0. Weakest modules: `spaRoutes.ts` (0%), `stateSync.ts` (31%), `system.ts` (39%), `engines.ts` (49% — live-scan paths).
- **Known gaps/flaky areas:** branch threshold sits low because "residual branches are live-Mongo / live-gateway error paths that require real infrastructure to reach" (`vitest.config.ts` comment); UI coverage untracked; `spaRoutes.ts` has zero direct coverage (exercised only via the production smoke); Playwright/k6/Docker/gitleaks gates not runnable in this sandbox (browser download / external tools) — CI covers them.

### 6) Evidence

- `vitest.config.ts`, `playwright.config.ts`, `src/tests/setup.ts`, `src/tests/helpers/memorySubscriptionStore.ts`
- File counts/greps this session: `find src/tests -name '*.test.*' | wc -l` → 36; `@vitest-environment` pragma count → 10; server-suite `it()` count → 192; `test(` in e2e spec → 4
- `.github/workflows/ci.yml` (jobs: `gates`, `security-and-container`, `e2e-chromium`, `lighthouse` — exact step commands quoted above), `.lighthouserc.json`, `scripts/report-lhci.mjs`
- `package.json` scripts (`test`, `test:e2e`, `test:load`, `test:payments-sandbox`, `drill:restore`, `test:coverage`, `ci`, `ci:full`)
- README ("Testing", "Scripts" — stale counts flagged), `docs/plan/decisions.md` (Q38, D16, D17), `docs/security/review-2026-10.md` (verification references per finding)
