# Architecture

> Regenerated 2026-10-19 by the `acquire-codebase-knowledge` workflow. `docs/ARCHITECTURE.md` (repo root docs) states the *intended* architecture; this file records what the code actually does, and §"Intent vs. reality" lists where they differ. `[TODO]` = not determinable. `[ASK USER]` = needs owner intent.

## Core Sections (Required)

### 1) Architectural Style

- **Primary style: single-process modular monolith** — one Node process serves both the API and the SPA, with a *layered* server (`routes → core → src/lib`) and a *feature-sliced* client (`src/pages`, `src/components/<feature>`, `src/store/slices`).
- **Why this classification (evidence):**
  - One HTTP server hosts everything: `server.ts` creates a single `http.Server(app)` and mounts either Vite middleware (dev) or `express.static(dist)` + `app.get('*')` SPA fallback (prod).
  - `server/app.ts` composes middleware then calls 12 `registerXRoutes(app)` functions — modules, not services.
  - Handlers stay thin and delegate to `src/lib/*`: `server/routes/engines.ts:2` imports `runNativeEngine` from `../../src/lib/nodeEngines`.
  - Client is feature-sliced: 22 directories under `src/components/` named by domain (`admin`, `blog`, `dashboard`, `pricing`, `telemetry`, …).
  - No queue, worker, scheduler, or second service exists anywhere (`find` for workers/cron → none; the only `setInterval` is the rate-limit ledger cleanup at `server/core/rateLimit.ts:421`).
- **Primary constraints that shape the design:**
  1. **Fail-closed / degrade-gracefully with zero credentials.** Every integration has an unconfigured path: Firebase Admin absent → identity is anonymous and `/api/state/sync` 401s; Mongo absent → in-memory buffer; Mailgun absent → `mock: true`; payments absent → 503; GitHub secret absent → deliveries rejected (`README.md`, verified in `src/lib/serverAuth.ts`, `src/lib/analyticsEngine.ts:41-43`, `src/lib/emailService.ts:309-314`, `server/routes/payments.ts`).
  2. **Identity is server-derived only.** `attachIdentity` verifies the Bearer token once per request; client headers (`x-user-email`, plan strings) are never trusted (`server/app.ts`, `src/lib/serverAuth.ts`, `server/core/rateLimit.ts:111-114` comment).
  3. **All user-supplied URLs pass an SSRF guard before any byte leaves the process** (`src/lib/networkSecurity.ts`).
  4. **One deployable, zero-budget hosting** (owner decisions D3/Q31/Q32: Cloudflare Pages + a single free Node host + a Worker `/api` proxy).

### 2) System Flow

```text
browser (React SPA / sw.js / logger facade)
   │  Bearer ID token + JSON body
   ▼
server.ts  ──►  server/app.ts  ──►  server/core/*  ──►  server/routes/*  ──►  src/lib/*  ──►  external systems
 (transport)    (helmet, limits,     (rate limit,        (zod parse,          (engines, SSRF     (target sites,
                 identity, 404/503)   api keys, authz)    envelope)            guard, Mongo,       Firebase,
                                                                                 Firebase Admin)   Mailgun, gateways)
```

Traced request — `POST /api/run-engine` (single engine scan), with file:line evidence:

