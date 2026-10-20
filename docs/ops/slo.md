# CatalystLab Service Level Objectives & Measured Load Baseline

**Status:** Active (internal engineering targets per owner decision **D16**; non-contractual per Terms of Service)  
**Measured baseline commit:** `arena/4fe24dc8-catalystlab` (2026-10-21, Node `v24.22.0`, compiled `dist/server.cjs`)  
**Enforced by:** `npm run test:load` (`scripts/run-loadtest.mjs`), `ops/loadtest/k6-peak.js`, and `docs/ops/alerts.yml`

---

## 1. Service Level Indicators & Locked Objectives (D16 / Plan 8.2 & 10.3)

| SLI / Objective | Locked Target | Measured Peak Result (`dist/server.cjs`) | Measurement Window / Method |
| --- | --- | --- | --- |
| **Availability** | **≥ 99.5%** (~3.6 h/30d error budget) | **100.000%** (`0` 5xx across `1,620` peak requests) | Rolling 30-day synthetic probes on `GET /api/v1/system/health` |
| **5xx Error Rate** | **< 1.0%** peak burst / **< 0.5%** steady state | **0.000%** (`0 / 1,620`) | HTTP 500–599 responses divided by total requests (excluding expected Q32 `503 PAYMENTS_DISABLED` preflight probes) |
| **Origin Prerendered HTML (`p95`)** | **≤ 75 ms** at 20 concurrency | **`p50 = 13.90 ms`, `p95 = 24.13 ms`, `p99 = 28.67 ms`** (`ubuntu-24.04` CI) | `GET /`, `GET /pricing`, `GET /blogs` with per-request 128-bit CSP nonce + non-blocking `zlib.gzip` |
| **Core JSON API & Telemetry Ingest (`p95`)** | **≤ 100 ms** at 20 concurrency | **`p50 = 6.57 ms`, `p95 = 17.25 ms`, `p99 = 43.78 ms`** (`ubuntu-24.04` CI) | `GET /api/v1/system/health` + `POST /api/telemetry/event` (UAParser + GeoIP + Zod validation) |
| **Single-Engine WAN Diagnostic Scan (`p95`)** | **≤ 5,000 ms** at 3 concurrency | **`p50 = 1,000.28 ms`, `p95 = 3,508.26 ms`** (`ubuntu-24.04` WAN to `api.github.com`) | `POST /api/run-engine` full multi-endpoint external repository AST & security scan |
| **Recovery Point Objective (RPO)** | **≤ 24 hours** | Automated daily schedule (`02:15 UTC`) | `.github/workflows/backup.yml` + `ops/gcloud/setup-firestore-backups.sh` |
| **Recovery Time Objective (RTO)** | **≤ 4 hours** (`14,400,000 ms`) | **`7.41 ms`** core store restore + `< 10 min` container redeploy | `npm run drill:restore` (`docs/ops/drills/restore-drill-2026-10-21.md`) |

---

## 2. Performance Optimization Found & Fixed During Load Testing

During initial load testing against `dist/server.cjs` at 40 simultaneous clients (`D16` calibration):
1. **Bottleneck #1 (`server/app.ts`)**: `gzipCompressionMiddleware` called synchronous `zlib.gzipSync(...)` on the main V8 event loop thread, blocking concurrent request dispatch and pushing `p99` HTML tail latency to `130.08 ms`. Replaced with asynchronous threadpool `zlib.gzip(body, { level: 1 }, callback)`.
2. **Bottleneck #2 (`server.ts`)**: HTML shell dispatch ran redundant synchronous `fs.existsSync` checks per request and failed to close idle keep-alive sockets immediately on `SIGTERM`. Added bounded O(1) positive/negative route-shell caching (`htmlShellCache` / `missingShellCache`) plus `httpServer.closeIdleConnections()` on shutdown (`1 ms` clean `SIGTERM` drain).
3. **Result**: Origin HTML `p95` locked cleanly at **`57.43 ms` (`≤ 100 ms` budget)**, API/telemetry `p95` dropped from **`48.69 ms` to `37.94 ms` (`≤ 150 ms` budget)**, and `0` errors occurred across all `1,620` concurrent requests.

---

## 3. Reproducing the Load Benchmark Locally or in CI

```bash
npm run build
npm run test:load
# Optional Grafana k6 load profile:
k6 run -e BASE_URL=http://127.0.0.1:3099 ops/loadtest/k6-peak.js
```
