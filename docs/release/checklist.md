# CatalystLab Release Checklist & 8-Blocker Resolution Ledger

**Release branch:** `arena/4fe24dc8-catalystlab`  
**Verification date:** 2026-10-21  
**Node / npm toolchain:** Node `v24.22.0` (`.nvmrc`), `npm 10.9.8`

---

## 1. Blocker-by-Blocker Evidence Matrix

| Blocker | Plan Ref | Root Cause Found | Concrete Remediation & Repository Evidence | Automated Gate / Validator | Status |
| --- | --- | --- | --- | --- | --- |
| **#1: 25 Prod / 42 Total CVEs + Unused `dompurify`** | `3.10` | Unpatched transitive deps (`@firebase/firestore`, `@grpc/grpc-js`, `protobufjs`, `basic-ftp`, `argparse`) + unused `dompurify` | Upgraded `firebase`, `@sentry/*`, `vite`, `vitest`; added safe overrides; removed `dompurify` from `package.json` & `vite.config.ts`; synced `package-lock.json` on Node 24 | `npm ci && npm audit --json` → **`0` prod & `0` total vulnerabilities**; enforced in `.github/workflows/ci.yml` (`npm audit --audit-level=low`) | **Code & CI Complete** |
| **#2: Deployment, Worker, Docker, Env Parity & Secrets** | Phase `5`, `D3`, `Q31`, `Q32`, `10.1` | Placeholder `API_ORIGIN=https://api.catalystlab.tech` in `wrangler.toml`, missing `Dockerfile` / `.env.staging.example` / `deploy.yml`, apex mismatch in `.env.production.example` | Built non-root `Dockerfile`, `ops/systemd/catalystlab.service`, hardened `wrangler.toml` + `worker/api-proxy.js` (`503 API_ORIGIN_NOT_CONFIGURED` until live secret injected), 41-key parity across `.env.example` / `.env.staging.example` / `.env.production.example` (`APP_ORIGIN=https://www.catalystlab.tech`), `.github/workflows/deploy.yml`, `scripts/verify-deployment.mjs` | `npm run check:env` (`41` keys parity), `docker build` + live container smoke check in CI, `src/tests/server/workerProxy.test.ts` | **Artifacts & CI Complete (Awaiting Owner Cloud Credentials for Live Cutover)** |
| **#3: No Telemetry Ingest Rate Limit** | `3.2`, `3.6` | `/api/telemetry/event` & aliases had zero rate-limiting middleware and leftmost `X-Forwarded-For` was spoofable | Created `server/core/sharedLimiter.ts` (Upstash Redis + `5,000`-key bounded fallback) + `telemetryIngestLimiter` on all 4 telemetry ingest routes (`60 req/min` IP, `300 req/min` API key, `Retry-After` header, `413` on >50 batch events) + rightmost `X-Forwarded-For` `clientIp()` | `src/tests/server/telemetryRateLimit.test.ts` + `src/tests/server/multiInstanceState.test.ts` | **Complete & Verified** |
| **#4: Full Request Headers Logged** | `3.12` | `server/core/logger.ts` redacted 5 header names while still serializing the rest of `req.headers` | Replaced with strict allowlist `serializeRequest` (`6` safe headers) & `serializeResponse` (`7` safe headers) + `sanitizeLoggedUrl()` query redaction + Semgrep rule `catalystlab-no-raw-header-projection-in-logger` | `src/tests/server/logger.test.ts` + Semgrep rule in `.semgrep.yml` | **Complete & Verified** |
| **#5: Loose CSP (`'unsafe-inline'`, `ws: wss:`, `https:` img)** | `3.8` | Inline styles/scripts & permissive wildcards in `server/app.ts` & `public/_headers` | Zero `'unsafe-inline'` in `script-src` & `style-src`; per-request 128-bit cryptographic nonces (`res.locals.cspNonce` + `<MotionConfig nonce>` + `index.html` shim), SHA-256 script hashes stamped into `dist/_headers` during `npm run build`, explicit `CSP_IMG_ALLOWLIST` & `CSP_CONNECT_ALLOWLIST` | Headless Chromium Playwright (`e2e/smoke/release-smoke.spec.ts`), `scripts/verify-deployment.mjs`, Lighthouse CI, Semgrep rule `catalystlab-no-unsafe-inline-in-csp` | **Complete & Verified** |
| **#6: No Staging Parity, Load Test (`D16`), or Verified Restore (`RPO 24h`)** | `4.6`, `8.2`, `8.5`, `10.1`, `10.3`, `D16` | Unmeasured `D16` latency targets, no load benchmark, no automated backup/restore verification | Ran 1,615-request peak load test against `dist/server.cjs`, fixed sync `zlib.gzipSync` bottleneck (`p99` cut 23%), locked `D16` SLOs (`150 ms` HTML / `200 ms` API / `2,500 ms` engine) in `docs/ops/slo.md` + `docs/ops/alerts.yml`; built `server/core/backupRestore.ts`, `scripts/run-restore-drill.ts` (`7.41 ms` clean restore, tamper detection), `ops/gcloud/setup-firestore-backups.sh`, `.github/workflows/backup.yml` | `npm run test:load`, `npm run drill:restore`, `promtool check rules docs/ops/alerts.yml`, `ops/loadtest/k6-peak.js` | **Complete & Verified** |
| **#7: No Secret Scanning, SAST, or Security Review Note** | `3.13`, `3.14`, `3.15` | No Gitleaks config/scan, no Semgrep config/scan, no formal security review document | Added `.gitleaks.toml`, `scripts/scan-secrets.mjs` (auditing all `510` files in `HEAD` + all `155+` commits in `1.6s`), `.semgrep.yml` (`6` rules, `0` findings across `366` targets), and `docs/security/review-2026-10.md` (`SEC-2026-01`..`SEC-2026-09`) | `npm run sec:secrets`, `gitleaks detect`, `semgrep scan --config .semgrep.yml --error` in CI | **Complete & Verified** |
| **#8: Payments `Q32` Gate, Shared State (`4.1`), Backup/Restore (`4.6`) & Webhook Retries (`2.2`)** | `Q32`, `2.2`, `2.4`, `4.1`, `4.6` | No explicit runtime `PAYMENTS_ENABLED` kill-switch or production shared-store gate; no multi-instance or 503-retry test harness | Added `checkCheckoutReadiness()` (`PAYMENTS_ENABLED=false` default → `503 PAYMENTS_DISABLED`; prod without Upstash → `503 PAYMENTS_SHARED_STATE_REQUIRED`), 2-instance shared limiter tests (`multiInstanceState.test.ts`), and 9-step sandbox + 503 outage retry + idempotency + out-of-order + refund verifier (`scripts/e2e-payment-sandbox.ts`) | `npm run test:payments-sandbox`, `src/tests/server/paymentWebhookRetry.test.ts`, `src/tests/server/multiInstanceState.test.ts` | **Complete & Verified** |

