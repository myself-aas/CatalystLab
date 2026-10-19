# Testing Patterns

> Generated 2026-10-14, re-validated 2026-10-19. Results below come from commands run in this session on Node v22.22.3 (the project declares Node >= 24). `[TODO]` = not determinable from the repo or not run.

## Core Sections (Required)

### 1) Test Stack and Commands

- **Primary test framework:** Vitest 5 (`vitest.config.ts`, `package.json` devDependencies `vitest ^5.0.0`), jsdom 30 environment, `globals: true`.
- **Assertion/mocking tools:**
  - Assertions: Vitest `expect`, with `@testing-library/jest-dom` matchers loaded in `src/tests/setup.ts`.
  - Mocking: `vi.mock` (Vitest).
  - HTTP: `supertest` against `createApp()` for server routes.
  - UI: `@testing-library/react` 16.3.2.
- **Commands (all verified in this session unless marked):**

```bash
npm test                      # = vitest run                        -> 185 passed, 5 skipped, 1 suite FAILED (exit 1)
npx vitest run src/tests/server   # server route suite only           [not run separately]
npm run test:coverage         # vitest run --coverage (v8)          -> exit 1 (the failing suite stops the run; no % reported)
npm run typecheck             # tsc --noEmit (tests are included)   -> exit 2, 127 errors, all in src/tests/
python3 -m pytest -q scripts/tests   # Python tests for scripts/replace_images.py -> 32 passed (venv with scripts/requirements-dev.txt)
npm run ci                    # lint -> typecheck -> test -> build -> bundle; stops at typecheck (fails)
```

### 2) Test Layout

- **Placement:** all Vitest suites live under `src/tests/`, which is the only `include` glob (`vitest.config.ts`: `include: ['src/tests/**/*.test.{ts,tsx}']`).
  - `src/tests/ui/` — 9 files (component and route UI tests)
  - `src/tests/server/` — 4 files (`api.test.ts` 636 lines, `apiKeys.test.ts`, `contact.test.ts`, `rateLimit.test.ts`)
  - `src/tests/unit/` — 1 file (`parseEngineOutput.test.ts`)
  - `src/tests/` (root) — 6 files (`exportEngine`, `networkSecurity`, `phase1Hardening.test.tsx`, `rateLimiter`, `telemetryParser`, `webhookSecurity`)
  - `src/tests/setup.ts` — global setup, loaded by `vitest.config.ts` (`setupFiles`).
- **Naming:** `<subject>.test.ts` or `.test.tsx`, camelCase.
- **Python tests:** `scripts/tests/test_replace_images.py` (`pyproject.toml`: `testpaths = ["scripts/tests"]`, `pythonpath = ["scripts"]`). Not run by any npm script or CI job.
- **Setup file behavior** (`src/tests/setup.ts`):
  - Sets `process.env.NODE_ENV = 'test'` and `ALLOW_UNAUTH_DEMO = 'true'`. This is the only context where identity is skipped (`server/core/authz.ts`, `isDemoUnauthAllowed`, which requires `NODE_ENV === 'test'`).
  - Imports `@testing-library/jest-dom`.
  - Filters `act(...)` and React Router future-flag console messages.
  - Polyfills `window.matchMedia` and `ResizeObserver`.

### 3) Test Scope Matrix

| Scope | Covered? | Typical target | Notes |
|-------|----------|----------------|-------|
| Unit | Yes (partial) | `networkSecurity` (SSRF guard), `webhookSecurity` (HMAC), `rateLimiter`, `telemetryParser`, `parseEngineOutput`, `exportEngine`, `apiKeys` | `rateLimiter.test.ts` fails (see §5). Test count per file `[TODO]`. |
| Integration (HTTP) | Yes | Express routes via supertest: payments fail-closed, webhook HMAC (valid/forged/unknown), identity spoofing, state-sync auth, SSRF blocking, telemetry validation, client-log sink, contact | `src/tests/server/api.test.ts` (636 lines). `README.md` lists these as covered. Whether real MongoDB or Firebase is touched: `[TODO]` (the suite mocks `firebase-admin/*`). |
| UI component | Yes | Modals, cards, navigation, route table, accessibility/contrast, Radar chart, partner marquee | `src/tests/ui/*.test.tsx` (9 files, jsdom) |
| Route-level UI | Yes | `src/tests/ui/routes.test.tsx` | Route reachability `[TODO]` details |
| E2E (browser) | **No suite.** | None | Playwright is a devDependency and `test-browser.mjs` (root) launches Chromium against `http://localhost:3000` and logs browser console messages and page errors. It is a manual script, not a test. No `playwright.config.*` exists. |
| Python | Yes (separate runner) | `scripts/replace_images.py` | 32 tests pass in a venv. Not wired into CI. |
| Performance / Lighthouse | No automated run | `.lighthouserc.json` (desktop preset, 3 runs, a11y ≥ 0.9 error threshold) | Not referenced by `package.json` or any workflow. |

