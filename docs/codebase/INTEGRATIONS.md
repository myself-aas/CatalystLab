# External Integrations

> Regenerated 2026-11-12 against branch `arena/b1761471-catalystlab` (`1babd3a`).
> Every integration below is verified in source; unset behaviour is quoted from the code
> path that implements it. Credentials come exclusively from environment variables — no
> secret is committed (confirmed by `npm run sec:secrets`, 650 files in HEAD, 0 secrets).

## Core Sections (Required)

### 1) External APIs and Services

| Service | Direction | Where | Auth | Unset behaviour |
|---|---|---|---|---|
| Firebase Auth (client) | browser → Google | `src/lib/firebase.ts` (`getAuth`, Google/GitHub/email providers) | public web API key in `firebase-applet-config.json` (public by design) | sign-in unavailable; app still renders |
| Firebase Admin / Firestore | server → Google | `src/lib/serverAuth.ts` (`verifyIdToken`, `getAdminFirestore`), `server/core/{subscriptions,apiKeys,retention}.ts` | service-account JSON (`FIREBASE_SERVICE_ACCOUNT_JSON` / `_PATH` / `GOOGLE_APPLICATION_CREDENTIALS`) | verifier `null` → every request treated as unauthenticated (fail closed): state sync `401`, API keys memory-only |
| MongoDB (native driver) | server → Atlas/self-hosted | `src/lib/analyticsEngine.ts` (batched queue, 500/batch), `server/routes/stateSync.ts`, `server/routes/telemetry.ts` | `MONGODB_URI` (+ `MONGODB_DB_NAME`, default `catalyst_analytics`) | console warning, `mode: 'in_memory_fallback'`, zero-cost in-memory buffer |
| Upstash Redis | server → Upstash REST | `server/core/dailyQuota.ts`, `server/core/sharedLimiter.ts`, `server/core/rateLimit.ts` | `UPSTASH_REDIS_REST_URL` + `_TOKEN` | per-process memory ledger; health/quota report `backend: 'memory'`; payments checkout refuses to arm without shared state (Q32) |
| 2Checkout (Verifone) | server ⇄ gateway | `server/routes/payments.ts`, `server/core/subscriptions.ts` (`activeGateway()` defaults to `2checkout`) | `V2CHECKOUT_SECRET_KEY`, `V2CHECKOUT_MERCHANT_CODE`, `V2CHECKOUT_SANDBOX_MODE`, `PAYMENTS_WEBHOOK_SECRET_2CHECKOUT` | checkout `503`; webhooks `401` |
| Dodo Payments | server ⇄ gateway | same modules; **disabled** unless `PAYMENT_GATEWAY=dodopay` (D2) | `DODOPAY_API_KEY`, `DODOPAY_WEBHOOK_SECRET`, `DODOPAY_SANDBOX_MODE` | inactive gateway rejects events |
| Mailgun | server → Mailgun API | `src/lib/emailService.ts` (`MAILGUN_HOST` default `api.mailgun.net`, 10 s timeout) | `MAILGUN_API_KEY` + `MAILGUN_DOMAIN`/`FROM_*` | **mock mode**: logs "[Mailgun Mock Dispatch] … (Mock Mode: MAILGUN_API_KEY not set)" |
| Sentry (`@sentry/node`) | server → Sentry | `server/core/errorTracking.ts` (`initErrorTracking`, `captureException`, process handlers) | `SENTRY_DSN`, `SENTRY_ENVIRONMENT`, `SENTRY_RELEASE`, `SENTRY_TRACES_SAMPLE_RATE` | disabled with a debug log; errors stay in pino JSON |
| GitHub (webhooks in, API out) | bidirectional | `server/routes/github.ts` (HMAC `x-hub-signature-256` over raw body), `src/lib/firebase.ts` repo/telemetry surfaces | `GITHUB_WEBHOOK_SECRET`; `GITHUB_TOKEN` only in CI load-test | deliveries rejected `401`; production returns `503 GITHUB_WEBHOOK_NOT_CONFIGURED`; hard-coded demo repo entries exist only for the non-production demo flag |
| Slack incoming webhooks | server → Slack | `src/lib/webhookService.ts` (`sendSlackWebhook`) | URL host allowlist (`hooks.slack.com/services/...`) | rejected at validation, no dispatch |
| Discord webhooks | server → Discord | `src/lib/webhookService.ts` (`sendDiscordWebhook`) | URL host allowlist (`discord.com|discordapp.com/api/webhooks/...`) | rejected at validation |
| Target websites (audited hosts) | server → arbitrary public host | `src/lib/networkSecurity.ts` `guardedFetch` + `src/lib/nodeEngines.ts` | none; SSRF guard is the control | blocked targets answer `400` "Invalid or forbidden target URL." |
| Google Fonts / gstatic | browser → Google | `index.html` font links; CSP `font-src`/`style-src` allow `fonts.googleapis.com`, `*.gstatic.com` | none | fallback `Inter Fallback` face declared in `src/index.css` (size-adjust 107%) |
| Gemini API | **declared only** | `metadata.json` requests `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API`; `.env.example` lists `GEMINI_API_KEY` | — | **no code reads `GEMINI_API_KEY`** (`grep -rn GEMINI src server scripts worker` → empty). Orphan config; see CONCERNS §2 |
| Image/photo CDNs | browser → remote | `src/lib/media/registry.ts` (Pexels/Unsplash sources with local fallbacks), CSP `img-src` allowlist | none | `npm run media:check` fails when endpoints are unreachable — 5 Pexels entries failed in this sandbox |
| Cloudflare (Pages + Worker + zone) | deploy + edge | `wrangler.toml`, `worker/api-proxy.js`, `public/_redirects`, `public/_headers` | `CLOUDFLARE_API_TOKEN`/`ACCOUNT_ID` (CI secrets), worker secret `API_ORIGIN` | Worker answers `503 API_ORIGIN_NOT_CONFIGURED` instead of forwarding |