1. **Transport.** `server.ts` binds `PORT = 3000` (hard-coded) / `HOST` (env) and hands the request to the Express app from `createApp()`.
2. **Security middleware.** `helmet` sets CSP/HSTS (`server/app.ts`); `Permissions-Policy` is added; `requestLoggingMiddleware` assigns or honours `x-request-id` and logs one JSON line on `finish` (`server/core/logger.ts`); the conditional JSON parser captures `req.rawBody` (256 KB limit here).
3. **Identity.** `attachIdentity` (`src/lib/serverAuth.ts`) verifies the Firebase ID token with `firebase-admin` and reads the plan from the `user_subscriptions` Firestore collection; result lands on `req.verifiedIdentity`. No token → visitor.
4. **Rate limit.** `createEngineRateLimitMiddleware({ cost: SINGLE_ENGINE_COST /* 1 */ })` resolves the tier from the verified identity, charges the in-memory daily ledger (`dailyRateLimitStore`, `server/core/rateLimit.ts:43`), enforces the 60 s burst window, optionally consults the Upstash sliding-window limiter, and answers `429` with a machine-readable envelope plus `X-RateLimit-*` headers.
5. **Validation + SSRF guard.** `engineRunSchema.safeParse(req.body)` (zod, engine id restricted to `Object.keys(ENGINE_SCRIPT_MAP)`) → `validatePublicUrl(url, isRepoEngine)`: scheme allowlist, `isPrivateIp` check, `dns.lookup` then re-validate the resolved address. Invalid → `400`.
6. **Engine execution.** `runNativeEngine(targetUrl, engine)` (`src/lib/nodeEngines.ts:29`) switches over 8 canonical engine ids + 8 legacy aliases and fetches via `guardedFetch` — DNS resolved once, socket **pinned** to the validated IP (`pinnedRequest` custom `lookup`), each redirect hop re-validated (`maxRedirects ?? 3`), 5 MB response cap (`DEFAULT_MAX_BYTES`), 10 s timeout (`HTTP_TIMEOUT_MS`). HTML is parsed with `cheerio`; sub-engines call `securityAudit.ts` (Cloudflare DoH, `crt.sh`) and `api.thegreenwebfoundation.org`.
7. **Response.** `{ success, engine, url, rateLimit{tier,remaining,limit,used,resetAt}, output }`, where `output` is a plain-text report; the client parses scores out of that text (`src/utils/parseEngineOutput.ts`, `server/routes/engines.ts:18 extractScoreFromOutput`).

Master audit has **two different execution shapes**:
- `POST /api/v1/audit/master` — 8 engines in parallel via `Promise.allSettled` (`server/routes/engines.ts:360-372`), cost 10 units. Its headline `compositeScore: 92, grade: 'A'` is a **hard-coded constant** (`:377-378`), not derived from the results.
- SSE `/api/scan/stream` (+ 5 aliases) — the same 8 engines run **sequentially** in a `for` loop, emitting `session_init` → `engine_start` → `engine_complete` ×8 → `audit_complete`; no composite score is sent (`:426-486`). The client computes its own average from per-engine scores (`src/pages/MasterAuditExecutionPage.tsx:155-159`).

Telemetry flow (write): SPA / served `telemetry.js` → `POST /api/telemetry/event` (+3 aliases) → UA bot + prefetch filter (`server/routes/telemetry.ts:47-49`) → zod validate → local geo/UA enrichment (`geoip-lite`, `ua-parser-js`) → `queueEvent` → `flushQueue` into MongoDB time-series collections, or an in-memory buffer when `MONGODB_URI` is unset. Reads: `/api/analytics/stats`, `/api/analytics/realtime`, `/api/analytics/anomalies/check` (the last one is superadmin-gated; the two reads are **not**).

### 3) Layer/Module Responsibilities

