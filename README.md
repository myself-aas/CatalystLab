# CatalystLab

Website-quality intelligence platform: a Vite 6 + React 18 SPA with an integrated Express 4 server that runs website-audit **engines** against user-supplied URLs, metered by a tiered rate limiter, with Firebase auth/Firestore on the client, MongoDB analytics, and fail-closed payment-gateway integrations.

> Review remediation status: **Phase 0 ✅ · Phase 1 ✅ · Phase 2 ✅ · Phase 3 ✅** — see [`CODE_REVIEW.md`](./CODE_REVIEW.md) for the historical audit, and [`PRODUCTION_READINESS_AUDIT.md`](./PRODUCTION_READINESS_AUDIT.md) for the current full audit, findings, and phased plan.

> **Current state (2026-10-19):** every gate is green — `npm run check:env`, `npm run lint` (0 problems over `src/`, `server/`, `components/`, `types/`, `scripts/`), `npx tsc --noEmit` (0 errors, `strict: true`), `npm test` (309 passed in 29 files), `npm run test:coverage` (ratchet met), `npm run build` (including the prerender step) and `npm run check:bundle`. CI runs the same set on every PR.

## Quickstart

```bash
npm ci
cp .env.example .env          # all variables optional — every integration fails closed
GITHUB_WEBHOOK_SECRET=dev-secret npm run dev   # Express (port 3000) + Vite middleware
```

- Dev server: `http://localhost:3000` (PORT/HOST honor env — `PORT`/`HOST`).
- Without credentials the app runs in **degraded-but-working mode**: analytics stay in-memory, emails dispatch in Mailgun mock mode, payments return `503 Payments not configured`, and state sync answers `401` until a Firebase service account is configured.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | tsx server.ts (Express + Vite middleware, HMR off for proxy compatibility) |
| `npm run build` | Production bundle to `dist/`, then `scripts/prerender.ts` (74 route shells, `404.html`, `sitemap.xml`, `routes.json`), then esbuild → `dist/server.cjs` |
| `npm test` | Vitest suite (309 tests in 29 files: UI + server route suite) |
| `npm run test:coverage` | Same suite with v8 coverage; global thresholds are the measured baseline (68/55/72/69) and may only be raised |
| `npm run typecheck` | `tsc --noEmit` (hard gate, must stay clean) |
| `npm run lint` | ESLint (0 warnings tolerated) |
| `npm run check:bundle` | Enforce JS bundle-size budgets after `npm run build` |
| `npm run ci` | Full local gate: check:env → lint → typecheck → test → build → bundle budget |
| `npm run ci:full` | `npm run ci` plus the coverage ratchet |
| `npm run lhci` | Lighthouse CI against `./dist` using `.lighthouserc.json` (a11y ≥ 0.9 and best-practices/SEO ≥ 0.85 fail; performance < 0.5 warns) |
| `npm run media:check` | Verify referenced media assets exist |