### 2) Databases and Data Stores

| Store | Collections / keys | Writer | Notes |
|---|---|---|---|
| Firestore (firebase-admin only for writes that matter) | `user_subscriptions`, `payment_events`, `api_keys`, plus client-owned report/blog/monitored-site docs | `server/core/subscriptions.ts` (transactional, idempotent on gateway event id), `server/core/apiKeys.ts` (SHA-256 hashes only), `server/core/retention.ts` (TTL `expireAt`) | `firestore.rules` is deny-by-default (`match /{document=**} { allow read, write: if false }`) with narrow per-collection grants; superadmin only via custom claim `role == 'superadmin'` or `superadmin == true` |
| MongoDB | telemetry events, analytics aggregates, `state_sync` documents per `ownerId` | `src/lib/analyticsEngine.ts`, `server/routes/stateSync.ts` | owner id always server-derived from the verified token (IDOR-hardened); in-memory fallback |
| Upstash Redis | `catalystlab:quota:<date>:<identifier>` counters with TTL; burst windows | `server/core/dailyQuota.ts`, `server/core/sharedLimiter.ts` | refunds via `decr` when a charge is denied downstream |
| In-process memory | rate-limit records, API-key index, event queue, Mongo fallback | `server/core/rateLimit.ts`, `server/core/apiKeys.ts` | single-instance only; flagged as degraded |
| Browser storage | `localStorage` cached reports (`catalystlab_cached_reports`), Firebase Auth persistence (`persistentLocalCache` + multi-tab manager), service-worker cache `catalystlab-cache-v2.5` | `src/lib/firebase.ts`, `public/sw.js` | documented in `docs/legal` copy and cookie policy |

### 3) Auth and Trust Model

| Control | Implementation | Evidence |
|---|---|---|
| Identity | Bearer Firebase ID token → `verifyIdToken` → `{ uid, email, plan, isTrialActive, isSuperadmin }`; cached verifier | `src/lib/serverAuth.ts` |
| Entitlement truth | custom claims + Firestore `user_subscriptions`; paid writes only from signed webhooks (D1) | `server/core/subscriptions.ts:11-30`, `firestore.rules` |
| API keys | `cat_live_` prefix, SHA-256 hash at rest, scopes `execute:engines` … `manage:webhooks`, Firestore-backed with memory fallback | `server/core/apiKeys.ts` |
| Payments | HMAC-SHA256 over the **raw body** (`express.json({ verify })` keeps `rawBody`); idempotent + monotonic event application; refund revokes to free | `server/app.ts`, `server/core/subscriptions.ts`, `scripts/e2e-payment-sandbox.ts` |
| GitHub webhooks | `x-hub-signature-256` verification; unknown `repoId` rejected, never provisioned | `server/routes/github.ts` |
| SSRF | allowlisted schemes, private/loopback/link-local/CGNAT/metadata blocking, DNS resolution pinned to the validated IP (anti-rebinding), ≤3 redirect hops revalidated, 5 MB cap, TLS verification on, 10 s timeout; TLS probe locked to port 443 | `src/lib/networkSecurity.ts`, `server/core/ssl.ts` |
| Client IP | `TRUST_PROXY=true` → **rightmost** `X-Forwarded-For` entry (Worker appends `cf-connecting-ip`) | `server/core/rateLimit.ts:clientIp`, `worker/api-proxy.js:1-15` |
| CSP | helmet with per-request 128-bit nonce + SHA-256 hashes of built inline blocks; zero `'unsafe-inline'`; explicit `img-src`/`connect-src` allowlists | `server/app.ts:28-62,232-300` |
| Client-header trust | never trusted; `ALLOW_UNAUTH_DEMO` is the only bypass and is `false` in the Docker image | `src/lib/serverAuth.ts`, `Dockerfile` |

