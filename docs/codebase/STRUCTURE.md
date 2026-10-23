# Codebase Structure

> Regenerated 2026-10-21 by the `acquire-codebase-knowledge` workflow. Evidence = paths verified this session at commit `d2c26ef` (single root commit, 603 tracked files). `[TODO]` / `[ASK USER]` per skill contract.

## Core Sections (Required)

### 1) Top-Level Map

| Path | Purpose | Evidence |
|------|---------|----------|
| `src/` | React 19 SPA: `pages/` (33 top-level pages + `api/`, `docs/` (16 engine/product docs), `playground/`), `components/` (22 subdirs: layout, home, telemetry, dashboard, auth, api, docs, legal, pricing, ui… + 6 shared root files: ErrorBoundary, RateLimitBadge/RateLimitModal/RateLimitThresholdAlert, DiagnosticEngineCard, TerminalOutput), `lib/` (firebase, nodeEngines, networkSecurity, serverAuth, analyticsEngine, webhookService, logger, validation, `edge/pops.ts`, `media/`, `securityAudit.ts`), `store/` (zustand slices + `middleware/mongoSyncMiddleware.ts`), `context/`, `data/` (apiSpecs, pricingData, diagnosticEngines, faqData, engines), `config/site.ts`, `navigation/`, `styles/` (card-tokens.css, react-dev-tokens.css), `legal/`, `types/`, `utils/`, `hooks/`, `tests/` | directory listing this session; `src/App.tsx`, `src/main.tsx` |
| `server.ts` | Process entrypoint: HTTP server, dev-Vite/static-dist wiring, PORT/HOST, CSP-nonce injection into HTML shells, prerendered-shell + legacy-redirect fast paths, shell caching | `server.ts:1-100` |
| `server/` | Express API: `app.ts` (`createApp()` — helmet CSP, gzip middleware, body limits, identity, route registration, 404/error handlers) + `core/` (16 modules: logger, rateLimit, dailyQuota, sharedLimiter, enginesCatalog, ssl, runtime, spaRoutes, pricing, subscriptions, apiKeys, authz, backupRestore, domainAccess, errorTracking, retention) + `routes/` (12 modules: telemetry, stateSync, plans, engines, reports, account, github, payments, notifications, system, clientLogs, contact) | `server/app.ts:1-30`, directory listing |
| `src/components/` (consolidated) | Single component tree since 2026-10-21 (Q45): the five implementations that lived in the former root `components/` (`telemetry/{DiagnosticConsoleCard,GuestQuotaBanner,LiveTerminalStream,MasterTelemetryGrid}.tsx`, `ui/dashboard-sidebar.tsx`) were moved in, the bidirectional shim web deleted, and root `types/telemetry.ts` became the real `src/types/telemetry.ts`. `tsconfig.json` `include` and `@/*` dual fallback trimmed accordingly | `git log` this branch; `tsconfig.json`; `src/components/telemetry/*` |
| `worker/` | Cloudflare Worker `api-proxy.js` (+ `.d.ts`): same-origin `/api/*` proxy, fail-closed on unset/placeholder `API_ORIGIN`, rightmost-XFF anti-spoofing, hop-by-hop header stripping, SSE streaming | `worker/api-proxy.js:1-40`, `wrangler.toml` |
| ~~`types/` (root)~~ | Consolidated into `src/types/telemetry.ts` on 2026-10-21 (Q45); the root directory no longer exists | `src/types/telemetry.ts`, `src/tests/ui/auditScoreMatrixRadar.test.tsx:5` |
| `scripts/` | Build/ops gates: `prerender.ts`, `check-env.mjs`, `check-bundle-budget.mjs`, `check-design-tokens.mjs`, `scan-secrets.mjs`, `verify-deployment.mjs`, `verify-media.mjs`, `run-loadtest.mjs`, `run-restore-drill.ts`, `e2e-payment-sandbox.ts`, `report-lhci.mjs`, `replace_images.py` + `tests/`, `requirements-dev.txt` | `scripts/` listing, `package.json` scripts |
| `e2e/` | Playwright production smoke: `smoke/release-smoke.spec.ts` (zero-CSP-violation + strict headers on 5 routes) | `e2e/smoke/release-smoke.spec.ts:1-30` |
| `ops/` | `systemd/catalystlab.service`, `gcloud/setup-firestore-backups.sh`, `loadtest/k6-peak.js` | `ops/` listing |
| `public/` | Static assets + edge behavior: `_headers` (strict CSP parity with `server/app.ts`), `_redirects`, `sw.js` (service worker), `telemetry.js` (first-party snippet), `xss-guard.js`, `robots.txt` (the `llms.txt`, `llms-full.txt`, `rss.xml` and `pricing.md` manifests are generated into `dist/` by `scripts/prerender.ts` so they cannot drift from the data tables), PWA manifest/icons (the `assets/aistudio/` duplicate screenshots were purged 2026-10-21, Q48) | `public/` listing, `public/_headers:1-20` |
| `docs/` | `README.md` (docs index — living 🟢 vs dated 🟡), `ARCHITECTURE.md`, `ENGINES.md`, `adr/0001`–`0002`, `audit/` (perf-rendering, seo-aeo, agentic-master, frontend, header-footer — all 2026-10, bannered), `ops/` (runbook, slo, alerts.yml, drills, environment guide, architecture-redundancy), `plan/` (production-readiness-plan, decisions.md D1–D17/Q17–Q52, grilling-tree, rollout-pipeline-restore-2026-10-21), `release/checklist.md`, `security/review-2026-10.md`, `codebase/` (this skill's output), design audits | `docs/` listing |
| `.github/` | Workflows: `ci.yml`, `deploy.yml` (staging+production), `backup.yml`, `rollback.yml`, `media-verify.yml`; `CODEOWNERS`, `dependabot.yml`, `copilot-instructions.md`, `fixtures/ci-service-account.json` (documented non-credential placeholder) | `.github/` listing, fixture `_note` field |
| Root config | `vite.config.ts`, `vitest.config.ts`, `tsconfig.json`, `eslint.config.js`, `playwright.config.ts`, `wrangler.toml`, `components.json`, `firestore.rules`, `firebase-applet-config.json`, `Dockerfile`, `.dockerignore`, `.env.example`, `.gitleaks.toml`, `.semgrep.yml`, `.lighthouserc.json`, `pyproject.toml`, `index.html` (SPA shell → `/src/main.tsx`) | root listing |
| Root docs (intent) | `README.md`, `AGENTS.md` (canonical agent/UI instructions; `CLAUDE.md`/`GEMINI.md`/`copilot-instructions.md` defer to it), `PRODUCT.md`, `GLOSSARY.md`, `DESIGN.md` + `meta/DESIGN.md` (Meta-derived design-system YAML), `CODE_REVIEW.md` (historical audit @ `6bdf506`) | `CLAUDE.md`, `AGENTS.md` §13 |
| Root hygiene (2026-10-21) | The 14 one-off codemods (`fix_*.cjs/mjs`, `replace-*.{mjs,sh}`, `update_hero*.cjs`, `ds_section_divs.cjs`, `test-browser.mjs`) now live in `archive/` with an explanatory README (Q47/Q18); `patch.css` (41 KB) stays at root — live via `src/index.css:4`, kept by owner decision Q37 | `archive/README.md`, root listing |
| Binaries (purged 2026-10-21) | `.aistudio/` (1.7 MB), `videos/` (825 KB), `public/assets/aistudio/` duplicate screenshots (~2.7 MB md5-identical group), regenerable `assets/banners/hero-banner.png` (797.7 KB — re-create with `scripts/screenshot-banner.cjs`) and 4 zero-reference images in `src/assets/images/` deleted (Q48); `.gitignore` now blocks `.aistudio/`; remaining referenced hero JPEGs verified already-efficiently encoded (recompression gained only 7%) | `git status` this session, `md5sum`/`du` measurements, `.gitignore` |

### 2) Entry Points

- **Main runtime entry (server):** `server.ts` → `createApp()` (`server/app.ts`); production runs the esbuild bundle `dist/server.cjs` (`npm start`, Dockerfile `CMD`, systemd unit, Playwright `webServer`).
- **Client entry:** `index.html:135` → `/src/main.tsx` → `ReactDOM.createRoot` → provider stack (`ThemeProvider > AuthProvider > SubscriptionProvider > RoleSecurityProvider > App`) → `src/App.tsx` route table (landing `MasterAuditPage` kept synchronous for FCP/LCP; everything else `React.lazy`).
- **Edge entry:** `worker/api-proxy.js` (Cloudflare Worker, `wrangler.toml` `main`).
- **Build-time entry:** `scripts/prerender.ts` (runs inside `npm run build` after `vite build`).
- **Secondary CLIs/jobs:** `scripts/run-restore-drill.ts`, `scripts/e2e-payment-sandbox.ts`, `scripts/replace_images.py`, `ops/loadtest/k6-peak.js`, `ops/gcloud/setup-firestore-backups.sh`.
- How entry is selected: `package.json` scripts (`dev` = `tsx server.ts`; `start` = `node dist/server.cjs`); no `main` field (private app, `"type": "module"`).

### 3) Module Boundaries

| Boundary | What belongs here | What must not be here | Evidence |
|----------|-------------------|------------------------|----------|
| `src/` (SPA) | UI, client stores/contexts, client-side Firebase access, engine *presentation* (`src/data/diagnosticEngines.ts`) | Authorization decisions; entitlement grants; secrets (Sentry DSN never ships to browser) | README "Security model", `src/main.tsx` |
| `server/` + `server.ts` | Identity verification, quota/rate limiting, engine execution, webhooks, payments state machine, logging | Trusting client-supplied identity headers (`x-user-email`, plan strings ignored for authz) | `docs/ARCHITECTURE.md` "Identity and trust boundaries", `server/app.ts` |
| `src/lib/nodeEngines.ts` | The **only** engine implementation (D7; duplicate `lib/engines/` tree deleted 2026-10-19) | — | `docs/ENGINES.md` "Canonical implementation", `docs/plan/decisions.md` D7 |
| `src/lib/networkSecurity.ts` | SSRF guard (`guardedFetch`, `validatePublicUrl`) used by every outbound engine/webhook request | Direct `fetch` to user-supplied URLs bypassing the guard | `docs/ENGINES.md` header, `src/lib/nodeEngines.ts:3` |
| `worker/` | Stateless `/api/*` proxy + anti-spoof XFF | Business logic, secrets in VCS (`API_ORIGIN` via `wrangler secret put`) | `worker/api-proxy.js:1-13`, `wrangler.toml` comments |
| `src/components/` (single tree) | All UI implementations; the former root `components/` split + shim web was consolidated here 2026-10-21 (Q45) | Component code outside `src/` | `src/components/telemetry/MasterTelemetryGrid.tsx` (real implementation, imports `../common/…` and `../../types`) |
| `scripts/` | Build/ops verification gates (ESLint-ignored by design) | Application runtime code | `eslint.config.js` ignores, `pyproject.toml` |

### 4) Naming and Organization Rules

- **File naming:** pages/components mostly `PascalCase.tsx` (`MasterAuditPage.tsx`, `HeroSection.tsx`); lib/store modules `camelCase.ts` (`nodeEngines.ts`, `domainsSlice.ts`); kebab-case for design-system-adjacent UI files (`edge-mesh-globe.tsx`, `dashboard-sidebar.tsx`), scripts (`check-env.mjs`), and docs pages (`VitalZymeDoc.tsx` is Pascal; ops docs kebab). Mixed but internally consistent per directory.
- **Directory organization:** feature/domain-based under `src/components/` (home, dashboard, telemetry, auth, legal, pricing, docs, api, playground…); layer-based under `server/` (core vs routes).
- **Path aliases:** Vite: `@` → `./src`. `tsconfig.json` paths (since 2026-10-21, Q45): `@/*` → `["./src/*"]` (single root — the `./*` fallback that could silently resolve root-level twins is gone) and `@server/*` → `./server/*` (used by vitest config; the Vite app alias does not include `@server`). In practice code overwhelmingly uses relative imports (774 `from '../…'` vs 7 `from '@/…'` in `src/` this session).
- **CSS classes:** canonical `ds-*` primitives and `framer-*` type scale (AGENTS.md §2–3); engine hue tokens `--hue-vitalzyme` … `--hue-alloster` in `src/styles/card-tokens.css:22-30` (product truth per `PRODUCT.md`).

### 5) Evidence

- Scan tree: `docs/codebase/.codebase-scan.txt` (DIRECTORY TREE, MONOREPO SIGNALS: none)
- `server.ts`, `server/app.ts`, `src/main.tsx`, `src/App.tsx`, `index.html`, `worker/api-proxy.js`, `wrangler.toml`
- `tsconfig.json`, `vite.config.ts`, `eslint.config.js`, `components.json`
- Consolidation verification (2026-10-21): `grep -rn "\.\./\.\./\.\./components" src` → no hits; `tsc --noEmit`, `eslint .`, full vitest suite green after the moves
- `docs/ENGINES.md`, `docs/plan/decisions.md` (D7, D8, D14, Q18, Q37)
