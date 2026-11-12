# Codebase Structure

> Regenerated 2026-11-12 against branch `arena/b1761471-catalystlab` (`1babd3a`).
> 650 tracked files, 16 MB of tracked content (largest: `video/hero-launch/assets/captures/*.png`,
> 1.2 MB and 1.0 MB). No monorepo tooling (`package.json` has no `workspaces`;
> no `pnpm-workspace.yaml`/`nx.json`/`lerna.json`) — but `video/hero-launch/`
> carries its **own** `package.json`, so it is an independent sub-package.

## Core Sections (Required)

### 1) Top-Level Map

| Path | Purpose | Evidence |
|------|---------|----------|
| `server.ts` | Process entrypoint: bootstraps error tracking, analytics DB, `createApp()`, binds `PORT`/`HOST`, prod HTML delivery (prerendered shells, 301 aliases, 404s, CSP nonce injection), graceful shutdown | `server.ts` |
| `server/app.ts` | `createApp()`: CSP/nonce, gzip, request logging, body limits, identity attach, 12 route registrars, API 404, DB-offline error handler | `server/app.ts` |
| `server/routes/` | 12 endpoint modules: `telemetry`, `notifications`, `stateSync`, `plans`, `engines`, `reports`, `account`, `github`, `system`, `payments`, `clientLogs`, `contact` | directory listing; `server/app.ts:309-320` |
| `server/core/` | Cross-cutting services: rate limit & quota, shared limiter, API keys, authz, subscriptions, pricing, retention, backup/restore, expiry sweep, SSL probe, engine catalog, spa routes, runtime, logger, Sentry | `server/core/*` (16 files) |
| `src/` | React 19 SPA: 32 pages (`src/pages/` + `docs/` + `playground/`), 171 components, 4 contexts, 6 zustand slices, 11 data tables, 18 lib modules, 9 utils | `find src -name '*.tsx' \| wc -l` = 240 TSX files |
| `src/lib/` | Client+server shared logic: `firebase.ts` (1,905 lines), `nodeEngines.ts` (927), `networkSecurity.ts` (364), `serverAuth.ts` (265), `analyticsEngine.ts` (740), `emailService.ts`, `webhookService.ts`, `validation.ts`, `logger.ts`, media registries | `src/lib/` |
| `src/tests/` | Vitest suites only (51 files): `server/` 25, `ui/` 12, `unit/` 8, root 6, `helpers/` 1 | directory listing |
| `scripts/` | Build (prerender), gates (env/colors/design/bundle/secrets/media), drills (restore, payments sandbox), ops (loadtest, LHCI report, verify-deployment), asset tooling (image variants, `replace_images.py`) | `scripts/` |
| `worker/` | Cloudflare Worker `/api/*` proxy (`api-proxy.js` + hand-written `api-proxy.d.ts`) | `worker/`, `wrangler.toml` |
| `public/` | Static passthrough: `robots.txt`, `_headers`, `_redirects`, `manifest.json`, icons, `sw.js`, `telemetry.js`, `xss-guard.js` | `public/` |
| `e2e/` | Playwright release smoke (`e2e/smoke/release-smoke.spec.ts`) | `playwright.config.ts` (`testDir: './e2e'`) |
| `docs/` | Documentation: living specs (`ARCHITECTURE.md`, `ENGINES.md`, `ops/`, `plan/`), dated audits (`audit/`, `security/`), and this knowledge set (`codebase/`) | `docs/README.md` |
| `ops/` | Deployment artefacts: `systemd/catalystlab.service`, `gcloud/setup-firestore-backups.sh`, `loadtest/k6-peak.js` | `ops/` |
| `.github/` | 5 workflows, `CODEOWNERS`, `dependabot.yml`, `copilot-instructions.md`, CI fixture service account, impeccable hook manifest | `.github/` |
| `archive/` | 14 spent one-off codemods, unreferenced by any script/CI/source (Q18) | `archive/README.md` |
| `tools/` | Ad-hoc audit helpers: `theme-audit.mjs`, `contrast-math.py`, `contrast-verify.py` | `tools/`, no npm script reference |
| `video/hero-launch/` | Independent Hyperframes video sub-project with its own `package.json` (gsap, puppeteer-core) and 2.2 MB of capture PNGs | `video/hero-launch/package.json` |
| `patch.css` + `src/styles/` | Live design-token CSS: `src/index.css` `@import`s `styles/card-tokens.css`, `styles/react-dev-tokens.css` and `../patch.css` (Q37 keeps `patch.css` at root) | `src/index.css:1-4` |
| `firestore.rules` | 13 KB of Firestore security rules (deny-by-default, claim-based superadmin) | `firestore.rules:1-5` |
| `assets/`, `.assets/`, `patch.css`, `SECURITY.md`, `firebase.json`, `.firebaserc`, `firestore.indexes.json`, `firestore.rules` | Media banner template, asset manifest, root CSS patch, the disclosure policy, and the Firebase deploy config (`firebase deploy --only firestore:rules`). The captured audit dumps that used to sit here moved to `docs/audit/` / `archive/` on 2026-11-12 | root listing |

