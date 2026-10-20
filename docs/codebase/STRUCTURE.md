# Codebase Structure

> Regenerated 2026-10-19 by the `acquire-codebase-knowledge` workflow. Layout facts come from `find`/`ls`/`wc` in this session plus the scan tree in `docs/codebase/.codebase-scan.txt`. `[TODO]` = not determinable. `[ASK USER]` = needs owner intent.

## Core Sections (Required)

### 1) Top-Level Map

**Live application code**

| Path | Purpose | Evidence |
|------|---------|----------|
| `server.ts` | **Process entrypoint.** Fires `initAnalyticsDB()` without awaiting, builds the app via `createApp()`, creates one `http.Server`, then mounts Vite middleware (dev) or static `dist/` + SPA fallback (prod), and listens on `PORT = 3000` / `HOST` | `server.ts` (80 lines) |
| `server/` | Express API. `app.ts` (180 lines: helmet CSP, body limits, request logging, `attachIdentity`, 12 route registrations, JSON 404 + Mongo 503 fallbacks), `core/` (8 modules), `routes/` (12 modules). 20 files / 4,101 lines | `server/app.ts`, `find server -type f` |
| `src/` | React SPA + shared server libs. 347 `.ts`/`.tsx` files / 68,784 lines. Subdirs: `components/` (205 files), `pages/` (54 files, 33 top-level `*Page.tsx`), `lib/` (21), `store/` (11), `utils/` (9), `data/` (6), `assets/images/` (6), `legal/` (5), `context/` (4), `types/` (4), `hooks/` (2), `styles/` (2 CSS), `navigation/` (1), `tests/` (22) | `find src -maxdepth 2 -type d`, per-dir counts this session |
| `components/` | A **mirror layer** against `src/components/`, 15 files / 2,015 lines, pointing in *both* directions: 5 files are the real implementations (`telemetry/DiagnosticConsoleCard` 395 lines, `telemetry/MasterTelemetryGrid` 424, `telemetry/LiveTerminalStream` 251, `telemetry/GuestQuotaBanner` 137, `ui/dashboard-sidebar` 459) with 1–2 line shims in `src/components/`; 8 files are 1–2 line **reverse** shims into `src/components/` (`BenchmarkCard`, `CodeBlock`, `TelemetryCard`, `TerminalInput`, `cobe-globe-cdn`, `edge-mesh-globe`, `demo`, `AuditScoreMatrixRadar`); and `telemetry/SideBySideDeltaMatrix.tsx` (329 lines) is a **second, divergent implementation** of the live `src/components/telemetry/SideBySideDeltaMatrix.tsx` (339 lines) with no importer | `head -1` of all 14 name-matched pairs + `cmp -s` (all DIFFER); `src/pages/ComparePage.tsx:2` resolves to the `src/` copy |
| `lib/` | Mixed: `lib/engines/` (8 engine modules + `index.ts`, imported only by the dormant Next route), `lib/rate-limit.ts` (second Upstash limiter, same single importer), `lib/firebase.js` (plain-JS Firebase client), `lib/utils.ts` (re-exports `cn`, `errorMessage` from `src/lib/utils`) | `lib/rate-limit.ts`, `lib/utils.ts`, `app/api/scan/stream/route.ts:2-3` |
| `types/` | `types/telemetry.ts` (391 lines) — the real telemetry/guest-quota types. `src/types/telemetry.ts` is a 1-line shim | `wc -l types/telemetry.ts src/types/telemetry.ts` |
| `public/` | Served static assets: 18 legacy `*.html` pages, `index.html`, `style.css` (3,552 lines), `sw.js`, `telemetry.js`, `xss-guard.js`, `robots.txt`, `sitemap.xml`, `rss.xml`, `llms.txt`, `llms-full.txt`, `manifest.json`, `comparison-schema.json` | `ls public/` |
| `index.html` | Vite HTML entry: SEO meta, canonical `https://www.catalystlab.tech/`, pre-paint theme bootstrap inline script, `SoftwareApplication` JSON-LD, `<div id="root">`, `<script type="module" src="/src/main.tsx">` | `index.html` |
| `scripts/` | Repo tooling wired into npm scripts: `check-env.mjs`, `check-bundle-budget.mjs`, `verify-media.mjs`, `screenshot-banner.cjs`, `replace_images.py`, `requirements-dev.txt`, `tests/test_replace_images.py` | `find scripts -type f`, `package.json` |
| `docs/` | Intent + audit documentation: `ARCHITECTURE.md`, `ENGINES.md`, `plan/{production-readiness-plan,decisions,grilling-tree}.md`, `audit/perf-rendering-2026-10/` (6 docs + 11 measurement tools), `audit/seo-aeo-2026-10/` (audit + 2 tools), `codebase/` (these seven documents) | `find docs -type f` |
| `.github/` | `CODEOWNERS` (5 governance files owned by `@me-aas`), `copilot-instructions.md`, `workflows/media-verify.yml` (the only workflow) | `.github/` |
| `assets/banners/` | `hero-banner.png` (797.7 KB) + its source `hero-banner.html` | scan `CODE METRICS` |

