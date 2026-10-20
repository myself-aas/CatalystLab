# External Integrations

> Regenerated 2026-10-19 by the `acquire-codebase-knowledge` workflow. Inventory built by reading every integration module and grepping for outbound hosts, `fetch(`/`tls.connect`, and `process.env` reads in this session. `[TODO]` = not determinable. `[ASK USER]` = needs owner intent.

## Core Sections (Required)

### 1) Integration Inventory

| System | Type | Purpose | Auth model | Criticality | Evidence |
|--------|------|---------|------------|-------------|----------|
| Firebase Auth (client SDK) | Identity provider | Sign-in in the SPA; issues the ID tokens the server verifies | Public web config (`firebase-applet-config.json`) + per-user ID tokens | High | `src/lib/firebase.ts`, `lib/firebase.js`, `src/context/AuthContext.tsx` |
| Firebase Admin (server) | Identity verification | `verifyIdToken` + custom-claim superadmin check; **dynamic `import()`**, returns `null` when unconfigured (fail closed) | Service account: `FIREBASE_SERVICE_ACCOUNT_JSON` (raw or base64) → `_PATH` → `GOOGLE_APPLICATION_CREDENTIALS` | High | `src/lib/serverAuth.ts:44-77` |
| Cloud Firestore | Document DB | `user_subscriptions` (server-read for entitlements), reports, API keys, monitored sites, contact, blogs — read/written from the client, plus server-side reads in `serverAuth`/`stateSync` | Client: Firebase Auth + `firestore.rules` (default-deny root, `allow read, write: if false`). Server: service account | High | `src/lib/firebase.ts` (1,898 lines), `firestore.rules`, `src/lib/serverAuth.ts` |
| MongoDB (Atlas per `system.ts` label) | Document DB, time-series | Telemetry events, analytics aggregations, state-sync documents. Optional: falls back to an in-memory buffer | `MONGODB_URI` (+ `MONGODB_DB_NAME`, default `catalyst_analytics`), `retryWrites: true` | High when configured; silent degradation when not | `src/lib/analyticsEngine.ts:1,40-64,114,183-239` |
| Upstash Redis | Distributed limiter (optional) | Sliding-window burst limiter (120 req / 1 m) in `server/core/rateLimit.ts`; a **second**, different Upstash limiter (24 h windows, `TIER_DAILY_LIMITS`) lives in `lib/rate-limit.ts` and is used only by the dormant Next route | `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` | Medium | `server/core/rateLimit.ts:3,70-82,394`; `lib/rate-limit.ts`; `app/api/scan/stream/route.ts:2` |
| Mailgun | Transactional email API | Weekly digest, anomaly alerts, test sends, contact notifications. `POST https://{host}/v3/{domain}/messages` with Basic auth; **mock mode** when the key is missing or literally `YOUR_MAILGUN_API_KEY` | `MAILGUN_API_KEY` (+ `MAILGUN_DOMAIN` default `mg.catalystlab.tech`, `MAILGUN_HOST` default `api.mailgun.net`) | Medium | `src/lib/emailService.ts:48-54,296-345`, `server/routes/notifications.ts`, `server/routes/contact.ts` |
| 2Checkout (Verifone) | Payment gateway | Checkout **URL construction only** — no gateway API call. Sandbox vs live host chosen by `V2CHECKOUT_SANDBOX_MODE !== 'false'`; 503 when `V2CHECKOUT_MERCHANT_CODE` is absent. Owner decision D2: 2Checkout is the single live gateway | `V2CHECKOUT_MERCHANT_CODE`, `V2CHECKOUT_SECRET_KEY`; inbound webhook HMAC via `x-signature-256` | High (revenue) | `server/routes/payments.ts` |
| Dodo Payments | Payment gateway (backup) | Same shape as 2Checkout; **still selectable at runtime** by the client via `gateway: 'dodopay'` in the request body, which contradicts D2 ("Dodo stays in code, disabled until needed") | `DODOPAY_API_KEY`, `DODOPAY_WEBHOOK_SECRET` | Medium | `server/routes/payments.ts` (`gateway === 'dodopay' ? …`) |
| GitHub | Inbound webhooks only | `POST /api/v1/integrations/github/webhook?repoId=…` and `/api/webhooks/github`; HMAC-SHA256 over the raw body; unknown `repoId` → rejected, never auto-provisioned; repo secrets never echoed (`toPublicRepo`). **No outbound `api.github.com` call exists** (grep: 0 hits in `server/`, `src/`, `api/`) | `GITHUB_WEBHOOK_SECRET` (the seeded demo repo defaults to `''`, which rejects everything) | Medium | `server/routes/github.ts:16-24`, `src/lib/webhookSecurity.ts` |
| Slack webhooks | Outbound webhook | Notification fan-out + test send. Prefix-allowlisted to `https://hooks.slack.com/`; a non-live URL returns `success: true` **without sending** | None (the URL is the secret) | Low | `src/lib/webhookService.ts:138-188` |
| Discord webhooks | Outbound webhook | Same fan-out. Guard is `webhookUrl.includes('discord.com/api/webhooks/')` — a **substring** test, not a hostname parse, and no `validatePublicUrl` | None | Low (superadmin-only route) | `src/lib/webhookService.ts:190-192`, `server/routes/notifications.ts` |
| Generic HTTPS webhooks | Outbound webhook | Customer callbacks with an optional `X-Catalyst-Signature: sha256=…` HMAC of the body. `https://` required, `validatePublicUrl` applied, then a **plain `fetch`** | Optional shared `webhookSecret`; route is superadmin-gated | Medium | `src/lib/webhookService.ts:242-315`, `server/routes/notifications.ts:210-235` |
| Audited target websites | Outbound HTTP(S), user-supplied URLs | The subject of every engine scan and probe | SSRF guard: scheme allowlist, `isPrivateIp`, DNS resolve → validate → **socket pinning**, per-hop redirect revalidation (≤3), 5 MB cap, TLS verification on | High (security-critical) | `src/lib/networkSecurity.ts:15,68,186-317`, `src/lib/nodeEngines.ts` (10 `guardedFetch` call sites) |
| Target hosts over raw TLS | Outbound TCP (`tls.connect`) | Certificate validity / days-remaining for `health` and `/api/monitor/probe` | None. **Not pinned**: connects by hostname with an attacker-influenced port (4 s / 4.5 s socket timeout) | Medium (security) | `server/core/ssl.ts:6-22` (called from `server/routes/engines.ts:156`), `src/lib/securityAudit.ts:16-30` (called from `:242`) |
| Cloudflare DNS-over-HTTPS | Outbound DNS | SPF/TXT and `_dmarc` lookups for the email-security profile; domain is URL-encoded; `AbortSignal.timeout(3000)` | None (public resolver) | Low | `src/lib/securityAudit.ts:177-203` |
| crt.sh | Outbound HTTPS (CT logs) | Passive subdomain enumeration; `AbortSignal.timeout(3500)`; discloses the submitted domain name (documented in the privacy copy) | None | Low | `src/lib/securityAudit.ts:302-334`, `src/legal/privacy.ts:234,252` |
| The Green Web Foundation | Outbound HTTPS | `GET https://api.thegreenwebfoundation.org/greencheck/{hostname}` for the carbon engine — **only in the dormant `lib/engines/` path** | None | Low | `lib/engines/eco-carbon.ts:64` |
| Google Fonts / Google APIs / gstatic | CDN | Webfonts (`index.html` `<link>`), Google auth scripts allowed by CSP | None | Low | `index.html`, `server/app.ts` CSP |
| Unsplash / Pexels | Image + video CDN | Blog/card imagery from a 1,006-line media registry; `npm run media:check` hits the live endpoints and is the **only** CI job | None (public URLs) | Low | `src/lib/media/registry.ts`, `scripts/verify-media.mjs`, `.github/workflows/media-verify.yml`, `next.config.ts` (vestigial `remotePatterns`) |
| geoip-lite, ua-parser-js | Bundled local data | IP → geo and UA parsing for telemetry enrichment; **no external call** | None | Low | `server/routes/telemetry.ts`, `package.json` |
| First-party telemetry script | Client → server | `telemetry.js` served on 5 path aliases; events POSTed to 4 aliases | Public; UA bot/prefetch filter + zod schema | Medium | `server/routes/telemetry.ts:30-34,47-49,166-169`, `public/telemetry.js` |
| Client error sink | Client → server | Redacted warn/error batches → `POST /api/client-logs` (64 KB body cap, ≤25 events, 30 req/5 min) | Public, rate-limited per identity/IP | Low | `src/lib/logger.ts`, `server/routes/clientLogs.ts:11-51` |
| Service worker | Browser cache | Precache of static assets + telemetry docs; cache-first for `/assets/*`, network-first otherwise; registered only in production | N/A | Low | `public/sw.js`, `src/main.tsx`, `docs/audit/perf-rendering-2026-10/05-remediation.md` D4 |
| Google Cloud Run (hard-coded) | Monitoring seed | `INITIAL_MONITORED_SITES` seeds `https://ais-dev-2z7dtoomnl7nm53osnbyys-329537149747.asia-east1.run.app/api/health` with the note "Edge API gateway hosting 8 Python telemetry engines" — contradicted by `docs/ENGINES.md` (no Python engine is loaded) | None | Low (stale data) | `src/lib/firebase.ts:777-793` |