### 2) Entry Points

- **Main runtime entry:** `server.ts` (`npm run dev` → `tsx server.ts`; `npm start` → `node dist/server.cjs`).
- **Client entry:** `src/main.tsx` → `src/App.tsx` (route table with 30+ `React.lazy` imports; landing kept synchronous).
- **Secondary entry points:**
  - Prerender: `scripts/prerender.ts` (invoked by `npm run build`).
  - Cloudflare Worker: `worker/api-proxy.js` (`main` in `wrangler.toml`).
  - Ops scripts: `scripts/verify-deployment.mjs`, `scripts/run-loadtest.mjs`, `scripts/e2e-payment-sandbox.ts`, `scripts/run-restore-drill.ts`, `scripts/scan-secrets.mjs`.
  - Python: `scripts/replace_images.py`.
  - Sub-project: `video/hero-launch/index.html` via `npx hyperframes`.
- **How entry is selected:** entirely by `package.json` `scripts` + `wrangler.toml` `main` + `Dockerfile` `CMD`. `tsconfig.json` `include` covers `src`, `server`, `server.ts`, `vite.config.ts`, `scripts` — note `worker/`, `tools/` and `video/` are **outside** the typecheck graph.

### 3) Module Boundaries

| Boundary | What belongs here | What must not be here |
|----------|-------------------|------------------------|
| `server.ts` | Process bootstrap, HTTP binding, static/shell serving, nonce injection, shutdown | Route logic, authz decisions |
| `server/app.ts` | Middleware composition and route registration; terminal 404/error handles | Business rules, entitlement grants |
| `server/routes/*` | One HTTP domain per file; zod validation; status-code semantics | Trusting client identity headers; granting paid entitlements; direct `console.*` (0 occurrences in `server/`) |
| `server/core/*` | Reusable server services (quota, keys, subscriptions, retention, logging, SSL) | HTML/SPA rendering |
| `src/lib/nodeEngines.ts` | The only audit-engine implementation (D7) | Un-guarded outbound fetches (must pass `networkSecurity.ts`) |
| `src/lib/networkSecurity.ts` | SSRF guard: scheme allowlist, private-range blocklist, DNS pinning, redirect revalidation, size caps | Engine scoring logic |
| `src/lib/firebase.ts` | Client Firestore/Auth data access + thin `fetch` wrappers for server-owned writes | Server-side trust decisions |
| `src/store/` + `src/context/` | Client state and providers; optimistic mutation queue | Source of truth for entitlement/tier |
| `scripts/prerender.ts` | Build-time shells, sitemaps, `routes.json`, JSON-LD from UI data tables | Runtime request handling |
| `src/tests/**` | All Vitest tests (co-located nowhere else) | Production code |

### 4) Naming and Organization Rules