**Non-live / archival code (still committed at root)**

| Path | Purpose | Evidence |
|------|---------|----------|
| `api/` | 4 Vercel-style serverless twins (312 lines): `health.ts`, `run-engine.ts`, `monitor/probe.ts`, `monitor/system-health.ts`. Not built, not tested, ignored by ESLint. Owner decision D8 = delete | `api/`, `eslint.config.js` ignores `api/**`, `tsconfig.json` does not include `api` |
| `app/` | Next.js leftovers: `app/api/scan/stream/route.ts` (the **only** importer of `lib/engines` and `lib/rate-limit`) and `app/applet/` (9 files, a standalone AI-Studio applet with its own `main.tsx`/`index.css`). Excluded from type-checking (`tsconfig.json` `exclude: ["app"]`) | `app/`, `tsconfig.json` |
| `archive/` | `archive/automation/` (60 codemod scripts) and `archive/legacy-next/` (`api/`, `app/`, `next.config.ts`). **Archiving was copy, not move:** all 6 compared `archive/legacy-next` files are byte-identical to their live root originals, and 38 root `*.py`/`*.cjs` scripts are byte-identical to `archive/automation/` copies | `cmp -s` this session (6/6 identical; 38 identical, 0 differing) |
| `workspace/` | One file, `refactor_colors.sh`. Owner decision Q18 = move it to `archive/`; a copy already exists at `archive/automation/workspace/refactor_colors.sh` | `ls workspace/`, `docs/plan/decisions.md` Q18 |
| `ui-ux-pro-max-skill/` | **Empty directory** (0 files) | `ls -la ui-ux-pro-max-skill/` |
| 52 root one-off codemods | `35 *.py`, `11 *.cjs`, `5 *.mjs`, `1 *.sh` — colour/typography/layout fix-up scripts (`fix_colors_*.py`, `replace_padding*.cjs`, `massive_hex_replace.py`, `ds_upgrade.py`, …). Referenced by **no** npm script, workflow, or source file. `[ASK USER]` #9 | `ls -1 *.py *.cjs *.mjs *.sh \| wc -l` → 52; grep for references found only doc mentions |
| Root config oddities | `patch.css` (1,143 lines) imported by `src/index.css:4` — owner decision Q37 = keep it; `firebase-blueprint.json` (14 KB, no code reference); `metadata.json` (AI-Studio app metadata, claims `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API`); `test-browser.mjs` (manual Playwright script); `favicon.svg` | `src/index.css:4`, `metadata.json`, `docs/plan/decisions.md` Q37 |

### 2) Entry Points

- **Main runtime entry:** `server.ts` → `createApp()` (`server/app.ts`). Selected by `package.json` scripts: `dev` = `tsx server.ts`, `start` = `node dist/server.cjs` (the esbuild bundle of `server.ts`).
- **Browser entry:** `index.html` → `/src/main.tsx` → `<BrowserRouter>` + `ErrorBoundary` + `ThemeProvider` → `AuthProvider` → `SubscriptionProvider` → `RoleSecurityProvider` → `<App/>`; registers `/sw.js` only when `NODE_ENV === 'production'`
- **Secondary CLIs / jobs** (manual or npm-script driven, no daemon): `scripts/check-env.mjs` (`check:env`), `scripts/check-bundle-budget.mjs` (`check:bundle`), `scripts/verify-media.mjs` (`media:check`, the only thing CI runs), `scripts/replace_images.py` (pytest-covered, never run by npm), `scripts/screenshot-banner.cjs`, `test-browser.mjs`
- **No worker, queue, cron, or scheduler process exists.** `setInterval` appears only as the hourly rate-limit ledger cleanup (`server/core/rateLimit.ts:421-425`)
- **Dormant entry points:** `api/*.ts` (Vercel), `app/api/scan/stream/route.ts` (Next), `app/applet/src/main.tsx` (standalone applet)

### 3) Module Boundaries

