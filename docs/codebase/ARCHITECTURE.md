# Architecture

> Generated 2026-10-14, re-validated 2026-10-19. Every row cites a file. `[TODO]` = not determinable from the repo; `[ASK USER]` = intent-dependent.

## Core Sections (Required)

### 1) Architectural Style

- **Primary style:** modular monolith. One Node.js process (`server.ts`) serves an Express 4 JSON API and the Vite-built React SPA on one port. Evidence: `server.ts` (one `httpServer` for Express and Vite HMR), `server/app.ts` (`createApp()`).
- **Secondary style:** layered server (routes → core services → `src/lib` engines/integrations) and a feature-folder client (`src/pages`, `src/components/<feature>/`, zustand store, React contexts).
- **Why this classification:** routes are split into one module per domain under `server/routes/` (12 files, each exports `registerXRoutes(app)`), and `server/app.ts` composes them. The client is organized by pages and feature folders. Evidence: `server/app.ts` lines that call `registerTelemetryRoutes`…`registerContactRoutes`.
- **Primary constraints:**
  1. **Fail-closed / degraded-mode by design.** Missing credentials return 503 or 401, or switch to in-memory or mock modes. Evidence: `src/lib/serverAuth.ts` ("fail closed"), `server/routes/payments.ts` (503 without `V2CHECKOUT_MERCHANT_CODE`), `src/lib/emailService.ts` (`mock: true` path), `src/lib/analyticsEngine.ts` (zero-cost in-memory mode).
  2. **All server state is in-process.** Rate-limit ledger, API key store, connected GitHub repos, and client-log/contact throttles are module-level `Map`s. Evidence: `server/core/rateLimit.ts:43`, `server/core/apiKeys.ts:57-58`, `server/routes/github.ts:16`, `server/routes/clientLogs.ts:30`, `server/routes/contact.ts:44`. Optional Upstash Redis adds a distributed limiter (`server/core/rateLimit.ts`, `getUpstashLimiter`).
  3. **Outbound fetches go through one SSRF guard.** Evidence: `src/lib/networkSecurity.ts` (`validatePublicUrl`, `guardedFetch`).

### 2) System Flow

The four flows below were traced in source. Steps 1-2 are the boot sequence; steps 3-6 are the request paths.

**Boot (`server.ts` → `server/app.ts`):**

1. `server.ts` starts `initAnalyticsDB()` without awaiting it, then calls `createApp()`.
2. `createApp()` applies, in order: helmet CSP (production allowlists hashes of inline scripts from `dist/index.html`), `Permissions-Policy`, request logging with `x-request-id`, per-route JSON body limits (256 kb; 2 mb only for `POST /api/state/sync`, which also captures `rawBody` for HMAC), `attachIdentity` (verifies Firebase ID token, if present).
3. Route modules register; then an `/api/*`, `/stats/*`, `/telemetry/*` JSON 404 catch-all; then a Mongo-offline error handler that returns 503.
4. `server.ts` mounts Vite middleware (dev, `appType: 'spa'`) or `express.static(dist)` plus `GET *` → `index.html` (prod), then calls `listen(3000, HOST)`.

**Engine run — `POST /api/run-engine` (`server/routes/engines.ts`):**

1. `createEngineRateLimitMiddleware({cost: 1})` (`server/core/rateLimit.ts`): resolves identity tier, charges daily units, enforces 60 s burst window; returns 429 with a machine-readable body when exceeded.
2. `engineRunSchema.safeParse(body)` (zod; keys from `ENGINE_SCRIPT_MAP` in `server/core/enginesCatalog.ts`).
3. `validatePublicUrl()` (`src/lib/networkSecurity.ts`): scheme allowlist, DNS lookup, `isPrivateIp` check.
4. `runNativeEngine(url, engine)` (`src/lib/nodeEngines.ts`): a switch over 9 engine ids (16 keys with aliases) that runs the engine inline. Engines call `guardedFetch()`, which pins the socket to the validated IP, re-validates redirects per hop, and caps response size at 5 MB.
5. Response: `{ success, engine, url, rateLimit, output }`. `output` is plain text with a score that `extractScoreFromOutput` parses.