- **Files:** PascalCase for React components/pages/contexts (`HeroSection.tsx`, `UserDashboardPage.tsx`, `AuthContext.tsx`); camelCase for non-component modules (`useAppStore.ts`, `rateLimiter.ts`, `slugUtils.ts`, `routeAliases.ts`); `server/routes/*` and `server/core/*` are all lowercase-camel (`stateSync.ts`, `dailyQuota.ts`, `enginesCatalog.ts`); kebab-case for CSS-token files (`card-tokens.css`, `react-dev-tokens.css`). Counting: 170 components use `export const X: React.FC`, 16 use `export function`.
- **Directories:** feature/domain-based under `src/components/` (`home/`, `layout/`, `pricing/`, `dashboard/`, `telemetry/`, `ui/`, `docs/`, `skeleton/`…) and layer-based on the server (`routes/`, `core/`).
- **Path aliases:** `tsconfig.json` defines `@/*` → `./src/*` and `@server/*` → `./server/*`, mirrored in `vite.config.ts` (`@`) and `vitest.config.ts` (`@`, `@server`). In practice **aliases are barely used**: 3 `@/` imports inside `src/`, 0 `@server/` imports outside `src/tests/`. Application code uses relative imports, including deep cross-tree ones such as `server/core/apiKeys.ts` → `../../src/lib/serverAuth` and `server/routes/engines.ts` → `../../src/lib/nodeEngines`.
- **Cross-layer direction:** server code imports *from* `src/lib` and `src/config` (shared pure modules); `src/` never imports from `server/`. This single direction is the real layering invariant.
- **Tests:** always in `src/tests/<kind>/<name>.test.ts(x)`; server suites import `@server/*` and build the app through `createApp()`.
- **Decision tags:** comments carry `D#`, `Q##`, `Plan x.y`, `SEC-2026-##`, `Blocker #n`, `Phase n` references. Most frequent: `Q32` (16), `D11` (13), `D9` (9), `D3` (9), `D2` (8) — all resolvable in `docs/plan/decisions.md`.

### 5) Evidence

- Root listing + `git ls-files | wc -l` (650) and `git ls-files -z | du --files0-from=- -ch` (16 MB)
- `package.json` (`scripts`, no `workspaces`), `tsconfig.json` (`paths`, `include`), `vite.config.ts`, `vitest.config.ts` (`include: src/tests/**`), `playwright.config.ts`
- `server.ts`, `server/app.ts:309-320`, `server/routes/` (12 files), `server/core/` (16 files)
- `src/App.tsx`, `src/main.tsx`, `src/index.css:1-4`, `src/config/site.ts`
- `scripts/prerender.ts`, `worker/api-proxy.js`, `wrangler.toml`, `Dockerfile`, `firestore.rules`, `archive/README.md`, `docs/README.md`
- File-count commands: `find src -name '*.tsx' | wc -l` → 240; `ls src/pages/*.tsx | wc -l` → 32; `ls src/tests/server/*.test.ts` → 19

## Extended Sections (Optional)

### `src/components/` neighbourhoods (171 TSX files)

| Directory | Files | Role |
|---|---|---|
| `ui/` | 20 | shadcn-style primitives + bespoke visual widgets (`edge-mesh-globe`, `hero-section-6`) |
| `common/` | 19 | Modals, banners, FAQ, skeletons shared across pages |
| `skeleton/` | 14 | Route-level loading placeholders |
| `home/` | 11 | Landing sections |
| `layout/` | 10 | Navbar, Footer, HUD, ambient background, menu overlay |
| `charts/` | 9 | Recharts/D3 gauges and radars |
| `media/` | 7 | Plates, image renderers |
| `user/` `admin/` `dashboard/` `telemetry/` `cards/` `auth/` `tool/` `legal/` `docs/` `integrations/` `pricing/` `api/` `playground/` | 4-5 each | Feature surfaces |
| root of `components/` | 6 | `DiagnosticEngineCard`, `ErrorBoundary`, `RateLimitBadge`, `RateLimitModal`, `RateLimitThresholdAlert`, `TerminalOutput` |

### Generated vs source

`dist/` (git-ignored) is generated by `npm run build`: 64 files named `index.html` (route
shells + `404.html`), `routes.json`, 5 sitemaps, `llms.txt`, `llms-full.txt`, `rss.xml`,
`pricing.md`, `_headers`, `_redirects`, `assets/`. Never document patterns from `dist/`;
`coverage/`, `.lighthouseci/`, `playwright-report/` are likewise ignored artefacts.
