# Technology Stack

> Regenerated 2026-10-21 by the `acquire-codebase-knowledge` workflow (supersedes the 2026-10-19 revision, which predates root commit `d2c26ef`). Every claim cites a file path or command output from this session. `[TODO]` = not determinable from the repo. `[ASK USER]` = needs owner intent (numbered list in `CONCERNS.md` §6).

## Core Sections (Required)

### 1) Runtime Summary

| Area | Value | Evidence |
|------|-------|----------|
| Primary language | TypeScript, `strict: true` (with `useUnknownInCatchVariables: false`, `noUnusedLocals/Parameters: false`). 66,344 lines in `src/` (excl. tests), 6,674 in `server/`, 1,689 in root `components/`, 5,520 in `src/tests/` | `tsconfig.json`; `find … \| xargs wc -l` this session |
| Secondary languages | Plain JS: root codemod scripts (`.mjs`/`.cjs`), `worker/api-proxy.js`, `public/*.js`; Python 3.11 tooling only (`scripts/replace_images.py`, `pyproject.toml` mypy-strict/black/ruff/pytest config); CSS (Tailwind v4 CSS-first tokens) | `pyproject.toml`, repo root listing, `src/index.css` |
| Runtime + version | Node.js **>= 24** declared in `engines`; `.nvmrc` = `24` restored 2026-10-21 (Q43/D5) — all 5 GitHub workflows pin via `node-version-file: .nvmrc`. Verification gates in this session ran on Node v22.22.3 (sandbox); declared runtime is 24 | `package.json` `engines`; `.nvmrc`; `.github/workflows/*`; `node --version` |
| Package manager | npm — `package-lock.json` regenerated & committed 2026-10-21 (Q43/D6, lockfileVersion 3, ~580 KB); `npm ci` verified working (1102 packages, exit 0). No `bun.lock` (D6) | `package-lock.json`, `.github/workflows/ci.yml`, `Dockerfile:8,30`, `/tmp/npmci.log` this session |
| Module system | ESM (`"type": "module"`), `target: ES2022`, `moduleResolution: bundler`; the production server is bundled to CJS (`dist/server.cjs`) via esbuild | `package.json`, `tsconfig.json`, `package.json` `scripts.build` |
| Build system | Client: Vite **8** (`vite build`, terser 2-pass minify, 6 manual vendor chunks, CSS code-split). Prerender: `tsx scripts/prerender.ts` (route shells, `404.html`, `sitemap.xml` index + four section sitemaps, `routes.json`). Server: `esbuild server.ts --bundle --platform=node --format=cjs --packages=external`. Dev: `tsx server.ts` (Express + Vite middleware, HMR disabled) | `vite.config.ts`, `package.json` `scripts`, `scripts/prerender.ts` header |
| Package identity | `catalystlab@2.4.0`, `private: true` | `package.json` |
| Containerisation | Multi-stage `node:24-bookworm-slim` Dockerfile, non-root `node` user, `npm ci --omit=dev` runtime layer, `/api/v1/system/health` HEALTHCHECK. COPY sources (`package-lock.json`, `.env.staging.example`, `.env.production.example`) restored 2026-10-21 (Q43); docker build itself runs in CI (`security-and-container` job), not re-executed in this sandbox `[TODO: verify on next CI run]` | `Dockerfile:1-45`, `.env.*.example`, `.github/workflows/ci.yml` |

### 2) Production Frameworks and Dependencies

Only `dependencies` from `package.json` (versions as ranged there; no lockfile pins them — see §1).