### 4) Monitoring and Observability

- **Logs:** pino JSON lines, one per request, `x-request-id` correlation, allowlist request
  (6) and response (7) headers, query redaction (`token`, `api_key`, `signature`, …)
  — `server/core/logger.ts`.
- **Errors:** `@sentry/node` server-side; client errors relay through `POST /api/client-logs` (request-scrubbed, rate-limited) — `src/lib/logger.ts`, `server/routes/clientLogs.ts`.
- **Health:** `GET /api/health` (liveness, `{"status":"ok"}`), `GET /api/v1/system/health`
  (operational detail, deliberately omitting host memory/OS/DB per Plan 3.5),
  `GET /api/v1/system/ready` — all verified 200 in a production boot this session.
- **Alerts/SLOs:** `docs/ops/alerts.yml` (promtool-validated in CI), `docs/ops/slo.md`
  (D16 targets: 99.5% availability, p95 ≤ 75 ms HTML, ≤ 100 ms API, RPO 24 h, RTO 4 h).
- **Load tests:** `ops/loadtest/k6-peak.js` and `scripts/run-loadtest.mjs` (three tiers:
  static, API, engine scan; asserts p95 budgets and 0% 5xx).
- **Post-deploy verification:** `scripts/verify-deployment.mjs` asserts CSP, HSTS,
  nosniff, referrer policy, real 404s, prerendered canonical tags, noindex app shells,
  sourcemap 404, health payload shape, and payments `503`.

### 5) Deployment Integrations

- **Cloudflare Pages** (static `dist/`, `public/_headers`, `public/_redirects`) and
  **Cloudflare Worker** route `www.catalystlab.tech/api/*` (+ staging + apex).
- **Node API host:** Docker image (`node:24-bookworm-slim`, non-root) or
  `ops/systemd/catalystlab.service` (Oracle Always Free; `CPUQuota=200%`, `MemoryMax=10G`,
  `ProtectSystem=strict`, `ExecStartPre=check-env.mjs`).
- **Backups:** `.github/workflows/backup.yml` (daily 02:15 UTC) + `ops/gcloud/setup-firestore-backups.sh`
  (PITR + GCS retention bucket); `npm run drill:restore` proves RTO locally (green this session).
- **CI/CD:** `.github/workflows/ci.yml` (5 jobs), `deploy.yml` (staging on push to `main`,
  production behind a manual owner gate), `rollback.yml`, `media-verify.yml`.

### 6) Evidence

- `src/lib/{firebase,serverAuth,emailService,webhookService,analyticsEngine,networkSecurity}.ts`
- `server/routes/{payments,github,telemetry,stateSync,clientLogs,system,contact,notifications}.ts`
- `server/core/{subscriptions,apiKeys,dailyQuota,sharedLimiter,rateLimit,retention,ssl,errorTracking,logger,backupRestore}.ts`
- `firestore.rules`, `firebase-applet-config.json`, `metadata.json`, `.env.example`, `.env.staging.example`, `.env.production.example`
- `worker/api-proxy.js`, `wrangler.toml`, `public/_headers`, `public/_redirects`, `Dockerfile`, `ops/systemd/catalystlab.service`, `ops/gcloud/setup-firestore-backups.sh`, `docs/ops/alerts.yml`
- `.github/workflows/{ci,deploy,backup,rollback,media-verify}.yml`
- Session output: `npm run sec:secrets`, `npm run drill:restore`, `npm run test:payments-sandbox`, `npm run media:check` (5 unreachable remote endpoints), production boot smoke of `/api/health`, `/api/v1/system/health`, `/api/v1/system/ready`

## Extended Sections (Optional)

### Integration failure posture

| Failing dependency | User-visible result | Auto-recovers? |
|---|---|---|
| Firebase Admin | `/api/state/sync`, `/api/v1/users/me/*` → `401`; API keys memory-only | yes, on next request after fixing credentials |
| MongoDB | telemetry buffered in memory; state sync returns `in_memory_fallback` | yes (batched flush + reconnect attempt) |
| Upstash | per-process quota; `/api/v1/users/me/quota` reports `memory`; checkout blocked (Q32) | yes |
| Mailgun | mail logged only, `202` returned to caller | yes |
| 2Checkout/Dodo | checkout `503`; verification never grants entitlement | yes |
| Sentry | errors only in pino logs | yes |
| Cloudflare Worker `API_ORIGIN` | `/api/*` → `503 API_ORIGIN_NOT_CONFIGURED` | yes, after `wrangler secret put` |
| Remote media CDNs | `media:check` fails; UI falls back to self-hosted plates | yes for UI, no for the gate |