**Verified absent** (checked against `package.json` and grep): no Stripe SDK, no Sentry/APM/OpenTelemetry SDK (owner decision D10 chose Sentry — not yet added), no Kafka/RabbitMQ/SQS/Pub-Sub client, no Prometheus client, no outbound GitHub/Slack/Discord *API* clients (webhook URLs only).

### 2) Data Stores

| Store | Role | Access layer | Key risk | Evidence |
|-------|------|--------------|----------|----------|
| MongoDB (optional) | Telemetry time-series, analytics aggregations, state-sync documents | `src/lib/analyticsEngine.ts` (`initAnalyticsDB`, `getDbInstance`, `queueEvent`, `flushQueue`, `checkMongoDBHealth`) | Unset `MONGODB_URI` silently switches to in-memory ("zero-cost mode") with no signal in API responses; buffered events are lost on restart | `src/lib/analyticsEngine.ts:41-43,114,183-239` |
| Firestore | Client-written subscriptions, reports, API keys, monitored sites, contact, blogs; server-read for entitlements | `src/lib/firebase.ts` (client), `src/lib/serverAuth.ts` + `server/routes/stateSync.ts` (server) | Client writes are only as safe as `firestore.rules`; default-deny root with per-collection allow rules; the seeded `INITIAL_MONITORED_SITES` record ships in code | `firestore.rules`, `src/lib/firebase.ts:777-793` |
| In-process `Map`s | Rate-limit daily ledger, hashed API-key store (`byHash`/`byId`), connected GitHub repos, GitHub SSE subscribers, client-log and contact throttles | `server/core/rateLimit.ts:43`, `server/core/apiKeys.ts`, `server/routes/github.ts:15-16`, `server/routes/clientLogs.ts:30`, `server/routes/contact.ts` | Lost on restart; not shared across instances; only the rate-limit ledger has a cleanup `setInterval` (hourly, `:421-425`) | those files |
| Upstash Redis (optional) | Distributed **burst** limiting only | `server/core/rateLimit.ts:71-82` | The daily unit ledger stays in-process even when Upstash is configured `[verified: only `Ratelimit.slidingWindow(120,'1 m')` is constructed]` | `server/core/rateLimit.ts` |
| zustand (client, in-memory) | Domains, analytics, goals, alerts, audits, preferences + `mongoSyncMiddleware` optimistic queues | `src/store/useAppStore.ts`, `src/store/slices/*`, `src/store/middleware/mongoSyncMiddleware.ts` | No `persist`/localStorage in `src/store/`; conflict policy on failed sync `[TODO]` | `src/store/` |
| localStorage (client) | Theme preference (`catalystlab_theme_preference`, read by the inline bootstrap in `index.html`) and rate-limit display counters (`catalyst_rate_limit_<date>_<uid\|visitor>`) | `index.html`, `src/utils/rateLimiter.ts:22` | Client-side quota counters are advisory only — the server ledger is authoritative | those files |
| `firebase-blueprint.json` | Schema blueprint document (14 KB) | **No code reference found** | Can drift from `firestore.rules` with nothing to catch it `[TODO]` | `grep -rn firebase-blueprint src server lib` → 0 hits |

