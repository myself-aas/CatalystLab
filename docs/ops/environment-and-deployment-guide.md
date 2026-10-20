# CatalystLab — Complete Environment Variables Reference & Production Deployment Playbook

> **Canonical Reference (`D3(b)`, `D9`, `D10`, `D14`, `D16`, `Q31`, `Q32`, Plan Phases `4`–`10`)**  
> **Runtime:** Node `>=24` (`v24.22.0` pinned in `.nvmrc`) · **Frontend Edge:** Cloudflare Pages (`catalystlab-web`) · **API Reverse Proxy:** Cloudflare Worker (`catalystlab-api-proxy`) · **Origin Compute:** Oracle Cloud Always Free Ampere A1 VM (`systemd` or non-root `Docker` + `cloudflared` Zero-Inbound Tunnel)

---

## Architecture & Secret Placement Overview

CatalystLab uses a strict **5-Plane Split Architecture** (`D3(b)` / `Q31(a)`). **Never copy server secrets into frontend build environments or `VITE_*` variables** (Vite bundles every `VITE_*` variable verbatim into public client JavaScript).

```text
Browser (https://www.catalystlab.tech)
   │
   ├── Static HTML / JS / CSS / Prerendered SEO Shells ──► [Plane A + B] Cloudflare Pages (dist/)
   │      (Reads ONLY build-time VITE_APP_ORIGIN + public firebase-applet-config.json)
   │
   └── /api/* (REST + SSE streams + Webhooks) ───────────► [Plane B] Cloudflare Worker (worker/api-proxy.js)
                                                               │   Secret: API_ORIGIN (wrangler secret put)
                                                               │   Appends verified cf-connecting-ip rightmost
                                                               ▼
                                                           [Plane C] Oracle Cloud VM (dist/server.cjs :3000)
                                                               │   Env File: /etc/catalystlab/catalystlab.env (0600)
                                                               ├── Firebase Auth + Cloud Firestore (Identity/Plans/Keys)
                                                               ├── Upstash Redis REST (Shared Rate Limits/Quotas — Q32)
                                                               ├── MongoDB Atlas (Telemetry Events + TTL Retention)
                                                               ├── 2Checkout / DodoPay (Signed Webhooks — Q32 Gate)
                                                               ├── Mailgun HTTP API (Transactional Alerts & Digests)
                                                               └── Sentry v11 (PII-Scrubbed Error & Trace Telemetry)

CI / CD & Scheduled Backups ─────────────────────────────► [Plane D] GitHub Environments (`staging`, `production`)
Local Developer Workstation ─────────────────────────────► [Plane E] `.env` (gitignored; all secrets optional)
```

### Exact Secret & Config Placement Matrix Across All 5 Planes

| Plane | Target Location | Permissions / Scope | Exact Variables Placed Here |
| --- | --- | --- | --- |
| **Plane A — Static Build** | `.github/workflows/deploy.yml` (`build` step) or Docker `ARG` | Public build metadata only | `NODE_ENV=production`, `APP_ORIGIN`, `VITE_APP_ORIGIN` *(NEVER put API keys, DB URIs, or signing secrets into `VITE_*`)* |
| **Plane B — Cloudflare Edge** | Cloudflare Worker `catalystlab-api-proxy` (`staging` & `production` envs) | Encrypted Worker Secret (`wrangler secret put`) | `API_ORIGIN` (`https://origin-api.catalystlab.tech` — private Cloudflare Tunnel or origin hostname, **never** `www.catalystlab.tech` or placeholder `api.catalystlab.tech`) |
| **Plane C — Backend Node Host** | `/etc/catalystlab/catalystlab.env` on Oracle VM (loaded by `ops/systemd/catalystlab.service` or `docker run --env-file`) | `root:root`, mode `0600` (`chmod 0600 /etc/catalystlab/catalystlab.env`) | **All 42 runtime `.env` keys** defined in the Master Template below |
| **Plane D — GitHub Actions** | GitHub Repo → *Settings → Environments → `staging` & `production`* + Repo Secrets | Environment-scoped secrets (`production` protected by Required Reviewer) | `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `STAGING_API_ORIGIN`, `PRODUCTION_API_ORIGIN`, `FIREBASE_SERVICE_ACCOUNT_JSON`, `FIRESTORE_BACKUP_BUCKET` + Repo Variable `FIRESTORE_DATABASE_ID` |
| **Plane E — Local Dev** | `/path/to/CatalystLab/.env` (gitignored) | Developer machine (`0600`) | Copy of `.env.example` (all external services degrade gracefully to zero-cost local in-memory mode when omitted) |

---

## Part 1 — Master Annotated Production `.env` Template (All 42 Parity-Verified Keys)

> **Parity Rule (`scripts/check-env.mjs`):** `.env.example`, `.env.staging.example`, and `.env.production.example` enforce **exact 42-key schema parity** in CI (`npm run check:env`). Save populated values **only** on the target server at `/etc/catalystlab/catalystlab.env` (`chmod 0600`) — **never** inside the Git working tree.

```dotenv
# ==============================================================================
# CATALYSTLAB PRODUCTION ENVIRONMENT CONFIGURATION (/etc/catalystlab/catalystlab.env)
# Permissions: sudo chown root:root /etc/catalystlab/catalystlab.env && sudo chmod 0600 /etc/catalystlab/catalystlab.env
# Validator:   NODE_ENV=production node /opt/catalystlab/scripts/check-env.mjs
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. CORE SERVER RUNTIME & REVERSE PROXY TRUST (5 keys — Plan 3.6, Q40, Q42)
# ------------------------------------------------------------------------------
# Bind address. Use 0.0.0.0 inside Docker or behind cloudflared/Caddy; use
# 127.0.0.1 ONLY when cloudflared/nginx runs in the same host network namespace.
HOST=0.0.0.0

