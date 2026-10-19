# Codebase Structure

> Generated 2026-10-14, re-validated 2026-10-19. Evidence is the directory listing from this session plus the files named per row. `[TODO]` and `[ASK USER]` markers follow the workflow contract.

## Core Sections (Required)

### 1) Top-Level Map

| Path | Purpose | Evidence |
|------|---------|----------|
| `server.ts` | **Process entrypoint.** Starts the HTTP server, mounts Vite middleware (dev) or static `dist/` (prod), and calls `createApp()`. | `server.ts` |
| `server/` | Express API: `app.ts` (middleware + route wiring), `core/` (logger, rate limiter, API keys, engine catalog, SSL probe, authz), `routes/` (12 modules). | `server/app.ts`, `server/core/`, `server/routes/` |
| `src/` | React 18 SPA plus shared client/server libraries. Holds `App.tsx`, `main.tsx`, `pages/` (32 top-level pages), `components/` (194 `.tsx`), `context/` (4 providers), `store/` (zustand), `lib/` (21 files), `data/`, `hooks/`, `utils/`, `types/`, `navigation/`, `styles/`, `assets/`, and `tests/`. | `src/`, `src/App.tsx` (111 `<Route>` elements) |
| `src/tests/` | Vitest suites: `ui/` (9 files), `server/` (4 files), `unit/` (1 file), plus 6 root-level suites and `setup.ts`. | `src/tests/` |
| `lib/` | **Second engine tree, outside `src/`.** `lib/engines/` (9 files), `lib/rate-limit.ts`, `lib/utils.ts`, `lib/firebase.js`. The Express path does not load `lib/engines/` (see `ARCHITECTURE.md`). | `lib/`, `lib/engines/` |
| `api/` | Vercel-style serverless twins (`health.ts`, `run-engine.ts`, `monitor/probe.ts`, `monitor/system-health.ts`). `docs/ARCHITECTURE.md` calls them dormant. No `vercel.json` exists. | `api/`, `docs/ARCHITECTURE.md` |
| `app/` | **Next.js-style leftovers.** `app/api/scan/stream/route.ts` (the only importer of `lib/engines`) and `app/applet/` (an AI-Studio-style applet). Excluded from `tsconfig.json` and not built by Vite. `[ASK USER]` keep or remove. | `app/`, `tsconfig.json` (`exclude`) |
| `archive/` | Archived code (81 files): `archive/legacy-next/` and `archive/automation/` (one-off codemod scripts). Not in the build. | `archive/` |
| `components/` | Top-level React components: `components/telemetry/` (6 files) and `components/ui/` (9 files). Reached through **`export *` re-export shims** in `src/components/telemetry/` (4 files) and `src/components/ui/dashboard-sidebar.tsx`, not by direct imports. Included in `tsconfig.json`. | `components/`, `src/components/telemetry/*.tsx` (e.g. `GuestQuotaBanner.tsx` = `export * from '../../../components/telemetry/GuestQuotaBanner'`), `tsconfig.json` (`include`) |
| `public/` | Static site assets: 21 standalone `.html` pages (`index.html`, `dashboard.html`, `methodology.html`, …), `style.css`, `sw.js` (service worker), `telemetry.js`, `xss-guard.js`, `llms.txt`, `robots.txt`, `sitemap.xml`, `rss.xml`, `manifest.json`. | `public/` |
| `types/` | Shared telemetry types (`types/telemetry.ts`), imported by `lib/engines/index.ts`. | `types/telemetry.ts`, `lib/engines/index.ts` |
| `docs/` | `ARCHITECTURE.md`, `ENGINES.md` (human docs). `docs/codebase/` holds these generated documents. | `docs/` |
| `scripts/` | Repo tooling: `check-env.mjs`, `check-bundle-budget.mjs`, `verify-media.mjs`, `replace_images.py` (+ `tests/test_replace_images.py`), `screenshot-banner.cjs`, `requirements-dev.txt`. | `scripts/` |
| `assets/` | `assets/banners/hero-banner.{html,png}`. | `assets/banners/` |
| `workspace/` | One file, `refactor_colors.sh`. Not referenced by the build. | `workspace/` |
| `ui-ux-pro-max-skill/` | **Empty directory.** | `ls -la` |
| `.github/` | `workflows/media-verify.yml` (only CI workflow), `CODEOWNERS` (instruction-governance files owned by `@me-aas`), `copilot-instructions.md`. | `.github/` |
| Root-level instruction and doc files | `AGENTS.md` (canonical agent rules), `CLAUDE.md`, `GEMINI.md`, `.github/copilot-instructions.md` (each points to AGENTS.md), `README.md`, `CODE_REVIEW.md` (historical audit). | root `*.md` |
| Root-level one-off scripts (52 files) | Codemods such as `fix_colors*.py`, `fix_components*.py`, `replace_colors.sh`, `massive_hex_replace.py`, `ds_upgrade.py`. Not referenced by `package.json`. `[ASK USER]` archive or delete. | `ls *.py *.cjs *.mjs *.sh` |
| `hazardnet-auto-forecast-pipeline.ipynb` | Removed 2026-10-19 (Round 3 Q18b). It was a HazardNet notebook, unrelated to the web app. | none |
| Config files | `vite.config.ts`, `vitest.config.ts`, `tsconfig.json`, `eslint.config.js`, `components.json` (shadcn), `next.config.ts` (**vestigial**), `.lighthouserc.json` (not run by CI), `pyproject.toml` (Python tooling). | root |
| `.env.example`, `.env.production.example` | Environment templates (no secrets). | root |
| `bun.lock`, `package-lock.json` | Two lockfiles. `[ASK USER]` which is canonical. | root |
| `index.html` | Vite HTML entry. Contains an inline pre-paint theme script (its hash is allowlisted in CSP). | `index.html`, `server/app.ts` |
| `patch.css` (40 KB) | Root-level CSS. Not imported by `src/` `[TODO]` confirm usage. | `patch.css` |
| `firebase-blueprint.json`, `firestore.rules`, `firebase-applet-config.json` | Firebase project config. Rules default-deny (`match /{document=**} { allow read, write: if false; }`). | root |
| `metadata.json`, `favicon.svg` | App metadata and favicon. | root |

