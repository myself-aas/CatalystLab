# Technology Stack

> Generated 2026-10-14, re-validated 2026-10-19 by the `acquire-codebase-knowledge` workflow. Every claim cites a file or a terminal result from this session. `[TODO]` = not determinable from the repo; `[ASK USER]` = needs team intent.

## Core Sections (Required)

### 1) Runtime Summary

| Area | Value | Evidence |
|------|-------|----------|
| Primary language | TypeScript (`strict: true`), ~67.9k lines in `src/`, ~4.1k lines in `server/` (counted with `wc -l`) | `tsconfig.json`, `src/`, `server/` |
| Runtime + version | Node.js **>= 24** (`engines.node`, `.nvmrc = 24`). Sandbox run used Node v22.22.3 / npm 10.9.8, so results below are not from the declared runtime. CI (`media-verify.yml`) uses **Node 20**. | `package.json` (`engines`), `.nvmrc`, `.github/workflows/media-verify.yml`, terminal `node --version` |
| Package manager | npm (`package-lock.json`, lockfileVersion 3). **A second lockfile `bun.lock` (230 KB) is also committed.** `[ASK USER]` which is canonical. | `package-lock.json`, `bun.lock`, CI `npm install` |
| Module/build system | ESM (`"type": "module"`). Client: Vite 6 build (`vite build`). Server: `esbuild` bundles `server.ts` to CJS `dist/server.cjs` (`--packages=external`). Run via `tsx` in dev. | `package.json` (`scripts`), `vite.config.ts` |
| Package version | `catalystlab@2.4.0`, `private: true` | `package.json` |

### 2) Production Frameworks and Dependencies

Only `dependencies` in `package.json` (these ship to production). Versions are the semver ranges declared in `package.json`.

| Dependency | Version | Role in system | Evidence |
|------------|---------|----------------|----------|
| react / react-dom | ^18.3.1 | SPA UI | `package.json` |
| react-router-dom | ^7.18.4 | Client routing (`BrowserRouter`) | `package.json`, `src/main.tsx` |
| vite | ^6.0.3 | Client bundler + dev middleware (imported by `server.ts` at runtime) | `package.json`, `server.ts`, `vite.config.ts` |
| @vitejs/plugin-react, @tailwindcss/vite, tailwindcss | ^4.3.4 / ^4.0.0 / ^4.0.0 | React + Tailwind v4 styling | `package.json`, `vite.config.ts` |
| express | ^4.22.3 | HTTP API server (`createApp()`) | `package.json`, `server/app.ts` |
| helmet | ^8.3.0 | CSP and security headers | `server/app.ts` |
| firebase | ^12.17.1 | Client auth + Firestore | `src/lib/firebase.ts` |
| firebase-admin | ^14.2.0 | Server-side ID-token verification | `src/lib/serverAuth.ts` |
| mongodb | ^7.5.0 | Analytics / state-sync store (optional) | `src/lib/analyticsEngine.ts` |
| @upstash/redis, @upstash/ratelimit | ^1.38.2 / ^2.0.8 | Optional distributed rate limiter | `server/core/rateLimit.ts` |
| pino | ^10.3.1 | Structured server logging | `server/core/logger.ts` |
| zod | ^4.5.4 | Request/event schema validation | `src/lib/validation.ts`, `server/routes/*.ts` |
| cheerio | ^1.0.0 | HTML parsing inside audit engines | `src/lib/nodeEngines.ts` |
| geoip-lite, ua-parser-js | ^2.0.3 / ^2.0.10 | Local geo and user-agent enrichment for telemetry | `server/routes/telemetry.ts` |
| zustand | ^5.0.15 | Client state store | `src/store/useAppStore.ts` |
| motion | ^13.1.0 | Animation (Framer Motion) | `src/`, `AGENTS.md` |
| recharts, d3, cobe | ^3.10.1 / ^7.9.0 / ^2.0.1 | Charts and 3D globe | `src/components/charts`, `src/components/ui/edge-mesh-globe.tsx` |
| dompurify | ^3.4.17 | HTML sanitization | `package.json`, `src/lib/sanitizeHref.ts` |
| lucide-react, clsx, tailwind-merge, class-variance-authority | ^1.33.0, ^2.1.1, ^3.6.0, ^0.7.1 | UI utilities / icons | `package.json`, `components.json` |
| dotenv | ^17.4.2 | Loads `.env` (`import 'dotenv/config'`) | `server.ts` |
| tsx | ^4.19.2 | Runs `server.ts` in dev (`npm run dev`) | `package.json` |
| typescript | ^5.7.2 | Listed under `dependencies` though only used at build/dev time `[ASK USER]` whether intended | `package.json` |

Dependencies with no detected usage: `[TODO]` not verified exhaustively. Spot-checked `ua-parser-js`, `geoip-lite`, `cheerio`, `cobe`, `dompurify` (all referenced in source).

### 3) Development Toolchain

`devDependencies` (not shipped): these are build, lint, and test tools only.