# TCP port exposed by dist/server.cjs. Matches Dockerfile EXPOSE 3000 & systemd.
PORT=3000

# MUST be "production" on BOTH staging and production hosts. Enables strict per-request
# CSP nonces, HSTS preload, minimal /health output, shared-state checks, and disables
# unauthenticated webhook simulation endpoints.
NODE_ENV=production

# Pino structured JSON log level: trace | debug | info | warn | error | fatal.
# Request/response headers use a strict allowlist (6 req / 7 res headers; Plan 3.12).
LOG_LEVEL=info

# MUST be "true" when behind worker/api-proxy.js (which appends verified cf-connecting-ip
# as the RIGHTMOST X-Forwarded-For entry). Set "false" ONLY if exposed directly without proxy.
TRUST_PROXY=true

# ------------------------------------------------------------------------------
# 2. CANONICAL APPLICATION ORIGIN (2 keys — Decision D14)
# ------------------------------------------------------------------------------
# Canonical HTTPS origin WITHOUT trailing slash. Apex catalystlab.tech 301-redirects here.
# Production: https://www.catalystlab.tech | Staging: https://staging.catalystlab.tech
APP_ORIGIN=https://www.catalystlab.tech
VITE_APP_ORIGIN=https://www.catalystlab.tech

# ------------------------------------------------------------------------------
# 3. AUTHENTICATION, CRYPTOGRAPHIC SIGNING & BOOTSTRAP API KEYS (4 keys — Q42)
# ------------------------------------------------------------------------------
# 256-bit (32-byte / 64-hex-char) secret for internal token signing.
# Generate with: openssl rand -hex 32
JWT_SECRET=<GENERATE_64_HEX_CHARS_VIA_OPENSSL_RAND_HEX_32>

# Separate 256-bit (64-hex-char) HMAC secret signing checkout state & return URLs.
# MUST NOT equal JWT_SECRET. Generate with: openssl rand -hex 32
PAYMENT_SIGNING_SECRET=<GENERATE_DISTINCT_64_HEX_CHARS_VIA_OPENSSL_RAND_HEX_32>

# Hard security gate: MUST remain "false" in staging & production (Plan 1.2).
ALLOW_UNAUTH_DEMO=false

# Optional comma-separated static service keys (prefix "cl_live_..."). Leave blank
# in normal operation — user API keys are stored SHA-256 hashed in Firestore `api_keys`.
VALID_API_KEYS=

# ------------------------------------------------------------------------------
# 4. PAYMENTS GATEWAY & Q32 MONETIZATION KILL-SWITCH (11 keys — D1, D2, Q32)
# ------------------------------------------------------------------------------
# Q32 MANDATORY GATE: Start initial production launch with PAYMENTS_ENABLED=false
# (returns clean HTTP 503 Q32_GATE_CLOSED on checkout while 100% of product runs live).
# Flip to "true" ONLY AFTER verifying:
#   1. Live Upstash Redis is healthy (UPSTASH_REDIS_REST_URL + TOKEN set)
#   2. Daily Firestore + MongoDB Atlas backups & clean staging restore verified
#   3. Live 2Checkout merchant credentials & signed INS/IPN webhook test passed
PAYMENTS_ENABLED=false

# Active payment processor ("2checkout" primary per D2; "dodopay" supported fallback).
PAYMENT_GATEWAY=2checkout

# Generic webhook secret fallback (used if gateway-specific secret below is blank).
PAYMENTS_WEBHOOK_SECRET=

# 2Checkout (Verifone) Instant Notification Service (INS / IPN) HMAC Secret Word.
PAYMENTS_WEBHOOK_SECRET_2CHECKOUT=<YOUR_2CHECKOUT_INS_WEBHOOK_SECRET>

# Dodo Payments Standard Webhooks signing secret (only if using PAYMENT_GATEWAY=dodopay).
PAYMENTS_WEBHOOK_SECRET_DODOPAY=