| Boundary | What belongs here | What must not be here |
|----------|-------------------|------------------------|
| `server.ts` | Process lifecycle, HTTP listen, Vite/static wiring, `PORT`/`HOST` | Express config, route handlers (deliberately pushed to `server/app.ts` so supertest can drive the app) |
| `server/app.ts` | Middleware order, CSP, body limits, identity attach, route registration, JSON 404, Mongo 503 fallback | Business logic |
| `server/routes/*` | HTTP handlers: zod parse → call lib → response envelope | Engine implementations, DB drivers |
| `server/core/*` | Cross-cutting server concerns: `logger`, `rateLimit`, `apiKeys`, `authz`, `enginesCatalog`, `ssl`, `runtime` | Identity verification (delegated to `src/lib/serverAuth.ts`) |
| `src/lib/*` | Shared logic used by **both** server and client: `nodeEngines`, `networkSecurity`, `securityAudit`, `analyticsEngine`, `emailService`, `webhookService`, `webhookSecurity`, `serverAuth`, `validation`, `logger`, `firebase` | Route/HTTP concerns. Note `serverAuth.ts` and `analyticsEngine.ts` are server-only in practice but live under `src/`, so they are inside the Vite `include` graph |
| `src/pages/*`, `src/components/*` | Views and presentation | Server secrets, direct DB access |
| `src/store/*` | zustand slices + `mongoSyncMiddleware` (optimistic mutations with pending/failed queues) | UI rendering |
| `src/context/*` | React context for auth, subscription, role security, theme | Persistence |
| `components/`, `lib/`, `types/` (root) | A mirror/legacy layer: real implementations for 5 components, reverse shims for 8, the second rate limiter, the parallel engines, `types/telemetry.ts` (391 lines, the real one), and `lib/firebase.js` | New code: prefer `src/`. `[ASK USER]` #9 — the split is historical and one pair (`SideBySideDeltaMatrix`) has already diverged |
| `public/` | Byte-for-byte served static files | Anything requiring a build step |

### 4) Naming and Organization Rules

- **Directory organization:** feature/domain-based inside `src/components/` (`admin`, `api`, `auth`, `blog`, `cards`, `charts`, `common`, `dashboard`, `docs`, `home`, `hub`, `integrations`, `layout`, `legal`, `media`, `playground`, `pricing`, `skeleton`, `telemetry`, `tool`, `ui`, `user`) and layer-based at the top (`server/core` vs `server/routes`, `src/pages` vs `src/components` vs `src/lib`).
- **File naming:** React components `PascalCase.tsx` (183 of 193 under `src/components/`; the 10 exceptions are kebab/lower-case, e.g. `edge-mesh-globe.tsx`, `3-d-coverflow-carousel.tsx`, `hero-section-6.tsx`). Pages `<Feature>Page.tsx`. Server modules `camelCase.ts` (`rateLimit.ts`, `stateSync.ts`). Engine modules `kebab-case.ts` (`repo-hygiene.ts`, `ai-readiness.ts`). Root codemods `snake_case.py` / `kebab-case.cjs`.
- **Path aliases:** `@/*` → `./src/*` (and fallback `./*`) in `tsconfig.json` and `vite.config.ts`; `@server/*` → `./server/*` in `tsconfig.json` + `vitest.config.ts` only. In practice **relative imports dominate** — e.g. `server/routes/engines.ts:2` uses `'../../src/lib/nodeEngines'`, and the `src/` shims reach root code with `'../../../components/…'`.
- **Barrels:** `components/ui/index.ts`, `lib/engines/index.ts`, `src/lib/engines/index.ts` (shim), `src/lib/rate-limit.ts` (shim), `src/types/telemetry.ts` (shim), `src/store/index.ts`, `src/hooks/useSpotlight.ts` (re-export).

### 5) Evidence

- Scan tree: `docs/codebase/.codebase-scan.txt` (`DIRECTORY TREE`, `CODE METRICS`)
- `server.ts`, `server/app.ts`, `src/main.tsx`, `index.html`, `src/App.tsx` (639 lines, 142 `<Route>` elements)
- `find src -maxdepth 2 -type d`; per-directory file counts; `wc -l` for `src/lib/firebase.ts` (1,898), `src/lib/nodeEngines.ts` (939), `types/telemetry.ts` (391), `patch.css` (1,143), `public/style.css` (3,552)
- Shim pairs verified by reading both files: `components/telemetry/*` ↔ `src/components/telemetry/*`, `lib/rate-limit.ts` ↔ `src/lib/rate-limit.ts`, `types/telemetry.ts` ↔ `src/types/telemetry.ts`, `lib/utils.ts` ↔ `src/lib/utils.ts`
- `cmp -s` results for `archive/legacy-next/` (6/6 identical to live originals) and root↔`archive/automation/` (38 identical, 0 differing)
- `tsconfig.json` (`include`/`exclude`/`paths`), `vite.config.ts` (alias), `eslint.config.js` (ignores), `package.json` (scripts)
- `ls -la ui-ux-pro-max-skill/` (empty), `ls workspace/`, `ls public/`, `find api app -type f`
- `docs/plan/decisions.md` (D6, D7, D8, Q18, Q37, Q42), `docs/plan/production-readiness-plan.md` §1

## Extended Sections (Optional)

### Middleware / boot order (`server/app.ts`, in source order)