### 3) Secrets and Credentials Handling

- **Sources:** environment variables only. `.env.example` (26 empty keys) and `.env.production.example` (annotated, splits REQUIRED from optional). `scripts/check-env.mjs` loads `.env.production.local` → `.env.production` → `.env.local` → `.env`, and hard-fails in production/CI on `FIREBASE_SERVICE_ACCOUNT_JSON|_PATH` and `APP_ORIGIN|VITE_APP_ORIGIN`.
- **Git hygiene:** `.gitignore` excludes `.env` and `.env.*`, re-including only the two templates. No committed `.env` file exists.
- **Hardcoding checks (this session):**
  - No API keys or tokens hardcoded in `server/` or `src/lib/`.
  - `firebase-applet-config.json` is committed — public **web** config by design (`README.md` "Secrets hygiene"); the Admin service account is the real credential and is not in Git.
  - `src/lib/firebase.ts:781` hardcodes a Google Cloud Run hostname in seed data (not a secret, but an environment-specific value).
  - `server/routes/github.ts:24` seeds a connected repo with `webhookSecret: process.env.GITHUB_WEBHOOK_SECRET || ''`.
  - `src/store/slices/alertsSlice.ts:55` seeds a placeholder Discord URL (`…/000000000000000000/XXXX…`).
  - `server/routes/payments.ts` hardcodes the price table (`pricingMap`) rather than reading `src/data/pricingData.ts`.