# 2Checkout Merchant Code (Account ID string, e.g., 25XXXXXXXXXX).
V2CHECKOUT_MERCHANT_CODE=<YOUR_2CHECKOUT_MERCHANT_CODE>

# 2Checkout Buy-Link / API Secret Key from Verifone 2Checkout Integrations dashboard.
V2CHECKOUT_SECRET_KEY=<YOUR_2CHECKOUT_SECRET_KEY>

# "true" in staging (.env.staging.example); MUST be "false" in production.
V2CHECKOUT_SANDBOX_MODE=false

# Optional secondary gateway credentials (leave empty unless switching D2 gateway).
DODOPAY_API_KEY=
DODOPAY_WEBHOOK_SECRET=
DODOPAY_SANDBOX_MODE=false

# ------------------------------------------------------------------------------
# 5. FIREBASE ADMIN AUTH & CLOUD FIRESTORE (4 keys — Identity & Entitlements)
# ------------------------------------------------------------------------------
# Base64-encoded single-line service account JSON (RECOMMENDED for Docker & CI):
# Generate from downloaded service-account.json via:
#   base64 -w 0 service-account.json   (Linux)
#   base64 -i service-account.json | tr -d '\n'   (macOS)
# Leave blank if using FIREBASE_SERVICE_ACCOUNT_PATH file mount on systemd VM below.
FIREBASE_SERVICE_ACCOUNT_JSON=

# Absolute path to chmod-0400 service account JSON file on Oracle VM (systemd mode):
# e.g., /etc/catalystlab/firebase-service-account.json
FIREBASE_SERVICE_ACCOUNT_PATH=/etc/catalystlab/firebase-service-account.json

# Optional Google Application Default Credentials fallback path (leave blank if above set).
GOOGLE_APPLICATION_CREDENTIALS=

# Firestore Database ID inside GCP project `catalystlabhub`.
# Use "(default)" for default Firestore DB, OR the exact named database ID matching
# `firebase-applet-config.json` (`ai-studio-catalystlab-3f711290-8b8c-407a-987c-1b002db866b4`).
FIRESTORE_DATABASE_ID=ai-studio-catalystlab-3f711290-8b8c-407a-987c-1b002db866b4

# ------------------------------------------------------------------------------
# 6. TELEMETRY STORE, UPSTASH REDIS SHARED STATE & RETENTION (6 keys — D9, 3.2, 4.1)
# ------------------------------------------------------------------------------
# MongoDB Atlas connection string using a NEW rotated least-privilege user (readWrite on
# `catalystlab_prod` ONLY — NEVER reuse historic `shuvo1807016_db_user` per SEC-2026-01!).
# URL-encode any special characters in password.
MONGODB_URI=mongodb+srv://<NEW_DB_USER>:<URL_ENCODED_PASSWORD>@<CLUSTER_HOST>/catalystlab_prod?retryWrites=true&w=majority&appName=CatalystLab

# Target database name ("catalystlab_prod" in prod, "catalystlab_staging" in staging).
MONGODB_DB_NAME=catalystlab_prod

# Unauthenticated telemetry ingest ceiling per client IP per minute (Plan 3.2).
# Verified `cl_live_*` API keys automatically receive 5x (300 req/min).
TELEMETRY_INGEST_MAX_PER_MIN=60

# Upstash Serverless Redis REST credentials (REQUIRED in production for multi-instance
# rate limiting, daily engine quotas, contact/log throttles, and Q32 payment readiness).
UPSTASH_REDIS_REST_URL=https://<YOUR_ENDPOINT>.upstash.io
UPSTASH_REDIS_REST_TOKEN=<YOUR_UPSTASH_REST_TOKEN>

# Background expired-document TTL sweep cadence in ms (21600000 = 6 hours; Plan 4.5 / D9).
SWEEP_INTERVAL_MS=21600000

# ------------------------------------------------------------------------------
# 7. TRANSACTIONAL EMAIL — MAILGUN HTTP API (5 keys)
# ------------------------------------------------------------------------------
# Domain Sending Key from Mailgun Dashboard -> Sending -> Domain Settings -> Sending API keys.
MAILGUN_API_KEY=<YOUR_MAILGUN_DOMAIN_SENDING_KEY>

# Verified Mailgun sending subdomain (keep separate from root MX domain).
MAILGUN_DOMAIN=mg.catalystlab.tech

# Mailgun regional API host: "api.mailgun.net" (US) or "api.eu.mailgun.net" (EU).
MAILGUN_HOST=api.mailgun.net

# Verified From address & display name for anomaly alerts, digests, and receipts.
MAILGUN_FROM_EMAIL=noreply@mg.catalystlab.tech
MAILGUN_FROM_NAME=CatalystLab Telemetry

