# Coding Conventions

> Regenerated 2026-10-19 by the `acquire-codebase-knowledge` workflow. There is **no written style guide for code**; `AGENTS.md` governs UI/design-system conventions only and is a CODEOWNERS-protected governance file. Everything below is inferred from counted patterns (`grep`/`find` this session). `[TODO]` = not determinable. `[ASK USER]` = needs owner intent.

## Core Sections (Required)

### 1) Naming Rules

| Item | Rule | Example | Evidence |
|------|------|---------|----------|
| React component files | `PascalCase.tsx` — 183 of 193 under `src/components/`. The 10 exceptions are kebab/lower-case | `src/components/common/PaymentCheckoutModal.tsx`; exceptions: `src/components/ui/edge-mesh-globe.tsx`, `3-d-coverflow-carousel.tsx`, `hero-section-6.tsx`, `demo.tsx` | `find src/components -name '*.tsx' -exec basename {} \;` |
| Page files | `<Feature>Page.tsx`; 48 of the 54 files under `src/pages/` carry an `export default` | `src/pages/MasterAuditPage.tsx`, `src/pages/PlaygroundPage.tsx` | `ls src/pages`, `grep -rl "export default" src/pages` |
| Server modules | `camelCase.ts` | `server/core/rateLimit.ts`, `server/routes/stateSync.ts`, `server/routes/clientLogs.ts` | `find server -type f` |
| Shared libs | Mostly `camelCase.ts`; a few `kebab-case.ts` | `src/lib/networkSecurity.ts` vs `src/lib/rate-limit.ts`, `src/lib/sanitizeHref.ts` | `ls src/lib` |
| Engine modules (parallel path) | `kebab-case.ts`, one per engine | `lib/engines/repo-hygiene.ts`, `lib/engines/ai-readiness.ts` | `ls lib/engines` |
| Test files | `<subject>.test.ts`/`.tsx`, camelCase, only under `src/tests/{ui,server,unit}` + `src/tests/` root | `src/tests/server/rateLimit.test.ts` | `vitest.config.ts` `include`, `find src/tests -type f` |
| Functions | `camelCase`; route registrars are `register<Domain>Routes`; factories are `create…`; guards return booleans/objects | `registerTelemetryRoutes`, `createEngineRateLimitMiddleware`, `guardedFetch`, `isPrivateIp` | `server/app.ts`, `server/core/rateLimit.ts`, `src/lib/networkSecurity.ts` |
| Types / interfaces | `PascalCase`, `interface` for shapes, `type` for unions | `VerifiedIdentity`, `RateLimitRecord`, `type RateLimitTier = 'superadmin' \| …` | `src/lib/serverAuth.ts:14`, `server/core/rateLimit.ts:32-39` |
| Constants | `UPPER_SNAKE_CASE` for numeric/config limits | `VISITOR_DAILY_UNITS = 20`, `MASTER_AUDIT_COST = 10`, `HTTP_TIMEOUT_MS`, `DEFAULT_MAX_BYTES`, `RATE_WINDOW_MS` | `server/core/rateLimit.ts:13-21`, `src/lib/networkSecurity.ts:183`, `server/routes/clientLogs.ts:27-28` |
| Env vars | `UPPER_SNAKE_CASE`, service-prefixed | `MAILGUN_API_KEY`, `V2CHECKOUT_MERCHANT_CODE`, `DODOPAY_WEBHOOK_SECRET`, `UPSTASH_REDIS_REST_URL` | `.env.example`, `.env.production.example` |
| Engine ids | `snake_case` canonical id + one legacy alias resolving to the same implementation | `ai_ready` / `operations_ai_ready`, `repo` / `code_quality` | `server/core/enginesCatalog.ts`, `src/lib/nodeEngines.ts:36-58` |
| API routes | `/api/…` for the original surface, `/api/v1/…` for the versioned surface, plus legacy `/stats/*` and `/telemetry/*` aliases | `/api/run-engine` vs `/api/v1/engines/:engine/scan` | route inventory in `STRUCTURE.md` §"Route inventory" |
| CSS / design tokens | `ds-*` component primitives, `framer-*` type scale, CSS variables for theming | `.ds-card`, `.ds-page-top`, `.framer-hero-title` | `AGENTS.md` §1-§3, `src/index.css`, `patch.css`; `ds-page-top` used in 35 files |
| Root codemod scripts | `snake_case.py` (`fix_colors_matrix.py`), `kebab-case.cjs/.mjs` (`replace_padding_v2.cjs`, `fix-bg-white5.mjs`) | — | `ls *.py *.cjs *.mjs` |

### 2) Formatting and Linting