- **Secret echo protection:** GitHub repo secrets are stripped before responses (`toPublicRepo`); `/api/v1/system/health` masks the Mongo URI (`uriMasked`); pino redacts credential headers (`server/core/logger.ts` `REDACT_PATHS`).
- **Signature verification:** `verifyHmacSha256` uses `timingSafeEqual` over the **raw body** captured by the body parser's `verify` hook (`server/app.ts`); legacy `VALID_API_KEYS` uses a constant-time compare (`server/core/apiKeys.ts`).
- **Rotation:** user API keys support create/list/delete/rotate (`server/routes/account.ts` `/api/v1/users/me/api-keys*`). Rotation/lifecycle for gateway, Mailgun, and Firebase credentials: `[TODO]` — nothing in the repo defines a rotation period or procedure.

### 4) Reliability and Failure Behavior

- **Retry/backoff:** none for outbound HTTP. Only `retryWrites: true` on the Mongo client (`src/lib/analyticsEngine.ts:57`). Mailgun, Slack/Discord/generic webhooks, crt.sh, DoH, and the Green Web Foundation are all single-attempt.
- **Timeout policy (measured from source):**

| Call | Timeout | Evidence |
|---|---|---|
| Engine HTTP fetches | `HTTP_TIMEOUT_MS = 10000`; `guardedFetch` default 10 s | `src/lib/nodeEngines.ts`, `src/lib/networkSecurity.ts` |
| `/api/check-url` HEAD | 4 s | `server/routes/engines.ts:49` |
| `/api/monitor/probe` fetch | 10 s, body cap 1 MB | `server/routes/engines.ts:167-171` |
| TLS certificate probe | 4 s socket timeout (`server/core/ssl.ts`), 4.5 s (`securityAudit.ts`) | those files |
| DoH / crt.sh | `AbortSignal.timeout(3000)` / `(3500)` | `src/lib/securityAudit.ts:179,203,306` |
| **Mailgun send** | **none** — plain `fetch`, no `signal` | `src/lib/emailService.ts:332-339` |
| **Slack / Discord / generic webhook** | **none** — plain `fetch`, no `signal` | `src/lib/webhookService.ts:152,204,301` |

- **Circuit breakers:** none. Fallbacks are per-integration and static: Mailgun → `{ mock: true }`; Mongo → in-memory buffer; Firebase Admin → anonymous identity + 401 on state sync; payments → 503; Upstash → in-process window; Slack → `success: true` without sending when the URL is not a live `hooks.slack.com` URL.
- **Size limits:** request bodies 256 KB default / 2 MB for `POST /api/state/sync`; client logs 64 KB; audited-target responses 5 MB (`DEFAULT_MAX_BYTES`) or 1 MB for probes; Firestore rules cap `output` at 500,000 chars and `content` at 50,000.
- **Error surfacing:** several handlers return `err.message` verbatim to clients (`server/routes/payments.ts` 500s, `server/routes/notifications.ts`), which can leak internals.

### 5) Observability for Integrations

- **Logging around external calls:** partial. Pino logs webhook rejections (`[2Checkout Webhook] Rejected`, `[DodoPay Webhook Rejected]`), blocked probes (`[check-url] blocked or failed`), engine failures, Mongo-offline degradation, and one structured line per request with `requestId`, `durationMs`, status, and the derived identity tier. Mailgun sends log only in **mock** mode (`console.log`, not pino).
- **Metrics/tracing:** no metrics or tracing SDK. The only counters are in-process: `runtime.totalAuditsExecuted` and `runtime.serverStartTime` (`server/core/runtime.ts`, 7 lines), exposed publicly by `GET /api/v1/system/health` together with RSS/heap, `nodeVersion`, `platform`, and Mongo status; `getBatchMetrics()` is exposed by `GET /api/v1/database/mongodb/status`. Neither requires identity.
  - Note: `/api/v1/system/health` reports `activeEnginesCount: Object.keys(ENGINE_SCRIPT_MAP).length` = **16**, because the map holds 8 engines × 2 aliases — the public number overstates the engine count.