# ------------------------------------------------------------------------------
# 8. GITHUB REPOSITORY WEBHOOK VERIFICATION (1 key — Plan 3.7)
# ------------------------------------------------------------------------------
# 256-bit hex secret configured in GitHub App / Repo Webhook settings (`X-Hub-Signature-256`).
# In production, /api/webhooks/github fails closed (HTTP 503) if unset.
# Generate with: openssl rand -hex 32
GITHUB_WEBHOOK_SECRET=<GENERATE_64_HEX_CHARS_VIA_OPENSSL_RAND_HEX_32>

# ------------------------------------------------------------------------------
# 9. SENTRY v11 PII-SCRUBBED ERROR & PERFORMANCE TELEMETRY (4 keys — Decision D10)
# ------------------------------------------------------------------------------
# Sentry Node/JS DSN. Leave empty to disable error forwarding cleanly.
# server/core/errorTracking.ts enforces sendDefaultPii: false & strips IPs/cookies/headers/emails.
SENTRY_DSN=https://<PUBLIC_KEY>@o<ORG_ID>.ingest.us.sentry.io/<PROJECT_ID>

# "production" or "staging"
SENTRY_ENVIRONMENT=production

# Git SHA of deployed artifact (populated automatically during deploy script).
SENTRY_RELEASE=main

# Distributed tracing sample rate: 0.1 (10%) recommended in production; 0.2 on staging.
SENTRY_TRACES_SAMPLE_RATE=0.1
```

---

## Part 2 — Step-by-Step: How to Obtain Every Credential Safely

### Step 2.1 — Cryptographic Signing Secrets (`JWT_SECRET`, `PAYMENT_SIGNING_SECRET`, `GITHUB_WEBHOOK_SECRET`)
Run locally in an unlogged shell (`HISTFILE=/dev/null`) so secrets never touch `~/.bash_history` or `~/.zsh_history`:

```bash
(
  umask 077
  printf 'JWT_SECRET=%s\n' "$(openssl rand -hex 32)"
  printf 'PAYMENT_SIGNING_SECRET=%s\n' "$(openssl rand -hex 32)"
  printf 'GITHUB_WEBHOOK_SECRET=%s\n' "$(openssl rand -hex 32)"
) > /tmp/catalystlab-generated-secrets.txt
cat /tmp/catalystlab-generated-secrets.txt
# Copy into your password vault + /etc/catalystlab/catalystlab.env, then shred:
rm -f /tmp/catalystlab-generated-secrets.txt
```

### Step 2.2 — Firebase Admin Service Account & `superadmin` Claim (`FIREBASE_SERVICE_ACCOUNT_*`, `FIRESTORE_DATABASE_ID`)
1. Open **Google Cloud Console → IAM & Admin → Service Accounts** for project `catalystlabhub` (create a separate `catalystlab-staging` project for full staging isolation).
2. Click **Create Service Account** → Name: `catalystlab-api-runtime`.
3. Grant **least-privilege roles only** (never grant `Project Owner` or `Editor`):
   - `Firebase Authentication Admin` (`roles/firebaseauth.admin`) — verifies ID tokens & custom claims
   - `Cloud Datastore User` (`roles/datastore.user`) — reads/writes `users`, `api_keys`, `user_subscriptions`, `payment_events`, `github_connected_repos`, `contact_messages`
   - *(For daily CI backup service account only)*: `Cloud Datastore Import Export Admin` (`roles/datastore.importExportAdmin`) + `Storage Object Admin` (`roles/storage.objectAdmin`) scoped to bucket `gs://catalystlabhub-firestore-backups`.
4. Go to **Keys → Add Key → Create new key (JSON)**:
   - **For Oracle VM (`systemd`)**: Upload to `/etc/catalystlab/firebase-service-account.json`, set `chown catalystlab:catalystlab /etc/catalystlab/firebase-service-account.json && chmod 0400 /etc/catalystlab/firebase-service-account.json`, and set `FIREBASE_SERVICE_ACCOUNT_PATH=/etc/catalystlab/firebase-service-account.json`.
   - **For Docker / GitHub Actions Secret (`FIREBASE_SERVICE_ACCOUNT_JSON`)**: Encode as single-line Base64 (`src/lib/serverAuth.ts` natively decodes both raw JSON and Base64!):
     ```bash
     base64 -i service-account.json | tr -d '\n' | gh secret set FIREBASE_SERVICE_ACCOUNT_JSON --env production
     ```
5. **Lock Frontend Web API Key (`firebase-applet-config.json`)**:
   - In **Google Cloud Console → APIs & Services → Credentials**, click the Browser key used in `firebase-applet-config.json` → **Application restrictions → Websites** → allow **only**:
     - `https://www.catalystlab.tech/*`
     - `https://staging.catalystlab.tech/*`
     - `http://localhost:3000/*`