- **Formatter: none configured.** No `.prettierrc*`, `.editorconfig`, or `biome.json` anywhere in the repo. Formatting is convention-only, and the convention is mostly consistent: 321 files use single-quoted imports vs 9 that use double quotes; 2-space indent; semicolons; JSX in `.tsx`.
- **Linter:** ESLint 9 flat config (`eslint.config.js`).
  - **Scope is `src/**/*.{ts,tsx,js,jsx}` only.** Ignored: `dist/`, `coverage/`, `node_modules/`, `*.config.js`, `*.config.ts`, `build/`, `scripts/`, `api/`, `public/`. Everything else (`server/`, `lib/`, `components/`, `types/`, `app/`, root `*.mjs`/`*.cjs`) matches **no** config block, so ESLint skips it: `npx eslint server/app.ts` → *"File ignored because no matching configuration was supplied"*. `npm run lint` therefore reports 0 problems while the whole Express layer is unlinted.
  - Enabled: `jsx-a11y` recommended + `alt-text`, `aria-props`, `aria-proptypes`, `aria-role`, `aria-unsupported-elements`, `role-has-required-aria-props`, `role-supports-aria-props`, `tabindex-no-positive`, `no-distracting-elements`, `scope` all as `error`; `react` plugin with `version: 'detect'`.
  - Explicitly **off**: `jsx-a11y/label-has-associated-control`, `no-noninteractive-tabindex`, `anchor-is-valid`, `click-events-have-key-events`, `no-static-element-interactions`, `no-noninteractive-element-interactions`, `no-unused-vars` (base **and** `@typescript-eslint`), `no-useless-assignment`, `no-useless-escape`, `prefer-const`, `@typescript-eslint/no-explicit-any`.
  - Note: the config declares `typescript-eslint` parser for `src/**` but enables **no** `@typescript-eslint` recommended rule set — the only TS-specific rules present are the two turned off above.
- **Run commands:** `npm run lint` (verified exit 0 this session), `npm run typecheck` (verified exit 2, 127 errors).
- **TypeScript strictness** (`tsconfig.json`): `strict: true`, `noFallthroughCasesInSwitch: true`; relaxed: `useUnknownInCatchVariables: false`, `noUnusedLocals: false`, `noUnusedParameters: false`; `noUncheckedIndexedAccess` not set. Consequence observed in code: `catch (err: any) { res.status(500).json({ error: err.message }) }` — raw error text reaches clients (`server/routes/payments.ts`, `server/routes/notifications.ts`).
- **Escape-hatch usage (counted this session):** `as any` 78× in non-test `src/`, 6× in `server/`; `@ts-ignore`/`@ts-expect-error` 6× across `src`+`server`+`lib` (non-test).
- **Python tooling** (`pyproject.toml`, applies to `scripts/` only): black line-length 100, ruff `select = ["E4","E7","E9","F","I","UP","B"]`, mypy `strict = true`, pytest `testpaths = ["scripts/tests"]`. Not invoked by any npm script or workflow.

### 3) Import and Module Conventions

- **Grouping/order:** not enforced (no `import/order` plugin). Observed norm: Node/3rd-party built-ins first, then project imports ordered parent→sibling (`server/app.ts` is a clean example: `express, helmet, path, fs, crypto` → `../src/lib/serverAuth` → `./core/logger` → the 12 `./routes/*`).
- **Alias policy:** `@/*` → `./src/*` with a `./*` fallback (`tsconfig.json`, `vite.config.ts`); `@server/*` → `./server/*` exists in `tsconfig.json` + `vitest.config.ts` but **not** in `vite.config.ts`. In practice **relative imports dominate** even across boundaries: `server/routes/engines.ts:2` → `'../../src/lib/nodeEngines'`; `src/components/telemetry/*.tsx` → `'../../../components/telemetry/*'`.
- **Server → client-source imports are normal:** `server/**` imports from `../../src/lib/*` (serverAuth, networkSecurity, nodeEngines, analyticsEngine, emailService, webhookService, webhookSecurity, validation). There is no `server/lib` of its own.
- **Barrels and shims:** barrels are `components/ui/index.ts`, `lib/engines/index.ts`, `src/store/index.ts`, `src/types/index.ts`. Shims run in **both** directions between root and `src/`: `src/components/telemetry/{DiagnosticConsoleCard,GuestQuotaBanner,LiveTerminalStream,MasterTelemetryGrid}.tsx` and `src/components/ui/dashboard-sidebar.tsx` re-export root `components/`; root `components/ui/{BenchmarkCard,CodeBlock,TelemetryCard,TerminalInput,cobe-globe-cdn,edge-mesh-globe,demo}.tsx` and `components/telemetry/AuditScoreMatrixRadar.tsx` re-export `src/components/`. Add `src/lib/rate-limit.ts`, `src/lib/engines/index.ts`, `src/types/telemetry.ts`, `lib/utils.ts`. Three shims have **no importer** (`src/lib/engines/index.ts`, `src/lib/rate-limit.ts`, and root `components/telemetry/SideBySideDeltaMatrix.tsx` is not a shim at all but an orphaned 329-line divergent copy of the live 339-line `src/` version).
- **Dynamic `import()` for optional/heavy deps:** `firebase-admin/app`, `firebase-admin/auth`, `firebase-admin/firestore` (`src/lib/serverAuth.ts`), `./networkSecurity` and `crypto` (`src/lib/webhookService.ts:253,290`). Reason in code comments: keep the module loadable when the dependency or credential is absent.
- **Client component style:** `React.FC` in 238 files; named exports for components (`export const X: React.FC = …`, 204 occurrences under `src/components/`), `export default` for pages.

