# Technology Stack

> Regenerated 2026-10-19 by the `acquire-codebase-knowledge` workflow. Every claim cites a file path or a command result from this session. `[TODO]` = not determinable from the repo. `[ASK USER]` = needs owner intent (numbered list in `CONCERNS.md` §6).

## Core Sections (Required)

### 1) Runtime Summary

| Area | Value | Evidence |
|------|-------|----------|
| Primary language | TypeScript, `strict: true`. 347 `.ts`/`.tsx` files / 68,784 lines under `src/` (65,761 excluding `src/tests/`), 20 files / 4,101 lines under `server/` | `tsconfig.json`; `find … \| xargs cat \| wc -l` this session |
| Secondary languages | Python 3.11 (tooling only: `scripts/replace_images.py`, 72 `.py` files repo-wide incl. archived codemods), plain JS (`.mjs`/`.cjs` scripts), CSS (6,315 lines across `src/index.css`, `patch.css`, `public/style.css`) | `pyproject.toml`, scan `CODE METRICS`, `wc -l` |
| Runtime + version | Node.js **>= 24** declared. This sandbox ran **Node v22.22.3 / npm 10.9.8**, so all results below are *not* from the declared runtime. CI runs **Node 20**. Owner decision D5 (2026-10-19) = "Node 24 everywhere" — not yet applied to CI | `package.json` `engines`, `.nvmrc`, `.github/workflows/media-verify.yml`, `node --version`, `docs/plan/decisions.md` D5 |
| Package manager | npm (`package-lock.json`, `lockfileVersion: 3`; CI uses `npm install`). A second lockfile `bun.lock` (230.6 KB) is still committed. Owner decision D6 = "keep npm; delete `bun.lock`" — not yet applied | `package-lock.json`, `bun.lock`, `.github/workflows/media-verify.yml`, `docs/plan/decisions.md` D6 |
| Module system | ESM (`"type": "module"`), `target: ES2022`, `moduleResolution: bundler` | `package.json`, `tsconfig.json` |
| Build system | Client: `vite build` (Vite 6, terser minify, 6 manual vendor chunks). Server: `esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs`. Dev: `tsx server.ts` | `package.json` `scripts.build`/`scripts.dev`, `vite.config.ts`; build output `dist/server.cjs 232.1kb` |
| Package identity | `catalystlab@2.4.0`, `private: true` | `package.json` |
| Containerisation | **None.** No Dockerfile, Compose, Kubernetes, or Procfile. Scan `CONTAINERS & ORCHESTRATION` = "No containerization configs detected" | repo root `ls`, scan output |

### 2) Production Frameworks and Dependencies

`dependencies` only (these ship). Versions are the ranges declared in `package.json`; roles cite where the package is actually imported.

