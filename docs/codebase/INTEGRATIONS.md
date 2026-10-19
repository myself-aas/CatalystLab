# External Integrations

> Generated 2026-10-14, re-validated 2026-10-19. Inventory built by reading the integration modules and grepping for outbound hosts and `process.env` reads. `[TODO]` = not determinable from the repo; `[ASK USER]` = intent-dependent.

## Core Sections (Required)

### 1) Integration Inventory

| System | Type | Purpose | Auth model | Criticality | Evidence |
|--------|------|---------|------------|-------------|----------|
| Firebase Auth (client) | Identity provider | Sign-in (Google, GitHub, email) in the SPA | Firebase web config (public by design) + ID tokens | High | `src/lib/firebase.ts`, `firebase-applet-config.json`, `README.md` |
| Firebase Admin (server) | Identity verification | Verifies Bearer ID tokens and attaches identity to each request | Service account JSON (`FIREBASE_SERVICE_ACCOUNT_JSON` or `_PATH`, or `GOOGLE_APPLICATION_CREDENTIALS`). Fails closed when absent. | High | `src/lib/serverAuth.ts` |
| Cloud Firestore | Document DB | Client-side data (reports, subscriptions, API keys, contact) | Firestore security rules (`firestore.rules`) | High | `src/lib/firebase.ts`, `firestore.rules` |
| MongoDB | Document DB (time-series) | Telemetry events, state sync documents, analytics queries | `MONGODB_URI` (credentials in URI) | High when set; in-memory fallback otherwise | `src/lib/analyticsEngine.ts`, `server/routes/stateSync.ts`, `server/routes/telemetry.ts` |
| Upstash Redis | Cache / rate-limit store | Optional distributed rate limiter (`120 req / 1 min` sliding window) | REST token (`UPSTASH_REDIS_REST_URL` / `_TOKEN`) | Medium (optional) | `server/core/rateLimit.ts` (`getUpstashLimiter`), `lib/rate-limit.ts` |
| Mailgun | Transactional email API | Weekly digest, anomaly alert, test sends | `MAILGUN_API_KEY` (Basic auth). Endpoint defaults to `api.mailgun.net`, overridable with `MAILGUN_HOST`. Mock mode when unset. | Medium | `src/lib/emailService.ts` (line ~328: `https://${host}/v3/${domain}/messages`) |
| 2Checkout (Verifone) | Payment gateway | Hosted checkout redirect and IPN webhook | `V2CHECKOUT_MERCHANT_CODE` (redirect), `V2CHECKOUT_SECRET_KEY` / `PAYMENTS_WEBHOOK_SECRET_2CHECKOUT` (HMAC) | High | `server/routes/payments.ts`, `src/components/common/PaymentCheckoutModal.tsx` |
| Dodo Payments | Payment gateway | Hosted checkout redirect and webhook | `DODOPAY_API_KEY` (checked for presence only), `DODOPAY_WEBHOOK_SECRET` / `PAYMENTS_WEBHOOK_SECRET_DODOPAY` (HMAC) | High | `server/routes/payments.ts` |
| GitHub | Webhook receiver + SSE stream | Receives push and repo events for connected repos. Streams events to the SPA. | HMAC-SHA256 over raw body (`x-hub-signature-256`) with `GITHUB_WEBHOOK_SECRET`. Unknown `repoId` → 404. | Medium | `server/routes/github.ts`, `src/lib/webhookSecurity.ts` |
| Slack incoming webhooks | Outbound webhook | Notifications and test sends | Webhook URL must start with `https://hooks.slack.com/` | Low | `src/lib/webhookService.ts` (`sendSlackWebhook`), `server/routes/notifications.ts` |
| Discord webhooks | Outbound webhook | Notifications and test sends | URL must *contain* `discord.com/api/webhooks/` (substring `includes` check, **not** a hostname check). Not passed through `validatePublicUrl`. | Low | `src/lib/webhookService.ts` (`sendDiscordWebhook`, line ~192), `server/routes/notifications.ts` |
| Generic HTTPS webhooks | Outbound webhook | Customer-configured HTTP callbacks (HMAC-signed body) | `https://` only; validated by `validatePublicUrl`; superadmin-only route (`requireSuperadminInProduction` is an alias of `requireSuperadmin`, so it applies in every environment except the test-only demo bypass) | Medium | `src/lib/webhookService.ts` (`sendGenericWebhook`), `server/routes/notifications.ts` (`/webhook/dispatch`) |
| Audited target websites | Outbound HTTP (user-supplied URLs) | Subject of every engine scan (health, compliance, latency, etc.) | SSRF guard: scheme allowlist, private-range block, DNS pinning, 5 MB cap, 3 redirect hops re-validated | High (security-critical) | `src/lib/networkSecurity.ts`, `src/lib/nodeEngines.ts` |
| Cloudflare DNS-over-HTTPS | Outbound DNS | TXT/DMARC lookups for the email-security profile | None (public resolver). Domain is user-supplied but URL-encoded. | Low | `src/lib/securityAudit.ts` lines ~177, ~201 |
| crt.sh | Outbound HTTPS (public CT logs) | Passive subdomain enumeration | None | Low | `src/lib/securityAudit.ts` line ~304 |
| Google Fonts / Google APIs | Static/CDN | Fonts and Google scripts allowed by CSP | None | Low | `server/app.ts` (CSP), `index.html` |
| Unsplash / Pexels | Image CDN | Blog and card imagery, validated by a verification script | None (public CDN URLs) | Low | `src/lib/media/registry.ts`, `scripts/verify-media.mjs`, `.github/workflows/media-verify.yml` |
| geoip-lite, ua-parser-js | Local data | IP → geo and UA parsing for telemetry | None (bundled data) | Low | `server/routes/telemetry.ts`, `package.json` |
| Telemetry script (first-party) | Client-to-server | `/api/telemetry.js` served script; events POSTed to `/api/telemetry/event` | Public endpoints, bot-filtered and zod-validated | Medium | `server/routes/telemetry.ts`, `public/telemetry.js` |
| Client error sink | Client-to-server | Redacted warn/error batches to `/api/client-logs` | Public endpoint, rate-limited | Low | `src/lib/logger.ts`, `server/routes/clientLogs.ts` |
| Service worker | Browser cache | Offline asset and telemetry-doc cache | N/A | Low | `public/sw.js`, `src/main.tsx` |