| Tool | Purpose | Evidence |
|------|---------|----------|
| vitest ^5.0.0, @vitest/coverage-v8 ^5.0.0 | Test runner + v8 coverage | `package.json`, `vitest.config.ts` |
| jsdom ^30.0.1, @testing-library/react ^16.3.2, @testing-library/jest-dom ^7.0.1 | DOM tests | `vitest.config.ts`, `src/tests/setup.ts` |
| supertest ^7.2.2 | Express route tests | `src/tests/server/api.test.ts` |
| playwright ^1.63.0, @playwright/test ^1.63.0 | Browser automation. Only a root script `test-browser.mjs` uses it; no `playwright.config.*` found. | `package.json`, `test-browser.mjs` |
| eslint ^9.20.0, typescript-eslint ^8.24.0, eslint-plugin-react ^7.37.4, eslint-plugin-jsx-a11y ^6.10.2, @eslint/js | Lint (flat config) | `eslint.config.js` |
| esbuild ^0.28.2, terser ^5.51.2 | Server bundling and JS minification | `package.json`, `vite.config.ts` |
| @types/* (node 26.2.0, express, react 18, d3, supertest, …) | Typings | `package.json` |
| Python dev tools: black ≥24, ruff ≥0.5, mypy ≥1.10, pytest ≥8, pytest-cov ≥5 | Lint/test for `scripts/replace_images.py` only | `scripts/requirements-dev.txt`, `pyproject.toml` |

No Prettier, EditorConfig, Husky, or commitlint config found (`ls -la` at repo root).

### 4) Key Commands

Results are from this sandbox (Node v22.22.3), run in this session.

```bash
npm ci                    # install from package-lock.json              -> exit 0 (verified)
npm run dev               # tsx server.ts: Express + Vite middleware, port 3000  [not started; no need]
npm run build             # vite build + esbuild server bundle          -> exit 0 (verified, ~19 s)
npm start                 # node dist/server.cjs (production)           [not run]
npx vitest run            # tests                                       -> 185 passed, 5 skipped, 1 suite FAILED (verified)
npm run typecheck         # tsc --noEmit                                -> exit 2, 127 errors, all in src/tests/ (verified)
npm run lint              # eslint .                                    -> exit 0 (verified)
npm run check:bundle      # bundle budget after build                   -> all budgets satisfied (verified)
npm run check:env         # env preflight (dev mode = warnings only)    -> exit 0 (verified)
npm run media:check       # Unsplash/Pexels live endpoint check         [not run: external hosts]
npm run ci                # check:env -> lint -> typecheck -> test -> build -> check:bundle [not run end-to-end; stops at typecheck]
```

### 5) Environment and Config

- Config sources:
  - `.env.example` (26 variables, all empty)
  - `.env.production.example` (production template)
  - `vite.config.ts`, `vitest.config.ts`, `tsconfig.json`, `eslint.config.js`
  - `firebase-applet-config.json` (client Firebase web config, committed, read by `src/lib/firebase.ts`)
  - `next.config.ts` is a **vestigial Next.js config**. Next is not a dependency and Vite is the bundler.
- Required env vars (enforced only in production by `scripts/check-env.mjs`): `FIREBASE_SERVICE_ACCOUNT_JSON` or `FIREBASE_SERVICE_ACCOUNT_PATH`, and `APP_ORIGIN` or `VITE_APP_ORIGIN`.
- Optional env vars (full list in `.env.example`): `MONGODB_URI`, `MONGODB_DB_NAME`, `MAILGUN_*`, `V2CHECKOUT_*`, `DODOPAY_*`, `PAYMENTS_WEBHOOK_SECRET*`, `GITHUB_WEBHOOK_SECRET`, `UPSTASH_REDIS_REST_*`, `VALID_API_KEYS`, `TRUST_PROXY`, `LOG_LEVEL`, `HOST`, `ALLOW_UNAUTH_DEMO`.
- Variables read in code but **missing from `.env.example`**: `APP_ORIGIN`, `VITE_APP_ORIGIN`, `JWT_SECRET`, `PAYMENT_SIGNING_SECRET`. Code/grep comparison, plus `scripts/check-env.mjs`.
- `VITE_FIREBASE_*` variables are documented in `README.md` but **never read**. The client config comes from `firebase-applet-config.json`.
- Deployment/runtime constraints:
  - Single process listening on port 3000 (`server.ts` hard-codes `PORT = 3000`). `HOST` is honored.
  - `NODE_ENV=production` requires a prior `npm run build` (CSP hashing reads `dist/index.html`, `server/app.ts`).
  - No Dockerfile, `Procfile`, or `vercel.json` in the repo. `api/*.ts` are Vercel-style twins that `docs/ARCHITECTURE.md` calls dormant.
  - Deploy target: `[TODO]`/`[ASK USER]`. Repo contents do not identify it.

### 6) Evidence

- `package.json` (scripts, dependencies, devDependencies, engines)
- `package-lock.json`, `bun.lock`
- `.nvmrc`
- `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `eslint.config.js`, `next.config.ts`
- `.env.example`, `.env.production.example`, `scripts/check-env.mjs`, `scripts/check-bundle-budget.mjs`
- `firebase-applet-config.json`, `src/lib/firebase.ts`
- `.github/workflows/media-verify.yml`
- Terminal output from this session: `npm ci`, `npx tsc --noEmit`, `npm run lint`, `npx vitest run`, `npm run build`, `npm run check:bundle`, `npm run check:env`
- Scan output: `/tmp/codebase-scan.txt` (lost in a `/tmp` reset; regenerate with the skill's `scripts/scan.py`). Kept outside the repo so `docs/codebase/` holds only the seven documents.

## Extended Sections (Optional)

Not included. The repo is large, but the core sections cover the required stack facts.
