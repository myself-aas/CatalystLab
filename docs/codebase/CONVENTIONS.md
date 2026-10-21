# Coding Conventions

> Regenerated 2026-10-21 by the `acquire-codebase-knowledge` workflow. Conventions below are **observed** from source at commit `d2c26ef` plus the repo's own instruction files. `[TODO]` / `[ASK USER]` per skill contract.

## Core Sections (Required)

### 1) Naming Rules

| Item | Rule | Example | Evidence |
|------|------|---------|----------|
| Page/component files | `PascalCase.tsx` (dominant); kebab-case for design-system-adjacent UI files | `MasterAuditPage.tsx`, `HeroSection.tsx` vs `edge-mesh-globe.tsx`, `dashboard-sidebar.tsx`, `3-d-coverflow-carousel.tsx` | `src/pages/`, `src/components/ui/` listings |
| Lib/store/server modules | `camelCase.ts` | `nodeEngines.ts`, `networkSecurity.ts`, `domainsSlice.ts`, `rateLimit.ts` | `src/lib/`, `src/store/slices/`, `server/core/` |
| Scripts / ops / docs | `kebab-case` (`.mjs`/`.ts`/`.md`); legacy root codemods mix `snake_case.cjs` (`fix_ambient.cjs`, `replace_padding_v2.cjs`) | `check-bundle-budget.mjs` vs `fix_badges.cjs` | `scripts/`, repo root |
| Functions | `camelCase`; route registrars fixed as `register<Domain>Routes(app)`; guards/helpers as verbs (`validatePublicUrl`, `guardedFetch`, `attachIdentity`, `injectNonceIntoHtml`) | `registerEngineRoutes` | `server/app.ts:10-23`, `src/lib/networkSecurity.ts`, `server.ts:16` |
| Types/interfaces | `PascalCase`, exported `interface` for shapes, `type` for unions; ids like `SubscriptionPlanId`, `MasterTelemetryReport`, `GatewayId` | `export interface DiagnosticResult` | `src/lib/nodeEngines.ts:11`, `types/telemetry.ts`, `server/core/subscriptions.ts:19` |
| Constants / env vars | `SCREAMING_SNAKE_CASE` for module constants and env keys; API keys namespaced `cat_live_…`; CSS vars `--ds/--hue/--bg-*` kebab | `MASTER_AUDIT_COST`, `CSP_IMG_ALLOWLIST`, `VALID_API_KEYS`, `--hue-vitalzyme` | `server/routes/engines.ts:7`, `server/app.ts:29`, `.env.example`, `src/styles/card-tokens.css:22-30` |
| CSS utility classes | Canonical `ds-*` primitives (card/btn/input) and `framer-*` type scale; never hand-roll borders/radii/transitions for base components | `.ds-card-interactive`, `.framer-hero-title` | `AGENTS.md` §2–3 |
| Test files | `camelCase.test.ts(x)` named after the behavior/module (`workerProxy.test.ts`, `accessibilityAndContrast.test.tsx`) | — | `src/tests/` listing |

### 2) Formatting and Linting

- **Formatter:** none configured (no Prettier/biome config at root; black/ruff exist only for the Python tooling script — `pyproject.toml` header: "inert to the JS toolchain").
- **Linter:** ESLint 9 flat config (`eslint.config.js`) with `typescript-eslint` recommended + `jsx-a11y` recommended + `eslint-plugin-react` (version `detect`). Ignores `dist/`, `coverage/`, `scripts/`, `public/`, all `*.config.*`.
- **Most relevant enforced rules:** `jsx-a11y/alt-text`, `aria-props`, `aria-role`, `role-has-required-aria-props`, `tabindex-no-positive`, `no-distracting-elements`, `scope` all set to `'error'` (a11y is a product feature — `PRODUCT.md` requires WCAG AA).
- **Deliberately disabled:** `@typescript-eslint/no-explicit-any` **off** (69 `: any` occurrences in non-test `src/`+`server/` this session), `@typescript-eslint/no-unused-vars` off, `prefer-const` off, several a11y interaction rules off (`click-events-have-key-events`, `no-static-element-interactions`, `anchor-is-valid`).
- **TypeScript strictness:** `strict: true`, `noFallthroughCasesInSwitch: true`; relaxed: `useUnknownInCatchVariables: false`, `noUnusedLocals/noUnusedParameters: false`, `skipLibCheck: true`. `tsc --noEmit` is a hard CI gate (Q38). CODE_REVIEW follow-up candidate: ramp `noUncheckedIndexedAccess`.
- **Run commands:** `npm run lint` (0 warnings tolerated per README), `npm run typecheck`, `npm run check:design` (design-token gate, `scripts/check-design-tokens.mjs`).

### 3) Import and Module Conventions

- **Relative imports dominate:** 774 `from '../…'` vs 7 `from '@/…'` in `src/` (grep this session). Cross-tree imports use explicit relative paths (`server/routes/engines.ts` → `'../../src/lib/nodeEngines'`).
- **Aliases:** Vite resolves `@` → `./src`; `tsconfig.json` adds `@server/*` → `./server/*` (used by vitest alias) and `@/*` → `["./src/*"]` (single root since the 2026-10-21 consolidation, Q45 — the `./*` fallback that could resolve root-level twins is gone).
- **Barrels:** `components/ui/index.ts` re-exports a handful of UI primitives; `src/navigation/index.ts`; otherwise direct file imports (no barrel-per-directory policy).
- **Type-only imports** use `import type { … }` consistently (`server.ts:6`, `server/core/subscriptions.ts:5-6`).
- **Side-effect import order in entry:** env first (`dotenv.config({ quiet: true })` at top of `server.ts` and `scripts/prerender.ts`), styles last in `src/main.tsx` (`./index.css` before providers).
- **CSS layering:** `src/index.css` = `@import "tailwindcss"` → design-token sheets (`styles/card-tokens.css`, `styles/react-dev-tokens.css`) → root `../patch.css` (kept by owner decision Q37) → semantic theme tokens.

