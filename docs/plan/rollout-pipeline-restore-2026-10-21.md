# Rollout Plan — Pipeline Restore & Repo Hygiene (2026-10-21)

> Generated with the `devops-rollout-plan` skill (github/awesome-copilot). Covers the change set produced from the owner's answers #1–#10 to `docs/codebase/CONCERNS.md` §6 on 2026-10-21: restored CI/Docker pipeline files, component-tree consolidation, codemod archiving, binary purge, seed/config cleanups, docs refresh, Python CI gate, and re-based UI tests.

## 1. Executive Summary

- **What:** Restore the four missing pipeline files (`.nvmrc`, `package-lock.json`, `.env.staging.example`, `.env.production.example`), consolidate the split component tree into `src/`, archive 14 spent root codemods, purge ~4.4 MB of unreferenced binaries, fix the hardcoded dev Cloud Run seed URL, drop the dead `recaptchaSiteKey`, refresh stale README/architecture docs, add the `python-tooling` CI job, and repair 3 UI tests broken by the `d2c26ef` design refactor.
- **Why:** At HEAD `d2c26ef`, *every* CI workflow, the Docker build, and `npm run ci` fail on missing files; the repo also carried dead duplication and drift that misleads humans and agents.
- **When/duration:** Merge → automatic staging deploy (`deploy.yml` on `main`) → manual production promotion (`workflow_dispatch`). ~15 min staging soak, ~15 min production; total change window < 1 h.
- **Risk level:** **Low–Medium.** No runtime business logic changes except: hero dead-code removal (render-neutral), `INITIAL_MONITORED_SITES` URL (admin-view fallback seed only), and dependency pinning (lockfile freezes resolution that previously floated).
- **Rollback time:** < 10 min (revert merge commit → redeploy previous Pages deployment / Worker version / server artifact; `rollback.yml` exists for the API host).
- **User impact:** None expected. Static frontend + API behavior unchanged; the lockfile makes builds reproducible.
- **Expected downtime:** Zero (Pages deployments are atomic; Worker versions are immutable; API host redeploy restarts one process — the runbook already treats this as a rolling restart of a single-instance free-tier host).

## 2. Prerequisites & Approvals