Not found in the repo (checked against `package.json` and grep): no Stripe SDK, no Sentry or other APM SDK, no Kafka or RabbitMQ or SQS client, no Prometheus client. `[TODO]` confirm whether observability is provided by the hosting platform.

### 2) Data Stores

| Store | Role | Access layer | Key risk | Evidence |
|-------|------|--------------|----------|----------|
| MongoDB (optional) | Telemetry time-series, state sync documents | `src/lib/analyticsEngine.ts` (`getDbInstance`, `initAnalyticsDB`) | Unset `MONGODB_URI` silently moves data to memory; no warning in responses | `src/lib/analyticsEngine.ts` lines 41-43 |
| Firestore | Client-written subscriptions, reports, API keys, contact inquiries | `src/lib/firebase.ts` | Client writes depend on rules; default-deny at root | `firestore.rules`, `src/lib/firebase.ts` |
| In-process Maps | Rate-limit ledger, API key store (hashed), connected GitHub repos, throttles, SSE subscribers | `server/core/rateLimit.ts`, `server/core/apiKeys.ts`, `server/routes/github.ts`, `server/routes/clientLogs.ts`, `server/routes/contact.ts` | Lost on restart; not shared across instances. Note: `server/routes/github.ts` seeds a demo repo at startup. | those files |
| Upstash Redis (optional) | Distributed rate limiter | `server/core/rateLimit.ts` | Only the sliding-window limiter is distributed; the daily unit ledger stays in-process `[TODO]` confirm | `server/core/rateLimit.ts` |
| zustand, in memory (client) | Client domains, goals, alerts, audits, preferences, with a Mongo sync middleware. No `persist`/`localStorage` in `src/store/`. | `src/store/useAppStore.ts`, `src/store/middleware/mongoSyncMiddleware.ts` | Sync-conflict policy `[TODO]` confirm | `src/store/` |
| Firebase `firebase-blueprint.json` | Schema blueprint document | Not referenced by code | Could drift from `firestore.rules` `[TODO]` | `firebase-blueprint.json` |

### 3) Secrets and Credentials Handling

- **Credential sources:** environment variables only. `.env.example` and `.env.production.example` are the templates (no values). `.gitignore` excludes `.env` and `.env.*` except the two example files.
- **Hardcoding checks:**
  - No hardcoded API keys were found in `server/` or `src/lib/`.
  - The Discord URL in `src/store/slices/alertsSlice.ts:55` is a placeholder (`000000000000000000/XXXXXXXXXXXXXXXXXXXXXXXX`) in seed data. It is `enabled: false`.
  - `src/lib/firebase.ts` imports `firebase-applet-config.json` (client web config). That is public by design per `README.md`.
  - `server/routes/github.ts` line 24 seeds a demo connected repo with `webhookSecret: process.env.GITHUB_WEBHOOK_SECRET || ''`.
- **Secret echo protection:** webhook secrets are stripped from responses (`toPublicRepo` in `server/routes/github.ts`, the comment cites a Phase 3 finding).
- **Rotation or lifecycle notes:** API key rotation exists (`POST /api/v1/users/me/api-keys/:id/rotate`, `server/routes/account.ts`). Rotation policy for gateway and Mailgun secrets: `[TODO]`/`[ASK USER]`.
- **Legacy key path:** `VALID_API_KEYS` (comma-separated `cat_live_…`) is a fallback allowlist checked with a constant-time comparison (`server/core/apiKeys.ts`, `docs/ARCHITECTURE.md`).

### 4) Reliability and Failure Behavior