### 4) Error and Logging Conventions

- **Server routes:** `try/catch` per handler; respond `res.status(4xx/5xx).json({ success: false, error: … })`; zod `safeParse` + `firstIssue(error)` for 400 messages (`server/routes/engines.ts:35-42`); `headersSent` checks before writing; terminal error handler degrades gracefully when MongoDB is offline (`docs/ARCHITECTURE.md` step 3). Helper `getErrorMessage(error: unknown)` pattern (`src/lib/nodeEngines.ts:7-9`); `useUnknownInCatchVariables: false` allows typed catches.
- **Machine-readable error envelopes:** coded errors like `API_ORIGIN_NOT_CONFIGURED`, `PAYMENTS_DISABLED`, `PAYMENTS_SHARED_STATE_REQUIRED`, `GITHUB_WEBHOOK_NOT_CONFIGURED`; 429s carry `Retry-After` + `X-RateLimit-*` (`worker/api-proxy.js`, `docs/security/review-2026-10.md` SEC-2026-02/07/08).
- **Server logging:** pino JSON lines, one line per request, `x-request-id` correlation (inbound IDs honored only when matching a safe pattern); **allowlist** header serializers (`ALLOWED_REQUEST_HEADERS`: 6 entries; `ALLOWED_RESPONSE_HEADERS`: rate-limit/content fields) — never pino `stdSerializers.req/.res` (SEC-2026-04); ad-hoc objects use `[Tag] message` prefixes (`'[Analytics DB] Startup init skipped/deferred'`, `server.ts:44`). `LOG_LEVEL`: `info` in production, `debug` otherwise (README).
- **Client logging:** `src/lib/logger.ts` facade — console passthrough in dev; in production, redacted/deduplicated warn/error batches ship via `sendBeacon`/`fetch keepalive` to `POST /api/client-logs` (validated + rate-limited), and the server forwards them scrubbed to Sentry. No Sentry SDK or DSN in the browser (README "Observability"/"Secrets hygiene").
- **Client error boundaries:** root-level and nested `<ErrorBoundary variant="root">` (`src/main.tsx:31`).

### 5) Testing Conventions

- **Location/naming:** all Vitest tests under `src/tests/**` (never co-located), `*.test.ts(x)`, grouped `server/`, `ui/`, `unit/` + root-level cross-cutting suites; Playwright under `e2e/`; Python tooling tests under `scripts/tests/`.
- **Environment pragmas:** global env is `jsdom`; server/unit suites opt into node per-file via `// @vitest-environment node` (10 files this session, e.g. `src/tests/server/api.test.ts`).
- **Mocking norm:** `vi.mock` + local fakes (e.g. `src/tests/helpers/memorySubscriptionStore.ts`); `src/tests/setup.ts` forces `NODE_ENV=test`, `ALLOW_UNAUTH_DEMO=true`, filters known act()/router warnings, polyfills `matchMedia`; server routes tested in-process with `supertest` against `createApp()` — no live services (coverage comment in `vitest.config.ts`: residual branches are live-Mongo/live-gateway paths).
- **Coverage expectation:** ratchet-only thresholds 68/55/72/69 (statements/branches/functions/lines), scoped `include: ['server/**/*.ts']`; may be raised, never lowered (`vitest.config.ts` comments).
- Details in `TESTING.md`.

### 6) Evidence

- `eslint.config.js`, `tsconfig.json`, `vitest.config.ts`, `pyproject.toml`
- Representative sources: `server/app.ts`, `server/routes/engines.ts`, `server/core/logger.ts`, `server/core/subscriptions.ts`, `src/lib/nodeEngines.ts`, `src/main.tsx`, `src/App.tsx`, `src/store/useAppStore.ts`, `src/index.css`
- Instruction files: `AGENTS.md` (§1–§7 UI canon: `ds-*`/`framer-*` classes, motion springs `[0.16,1,0.3,1]`, lucide icons `size-4/5` + `shrink-0`, badge rule "10% bg / 20% border accent", page wrapper `data-theme="dark" … ds-page-top bg-background`), `.github/copilot-instructions.md`, `CLAUDE.md`, `GEMINI.md`
- Decision-trace comments: `docs/plan/decisions.md` (D/Q numbering used throughout code comments), `docs/security/review-2026-10.md` (SEC-2026-## ids)
- Grep counts this session: relative vs alias imports; `: any` occurrences; `@vitest-environment` pragmas

## Extended: Known Convention Inconsistencies

- Commit-message convention `[TODO]` — history is a single squashed root commit (`refactor: update design system and component UI`), confirmed intentional by the owner (Q49, 2026-10-21); conventional-commits style is plausible but unverifiable. CODE_REVIEW.md references historical hashes (`4568112`, `7de284a`…) that no longer exist in this clone.
- Mixed component-file casing inside the same directory (`BenchmarkCard.tsx` vs `dashboard-sidebar.tsx` in `src/components/ui/`).
- ~~Root-level codemod scripts~~ **Resolved 2026-10-21 (Q47):** the 14 spent codemods now live in `archive/` (with `archive/README.md`); the repo root follows the kebab-case `scripts/` convention again.
