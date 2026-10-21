# CatalystLab Architecture & Single-Point-of-Failure Analysis

**What this answers:** what fails when each layer dies, what the code does about
it automatically, what an operator must do manually — and, just as important,
what is deliberately *not* redundant under the $0/month constraint (Q32).

**Plan reference:** Item `4.7`, owner decisions `D3`, `D9`, `D10`, `D16`, `Q31`, `Q32`  
**Last verified:** 2026-10-21

---

## 1. Component Redundancy & Failure Posture Matrix

| Layer / Component | Production Implementation | Failure Impact | Automated Behavior in Code | Recovery / Failover Procedure |
| --- | --- | --- | --- | --- |
| **Static Web Edge** (`www.catalystlab.tech`) | Cloudflare Pages (`dist/` + `_headers` + `_redirects`, 330+ Anycast POPs) | Marketing pages, docs, legal pages, and cached SPA shells unaffected even if Node API origin goes down | Static prerendered HTML shells serve directly from edge cache with strict SHA-256 CSP headers | Instant one-click deployment promotion in Cloudflare Pages or `.github/workflows/rollback.yml` |
| **Same-Origin API Proxy** (`/api/*`) | Cloudflare Worker (`worker/api-proxy.js`, `wrangler.toml`) | `/api/*` requests fail cleanly without exposing upstream IPs or forwarding to NXDOMAIN | Returns structured `503 API_ORIGIN_NOT_CONFIGURED` if unconfigured, or `502 API_UPSTREAM_UNREACHABLE` if origin unreachable | Update Worker `API_ORIGIN` secret (`npx wrangler secret put API_ORIGIN --env production`) in < 30s to point at standby container host |
| **API Compute Host** (`dist/server.cjs`) | Single Oracle Cloud Always Free VM (`2 OCPU / 12 GB RAM`, `ops/systemd/catalystlab.service` or `Dockerfile`) | Active diagnostic engine runs, telemetry ingest, and webhook processing interrupt during VM reboot | `systemd` `Restart=always` (`RestartSec=5`) + `SIGTERM` idle-socket drain (`1 ms`) | Redeploy identical `Dockerfile` image onto documented standby host (**Render Free Web Service**, Q32) and update Cloudflare Worker `API_ORIGIN` secret |
| **Shared Rate Limits & Quotas** | Upstash Redis REST (`server/core/dailyQuota.ts` & `server/core/sharedLimiter.ts`) | Shared cross-instance quota & sliding-window counters unavailable | **Production:** fails closed (`503`) on paid checkout (`Q32`) & rate-limited endpoints so limits cannot be bypassed; **Non-prod:** degrades gracefully to 5,000-key LRU `BoundedSlidingWindowStore` | Restore Upstash connectivity or rotate `UPSTASH_REDIS_REST_*` credentials |
| **Accounts, API Keys & Entitlements** | Google Cloud Firestore (`users`, `api_keys`, `user_subscriptions`, `payment_events`) | Authentication verification, API key lookup, and webhook persistence unavailable | **Fails closed:** unverified tokens return `401`, ownership checks return `503`, and payment webhooks return `503 STORE_UNAVAILABLE` so 2Checkout retries automatically without losing entitlements | Daily automated snapshot (`02:15 UTC`, RPO ≤ 24h) + Firestore PITR + verified clean restore (`npm run drill:restore`, `7.41 ms` core restore, RTO ≤ 4h) |
| **Time-Series Web Telemetry** | MongoDB Atlas (`analytics_events` with 730-day TTL index) | Analytics dashboard reads & event persistence unavailable while offline | Non-blocking degradation: diagnostic scan engines and static pages remain 100% available; analytics routes return clean status without crashing Node | Daily snapshot export + idempotent startup index recreation (`ensureRetentionIndexes()`) |
| **Payment Gateway** | 2Checkout (`PAYMENT_GATEWAY=2checkout`, `D1`/`D2`/`Q32`) | Checkout sessions temporarily unavailable; active users retain access | Protected by `PAYMENTS_ENABLED=false` kill-switch (`Q32`); webhook handler enforces constant-time HMAC-SHA256, idempotency on `eventId`, and monotonic event timestamps | Toggle `PAYMENTS_ENABLED=false` immediately if gateway anomaly occurs; webhooks replay safely once healthy |

---

## 2. Accepted Single-Host Trade-offs (Zero-Budget Constraint, Q32)

Per owner decision **Q32** (`$0/month` infrastructure posture):
- The API runs as a single supervised Node 24 process on Oracle Cloud Always Free rather than an active-active multi-region cluster.
- All stateful concerns (API keys, subscriptions, payment event ledger, connected GitHub repositories, daily quotas, sliding-window rate limits) live in external stores (Firestore, MongoDB, Upstash Redis), making the Node container **100% stateless and replaceable in minutes** via `Dockerfile`.
- In-process memory maps (`BoundedSlidingWindowStore`, `dailyRateLimitStore`, `sessionCostMap`, `htmlShellCache`) have strict hard cardinality caps (`5,000`, `10,000`, `256`, `256`) so sustained flood traffic cannot trigger OOM kills on the VM.

---

## 3. Secret Custody Redundancy (Four Planes)

Secrets never live in Git; each has exactly one authoritative home and a
rotation path (`environment-and-deployment-guide.md` Part 0):

| Plane | Store | Custody | Rotation path |
| --- | --- | --- | --- |
| **A — Static build** | `.github/workflows/deploy.yml` build env | Public build metadata only (`APP_ORIGIN`, `VITE_*` — never keys) | Commit + redeploy |
| **B — Cloudflare edge** | Worker secret `API_ORIGIN` | Encrypted, `wrangler secret put` only | Re-put secret (< 30 s, no redeploy) |
| **C — Node host** | `/etc/catalystlab/catalystlab.env` (`root:root`, `0600`) | All 42 runtime keys | Edit file + `systemctl restart catalystlab` |
| **D — CI/CD & backups** | GitHub Environments (`staging`, `production`; production behind Required Reviewer) | `CLOUDFLARE_API_TOKEN`, `FIREBASE_SERVICE_ACCOUNT_JSON`, `FIRESTORE_BACKUP_BUCKET`, origins | GitHub UI rotation; env-scoped so staging cannot read production |

The 42-key template parity (`npm run check:env`) guarantees plane C can always be
reconstructed from `.env.production.example` + the plane D/A secret stores — no
key exists only in someone's memory.

---

## 4. What Is *Not* Redundant (Honest Gaps)

Recorded so nobody discovers them during an incident:

| Gap | Impact if it fails | Mitigation in place |
| --- | --- | --- |
| Single Oracle Always Free VM | API down until redeploy (minutes-to-hours) | systemd `Restart=always`; documented Render Free standby (§1); stateless container |
| Single operator | Human availability is the incident-response bottleneck | Runbook §4 is written to be executable by any engineer; escalation addresses fixed |
| Single DNS zone (Cloudflare) | Apex + www resolution loss | Cloudflare anycast/registrar lock; `public/_redirects` covers apex→www |
| GitHub Actions as sole CI/CD | Cannot deploy or prove gates during a GitHub outage | All gates are runnable locally (`npm run ci:full`); Pages promotion is a UI action |
| In-memory quota fallback | Restart wipes non-Upstash rate-limit state | Production **requires** Upstash (owner answer #1); fail-closed checkout |
| Atlas credential `SEC-2026-01` | Historical commit exposure until rotated | Owner action assigned (Q44) — tracked in `../security/review-2026-10.md` |
