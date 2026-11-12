# Technology Stack

> Regenerated 2026-11-12 by the `acquire-codebase-knowledge` workflow against branch
> `arena/b1761471-catalystlab` (base commit `1babd3a`). Supersedes the 2026-10-21
> revision, whose claims about `.nvmrc`, the lockfile, the env templates and the
> test count no longer hold — see `CONCERNS.md` §5.
>
> Every claim below cites a file path or command output from this session.
> `[TODO]` = not determinable from the repository. `[ASK USER]` = needs owner intent
> (numbered questions in `CONCERNS.md` §6).

## Core Sections (Required)

### 1) Runtime Summary

| Area | Value | Evidence |
|------|-------|----------|
| Primary language | TypeScript — 61,909 lines in `src/` excluding `src/tests/`, 6,745 in `server/`, 262 in `server.ts`, 6,561 in `src/tests/`, 3,444 in `scripts/` (`find … \| xargs cat \| wc -l`) | `tsconfig.json`, `server.ts`, `server/` |
| Strictness | `strict: true`, but `useUnknownInCatchVariables: false`, `noUnusedLocals: false`, `noUnusedParameters: false`; `@typescript-eslint/no-explicit-any` is **off** (69 `: any` annotations, 80 `as any` casts in `src/`+`server/`) | `tsconfig.json`, `eslint.config.js`, `grep -rn ": any"` |
| Secondary languages | Plain JS/ESM: `worker/api-proxy.js`, `public/sw.js`, `public/telemetry.js`, `public/xss-guard.js`, `scripts/*.mjs`; Python 3.11 tooling only (`scripts/replace_images.py`); CSS 4,188 lines across `src/index.css`, `patch.css`, `src/styles/*.css` | file listing, `pyproject.toml` |
| Runtime declared | **Node 24.** `.nvmrc` = `24` (restored 2026-11-12), `package.json` `engines.node: ">=24"`, `package-lock.json` root entry `>=24`, `Dockerfile` `node:24-bookworm-slim` — all four agree, and every `node-version-file: .nvmrc` step now resolves (pinned by `src/tests/server/runtimeContract.test.ts`) | `package.json:7`, `package-lock.json:70-71`, `.nvmrc`, `.github/workflows/*.yml`, `Dockerfile:5` |
| Runtime observed | Node **v22.22.3**, npm **10.9.8**, Python **3.11.2** in this sandbox | `node --version`, `npm --version`, `python3 --version` |
| Package manager | npm (`package-lock.json`, `lockfileVersion: 3`, 568 KB); `npm ci` succeeded in this session | `package-lock.json:4`, `/tmp/npmci.log` |
| Module system | ESM (`"type": "module"`), `target: ES2022`, `module: ESNext`, `moduleResolution: bundler`; the production server is bundled to **CJS** (`dist/server.cjs`) by esbuild | `package.json:5`, `tsconfig.json`, `scripts.build` |
| Build system | Client: Vite 8 (`vite build`) with terser 2-pass minify, 6 manual vendor chunks, CSS code-splitting. Prerender: `tsx scripts/prerender.ts`. Server: `esbuild server.ts --bundle --platform=node --format=cjs --packages=external`. Dev: `tsx server.ts` (Express + Vite middleware, HMR disabled) | `vite.config.ts`, `package.json` `scripts`, `scripts/prerender.ts` |
| Package identity | `catalystlab@2.4.0`, `private: true`, no `version` published anywhere | `package.json` |
| Containerisation | Multi-stage `node:24-bookworm-slim`; runtime stage runs `npm ci --omit=dev`, copies `dist/`, `public/`, `scripts/` and the three `.env*.example` templates, drops to `USER node`, `HEALTHCHECK` on `/api/v1/system/health` | `Dockerfile` |

### 2) Production Frameworks and Dependencies

All 29 entries of `dependencies` (versions as ranged in `package.json`):