- **Client-side observability:** the `src/lib/logger.ts` → `/api/client-logs` pipeline (redacted, deduplicated, capped) plus `ErrorBoundary` and global `error`/`unhandledrejection` hooks.
- **Missing visibility gaps:**
  - No per-integration latency/error metrics or dashboards; no alerting when Mongo writes fail (warn log only) or when the process is in in-memory/mock mode.
  - Mailgun and webhook outcomes are returned to the caller but not centrally logged.
  - No error tracker (owner decision D10 = Sentry with PII scrubbing — not implemented; no dependency, no config).
  - No distributed tracing across the SSRF-guarded outbound calls, so a slow target cannot be attributed per engine in production.
  - `[ASK USER]` #1 (deployment shape): whether the chosen host (Oracle Always Free / Render Free per Q32, Cloudflare Pages for static) provides platform-level observability that should be documented here. `[TODO]`

### 6) Evidence

- `src/lib/serverAuth.ts`, `src/lib/firebase.ts`, `lib/firebase.js`, `firestore.rules`, `firebase-applet-config.json`, `firebase-blueprint.json`
- `src/lib/analyticsEngine.ts`, `server/routes/stateSync.ts`, `server/routes/telemetry.ts`, `server/routes/system.ts`
- `server/core/rateLimit.ts`, `server/core/apiKeys.ts`, `server/core/ssl.ts`, `lib/rate-limit.ts`, `src/utils/rateLimiter.ts`
- `src/lib/emailService.ts`, `src/lib/webhookService.ts`, `src/lib/webhookSecurity.ts`, `server/routes/notifications.ts`, `server/routes/contact.ts`
- `server/routes/payments.ts`, `server/routes/github.ts`, `server/routes/engines.ts`, `src/data/pricingData.ts`
- `src/lib/networkSecurity.ts`, `src/lib/nodeEngines.ts`, `src/lib/securityAudit.ts`, `lib/engines/eco-carbon.ts`
- `src/lib/media/registry.ts`, `scripts/verify-media.mjs`, `.github/workflows/media-verify.yml`, `public/sw.js`, `public/telemetry.js`
- `.env.example`, `.env.production.example`, `.gitignore`, `scripts/check-env.mjs`
- Outbound-host census: `grep -rhoE "https?://[a-zA-Z0-9._-]+" server/ src/lib/ lib/` (this session)
- `docs/plan/decisions.md` (D1, D2, D3, D9, D10, Q31, Q32, Q41, Q42), `src/legal/privacy.ts:234,252` (third-party disclosure copy)

## Extended Sections (Optional)

### Outbound SSRF-safety comparison