| Dependency | Version | Role in system | Evidence |
|------------|---------|----------------|----------|
| react / react-dom | ^19.3.1 | SPA UI runtime (React 19, `StrictMode`) | `package.json`, `src/main.tsx` |
| react-router-dom | ^7.18.4 | Client routing (`BrowserRouter`, lazy routes) | `package.json`, `src/App.tsx` |
| express | ^5.3.0 | HTTP API + SPA host (Express 5) | `package.json`, `server/app.ts` |
| vite / @vitejs/plugin-react | ^8.3.4 / ^6.1.2 | Client build + dev middleware | `package.json`, `vite.config.ts` |
| tailwindcss / @tailwindcss/vite | ^4.3.3 | Styling (v4 CSS-first `@import "tailwindcss"`) | `package.json`, `src/index.css:1` |
| firebase | ^13.0.0 | Client Auth + Firestore SDK | `package.json`, `src/lib/firebase.ts`, `firebase-applet-config.json` |
| firebase-admin | ^14.5.0 | Server-side ID-token verification, Firestore subscription writes | `package.json`, `src/lib/serverAuth.ts`, `server/core/subscriptions.ts` |
| mongodb | ^7.7.0 | Time-series analytics/telemetry store (native driver, no ODM) | `package.json`, `src/lib/analyticsEngine.ts` |
| @upstash/redis + @upstash/ratelimit | ^1.39.0 / ^2.2.0 | Shared (multi-instance) rate-limit ledger; in-memory fallback when unset | `package.json`, `server/core/sharedLimiter.ts`, `server/core/rateLimit.ts` |
| zod | ^4.6.7 | Request/schema validation across routes and engines | `package.json`, `src/lib/validation.ts`, `server/routes/engines.ts` |
| zustand | ^5.0.15 | Client state (slice pattern + `mongoSyncMiddleware`) | `package.json`, `src/store/useAppStore.ts` |
| helmet | ^8.3.0 | Security headers/CSP baseline | `package.json`, `server/app.ts` |
| pino | ^10.4.0 | Structured JSON server logs with allowlist serializers | `package.json`, `server/core/logger.ts` |
| @sentry/node | ^11.8.0 | Server error tracking (client errors relay via `/api/client-logs`; no browser SDK) | `package.json`, `server/core/errorTracking.ts`, README "Secrets hygiene" |
| motion | ^14.4.0 | Animation engine (`motion/react`) — canonical per AGENTS.md §5 | `package.json`, `src/App.tsx:5`, `AGENTS.md` |
| recharts / d3 / cobe | ^3.10.1 / ^7.9.0 / ^2.0.1 | Charts and WebGL globe (edge-mesh visualization) | `package.json`, `src/components/ui/edge-mesh-globe.tsx` |
| cheerio | ^1.2.0 | HTML parsing inside audit engines | `package.json`, `src/lib/nodeEngines.ts:2` |
| geoip-lite / ua-parser-js | ^2.0.3 / ^2.0.10 | Local (no third-party) geo/UA enrichment of telemetry | `package.json`, `docs/ARCHITECTURE.md` telemetry section |
| lucide-react | ^1.60.0 | Icon set (canonical per AGENTS.md §7) | `package.json`, `AGENTS.md` |
| clsx / tailwind-merge / class-variance-authority | ^2.1.1 / ^3.7.0 / ^0.7.1 | Class composition utilities (shadcn-style `cn`) | `package.json`, `components.json` |
| dotenv | ^18.0.8 | Env loading in `server.ts` and prerender | `package.json`, `server.ts:13-14` |
| tsx | ^4.23.15 | TS execution for dev server and scripts (listed under `dependencies`, used by `dev`/`build`/`drill` scripts) | `package.json` scripts |

### 3) Development Toolchain

| Tool | Purpose | Evidence |
|------|---------|----------|
| typescript ^6.0.3 | `tsc --noEmit` hard gate | `package.json`, `scripts.typecheck` |
| eslint ^9 + typescript-eslint ^8.72 + eslint-plugin-jsx-a11y + eslint-plugin-react | Flat-config lint (`eslint.config.js`); several a11y rules explicitly off | `eslint.config.js` |
| vitest ^5.0.5 + @vitest/coverage-v8 + jsdom + @testing-library/react + @testing-library/jest-dom + supertest | Unit/UI/server-route tests; v8 coverage ratchet | `vitest.config.ts`, `src/tests/setup.ts` |
| playwright ^1.64.1 + @playwright/test | E2E production smoke (`e2e/smoke/release-smoke.spec.ts`) against `dist/server.cjs` | `playwright.config.ts` |
| @lhci/cli ^0.15.1 | Lighthouse CI budgets | `.lighthouserc.json`, `scripts.lhci` |
| esbuild ^0.28.2 / terser ^5.51.2 | Server bundle / client minify | `package.json` scripts, `vite.config.ts` |
| Python: mypy (strict), black, ruff, pytest, coverage | Tooling for `scripts/replace_images.py` only ("inert to the JS toolchain") | `pyproject.toml` header comment |
| semgrep / gitleaks configs | Static security analysis + secret scanning (CI runs `npm run sec:secrets`) | `.semgrep.yml`, `.gitleaks.toml`, `.github/workflows/ci.yml` |