| Dependency | Version | Role in system | Evidence |
|------------|---------|----------------|----------|
| react / react-dom | ^18.3.1 | SPA UI, `createRoot` + `StrictMode` | `src/main.tsx` |
| react-router-dom | ^7.18.4 | `BrowserRouter`, 142 `<Route>` elements | `src/main.tsx`, `src/App.tsx` |
| express | ^4.22.3 | HTTP API: `createApp()` + 12 route modules (~70 routes) | `server/app.ts`, `server/routes/` |
| vite | ^6.0.3 | Client bundler **and** runtime dev middleware (`createViteServer({ middlewareMode: true })`) | `vite.config.ts`, `server.ts` |
| @vitejs/plugin-react / @tailwindcss/vite / tailwindcss | ^4.3.4 / ^4.0.0 / ^4.0.0 | React transform, Tailwind v4 via Vite plugin (`@import "tailwindcss"`) | `vite.config.ts`, `src/index.css:1` |
| firebase | ^12.17.1 | Client auth + Firestore SDK | `src/lib/firebase.ts`, `lib/firebase.js` |
| firebase-admin | ^14.2.0 | Server ID-token verification + Firestore reads; **dynamically imported** and disabled when unconfigured (fail closed) | `src/lib/serverAuth.ts` (`initVerifier`) |
| mongodb | ^7.5.0 | Analytics time-series store + state sync; in-memory fallback when `MONGODB_URI` unset | `src/lib/analyticsEngine.ts:1,41-43` |
| @upstash/redis / @upstash/ratelimit | ^1.38.2 / ^2.0.8 | Optional distributed sliding-window burst limiter (120 req / 1 m) | `server/core/rateLimit.ts:3,70-82`; also `lib/rate-limit.ts` (see §"Duplicate stacks") |
| helmet | ^8.3.0 | CSP + security headers, HSTS preload | `server/app.ts` |
| pino | ^10.3.1 | Structured JSON server logs with redaction paths | `server/core/logger.ts` |
| zod | ^4.5.4 | Request/event schema validation (engine runs, telemetry, client logs) | `src/lib/validation.ts`, `server/routes/clientLogs.ts:11-24` |
| cheerio | ^1.0.0 | HTML parsing inside audit engines | `src/lib/nodeEngines.ts` |
| geoip-lite / ua-parser-js | ^2.0.3 / ^2.0.10 | Local (no external call) geo + UA enrichment for telemetry | `server/routes/telemetry.ts` |
| zustand | ^5.0.15 | Client store: 6 slices + Mongo sync middleware | `src/store/useAppStore.ts`, `src/store/slices/`, `src/store/middleware/mongoSyncMiddleware.ts` |
| motion | ^13.1.0 | Animation. 72 files import `motion/react` | `AGENTS.md` §5, grep this session |
| recharts / d3 / cobe | ^3.10.1 / ^7.9.0 / ^2.0.1 | Charts and the 3D edge-mesh globe | `src/components/charts/`, `src/components/ui/edge-mesh-globe.tsx` |
| dompurify | ^3.4.17 | HTML sanitisation | `package.json`, `src/lib/sanitizeHref.ts` |
| lucide-react / clsx / tailwind-merge / class-variance-authority | ^1.33.0 / ^2.1.1 / ^3.6.0 / ^0.7.1 | Icons + class utilities (shadcn-style config) | `components.json`, `src/lib/utils.ts` |
| dotenv | ^17.4.2 | `import 'dotenv/config'` in the process entrypoint | `server.ts:9` |
| tsx | ^4.19.2 | Runs `server.ts` untranspiled in dev | `package.json` `scripts.dev` |
| typescript | ^5.7.2 | Declared under **`dependencies`**, not `devDependencies`, although it is only used by `typecheck`/build | `package.json` |

**Phantom (undeclared) dependency — verified this session:** 4 files in `components/telemetry/` do `import … from 'framer-motion'`, but `framer-motion` is **not** in `package.json`. It resolves only because `motion@13` pulls in `framer-motion@13.2.0` as a transitive package (`package-lock.json` → `node_modules/framer-motion`, `dev` flag undefined). Any `motion` upgrade that drops or renames it breaks the build. `AGENTS.md` §5 mandates `motion/react`, which the other 72 files follow.

**Duplicate stacks (same concern, two implementations):**

| Concern | Live path | Second implementation | Status |
|---|---|---|---|
| Rate limiting | `server/core/rateLimit.ts` (in-memory ledger + optional Upstash burst) | `lib/rate-limit.ts` (Upstash-first, memory fallback) re-exported by the shim `src/lib/rate-limit.ts`; client display copy in `src/utils/rateLimiter.ts` | `lib/rate-limit.ts` is imported **only** by the dormant Next route `app/api/scan/stream/route.ts`; the `src/lib/rate-limit.ts` shim has no importer |
| Audit engines | `src/lib/nodeEngines.ts` (939 lines, `runNativeEngine` switch) | `lib/engines/*` (8 modules + `ENGINE_EXECUTORS`) | `lib/engines/` is imported only by `app/api/scan/stream/route.ts` and re-exported by `src/lib/engines/index.ts`, which itself has no importer |
| Firebase client | `src/lib/firebase.ts` (1,898 lines, TS) | `lib/firebase.js` (plain JS, same `firebase-applet-config.json`) | `[TODO]` confirm whether `lib/firebase.js` has any importer; not found by grep this session |

