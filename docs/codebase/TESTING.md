# Testing Patterns

> Regenerated 2026-10-19 by the `acquire-codebase-knowledge` workflow. All numbers come from commands run **in this session** on Node v22.22.3 (the project declares Node >= 24; owner decision D5 says Node 24 everywhere). `[TODO]` = not run / not determinable here.

## Core Sections (Required)

### 1) Test Stack and Commands

- **Primary framework:** Vitest 5 (`vitest ^5.0.0`), jsdom 30 environment, `globals: true`, `testTimeout: 10000`, `fileParallelism: false`.
- **Assertion/mocking tools:** Vitest `expect` + `@testing-library/jest-dom` 7.0.1 matchers (loaded in `src/tests/setup.ts`); `@testing-library/react` 16.3.2 for rendering; `vi.mock` for module boundaries; `supertest` 7.2.2 to drive `createApp()` headlessly.
- **Commands (verified this session unless marked):**

```bash
npm test                        # = vitest run
                                # -> exit 1 | files: 20 passed, 1 FAILED (21) | tests: 206 passed, 5 skipped (211) | 22.75 s
npx vitest run src/tests/server # server route suites only (api 58, rateLimit 15, apiKeys 4, contact 2 = 79 tests)
npm run test:coverage           # vitest run --coverage (v8, server/** only)
                                # [not run: the failing suite aborts the run before thresholds are evaluated]
npm run typecheck               # tsc --noEmit -> exit 2, 127 errors (all TS2339, all under src/tests/)
npm run lint                    # eslint . -> exit 0 (src/** only; server/** is not linted at all)
python3 -m pytest -q scripts/tests
                                # [TODO] not run: pytest is not installed in this sandbox
                                # ("No module named pytest"). 22 `def test_` functions counted statically.
node test-browser.mjs           # manual Playwright smoke: opens http://localhost:3000, prints console/pageerror
npm run ci                      # check:env -> lint -> typecheck -> test -> build -> check:bundle
                                # [not run end-to-end: cannot pass — typecheck exits 2 and one suite fails]
```

### 2) Test Layout

