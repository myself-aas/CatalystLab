# CatalystLab

Website-quality intelligence platform: a Vite 6 + React 18 SPA with an integrated Express 4 server that runs website-audit **engines** against user-supplied URLs, metered by a tiered rate limiter, with Firebase auth/Firestore on the client, MongoDB analytics, and fail-closed payment-gateway integrations.

> Review remediation status: **Phase 0 ✅ · Phase 1 ✅ · Phase 2 ✅ · Phase 3 ✅** — see [`CODE_REVIEW.md`](./CODE_REVIEW.md) for the full audit and roadmap.

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
| `npm run build` | Production bundle to `dist/` |
| `npm test` | Vitest suite (168 tests: UI + server route suite) |
| `npm run test:coverage` | Same suite with v8 coverage, thresholds gated on `server/**` |
| `npm run lint` | ESLint (0 warnings tolerated) |
| `npm run check:bundle` | Enforce JS bundle-size budgets after `npm run build` |

CI (`.github/workflows/ci.yml`) runs lint, `tsc --noEmit` (**hard gate** — the tree compiles clean under `strict: true`), the test suite, and the production build.

## Environment variables

Everything is optional; behavior when unset is listed. See [`.env.example`](./.env.example) for the full list.

| Group | Variables | Unset behavior |
| --- | --- | --- |
| Firebase (client) | `VITE_FIREBASE_*` | Auth/FS features degrade gracefully |
| Firebase Admin (server) | `FIREBASE_SERVICE_ACCOUNT_JSON` / `_PATH` | `/api/state/sync` → `401` for everyone (fail closed) |
| MongoDB | `MONGODB_URI`, `MONGODB_DB_NAME` | Analytics buffer in memory (zero-cost mode) |
| Mailgun | `MAILGUN_*` | Emails dispatch in **mock mode** (logged, never sent) |
| Payments | `V2CHECKOUT_*`, `DODOPAY_*`, `PAYMENTS_WEBHOOK_SECRET*` | Checkout/verify → `503`; webhooks → `401` |
| GitHub webhooks | `GITHUB_WEBHOOK_SECRET` | All webhook deliveries rejected |
| Rate-limit API keys | `VALID_API_KEYS` (comma-separated `cat_live_…`) | `api_pro` tier disabled entirely |
| Logging | `LOG_LEVEL` (`debug`/`info`/`warn`/`error`), `PORT`, `HOST` | `info` in production, `debug` otherwise |

## Architecture

One HTTP server hosts both the Express API and the SPA (static `dist/` in production, Vite middleware in development). The full diagram and data flows live in [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md); the audit-engine inventory is in [`docs/ENGINES.md`](./docs/ENGINES.md).

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
- **Payments**: fail closed. `/api/payments/verify` never grants entitlements; webhooks require HMAC-SHA256 over the raw body; missing gateway credentials → `503`.
- **Webhooks**: GitHub deliveries verify `x-hub-signature-256` over the raw body; unknown `repoId`s are rejected, never auto-provisioned. Repo secrets are never echoed back to clients.
- **SSRF**: every engine request goes through the guard — scheme allowlist, private/loophead range blocking, DNS resolution pinned to the validated address (anti-rebinding), response-size caps, TLS verification on.
- **Rate limiting**: per-identity daily unit budgets + 60s burst windows, in-memory, keyed by server-derived identity; visitor budget 20 units/day.
- **Secrets hygiene**: the Firebase **web** config (`firebase-applet-config.json`, `VITE_FIREBASE_*`) is public by design — it identifies the Firebase project and is safe to ship in the client bundle. The Admin **service account** is the credential, kept out of Git and provided via `FIREBASE_SERVICE_ACCOUNT_*`.

## Observability

- Server: structured pino logs (JSON lines), one line per request with `x-request-id` correlation, credential-header redaction (`LOG_LEVEL` to tune).
- Client: `src/lib/logger.ts` facade — console passthrough in dev; in production, redacted/deduplicated warn/error batches ship to `POST /api/client-logs` (validated, rate-limited) via `sendBeacon`/`fetch keepalive`.

## Testing

```bash
npm test                 # 168 tests — UI (jsdom) + server routes (node + supertest)
npm run test:coverage    # coverage gate: server/** ≥70% lines/statements/functions
```

The server suite covers every security-critical flow: payment fail-closed behavior, webhook HMAC verification (valid/forged/unknown), identity-spoof resistance, state-sync auth, SSRF blocking, telemetry schema validation, and the client-log sink.