### 3) Development Toolchain

`devDependencies` (never shipped) plus non-npm tooling.

| Tool | Purpose | Evidence |
|------|---------|----------|
| vitest ^5.0.0, @vitest/coverage-v8 ^5.0.0 | Test runner + v8 coverage gated on `server/**` | `vitest.config.ts` |
| jsdom ^30.0.1 | DOM environment for all suites (`environment: 'jsdom'`) | `vitest.config.ts` |
| @testing-library/react ^16.3.2, @testing-library/jest-dom ^7.0.1 | Component rendering + matchers. jest-dom 7.0.1 **does** export `./vitest` with `types/vitest.d.ts` (checked in `node_modules`) — the fix recorded as owner decision Q38 | `src/tests/setup.ts:1`, `node_modules/@testing-library/jest-dom/package.json` |
| supertest ^7.2.2 | Drives `createApp()` headlessly for route tests | `src/tests/server/api.test.ts` (636 lines) |
| playwright ^1.63.0, @playwright/test ^1.63.0 | Installed but **unused as a suite**: no `playwright.config.*` exists; only the manual root script `test-browser.mjs` | `ls playwright.config.*` → none, `test-browser.mjs` |
| eslint ^9.20.0, typescript-eslint ^8.24.0, eslint-plugin-react, eslint-plugin-jsx-a11y, @eslint/js | Flat-config lint, scoped to `src/**` only | `eslint.config.js` |
| esbuild ^0.28.2, terser ^5.51.2 | Server bundle; JS minification (2 compress passes, comments stripped) | `package.json`, `vite.config.ts` |
| @types/* (node ^26.2.0, express, react 18, d3, dompurify, supertest, geoip-lite, ua-parser-js) | Typings | `package.json` |
| Python: black, ruff, mypy (strict), pytest, pytest-cov | Lint/type/test for `scripts/replace_images.py` only; `testpaths = ["scripts/tests"]` | `pyproject.toml`, `scripts/requirements-dev.txt` |
| Lighthouse CI | `.lighthouserc.json` (desktop preset, 3 runs, a11y ≥ 0.90 and SEO ≥ 0.85 as **errors**, performance ≥ 0.50 as warn). **Not referenced by any npm script or workflow** — the scan's "No performance testing configs detected" is wrong; the file exists | `.lighthouserc.json`, `package.json`, `.github/workflows/` |

**Not present:** no Prettier, no `.editorconfig`, no Biome, no Husky/lint-staged, no commitlint, no Dependabot/Snyk/`SECURITY.md`/SBOM (scan `SECURITY & COMPLIANCE` = none detected; `.github/` holds only `CODEOWNERS`, `copilot-instructions.md`, and one workflow).

### 4) Key Commands

All results below were produced **in this session** on Node v22.22.3 after `npm ci`.

```bash
npm ci                  # 888 packages, 14 s                       -> exit 0  (EBADENGINE warning: node >=24 required, v22.22.3 present)
npm run dev             # tsx server.ts (Express + Vite middleware)  [not started]
npm run typecheck       # tsc --noEmit                               -> exit 2, 127 errors (ALL TS2339 'toBeInTheDocument', 10 files, all under src/tests/)
npm run lint            # eslint .                                   -> exit 0  (BUT only src/** has rules; `npx eslint server/app.ts` -> "File ignored because no matching configuration was supplied")
npm test                # vitest run                                 -> exit 1: 206 passed, 5 skipped (211), test files 20 passed | 1 FAILED (21), 22.75 s
npm run test:coverage   # vitest run --coverage                      [not run: the failing suite aborts before reporting]
npm run build           # vite build + esbuild server bundle         -> exit 0, built in 18.06 s; warns "Some chunks are larger than 500 kB"
npm run check:bundle    # bundle budget gate                         -> exit 0, all 6 budgets satisfied
npm run check:env       # env preflight (dev = warnings only)        -> exit 0, 8 warnings
npm run media:check     # live Unsplash/Pexels endpoint check        [not run: outbound hosts not reachable from this sandbox]
npm run ci              # check:env -> lint -> typecheck -> test -> build -> check:bundle  [not run end-to-end; it cannot pass: typecheck exits 2 and one suite fails]
npm start               # node dist/server.cjs                       [not run]
```

Bundle budget result (`npm run check:bundle`, verbatim):

```
✓ initialRawKb      1287 kB / 2100 kB   ✓ initialGzipKb      377 kB / 540 kB
✓ totalRawKb        2549 kB / 3400 kB   ✓ totalGzipKb        730 kB / 900 kB
✓ largestChunkRawKb  541 kB / 1050 kB   ✓ largestChunkGzipKb 157 kB / 280 kB
initial chunks: 6, total JS chunks: 66, largest: vendor-firebase-cW_cPl8l.js
```

Largest build chunks (Vite output, 1000-based kB): `vendor-firebase` 553.63 (gzip 160.95), `vendor-charts` 392.64 (108.52), `index` 351.89 (92.18), `vendor-react` 181.82 (59.55), `vendor-motion` 137.59 (43.99).

### 5) Environment and Config

- **Config sources:** `.env.example` (26 keys, all empty), `.env.production.example` (annotated, marks REQUIRED vs optional), `vite.config.ts`, `vitest.config.ts`, `tsconfig.json`, `eslint.config.js`, `components.json`, `.lighthouserc.json`, `.nvmrc`, `firebase-applet-config.json` (client web config, committed — public by design per `README.md`), `firebase-blueprint.json` (schema blueprint; **no code reference found** `[TODO]`), `firestore.rules`, `next.config.ts` (**vestigial** — Next.js is not a dependency).
- **Loading order:** `scripts/check-env.mjs` reads `.env.production.local` → `.env.production` → `.env.local` → `.env`, existing values winning. `server.ts` does `import 'dotenv/config'`.
- **Required in production/CI** (hard fail; warnings only in dev) — `scripts/check-env.mjs:19-24`: `FIREBASE_SERVICE_ACCOUNT_JSON` **or** `FIREBASE_SERVICE_ACCOUNT_PATH`, and `APP_ORIGIN` **or** `VITE_APP_ORIGIN`.
- **Optional (verified from this session's `check:env` output):** `JWT_SECRET` / `PAYMENT_SIGNING_SECRET`, `VALID_API_KEYS`, `UPSTASH_REDIS_REST_URL` + `_TOKEN`, `V2CHECKOUT_MERCHANT_CODE` or `DODOPAY_API_KEY`, `MONGODB_URI`, `TRUST_PROXY`, plus `MAILGUN_*`, `DODOPAY_*`, `PAYMENTS_WEBHOOK_SECRET*`, `GITHUB_WEBHOOK_SECRET`, `MONGODB_DB_NAME`, `LOG_LEVEL`, `HOST`, `ALLOW_UNAUTH_DEMO`.
- **Template gap (owner decision Q42 = add them; still open):** `APP_ORIGIN`, `VITE_APP_ORIGIN`, `JWT_SECRET`, `PAYMENT_SIGNING_SECRET` are read by code / `check-env.mjs` but absent from `.env.example`. `README.md` still documents a `VITE_FIREBASE_*` group that Q42 says to remove and that no code reads (client config comes from `firebase-applet-config.json`).
- **Secrets hygiene:** `.gitignore` excludes `.env` and `.env.*` while re-including the two templates. No hardcoded API keys were found in `server/` or `src/lib/`. One hardcoded non-secret endpoint exists: `src/lib/firebase.ts:781` seeds `INITIAL_MONITORED_SITES` with `https://ais-dev-2z7dtoomnl7nm53osnbyys-329537149747.asia-east1.run.app/api/health` and the note "Edge API gateway hosting 8 Python telemetry engines" — a claim `docs/ENGINES.md` contradicts (no Python engine is loaded at runtime).
- **Deployment/runtime constraints:**
  - Single process. `server.ts:26` **hard-codes `const PORT = 3000`** despite the comment above it saying PORT comes from the environment and `README.md` claiming `PORT`/`HOST` are honoured. `HOST` *is* honoured (`process.env.HOST || '0.0.0.0'`). Owner decision Q40 = "honour `PORT`, defaulting to 3000" — not yet applied.
  - `NODE_ENV=production` requires a prior `npm run build`: `createApp()` reads `dist/index.html` to sha256-hash inline scripts so production CSP can drop `'unsafe-inline'`.
  - No Dockerfile / `vercel.json` / `netlify.toml` / `wrangler.*` / `_headers` / `_redirects`. Owner decisions D3 + Q31 + Q32 (2026-10-19) settled the target: static frontend on **Cloudflare Pages**, API on a Node host (**Oracle Always Free 2 OCPU / 12 GB**, Render Free as documented fallback), same-origin `/api` proxy via a **Cloudflare Worker route**. None of that configuration exists in the repo yet. `[ASK USER]` #1 in `CONCERNS.md` §6(b)
  - `api/*.ts` (4 files, 312 lines) are Vercel-style twins; owner decision D8 = "delete `api/`; Express serves the same routes" — still present.

### 6) Evidence

- `package.json` (scripts, dependencies, devDependencies, engines, version), `package-lock.json`, `bun.lock`
- `.nvmrc`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `eslint.config.js`, `components.json`, `.lighthouserc.json`, `next.config.ts`
- `.env.example`, `.env.production.example`, `.gitignore`, `scripts/check-env.mjs`, `scripts/check-bundle-budget.mjs`
- `firebase-applet-config.json`, `firebase-blueprint.json`, `firestore.rules`, `src/lib/firebase.ts`, `src/lib/serverAuth.ts`
- `.github/workflows/media-verify.yml`, `.github/CODEOWNERS`, `pyproject.toml`, `scripts/requirements-dev.txt`
- `docs/plan/decisions.md` (owner answers D1–D16, Q17–Q42, all dated 2026-10-19), `docs/plan/production-readiness-plan.md` §1 baseline
- Scan output: `docs/codebase/.codebase-scan.txt` (regenerate: `python3 <skill>/scripts/scan.py --output docs/codebase/.codebase-scan.txt`)
- Terminal output from this session: `npm ci`, `npx tsc --noEmit`, `npm run lint`, `npx eslint server/app.ts`, `npx vitest run`, `npm run build`, `npm run check:bundle`, `npm run check:env`, `node --version`

## Extended Sections (Optional)

### Compiler and build flags that change behaviour

| Flag | Value | Consequence |
|---|---|---|
| `strict` | `true` | Hard gate per owner decision Q38 |
| `useUnknownInCatchVariables` | `false` | `catch (err)` is `any`-ish; routes use `err.message` directly (e.g. `server/routes/payments.ts` 500 responses echo `err.message` to clients) |
| `noUnusedLocals` / `noUnusedParameters` | `false` | Dead locals are not flagged |
| `noFallthroughCasesInSwitch` | `true` | Relevant to the `runNativeEngine` switch in `src/lib/nodeEngines.ts` |
| `noUncheckedIndexedAccess` | not set | Indexed access is not `\| undefined` |
| `include` | `src`, `server.ts`, `vite.config.ts`, `lib`, `types`, `components`, `app`, `prisma` | `prisma` does not exist; `app` is both included and listed in `exclude` (exclude wins, so `app/**` is **not** type-checked) |
| `paths` | `@/* → ./src/* , ./*`; `@server/* → ./server/*` | `@/foo` may resolve to `src/foo` **or** root `./foo`; `@server/*` is declared in `tsconfig.json` + `vitest.config.ts` but **not** in `vite.config.ts`, so it would not resolve in a browser build |
| Vite `build.sourcemap` | `process.env.NODE_ENV !== 'production'` | No sourcemaps in production builds; `server.ts` also 404s any `*.map` request in production |
| Vite `server.hmr` | `false`, `allowedHosts: true`, `host: 0.0.0.0`, `strictPort: true` | Deliberate: the preview proxy does not expose the dev WebSocket (`server.ts` comment) |
