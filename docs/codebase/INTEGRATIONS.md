# External Integrations

> Regenerated 2026-10-21 by the `acquire-codebase-knowledge` workflow. All rows verified against source at commit `d2c26ef`. Design principle (README): **every integration is optional and fails closed** — unset credentials produce a safe denial or a local in-memory mode, never an open gate.

## Core Sections (Required)

### 1) Integration Inventory

| System | Type | Purpose | Auth model | Criticality | Evidence |
|--------|------|---------|------------|-------------|----------|
| Firebase Auth + Firestore | Auth / DB (BaaS) | Client auth + accounts/state sync; server-side subscriptions & payment events (`user_subscriptions`, `payment_events`) | Client: Firebase web config (`firebase-applet-config.json`, project `catalystlabhub` — public by design). Server: Admin service account via `FIREBASE_SERVICE_ACCOUNT_JSON`/`_PATH` (+`GOOGLE_APPLICATION_CREDENTIALS`); client writes constrained by `firestore.rules` (only `free/active` per README); superadmin = signed custom claim | High — unset ⇒ `/api/state/sync` 401 for everyone | `src/lib/firebase.ts`, `src/lib/serverAuth.ts`, `server/core/subscriptions.ts:1-25`, `firestore.rules`, `.env.example` |
| MongoDB | DB (time-series) | Telemetry/analytics event store; store slices sync target | `MONGODB_URI` + `MONGODB_DB_NAME` connection string | High for analytics; unset ⇒ in-memory buffer ("zero-cost mode") | `src/lib/analyticsEngine.ts`, `src/store/middleware/mongoSyncMiddleware.ts`, README env table |
| Upstash Redis (REST) | Cache / counter store | Shared multi-instance rate-limit + quota ledger | `UPSTASH_REDIS_REST_URL`/`_TOKEN` | High in production (payments **require** it in prod: `503 PAYMENTS_SHARED_STATE_REQUIRED`); unset ⇒ per-process memory counters | `server/core/sharedLimiter.ts`, `server/core/rateLimit.ts`, `docs/security/review-2026-10.md` SEC-2026-08 |
| 2Checkout (Verifone) | Payments gateway | **The single live gateway** (owner decision D2); checkout + signed webhooks | `V2CHECKOUT_MERCHANT_CODE`/`SECRET_KEY`, `V2CHECKOUT_SANDBOX_MODE`; webhook HMAC `PAYMENTS_WEBHOOK_SECRET_2CHECKOUT` over raw body; sandbox vs `secure.2checkout.com` | High for monetization; unset ⇒ checkout/verify 503, webhooks 401 | `server/core/subscriptions.ts:16-25`, `server/routes/payments.ts`, grep: `https://secure.2checkout.com`, `https://sandbox.2checkout.com` |
| Dodo Payments | Payments gateway (dormant) | Kept in code, disabled unless `PAYMENT_GATEWAY=dodopay` (D2) | `DODOPAY_API_KEY`, `DODOPAY_WEBHOOK_SECRET`, `DODOPAY_SANDBOX_MODE`; `test.`/`checkout.dodopayments.com` hosts in code | Low (dormant) | `server/core/subscriptions.ts`, `.env.example`, grep: dodopayments hosts |
| Mailgun | Email API | Transactional email (notifications, contact) | `MAILGUN_API_KEY`/`DOMAIN`/`HOST`/`FROM_*` | Medium; unset ⇒ **mock mode** (logged, never sent) | `src/lib/emailService.ts`, README env table, `.env.example` |
| Sentry (`@sentry/node`) | Error tracking | Server exceptions + relayed, scrubbed client logs; PII scrubbing per D10 | `SENTRY_DSN`/`ENVIRONMENT`/`RELEASE`/`TRACES_SAMPLE_RATE`; **no browser SDK/DSN** — client errors go through `POST /api/client-logs` | Medium; unset ⇒ pino logs only | `server/core/errorTracking.ts`, `server/routes/clientLogs.ts`, README "Observability"/"Secrets hygiene" |
| GitHub | Inbound webhooks + API surface reads | Repo-hygiene/GitLygase flows; deliveries verified via `x-hub-signature-256` HMAC over raw body; unknown `repoId`s rejected, never auto-provisioned | `GITHUB_WEBHOOK_SECRET`; unset ⇒ all deliveries rejected; production disables demo repos (`503 GITHUB_WEBHOOK_NOT_CONFIGURED`) | Medium | `server/routes/github.ts`, README "Security model", SEC-2026-07 |
| Slack / Discord / generic webhooks | Outbound notification fan-out | User-configured alert delivery | Discord: hostname allowlist (`discord.com`/`discordapp.com` incl. canary/ptb); generic: optional `webhookSecret` HMAC; all via SSRF-guarded `guardedFetch` (Q41) | Medium | `src/lib/webhookService.ts:25,165-253`, `server/routes/notifications.ts:4,210-248` |
| Cloudflare Pages + Workers | Hosting / edge proxy | Static frontend (Pages) + same-origin `/api/*` proxy (Worker `catalystlab-api-proxy`, staging/production routes on `catalystlab.tech`) | `API_ORIGIN` via `wrangler secret put` (never in VCS — Blocker #2); fail-closed 503 on empty/placeholder/non-HTTPS | High (deployment path, D3(b)/Q31) | `wrangler.toml`, `worker/api-proxy.js`, `public/_headers`, `public/_redirects`, `.github/workflows/deploy.yml` |
| Oracle Cloud Always Free (Render Free fallback) | API compute | Node host for `dist/server.cjs` (2 OCPU / 12 GB, Q32) | SSH/systemd or Docker; `[TODO: provisioning details live outside repo]` | High | `docs/plan/decisions.md` Q32, `ops/systemd/catalystlab.service`, `Dockerfile`, `docs/ops/runbook.md` §1 |
| Google Cloud (Firestore backups) | Backup storage | Scheduled Firestore export + restore drill | gcloud service account (`ops/gcloud/setup-firestore-backups.sh`, `.github/workflows/backup.yml`) | Medium (RPO 24 h, D16) | `ops/gcloud/`, `.github/workflows/backup.yml`, `scripts/run-restore-drill.ts` |
| Target websites (user-supplied URLs) | Outbound scans | The product's core: engines fetch/analyze arbitrary domains | None — protected by SSRF guard: scheme allowlist, private-range block, DNS-pinned socket (anti-rebinding), redirects revalidated per hop (max 3), 5 MB cap, TLS verify, 10 s timeout; TLS cert probe port 443 only | High (security surface) | `src/lib/networkSecurity.ts`, `src/lib/nodeEngines.ts`, `server/core/ssl.ts`, `docs/ENGINES.md` |
| crt.sh + Cloudflare DoH | Passive recon APIs | Certificate-transparency subdomain discovery + SPF/DMARC TXT lookups inside `securityAudit` engine flows | None (public endpoints) | Low | `src/lib/securityAudit.ts:183,207,308-310` |
| Google Fonts / image CDNs | Static assets | Fonts and stock imagery allowed by CSP (`fonts.googleapis/gstatic`, `images.unsplash.com`, `images.pexels.com`, `cdn.simpleicons.org`, `i.pravatar.cc`, GitHub avatars) | None | Low | `server/app.ts` CSP allowlists, `public/_headers`, 43 `pexels.com` refs in `src/` |
| k6 (load testing) | Perf tooling | Peak-load script asserting D16 p95 SLO in CI | `GITHUB_TOKEN` for reporting | Dev/CI only | `ops/loadtest/k6-peak.js`, `scripts/run-loadtest.mjs`, `.github/workflows/ci.yml` |

### 2) Data Stores

| Store | Role | Access layer | Key risk | Evidence |
|-------|------|--------------|----------|----------|
| Firestore (`catalystlabhub`, database id `ai-studio-catalystlab-3f711290-…`) | Accounts, subscription state, payment events, state sync | Server: `firebase-admin` (`src/lib/serverAuth.ts` `getAdminFirestore`, `server/core/subscriptions.ts`); Client: `src/lib/firebase.ts` under `firestore.rules` | Client rule bypass would allow entitlement writes — mitigated by rules permitting only `free/active` client writes (README) | `firebase-applet-config.json`, `firestore.rules` (13.6 KB) |
| MongoDB time-series | Telemetry events, analytics, report data | `src/lib/analyticsEngine.ts` (`initAnalyticsDB`), queried by `server/routes/telemetry.ts` | In-memory fallback loses data on restart and fragments across instances | `server.ts:42-44`, README env table |
| Upstash Redis | Rate-limit/quota counters (daily units + 60 s bursts) | `server/core/sharedLimiter.ts` → `rateLimit.ts`/`dailyQuota.ts` | Memory fallback resets per process; unacceptable in prod (README's own words) | `server/core/*`, README env table |
| Local filesystem (`dist/`) | Prerendered shells, `routes.json`, static assets | `server.ts` shell cache (≤256 entries; missing-shell set ≤1024) | Cache is per-process; stale after redeploy without restart | `server.ts:74-95` |
| Client zustand + mongoSync queue | Offline mutation buffer synced to server | `src/store/middleware/mongoSyncMiddleware.ts` (`pendingMutations`, `failedMutations`) | Divergence on failed sync; entitlement display can never upgrade on failed server write (README) | `src/store/useAppStore.ts:24-31` |

### 3) Secrets and Credentials Handling

- **Credential sources:** environment only (`.env.example` lists 42 keys — `PORT`/`NODE_ENV` added 2026-10-21; real `.env*` gitignored with explicit `!` exceptions for templates). Worker secret via `wrangler secret put API_ORIGIN`. CI injects a **documented placeholder** service account (`.github/fixtures/ci-service-account.json` — `"private_key": "invalid-ci-placeholder-not-a-key"`, `_note` explains fail-closed behavior) so `check-env.mjs` passes without real credentials.
- **Public-by-design config:** `firebase-applet-config.json` is the Firebase **web** config (identifies the project; safe in client bundle per README "Secrets hygiene"). The empty `recaptchaSiteKey` was investigated (Q51, 2026-10-21): zero consumers repo-wide and not a standard Firebase web-config field ⇒ removed as dead config; reCAPTCHA returns only with a real implementation if bot protection is ever adopted.
- **Hardcoding checks:** `scripts/scan-secrets.mjs` + `.gitleaks.toml` run over working tree **and full git history** in CI (`npm run sec:secrets`); `.semgrep.yml` for static rules. The former hardcoded **dev** Cloud Run URL in `INITIAL_MONITORED_SITES` was fixed 2026-10-21 (Q50): the seed now derives from `SITE_ORIGIN` (`src/config/site.ts`, env-driven per Q42/D14) and probes the real `/api/v1/system/health` endpoint; the stale "8 Python telemetry engines" note was corrected to the D7 TypeScript reality.
- **Rotation/lifecycle:** `docs/security/review-2026-10.md` SEC-2026-01 records a **legacy MongoDB Atlas credential in historical commit `e4bff70`** (absent from HEAD; this clone's history is a single squashed root commit — squash confirmed intentional, Q49). Owner confirmed 2026-10-21 (Q44) they will rotate the Atlas password out-of-band; no repo change required.
- **Log hygiene:** allowlist header serializers + `sanitizeLoggedUrl()` (SEC-2026-04); credential-header redaction in request logs (README "Observability").

### 4) Reliability and Failure Behavior

- **Fail-closed matrix (unset config ⇒):** payments checkout/verify `503`; payment/GitHub webhooks `401`/rejected; state sync `401`; Worker proxy `503 API_ORIGIN_NOT_CONFIGURED`; telemetry limiter still applies (memory); email → mock mode; analytics → memory buffer.
- **Retry/backoff:** payment webhook retry + idempotency exercised by `src/tests/server/paymentWebhookRetry.test.ts` and `scripts/e2e-payment-sandbox.ts` (CI gate); subscription writes idempotent on gateway event id, older events can never overwrite newer state (`server/core/subscriptions.ts:11-17`). Generic outbound retry policy `[TODO: none observed in webhookService]`.
- **Timeout policy:** engine HTTP 10 s (`HTTP_TIMEOUT_MS`, `src/lib/nodeEngines.ts:1`), 5 MB response cap, max 3 redirects; DoH/crt.sh fetches carry their own timeouts in `src/lib/securityAudit.ts`.
- **Circuit breakers/fallbacks:** no formal breaker; degradation modes above + Sentry `installProcessErrorHandlers` (`server.ts:40`); MongoDB-offline graceful degradation in the terminal error handler; SLO/RTO/RPO and incident steps documented in `docs/ops/runbook.md`, `docs/ops/slo.md`, `docs/ops/alerts.yml`, restore drill `docs/ops/drills/restore-drill-2026-10-21.md`.

### 5) Observability for Integrations

- **Logging around external calls:** pino structured logs with `[Tag]` prefixes and `x-request-id` correlation (`server/core/logger.ts`); engine runs and webhook dispatches log outcomes via the same logger (`server/routes/*`).
- **Metrics/tracing:** Sentry tracing sample rate env-controlled (`SENTRY_TRACES_SAMPLE_RATE`); Cloudflare Worker `[observability] enabled = true` (`wrangler.toml`); Lighthouse CI + k6 p95 SLO gate in CI; `scripts/verify-deployment.mjs` post-deploy contract checks; `scripts/report-lhci.mjs`.
- **Client-side:** first-party telemetry (`public/telemetry.js`, `/api/telemetry/event` — zod-validated, bot-filtered, geo/UA-enriched locally with `geoip-lite`+`ua-parser-js`, no third-party analytics per Q27) and the client-log relay.
- **Missing visibility gaps:** no APM/metrics endpoint for the Node host itself beyond `/api/v1/system/health` + `/api/monitor/system-health`; alert routing exists as config (`docs/ops/alerts.yml`) — actual delivery channel `[TODO]`.

### 6) Evidence

- `.env.example` (full key list), `firebase-applet-config.json`, `firestore.rules`, `wrangler.toml`, `public/_headers`
- `server/core/{subscriptions,sharedLimiter,rateLimit,ssl,errorTracking,apiKeys}.ts`, `server/routes/{payments,github,notifications,telemetry,stateSync,clientLogs}.ts`
- `src/lib/{firebase,serverAuth,analyticsEngine,networkSecurity,nodeEngines,securityAudit,webhookService,emailService}.ts`
- `worker/api-proxy.js`, `.github/workflows/{ci,deploy,backup,rollback,media-verify}.yml`, `.github/fixtures/ci-service-account.json`
- `docs/ops/runbook.md`, `docs/security/review-2026-10.md`, `docs/plan/decisions.md` (D1, D2, D9, D10, D16, Q27, Q31, Q32, Q41), README ("Environment variables", "Security model", "Observability")