### 4) Mocking and Isolation Strategy

- **Main mocking approach:** module-level `vi.mock` for external SDKs (5 occurrences):
  - `firebase-admin/app`, `firebase-admin/auth`, `firebase-admin/firestore`
  - `dns` (for the SSRF guard's DNS resolution)
  - `tls` (for SSL probes)
- **Isolation guarantees:**
  - `fileParallelism: false` in `vitest.config.ts`, so suites run serially.
  - `testTimeout: 10000`.
  - `jsdom` environment is created per file (the Vitest run warns that it was created 20 times, ~12 s total).
  - Server suites build a fresh app via `createApp()` (`src/tests/server/api.test.ts`).
  - Module-level state (rate-limit ledger, API key `Map`s) persists across tests in the same file `[TODO]` confirm reset helpers.
- **Common failure mode in tests:** assigning to `globalThis.localStorage` in jsdom 30 (see §5).

### 5) Coverage and Quality Signals

- **Coverage tool + threshold** (`vitest.config.ts`): v8 provider, `include: ['server/**/*.ts']`. Thresholds: statements 70, branches 50, functions 85, lines 70. Reporters: text, html, lcov.
- **Current reported coverage:** not available. `npm run test:coverage` exits 1 before reporting because one suite fails. `[TODO]` re-run after fixing `rateLimiter.test.ts`.
- **Latest test run (verified in this session, `npx vitest run`, 34.7 s):**
  - Test files: **19 passed, 1 failed (20 total)**
  - Tests: **185 passed, 5 skipped (190 total)**
  - README claims **177 tests**, so the README is stale.
- **Failing suite:** `src/tests/rateLimiter.test.ts` (`Rate Limiter & Quota Allocation Engine`). Same failure on Node 22.22.3 and 24.22.0, so the Node version is not the cause. Error `TypeError: Cannot set property localStorage of [object Window] which has only a getter`, at `beforeAll` line 28 (`(globalThis as any).localStorage = createMockLocalStorage()`). The suite fails at load and no tests inside it run. This looks like an environment issue (jsdom 30 on Node 22 makes `localStorage` a getter-only property), but the cause is not confirmed. `[TODO]` re-run on Node 24.
- **Type errors in test code:** `npm run typecheck` reports 127 errors, all in `src/tests/`:
  - `modalsAndOverlays.test.tsx` 27, `cardsAndParallax.test.tsx` 17, `unifiedNavigationMenu.test.tsx` 16, `routes.test.tsx` 13, `trailCard.test.tsx` 11, `partnerMarquee.test.tsx` 10, `interactiveEnginesAndForms.test.tsx` 10, `accessibilityAndContrast.test.tsx` 10, `auditScoreMatrixRadar.test.tsx` 8, `phase1Hardening.test.tsx` 5.
  - Representative message: `Property 'toBeInTheDocument' does not exist on type 'Assertion<void, HTMLElement>'`. The jest-dom matcher typings are not reaching Vitest's `expect` type. `tsconfig.json` includes `src`, so test files are type-checked.
  - Verified fix (this session): `src/tests/setup.ts` line 1 `import '@testing-library/jest-dom/vitest';` (the package exports a `./vitest` entry). `tsc --noEmit` went from 127 errors to 0. The change was reverted, and the vitest run with it was not repeated.
- **Known gaps:**
  - No E2E suite.
  - CI runs no tests. `.github/workflows/media-verify.yml` runs only `npm run media:check` (live Unsplash/Pexels endpoints).

### 6) Evidence

- `vitest.config.ts` (include, setupFiles, thresholds, `fileParallelism`)
- `src/tests/setup.ts` (environment setup, polyfills)
- `src/tests/server/api.test.ts` (supertest integration), `src/tests/server/rateLimit.test.ts`
- `src/tests/rateLimiter.test.ts` (failing suite, line 28)
- `src/tests/ui/modalsAndOverlays.test.tsx` (largest type-error count)
- `scripts/tests/test_replace_images.py`, `pyproject.toml` (`[tool.pytest.ini_options]`), `scripts/requirements-dev.txt`
- `.lighthouserc.json`, `test-browser.mjs`
- `.github/workflows/media-verify.yml` (only CI job)
- Terminal output from this session: `npx vitest run`, `npm run typecheck`, `python -m pytest -q scripts/tests`

## Extended Sections (Optional)

### Reproducing the failure modes

```bash
npx vitest run src/tests/rateLimiter.test.ts     # reproduces the localStorage TypeError
npx tsc --noEmit | sed -E 's/\(.*//' | sort | uniq -c   # type-error counts per file
```