**Master audit — `POST /api/v1/audit/master` and SSE `GET|POST /api/master-audit/stream`:**

1. Same guard path, cost 10 units (`MASTER_AUDIT_COST`).
2. Fans out to 8 engines (`health, compliance, ai_ready, latency, eco, migration, llmo, repo`) with `Promise.allSettled` (`server/routes/engines.ts`, `primaryEngines`). Each engine call goes through `runNativeEngine`. Fan-out is parallel per request.

**Telemetry — `POST /api/telemetry/event` (`server/routes/telemetry.ts`):**

1. Bot and prefetch filter by UA regex, before parsing (`botRegex`).
2. zod validation; malformed events are dropped silently.
3. Local enrichment with `geoip-lite` and `ua-parser-js`.
4. Queue into MongoDB time-series collections when `MONGODB_URI` is set; otherwise in memory (`src/lib/analyticsEngine.ts`).

**State sync — `GET|POST /api/state/sync` (`server/routes/stateSync.ts`):**

1. `getAttachedIdentity(req)?.uid ?? getVerifiedUid(req)`. No verified uid → 401. The client-supplied `ownerId` is ignored.
2. Reads and writes per-owner documents in MongoDB (`getDbInstance()`); falls back to an empty in-memory structure when the DB is unavailable (`mode: 'in_memory_fallback'`).

**Payments — `POST /api/payments/create-checkout`, webhooks, `POST /api/payments/verify` (`server/routes/payments.ts`):**

1. `create-checkout` computes the amount server-side from a hard-coded `pricingMap` (Pro $19/$190, Team $49/$490, Enterprise $99/$990) and returns a gateway redirect URL built from query parameters. It does **not** call a gateway API.
2. Webhooks (`/api/payments/webhook/2checkout`, `/dodopay`) verify HMAC-SHA256 over the raw body (`src/lib/webhookSecurity.ts`). After verification they log and return 200. **They do not write entitlements.**
3. `POST /api/payments/verify` always returns 503 `PAYMENTS_VERIFICATION_UNAVAILABLE`.

### 3) Layer/Module Responsibilities

| Layer or module | Owns | Must not own | Evidence |
|-----------------|------|--------------|----------|
| `server.ts` | Process lifecycle, HTTP listen, Vite or static wiring | Route handlers, Express config | `server.ts` |
| `server/app.ts` | Middleware order, CSP, body limits, route registration, JSON 404 + Mongo 503 fallbacks | Business logic | `server/app.ts` |
| `server/routes/*` (12 files) | HTTP handlers, zod parse, response envelope | Engine implementations | `server/routes/` |
| `server/core/rateLimit.ts` | Tier resolution, daily units, 60 s bursts, 429 envelope | Identity verification (delegated to `serverAuth.ts`) | `server/core/rateLimit.ts` |
| `server/core/apiKeys.ts` | Hashed API key store (`byHash`, `byId` maps), legacy `VALID_API_KEYS` allowlist | Persistent storage (in memory only) | `server/core/apiKeys.ts` |
| `server/core/enginesCatalog.ts` | Engine id + alias map, zod engine schema | Python script loading (the `.py` names are vestigial) | `server/core/enginesCatalog.ts`, `docs/ENGINES.md` |
| `src/lib/serverAuth.ts` | Firebase Admin init, `verifyIdToken`, identity attach. Fails closed when unconfigured. | Authorization decisions for specific routes | `src/lib/serverAuth.ts` |
| `src/lib/networkSecurity.ts` | SSRF guard: scheme, private-range, DNS pin, redirect re-check, size cap | Engine logic | `src/lib/networkSecurity.ts` |
| `src/lib/nodeEngines.ts` | The live engine implementations (`runNativeEngine` switch, 939 lines, 9 engines) | Route handling | `src/lib/nodeEngines.ts` |
| `lib/engines/*` | Parallel engine implementations with a `ENGINE_EXECUTORS` table. Imported only by `app/api/scan/stream/route.ts`. | Anything on the Express path | `lib/engines/index.ts`, `app/api/scan/stream/route.ts` |
| `src/lib/analyticsEngine.ts` | Mongo connection, time-series collection setup, in-memory fallback | Route logic | `src/lib/analyticsEngine.ts` |
| `src/lib/emailService.ts` | Mailgun dispatch; mock mode when credentials are absent | Templates for product copy | `src/lib/emailService.ts` |
| `src/lib/webhookSecurity.ts` | HMAC-SHA256 verification with `timingSafeEqual` | Webhook business effects | `src/lib/webhookSecurity.ts` |
| `src/App.tsx` | Route table (111 `<Route>` elements), layout shell | Data fetching | `src/App.tsx` |
| `src/context/*` | Auth, subscription, role, theme state for the SPA | Persistence | `src/context/` |
| `src/store/*` | zustand `useAppStore` with slices (domains, analytics, goals, alerts, audits, preferences) and `createMongoSyncMiddleware` | UI rendering | `src/store/useAppStore.ts`, `src/store/middleware/mongoSyncMiddleware.ts` |
| `src/pages/*`, `src/components/*` | Views and presentation | Server secrets | `src/pages/`, `src/components/` |
| `public/sw.js` | Service worker: precache static assets and telemetry docs | API responses | `public/sw.js` |

