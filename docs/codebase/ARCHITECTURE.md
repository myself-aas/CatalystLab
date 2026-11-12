# Architecture

> Regenerated 2026-11-12 against branch `arena/b1761471-catalystlab` (`1babd3a`).
> Verified against source, not against the narrative docs; where `docs/ARCHITECTURE.md`
> or `README.md` disagree, the divergence is listed in §5.

## Core Sections (Required)

### 1) Architectural Style

- **Single-process modular monolith with a static edge tier.** One Express 5 process
  (`server.ts` → `createApp()`) serves both the JSON API under `/api/*` and the React 19
  SPA. In development the SPA comes from Vite middleware; in production from prerendered
  shells + `dist/assets` (`server.ts:58-208`). A stateless Cloudflare
  Worker (`worker/api-proxy.js`) is the only split component: it forwards `/api/*` from
  the Pages-hosted frontend to the Node origin.
- **Layering:** transport (`server.ts`) → middleware/composition (`server/app.ts`) →
  route modules (`server/routes/*`) → services (`server/core/*`, `src/lib/*`) → external
  systems. Shared pure modules live in `src/lib` and are imported by the server; the
  reverse direction never occurs.
- **Hard constraints visible in code:**
  1. *Fail closed.* Missing config yields a safe denial, not a permissive default:
     `/api/payments/*` → `503`, GitHub webhooks → `401`/`503`, state sync → `401`,
     Worker → `503 API_ORIGIN_NOT_CONFIGURED`, Mailgun → mock-mode logging, Mongo →
     in-memory buffer (`server/routes/payments.ts`, `server/routes/github.ts`,
     `server/routes/stateSync.ts`, `worker/api-proxy.js:44-64`,
     `src/lib/emailService.ts:313`, `src/lib/analyticsEngine.ts`).
  2. *Server-derived trust only.* Tiers/entitlements come from verified Firebase ID
     tokens, HMAC-verified webhooks, or hashed `cat_live_` API keys — never from client
     headers (`src/lib/serverAuth.ts`, `server/core/rateLimit.ts`,
     `server/core/apiKeys.ts`, `firestore.rules`).
  3. *Zero-cost degradation.* Every integration has an in-memory or no-op mode so the
     app boots with an empty `.env` (`README.md` "Environment variables",
     `server/core/sharedLimiter.ts`, `server/core/dailyQuota.ts`).
  4. *Honest data.* Routes that cannot serve real data answer `501` rather than
     synthesising payloads (`server/routes/reports.ts:9-14`, `server/routes/account.ts:182,400,429`),
     and the master audit reports per-engine measurements only, with no invented
     composite score (`docs/ENGINES.md`, `server/routes/engines.ts:355-470`).

### 2) System Flow

```text
Browser (React 19 SPA)
  └─ Firebase Auth (client SDK) ── ID token ──▶ fetch('/api/...', Authorization: Bearer …)
        │
Cloudflare Pages (static dist/) ── /api/* ──▶ Cloudflare Worker (worker/api-proxy.js)
                                                 appends cf-connecting-ip as RIGHTMOST XFF
                                                 strips hop-by-hop headers, streams SSE
                                                 ▼
                                          Node host: server.ts
                                            · initErrorTracking() + process handlers
                                            · initAnalyticsDB() (Mongo | memory)
                                            · createApp(): helmet CSP(nonce+hashes) → Permissions-Policy
                                              → SSE-safe gzip → request logging → JSON body limits
                                              (256 KB; 2 MB for POST /api/state/sync) → attachIdentity
                                              → 12 register*Routes() → API 404 → DB-offline 503 handler
                                            · prod: .map 404, alias 301/302, noindex surfaces,
                                              prerendered shell cache (≤256) + CSP nonce injection,
                                              express.static(dist, immutable /assets), real 404 shell
                                            · listen(PORT, HOST), SIGTERM/SIGINT drain ≤10 s
                                                 ▼
                                          server/routes/*  (zod → identity → quota → work)
                                                 ▼
      engines: validatePublicUrl → guardedFetch (DNS-pinned) → runNativeEngine (cheerio)
      state:   Firestore (firebase-admin) · MongoDB (analytics/state) · Upstash (quota/burst)
      outbound: Mailgun · 2Checkout/Dodo · GitHub webhooks · Slack/Discord · Sentry
```

Request lifecycles worth naming:

1. **Prerendered page** — `GET /pricing` → production middleware matches `dist/pricing/index.html`
   → cache hit → `injectNonceIntoHtml` rewrites the `<meta property="csp-nonce">` and every
   `<script>` without a nonce → 200 `text/html` with `Cache-Control: max-age=0, must-revalidate`.
2. **Client-only route** — `GET /dashboard` → no shell, but `matchesSpaRoute(compiledRoutes, path)`
   → serves `dist/index.html` with `X-Robots-Tag: noindex, nofollow`.
3. **Alias / unknown surface** — `/pricing.html` → `301 /pricing`; `/docs/llmo` → `301` to the
   canonical engine doc (`src/config/routeAliases.ts`); `/blogs/<unknown>` → `404` shell;
   `/api/*` misses always answer JSON `404`, never the SPA.
