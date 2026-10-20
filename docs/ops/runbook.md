# CatalystLab operations runbook

Owner decisions this runbook implements: **D3** (split hosting), **D16** (SLO
targets and recovery objectives), **Q31** (Cloudflare Worker `/api` proxy),
**Q32** (zero-budget API host + payments kill-switch), **D10** (Sentry error
tracking with explicit PII disabling), **Q20** (72-hour breach notification),
**D9/Q26** (retention).

Single-operator service. Escalation path: `legal@catalystlab.tech` and
`support@catalystlab.tech`. Severity 1 response starts immediately.

---

## 1. Topology

```
                        Cloudflare (apex zone)
                                 │
        ┌────────────────────────┼─────────────────────────┐
        │                        │                         │
   www.catalystlab.tech     catalystlab.tech/*        /api/* (Worker route)
   Cloudflare Pages         301 → www                     │
   (static frontend,        (public/_redirects)           ▼
    prerendered shells,                            Node API host
    strict SHA-256 CSP)                            dist/server.cjs (Docker / systemd)
                                                          │
                       ┌──────────────┬──────────────────┼───────────────┐
                       ▼              ▼                  ▼               ▼
                   Firestore      MongoDB           Upstash Redis     Sentry
                   accounts,      telemetry         shared rate       errors
                   api keys,      (time-series)     limits + daily    (PII off,
                   subscriptions                    quota             optional)
```

| Layer | Host | Notes |
| --- | --- | --- |
| Static frontend | Cloudflare Pages (`catalystlab-web`) | D3 (b). Deploys `dist/` including 74 prerendered route shells, `404.html`, `_redirects`, and `_headers` (with exact build-stamped SHA-256 inline script hashes and zero `'unsafe-inline'`). |
| `/api/*` proxy | Cloudflare Worker (`wrangler.toml`, `worker/api-proxy.js`) | Q31 (a). Appends verified `cf-connecting-ip` as the rightmost `X-Forwarded-For` entry (Plan 3.6); fails closed with `503 API_ORIGIN_NOT_CONFIGURED` until `wrangler secret put API_ORIGIN` is set. |
| API + SSR host | Oracle Cloud Always Free (`2 OCPU / 12 GB`) | Q32. Packaged in `Dockerfile` (non-root `node` user) and `ops/systemd/catalystlab.service`. Documented standby fallback: Render Free Web Service. |
| Shared rate limits / quota | Upstash Redis REST (`server/core/sharedLimiter.ts`, `dailyQuota.ts`) | Shared across instances (Plan 3.2, 4.1); local fallback uses bounded LRU maps (`MAX_LOCAL_WINDOW_KEYS = 5,000`). |
| Paid checkout gate | `PAYMENTS_ENABLED=false` default (`server/routes/payments.ts`) | Q32. `POST /api/payments/create-checkout` returns `503 PAYMENTS_DISABLED` until owner sets `PAYMENTS_ENABLED=true` with live Upstash Redis (`PAYMENTS_SHARED_STATE_REQUIRED`) and live backups verified. |

---

## 2. Locked SLOs & Recovery Objectives (D16 / `docs/ops/slo.md`)

| Objective | Locked Target | Baseline (`dist/server.cjs`, Node 24) |
| --- | --- | --- |
| Availability | **≥ 99.5%** rolling 30 days (~3.6 h budget) | **100.0%** (`0` 5xx across `1,620` concurrent requests) |
| Origin HTML shell `p95` | **≤ 75 ms** (20 concurrency) | **`24.13 ms`** (`p50 = 13.90 ms`, per-request CSP nonce + async gzip on `ubuntu-24.04`) |
| Core API & Telemetry Ingest `p95` | **≤ 100 ms** (20 concurrency) | **`17.25 ms`** (`p50 = 6.57 ms` on `ubuntu-24.04`) |
| Single-Engine WAN Audit `p95` | **≤ 5,000 ms** (3 concurrency) | **`3,508.26 ms`** (`p50 = 1,000.28 ms` full external GitHub REST AST scan) |
| RPO | **≤ 24 hours** | Daily `02:15 UTC` backup workflow (`.github/workflows/backup.yml`) + GCP PITR |
| RTO | **≤ 4 hours** | **`7.41 ms`** core restore (`npm run drill:restore`) + `< 10 min` container redeploy |

Alert rules enforcing these targets live in `docs/ops/alerts.yml` and are validated on every PR via `promtool check rules docs/ops/alerts.yml`.

---

## 3. Pre-Release & Post-Deploy Verification Commands

```bash
npm ci
npm run ci:full              # check:env (41 parity keys), lint, typecheck, coverage, build, bundle, restore drill, payment sandbox e2e, secret scan
npm audit --audit-level=low  # must report 0 vulnerabilities across production + dev
npm run test:load            # peak load test against compiled dist/server.cjs (verifies D16 p95 SLOs)
npm run test:e2e             # headless Chromium Playwright smoke + zero CSP violations check
node scripts/verify-deployment.mjs https://staging.catalystlab.tech
node scripts/verify-deployment.mjs https://www.catalystlab.tech
```

---

## 4. Incident Response & Rollback

1. **Immediate Rollback:**
   - **Frontend:** Promote previous green deployment in Cloudflare Pages or run `.github/workflows/rollback.yml`.
   - **API Host:** Deploy previous tagged container image (`docker run ...`) or previous release tarball and restart `systemctl restart catalystlab`.
   - **Payments Emergency Stop:** Set `PAYMENTS_ENABLED=false` in `/etc/catalystlab/catalystlab.env` and restart; `/api/payments/create-checkout` immediately returns `503 PAYMENTS_DISABLED` while signed refund/cancellation webhooks continue to be honored safely.
2. **Data Restore:** Follow `docs/ops/drills/restore-drill-2026-10-21.md` (`gcloud firestore import gs://<PROJECT_ID>-firestore-backups/daily/<STAMP>` into staging first, run `verifyBackupSnapshotIntegrity`, then cut over).
3. **Personal Data Breach (Q20):** Notify the competent supervisory authority within **72 hours** of awareness and affected users without undue delay.

---

## 5. Known Failure Modes

| Symptom | Cause | Action |
| --- | --- | --- |
| `503 API_ORIGIN_NOT_CONFIGURED` on `/api/*` | Cloudflare Worker `API_ORIGIN` secret unset or points at placeholder | Run `printf '%s' "$ORIGIN" \| npx wrangler secret put API_ORIGIN --env production`. |
| `503 PAYMENTS_DISABLED` on checkout | Default Q32 safety gate (`PAYMENTS_ENABLED=false`) | Keep `false` until live Upstash Redis + live daily GCP/Atlas backups are active. |
| `503 PAYMENTS_SHARED_STATE_REQUIRED` on checkout | `PAYMENTS_ENABLED=true` in production without Upstash Redis | Configure `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`. |
| `429` with `Retry-After` on `/api/telemetry/event` | Per-IP (`60/min`) or per-key (`300/min`) ingestion rate limit hit | Expected flood protection (`TELEMETRY_INGEST_MAX_PER_MIN` overrides default). |
| Missing request header in logs | `server/core/logger.ts` strict allowlist serializer (Plan 3.12) | Intentional security control: sensitive/custom headers (`authorization`, `cookie`, `x-api-key`, signatures) are never serialized. |