| Layer or module | Owns | Must not own | Evidence |
|-----------------|------|--------------|----------|
| `server.ts` | Process lifecycle, HTTP listen, Vite/static wiring, `initAnalyticsDB()` fire-and-forget | Express config, routes (deliberately moved out so supertest can drive `createApp()`) | `server.ts` |
| `server/app.ts` | Middleware order, CSP + inline-script hashing, per-route body limits, `rawBody` capture, identity attach, route registration, JSON 404, Mongo 503 fallback | Business logic | `server/app.ts` |
| `server/routes/*` (12 modules) | HTTP handlers: parse → authorise → call lib → envelope | Engine implementations, DB drivers | `server/routes/` |
| `server/core/rateLimit.ts` | Tier resolution from verified identity, daily unit ledger, 60 s bursts, Upstash burst limiter, 429 envelope, hourly cleanup | Identity verification | `server/core/rateLimit.ts:13-21,43,394,421` |
| `server/core/apiKeys.ts` | SHA-256-hashed key store (`byHash`/`byId`), legacy `VALID_API_KEYS` allowlist with constant-time compare | Persistence (in-memory only) | `server/core/apiKeys.ts` |
| `server/core/authz.ts` | `requireSuperadmin` (+ `requireSuperadminInProduction` alias), test-only demo bypass via `ALLOW_UNAUTH_DEMO` + `NODE_ENV=test` | Route logic | `server/core/authz.ts` |
| `server/core/enginesCatalog.ts` | `ENGINE_SCRIPT_MAP` (16 keys = 8 engines + 8 aliases) and the zod engine schema factory | Python loading — the `.py` values are vestigial strings, never executed | `server/core/enginesCatalog.ts`, `docs/ENGINES.md` |
| `src/lib/serverAuth.ts` | `firebase-admin` init (dynamic import), `verifyIdToken`, plan lookup, `attachIdentity`; returns null → fail closed | Per-route authorisation | `src/lib/serverAuth.ts` |
| `src/lib/networkSecurity.ts` | `isPrivateIp`, `validatePublicUrl`, `guardedFetch` (pinned DNS, per-hop revalidation, size cap) | Engine logic | `src/lib/networkSecurity.ts:15,68,229` |
| `src/lib/nodeEngines.ts` | The **live** engine implementations (939 lines, one switch) | Route handling | `src/lib/nodeEngines.ts:29-58` |
| `src/lib/analyticsEngine.ts` | Mongo connection, time-series setup, event queue/flush, aggregation queries, health probe, in-memory fallback | Route logic | `src/lib/analyticsEngine.ts` |
| `src/lib/emailService.ts` / `webhookService.ts` / `webhookSecurity.ts` | Mailgun dispatch (+ mock mode), Slack/Discord/generic webhook fan-out, HMAC-SHA256 verification with `timingSafeEqual` | Entitlement decisions | those files |
| `src/App.tsx` | Route table (142 `<Route>` elements), layout shell, global mousemove spotlight handler | Data fetching | `src/App.tsx` |
| `src/context/*` | Auth, subscription, role-security, theme state | Persistence | `src/context/` |
| `src/store/*` | zustand `useAppStore` (6 slices) + `createMongoSyncMiddleware` optimistic sync with pending/failed queues | UI rendering | `src/store/` |
| `components/`, `lib/`, `types/` (root) | Mirror layer: 5 real component implementations, 8 reverse shims into `src/`, the parallel engine + rate-limiter implementations, `types/telemetry.ts` (the real one), `lib/firebase.js` | — (see `STRUCTURE.md` §1 for the pair-by-pair breakdown) | `cmp -s` + `head -1` on all 14 name-matched pairs |
| `public/sw.js` | Precache static assets + telemetry docs; cache-first for `/assets/*` | API responses | `public/sw.js`, `docs/audit/perf-rendering-2026-10/05-remediation.md` D4 |

### 4) Reused Patterns

