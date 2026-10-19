# Coding Conventions

> Generated 2026-10-14, re-validated 2026-10-19. Conventions are inferred from counted patterns in the source, not from a written style guide. Counts were taken with `grep`/`find` in this session. `[TODO]` = not determinable from the repo.

## Core Sections (Required)

### 1) Naming Rules

| Item | Rule | Example | Evidence |
|------|------|---------|----------|
| React component files | `PascalCase.tsx`. 184 of 194 files under `src/components/` match this. Ten are lowercase or kebab-case (e.g. `edge-mesh-globe.tsx`, `cobe-globe-cdn.tsx`). | `src/components/common/PaymentCheckoutModal.tsx`, `src/components/ui/edge-mesh-globe.tsx` | `find src/components -name '*.tsx'` |
| Page files | `<Feature>Page.tsx`; 30 of 32 top-level pages use `export default` | `src/pages/MasterAuditPage.tsx` | `src/pages/` |
| Server modules | `camelCase.ts` | `server/core/rateLimit.ts`, `server/routes/stateSync.ts` | `server/` |
| Shared library modules | Mixed. Most are `camelCase.ts`; some are `kebab-case.ts`. | `src/lib/networkSecurity.ts` (camel), `src/lib/rate-limit.ts` and `lib/engines/edge-latency.ts` (kebab) | `src/lib/`, `lib/engines/` |
| Engine modules | `kebab-case.ts`, one per engine | `lib/engines/repo-hygiene.ts`, `lib/engines/ai-readiness.ts` | `lib/engines/` |
| Test files | `*.test.ts` or `*.test.tsx` under `src/tests/` (`ui/`, `server/`, `unit/`, root) | `src/tests/server/rateLimit.test.ts` | `vitest.config.ts` (`include`) |
| Functions and variables | `camelCase`. Factories use `create…`/`register…`/`createEngineRateLimitMiddleware`. | `registerTelemetryRoutes`, `guardedFetch` | `server/app.ts`, `src/lib/networkSecurity.ts` |
| Types and interfaces | `PascalCase` | `RateLimitRecord`, `VerifiedIdentity`, `EngineResult` | `server/core/rateLimit.ts`, `src/lib/serverAuth.ts` |
| Constants | `UPPER_SNAKE_CASE` for numeric limits and config | `VISITOR_DAILY_UNITS = 20`, `BURST_WINDOW_MS`, `HTTP_TIMEOUT_MS` | `server/core/rateLimit.ts`, `src/lib/nodeEngines.ts` |
| Env vars | `UPPER_SNAKE_CASE`, service prefix where relevant | `MAILGUN_API_KEY`, `V2CHECKOUT_MERCHANT_CODE`, `DODOPAY_WEBHOOK_SECRET` | `.env.example` |
| Engine ids | `snake_case` ids, plus a legacy alias that resolves to the same implementation | `ai_ready` / `operations_ai_ready`, `repo` / `code_quality` | `server/core/enginesCatalog.ts`, `src/lib/nodeEngines.ts` |
| Dynamic Tailwind class strings | Use the `ds-*` and `framer-*` class families. Do not hand-roll base component styles. | `.ds-card`, `.framer-hero-title` | `AGENTS.md` §2-§3 |

### 2) Formatting and Linting

- **Formatter:** none configured. No `.prettierrc`, `.editorconfig`, or `biome.json` in the repo (checked with `ls -a`). Formatting is by convention only.
- **Linter:** ESLint 9 flat config, `eslint.config.js`.
  - Scope: `src/**/*.{ts,tsx,js,jsx}`. `scripts/`, `api/`, `public/`, `*.config.*`, `dist/`, and `coverage/` are ignored.
  - Enabled: `jsx-a11y` recommended rules plus `alt-text`, `aria-*`, `role-*`, `tabindex-no-positive`, and `no-distracting-elements`. `react` plugin, version detect.
  - Disabled: `no-unused-vars` (both base and `@typescript-eslint`), `no-explicit-any`, `prefer-const`, `anchor-is-valid`, `label-has-associated-control`.
- **Most relevant enforced rules:** jsx-a11y `alt-text` and `aria-*`; `tabindex-no-positive`.
- **Run commands:**
  - `npm run lint` (verified: exit 0)
  - `npm run typecheck` (verified: exit 2, 127 errors, all in `src/tests/`)
- **TypeScript strictness** (`tsconfig.json`): `strict: true`. Overrides: `useUnknownInCatchVariables: false`, `noUnusedLocals: false`, `noUnusedParameters: false`, `allowImportingTsExtensions: false`. `noUncheckedIndexedAccess` is not set.
- **Actual `any` usage:** `as any` appears 6 times in `server/` and 78 times in non-test `src/` (grep). `@ts-ignore` or `@ts-expect-error` appears 6 times in non-test `src/`, `server/`, and `lib/`.

### 3) Import and Module Conventions