4. **Engine run** — `POST /api/run-engine` → `createEngineRateLimitMiddleware({cost:1})` →
   `engineRunSchema` (zod enum over `ENGINE_SCRIPT_MAP`) → `validatePublicUrl` →
   `runNativeEngine` → JSON with `rateLimit` snapshot.
5. **Master audit** — `GET|POST /api/v1/audit/master/stream` (aliases `/api/master-audit/stream`,
   `/api/scan/stream`) charges 10 units, then streams `session_init`, per-engine
   `engine_start`/`engine_complete`, `audit_complete` over SSE; gzip middleware deliberately
   skips `/stream` paths.
6. **Entitlement write** — `POST /api/payments/webhook/2checkout` → HMAC-SHA256 over the raw
   body (`express.json` `verify` hook keeps `rawBody`) → `applyGatewayEvent` transaction in
   `server/core/subscriptions.ts` → idempotent on gateway event id, monotonic on event time.
7. **State sync** — `GET/POST /api/state/sync`, `DELETE /api/state/sync/:collection/:id` →
   `getAttachedIdentity(req).uid` (never body `ownerId`) → MongoDB collection allowlist
   (`STATE_SYNC_COLLECTIONS`) → in-memory fallback payload when Mongo is absent.

### 3) Layer/Module Responsibilities

| Layer or module | Owns | Must not own | Evidence |
|-----------------|------|--------------|----------|
| `server.ts` | Boot order, HTTP server, prod HTML delivery, nonce injection, shutdown drain | Route logic, authz | `server.ts` |
| `server/app.ts` | CSP (no `'unsafe-inline'`), Permissions-Policy, gzip, request logging, body limits, identity attach, route registration, 404/error terminals | Business rules | `server/app.ts:193-351` |
| `server/core/*` | Rate limit + daily quota, Upstash/memory ledgers, API keys, authz, subscriptions state machine, pricing, retention/expiry, backup/restore, SSL probe, engine catalog, SPA route manifest, logger, Sentry | HTTP routing, HTML | `server/core/` |
| `server/routes/*` | Endpoint contracts, zod validation, status semantics, SSE framing | Trusting client identity; granting paid plans | `server/routes/` |
| `src/lib/nodeEngines.ts` | 8 canonical engines + aliases (switch statement) | Outbound fetches without the guard | `src/lib/nodeEngines.ts`, `docs/ENGINES.md` |
| `src/lib/networkSecurity.ts` | SSRF guard: scheme allowlist, private/loopback/link-local/CGNAT/metadata blocking, DNS pinning, ≤3 redirect hops, 5 MB cap, TLS verify, 10 s timeout | Scoring | `src/lib/networkSecurity.ts` |
| `src/lib/serverAuth.ts` | Firebase ID-token verification, claim → plan/trial/superadmin, Firestore admin accessor | Client-visible entitlement state | `src/lib/serverAuth.ts` |
| `src/lib/analyticsEngine.ts` | Mongo client lifecycle, batched event queue, cookieless visitor hashing, in-memory fallback | HTTP layer | `src/lib/analyticsEngine.ts` |
| `src/store/**` + `src/context/**` | Client state, optimistic mutations with rollback, auth/subscription/theme/role providers | Source of truth for tiers | `src/store/useAppStore.ts`, `src/store/middleware/mongoSyncMiddleware.ts` |
| `worker/api-proxy.js` | Same-origin `/api/*` forwarding, placeholder/HTTP origin rejection, XFF integrity, SSE passthrough | Business logic, auth | `worker/api-proxy.js` |
| `scripts/prerender.ts` | Route shells (64), `404.html`, sitemap index + 4 sections, `routes.json`, `llms.txt`, `llms-full.txt`, `rss.xml`, `pricing.md`, JSON-LD from UI data tables | Runtime behaviour | `scripts/prerender.ts`, build log |
| `src/config/` | Single source for origin/robots policy (`site.ts`), alias map (`routeAliases.ts`), sitemap sections (`sitemapSections.ts`) | Component styling | `src/config/` |

### 4) Reused Patterns

