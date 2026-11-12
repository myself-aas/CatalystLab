# Coding Conventions

> Regenerated 2026-11-12 against branch `arena/b1761471-catalystlab` (`1babd3a`).
> Conventions below are **observed** in source plus **enforced** by the configs named.
> Where a documented rule and the tree disagree, the divergence is called out inline.

## Core Sections (Required)

### 1) Formatting and Linting

- **No Prettier.** No `.prettierrc`/`prettier.config.*` exists; formatting is by convention
  (`eslint.config.js` has no stylistic rules, and `npm run lint` exited 0 with 0 problems).
- **ESLint 9 flat config** (`eslint.config.js`): ignores `dist/**`, `coverage/**`,
  `build/**`, `scripts/**`, `public/**`, `node_modules/**`, `*.config.js`, `*.config.ts`.
  Lints `src/**/*.{ts,tsx,js,jsx}`, `server/**/*.{ts,js}`, `server.ts`.
  - Enabled: `typescript-eslint` recommended, `jsx-a11y` recommended plus explicit errors for
    `alt-text`, `aria-props`, `aria-proptypes`, `aria-role`, `aria-unsupported-elements`,
    `role-has-required-aria-props`, `role-supports-aria-props`, `tabindex-no-positive`,
    `no-distracting-elements`, `scope`.
  - Deliberately **off**: `jsx-a11y/label-has-associated-control`,
    `no-noninteractive-tabindex`, `anchor-is-valid`, `click-events-have-key-events`,
    `no-static-element-interactions`, `no-noninteractive-element-interactions`,
    `no-unused-vars` (both base and TS), `no-useless-assignment`, `no-useless-escape`,
    `prefer-const`, `@typescript-eslint/no-explicit-any`.
  - Consequence: `any` is unconstrained in practice (69 `: any`, 80 `as any`, 7
    `@ts-ignore`/`@ts-expect-error` in `src/`+`server/`).
- **TypeScript** (`tsconfig.json`): `strict: true`, `target ES2022`, `jsx: react-jsx`,
  `noEmit`, `isolatedModules`, `noFallthroughCasesInSwitch: true`, but
  `useUnknownInCatchVariables: false`, `noUnusedLocals/Parameters: false`.
- **Semicolons** always; **single quotes** dominate in new code (262 single-quoted vs 2
  double-quoted `import … from` statements in `src/**/*.ts`), though many components use
  double quotes — both appear in `src/App.tsx`.
- **Python** (only `scripts/replace_images.py`): black line-length 100, ruff
  `E4,E7,E9,F,I,UP,B`, mypy `strict`, pytest `testpaths = scripts/tests`.

### 2) File and Symbol Naming