| Dependency | Version | Role in system | Evidence |
|------------|---------|----------------|----------|
| react / react-dom | ^19.3.1 | SPA runtime, `StrictMode`, root provider tree | `package.json`, `src/main.tsx` |
| react-router-dom | ^7.18.4 | Client routing (`BrowserRouter` + `React.lazy` route table) | `src/App.tsx`, `src/main.tsx` |
| express | ^5.3.0 | HTTP API + static/SPA host | `server/app.ts`, `server.ts` |
| vite / @vitejs/plugin-react (dev) | ^8.3.4 | Client build + dev middleware (production dep, used only at build/dev time) | `vite.config.ts` |
| tailwindcss / @tailwindcss/vite (dev) | ^4.3.3 | Styling — v4 CSS-first `@import "tailwindcss"` | `src/index.css:1` |
| firebase | ^13.0.0 | Client Auth + Firestore SDK | `src/lib/firebase.ts` |
| firebase-admin | ^14.5.0 | Server-side ID-token verification, Firestore subscription/API-key writes | `src/lib/serverAuth.ts`, `server/core/subscriptions.ts`, `server/core/apiKeys.ts` |
| mongodb | ^7.7.0 | Native-driver telemetry/analytics + state-sync store (no ODM; Mongoose error names are only *matched* in the error handler) | `src/lib/analyticsEngine.ts`, `server/routes/stateSync.ts`, `server/app.ts` |
| @upstash/redis + @upstash/ratelimit | ^1.39.0 / ^2.2.0 | Shared daily-quota ledger and distributed burst limiter; in-memory fallback | `server/core/dailyQuota.ts`, `server/core/sharedLimiter.ts`, `server/core/rateLimit.ts` |
| zod | ^4.6.7 | Request/DTO validation; schema factories shared client↔server | `src/lib/validation.ts`, `server/core/enginesCatalog.ts` |
| zustand | ^5.0.15 | Client state (6 slices + Mongo-sync middleware) | `src/store/useAppStore.ts` |
| helmet | ^8.3.0 | CSP/HSTS/COOP/CORP header baseline | `server/app.ts` |
| pino | ^10.4.0 | Structured JSON logging with allowlist serializers | `server/core/logger.ts` |
| @sentry/node | ^11.8.0 | Server error tracking (opt-in via `SENTRY_DSN`; no browser SDK) | `server/core/errorTracking.ts` |
| motion | ^14.4.0 | Canonical animation engine (`motion/react`) | `src/App.tsx:5`, `AGENTS.md` §5 |
| recharts / d3 / cobe | ^3.10.1 / ^7.9.0 / ^2.0.1 | Charts, D3 maths, WebGL globe | `src/components/charts/*`, `src/components/ui/edge-mesh-globe.tsx` |
| cheerio | ^1.2.0 | HTML parsing inside the audit engines | `src/lib/nodeEngines.ts:2` |
| geoip-lite / ua-parser-js | ^2.0.3 / ^2.0.10 | Local geo/UA enrichment of telemetry (no third-party calls) | `server/routes/telemetry.ts` |
| lucide-react | ^1.60.0 | Icon set | `AGENTS.md` §7, `src/components/**` |
| clsx / tailwind-merge / class-variance-authority | ^2.1.1 / ^3.7.0 / ^0.7.1 | `cn()` class composition (shadcn-style) | `src/lib/utils.ts`, `components.json` |
| dotenv | ^18.0.8 | Env loading in `server.ts` and `scripts/prerender.ts` | `server.ts:15`, `scripts/prerender.ts:16` |
| tsx | ^4.23.15 | TypeScript execution for `dev`, `build`, `drill:restore` — shipped as a *production* dependency | `package.json` scripts |

> Note: `vite` and `tsx` are runtime-irrelevant yet listed under `dependencies`, so
> the Docker runtime layer installs them (`npm ci --omit=dev`). See `CONCERNS.md` §2.

### 3) Development Toolchain