### 4) Reused Patterns

| Pattern | Where found | Why it exists |
|---------|-------------|---------------|
| Route-module registration (`registerXRoutes(app)`) | `server/app.ts`, `server/routes/*.ts` | Split the former monolithic `server.ts` (see `CODE_REVIEW.md` M3) |
| Middleware factory | `createEngineRateLimitMiddleware(options)` in `server/core/rateLimit.ts` | One rate-limit configuration per route, by cost |
| Fail-closed integration adapter | `serverAuth.ts`, `payments.ts`, `emailService.ts`, `analyticsEngine.ts` | Missing credentials must not silently grant access |
| Raw-body capture for signature checks | `jsonBodyParser` `verify` in `server/app.ts` → `req.rawBody`, used in `payments.ts` and `github.ts` | HMAC must be computed over the original bytes |
| Schema-first validation | `src/lib/validation.ts` (zod), `enginesCatalog.ts` | Shared client/server schemas and typed parsing |
| Singleton module state | `dailyRateLimitStore`, `byHash`/`byId`, `serverConnectedRepos`, cached Firebase verifier | Simple in-process state; see risks below |
| Zustand slices + middleware | `src/store/useAppStore.ts` | Compose domain slices and a sync middleware |
| Catalog with alias map | `ENGINE_SCRIPT_MAP` (16 keys for 8 engines + aliases) | Canonical id and legacy alias resolve to one implementation |
| Dual-path (Express vs Vercel twin) | `server/routes/engines.ts` and `api/run-engine.ts` | The Vercel twin is documented as dormant (`docs/ARCHITECTURE.md`) |

### 5) Known Architectural Risks

1. **Two engine implementations.** `src/lib/nodeEngines.ts` (live) and `lib/engines/*` (only used by `app/api/scan/stream`) can drift. `docs/ENGINES.md` says `lib/engines/` is canonical, which the code contradicts. *Impact:* engine fixes applied to one path will not reach the other. `[ASK USER]` which is canonical.
2. **Documented engine not routed.** `docs/ENGINES.md` lists `ai_search` in the server catalog. It is absent from `ENGINE_SCRIPT_MAP`, `runNativeEngine`'s switch, and every server route. *Impact:* the doc misleads callers. The engine exists only in `lib/engines/ai-search.ts`.
3. **Payments cannot activate paid plans.** `POST /api/v1/users/me/subscription/request` returns 501 for any paid `planId` and says paid changes "require a verified payment webhook." The webhooks verify HMAC and return 200 without writing entitlements (`server/routes/payments.ts`). *Impact:* no path currently grants a paid tier. `docs/ARCHITECTURE.md` and the 503 message say entitlements come from webhooks. `[ASK USER]` intended provisioning design.
4. **Per-process state.** Rate limits, API keys, connected repos, and throttles reset on restart and are not shared across instances (unless Upstash is configured for rate limits only). *Impact:* multi-instance deployment gives each instance its own budget and key store.
5. **Single-process fan-out.** Master audit runs 8 outbound scans in parallel for one request (`Promise.allSettled`). *Impact:* one request can drive many outbound fetches and CPU work inside the single Node process. Only the 10-unit cost cap bounds it.
6. **Dormant serverless twins.** `api/*.ts` duplicates logic (for example `api/run-engine.ts` 90 lines) and is not built or tested. *Impact:* drift. `CODE_REVIEW.md` M4 already reports drift.