### 4) Key Commands

```bash
npm ci                       # install (⚠️ currently fails: no committed lockfile)
cp .env.example .env         # all vars optional; every integration fails closed (README)
GITHUB_WEBHOOK_SECRET=dev-secret npm run dev   # Express (PORT/HOST env) + Vite middleware on :3000
npm run build                # vite build → prerender → esbuild dist/server.cjs
npm start                    # node dist/server.cjs
npm test                     # vitest run --sequence.shuffle (36 test files)
npm run test:coverage        # coverage ratchet over server/** (68/55/72/69)
npm run test:e2e             # playwright smoke against production server
npm run ci                   # check:env → lint → typecheck → test → build → check:bundle
npm run ci:full              # ci + coverage + restore drill + payments sandbox + secrets scan
```

All from `package.json` `scripts`.

### 5) Environment and Config

- Config sources: `.env.example` (42 keys — payments, Firebase, MongoDB, Upstash, Mailgun, Sentry, quota, `PORT`, `NODE_ENV`), `firebase-applet-config.json` (public Firebase **web** config — public by design per README "Secrets hygiene"; the empty `recaptchaSiteKey` was removed 2026-10-21 as dead config, Q51), `wrangler.toml` (`API_ORIGIN` intentionally empty in VCS, set via Worker secrets), `components.json` (shadcn), `.lighthouserc.json`, `.impeccable/design.json` (design tokens), `firestore.rules`.
- `.env.staging.example` and `.env.production.example` restored 2026-10-21 (Q43): 42-key parity with `.env.example` (`PORT`/`NODE_ENV` added in the 2026-10-21 docs pass to match `docs/ops/environment-and-deployment-guide.md` Part 1); production template hard-codes `APP_ORIGIN=https://www.catalystlab.tech` (D14) and `PAYMENTS_ENABLED=false` (Q32); `npm run check:env` verified green in CI mode this session.
- Required-in-production vars enforced by `scripts/check-env.mjs`: `APP_ORIGIN`/`VITE_APP_ORIGIN`, at least one of `JWT_SECRET`/`PAYMENT_SIGNING_SECRET`, a Firebase service-account source. Unset behavior for everything else is documented in README "Environment variables" (fail-closed: payments → 503, webhooks → 401, state sync → 401, analytics → in-memory, email → mock mode).
- Deployment/runtime constraints: split hosting (D3(b)) — Cloudflare Pages (static) + Cloudflare Worker `/api/*` proxy (`worker/api-proxy.js`) + Node API host on Oracle Always Free (Render fallback, Q32), Docker or systemd (`ops/systemd/catalystlab.service`).

### 6) Evidence

- `package.json` (deps, scripts, engines), `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `eslint.config.js`, `playwright.config.ts`, `pyproject.toml`
- `Dockerfile`, `wrangler.toml`, `.env.example`, `firebase-applet-config.json`, `components.json`, `.lighthouserc.json`
- `.github/workflows/ci.yml` (Node 24 gates), `git ls-files` (no lockfile, no `.nvmrc`, no staging/prod env templates), `node --version` (sandbox v22.22.3)
- `docs/codebase/.codebase-scan.txt` (CODE METRICS: 596 files, 86,103 LOC; CI/CD: GitHub Actions; Container: Docker)