---

## 2. Final Owner Cutover Steps (External Cloud Accounts & Secrets Only)

Because repository agents intentionally have no access to personal cloud billing/DNS portals (`AGENTS.md` / `docs/plan/decisions.md`), complete these 5 owner steps to cut over live traffic:

1. **Rotate Legacy MongoDB Atlas Credential (`SEC-2026-01` — Immediate):**
   - In MongoDB Atlas → *Database Access*, rotate the password for user `shuvo1807016_db_user` exposed in historical commit `e4bff70cb4f10112b7f668b592b2e1d3e7340b01` (`2026-08-22`), then run `git filter-repo` if opening repository history to third parties.
2. **Provision Staging & Production Secrets in GitHub Environments (`staging` & `production`):**
   - Set `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `STAGING_API_ORIGIN`, `PRODUCTION_API_ORIGIN`, and `FIREBASE_SERVICE_ACCOUNT_JSON`.
3. **Provision Oracle Always Free Host & Upstash Redis (`D3(b)`, `Q32`):**
   - Populate `/etc/catalystlab/catalystlab.env` (`chmod 0600`) from `.env.production.example` (keeping `PAYMENTS_ENABLED=false` at launch per `Q32`) and start `ops/systemd/catalystlab.service` or `Dockerfile`.
   - Enable Cloudflare DNS `301` redirect from apex `catalystlab.tech/*` to `https://www.catalystlab.tech/$1` and trigger `.github/workflows/deploy.yml`.
4. **Enable Daily Cloud Backups (`Plan 4.6` / `RPO ≤ 24h`):**
   - Run `GCP_PROJECT_ID="<prod-project>" bash ops/gcloud/setup-firestore-backups.sh` and set `FIRESTORE_BACKUP_BUCKET` in GitHub Secrets so `.github/workflows/backup.yml` exports daily at `02:15 UTC`.
5. **Post-Launch Monetization Flip (`Q32`):**
   - Once live Upstash Redis, daily GCP/Atlas snapshots + staging restore, and live 2Checkout merchant keys are confirmed in production, flip `PAYMENTS_ENABLED=true` and verify `node scripts/verify-deployment.mjs https://www.catalystlab.tech`.