### 6) Evidence

- `server.ts`, `server/app.ts`
- `server/routes/engines.ts` (`/api/run-engine`, `/api/v1/audit/master`, `primaryEngines`, `Promise.allSettled`)
- `server/core/rateLimit.ts` (`createEngineRateLimitMiddleware`, `dailyRateLimitStore`, `getUpstashLimiter`, `setInterval` cleanup at line ~421)
- `server/core/enginesCatalog.ts`, `docs/ENGINES.md`
- `src/lib/nodeEngines.ts` (`runNativeEngine` switch), `src/lib/networkSecurity.ts` (`validatePublicUrl`, `guardedFetch`)
- `lib/engines/index.ts`, `app/api/scan/stream/route.ts`, `src/lib/engines/index.ts`
- `server/routes/stateSync.ts`, `server/routes/payments.ts`, `server/routes/account.ts` (`/subscription/request` → 501)
- `src/lib/serverAuth.ts`, `src/lib/webhookSecurity.ts`, `src/lib/emailService.ts`, `src/lib/analyticsEngine.ts`
- `src/App.tsx`, `src/main.tsx`, `src/store/useAppStore.ts`, `src/store/middleware/mongoSyncMiddleware.ts`
- `docs/ARCHITECTURE.md` (intent source), `README.md` (intent source)

## Extended Sections (Optional)

### Startup order (detail)

`initAnalyticsDB()` runs first but is not awaited (`server.ts`). If it fails, the server still starts and logs `[Analytics DB] Startup init skipped/deferred`. Mongo connectivity is therefore checked lazily on request paths (`getDbInstance() || await initAnalyticsDB()` in `server/routes/stateSync.ts`).

### Failure modes (selected)

| Dependency down | Observable behavior | Evidence |
|-----------------|---------------------|----------|
| MongoDB | Telemetry queues in memory; state sync returns in-memory fallback; errors matching `Mongo` → 503 JSON | `src/lib/analyticsEngine.ts`, `server/app.ts` error handler |
| Firebase Admin not configured | Identity is anonymous; `/api/state/sync` → 401 | `src/lib/serverAuth.ts`, `server/routes/stateSync.ts` |
| Mailgun credentials absent | Mock dispatch with `mock: true` | `src/lib/emailService.ts` |
| Payment gateway credentials absent | 503 on checkout and verify; webhooks 503 when no secret | `server/routes/payments.ts` |
| Target site unreachable | Engine returns error output; `check-url` returns HTTP 200 with `reachable: false` (inconsistent with other 4xx/5xx use) | `server/routes/engines.ts` (`/api/check-url`) |

### Intent vs. reality summary (Phase 1 divergences)

Stated intent (`README.md`, `docs/ARCHITECTURE.md`, `docs/ENGINES.md`) compared with the code:

| Stated | Reality |
|--------|---------|
| `PORT`/`HOST` honor env (README) | `HOST` honored; `PORT` hard-coded to `3000` (`server.ts`) |
| `lib/engines/` is canonical engine path (`docs/ENGINES.md`) | Express path uses `src/lib/nodeEngines.ts` |
| `ai_search` in server catalog (`docs/ENGINES.md`) | Not routed on the server |
| Entitlements provisioned by webhooks (`docs/ARCHITECTURE.md`) | Webhooks verify but do not write entitlements |
| Redirects "never auto-followed" (`docs/ENGINES.md`, `docs/ARCHITECTURE.md`) | **Divergent.** `guardedFetch` follows up to 3 redirect hops and re-runs the SSRF validation on each hop (`src/lib/networkSecurity.ts`, `maxRedirects ?? 3`) |
| Dormant `api/*` (`docs/ARCHITECTURE.md`) | Consistent: not built or referenced by `package.json` |
| `PRODUCTION_READINESS_AUDIT.md` (linked in README) | File does not exist in the repo |