| Pattern | Where found | Why it exists |
|---------|-------------|---------------|
| Route-module registration (`registerXRoutes(app)`) | `server/app.ts` + 12 files in `server/routes/` | Decomposition of the former 2,906-line `server.ts` monolith (`CODE_REVIEW.md` M3) |
| Middleware factory with per-route cost | `createEngineRateLimitMiddleware({ cost, isMaster })` | One limiter config per route (1 unit vs 10 units) |
| Fail-closed integration adapter | `serverAuth.ts`, `payments.ts`, `emailService.ts`, `analyticsEngine.ts` | Missing credentials must never silently grant access |
| Raw-body capture for signature checks | `jsonBodyParser` `verify` → `req.rawBody`; consumed by `payments.ts` and `github.ts` | HMAC must be computed over the original bytes, not re-serialised JSON |
| Result-object instead of throw | `validatePublicUrl` → `{valid, error, normalizedUrl, ip}`, `verifyHmacSha256` → `{valid, reason}` | Callers branch on validity and keep the detail server-side |
| Schema-first validation | `src/lib/validation.ts` (zod factories shared by client and server), `enginesCatalog.ts`, `clientLogs.ts` | One typed parse at the boundary |
| Singleton module state | `dailyRateLimitStore`, `byHash`/`byId`, `serverConnectedRepos`, `githubSseSubscribers`, client-log/contact throttle maps, cached Firebase verifier | Simple in-process state — see risk 3 |
| Catalog with alias map | `ENGINE_SCRIPT_MAP` (16 keys), `runNativeEngine` switch cases paired canonical+alias | Legacy UI ids resolve to one implementation |
| zustand slices + sync middleware | `src/store/useAppStore.ts`, `src/store/middleware/mongoSyncMiddleware.ts` | Compose domain slices; keep optimistic UI consistent with Mongo |
| Shim re-export (both directions) | `src/components/telemetry/{DiagnosticConsoleCard,GuestQuotaBanner,LiveTerminalStream,MasterTelemetryGrid}.tsx` + `src/components/ui/dashboard-sidebar.tsx` point **out** to root `components/`; root `components/ui/{BenchmarkCard,CodeBlock,TelemetryCard,TerminalInput,cobe-globe-cdn,edge-mesh-globe,demo}.tsx` + `components/telemetry/AuditScoreMatrixRadar.tsx` point **in** to `src/components/`; plus `src/lib/rate-limit.ts`, `src/types/telemetry.ts`, `lib/utils.ts`, `src/lib/engines/index.ts` | Historical split between root and `src/`; preserves existing import paths |
| SSE progress streaming | `handleMasterAuditStream`, `github.ts` events stream | Long-running multi-engine audits report progress |
| Dual-path (Express vs serverless twin) | `server/routes/engines.ts` ↔ `api/run-engine.ts`; `server/routes/*` ↔ `app/api/scan/stream/route.ts` | The twins are dormant; owner decision D8/D7 says delete them |

### 5) Known Architectural Risks

