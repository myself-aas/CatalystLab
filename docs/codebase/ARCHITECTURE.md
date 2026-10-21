# Architecture

> Regenerated 2026-10-21 by the `acquire-codebase-knowledge` workflow. Supersedes the 2026-10-19 revision. All claims verified against source at commit `d2c26ef`; the narrative docs (`docs/ARCHITECTURE.md`, README) are partially stale on versions — divergences listed in §5 and CONCERNS.

## Core Sections (Required)

### 1) Architectural Style

- **Primary style:** Single-process modular monolith — one Express 5 HTTP server hosts both the JSON API (`server/routes/*`) and the React 19 SPA (Vite middleware in dev; static `dist/` + prerendered shells in production), with a stateless Cloudflare Worker as an edge proxy in the split-hosting deployment.
- **Why this classification:** `server.ts` binds one `PORT`/`HOST` and mounts `createApp()` (`server/app.ts`) which registers 12 route modules and the SPA fallback; README: "One HTTP server hosts both the Express API and the SPA"; `docs/ARCHITECTURE.md`: "single-process deployable".
- **Primary constraints:**
  1. **Fail-closed everything** — every external integration degrades to a safe denial or in-memory mode when unconfigured (payments → 503, webhooks → 401, state sync → 401; README "Environment variables", `worker/api-proxy.js` 503 on placeholder `API_ORIGIN`).
  2. **Server-derived trust only** — identity/tiers come exclusively from verified Firebase ID tokens, HMAC-verified webhooks, and the `cat_live_` API-key allowlist; client headers are never trusted (`docs/ARCHITECTURE.md` "Identity and trust boundaries", `src/lib/serverAuth.ts`).
  3. **Zero budget** — hosting decisions D3(b)/Q30/Q32: Cloudflare Pages + Worker (free), Oracle Always Free API host, Render Free fallback; in-memory fallbacks exist to keep the app runnable at zero cost.

### 2) System Flow

```text
Browser SPA ──Bearer ID token──▶ [Cloudflare Pages (static) ─▶ Worker /api/* proxy] ─▶ Node host: server.ts
  server.ts (bind PORT/HOST; dev: Vite middleware · prod: static dist/ + shell cache + nonce injection)
    ─▶ server/app.ts createApp() (helmet CSP w/ nonces+hashes · gzip middleware · body limits 256kb/2mb · request-ID pino logging · attachIdentity)
      ─▶ server/core/rateLimit (tier resolve → daily units + 60s burst, Upstash or memory)
        ─▶ server/routes/* (zod-validated handlers; engines route → src/lib/networkSecurity guardedFetch → src/lib/nodeEngines runNativeEngine → target site)
          ─▶ data/integrations (Firestore via firebase-admin · MongoDB time-series · Mailgun · 2Checkout/Dodo · Sentry)
    ─▶ JSON response / SSE stream (/api/v1/audit/master/stream) / prerendered HTML shell / real 404
```

1. **Transport** — `server.ts:38-56`: `initErrorTracking()` + process handlers, async `initAnalyticsDB()` (warns and continues on failure), `createApp()`, `createHttpServer`, PORT/HOST from env (default 3000/0.0.0.0).
2. **HTML delivery (prod)** — `server.ts:58-105`: `.map` files 404'd; `X-Robots-Tag: noindex` on app/auth routes (Plan 7b.2, D11); prerendered-shell fast path keyed by `dist/routes.json` (`server/core/spaRoutes.ts`) with an in-memory shell cache (≤256 entries) and per-request CSP-nonce injection (`injectNonceIntoHtml`, Plan 3.8); legacy `.html` 301s; real 404 from `dist/404.html`.
3. **Security middleware** — `server/app.ts`: helmet CSP with zero `'unsafe-inline'` (startup SHA-256 hashes + per-request nonces), explicit `CSP_IMG_ALLOWLIST`/`CSP_CONNECT_ALLOWLIST` (`server/app.ts:28-62`), custom zero-dependency gzip middleware skipping SSE (`server/app.ts:69-120`), per-route JSON body limits, allowlist-serialized request logging with `x-request-id` (`server/core/logger.ts`), then `attachIdentity` (Firebase Admin `verifyIdToken` → plan/trial/superadmin claim, `src/lib/serverAuth.ts`).
4. **Routing** — `server/app.ts:10-23` registers `register*Routes(app)` modules: telemetry, notifications, stateSync, plans, engines, reports, account, github, system, payments, clientLogs, contact; an API-404 catch-all always answers JSON so the SPA fallback can never shadow `/api/*` (`docs/ARCHITECTURE.md` step 3).
5. **Engine execution** — `server/routes/engines.ts`: zod schema (`engineRunSchema`) → `createEngineRateLimitMiddleware` charges units → `validatePublicUrl`/`guardedFetch` SSRF guard → `runNativeEngine(url, engine)` in `src/lib/nodeEngines.ts` (switch over 8 canonical ids + aliases) → structured report; master audit supports JSON + SSE streaming.
6. **Persistence** — Firestore (`server/core/subscriptions.ts`: webhook-only paid writes, idempotent on gateway event id, D1); MongoDB time-series telemetry (`src/lib/analyticsEngine.ts`, in-memory when `MONGODB_URI` unset); Upstash Redis shared limiter (`server/core/sharedLimiter.ts`, memory fallback).