| Tool | Purpose | Evidence |
|------|---------|----------|
| typescript ^6.0.3 | `tsc --noEmit` hard gate (`npm run typecheck`); ran clean in this session | `package.json`, `tsconfig.json` |
| eslint ^9 + typescript-eslint ^8.72 + eslint-plugin-react + eslint-plugin-jsx-a11y | Flat config; `ignores` skip `scripts/**`, `public/**`, `*.config.*`, so `eslint .` effectively lints `src/`, `server/`, `server.ts`; many a11y rules deliberately off | `eslint.config.js`, `npm run lint` (clean this session) |
| vitest ^5.0.5 + @vitest/coverage-v8 + jsdom + @testing-library/react + jest-dom + supertest | Unit/UI/server-route tests; v8 coverage ratchet on `server/**` only | `vitest.config.ts` |
| playwright ^1.64.1 + @playwright/test | Chromium smoke against `dist/server.cjs` | `playwright.config.ts`, `e2e/smoke/release-smoke.spec.ts` |
| @lhci/cli ^0.15.1 | Lighthouse CI budgets | `.lighthouserc.json`, `scripts/report-lhci.mjs` |
| esbuild ^0.28.2 / terser ^5.51.2 | Server bundle / client minify | `package.json`, `vite.config.ts` |
| black / ruff / mypy(strict) / pytest / pytest-cov | Python tooling for `scripts/replace_images.py` only | `pyproject.toml`, `scripts/requirements-dev.txt` |
| semgrep + gitleaks | SAST and secret scanning | `.semgrep.yml`, `.gitleaks.toml`, `scripts/scan-secrets.mjs` |
| Dependabot | Weekly grouped npm updates with eslint pins | `.github/dependabot.yml` |
| Impeccable hooks | Design-system hook manifest | `.impeccable/config.json`, `.github/hooks/impeccable.json` |
| Ad-hoc audit scripts | `tools/theme-audit.mjs` (puppeteer-core), `tools/contrast-*.py` — not wired into any npm script | `tools/`, `grep -rn theme-audit package.json` (empty) |

### 4) Key Commands

```bash
npm ci                                        # install (verified: exit 0 this session)
cp .env.example .env                          # every integration fails closed when unset
GITHUB_WEBHOOK_SECRET=dev-secret npm run dev  # tsx server.ts → Express + Vite middleware on :3000
npm run build                                 # vite build → prerender → esbuild dist/server.cjs
npm start                                     # node dist/server.cjs
npm test                                      # vitest run --sequence.shuffle
npm run test:coverage                         # + v8 ratchet over server/**
npm run test:e2e                              # playwright (needs a built dist/)
npm run typecheck                             # tsc --noEmit
npm run lint                                  # eslint .
npm run check:env                             # env/template parity preflight
npm run check:colors                          # raw hex-literal ratchet
npm run check:design                          # design-token sanity
npm run check:bundle                          # bundle-size budgets (needs dist/)
npm run sec:secrets                           # secret scan over HEAD + history
npm run media:check                           # verify remote media endpoints
npm run drill:restore                         # backup/restore RTO drill
npm run test:payments-sandbox                 # payment state-machine e2e
npm run test:load                             # k6-alternative peak-load SLO benchmark
npm run ci                                    # check:env → check:colors → lint → typecheck → test → build → check:bundle
npm run ci:full                               # ci + coverage + drill:restore + payments sandbox + sec:secrets
```

Measured in this session: `npm test` **420 passed / 44 files**, `npm run test:coverage`
**71.3% stmts / 59.22% branch / 75.3% funcs / 72.53% lines**, `npm run build` green,
`check:bundle` green (2,252 kB raw / 667 kB gzip vs 3,400/900 budgets), `check:colors`
green, `check:design` green, `sec:secrets` green, `drill:restore` green,
`test:payments-sandbox` green, **`npm run check:env` FAILED** (see CONCERNS §1).

### 5) Environment and Config