6. **Deploy Firestore Security Rules & Grant Owner `superadmin` Claim**:
   ```bash
   npx firebase-tools deploy --only firestore:rules --project catalystlabhub

   # One-time owner superadmin custom claim assignment (run on Oracle host):
   FIREBASE_SERVICE_ACCOUNT_PATH=/etc/catalystlab/firebase-service-account.json \
   node -e '
     const admin = require("firebase-admin");
     const sa = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
     admin.initializeApp({ credential: admin.credential.cert(sa) });
     admin.auth().getUserByEmail("<YOUR_OWNER_EMAIL>").then(u =>
       admin.auth().setCustomUserClaims(u.uid, { role: "superadmin", superadmin: true })
     ).then(() => console.log("Superadmin claim granted."));
   '
   ```

### Step 2.3 — MongoDB Atlas (`MONGODB_URI`, `MONGODB_DB_NAME`) + Mandatory `SEC-2026-01` Rotation
1. **MANDATORY FIRST STEP (`SEC-2026-01`)**: In **MongoDB Atlas → Security → Database Access**, **delete or rotate** legacy user `shuvo1807016_db_user` immediately.
2. Click **Add New Database User**:
   - Authentication Method: `SCRAM Password` → Autogenerate 32-char alphanumeric password.
   - Built-in Role / Specific Privileges: `readWrite` restricted specifically to database `catalystlab_prod` (and a separate user restricted to `catalystlab_staging` for staging).
3. In **Security → Network Access → IP Access List**:
   - Remove `0.0.0.0/0` if present.
   - Add **only** your **Oracle Cloud VM's static public IPv4** (`<ORACLE_VM_PUBLIC_IP>/32`).
4. In **Clusters → Connect → Drivers (Node.js)**, copy the SRV string and set `MONGODB_URI`. Enable **Continuous Cloud Backup** on the cluster to satisfy `D9` (`RPO <= 24h`).