- **Placement:** every Vitest suite lives under `src/tests/` — the only `include` glob is `src/tests/**/*.test.{ts,tsx}` (`vitest.config.ts`). Nothing is co-located with source, and `server/` has no `__tests__` of its own.
- **Files (21 suites, with this session's pass counts):**

| Directory | Files | Tests |
|---|---|---|
| `src/tests/server/` | `api.test.ts` (636 lines, **58**), `rateLimit.test.ts` (**15**), `apiKeys.test.ts` (**4**), `contact.test.ts` (**2**) | 79 |
| `src/tests/ui/` | `legalPages` (21), `routes` (13), `modalsAndOverlays` (8), `accessibilityAndContrast` (5), `interactiveEnginesAndForms` (5), `auditScoreMatrixRadar` (4), `trailCard` (4), `cardsAndParallax` (4), `unifiedNavigationMenu` (3), `partnerMarquee` (3) | 70 |
| `src/tests/` (root) | `phase1Hardening.test.tsx` (20), `webhookSecurity` (18), `networkSecurity` (9), `exportEngine` (5), `telemetryParser` (3), `rateLimiter` (**0 — suite fails at load, 5 tests skipped**) | 55 + 5 skipped |
| `src/tests/unit/` | `parseEngineOutput.test.ts` (2) | 2 |
| **Total** | **21 files** | **206 passed, 5 skipped** |

- **Naming:** `<subject>.test.ts` / `.test.tsx`, camelCase subjects matching the module under test (`networkSecurity.test.ts` ↔ `src/lib/networkSecurity.ts`). 50 `describe(` blocks overall; several UI suites are labelled `"Browserbase UI-Test: …"` even though they run in jsdom, not a browser.
- **Setup:** `src/tests/setup.ts` via `setupFiles` — runs before every file. It sets `NODE_ENV='test'` and `ALLOW_UNAUTH_DEMO='true'` (the only context in which `server/core/authz.ts` permits unauthenticated demo access), imports `@testing-library/jest-dom`, silences `act(...)` and React-Router-future-flag console output, and polyfills `matchMedia`, `ResizeObserver`, `IntersectionObserver`, `scrollTo`, `HTMLMediaElement.play/pause/load`, and `canvas.getContext` (→ `null`).
- **Python suite (separate runner, not wired to npm or CI):** `scripts/tests/test_replace_images.py`, configured by `pyproject.toml` (`testpaths = ["scripts/tests"]`, `pythonpath = ["scripts"]`, `addopts = "-q"`, branch coverage on). Tools come from `scripts/requirements-dev.txt`.
- **Aliases in tests:** `@server/app`, `@server/core/ssl` — resolved by `vitest.config.ts` (`@server` → `./server`). This alias exists **only** in `vitest.config.ts` and `tsconfig.json`, not in `vite.config.ts`.

### 3) Test Scope Matrix

| Scope | Covered? | Typical target | Notes |
|-------|----------|----------------|-------|
| Unit (pure logic) | Yes | `networkSecurity` (SSRF guard, 9), `webhookSecurity` (HMAC valid/forged/unknown, 18), `telemetryParser` (3), `parseEngineOutput` (2), `exportEngine` (5) | `rateLimiter.test.ts` (client quota maths) currently **fails at load** |
| Integration (HTTP, in-process) | Yes — the strongest area | `createApp()` + supertest: payments fail-closed, webhook HMAC, identity-spoof resistance, state-sync auth, SSRF blocking, telemetry schema validation, client-log sink, contact, API keys, rate-limit tiers, SSL probe | 79 tests. No live MongoDB, Firebase, Mailgun, or gateway is contacted — `firebase-admin/*`, `dns`, and `tls` are mocked |
| Hardening regression | Yes | `phase1Hardening.test.tsx` (20) | Named after the Phase 1 security pass |
| UI component | Yes | Modals/overlays, cards + parallax, navigation drawer, partner marquee, trail card, radar chart, accessibility/contrast, legal pages | jsdom; canvas stubbed to `null`, so chart internals are shallow |
| Route-level UI | Yes | `src/tests/ui/routes.test.tsx` (13) | Renders routed pages; does **not** assert per-route `<title>`/canonical/robots (the SEO audit S1–S4 found those broken) |
| E2E (real browser) | **No suite** | — | Playwright + @playwright/test are installed but there is no `playwright.config.*` and no `*.spec.ts`; `test-browser.mjs` is a 12-line manual script that only prints console/page errors |
| Contract / OpenAPI | Partial | `GET /api/v1/openapi.json` exists; `src/data/apiSpecs.ts` (1,396 lines) documents responses | No test asserts the spec matches handler behaviour; `apiSpecs.ts:420` documents the hard-coded `compositeScore: 92` |
| Python tooling | Yes (separate) | `scripts/replace_images.py` | `[TODO]` not executed in this sandbox |
| Performance / Lighthouse | **Not automated** | `.lighthouserc.json` (desktop preset, 3 runs; a11y ≥ 0.90, best-practices ≥ 0.85, SEO ≥ 0.85 as **errors**; performance ≥ 0.50 as warn; upload to temporary public storage) | Referenced by no npm script and no workflow. Ad-hoc measurement tools exist instead: `docs/audit/perf-rendering-2026-10/tools/*.mjs` (11 scripts: `lh.mjs`, `measure.mjs`, `shift.mjs`, `lcpel.mjs`, `diag.mjs`, `ab2/ab3.mjs`, `navscroll.mjs`, `import-graph.mjs`, `devwarn.mjs`, `fixedlist.mjs`) and `docs/audit/seo-aeo-2026-10/tools/` |
| Bundle budget | Yes (build-time gate) | `scripts/check-bundle-budget.mjs` | Passed this session; see `STACK.md` §4 for the numbers |
| Media endpoints | Yes (CI) | `scripts/verify-media.mjs` | The **only** CI job; hits live Unsplash/Pexels endpoints on Node 20 |

### 4) Mocking and Isolation Strategy

- **Main approach: module-boundary `vi.mock`.** Exactly five mocks exist repo-wide: `firebase-admin/app`, `firebase-admin/auth`, `firebase-admin/firestore`, `dns` (via `importOriginal`, so only lookups are steered), and `tls` (same pattern). Network-level isolation for engines therefore comes from faking DNS/TLS rather than from an HTTP interceptor.
- **App isolation:** each server suite builds a fresh app with `const { createApp } = await import('@server/app'); app = await createApp();` and drives it with supertest — no port is bound, so suites cannot collide.
- **Serialisation:** `fileParallelism: false` makes all 21 files run one after another (22.75 s total; the run reports "jsdom was created 21 times · 8.62s total, 41% of tracked time" and suggests `pool: 'vmThreads'` or `isolate: false`).
- **What is *not* reset:** module-level singletons persist for the life of a file — `dailyRateLimitStore` (`server/core/rateLimit.ts:43`), the API-key `Map`s (`server/core/apiKeys.ts`), `serverConnectedRepos`/`githubSseSubscribers` (`server/routes/github.ts:15-16`), and the client-log/contact throttle maps. Tests that assert quotas must therefore account for consumption by earlier cases in the same file. `[TODO]` no reset helper is exported.
- **Environment stubbing:** the setup file mutates `process.env` globally (`NODE_ENV`, `ALLOW_UNAUTH_DEMO`) and monkey-patches `console.error`/`console.warn` to drop known-noisy messages — so a genuinely new `act(...)` warning would also be silenced.
- **Common failure mode in tests:** writing to `globalThis.localStorage` (see §5).

### 5) Coverage and Quality Signals

- **Coverage tool + thresholds** (`vitest.config.ts`): v8 provider, reporters `text`/`html`/`lcov` into `./coverage`, **`include: ['server/**/*.ts']` only** — client UI coverage is explicitly out of scope per the comment in the config. Thresholds: statements 70, branches 50, functions 85, lines 70. The comment explains branches sit at 50 because the residual branches are live-Mongo / live-gateway error paths that need real infrastructure.
- **Current reported coverage:** `[TODO]` — `npm run test:coverage` cannot report while a suite fails at load. Fix `rateLimiter.test.ts` first, then re-run.
- **Failing suite (reproduced this session):** `src/tests/rateLimiter.test.ts` → `TypeError: Cannot set property localStorage of [object Window] which has only a getter` at line 28 inside `beforeAll`: `(globalThis as any).localStorage = createMockLocalStorage();`. The suite aborts before any of its 5 tests run (they are reported as skipped). jsdom 30 exposes `localStorage` as a getter-only property, so plain assignment throws. Fix: `vi.stubGlobal('localStorage', …)` or `Object.defineProperty`. This is **test-code debt, not production debt**. `docs/plan/production-readiness-plan.md` §1 records the same failure, so it is pre-existing and not caused by this session's Node version.
- **Type errors in test code (reproduced this session):** `npx tsc --noEmit` → exit 2, **127 errors, all `TS2339: Property 'toBeInTheDocument' does not exist on type 'Assertion<void, HTMLElement>'`**, in 10 files:

| File | Errors |
|---|---|
| `src/tests/ui/modalsAndOverlays.test.tsx` | 27 |
| `src/tests/ui/cardsAndParallax.test.tsx` | 17 |
| `src/tests/ui/unifiedNavigationMenu.test.tsx` | 16 |
| `src/tests/ui/routes.test.tsx` | 13 |
| `src/tests/ui/trailCard.test.tsx` | 11 |
| `src/tests/ui/partnerMarquee.test.tsx` | 10 |
| `src/tests/ui/interactiveEnginesAndForms.test.tsx` | 10 |
| `src/tests/ui/accessibilityAndContrast.test.tsx` | 10 |
| `src/tests/ui/auditScoreMatrixRadar.test.tsx` | 8 |
| `src/tests/phase1Hardening.test.tsx` | 5 |

  Root cause: `src/tests/setup.ts:1` imports `'@testing-library/jest-dom'`, which augments Jest's `expect`, not Vitest's `Assertion` type. Owner decision **Q38** (2026-10-19) already accepted the fix: import `'@testing-library/jest-dom/vitest'` instead. Verified available in this install: `node_modules/@testing-library/jest-dom/package.json` exports `"./vitest"` with `"types": "./types/vitest.d.ts"` (v7.0.1). `tsconfig.json` `include` covers `src`, which is why test files are type-checked at all.
- **Documentation drift:** `README.md` claims "all four mandatory local gates are green — `tsc --noEmit` (0 errors), `npm test` (177 passed)". Measured this session: 127 type errors and 206 passed / 5 skipped / 1 failing suite. `docs/audit/perf-rendering-2026-10/05-remediation.md` §"Verification gates" independently records the same 127 / 206 / 5 numbers.
- **Known gaps:** no E2E suite despite Playwright being installed; no CI job runs lint, typecheck, tests, or build (`media-verify.yml` only); coverage thresholds are unenforced in practice because the run aborts; no test asserts SEO invariants (soft-404, `noindex` on app routes, per-route canonical) even though the SEO audit lists them as P1; no test covers the hard-coded `compositeScore: 92` or the synthetic `reports.ts`/`blogs` endpoints; the Python suite is not wired to npm or CI.

### 6) Evidence

- `vitest.config.ts` (include, setupFiles, environment, `fileParallelism`, `testTimeout`, coverage include + thresholds)
- `src/tests/setup.ts`, `src/tests/rateLimiter.test.ts:28`, `src/tests/server/api.test.ts:7,27-28`, `src/tests/server/rateLimit.test.ts:201-215` (`@server/core/ssl` alias), `src/tests/ui/modalsAndOverlays.test.tsx`
- `package.json` (`test`, `test:coverage`, `ci`), `tsconfig.json` (`include: ["src"]`), `pyproject.toml`, `scripts/requirements-dev.txt`, `scripts/tests/test_replace_images.py`
- `.lighthouserc.json`, `test-browser.mjs`, `docs/audit/perf-rendering-2026-10/tools/`, `docs/audit/seo-aeo-2026-10/tools/`
- `.github/workflows/media-verify.yml` (Node 20, `npm install`, `npm run media:check` — the only workflow)
- Terminal output this session: `npx vitest run` (twice; per-file counts captured), `npx tsc --noEmit`, `npm run lint`, `node -e` on `@testing-library/jest-dom/package.json`, `python3 -m pytest --version` (module missing)
- Cross-references: `docs/plan/production-readiness-plan.md` §1 baseline, `docs/plan/decisions.md` D5/Q38, `docs/audit/perf-rendering-2026-10/05-remediation.md`, `README.md`, `CODE_REVIEW.md`

## Extended Sections (Optional)

### Reproducing the two failures

```bash
npx vitest run src/tests/rateLimiter.test.ts          # localStorage TypeError (suite aborts, 5 skipped)
npx tsc --noEmit | sed -E 's/\(.*//' | sort | uniq -c # 127 errors across the 10 files above
npx eslint server/app.ts                              # "File ignored because no matching configuration was supplied"
```

### Suite patterns worth reusing

- **Security regression style** (`src/tests/server/api.test.ts`, `webhookSecurity.test.ts`): build the app once in `beforeAll`, then assert status + envelope per case — valid signature → 200, forged → 401, missing secret → 503, spoofed identity header → ignored. This is the pattern to extend for the paid-activation work (owner decision D1) and for the generic-webhook `guardedFetch` fix (Q41).
- **Guard-level unit style** (`networkSecurity.test.ts`): mock `dns` with `importOriginal` so only the resolution is steered, then assert `validatePublicUrl` rejects loopback/private/link-local and accepts public addresses.
- **UI style** (`src/tests/ui/*`): render with `@testing-library/react` inside `MemoryRouter`, query by role/text, assert a11y attributes. These are the files carrying all 127 type errors, so the Q38 one-line fix unblocks the whole group.