1. **Three rate-limit implementations with conflicting numbers.** `server/core/rateLimit.ts` is authoritative (visitor 20, free 50, starter 150, pro 500, team 1500, enterprise **5000**, api_pro 500, superadmin unlimited). `lib/rate-limit.ts` (`TIER_DAILY_LIMITS`) says visitor **5**, free **20**, enterprise **10000**, superadmin 999999. `src/utils/rateLimiter.ts` duplicates the server numbers for client display. *Impact:* if the dormant `lib/rate-limit.ts` path is ever revived (it is the only limiter behind `app/api/scan/stream/route.ts`), guests get 5 units instead of 20 and enterprise doubles; and any budget change must be made in three places. Owner decisions D7/D8 authorise deleting the dormant path that uses it (`CONCERNS.md` §6(a) items 7–8); the mirror-layer cleanup is §6(b) #9
2. **Two engine implementations.** `src/lib/nodeEngines.ts` (live) vs `lib/engines/*` (8 modules, `ENGINE_EXECUTORS`, imported only by the dormant Next route). `docs/ENGINES.md` calls `lib/engines/` canonical; owner decision D7 (2026-10-19) says `src/lib/nodeEngines.ts` is canonical and `lib/engines/` should be removed — **neither the doc nor the tree has been updated**. `ai_search` exists only in `lib/engines/ai-search.ts` and is unreachable from Express. *Impact:* fixes land in one path only; docs mislead.
3. **All security-critical state is per-process.** Rate-limit ledger, hashed API-key store, connected GitHub repos, SSE subscriber maps, and client-log/contact throttles are module-level `Map`s. Only the 60 s burst limiter can be distributed (Upstash). *Impact:* restart wipes quotas and API keys; N instances each enforce a full budget (N× effective quota). Owner decisions D3/Q32 chose a single free Node host, which bounds but does not remove the risk (deploys still reset state). `[ASK USER]` §6(b) #1
4. **No path grants a paid plan.** Webhooks verify HMAC then only log and return 200; `POST /api/v1/users/me/subscription/request` returns 501 for any non-`free` `planId`; `POST /api/payments/verify` always returns 503. Owner decision D1 says "webhook writes the subscription; the client never activates a paid plan" — **not implemented**. *Impact:* revenue flow is non-functional; the 503 message and `docs/ARCHITECTURE.md` both promise webhook provisioning.
5. **Hard-coded composite score.** `POST /api/v1/audit/master` returns `compositeScore: 92, grade: 'A'` for every target, and `src/store/slices/auditsSlice.ts:29` seeds the same constant. *Impact:* any consumer of the JSON (non-SSE) master audit gets a fabricated headline score; only the SSE path plus client-side averaging yields real numbers.
6. **Fan-out asymmetry.** The JSON master audit issues 8 concurrent outbound scans per request (bounded only by the 10-unit cost and burst limits); the SSE variant is sequential and therefore holds a connection open for up to 8 × 10 s. *Impact:* two different resource profiles for what the API documents as one feature.
7. **Dormant twins drift.** `api/*.ts` and `app/` are excluded from type-checking (`tsconfig.json` `exclude: ["app"]`) and from linting (`eslint.config.js` ignores `api/**`), and `archive/legacy-next/` holds byte-identical copies. *Impact:* silent rot; `CODE_REVIEW.md` M4 already reported drift.
8. **CSP breadth.** `connect-src` allows any `ws:`/`wss:` host, `img-src` allows any `https:`, `style-src` keeps `'unsafe-inline'` in all environments, and `frameguard: false`. *Impact:* weakened containment if an injection lands in markup or a style attribute.

### 6) Evidence

- `server.ts`, `server/app.ts`, `server/core/{rateLimit,apiKeys,authz,enginesCatalog,logger,ssl,runtime}.ts`
- `server/routes/{engines,telemetry,stateSync,payments,account,github,notifications,system,clientLogs,contact,plans,reports}.ts`
- `src/lib/{nodeEngines,networkSecurity,securityAudit,serverAuth,analyticsEngine,emailService,webhookService,webhookSecurity,validation,logger,firebase}.ts`
- `lib/engines/index.ts`, `lib/rate-limit.ts`, `src/lib/engines/index.ts`, `src/lib/rate-limit.ts`, `src/utils/rateLimiter.ts`, `app/api/scan/stream/route.ts`, `api/run-engine.ts`
- `src/main.tsx`, `src/App.tsx`, `src/pages/MasterAuditExecutionPage.tsx`, `src/store/`, `src/context/`, `public/sw.js`
- Intent sources cross-checked: `README.md`, `docs/ARCHITECTURE.md`, `docs/ENGINES.md`, `docs/plan/production-readiness-plan.md`, `docs/plan/decisions.md`, `CODE_REVIEW.md`
- Audit evidence: `docs/audit/perf-rendering-2026-10/05-remediation.md`, `docs/audit/seo-aeo-2026-10/00-SEO-AEO-AUDIT.md`

## Extended Sections (Optional)

### Startup / initialisation order

`startServer()` → `initAnalyticsDB().catch(warn)` (**not awaited**; Mongo connectivity is re-checked lazily per request via `getDbInstance() || await initAnalyticsDB()`) → `await createApp()` (CSP hashing reads `dist/index.html` in production) → `createHttpServer(app)` → Vite middleware *or* static+fallback → `listen(3000, HOST)`. A fatal startup rejection logs and `process.exit(1)`.

### Failure-mode matrix (verified by reading the code paths)