### Step 2.4 — Upstash Serverless Redis (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`)
1. Open **[console.upstash.com](https://console.upstash.com) → Create Database**:
   - Name: `catalystlab-prod-state` (create a separate `catalystlab-staging-state` DB for staging).
   - Region: Match closest region to your Oracle Cloud VM (e.g., `us-east-1` / `eu-central-1` / `ap-southeast-1`).
   - TLS: **Enabled** · Eviction: **Disabled** (so daily quota counters are never evicted before UTC midnight).
2. Under **REST API**, copy `UPSTASH_REDIS_REST_URL` (`https://....upstash.io`) and `UPSTASH_REDIS_REST_TOKEN` (Standard read/write token, **not** Read-Only token).

### Step 2.5 — Cloudflare API Token, Account ID & Zone (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`)
1. Open **Cloudflare Dashboard → Overview (`catalystlab.tech`)** → copy **Account ID** (`CLOUDFLARE_ACCOUNT_ID`) from the right sidebar.
2. Go to **My Profile → API Tokens → Create Custom Token** (`catalystlab-ci-deployer`) with minimum permissions:
   - `Account → Cloudflare Pages → Edit`
   - `Account → Workers Scripts → Edit`
   - `Zone → Workers Routes → Edit` (scoped to zone `catalystlab.tech`)
3. Save token into password vault — this becomes `CLOUDFLARE_API_TOKEN` in GitHub Environments `staging` & `production`.

### Step 2.6 — Mailgun (`MAILGUN_*`), Sentry (`SENTRY_*`), and 2Checkout (`V2CHECKOUT_*` / `PAYMENTS_WEBHOOK_SECRET_2CHECKOUT`)
- **Mailgun**: Add subdomain `mg.catalystlab.tech` in Mailgun (US or EU region), publish the 2 TXT (`SPF` + `DKIM`), 2 MX, and CNAME records in Cloudflare DNS (`DNS only` grey cloud), verify domain, then create a **Domain Sending Key** under *Domain Settings → Sending API keys*.
- **Sentry**: Create project `catalystlab-api` (Platform: `Node.js / Express`), disable *"Store Native Crash Reports / Default PII"* in Project Security settings, and copy the **Client Key (DSN)** into `SENTRY_DSN`.
- **2Checkout (Verifone)**: Keep `PAYMENTS_ENABLED=false` for launch day (`Q32`). When ready for Phase 8 monetization:
  - Copy **Merchant Code** (`V2CHECKOUT_MERCHANT_CODE`) and **Buy-Link / Secret Key** (`V2CHECKOUT_SECRET_KEY`) from *Integrations → Webhooks & API*.
  - Configure **INS / IPN Webhook URL** to `https://www.catalystlab.tech/api/payments/webhook/2checkout` (`POST`), generate an **INS Secret Word** (`PAYMENTS_WEBHOOK_SECRET_2CHECKOUT`), and test in sandbox against `https://staging.catalystlab.tech/api/payments/webhook/2checkout` first.

---

## Part 3 — Complete Step-by-Step Production Deployment Playbook

### Phase 1 — Provision & Harden Oracle Cloud Always Free Origin Host (`Plane C`)

1. **Create Ampere A1 Compute Instance** in Oracle Cloud Infrastructure (OCI):
   - Image: **Ubuntu 24.04 LTS Minimal aarch64**
   - Shape: `VM.Standard.A1.Flex` — **2 OCPU / 12 GB RAM** (Always Free tier; `ops/systemd/catalystlab.service` sets `CPUQuota=200%` and `MemoryMax=10G`).
   - Networking: Assign reserved public IPv4; allow **only SSH (`22/tcp`) from your admin IP** in OCI Security List (**zero public HTTP/HTTPS ports needed** because Cloudflare Tunnel connects outbound over QUIC/TLS 1.3!).
2. **Bootstrap OS, Node 24, Unprivileged User & Firewall on the VM**:
   ```bash
   sudo apt-get update && sudo apt-get upgrade -y
   sudo apt-get install -y ca-certificates curl gnupg git ufw unattended-upgrades jq

   # Lock down inbound firewall (SSH only; port 3000 stays loopback/tunnel-only)
   sudo ufw default deny incoming
   sudo ufw default allow outgoing
   sudo ufw allow OpenSSH
   sudo ufw --force enable

   # Install Node.js 24 LTS matching .nvmrc
   curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
   sudo apt-get install -y nodejs
   node -v   # Verify v24.x

   # Create dedicated unprivileged system user + directories
   sudo useradd --system --create-home --home-dir /home/catalystlab --shell /usr/sbin/nologin catalystlab || true
   sudo mkdir -p /opt/catalystlab /etc/catalystlab
   sudo chmod 0750 /etc/catalystlab
   ```
3. **Install Cloudflare Tunnel (`cloudflared`) to Expose `localhost:3000` Privately at `https://origin-api.catalystlab.tech`**:
   > **CRITICAL (`worker/api-proxy.js` invariant):** Do **NOT** name the tunnel hostname `api.catalystlab.tech` (explicitly blocked in `PLACEHOLDER_HOSTS`) or `www.catalystlab.tech` (which creates an infinite Worker proxy loop). Use **`origin-api.catalystlab.tech`** for production and **`origin-staging.catalystlab.tech`** for staging, protected by a Cloudflare WAF Custom Rule allowing requests only from your Worker / verified headers if desired.
   ```bash
   # Install official cloudflared package
   curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | sudo tee /usr/share/keyrings/cloudflare-main.gpg >/dev/null
   echo "deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared any main" \
     | sudo tee /etc/apt/sources.list.d/cloudflared.list
   sudo apt-get update && sudo apt-get install -y cloudflared

   # Authenticate & create named tunnel pointing to http://127.0.0.1:3000
   cloudflared tunnel login
   cloudflared tunnel create catalystlab-prod-origin
   cloudflared tunnel route dns catalystlab-prod-origin origin-api.catalystlab.tech
   ```
   Write `/etc/cloudflared/config.yml` and enable the system service:
   ```yaml
   tunnel: catalystlab-prod-origin
   credentials-file: /root/.cloudflared/<TUNNEL_UUID>.json
   ingress:
     - hostname: origin-api.catalystlab.tech
       service: http://127.0.0.1:3000
       originRequest:
         connectTimeout: 10s
         noTLSVerify: false
     - service: http_status:404
   ```
   ```bash
   sudo cloudflared service install
   sudo systemctl enable --now cloudflared
   ```

4. **Place `/etc/catalystlab/catalystlab.env` (`0600`) & Deploy Backend Release**:
   ```bash
   # 1. Populate /etc/catalystlab/catalystlab.env from Part 1 template above (with PAYMENTS_ENABLED=false)
   sudo editor /etc/catalystlab/catalystlab.env
   sudo chown root:catalystlab /etc/catalystlab/catalystlab.env
   sudo chmod 0640 /etc/catalystlab/catalystlab.env

   # 2. Clone repo, build production bundle cleanly under Node 24, prune devDependencies
   sudo git clone --branch main --depth 1 https://github.com/myself-aas/CatalystLab.git /opt/catalystlab
   cd /opt/catalystlab
   sudo -E env $(grep -E '^(APP_ORIGIN|VITE_APP_ORIGIN|NODE_ENV|FIREBASE_SERVICE_ACCOUNT_PATH)=' /etc/catalystlab/catalystlab.env | xargs) \
     bash -c 'npm ci && npm run check:env && npm run build && npm run check:bundle && npm prune --omit=dev'
   sudo chown -R catalystlab:catalystlab /opt/catalystlab

   # 3. Install & start hardened systemd service
   sudo cp /opt/catalystlab/ops/systemd/catalystlab.service /etc/systemd/system/catalystlab.service
   sudo systemctl daemon-reload
   sudo systemctl enable --now catalystlab.service
   sudo systemctl status catalystlab.service --no-pager

   # 4. Run full 25-contract local origin verification immediately
   node /opt/catalystlab/scripts/verify-deployment.mjs http://127.0.0.1:3000
   curl -fsS https://origin-api.catalystlab.tech/api/v1/system/health
   ```

   *(Container Alternative — if running Docker instead of native `systemd`)*:
   ```bash
   cd /opt/catalystlab
   docker build \
     --build-arg APP_ORIGIN=https://www.catalystlab.tech \
     --build-arg VITE_APP_ORIGIN=https://www.catalystlab.tech \
     -t catalystlab:prod .
   docker run -d --restart unless-stopped \
     --name catalystlab-api \
     -p 127.0.0.1:3000:3000 \
     --env-file /etc/catalystlab/catalystlab.env \
     catalystlab:prod
   ```

---

### Phase 2 — Enable Scheduled Daily Cloud Backups (`Plan 4.6`, `RPO <= 24h`, `RTO <= 4h`)

Run from an admin workstation with `gcloud` authenticated to project `catalystlabhub`:

```bash
GCP_PROJECT_ID="catalystlabhub" \
GCP_REGION="us-central1" \
FIRESTORE_DATABASE_ID="ai-studio-catalystlab-3f711290-8b8c-407a-987c-1b002db866b4" \
bash ops/gcloud/setup-firestore-backups.sh
```

This single idempotent script:
1. Creates encrypted bucket `gs://catalystlabhub-firestore-backups` with `public-access-prevention` and a **30-day lifecycle purge rule** (`D9`).
2. Enables **7-day Firestore Point-in-Time Recovery (PITR)**.
3. Creates a **daily native Firestore backup schedule** retaining snapshots for 30 days.

---

### Phase 3 — Configure Cloudflare Pages, Worker Proxy & Apex `301` Redirect (`Plane B`, `D14`)

1. **Create Cloudflare Pages Project (`catalystlab-web`)**:
   ```bash
   export CLOUDFLARE_ACCOUNT_ID="<YOUR_CLOUDFLARE_ACCOUNT_ID>"
   export CLOUDFLARE_API_TOKEN="<YOUR_CLOUDFLARE_API_TOKEN>"

   npx wrangler pages project create catalystlab-web --production-branch=main
   ```
2. **Attach Custom Domains in Cloudflare Pages → `catalystlab-web` → Custom domains**:
   - Add **`www.catalystlab.tech`** → maps `www` CNAME to `catalystlab-web.pages.dev` (Proxied orange cloud).
   - Add **`staging.catalystlab.tech`** → bind to Preview branch `staging` (Proxied orange cloud).
3. **Configure Apex `catalystlab.tech` → `https://www.catalystlab.tech` `301` Redirect (`D14`)**:
   - In **Cloudflare Dashboard → Zone `catalystlab.tech` → DNS**: add proxied dummy `AAAA` record `@` → `100::` (Proxied orange cloud).
   - Go to **Rules → Redirect Rules → Create rule (`Apex to Canonical WWW 301`)**:
     - When incoming requests match: `(http.host eq "catalystlab.tech")`
     - Then: **Dynamic Redirect** → Expression: `concat("https://www.catalystlab.tech", http.request.uri.path)` · Status code: **`301`** · Preserve query string: **Checked**.
4. **Inject Worker Origin Secrets & Deploy `worker/api-proxy.js`**:
   ```bash
   # Staging Worker secret + route (staging.catalystlab.tech/api/*)
   printf '%s' 'https://origin-staging.catalystlab.tech' | npx wrangler secret put API_ORIGIN --env staging
   npx wrangler deploy --env staging

   # Production Worker secret + routes (www.catalystlab.tech/api/* & catalystlab.tech/api/*)
   printf '%s' 'https://origin-api.catalystlab.tech' | npx wrangler secret put API_ORIGIN --env production
   npx wrangler deploy --env production
   ```

---

### Phase 4 — Configure GitHub Environments & Secrets for Automated CI/CD (`Plane D`)

1. In **GitHub → `myself-aas/CatalystLab` → Settings → Environments**:
   - Create environment **`staging`** (`https://staging.catalystlab.tech`).
   - Create environment **`production`** (`https://www.catalystlab.tech`) → enable **Required reviewers** (add your GitHub account so no automated push ever deploys straight to `www` without explicit owner approval!).
2. Populate secrets & variables directly via `gh` CLI:
   ```bash
   # Staging Environment Secrets
   gh secret set CLOUDFLARE_API_TOKEN --env staging
   gh secret set CLOUDFLARE_ACCOUNT_ID --env staging
   printf '%s' 'https://origin-staging.catalystlab.tech' | gh secret set STAGING_API_ORIGIN --env staging
   base64 -i staging-firebase-sa.json | tr -d '\n' | gh secret set FIREBASE_SERVICE_ACCOUNT_JSON --env staging

   # Production Environment Secrets
   gh secret set CLOUDFLARE_API_TOKEN --env production
   gh secret set CLOUDFLARE_ACCOUNT_ID --env production
   printf '%s' 'https://origin-api.catalystlab.tech' | gh secret set PRODUCTION_API_ORIGIN --env production
   base64 -i prod-firebase-sa.json | tr -d '\n' | gh secret set FIREBASE_SERVICE_ACCOUNT_JSON --env production

   # Repository-Level Scheduled Backup Secrets & Variable (.github/workflows/backup.yml runs daily at 02:15 UTC)
   cat prod-backup-sa.json | gh secret set GCP_SERVICE_ACCOUNT_KEY
   printf '%s' 'gs://catalystlabhub-firestore-backups' | gh secret set FIRESTORE_BACKUP_BUCKET
   gh variable set FIRESTORE_DATABASE_ID --body "ai-studio-catalystlab-3f711290-8b8c-407a-987c-1b002db866b4"
   ```

---

### Phase 5 — Execute Staged Cutover & Verify All Live Contracts

1. **Deploy & Verify Staging First (`Plan 10.1`)**:
   ```bash
   gh workflow run deploy.yml -f target_environment=staging
   # Once green, verify all 25 HTTP/CSP/Header/Health/404/Q32 contracts live:
   node scripts/verify-deployment.mjs https://staging.catalystlab.tech

   # Trigger scheduled backup & clean-instance restore workflow once manually to prove daily RPO <= 24h:
   gh workflow run backup.yml
   ```
2. **Deploy Production (`PAYMENTS_ENABLED=false` Safe Launch per `Q32`)**:
   ```bash
   gh workflow run deploy.yml -f target_environment=production
   # Approve the pending deployment gate in GitHub Actions UI, then verify live production:
   node scripts/verify-deployment.mjs https://www.catalystlab.tech

   # Verify D14 apex 301 redirect + legacy .html 301 + 501 stub + strict headers:
   curl -sSI https://catalystlab.tech/pricing | grep -E '^HTTP/|^location:'
   curl -sSI https://www.catalystlab.tech/pricing.html | grep -E '^HTTP/|^location:'
   ```

---

### Phase 6 — Post-Launch `Q32` Monetization Flip (`PAYMENTS_ENABLED=true`)

Flip `PAYMENTS_ENABLED=true` **only** when every item below has a recorded pass:
- [ ] `curl -sS https://www.catalystlab.tech/api/v1/system/health` returns `200 {"status":"operational"}` and Upstash Redis shows active live commands in Upstash Console (`Plan 4.1`).
- [ ] `backup.yml` daily run and `ops/gcloud/setup-firestore-backups.sh` have completed at least one cloud export **and** been restored cleanly onto staging (`Plan 4.6`).
- [ ] 2Checkout sandbox webhook test (`ORDER_CREATED` → `RECURRING_STOPPED` → `REFUND_ISSUED`) succeeded end-to-end against `staging.catalystlab.tech` (`Plan 2.4`).
- [ ] Live `V2CHECKOUT_MERCHANT_CODE`, `V2CHECKOUT_SECRET_KEY`, `PAYMENTS_WEBHOOK_SECRET_2CHECKOUT`, and `V2CHECKOUT_SANDBOX_MODE=false` are set in `/etc/catalystlab/catalystlab.env`.

Then enable live payments with zero downtime:
```bash
sudo sed -i 's/^PAYMENTS_ENABLED=false$/PAYMENTS_ENABLED=true/' /etc/catalystlab/catalystlab.env
sudo systemctl restart catalystlab.service
sudo journalctl -u catalystlab.service -n 30 --no-pager
```

---

### Phase 7 — Instant Emergency Rollback Procedure (`< 2 Minutes`)

1. **Frontend + Edge Rollback (GitHub Actions One-Click)**:
   ```bash
   gh workflow run rollback.yml -f ref=<LAST_KNOWN_GOOD_SHA_OR_TAG> -f deploy_pages=true
   ```
2. **Backend Origin Host Rollback (Oracle VM)**:
   ```bash
   cd /opt/catalystlab
   sudo git fetch origin --tags
   sudo git checkout <LAST_KNOWN_GOOD_SHA_OR_TAG>
   sudo -E env $(grep -E '^(APP_ORIGIN|VITE_APP_ORIGIN|NODE_ENV|FIREBASE_SERVICE_ACCOUNT_PATH)=' /etc/catalystlab/catalystlab.env | xargs) \
     bash -c 'npm ci && npm run build && npm prune --omit=dev'
   sudo chown -R catalystlab:catalystlab /opt/catalystlab
   sudo systemctl restart catalystlab.service
   node /opt/catalystlab/scripts/verify-deployment.mjs https://www.catalystlab.tech
   ```
3. **Kill-Switch Only (Disable Checkout Instantly Without Redeploying)**:
   ```bash
   sudo sed -i 's/^PAYMENTS_ENABLED=true$/PAYMENTS_ENABLED=false/' /etc/catalystlab/catalystlab.env
   sudo systemctl restart catalystlab.service
   ```