| Kind | Convention | Examples |
|---|---|---|
| React components / pages / contexts | PascalCase file, PascalCase export | `src/components/home/HeroSection.tsx`, `src/pages/UserDashboardPage.tsx`, `src/context/AuthContext.tsx` |
| Component declaration style | `export const X: React.FC<Props> = (…) => …` (170 occurrences) with a minority of `export function X()` (16) | `grep "export const .*: React.FC" src/components` |
| Non-component modules | camelCase file | `src/lib/rateLimiter.ts`, `src/utils/slugUtils.ts`, `src/hooks/useCountUp.ts`, `src/store/middleware/mongoSyncMiddleware.ts` |
| Server modules | camelCase, grouped by role directory | `server/routes/stateSync.ts`, `server/core/dailyQuota.ts`, `server/core/enginesCatalog.ts` |
| CSS token files | kebab-case | `src/styles/card-tokens.css`, `src/styles/react-dev-tokens.css` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_DAILY_RATE_LIMIT_ENTRIES`, `EMPTY_STYLE_HASH`, `CSP_IMG_ALLOWLIST`, `ENGINE_SCRIPT_MAP` |
| Types / interfaces | PascalCase, `I` prefix never used | `RateLimitTier`, `VerifiedIdentity`, `SubscriptionRecord`, `DailyQuotaBackend` |
| Test files | `<subject>.test.ts(x)` under `src/tests/{server,ui,unit}/` | `src/tests/server/paymentWebhookRetry.test.ts` |
| Scripts | kebab-case `.mjs` / camelCase `.ts` | `scripts/check-bundle-budget.mjs`, `scripts/prerender.ts`, `scripts/run-restore-drill.ts` |

### 3) Imports

- Relative imports are the norm; path aliases exist but are nearly unused
  (`@/*` → `src/*`, `@server/*` → `server/*` in `tsconfig.json`, `vite.config.ts`,
  `vitest.config.ts`). 3 `@/` imports inside `src/`; `@server/` appears only in
  `src/tests/**`.
- Server files reach into shared client-safe modules with deep relative paths, e.g.
  `server/core/apiKeys.ts` → `../../src/lib/serverAuth`, `server/routes/engines.ts` →
  `../../src/lib/nodeEngines`. This is accepted, and it defines the allowed dependency
  direction (server → `src/lib`, never the reverse).
- Import ordering is not enforced by a rule, but files follow: node built-ins → external
  packages → internal absolute-ish paths → relative modules → type-only imports
  (`import type { … }`), e.g. `server/app.ts:1-23`, `server/core/rateLimit.ts:1-7`.
- `express` is always the default import with named type imports
  (`import express, { Request, Response } from 'express'`); route modules take
  `app: express.Express` and export a single `register*Routes(app): void`.

### 4) Error Handling

- **Server / routes:** try/catch per handler; responses use a stable envelope
  `{ success: false, error: string }` for failures and `{ success: true, … }` for success
  (101 `success: false` / 61 `res.status(4xx…)` occurrences across `server/routes/`).
  Client-facing messages are generic; details go to `logger.warn/error` — e.g.
  `server/routes/engines.ts:47-52` returns "Target is unreachable, invalid, or blocked by
  the SSRF guard." while logging the error.
- **No `console.*` in `server/`** (0 occurrences); use `server/core/logger.ts` (pino) with
  structured objects first and a string message second: `logger.info({ host, port, env }, "…")`.
  A terminal Express error handler maps Mongo connection failures to `503`
  (`server/app.ts` error middleware) and forwards everything else after
  `captureException(err, { path, method, requestId })`.
- **Catch-variable typing:** `catch (err: unknown)` in newer server code; `catch (e: any)`
  is still common in `server/routes/engines.ts` (compounded by
  `useUnknownInCatchVariables: false`).
- **Client:** `src/lib/logger.ts` facade — console in dev; in production warns/errors are
  redacted, deduplicated and shipped to `POST /api/client-logs` via `sendBeacon`/keepalive.
  `ErrorBoundary` wraps the tree in `src/main.tsx`; auth errors are mapped through
  `formatAuthError` in `src/lib/firebase.ts`.
- **Fail-closed returns over throws** for configuration problems: return `503`/`401` with a
  `code`-bearing body rather than throwing (e.g. `checkCheckoutReadiness`, `reports.ts`
  `501` helper).

### 5) React / UI Conventions

- Provider order in `src/main.tsx`: `ErrorBoundary → ThemeProvider → AuthProvider →
  SubscriptionProvider → RoleSecurityProvider → App`.
- Routing: `BrowserRouter` + `Routes` in `src/App.tsx`; every non-landing page is
  `React.lazy`; the landing `MasterAuditPage`/`HeroSection` stay synchronous for FCP/LCP.
- Page shell (per `AGENTS.md` §1): `<div data-theme="light" className="min-h-screen ds-page-top bg-background text-foreground">` with `<SEOHead>` first.
- Styling language (per `AGENTS.md`, enforced by `scripts/check-raw-color-literals.mjs` and
  `scripts/check-design-tokens.mjs`): `ds-*` component classes (`ds-card`, `ds-btn
  ds-btn-primary`, `ds-input`, `ds-label`), `framer-*` type scale
  (`framer-hero-title`, `framer-section-headline`, `framer-card-title`, `framer-body-text`,
  `framer-micro-tag`), semantic CSS variables from `src/index.css` / `src/styles/*.css`.
  Raw hex literals in `src/**/*.ts(x)` are gated at a baseline of **0**.
- Animation: `motion/react` only — no CSS hover scaling; standard spring is
  `{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }` (`AGENTS.md` §5).
- Accessibility is a gate, not a preference: `jsx-a11y` errors above, plus
  `src/tests/ui/accessibilityAndContrast.test.tsx` and Lighthouse a11y ≥ 0.9.

### 6) State and Data Conventions

- Zustand store composed from slices, each slice a `StateCreator`; `useAppStore` merges
  `MongoSyncState` + 6 feature slices (`src/store/index.ts`).
- Optimistic mutations are queued in `mongoSyncMiddleware` with rollback support; server
  write failures never upgrade displayed entitlements.
- Validation at every boundary uses zod with `.strip()` on object schemas so unknown keys
  cannot reach persistence (`src/lib/validation.ts`), paired with a 256 KB body limit.

### 7) Enforced-in-CI Conventions

| Gate | Command | Enforces |
|---|---|---|
| env parity | `npm run check:env` | identical key sets across the three `.env*.example` templates; production `APP_ORIGIN` fixed |
| no raw colours | `npm run check:colors` | 0 hex literals in `src/**/*.ts(x)` |
| design tokens | `npm run check:design` | distinct semantic colours, legible light theme, display font defined |
| bundle budgets | `npm run check:bundle` | 6 size budgets (ratchet) — `scripts/check-bundle-budget.mjs` |
| secrets | `npm run sec:secrets` | HEAD + full history scan (`scripts/scan-secrets.mjs`, `.gitleaks.toml`) |
| SAST | `semgrep --config .semgrep.yml` | no `eval`/`new Function`, no `dangerouslySetInnerHTML` (0 in tree), no `exec` with interpolation, no `'unsafe-inline'` in `server/`, no raw header projection in the logger |
| types/lint/tests | `npm run typecheck`, `npm run lint`, `npm test` | clean tsc, 0 ESLint problems, 447 tests |

### 8) Evidence

- `eslint.config.js`, `tsconfig.json`, `pyproject.toml`
- `server/app.ts`, `server/routes/engines.ts`, `server/core/logger.ts`, `src/lib/logger.ts`, `src/lib/validation.ts`
- `src/main.tsx`, `src/App.tsx`, `src/store/index.ts`, `src/store/middleware/mongoSyncMiddleware.ts`
- `AGENTS.md` §1-§7, `DESIGN.md`, `src/index.css`, `src/styles/card-tokens.css`
- `scripts/check-raw-color-literals.mjs`, `scripts/check-design-tokens.mjs`, `scripts/check-bundle-budget.mjs`, `.semgrep.yml`
- Counts from this session: `npx eslint .` (exit 0, no output), `grep -c "success: false"`, `grep -rn "console\." server` → 0