- **Import grouping/order:** no enforced rule (no `import/order` plugin). Typical order: third-party packages, then `../` relative imports, then `./`. `[TODO]` not measured.
- **Alias vs relative policy:**
  - `@/…` → `src/…` (Vite alias and `tsconfig` paths). Used in client code.
  - `@server/…` → `server/…` is declared in `tsconfig.json` and `vitest.config.ts`, not in `vite.config.ts`. Relative imports dominate: e.g. `server/routes/engines.ts` imports `../../src/lib/nodeEngines`.
  - `lib/engines/…` is imported as `../../../lib/engines` from inside `src/lib/engines/index.ts`.
- **Public exports and barrels:** `src/lib/engines/index.ts` and `lib/engines/index.ts` are barrels. `components/ui/index.ts` is a barrel. Thin `export * from` shim files re-export top-level `components/` modules (`src/components/telemetry/*.tsx`).

### 4) Error and Logging Conventions

- **HTTP error envelope (server):** the dominant shape is `{ success: false, error: string }`. Verified usage: 53 `res.status(4xx).json({ success: false, … })` matches under `server/`.
  - Exceptions: `/api/check-url` returns HTTP 200 with `{ reachable: false, error }` for blocked targets (`server/routes/engines.ts`). Rate-limited responses return 429 with `rateLimitExceeded: true`. Payments return 503 with `code: 'PAYMENTS_VERIFICATION_UNAVAILABLE'`. Webhook rejects return `{ status: 'error', error }`.
- **Error strategy by layer:**
  - Route handlers wrap work in `try/catch`, log the detail, and return a generic message to the client (`check-url`: "details stay in server logs").
  - Central fallbacks in `server/app.ts`: JSON 404 for `/api/*`, `/stats/*`, `/telemetry/*`, and 503 for Mongo errors.
  - Helpers such as `validatePublicUrl` and `verifyHmacSha256` return `{ valid, error/reason }` objects rather than throwing.
- **Server logging:** pino (`server/core/logger.ts`). Call shape: `logger.warn({ err, requestId }, 'message')`. 11 server files use `logger.`. Only 1 `console.` call remains in `server/`.
- **Other logging:** `src/lib/analyticsEngine.ts` (`console.warn`) and `src/lib/serverAuth.ts` (`console.error`) still use `console` (18 `console.` calls under `src/lib/`).
- **Client logging:** `src/lib/logger.ts` is a facade. Dev: console passthrough. Prod: redacted, deduplicated warn/error batches sent to `/api/client-logs`. Evidence: `docs/ARCHITECTURE.md`, `src/lib/logger.ts`.
- **Sensitive-data redaction:** credential headers are redacted in request logs (`server/core/logger.ts`, per `docs/ARCHITECTURE.md`). `[TODO]` verify the redaction list.
- **Validation:** zod for every request body (19 `z.` declarations in `src/lib/validation.ts`). Raw body is kept for HMAC routes.

### 5) Testing Conventions

- **Test file naming/location:** `src/tests/**/*.test.{ts,tsx}` (`vitest.config.ts`). Subfolders: `ui/` (9), `server/` (4), `unit/` (1), root (6), plus `setup.ts`.
- **Mocking strategy:** `vi.mock` for the module boundary, used 5 times (`firebase-admin/app`, `firebase-admin/auth`, `firebase-admin/firestore`, `dns`, `tls`). Server routes are driven through `createApp()` with supertest. Global setup (`src/tests/setup.ts`) sets `NODE_ENV=test` and `ALLOW_UNAUTH_DEMO=true`, and polyfills `matchMedia` and `ResizeObserver`.
- **Coverage expectation:** `vitest.config.ts` thresholds on `server/**/*.ts`: statements 70, branches 50, functions 85, lines 70. The thresholds were not evaluated in this session: the coverage run fails because a test suite fails first (see `TESTING.md`).

### 6) Evidence

- `eslint.config.js`
- `tsconfig.json`
- `vitest.config.ts`, `src/tests/setup.ts`
- `server/core/logger.ts`, `server/core/enginesCatalog.ts`, `server/core/rateLimit.ts`
- `server/app.ts` (error fallbacks), `server/routes/engines.ts` (`/api/check-url`, `/api/run-engine`)
- `src/lib/validation.ts`, `src/lib/networkSecurity.ts`, `src/lib/logger.ts`
- `src/pages/MasterAuditPage.tsx`, `src/components/ui/edge-mesh-globe.tsx` (naming examples)
- `AGENTS.md` (UI primitives: `ds-*`, `framer-*`, `lucide-react` icons, `motion/react`)

## Extended Sections (Optional)

### Known convention violations (for cleanup)

- Mixed filename casing in `src/components/`, `src/lib/`, and `lib/engines/` (see §1).
- Error responses use more than one envelope shape (see §4).
- `console.*` calls remain in `src/lib/` and one in `server/` despite pino being the server standard.
- `as any` (78 in `src/`) and `@ts-ignore` (6) are used in non-test code even though `strict: true` is on.
- The UI-level rules in `AGENTS.md` (for example "NO standard CSS hover scaling" and "use Framer Motion for hover scale") are stated as hard rules. `[TODO]` not audited against the code.
