# CatalystLab

Website-quality intelligence platform: a Vite 8 + React 19 SPA with an integrated Express 5 server that runs website-audit **engines** against user-supplied URLs, metered by a tiered rate limiter, with Firebase auth/Firestore on the client, MongoDB analytics, and fail-closed payment-gateway integrations.

> Review remediation status: **Phase 0 ✅ · Phase 1 ✅ · Phase 2 ✅ · Phase 3 ✅** — see [`CODE_REVIEW.md`](./CODE_REVIEW.md) for the historical audit, [`docs/plan/production-readiness-plan.md`](./docs/plan/production-readiness-plan.md) for the phased plan, and [`docs/plan/decisions.md`](./docs/plan/decisions.md) for the owner decision log (D1–D17, Q17–Q52). Repository-level knowledge docs live in [`docs/codebase/`](./docs/codebase/); the full documentation index — living specs vs dated records — is [`docs/README.md`](./docs/README.md).

> **Current state (2026-10-21):** every local gate re-verified green after the pipeline restore — `npm run check:env` (42 parity-verified keys across `.env.example` / `.env.staging.example` / `.env.production.example`, including `PORT`/`NODE_ENV` added 2026-10-21), `npm run lint` (0 problems over `src/`, `server/`, `server.ts`), `npx tsc --noEmit` (0 errors, `strict: true`), `npm test` (330 passed in 36 files), `npm run test:coverage` (ratchet met for `server/**`), `npm run build` (including the prerender step), `npm run check:bundle` (all six budgets pass), a production smoke boot of `dist/server.cjs` (prerendered shells, legacy `.html` 301s, real 404s, zero-`unsafe-inline` CSP, fail-closed payments `503`, `verify-deployment.mjs` contracts) and the Python tooling gates (32 pytest + ruff + mypy strict + black). Runs executed on Node v22.22.3 in the working sandbox; declared runtime is Node 24 (`.nvmrc`, D5). CI runs the same set plus gitleaks/semgrep/Docker/k6/Playwright/Lighthouse on every PR.

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
| `npm run build` | Production bundle to `dist/`, then `scripts/prerender.ts` (65 route shells, `404.html`, `sitemap.xml` index plus `sitemap-core|engines|docs|blog.xml`, `routes.json`), then esbuild → `dist/server.cjs` |
| `npm test` | Vitest suite (36 test files: UI (jsdom) + server route suite (node + supertest) + unit) |
| `npm run test:coverage` | Same suite with v8 coverage; global thresholds are the measured baseline (68/55/72/69) and may only be raised |
| `npm run typecheck` | `tsc --noEmit` (hard gate, must stay clean) |
| `npm run lint` | ESLint (0 warnings tolerated) |
| `npm run check:bundle` | Enforce JS bundle-size budgets after `npm run build` |
| `npm run ci` | Full local gate: check:env → lint → typecheck → test → build → bundle budget |
| `npm run ci:full` | `npm run ci` plus the coverage ratchet |
| `npm run lhci` | Lighthouse CI against `./dist` using `.lighthouserc.json` (a11y ≥ 0.9 and best-practices/SEO ≥ 0.85 fail; performance < 0.5 warns) |
| `npm run media:check` | Verify referenced media assets exist |

Every pull request runs the full gate set in [`.github/workflows/ci.yml`](./.github/workflows/ci.yml) on Node 24 (`.nvmrc`, owner answer #8 / D5) across five jobs: **gates** — `npm run ci` (check:env incl. the three-template env parity gate, ESLint over `src/`, `server/` and `server.ts`, `tsc --noEmit` under `strict: true`, the Vitest suite, the production build including prerender, and the bundle budget), then the coverage ratchet, `npm audit --audit-level=low`, the backup/restore drill, the payment sandbox e2e, the working-tree + history secret audit, the k6 peak-load SLO check, a production smoke test that boots `dist/server.cjs` and asserts the prerendered shells, the real 404 status, the legacy `.html` 301s and the `501` synthetic endpoints, and `npm run media:check`; **security-and-container** — gitleaks full-history scan, semgrep SAST, promtool validation of `docs/ops/alerts.yml`, and a Docker build asserting the non-root runtime + live health/contract probes; **e2e-chromium** — the Playwright zero-CSP-violation smoke; **lighthouse** — Lighthouse CI against the running production server (answer #12, D17); **python-tooling** — pytest/ruff/mypy/black over `scripts/replace_images.py`. `.github/workflows/media-verify.yml` is kept for media integrity on its own trigger.

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
                          github · payments · notifications · system · clientLogs · contact
src/lib/serverAuth.ts     Firebase ID-token verification → server-derived identity/tiers
src/lib/nodeEngines.ts    the canonical audit-engine implementations (TypeScript, D7)
src/lib/networkSecurity.ts  SSRF guard: DNS pinning, private-range blocking, size caps
src/                      React SPA — pages, components (incl. types/ + telemetry UI), stores
worker/api-proxy.js       Cloudflare Worker: same-origin /api/* proxy (split hosting, Q31)
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
npm test                 # 36 test files — UI (jsdom) + server routes (node + supertest) + unit
npm run test:coverage    # coverage ratchet: global thresholds are the measured baseline (see vitest.config.ts)
```

The server suite covers every security-critical flow: payment fail-closed behavior, webhook HMAC verification (valid/forged/unknown), identity-spoof resistance, state-sync auth, SSRF blocking, telemetry schema validation, and the client-log sink.