| Outbound call | Guard | DNS pinned? | Evidence |
|---|---|---|---|
| Engine scans of user URLs | `validatePublicUrl` + `guardedFetch` | **Yes** (custom `lookup` returns the validated IP) | `src/lib/networkSecurity.ts:186-317` |
| `/api/check-url` | `guardedFetch` HEAD, 4 s | Yes | `server/routes/engines.ts:49` |
| `/api/monitor/probe` HTTP fetch | `validatePublicUrl` then `guardedFetch` | Yes | `server/routes/engines.ts:145-171` |
| `/api/monitor/probe` **TLS certificate check** | Runs *after* `validatePublicUrl`, but `tls.connect({ host: hostname, port })` resolves DNS again and takes the port from the user URL | **No** | `server/routes/engines.ts:156`, `server/core/ssl.ts:16-22` |
| Engine SSL/CT/DoH lookups (`securityAudit.ts`) | Domain string is cleaned and URL-encoded; hosts are fixed (`cloudflare-dns.com`, `crt.sh`) — but `getSslCertificateInfo` `tls.connect`s to the **user-supplied** hostname | No (fixed hosts don't need it; the TLS probe does) | `src/lib/securityAudit.ts:16-30,177-203,242,302-334` |
| Generic webhook (superadmin-only) | `validatePublicUrl`, then plain `fetch` | **No** — TOCTOU rebinding window. Owner decision Q41 accepted using `guardedFetch`; not applied | `src/lib/webhookService.ts:253-254,301` |
| Discord webhook (superadmin-only) | Substring `includes('discord.com/api/webhooks/')` only | **No guard at all.** `https://other-host/?discord.com/api/webhooks/…` passes. Q41 also required hostname parsing; not applied | `src/lib/webhookService.ts:190-192` |
| Slack webhook | `startsWith('https://hooks.slack.com/')` prefix check | Not needed (fixed host, correct check shape) | `src/lib/webhookService.ts:140` |
| Mailgun | Host from `MAILGUN_HOST` (default `api.mailgun.net`), key from env | Not needed (operator-controlled) | `src/lib/emailService.ts:48-54,328` |

### Synthetic / demo endpoints on the public v1 API

`server/routes/reports.ts` serves **hard-coded data** with no store behind it:

| Endpoint | Behaviour |
|---|---|
| `GET /api/v1/reports` | 3 fixed sample reports (`example.com`, `react.dev`, `github.com`), filterable by `search` |
| `GET /api/v1/reports/permalink/:slug` | Fabricates a dossier from the slug: `url = 'https://' + slug.replace(/-/g,'.')`, summary "Passed 48 quality assertions", `createdAt: Date.now()` |
| `POST /api/v1/reports/:id/export` | Returns a markdown stub that itself says "Live engine scores are not synthesized by this export endpoint" |
| `GET /api/v1/blogs` | 3 fixed articles (while `src/data/engineBlogs.ts` holds 10 slugs) |
| `GET /api/v1/blogs/:slug` | Same generic "Technical Research Dossier" body for **any** slug |

None of these is identity-gated or rate-limited. `[ASK USER]` #3 — keep as demo surfaces, wire them to Firestore/Mongo, or remove them before launch.

### Endpoint pointers (by integration)

- **Payments:** `POST /api/payments/create-checkout`, `POST /api/payments/webhook/2checkout`, `POST /api/payments/webhook/dodopay`, `POST /api/payments/verify` (always 503)
- **GitHub:** `POST /api/v1/integrations/github/webhook?repoId=…`, `POST /api/webhooks/github`, `GET/POST/DELETE /api/v1/integrations/github/repos*`, `GET /api/v1/integrations/github/events`, SSE `GET /api/v1/integrations/github/events/stream`
- **Email/webhooks:** `POST /api/notifications/email/{send-test,weekly-digest,anomaly-alert}`, `GET /api/notifications/email/preview-html`, `POST /api/notifications/webhook/{dispatch,test-slack,test-discord}`
- **Telemetry:** ingest `POST /api/telemetry/event` | `/api/event` | `/stats/event` | `/api/stats/event`; script `GET /telemetry.js` | `/js/telemetry.js` | `/stats/js` | `/stats/script.js` | `/api/telemetry.js`; reads `GET /api/analytics/{stats,realtime}`, `POST /api/analytics/anomalies/check` (superadmin)
- **System:** `GET /api/v1/system/health`, `GET /api/v1/database/mongodb/status`, `POST /api/v1/system/probe`, `GET /api/v1/openapi.json`, `GET /api/health`, `GET /api/monitor/system-health`


## Corrections after the 2026-10-19 implementation pass

- **API keys are not in memory.** `server/core/apiKeys.ts` persists hashed keys
  (SHA-256) in **Firestore** and keeps a loaded index in process memory for
  request-time lookups, so keys survive restarts. The earlier "in-memory only"
  description was wrong.
- **Quota and rate limits** use Upstash Redis when `UPSTASH_REDIS_REST_URL` /
  `_TOKEN` are set (`server/core/dailyQuota.ts`, `server/core/rateLimit.ts`), and
  fall back to per-process counters otherwise.
- **Payments** are implemented: `server/core/pricing.ts`,
  `server/core/subscriptions.ts` and `server/routes/payments.ts` create checkout
  sessions and apply verified webhook events for 2Checkout and Dodo Payments
  (`PAYMENT_GATEWAY`).
- **Retention** is enforced: `server/core/retention.ts` creates a 730-day TTL
  index and sweeps per-plan telemetry, 365-day contact messages and 730-day
  payment events (D9 + answer #2).
- **Error tracking** is Sentry through `server/core/errorTracking.ts`, disabled
  unless `SENTRY_DSN` is set (D10); browser errors relay via
  `POST /api/client-logs`.
- **Hosting** is split (D3): Cloudflare Pages serves `dist/`, a Cloudflare
  Worker route (`worker/api-proxy.js`) proxies `/api/*` to the Node host, which
  runs on Oracle Cloud Always Free (Q32).
- New integration surface: `public/_redirects` and `public/_headers` configure
  Pages; `wrangler.toml` configures the Worker.