| Pattern | Where found | Why it exists |
|---|---|---|
| Route-module registrar — `register*Routes(app)` | all 12 files in `server/routes/`, wired in `server/app.ts:309-320` | decomposes the former monolithic handler set (CODE_REVIEW Phase 2) |
| Middleware factory for quotas — `createEngineRateLimitMiddleware({cost})`, `masterStreamLimiter`, `telemetryIngestLimiter` | `server/core/rateLimit.ts`, `server/core/sharedLimiter.ts`, `server/routes/engines.ts` | one cost model for every metered surface |
| Zod schema factory shared client/server — `engineRunSchemaFactory(ids)` | `src/lib/validation.ts` → `server/core/enginesCatalog.ts` | the enum of valid engines cannot drift between tiers |
| Fail-closed gate before side effects — `checkCheckoutReadiness()`, `validateConfiguredOrigin()`, `getVerifiedUid() ?? 401` | `server/routes/payments.ts`, `worker/api-proxy.js`, `server/routes/stateSync.ts` | no partially-configured path can charge or authorise |
| Memory-backed singleton with cloud upgrade | `server/core/sharedLimiter.ts`, `server/core/dailyQuota.ts`, `src/lib/analyticsEngine.ts`, `server/core/apiKeys.ts` | zero-cost dev, shared-accurate production |
| Injection point for tests — `setDailyQuotaBackendForTests`, `setSubscriptionStoreForTests` | `server/core/dailyQuota.ts`, `server/core/subscriptions.ts`, `src/tests/server/*` | transaction semantics testable without Firestore/Redis |
| Lazy route splits + synchronous landing | `src/App.tsx` (30+ `React.lazy`, landing eager) | CWV product promise + bundle budget |
| Decision-tagged comments (`D#` `Q##` `Plan x.y` `SEC-2026-##`) | throughout `server/`, `src/lib/`, `scripts/`, `worker/` | traceability to `docs/plan/decisions.md` |
| Build-time content generation from UI tables | `scripts/prerender.ts` consuming `src/data/{pricingData,engineSeo,blogSeo,docsSeo,blogContent}.ts`, `src/lib/edge/pops.ts` | SEO surface and UI cannot drift |

### 5) Intent vs Reality (divergences found this session)

| Stated (README / docs) | Actual in tree | Evidence |
|---|---|---|
| "Node 24 everywhere (D5)", `.nvmrc` = 24 | **`.nvmrc` is absent**; `package.json` says `>=22`, lockfile root says `>=24`; 9 workflow steps reference `.nvmrc` | `git ls-files \| grep -i nvm` → empty; `package.json:8`; `package-lock.json:70` |
| "42 parity-verified env keys incl. PORT/NODE_ENV added 2026-10-21" | `.env.example` has **41** keys and lacks `PORT`/`NODE_ENV`; staging/production have 42; `.env.example` has an extra `GEMINI_API_KEY` read by nothing → `npm run check:env` **fails** | `npm run check:env` output; `grep -rn GEMINI src server scripts` → empty |
| "330 passed in 36 files" | **447 passed in 51 files**; coverage 71.41/59.47/75.3/72.64 (ratchet 68/55/72/69) | `npm test`, `npm run test:coverage` output (2026-11-12) |
| Lighthouse CI "audits the real production host" (D17) | `.lighthouserc.json` starts `node dist/server.cjs` with `startServerReadyPattern` matched `"Server running"` while `server.ts` logs `"[CatalystLab] Server listening on …"` — the ready pattern never matches. (The `best-practices`/`seo` assertions are deliberately `off` in that config because `scripts/report-lhci.mjs` applies route-aware budgets instead — that part is intended.) | `.lighthouserc.json:15-20`, `server.ts:231`, `scripts/report-lhci.mjs:171-183` |
| `docs/ENGINES.md` execution-surface table lists `GET/POST /api/scan/stream` as master-audit aliases | `/api/scan/stream` handlers exist in `server/routes/engines.ts` (registered alongside the master stream), verified live: `POST /api/v1/audit/master/stream` → 400 (needs `url`), while `POST /api/v1/reports` → 501 | live smoke this session; `server/routes/engines.ts:465-468` |
| `src/lib/media/registry.ts` "zero-empty-slot, Pexels sources" | Registry now prefers self-hosted plates in `src/assets/images`; `npm run media:check` **fails** in this sandbox because 5 remote Pexels endpoints are unreachable | `src/lib/media/registry.ts:1-17`, `src/lib/media/plates.ts`, `npm run media:check` |
| `docs/codebase/ARCHITECTURE.md` (2026-10-21) described a re-export shim tree `components/` ↔ `src/components/telemetry/` | no root `components/` directory exists; `src/components/telemetry/` holds 4 real components | `ls components` → absent |

### 6) Evidence

- `server.ts`, `server/app.ts`, `server/routes/*.ts` (12), `server/core/*.ts` (16)
- `src/lib/{serverAuth,networkSecurity,nodeEngines,analyticsEngine,validation,emailService,webhookService}.ts`
- `src/App.tsx`, `src/main.tsx`, `src/store/useAppStore.ts`, `src/store/middleware/mongoSyncMiddleware.ts`, `src/config/{site,routeAliases,sitemapSections}.ts`
- `worker/api-proxy.js`, `wrangler.toml`, `firestore.rules`, `Dockerfile`
- `scripts/prerender.ts`, `scripts/verify-deployment.mjs`, `.lighthouserc.json`, `scripts/report-lhci.mjs`
- Live smoke this session (`node dist/server.cjs`, NODE_ENV=production): `GET /` 200, `GET /pricing` 200, `GET /dashboard` 200 (noindex), `GET /nope` 404, `GET /api/health` 200 `{"status":"ok"}`, `GET /api/v1/system/health` 200, `GET /api/v1/engines` 200, `GET /api/v1/reports` 501, `GET /docs/llmo` 301, `GET /docs/llm-kinase` 200
- `docs/plan/decisions.md` (D1-D17, Q17-Q52), `docs/ENGINES.md`, `docs/ARCHITECTURE.md`, `docs/ops/slo.md`