| Dependency unavailable | Observable behaviour | Evidence |
|---|---|---|
| Firebase Admin unconfigured | Verifier disabled → every caller is a visitor; `/api/state/sync` → 401 | `src/lib/serverAuth.ts`, `server/routes/stateSync.ts` |
| MongoDB down / unset | Telemetry buffers in memory; Mongo-shaped errors → `503` JSON; `/api/v1/database/mongodb/status` reports `connected: false` | `src/lib/analyticsEngine.ts:41-43,114`, `server/app.ts` error fallback |
| Mailgun key missing/placeholder | `console.log('[Mailgun Mock Dispatch] …')` + `{ mock: true, messageId: 'mock_…' }` | `src/lib/emailService.ts:309-314` |
| Gateway credentials missing | `create-checkout` → 503; webhooks → 503 when no secret, 401 when the signature fails | `server/routes/payments.ts` |
| `GITHUB_WEBHOOK_SECRET` unset | All webhook deliveries rejected (the seeded demo repo's secret is `''`) | `server/routes/github.ts:16-24` |
| Upstash unset | Burst limiting falls back to the in-process window | `server/core/rateLimit.ts:71-82,394` |
| Target site unreachable | Engine returns an error report; **`POST /api/check-url` answers HTTP 200 with `{ reachable: false, error }`** — inconsistent with the 4xx/5xx used elsewhere | `server/routes/engines.ts:35-64` |

### Intent vs. reality (Phase 1 divergences, re-checked 2026-10-19)

| Stated intent | Where stated | Reality in code |
|---|---|---|
| `PORT`/`HOST` honour env | `README.md` "Dev server … (PORT/HOST honor env)"; owner decision Q40 | `server.ts:26` `const PORT = 3000`; only `HOST` is read from env |
| `lib/engines/` is the canonical engine path | `docs/ENGINES.md` "Decision record" | Express uses `src/lib/nodeEngines.ts`; owner decision D7 agrees and says `lib/engines/` should be deleted — still present |
| `ai_search` is in the server catalog | `docs/ENGINES.md` engine table | Absent from `ENGINE_SCRIPT_MAP` and from `runNativeEngine`'s switch; owner decision Q39 says don't expose it and fix the doc — doc unfixed |
| "Redirects are never auto-followed" | `docs/ENGINES.md`, `docs/ARCHITECTURE.md` §5 | `guardedFetch` follows up to **3** hops, re-validating each (`src/lib/networkSecurity.ts:231,243,263-264,317`) |
| Entitlements are provisioned by signed webhooks | `docs/ARCHITECTURE.md` "Security model", `README.md`, the 503 message | Webhooks verify + log + `200`; nothing is written |
| "all four mandatory local gates are green — `tsc --noEmit` (0 errors), `npm test` (177 passed)" | `README.md` "Current state (2026-09-05)" | This session: `tsc` exit 2 with 127 errors; vitest 206 passed / 5 skipped / 1 suite failed |
| 42-PoP edge mesh | `docs/ARCHITECTURE.md`, `src/lib/edge/pops.ts` (42 entries), 10+ UI strings | `index.html` meta/OG description and `src/components/layout/Footer.tsx:46` say "**38** global edge nodes" |
| `PRODUCTION_READINESS_AUDIT.md` | linked twice from `README.md` | File does not exist (the plan lives at `docs/plan/production-readiness-plan.md`) |
| Single live rate limiter | `docs/ARCHITECTURE.md` §4 | Three implementations (§5 risk 1) |
| Master audit composite score reflects the engines | `src/data/apiSpecs.ts:420` documents `compositeScore: 92` | Server constant; the client computes a real average only on the SSE path |
| `docs/orchestrator` shows `calculateCompositeQualityScore(...)` | `src/pages/docs/OrchestratorDoc.tsx:59` | Illustrative `CodeSnippet` string only — no such function exists in the repo |
