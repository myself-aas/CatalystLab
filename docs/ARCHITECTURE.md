# Architecture

**What this answers:** how CatalystLab is put together at runtime — the single
process that serves everything, the path a request takes, what the server trusts,
and how the pieces fail. For the repository map, see
[`codebase/STRUCTURE.md`](codebase/STRUCTURE.md); for operations, see
[`ops/runbook.md`](ops/runbook.md).

CatalystLab is a single-process deployable: one HTTP server hosts the Express API and the React SPA.

```mermaid
flowchart LR
    subgraph Browser
        SPA["React 19 SPA<br/>(Vite 8 build, code-split routes)"]
        SW["Service Worker<br/>(offline asset + telemetry doc cache)"]
        CL["logger facade<br/>src/lib/logger.ts"]
    end

    subgraph Server["Express (server/app.ts) — one process, one port"]
        MW["helmet CSP · body limits 256kb/2mb<br/>request-ID logging · attachIdentity"]
        subgraph Routes["server/routes/*"]
            T["telemetry"]
            SS["stateSync"]
            EN["engines"]
            GH["github"]
            PAY["payments"]
            ACC["account"]
            NOT["notifications"]
            SYS["system"]
            CLS["clientLogs"]
        end
        RL["core/rateLimit<br/>daily units + 60s bursts"]
        AUTH["src/lib/serverAuth<br/>firebase-admin verifyIdToken"]
    end

    subgraph Engines["Audit engines (src/lib/nodeEngines.ts — canonical, D7)"]
        GUARD["networkSecurity SSRF guard<br/>DNS pin + private-range block"]
        E1["health · latency · ai_ready · repo"]
        E2["eco · compliance · migration · llmo"]
    end

    FB[("Firebase Auth<br/>+ Firestore")]
    MG[("MongoDB<br/>time-series analytics")]
    MGUN["Mailgun API"]
    GW["2Checkout / Dodo<br/>gateways"]
    TARGET["Target websites"]
    GHAPI["GitHub webhook deliveries"]

    SPA -->|"Bearer ID token"| MW
    MW --> AUTH --> FB
    MW --> RL
    MW --> Routes
    SPA -->|"audit request"| EN --> GUARD --> TARGET
    EN -->|"report"| SPA
    T --> MG
    SS --> FB
    SS --> MG
    PAY --> GW
    GHAPI -->|"HMAC sha256 over raw body"| GH
    NOT --> MGUN
    CL -->|"batched warn/error<br/>POST /api/client-logs"| CLS
    SW -.-> SPA
```

## Request lifecycle

1. **Transport**: `server.ts` binds `PORT`/`HOST` (env-driven, defaults `3000`/`0.0.0.0`; both keys ship in the 42-key `.env` templates) and mounts either Vite middleware (dev) or static `dist/` (production) behind the same Express app built by `createApp()`.
2. **Security middleware** (in order): helmet CSP — production drops `'unsafe-inline'` by allowlisting startup-computed hashes of the theme-bootstrap script; per-route JSON body limits (256 KB default, 2 MB only for state-sync bulk mutations); structured request logging with `x-request-id` (inbound IDs honored when they match a safe pattern); `attachIdentity` verifies the Firebase ID token once and attaches the server-derived identity (plan, trial, superadmin claim).
3. **Routing**: decomposed route modules register under `/api/*` (+ legacy `/stats/*`, `/telemetry/*`). An API 404 catch-all always answers JSON — the SPA fallback can never shadow an API route. A terminal error handler degrades gracefully when MongoDB is offline.
4. **Rate limiting**: engine-scan routes run `createEngineRateLimitMiddleware`, which resolves the caller's tier (visitor → free/starter/pro/team/enterprise/api_pro → superadmin) from the attached identity, charges units from the daily budget, enforces the 60-second burst window, and answers `429` with a machine-readable envelope. Budgets: [`ENGINES.md`](ENGINES.md) cost model.
5. **Engine execution**: `server/routes/engines.ts` validates the target URL, runs the SSRF guard (scheme allowlist, private-range block, DNS resolve → validate → pin the socket to that address), then dispatches to the TypeScript engine in `src/lib/nodeEngines.ts` (canonical implementation, D7) and returns a structured report. Redirects are never auto-followed.