- Config sources: `.env.example` (41 keys), `.env.staging.example` (42), `.env.production.example` (42), `firebase-applet-config.json` (public Firebase web config), `wrangler.toml` (Worker `API_ORIGIN` injected as a secret), `vite.config.ts`, `tsconfig.json`, `.lighthouserc.json`, `.impeccable/*`, `components.json`.
- Variable groups read by code (`grep process.env` over `src|server|scripts|worker|public`):
  - **Origin/SEO**: `APP_ORIGIN`, `VITE_APP_ORIGIN` (`src/config/site.ts`).
  - **Identity**: `FIREBASE_SERVICE_ACCOUNT_JSON`, `FIREBASE_SERVICE_ACCOUNT_PATH`, `GOOGLE_APPLICATION_CREDENTIALS`, `FIRESTORE_DATABASE_ID` (`src/lib/serverAuth.ts`).
  - **Persistence**: `MONGODB_URI`, `MONGODB_DB_NAME`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.
  - **Payments**: `PAYMENTS_ENABLED`, `PAYMENT_GATEWAY`, `PAYMENT_SIGNING_SECRET`, `JWT_SECRET`, `V2CHECKOUT_*`, `DODOPAY_*`, `PAYMENTS_WEBHOOK_SECRET*`.
  - **Messaging/webhooks**: `MAILGUN_*`, `GITHUB_WEBHOOK_SECRET`, `VALID_API_KEYS`.
  - **Ops**: `SENTRY_DSN`, `SENTRY_ENVIRONMENT`, `SENTRY_TRACES_SAMPLE_RATE`, `SENTRY_RELEASE`, `LOG_LEVEL`, `PORT`, `HOST`, `TRUST_PROXY`, `ALLOW_UNAUTH_DEMO`, `TELEMETRY_INGEST_MAX_PER_MIN`, `SWEEP_INTERVAL_MS`.
- Orphan keys: `GEMINI_API_KEY` exists only in `.env.example` and is read by **no** file (`metadata.json` declares a GEMINI capability). `NODE_ENV`/`PORT` exist only in the staging/production templates. See CONCERNS §1.
- Deployment/runtime constraints: split hosting (D3(b)/Q31/Q32) — static `dist/` on Cloudflare Pages, `/api/*` through a Cloudflare Worker to a Node host (Oracle Always Free, Render Free fallback); `TRUST_PROXY=true` expected behind that Worker; `PAYMENTS_ENABLED` must be `false` until Upstash is configured (Q32).

### 6) Evidence

- `package.json`, `package-lock.json`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `playwright.config.ts`, `eslint.config.js`
- `Dockerfile`, `wrangler.toml`, `.nvmrc` (`24`), `.env.example` / `.env.staging.example` / `.env.production.example`
- `server.ts`, `server/app.ts`, `src/main.tsx`, `src/config/site.ts`
- `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`, `.github/workflows/backup.yml`, `.github/workflows/rollback.yml`, `.github/workflows/media-verify.yml`
- Session command output: `npm ci`, `npx eslint .`, `npx tsc --noEmit`, `npx vitest run`, `npm run build`, `npm run check:bundle`, `npm run check:env`, `npm run sec:secrets`, `npm run drill:restore`, `npm run test:payments-sandbox`, `node --version`

## Extended Sections (Optional)

### Environment matrix

| Environment | How it is produced | Origin | Payments |
|---|---|---|---|
| local dev | `tsx server.ts` (Vite middleware) | `APP_ORIGIN`/`VITE_APP_ORIGIN` optional, defaults to `https://www.catalystlab.tech` (`src/config/site.ts`) | `503` unless configured |
| CI | `npm run ci` + 4 extra jobs | Workflow-level `APP_ORIGIN=https://www.catalystlab.tech` | `PAYMENTS_ENABLED=false` in smoke steps |
| staging | `.github/workflows/deploy.yml` → Pages + Worker | `https://staging.catalystlab.tech` | inherits from secrets |
| production | manual `workflow_dispatch` gate, `environment: production` | `https://www.catalystlab.tech` | requires owner-armed secrets (Q32) |