### 3) Layer/Module Responsibilities

| Layer or module | Owns | Must not own | Evidence |
|-----------------|------|--------------|----------|
| `server.ts` | Process bootstrap, HTTP binding, static/shell serving, nonce injection | Route logic, authz | `server.ts` |
| `server/app.ts` | Middleware composition (CSP, compression, limits, logging, identity), route registration, terminal 404/error handlers | Business logic | `server/app.ts` |
| `server/core/*` | Cross-cutting services: rate limit/quota, engine catalog + zod factory, TLS probe (pinned DNS, port 443 only), subscriptions state machine, API keys, authz, retention, backup/restore, runtime info, error tracking (Sentry), pino logger | Direct HTML serving | `server/core/` listing, `server/core/ssl.ts` per `docs/security/review-2026-10.md` SEC-2026-03 |
| `server/routes/*` | Endpoint handlers per domain, zod validation, HTTP semantics | Trusting client identity headers; granting entitlements (only signed webhooks write paid state, D1) | `server/routes/engines.ts`, `server/core/subscriptions.ts:11-17` |
| `src/lib/nodeEngines.ts` | All audit-engine implementations (single canonical path, D7) | Un-guarded outbound fetches | `docs/ENGINES.md`, `src/lib/nodeEngines.ts:3` |
| `src/lib/networkSecurity.ts` | SSRF guard: scheme allowlist, private/loopback/reserved blocking, single DNS resolution pinned to validated address (anti-rebinding), per-hop redirect revalidation (max 3), 5 MB cap, TLS verify on, 10 s timeout | — | `docs/ENGINES.md` header |
| `src/store/` + `src/context/` | Client state (zustand slices + mongoSync mutation queue; Auth/Subscription/RoleSecurity/Theme contexts) | Entitlement truth (server-derived only; client cache "can never upgrade the displayed entitlement on a failed server write") | `src/store/useAppStore.ts`, README "Security model" |
| `worker/api-proxy.js` | Same-origin `/api/*` forwarding, fail-closed config validation, rightmost-XFF client IP integrity, hop-by-hop stripping, SSE passthrough | Buffering SSE, trusting leftmost XFF, placeholder origins | `worker/api-proxy.js:1-38` |
| `scripts/prerender.ts` | Build-time shells for public routes, `404.html`, `sitemap.xml`, `routes.json`, JSON-LD generated from the same data tables the UI renders (D11/D15) | Prerendering app/auth routes (client-only + noindex) | `scripts/prerender.ts:1-30` |

### 4) Reused Patterns

| Pattern | Where found | Why it exists |
|---------|-------------|---------------|
| Route-module registrar (`register*Routes(app)`) | all 12 `server/routes/*.ts`, wired in `server/app.ts:10-23` | decomposition of a former monolithic `server.ts` (CODE_REVIEW Phase 2) |
| Fail-closed degradation | payments (`503 PAYMENTS_DISABLED`), worker (`503 API_ORIGIN_NOT_CONFIGURED`), github (`503 GITHUB_WEBHOOK_NOT_CONFIGURED`), state sync (401), email (mock mode) | zero-config runnability without opening security holes (README, `docs/security/review-2026-10.md` SEC-2026-07/08) |
| Slice pattern (zustand) | `src/store/slices/{domains,analytics,goals,alerts,audits,preferences}Slice.ts` merged in `useAppStore.ts` + `middleware/mongoSyncMiddleware.ts` | store decomposition (CODE_REVIEW Phase 2 item ⑫) |
| Zod schema factories shared client/server | `src/lib/validation.ts` → `server/core/enginesCatalog.ts` (`engineRunSchemaFactory`) | one schema source for engine runs |
| Lazy route code-splitting | `src/App.tsx` (`React.lazy` for ~30 pages; landing kept synchronous for FCP/LCP) | bundle budget + Core Web Vitals (product is a CWV auditor) |
| Re-export shims | `src/components/telemetry/*.tsx` ↔ root `components/` | ⚠️ accidental-looking split tree; see CONCERNS §2 |
| Decision-tagged comments (`D#`, `Q#`, `Plan x.y`, `SEC-2026-##`) | throughout `server/`, `src/lib/`, `scripts/`, `worker/` | traceability to `docs/plan/decisions.md` owner answers |
| Memory-backed singleton with cloud upgrade | `server/core/sharedLimiter.ts` (Upstash or process memory), `src/lib/analyticsEngine.ts` (Mongo or memory buffer) | zero-cost dev mode; production requires the cloud backend |