- **Retry/backoff behavior:** none found for outbound calls. Single attempt per fetch in `src/lib/emailService.ts`, `src/lib/webhookService.ts`, `src/lib/securityAudit.ts`. `[TODO]` confirm there is no wrapper retry.
- **Timeout policy:**
  - Engine fetches: `HTTP_TIMEOUT_MS = 10000` (`src/lib/nodeEngines.ts`), and `guardedFetch` defaults to 10 s (`src/lib/networkSecurity.ts`). `check-url` uses 4 s.
  - Generic webhook fetch: no explicit timeout found `[TODO]` verify.
  - Mailgun fetch: `[TODO]` not checked.
- **Circuit-breaker or fallback behavior:**
  - Mock or in-memory fallback: Mailgun (`mock: true`), MongoDB (in-memory), Slack non-live URL returns `success: true` without sending (`src/lib/webhookService.ts` line ~140).
  - Payments: 503 when not configured.
  - Circuit breakers: none found.
- **Size limits:** body limits 256 kb default and 2 mb for `POST /api/state/sync` (`server/app.ts`). Client-log payload 64 KB (`docs/ARCHITECTURE.md`). Target response 5 MB (`src/lib/networkSecurity.ts`).

### 5) Observability for Integrations

- **Logging around external calls:** yes for engines, webhook rejects, and the Mongo offline path. Pino logs in `server/core/logger.ts`. Engine failures log with `logger.warn({ err }, '[check-url] blocked or failed')` and similar patterns.
- **Metrics/tracing coverage:** no metrics or tracing SDK in `package.json`. `runtime.totalAuditsExecuted` is an in-process counter (`server/routes/engines.ts`). Exposed at `GET /api/v1/system/health` and `GET /api/monitor/system-health` `[TODO]` confirm exposed fields.
- **Missing visibility gaps:**
  - No per-integration latency or error metrics.
  - Mailgun, Slack, Discord, and generic webhook outcomes are returned to the caller only, not logged centrally `[TODO]` confirm.
  - The telemetry and analytics pipeline has no alerting on Mongo write failures beyond the warn log.

### 6) Evidence

- `src/lib/serverAuth.ts`, `src/lib/firebase.ts`, `firestore.rules`, `firebase-applet-config.json`
- `src/lib/analyticsEngine.ts`, `server/routes/stateSync.ts`, `server/routes/telemetry.ts`
- `server/core/rateLimit.ts` (`getUpstashLimiter`), `lib/rate-limit.ts`
- `src/lib/emailService.ts`, `server/routes/notifications.ts`
- `server/routes/payments.ts`, `src/components/common/PaymentCheckoutModal.tsx`
- `server/routes/github.ts`, `src/lib/webhookSecurity.ts`
- `src/lib/webhookService.ts`, `src/lib/networkSecurity.ts`, `src/lib/nodeEngines.ts`, `src/lib/securityAudit.ts`
- `src/lib/media/registry.ts`, `scripts/verify-media.mjs`, `.github/workflows/media-verify.yml`
- `.env.example`, `.env.production.example`, `.gitignore`, `scripts/check-env.mjs`

## Extended Sections (Optional)

### Outbound SSRF-safety comparison

| Outbound call | Guard | Pinned DNS? | Source |
|---------------|-------|-------------|--------|
| Engine scans of user URLs | `validatePublicUrl` + `guardedFetch` | Yes | `src/lib/networkSecurity.ts` |
| `/api/check-url` | `guardedFetch` (HEAD) | Yes | `server/routes/engines.ts` |
| Generic HTTPS webhook (`/api/notifications/webhook/dispatch`, superadmin-only) | `validatePublicUrl` then plain `fetch` | **No**: DNS is resolved twice (TOCTOU). The comment in `networkSecurity.ts` describes this exact risk. | `src/lib/webhookService.ts` lines ~254-276 |
| Discord webhook (`/api/notifications/webhook/dispatch`, superadmin-only) | Substring `includes('discord.com/api/webhooks/')` only | No guard. A URL such as `https://<other-host>/?discord.com/api/webhooks/…` would pass the check and be POSTed. Impact is limited to superadmins. | `src/lib/webhookService.ts` line ~192, `server/routes/notifications.ts` line ~221 |
| Slack / Discord webhooks | Host-prefix allowlist | Not needed (fixed hosts) | `src/lib/webhookService.ts` |
| cloudflare-dns.com, crt.sh | Fixed hosts | Not needed | `src/lib/securityAudit.ts` |

### Endpoint pointers

- Payments: `POST /api/payments/create-checkout`, `POST /api/payments/webhook/2checkout`, `POST /api/payments/webhook/dodopay`, `POST /api/payments/verify` (always 503).
- GitHub: `POST /api/v1/integrations/github/webhook?repoId=…` (signed), `POST /api/webhooks/github`, SSE `GET /api/v1/integrations/github/events/stream`.
- Notifications: `/api/notifications/email/*`, `/api/notifications/webhook/*`.