### 4) Error and Logging Conventions

- **HTTP error envelope (server):** dominant shape `{ success: false, error: string }` — 96 occurrences of `success: false` against 112 `res.status(…)` calls under `server/`.
  - Documented exceptions: rate-limited → `429` with `rateLimitExceeded: true` + `X-RateLimit-*` headers; payments verify → `503` with `code: 'PAYMENTS_VERIFICATION_UNAVAILABLE'`; webhook rejects → `{ status: 'error', error: reason }` with `401` (secret present) or `503` (secret missing); Mongo failures → `503 { error: 'Service temporarily unavailable (database offline)' }`; unknown API path → `404 { success: false, error: "API endpoint '…' not found." }`.
  - Inconsistency: `POST /api/check-url` answers **HTTP 200** with `{ reachable: false, error }` for blocked/unreachable targets (`server/routes/engines.ts:35-64`).
- **Error strategy by layer:** handlers `try/catch` → log detail → generic-ish message to the client; boundary helpers **return** result objects instead of throwing (`validatePublicUrl` → `{valid, error, normalizedUrl, ip}`; `verifyHmacSha256` → `{valid, reason}`); `attachIdentity` never throws (`getVerifiedUid` returns `null`); global fallbacks live in `server/app.ts` (JSON 404, Mongo 503). Some handlers echo `err.message` to the client (see §2).
- **Server logging:** pino (`server/core/logger.ts`), call shape `logger.warn({ err, requestId }, 'message')` — 24 `logger.` calls across 11 of the 20 files in `server/`. Level escalates with status (`>=500` error, `>=400` warn, else info). One line per request on `finish` with `requestId`, `durationMs`, serialised `req`/`res`, and the derived identity tier. Asset and Vite-dev-module requests are skipped.
- **Redaction:** `redact.paths` covers `req.headers.authorization`, `req.headers.cookie`, `x-api-key`, `x-user-email`, `x-user-id`, `password`, `*.password`, `token`, `*.token`, `refreshToken`, `*.refreshToken` → censor `'[redacted]'`. `base: { service: 'catalystlab-api' }`, ISO timestamps. Level from `LOG_LEVEL`, else `info` in production / `debug` otherwise.
- **`console.*` leakage:** 0 real `console.` calls inside `server/` (the single grep hit is a comment), but `server.ts:71-72` uses `console.log` for the startup banner, and `src/lib/` still has 18 `console.` calls (notably `analyticsEngine.ts` and `serverAuth.ts`) despite pino being the server standard.
- **Client logging:** `src/lib/logger.ts` facade. Dev → console passthrough (keeps test spies working). Prod → warn/error only, email addresses redacted (`EMAIL_RE` → `[redacted-email]`), message ≤ 2000 chars, stack ≤ 8000, dedup ≤ 3 per key, queue ≤ 30, session cap 50 events, flush every 10 s, shipped to `POST /api/client-logs` via `sendBeacon`/`fetch keepalive`. Global `error` + `unhandledrejection` hooks installed from `src/main.tsx`.
- **Sink-side validation:** `server/routes/clientLogs.ts` — zod schema (level enum, length caps, ≤ 25 events/payload), `express.json({ limit: '64kb' })`, 30 requests / 5 min per identity-or-IP.
- **Input validation:** zod at every boundary; `src/lib/validation.ts` has 19 `z.` declarations and exports schema factories shared by client and server (`engineRunSchemaFactory`).

### 5) Testing Conventions