## Identity and trust boundaries

- The **only** server-trusted inputs are: verified Firebase ID tokens (via `firebase-admin`), HMAC-verified webhook payloads, and the constant-time-checked `cat_live_` API-key allowlist (`VALID_API_KEYS`).
- Everything client-supplied — headers like `x-user-email`, plan strings, tier hints — is ignored for authorization. Quota/tier introspection endpoints reflect only the server-derived identity.
- Superadmin is terminal: unlimited budget (`limit: null`, `burstMax: Infinity`), granted exclusively by a signed custom claim on the verified token.

## Telemetry pipeline

First-party, ad-blocker-proof: the SPA and a tiny served script (`/api/telemetry.js`) POST events to `/api/telemetry/event` (also `/api/event`, `/stats/event`). Events are zod-validated and dropped silently when malformed, bot/prefetch traffic is filtered before any processing, geo/UA enrichment is local (`geoip-lite` + `ua-parser-js`), and events queue into MongoDB time-series collections when configured (in-memory otherwise). Query pipelines (`/api/analytics/stats`, `/api/analytics/realtime`, `/api/analytics/anomalies/check`) read the same store.

## Edge mesh (presentation layer)

The dashboard visualizes a 42-PoP edge mesh (`src/lib/edge/pops.ts`, `TOTAL_POPS_COUNT = EDGE_POPS.length` at `src/lib/edge/pops.ts:753`) on an interactive cobe globe (`EdgeMeshGlobe`), with plan-tier-driven PoP visibility, projection-based overlay chips, and the telemetry HUD. The mesh is a presentation/simulation feature of the product UI — engine scans execute from this single server process. (Distinct number: the *delivery* network is Cloudflare's 330+ anycast PoPs, which serve the static frontend.)

## Observability

- **Server**: pino JSON logs; per-request line with method/url/status/duration/requestId; credential headers redacted; level escalates with status (≥500 error, ≥400 warn). `LOG_LEVEL` controls verbosity.
- **Client**: `src/lib/logger.ts` — dev passthrough; production batches redacted, deduplicated warn/error events to `/api/client-logs` (schema-validated, 64 KB cap, 30 req/5 min per identity) with `sendBeacon` on pagehide. Global `error` and `unhandledrejection` hooks plus `ErrorBoundary` report through the same facade.

## Deployment notes

- Single container/process; **no serverless entrypoints exist** — the legacy `api/` Vercel twins and the duplicated `lib/engines/` tree were deleted on 2026-10-19 (owner answer #9), so the Express server is the only runtime (D7).
- `NODE_ENV=production` requires a prior `npm run build` (CSP hashing reads `dist/index.html`). Both `NODE_ENV` and `PORT` are part of the 42-key env-template parity enforced by `npm run check:env`.
- All integrations fail closed or degrade to mock modes — a fresh deployment with zero env vars serves the full SPA and public audit surfaces safely.
- Production topology (Cloudflare Pages + Worker `/api` proxy + Oracle Always Free origin) and its failure posture: [`ops/runbook.md`](ops/runbook.md) §1 and [`ops/architecture-redundancy.md`](ops/architecture-redundancy.md).

## Repository shape (2026-10-21 consolidation)

- The five real root-level `components/` implementations were consolidated into `src/components/`; the shim web and the `@/*` dual-tsconfig fallback are gone (Q45).
- Fourteen one-shot root codemod scripts moved to `archive/` — retained for provenance, not wired into any npm script (Q47).
- Python tooling (`scripts/replace_images.py`, `scripts/tests/`) is gated in CI by the `python-tooling` job: pytest + ruff + mypy strict + black (Q52).

## Where to read next

- Engines, quotas, SSRF guard: [`ENGINES.md`](ENGINES.md)
- Operating the service: [`ops/runbook.md`](ops/runbook.md) · SLOs: [`ops/slo.md`](ops/slo.md)
- Zero-to-deployed: [`ops/environment-and-deployment-guide.md`](ops/environment-and-deployment-guide.md)
- Code-level map with `file:line` evidence: [`codebase/`](codebase/)