1. `app.set('trust proxy', 1)` — only when `TRUST_PROXY === 'true'`
2. Production only: read `dist/index.html`, sha256-hash every inline `<script>` → CSP allowlist (logs `[CSP] Allowlisted inline script hashes`)
3. `helmet({...})` — CSP, HSTS (63072000, includeSubDomains, preload), `frameguard: false`, COOP `same-origin-allow-popups`, CORP `cross-origin`, COEP `false`
4. `Permissions-Policy: camera=(), microphone=(), geolocation=()`
5. `requestLoggingMiddleware` — assigns/honours `x-request-id`, logs one line on `finish`, skips assets and Vite dev modules
6. Conditional JSON body parser — `2mb` for `POST /api/state/sync`, `256kb` otherwise; `verify` captures `req.rawBody` for HMAC
7. `attachIdentity` (async, errors forwarded to `next`)
8. Route registration, fixed order: telemetry → notifications → stateSync → plans → engines → reports → account → github → system → payments → clientLogs → contact
9. `app.all(['/api/*','/stats/*','/telemetry/*'])` → JSON 404 (guarantees the SPA fallback never shadows an API path)
10. Mongo-aware error fallback → `503` for `MongooseError` / `MongoNetworkError` / messages containing `buffering timed out` or `Mongo`

### Route inventory (76 registrations across 70 distinct paths, 12 modules)

Counted with `grep -c "^app\.(get|post|put|patch|delete|all)("` per file this session.

`engines.ts` (16): `/api/health`, `/api/check-url`, `/api/run-engine`, `/api/monitor/probe`, `/api/monitor/system-health`, `/api/v1/engines`, `/api/v1/engines/:engine/scan`, `/api/v1/audit/master`, `/api/v1/audit/compare`, plus the master-audit SSE handler registered on 6 path/method aliases (`/api/scan/stream`, `/api/v1/audit/master/stream`, `/api/master-audit/stream` × GET/POST) · `account.ts` (13): `/api/v1/users/me`, `/quota`, `/trial`, `/subscription/request`, `/api-keys*` (list, create, delete, rotate), `/api/v1/integrations`, `/api/v1/integrations/webhook/test`, `/api/v1/workflows`, `/api/v1/automation/ci-cd/evaluate` · `telemetry.ts` (12): script served on 5 aliases, event ingestion on 4 aliases, `/api/analytics/{stats,realtime,anomalies/check}` · `github.ts` (8) · `notifications.ts` (7) · `reports.ts` (5) · `payments.ts` (4) · `system.ts` (4) · `stateSync.ts` (3) · `plans.ts` (2) · `contact.ts` (1) · `clientLogs.ts` (1)

### Generated vs source boundaries

`dist/` (Vite client build + `dist/server.cjs`) and `coverage/` are git-ignored and were produced by this session's `npm run build`; nothing in these documents is derived from them except the measured bundle sizes. `src/assets/images/*.jpg` (six files, 253 KB – 1.31 MB each) and `assets/banners/hero-banner.png` (797.7 KB) are committed binaries — the six largest files in the repo per the scan.


## Corrections after the 2026-10-19 implementation pass

- `public/` no longer holds the 18 legacy `*.html` pages, `sitemap.xml` or
  `comparison-schema.json` (deleted: D14, answer #13). It now contains
  `llms.txt`, `llms-full.txt`, `manifest.json`, `robots.txt`, `rss.xml`,
  `style.css`, `sw.js`, `telemetry.js`, `xss-guard.js`, plus the Pages config
  `_redirects` and `_headers`. `style.css` and `xss-guard.js` were only used by
  the deleted legacy pages and are candidates for removal (not deleted: the owner
  has not classified them).
- Root-level files `firebase-blueprint.json` and `metadata.json` are gone
  (answer #13), as are `archive/`, `workspace/`, `ui-ux-pro-max-skill/`,
  `api/`, `app/`, `next.config.ts`, root `lib/` and `bun.lock` (answer #9).
- New directories and files: `scripts/prerender.ts` (build-time route shells,
  sitemap and route manifest), `src/config/site.ts` (origin, entity, mailboxes,
  noindex rules), `worker/api-proxy.js` + `wrangler.toml` (Cloudflare split
  hosting, D3/Q31), `docs/ops/runbook.md` (D16), `.github/workflows/ci.yml`.
- `server/core/` gained `pricing.ts`, `subscriptions.ts`, `domainAccess.ts`,
  `dailyQuota.ts`, `retention.ts`, `spaRoutes.ts` and `errorTracking.ts`.
- The 14 remaining root codemod scripts (`ds_section_divs.cjs`, `fix_ambient.cjs`,
  `replace_*.mjs|cjs|sh`, `test-browser.mjs`, `update_hero*.cjs` …) are untouched:
  the owner did not classify them for deletion.