### 2) Entry Points

- **Server (main runtime entry):** `server.ts`.
  - Dev: `npm run dev` → `tsx server.ts`.
  - Prod: `npm run build` produces `dist/server.cjs` (esbuild) and `dist/` (Vite). Then `npm start` → `node dist/server.cjs`.
- **Client entry:** `index.html` → `src/main.tsx` → `src/App.tsx`. `main.tsx` wraps the app in `BrowserRouter`, `ThemeProvider`, `AuthProvider`, `SubscriptionProvider`, `RoleSecurityProvider`, and `ErrorBoundary`. It registers `/sw.js` in production.
- **Serverless entries (dormant):** `api/*.ts`. Not built, not referenced by `package.json`.
- **Secondary CLIs / jobs:** `scripts/check-env.mjs`, `scripts/check-bundle-budget.mjs`, `scripts/verify-media.mjs`, `scripts/replace_images.py`. Run manually or via npm scripts. No worker or queue process found.
- **Selection mechanism:** `NODE_ENV` chooses Vite middleware (dev) or static `dist/` (prod) in `server.ts`.

### 3) Module Boundaries

| Boundary | What belongs here | What must not be here |
|----------|-------------------|------------------------|
| `server.ts` | Process lifecycle, listen, Vite/static wiring | Route handlers or Express config (moved to `server/app.ts`) |
| `server/app.ts` | Helmet CSP, body limits, request logging, identity middleware, route registration, 404/503 fallbacks | Business logic |
| `server/routes/*` | HTTP handlers, request validation, response shaping | Engine implementations (live in `src/lib/nodeEngines.ts`) |
| `server/core/*` | Rate limiting, API key store, logger, engine catalog, SSL probe, runtime counters | Route wiring |
| `src/lib/*` (imported by server) | Identity (`serverAuth.ts`), SSRF guard (`networkSecurity.ts`), engines (`nodeEngines.ts`), analytics (`analyticsEngine.ts`), email (`emailService.ts`), webhook HMAC (`webhookSecurity.ts`) | React components |
| `lib/engines/*` | Alternate engine implementations used only by `app/api/scan/stream/route.ts` | Anything the Express server must call |
| `src/pages`, `src/components` | React UI | Direct server secrets; `process.env` (only `import.meta.env.DEV` is read) |
| `src/store` | zustand slices and Mongo sync middleware | Direct `fetch` to providers (uses `lib/authHeaders.ts`) |
| `src/context` | Auth, subscription, role, and theme providers | Data-fetching logic for pages |
| `public/` | Static HTML/JS served as-is, including service worker and telemetry script | Build-time modules |

### 4) Naming and Organization Rules

- **File naming** is mixed. Evidence:
  - React components: `PascalCase.tsx` (`src/components/`, `src/pages/AboutPage.tsx`).
  - Server modules: `camelCase.ts` (`server/core/rateLimit.ts`, `server/routes/stateSync.ts`).
  - Some `src/lib` and `lib/engines` modules: `kebab-case.ts` (`src/lib/rate-limit.ts`, `lib/engines/edge-latency.ts`, `lib/engines/repo-hygiene.ts`).
  - Root one-off scripts: `snake_case` or `kebab-case` (`fix_colors_matrix.py`, `update_hero_layout.cjs`).
- **Directory organization** is mostly **layer-based** at the top level (`server/routes`, `server/core`, `src/lib`, `src/store`), and **feature-based** under `src/components/` (`admin/`, `auth/`, `dashboard/`, `telemetry/`, …). `src/pages/` is flat with `api/`, `docs/`, `playground/` subfolders.
- **Import aliasing:**
  - `@/*` → `src/*` (`vite.config.ts` alias, `tsconfig.json` paths).
  - `@server/*` → `server/*` (`tsconfig.json` paths and `vitest.config.ts` alias only; **not** in `vite.config.ts`).
  - Cross-tree imports are relative and deep, e.g. `server/routes/engines.ts` imports `../../src/lib/nodeEngines`. This is the dominant style.
- **Directory-name collisions:** the `lib/` root, `src/lib/`, and `src/lib/engines/` contain overlapping names (`rate-limit.ts` appears in both `lib/` and `src/lib/`; `engines/` appears in both `lib/` and `src/lib/`). `src/lib/engines/index.ts` re-exports `../../../lib/engines`.

### 5) Evidence

- `ls -la` at repo root; `find . -type d` (excluding `.git`, `node_modules`, `archive`)
- `server.ts`, `server/app.ts`, `src/main.tsx`, `src/App.tsx`
- `tsconfig.json` (`include`, `exclude`, `paths`), `vite.config.ts` (`resolve.alias`), `vitest.config.ts`
- `server/routes/` (12 files), `server/core/` (7 files), `lib/engines/` (9 files), `src/lib/` (21 files)
- `src/lib/engines/index.ts` (re-export), `app/api/scan/stream/route.ts` (imports `lib/engines`)
- `docs/ARCHITECTURE.md` (dormant `api/*` note), `README.md` (architecture tree)
- `/tmp/codebase-scan.txt` (scan output, kept outside the repo; lost in a `/tmp` reset, regenerate with `scripts/scan.py`)

## Extended Sections (Optional)

Not included. The core map covers the directories that affect day-to-day work.