- **Location/naming:** all Vitest suites live under `src/tests/` (the only `include` glob): `ui/` (10 files), `server/` (4), `unit/` (1), root (6), plus `setup.ts`. Python tests live in `scripts/tests/`.
- **Mocking norm:** `vi.mock` at the module boundary for external SDKs — `firebase-admin/app`, `firebase-admin/auth`, `firebase-admin/firestore`, `dns`, `tls`. Server routes are driven through `createApp()` with `supertest` (no live HTTP server, no live Mongo/Firebase).
- **Global setup (`src/tests/setup.ts`):** sets `NODE_ENV='test'` and `ALLOW_UNAUTH_DEMO='true'` (the only context in which `server/core/authz.ts` allows unauthenticated demo access), imports `@testing-library/jest-dom`, silences `act(...)` and React-Router-future-flag console noise, polyfills `matchMedia`, `ResizeObserver`, `IntersectionObserver`, `scrollTo`, `HTMLMediaElement`, and stubs `canvas.getContext` → `null`.
- **Isolation:** `fileParallelism: false`, `testTimeout: 10000`, jsdom recreated per file (the run reports "jsdom was created 21 times · 8.62s total, 41% of tracked time"). Module-level singletons (rate-limit ledger, API-key maps) persist within a file.
- **Coverage expectation:** v8 provider, `include: ['server/**/*.ts']` only, thresholds statements 70 / branches 50 / functions 85 / lines 70. Client UI coverage is explicitly out of scope (comment in `vitest.config.ts`). Thresholds were **not** evaluated this session because the run aborts on a failing suite.
- **Test-only issues are tracked separately from production debt** — see `CONCERNS.md` §2 and `TESTING.md` §5.

### 6) Evidence

- `eslint.config.js`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `pyproject.toml`, `components.json`
- Terminal output this session: `npm run lint` (exit 0), `npx eslint server/app.ts` (ignored-file warning), `npx tsc --noEmit` (127 × TS2339)
- `server/core/logger.ts` (redact paths, serializers, level escalation), `src/lib/logger.ts`, `server/routes/clientLogs.ts`
- `server/app.ts` (404/503 fallbacks), `server/routes/engines.ts` (`/api/check-url` 200-with-error), `server/routes/payments.ts` (503 code), `src/lib/networkSecurity.ts` + `src/lib/webhookSecurity.ts` (result objects)
- `src/lib/validation.ts`, `src/lib/serverAuth.ts`, `src/lib/webhookService.ts` (dynamic imports)
- `AGENTS.md` §1-§7 (`ds-*`, `framer-*`, palette, motion physics, lucide icons), `.github/CODEOWNERS` (AGENTS.md is owner-gated)
- Counts from this session: `as any` 78/6, `@ts-ignore` 6, `console.` 18 (src/lib) + 2 (`server.ts`), `success: false` 96 vs `res.status` 112, `logger.` 24 across 11 files, single-quote imports 321 vs double 9, `React.FC` 238 files, `ds-page-top` 35 files, `SEOHead` 27 page files

## Extended Sections (Optional)

### Known convention violations to clean up

| Violation | Where | Note |
|---|---|---|
| Whole `server/` tree outside lint scope | `eslint.config.js` `files: ['src/**…']` | `npm run lint` green is not evidence about the API layer |
| Mixed filename casing | `src/components/ui/edge-mesh-globe.tsx` and 9 siblings vs `PascalCase` majority | |
| More than one error-envelope shape | §4 exceptions list | `/api/check-url` returning 200 for a blocked target is the most surprising |
| `console.*` instead of the logger | `server.ts:71-72`, 18 calls under `src/lib/` | `analyticsEngine.ts` and `serverAuth.ts` run server-side |
| `as any` / `@ts-ignore` under `strict: true` | 84 + 6 occurrences | Concentrated in route handlers and store middleware |
| Animation import inconsistency | 4 files in `components/telemetry/` import `framer-motion` (undeclared) while 72 files import `motion/react` | `AGENTS.md` §5 mandates `motion/react` |
| `AGENTS.md` hard UI rules not machine-checked | e.g. "NO standard CSS hover scaling" | `[TODO]` not audited against the code; no lint rule enforces it |
| Duplicated constants across layers | `MASTER_AUDIT_COST`/`SINGLE_ENGINE_COST` in `server/core/rateLimit.ts:20-21` **and** `src/utils/rateLimiter.ts:11-12`; tier budgets in three files | Drift already present (`lib/rate-limit.ts` disagrees) |

### Repo-specific governance conventions

- `.github/CODEOWNERS` gates `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.github/copilot-instructions.md`, and itself to `@me-aas`. `CLAUDE.md`/`GEMINI.md`/`copilot-instructions.md` are 3-line pointers to `AGENTS.md` as the single source of truth, and all three declare the governance files read-only without explicit authorisation.
- `AGENTS.md` §8-§12 additionally require every task to be mapped to an SDLC phase (Planning → Improvements) and to cite external "skill source packs", resolving conflicts as *repository conventions > security constraints > platform standards > external style*.
- Owner decisions are recorded in `docs/plan/decisions.md` with a status column; agents are instructed not to fill in owner answers.