### 5) Known Architectural Risks

- **In-memory fallbacks break multi-instance correctness**: rate-limit counters and analytics buffers reset/fragment per process when Upstash/Mongo are unset — README itself says "not acceptable in production"; payments already hard-require Upstash in prod (SEC-2026-08) but rate limiting does not. (`server/core/rateLimit.ts`, README env table)
- ~~**Split component tree**~~ **Resolved 2026-10-21 (Q45):** root `components/` and `types/` consolidated into `src/`; shim web deleted; `tsconfig` `@/*` is single-root (`./src/*`). Verified by `tsc --noEmit` + full suite.
- **Single-process SPOF**: API + SPA + engine execution share one Node process on a free-tier host; long engine scans (10 s timeouts × 8 engines for master audits) compete with request serving; SLO 99.5%/30d with RTO 4 h is documented (`docs/ops/slo.md`, D16) but capacity headroom is unverified at HEAD (load test runs in CI: `.github/workflows/ci.yml` "peak load test").
- ~~**Doc-vs-reality drift**~~ **Resolved 2026-10-21 (Q46):** README and `docs/ARCHITECTURE.md` refreshed to React 19 / Vite 8 / Express 5, `src/lib/nodeEngines.ts` (D7), 36 test files; dead `PRODUCTION_READINESS_AUDIT.md` link replaced with plan/decisions links.
- ~~**Deployment broken at HEAD**~~ **Resolved 2026-10-21 (Q43):** `.nvmrc` (`24`), `package-lock.json` (npm, D6), `.env.staging.example` and `.env.production.example` restored; `npm ci`, `check:env` (CI mode), lint, typecheck, 330-test suite, coverage ratchet, build, bundle budget and the production smoke boot of `dist/server.cjs` all verified green this session.

### 6) Evidence

- `server.ts`, `server/app.ts`, `server/core/` (16 modules), `server/routes/` (12 modules)
- `src/main.tsx`, `src/App.tsx`, `src/store/useAppStore.ts`, `src/lib/{nodeEngines,networkSecurity,serverAuth,analyticsEngine,firebase,webhookService,logger}.ts`
- `worker/api-proxy.js`, `wrangler.toml`, `scripts/prerender.ts`, `public/_headers`, `firestore.rules`
- Narrative docs cross-checked: `docs/ARCHITECTURE.md`, `docs/ENGINES.md`, `docs/ops/runbook.md` (topology diagram), `docs/plan/decisions.md` (D1–D17, Q17–Q52), `docs/security/review-2026-10.md`
- `README.md` ("Architecture", "Security model", env table), `package.json` (actual versions)

## Extended: Deployment Topology (as documented + configured)

```text
Cloudflare zone catalystlab.tech
├─ www.catalystlab.tech  → Cloudflare Pages (dist/, prerendered shells, _headers CSP, _redirects apex→www 301, D14)
├─ catalystlab.tech/api/* & www…/api/* → Worker catalystlab-api-proxy (worker/api-proxy.js; API_ORIGIN via wrangler secret; staging env separate)
└─ API_ORIGIN → Node host (Oracle Always Free 2 OCPU/12GB, Q32; Render Free fallback)
      dist/server.cjs under Docker (Dockerfile) or systemd (ops/systemd/catalystlab.service)
      ├─ Firestore (accounts/subscriptions; nightly backups: .github/workflows/backup.yml + ops/gcloud/setup-firestore-backups.sh; restore drill: scripts/run-restore-drill.ts)
      ├─ MongoDB (telemetry time-series)      ├─ Upstash Redis (shared rate limits)
      └─ Sentry (server errors + relayed client logs)
CI/CD: ci.yml (gates) → deploy.yml (staging auto on main, production manual workflow_dispatch; Pages + Worker + smoke) → rollback.yml
```
Evidence: `wrangler.toml` (routes/envs), `docs/ops/runbook.md` §1, `.github/workflows/{ci,deploy,backup,rollback}.yml`, `Dockerfile`, `ops/systemd/catalystlab.service`.