- **Approvals:** Owner (`@me-aas`) — the ten decisions were given in the 2026-10-21 session and are recorded in `docs/plan/decisions.md` (Q43–Q52) and `docs/codebase/CONCERNS.md` §6. CODEOWNERS review on the PR.
- **Owner-side action in flight:** MongoDB Atlas password rotation for the SEC-2026-01 legacy credential (owner confirmed they will rotate — answer #2). This rollout does **not** depend on it, but it must complete before any repo/remote with pre-squash history is exposed.
- **Resources:** CI green on the PR (all five jobs: `gates`, `security-and-container`, `e2e-chromium`, `lighthouse`, `python-tooling`); Firestore backup fresher than 24 h (RPO, D16) — `backup.yml` runs daily; Worker `API_ORIGIN` secrets already set for staging/production (verify with `npx wrangler secret list`).
- **Pre-deployment backups:** Confirm last successful `backup.yml` run and the latest restore drill (`docs/ops/drills/restore-drill-2026-10-21.md`).

## 3. Preflight Checks

Run locally / verify in CI before merge (all were executed in the 2026-10-21 working session; re-verify on the PR):

| Check | Command / signal | Go criteria |
|---|---|---|
| Env template parity | `npm run check:env` (CI mode) | `40 parity-verified keys` message, exit 0 |
| Types | `npm run typecheck` | 0 errors (`strict: true`) |
| Lint | `npm run lint` | 0 problems over `src/`, `server/`, `server.ts` |
| Unit/UI/server suite | `npm test` | All 36 files pass (330 tests) |
| Coverage ratchet | `npm run test:coverage` | server/** ≥ 68/55/72/69 |
| Build + prerender | `npm run build` | `dist/` with 74+ route shells, `routes.json`, `404.html`, `sitemap.xml`, `dist/server.cjs` |
| Bundle budget | `npm run check:bundle` | All budgets pass (hero dead-import removal should not increase any chunk) |
| Python tooling | `python -m pytest && ruff check scripts && mypy && black --check scripts` | 32 passed, all clean (Python 3.11) |
| Secrets | `npm run sec:secrets` | 0 findings (working tree + history) |
| Docker | `docker build -t catalystlab:ci .` | Builds (COPY lines now resolve), non-root `node`, health probe 200 |
| Lockfile sanity | `git diff --stat package-lock.json` on a fresh `npm ci` | No churn (lockfile matches manifest) |
| Media | `npm run media:check` | All registry URLs resolve (network-dependent) |

**Go/no-go:** all rows green + CODEOWNERS approval. Any red ⇒ stop, fix forward on the branch, do not merge.

## 4. Step-by-Step Rollout Procedure

**Phase A — Pre-deployment (T-0, on the PR branch)**
1. Rebase the branch on latest `main`; re-run `npm run ci` locally. (~5 min)
2. Merge (squash or merge commit per repo norms) → triggers `ci.yml` on `main` **and** `deploy.yml` staging. (~15 min CI)
3. Watch all five CI jobs; the new `python-tooling` job runs for the first time on GitHub runners — expected green (verified locally on Python 3.11.2).

**Phase B — Staging (automatic, `deploy.yml` → `https://staging.catalystlab.tech`)**
4. Confirm Pages deployment + Worker `catalystlab-api-proxy-staging` version published. (~2 min)
5. Run the workflow's staging smoke step; then manually: `curl -fsS https://staging.catalystlab.tech/api/v1/system/health`, load `/`, `/pricing`, `/master-audit` in a browser, run one engine scan. (~10 min soak)

**Phase C — Production (manual promotion)**
6. `workflow_dispatch` → `deploy.yml` with `target_environment: production` (deploys Pages `www.catalystlab.tech` + production Worker version). (~5 min)
7. API host: rebuild/redeploy `dist/server.cjs` (Docker image now builds; systemd path: `docs/ops/runbook.md` §deploy). Single-instance restart ⇒ brief (<30 s) API blip; Worker fails closed with 5xx only during the restart window. Schedule off-peak. (~10 min)
8. Post-deploy contract check: `npm run verify:deploy` (or `node scripts/verify-deployment.mjs https://www.catalystlab.tech`). (~2 min)

## 5. Verification Signals

- **Immediate (0–2 min):** deploy workflow green; Pages deployment "Success"; Worker version active; `/api/v1/system/health` → 200 on staging **and** production; container (if Docker path) reports healthy via HEALTHCHECK.
- **Short-term (2–5 min):** `/`, `/pricing`, `/blogs`, `/docs/llmo`, `/contact` render with strict CSP headers (no `'unsafe-inline'`); legacy `.html` → 301; unknown route → real 404 shell; one live engine scan (e.g. `health` on a known domain) returns a structured report; Sentry shows no new exception spike.
- **Medium-term (5–15 min):** telemetry events flowing (`/api/analytics/realtime` non-empty), rate-limit headers present (`x-ratelimit-*`), Mailgun/Sentry/Upstash integrations report configured state in `/api/v1/system/health` dependency block, pino error rate at baseline.
- **Long-term (15+ min → 24 h):** availability tracking toward 99.5%/30d (D16, `docs/ops/slo.md`); next `backup.yml` run green; no Dependabot alerts from the new lockfile (`npm audit` gate already 0-vuln policy); Lighthouse scores on the next nightly/PR run at or above D17 floors.

## 6. Rollback Procedure

- **Decision criteria:** health probe failing > 2 min after deploy; CSP violations breaking rendering; engine scans erroring > baseline; payment/webhook 5xx spike; any SEC-regression signal (auth 401s for valid tokens).
- **Steps:**
  1. Frontend: Cloudflare Pages → "Rollback deployment" to the previous successful deployment (atomic, < 1 min).
  2. Worker: `npx wrangler versions list` → `wrangler rollback` to the previous immutable version (only needed if `worker/api-proxy.js` changed — it did **not** in this change set).
  3. API host: redeploy previous `dist/server.cjs` artifact / previous Docker tag; systemd: `sudo systemctl restart catalystlab` after swapping artifact; or use `.github/workflows/rollback.yml`.
  4. Repo: `git revert <merge-commit>` on `main` — the lockfile restoration is additive; reverting returns to the (broken-pipeline but running) prior state.
  5. Data: no schema migrations in this change set ⇒ no data rollback. Firestore point-in-time restore only per `docs/ops/runbook.md` if an unrelated incident coincides.
- **Post-rollback verification:** re-run §5 Immediate + Short-term signals against the rolled-back versions; confirm `docs/ops/alerts.yml` rules quiet.
- **Communication:** per §7 incident path.

## 7. Communication Plan

- **Pre-deployment (T-24 h → T-1 h):** single-operator service (`docs/ops/runbook.md`): owner self-notification is sufficient; note the production promotion window in the PR description. No user-facing downtime expected ⇒ no status-page notice required for staging; for the production API restart, optionally banner-free (blip < 30 s, off-peak).
- **Deployment start:** PR merged / `workflow_dispatch` triggered — record time in the PR.
- **Progress updates:** on any §6 decision-criteria hit, escalate immediately: `legal@catalystlab.tech` / `support@catalystlab.tech` (runbook escalation path), Severity-1 response starts immediately (Q20: 72 h breach-notification clock only if a security incident — not expected here).
- **Completion:** comment on the PR with the §5 signal checklist results; update `docs/release/checklist.md` if it gates releases.

## 8. Change-Set Inventory (what merges)

| Area | Files | Nature |
|---|---|---|
| Pipeline restore | `.nvmrc` (new, `24` per D5), `package-lock.json` (new, npm per D6), `.env.staging.example`, `.env.production.example` (new, 40-key parity, prod `APP_ORIGIN=https://www.catalystlab.tech` + `PAYMENTS_ENABLED=false` per D14/Q32) | Additive — unblocks all 5 workflows + Docker |
| Component consolidation | root `components/` + `types/` deleted; 5 implementations + `telemetry.ts` moved into `src/`; shims replaced; `tsconfig.json` (`include`, `@/*` single-root), `eslint.config.js` (files list) | Structural, render-neutral |
| Archive | `archive/` (14 codemods + README) via `git mv` | Housekeeping |
| Binary purge | `.aistudio/`, `videos/`, `public/assets/aistudio/`, `assets/banners/hero-banner.png` (regenerable via `scripts/screenshot-banner.cjs`), 4 unreferenced images in `src/assets/images/`; `.gitignore` += `.aistudio/` | −~4.4 MB working tree |
| Code fixes | `src/lib/firebase.ts` (seed URL → `${SITE_ORIGIN}/api/v1/system/health`, note corrected per D7), `firebase-applet-config.json` (dead `recaptchaSiteKey` removed), `src/components/home/HeroSection.tsx` (dead imports + dead `PRESETS` removed) | Behavior-safe |
| Test re-base | `accessibilityAndContrast`, `partnerMarquee`, `unifiedNavigationMenu` (3 tests updated to the `d2c26ef` design contract; all 11 assertions in those files pass) | Repairs pre-existing red at HEAD |
| CI | `.github/workflows/ci.yml` += `python-tooling` job (pytest/ruff/mypy/black, Python 3.11) | Additive gate |
| Docs | `README.md`, `docs/ARCHITECTURE.md` refreshed (Vite 8/React 19/Express 5, 36 test files, `src/lib/nodeEngines.ts`, dead link removed, CI job inventory); `docs/codebase/*` updated; `docs/plan/decisions.md` += Q43–Q52 | Truth-at-HEAD |