Every pull request runs the full gate set in [`.github/workflows/ci.yml`](./.github/workflows/ci.yml) on Node 24 (owner answer #8): `npm run ci` (check:env, ESLint over `src/`, `server/`, `components/`, `types/`, `scripts/`, `tsc --noEmit` under `strict: true`, the 309-test suite, the production build including prerender, and the bundle budget), then the coverage ratchet, a production smoke test that boots `dist/server.cjs` and asserts the prerendered shells, the real 404 status, the legacy `.html` 301s and the `501` synthetic endpoints, and `npm run media:check`. A second job runs Lighthouse CI (answer #12). `.github/workflows/media-verify.yml` is kept for media integrity on its own trigger.

## Environment variables

Everything is optional; behavior when unset is listed. See [`.env.example`](./.env.example) for the full list.

| Group | Variables | Unset behavior |
| --- | --- | --- |
| Origin (Q42) | `APP_ORIGIN`, `VITE_APP_ORIGIN` | Canonical origin for canonical/og:url, sitemap and prerendered shells; `check:env` fails without one |
| Signing (Q42) | `JWT_SECRET` / `PAYMENT_SIGNING_SECRET` | `check:env` requires at least one; checkout answers `503` without the gateway secret |
| Quota and rate limits (answer #1) | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Counters live in process memory and reset on restart — not acceptable in production |
| Error tracking (D10) | `SENTRY_DSN`, `SENTRY_ENVIRONMENT`, `SENTRY_TRACES_SAMPLE_RATE` | Sentry off; client errors stay in the pino logs only |
| Firebase Admin (server) | `FIREBASE_SERVICE_ACCOUNT_JSON` / `_PATH` | `/api/state/sync` → `401` for everyone (fail closed) |
| MongoDB | `MONGODB_URI`, `MONGODB_DB_NAME` | Analytics buffer in memory (zero-cost mode) |
| Mailgun | `MAILGUN_*` | Emails dispatch in **mock mode** (logged, never sent) |
| Payments | `V2CHECKOUT_*`, `DODOPAY_*`, `PAYMENTS_WEBHOOK_SECRET*` | Checkout/verify → `503`; webhooks → `401` |
| GitHub webhooks | `GITHUB_WEBHOOK_SECRET` | All webhook deliveries rejected |
| Rate-limit API keys | `VALID_API_KEYS` (comma-separated `cat_live_…`) | `api_pro` tier disabled entirely |
| Logging | `LOG_LEVEL` (`debug`/`info`/`warn`/`error`), `PORT`, `HOST` | `info` in production, `debug` otherwise |

## Architecture

One HTTP server hosts both the Express API and the SPA (static `dist/` in production, Vite middleware in development). In production the server answers a route from its prerendered shell when one exists, serves the app shell for client-only routes, 301s the legacy `.html` aliases and returns a real **404** for everything else (D11/D14).

Production hosting is split (D3 (b), Q31, Q32): the static frontend on Cloudflare Pages, `/api/*` proxied to the Node API host by a Cloudflare Worker route (`worker/api-proxy.js`, `wrangler.toml`), and the API on Oracle Cloud Always Free with Render Free as the documented fallback. SLOs, deploy steps, rollback and incident response are in [`docs/ops/runbook.md`](./docs/ops/runbook.md).

The full diagram and data flows live in [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md); the audit-engine inventory is in [`docs/ENGINES.md`](./docs/ENGINES.md).

```
server.ts                 process entrypoint: HTTP server, Vite/static wiring, PORT/HOST
server/app.ts             createApp(): helmet CSP, body limits, identity, routes, 404/errors
server/core/              logger (pino), rate limiter, engine catalog, SSL probe, runtime
server/routes/            telemetry · stateSync · plans · engines · reports · account ·
                          github · payments · notifications · system · clientLogs
src/lib/serverAuth.ts     Firebase ID-token verification → server-derived identity/tiers
lib/engines/              the actual audit-engine implementations (TypeScript)
src/lib/networkSecurity.ts  SSRF guard: DNS pinning, private-range blocking, size caps
src/                      React SPA (279 files) — pages, components, stores, engines UI
```

## Security model (summary)

- **Identity**: tiers are derived server-side from verified Firebase ID tokens (`firebase-admin`); client headers (`x-user-email`, `subscription-plan`, …) are never trusted. Superadmin requires a signed custom claim.
- **Entitlements**: paid plans and trials are provisioned by the server (`POST /api/v1/users/me/trial`) or signed payment webhooks — never by the browser. Firestore rules permit only `free/active` client writes, and client cached state can never upgrade the displayed entitlement on a failed server write.
- **Payments**: fail closed. `/api/payments/verify` never grants entitlements; webhooks require HMAC-SHA256 over the raw body; missing gateway credentials → `503`.
- **Webhooks**: GitHub deliveries verify `x-hub-signature-256` over the raw body; unknown `repoId`s are rejected, never auto-provisioned. Repo secrets are never echoed back to clients.
- **SSRF**: every engine request goes through the guard — scheme allowlist, private/loophead range blocking, DNS resolution pinned to the validated address (anti-rebinding), response-size caps, TLS verification on.
- **Rate limiting**: per-identity daily unit budgets + 60s burst windows, keyed by server-derived identity; visitor budget 20 units/day, master audit 10 units, single engine 1 unit. The ledger uses Upstash when configured and process memory otherwise (`server/core/rateLimit.ts`, `server/core/dailyQuota.ts`).
- **Secrets hygiene**: the Firebase **web** config (`firebase-applet-config.json`) is public by design — it identifies the Firebase project and is safe to ship in the client bundle. The Admin **service account** is the credential, kept out of Git and provided via `FIREBASE_SERVICE_ACCOUNT_*`. No Sentry DSN or SDK ships to the browser: client errors relay through `POST /api/client-logs` and the server forwards them, scrubbed.

## Observability

- Server: structured pino logs (JSON lines), one line per request with `x-request-id` correlation, credential-header redaction (`LOG_LEVEL` to tune).
- Client: `src/lib/logger.ts` facade — console passthrough in dev; in production, redacted/deduplicated warn/error batches ship to `POST /api/client-logs` (validated, rate-limited) via `sendBeacon`/`fetch keepalive`.

## Testing

```bash
npm test                 # 309 tests in 29 files — UI (jsdom) + server routes (node + supertest)
npm run test:coverage    # coverage ratchet: global thresholds are the measured baseline (see vitest.config.ts)
```

The server suite covers every security-critical flow: payment fail-closed behavior, webhook HMAC verification (valid/forged/unknown), identity-spoof resistance, state-sync auth, SSRF blocking, telemetry schema validation, and the client-log sink.
