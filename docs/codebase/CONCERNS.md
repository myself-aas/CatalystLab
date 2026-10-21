# Codebase Concerns

> Regenerated 2026-10-21 by the `acquire-codebase-knowledge` workflow. Findings verified at commit `d2c26ef` (single squashed root commit, 2026-10-21, 603 files / 102,756 insertions). Production TODO/FIXME/HACK count: **0** (scan output). Git-churn analysis is impossible — history is one commit (squash confirmed intentional, Q49); complexity hotspots are used instead.
>
> **STATUS 2026-10-21 (later same day): the owner answered all ten §6 questions and every repo-side item was implemented and verified on branch `arena/8a8e3bc4-catalystlab`** — see the ✅ markers below, the resolution log in §8, and `docs/plan/decisions.md` Q43–Q52. The only outstanding item is owner-side: the Atlas password rotation (Q44).

## Core Sections (Required)

### 1) Top Risks (Prioritized)

| Severity | Concern | Evidence | Impact | Suggested action |
|----------|---------|----------|--------|------------------|
| ~~High~~ ✅ **Resolved 2026-10-21 (Q43)** | `package-lock.json` was not committed, but CI (`npm ci` in 4 jobs), `Dockerfile:8,30`, and README quickstart all require it | `git ls-files \| grep -i lock` → empty (before fix) | Pipelines failed at install; versions floated inside `^` ranges | Lockfile regenerated with npm (D6) and committed; `npm ci` verified (1102 packages, exit 0) |
| ~~High~~ ✅ **Resolved 2026-10-21 (Q43)** | `.nvmrc` was missing while all 5 workflows use `node-version-file: .nvmrc` | `grep nvmrc .github/workflows/*` → 9 references | `setup-node` would error → no workflow could run | `.nvmrc` = `24` committed (D5 "Node 24 everywhere") |
| ~~High~~ ✅ **Resolved 2026-10-21 (Q43)** | `.env.staging.example` / `.env.production.example` were missing, but `scripts/check-env.mjs` hard-fails without them and `Dockerfile:30` COPYs them | `scripts/check-env.mjs:47-55`; `.gitignore` whitelists them | `check:env` (first step of `npm run ci`) failed; Docker COPY failed | Both templates restored with 40-key parity (42-key after the 2026-10-21 docs pass added `PORT`/`NODE_ENV`); prod pins `APP_ORIGIN=https://www.catalystlab.tech` (D14) + `PAYMENTS_ENABLED=false` (Q32); `check:env` verified green in CI mode |
| High ⏳ **Owner action (Q44)** | Legacy MongoDB Atlas credential recorded in Git history (SEC-2026-01, Critical 9.1) | `docs/security/review-2026-10.md` §2: commit `e4bff70` — "absent from HEAD"; this clone's history contains only `d2c26ef` (squash confirmed intentional, Q49) | Anyone holding an older clone/fork can extract the Atlas credential if unrotated | **Owner rotates the Atlas password out-of-band** (answer #2, 2026-10-21); no repo change. CI secret gates (`sec:secrets`, gitleaks history job) guard regressions |
| ~~Med~~ ✅ **Resolved 2026-10-21 (Q46)** | Intent docs contradicted HEAD (README: "Vite 6 + React 18 … Express 4", "309 tests in 29 files", dead `PRODUCTION_READINESS_AUDIT.md` link, `lib/engines/`; `docs/ARCHITECTURE.md`: "React 18 SPA (Vite 6 build)") | `README.md`, `docs/ARCHITECTURE.md` vs `package.json` | Onboarding on false premises | README + ARCHITECTURE refreshed to Vite 8 / React 19 / Express 5, 36 test files / 330 tests (measured), `src/lib/nodeEngines.ts`, plan/decisions links, 5-job CI inventory |
| ~~Med~~ ✅ **Resolved 2026-10-21 (Q45)** | Split component tree: 5 real implementations in root `components/` + bidirectional shims; root `types/telemetry.ts` was the real file behind a `src/types` shim | pre-fix shim/diff matrix | Two homes for one concern; `@/*` dual fallback could resolve duplicates | All implementations consolidated into `src/`; root `components/` + `types/` deleted; `tsconfig` `@/*` single-root; `tsc`/lint/330-test suite green after the move |
| ~~Med~~ ✅ **Resolved 2026-10-21 (Q47)** | Root clutter: 14 one-off codemods at repo root | root listing; Q18 named an `archive/` that never existed | Root unreadable; spent codemods looked live | All 14 moved to `archive/` + `archive/README.md`; `patch.css` stays (live via `src/index.css`, Q37) |
| ~~Med~~ ✅ **Resolved 2026-10-21 (Q48)** | Generated/binary artifacts committed: `.aistudio/` 1.7 MB, duplicate screenshots (~2.7 MB md5-identical), `videos/` 825 KB, regenerable `hero-banner.png` 797.7 KB, 4 zero-ref images in `src/assets/images/` | scan CODE METRICS; `md5sum`/`du`; per-file reference greps | Repo weight + served bytes | All purged (~4.4 MB); `.gitignore` += `.aistudio/`; referenced hero JPEGs verified already-efficient (q82 recompression gained only 7% ⇒ left untouched); `hero-banner.png` regenerable via `scripts/screenshot-banner.cjs` |
| ~~Low~~ ✅ **Resolved 2026-10-21 (Q50)** | Hardcoded **dev** Cloud Run URL + stale "8 Python telemetry engines" note in `INITIAL_MONITORED_SITES` | `src/lib/firebase.ts:777-794` (pre-fix) | Internal dev endpoint leaked into client bundle | Seed now `${SITE_ORIGIN}/api/v1/system/health` (env-derived per Q42/D14; the endpoint Dockerfile/CI/runbook actually probe); note corrected to D7 reality |
| NEW → ✅ **Fixed 2026-10-21** | 3 UI tests red at pristine HEAD (`accessibilityAndContrast`, `partnerMarquee`, `unifiedNavigationMenu`) — the `d2c26ef` design refactor changed the hero/navbar but not the tests; README's "every gate is green" was false at HEAD | pristine-HEAD worktree run: same 3 failures without any of my changes | `npm test` CI gate red ⇒ nothing could merge | Tests re-based on the new design contract (scrim→theme-token assertions, marquee-out-of-hero, navbar label); `HeroSection.tsx` dead imports (`CoverFlowCarousel`, `PartnerMarquee`, `PRESETS`) removed; suite 330/330 green |
| NEW → ✅ **Fixed 2026-10-21 (Q51)** | Dead `recaptchaSiteKey: ""` shipped in the public `firebase-applet-config.json` | zero consumers repo-wide (grep); not a standard Firebase web-config field | Dead config implies non-existent bot protection | Field removed; reCAPTCHA returns only with a real implementation |
| NEW → ✅ **Fixed 2026-10-21 (Q52)** | Python `pytest` suite configured but not wired into any workflow | `pyproject.toml` vs workflow grep | `scripts/replace_images.py` regressions undetected | New `python-tooling` CI job (Python 3.11: pytest 32 ✓, ruff ✓, mypy-strict ✓, black ✓ — all verified locally before wiring) |

### 2) Technical Debt

| Debt item | Why it exists | Where | Risk if ignored | Suggested fix |
|-----------|---------------|-------|-----------------|---------------|
| In-memory fallbacks for rate limits & analytics | Zero-cost dev mode (Q30/Q32) | `server/core/rateLimit.ts`, `sharedLimiter.ts`, `src/lib/analyticsEngine.ts` | Multi-instance deploys fragment quota; restarts reset counters — README: "not acceptable in production"; payments already hard-require Upstash in prod (SEC-2026-08), rate limiting does not | Extend the `checkCheckoutReadiness` pattern: refuse prod boot (or loud warn) without `UPSTASH_*`/`MONGODB_URI` |
| God-files | Organic growth | `src/lib/firebase.ts` (1,898 LOC), `src/data/apiSpecs.ts` (1,331), `src/pages/PlaygroundPage.tsx` (1,191), `src/lib/media/registry.ts` (1,022), `src/pages/UserDashboardPage.tsx` (972), `src/lib/nodeEngines.ts` (939) | High blast radius per change; hard to review | Decompose firebase.ts (auth/firestore/CRUD/seed), split nodeEngines per engine |
| `@typescript-eslint/no-explicit-any` + `no-unused-vars` off; 69 `: any` in prod code | Lint gate kept at "0 problems" by disabling rules | `eslint.config.js`; grep this session | Type-safety erosion under `strict: true` elsewhere | Re-enable as `warn`, burn down |
| `scripts/` excluded from ESLint | Gate scripts treated as tooling | `eslint.config.js` ignores | CI gate scripts themselves unlinted | Add a lighter lint pass for `scripts/` |
| ~~pytest suite not in CI~~ ✅ Q52 | Python tooling is "inert to the JS toolchain" | `ci.yml` `python-tooling` job added 2026-10-21 | — | Done (pytest+ruff+mypy+black) |
| History squashed to one commit — **intentional (Q49)** | Owner reset history at the design-refactor | `git log` → `d2c26ef` (no parent); Q49 answer 2026-10-21 | `git blame`/churn useless; CODE_REVIEW.md cites dead hashes (`4568112`, `7de284a`, `eab9e56`…) | Decision recorded; keep future history granular |
| No `SECURITY.md` | — | `ls SECURITY.md` → absent (scan "SECURITY & COMPLIANCE: none detected" — though `.gitleaks.toml`, `.semgrep.yml`, `dependabot.yml`, `docs/security/` exist) | No public vulnerability-reporting channel despite a security-forward product | Add SECURITY.md pointing at `legal@catalystlab.tech` / docs/security |
| ~~README/docs drift~~ ✅ Q46 | Docs not updated in the design-system refactor commit | README, `docs/ARCHITECTURE.md` — refreshed 2026-10-21 | — | Done; consider a CI link check to prevent recurrence |

### 3) Security Concerns

Posture is unusually strong for the size (fail-closed everywhere, CSP without `unsafe-inline`, HMAC webhooks, SSRF DNS pinning, allowlist log serializers, gitleaks+semgrep+dependabot gates — `docs/security/review-2026-10.md` shows SEC-2026-02…09 remediated & verified). Residual gaps:

| Risk | OWASP category | Evidence | Current mitigation | Gap |
|------|----------------|----------|--------------------|-----|
| Legacy Atlas credential in old history | A07 / CWE-798 | SEC-2026-01 | Absent from HEAD; history squashed; CI secret gates (`scripts/scan-secrets.mjs`, gitleaks job) | Rotation + remote-purge confirmation is an unverified owner action |
| ~~Client-visible dev endpoint~~ ✅ Q50 | A05 (misconfiguration) | `src/lib/firebase.ts` (`INITIAL_MONITORED_SITES`) | Fixed 2026-10-21: seed URL = `${SITE_ORIGIN}/api/v1/system/health` (env-derived) | None |
| In-memory quota fallback in prod | A04 (resource exhaustion) | README env table; `server/core/rateLimit.ts` | Upstash supported; payments gated on it | Rate limiting not gated the same way |
| Landing page eager Firebase init | N/A (privacy/perf) | `docs/plan/decisions.md` D17 (best-practices re-based to 0.74) | Documented exception, "delete once Firebase is lazy-initialised" | Lazy-init not yet implemented |
| ~~Empty `recaptchaSiteKey`~~ ✅ Q51 | N/A | `firebase-applet-config.json` | Dead field removed 2026-10-21 (zero consumers, non-standard field) | None — reintroduce only with a real bot-protection implementation |
| `useUnknownInCatchVariables: false` | N/A (robustness) | `tsconfig.json` | Error helpers (`getErrorMessage`) | Accidental `any` in catch paths |

### 4) Performance and Scaling Concerns

| Concern | Evidence | Current symptom | Scaling risk | Suggested improvement |
|---------|----------|-----------------|-------------|-----------------------|
| Engine scans execute in-request on the same free-tier process that serves the SPA | `server/routes/engines.ts`, `src/lib/nodeEngines.ts` (10 s timeout × up to 8 engines for master audits, SSE stream) | Single Oracle Always Free box (Q32) | Head-of-line blocking during bursts; SLO 99.5% (D16) | CI k6 gate exists; consider a worker/queue split if load grows |
| Heavy committed images served to clients | `assets/banners/hero-banner.png` 797.7 KB; `public/assets/aistudio/*.png` 1.1 MB & 248 KB; logo JPGs ~400 KB (scan CODE METRICS) | Larger payloads than needed | CWV (LCP) — the product audits CWV | Compress/convert (AVIF/WebP), extend `media:check` with size budgets |
| Initial-chunk size | CODE_REVIEW follow-ups: "initial-chunk splitting (entry 1009 kB)" | Bundle budget gate enforced (`scripts/check-bundle-budget.mjs` BUDGETS + `npm run check:bundle`) | Budget creep | Track the CODE_REVIEW follow-up |
| Per-process shell cache & limiter | `server.ts:74-95` (≤256 shells), `sharedLimiter.ts` | Fine single-instance | Cache/counter divergence if horizontally scaled | Keep single instance or externalize |
| Analytics in-memory buffer bounds | `src/lib/analyticsEngine.ts` | `[TODO]` — no explicit cap found via grep this session | Unbounded heap growth without Mongo under load | Verify/flush-bound the buffer |

### 5) Fragile/High-Churn Areas

Git churn is unmeasurable (single root commit — scan HIGH-CHURN section lists every file at count 1). Complexity hotspots by size + coupling instead:

| Area | Why fragile | Signal | Safe change strategy |
|------|-------------|--------|----------------------|
| `src/lib/firebase.ts` | Largest file (1,898 LOC); auth + Firestore CRUD + seeds + error taxonomy | size; hardcoded seed URL already flagged | Narrow edits; add tests around touched CRUD paths; don't refactor blind |
| `server/app.ts` + `server.ts` | CSP hash/nonce pipeline, gzip monkey-patching of `res.write/end`, shell cache — subtle ordering | SEC-2026-04/05 history; smoke tests assert CSP headers | Change with `e2e/smoke` + `verify-deployment.mjs` running |
| Design-token CSS chain (`src/index.css` → `styles/*.css` → root `patch.css`, `.impeccable/design.json`) | Latest commit was a design-system refactor; `check:design` gate exists; AGENTS.md freezes `ds-*`/`framer-*` canon | commit `d2c26ef` subject; PRODUCT.md "engine hues are product truth" | Run `npm run check:design` + Lighthouse a11y ≥ 0.9 before/after |
| ~~Root `components/` ↔ `src/components/` shim web~~ ✅ resolved (Q45) | Was: bidirectional re-exports, diverging duplicates | Consolidated 2026-10-21; single tree in `src/components/` | Ordinary change hygiene now applies |
| `server/core/subscriptions.ts` / payments | Money path; idempotency + ordering invariants (D1) | dedicated CI sandbox gate | Never change without `paymentWebhookRetry` + `e2e-payment-sandbox` green |

### 6) `[ASK USER]` Questions — ALL ANSWERED 2026-10-21 (recorded as Q43–Q52 in `docs/plan/decisions.md`)

1. ~~Pipeline files missing~~ → **Answered (Q43):** "regenerate … per D5/D6". ✅ Done — see §8.
2. ~~Atlas credential rotation~~ → **Answered (Q44):** "No, I'll rotate Atlas password" — owner-side action, out of repo scope. ⏳ Track to completion before any public exposure.
3. ~~Split component tree~~ → **Answered (Q45):** "Yes" (consolidate). ✅ Done.
4. ~~Stale README/ARCHITECTURE~~ → **Answered (Q46):** "Yes" (refresh). ✅ Done.
5. ~~Root codemods~~ → **Answered (Q47):** "Move … to the archive/ that Q18 named but never created". ✅ Done.
6. ~~Committed artifacts/binaries~~ → **Answered (Q48):** "Yes" (purge). ✅ Done.
7. ~~History squash~~ → **Answered (Q49):** "Yes" (intentional). ✅ Recorded.
8. ~~Hardcoded dev Cloud Run URL~~ → **Answered (Q50):** "Do the best practices". ✅ Done — env-derived `SITE_ORIGIN` + real health endpoint.
9. ~~Empty `recaptchaSiteKey`~~ → **Answered (Q51):** "Don't know, check out and do best practices". ✅ Investigated (zero consumers, non-standard field) → removed as dead config.
10. ~~pytest not in CI~~ → **Answered (Q52):** "Wire up into CI". ✅ Done — `python-tooling` job.

### 7) Evidence

- Scan output: `docs/codebase/.codebase-scan.txt` — TODO/FIXME/HACK "None found"; CODE METRICS (596 files / 86,103 LOC; largest-file table); HIGH-CHURN (all counts = 1, single-commit history); CI/CD GitHub Actions; Container Docker. (Note: the scan's "SECURITY & COMPLIANCE: none detected" under-reports — `.gitleaks.toml`, `.semgrep.yml`, `.github/dependabot.yml`, `docs/security/` exist and were verified directly.)
- Missing-file proofs this session: `ls .nvmrc .env.staging.example .env.production.example PRODUCTION_READINESS_AUDIT.md SECURITY.md` (all absent); `git ls-files | grep -i lock` (empty).
- `.github/workflows/ci.yml` (4 jobs, all `npm ci` + `node-version-file: .nvmrc`; docker build + non-root + health probe; gitleaks v8.21.2 history scan; semgrep 1.181.0; promtool on `docs/ops/alerts.yml`), `deploy.yml`, `backup.yml`, `rollback.yml`, `media-verify.yml`.
- `scripts/check-env.mjs:40-55` (template-parity hard failures), `Dockerfile:8,30` (COPY lines).
- `docs/security/review-2026-10.md` (SEC-2026-01…09 register), `CODE_REVIEW.md` (historical C1–C5, follow-ups), `docs/plan/decisions.md` (D2, D5, D6, D7, D16, D17, Q18, Q30, Q32, Q37).
- Size/duplication measurements: `wc -l` hotspot table, `md5sum` duplicate groups, `du -sh .aistudio videos public assets`.
- `src/lib/firebase.ts:777-794`, `firebase-applet-config.json`, `eslint.config.js`, `tsconfig.json`, `vitest.config.ts`.

### 8) Resolution Log (2026-10-21, branch `arena/8a8e3bc4-catalystlab`)

Verification evidence for every ✅ above — all commands executed this session:

| # | Action | Verification (real output) |
|---|--------|----------------------------|
| Q43 | `.nvmrc`=`24`; `package-lock.json` regenerated (`npm install --package-lock-only`, npm 10.9.8); `.env.staging.example` + `.env.production.example` written with 40-key parity | `npm ci` → "added 1102 packages", exit 0; `CI=true … node scripts/check-env.mjs` → "preflight passed (40 parity-verified keys…)", exit 0; re-run after the `PORT`/`NODE_ENV` addition → "42 parity-verified keys", exit 0 (local + CI mode) |
| Q45 | Root `components/` (5 implementations + 9 stubs) and root `types/` consolidated into `src/`; shims deleted; `MasterTelemetryGrid` imports rewritten (`../common/ExportReportDropdown`, `../../types`); `tsconfig.json` (`include`, `@/*` single-root) + `eslint.config.js` (files list) trimmed | `grep -rn "\.\./\.\./\.\./components" src` → no hits; `npx tsc --noEmit` → 0 errors; `npm run lint` → 0 problems |
| Q47 | 14 codemods `git mv` → `archive/` + `archive/README.md`; reference-checked first (only doc mentions) | `ls archive/` → 14 files; root listing clean |
| Q48 | Purged `.aistudio/`, `videos/`, `public/assets/aistudio/`, `assets/banners/hero-banner.png`, 4 zero-ref images (`catalystlab_logo*`, `catalystlab_minimalist_logo*`, `page-accessibility.jpg`); `.gitignore` += `.aistudio/` | per-file reference greps = 0 hits before deletion; ~4.4 MB removed; recompression experiment on referenced heroes gained only 7% ⇒ reverted (quality preserved) |
| Q50 | `INITIAL_MONITORED_SITES.url` → `` `${SITE_ORIGIN}/api/v1/system/health` ``; note corrected (D7) | typecheck + suite green; no `run.app` string remains in `src/` |
| Q51 | `recaptchaSiteKey` removed from `firebase-applet-config.json` | grep: zero consumers before removal; suite green after |
| Q52 | `python-tooling` job appended to `ci.yml` (pytest/ruff/mypy/black, Python 3.11, pip cache) | local pre-verification: 32 pytest passed, ruff/mypy/black clean; `yaml.safe_load` → 5 jobs parse |
| Q46 | README (versions, counts, dead link, engine path, CI inventory, current-state block) + `docs/ARCHITECTURE.md` (mermaid labels, engine path) refreshed | diffs reviewed; counts measured not copied |
| test repair | 3 UI tests re-based on the `d2c26ef` design contract; `HeroSection.tsx` dead imports/`PRESETS` removed | pristine-HEAD worktree proved the 3 failures pre-existed my changes; after fix: `npm test` → **36 files / 330 tests passed**; `test:coverage` → ratchet met (70.02/58.53/73.66/71.40 ≥ 68/55/72/69); `npm run build` → exit 0 (`dist/server.cjs` 313.8 kB); `check:bundle` → all 6 budgets pass; production smoke boot of `dist/server.cjs` → health 200s, shells 200, legacy `.html` 301s, real 404, zero-`unsafe-inline` CSP, payments fail-closed 503, `verify-deployment.mjs` "All live deployment & security header contracts passed" |

Not executed in this sandbox (CI-only, external tools/network): Playwright browser download (e2e), k6, Docker build, gitleaks/semgrep, Lighthouse, `media:check` (remote media hosts unreachable from the sandbox). All are wired in `ci.yml` and will run on the PR.

**Remaining open items:** (1) owner-side Atlas rotation (Q44); (2) `[TODO]` decompose god-files (§2); (3) `[TODO]` re-enable `no-explicit-any` as warn and burn down 69 occurrences (§2); (4) `[TODO]` add `SECURITY.md` (§2); (5) `[TODO]` decide whether `PartnerMarquee`/`CoverFlowCarousel` should resurface on the landing page (orphaned by the design refactor — components kept, tests cover them standalone); (6) `[TODO]` verify the Docker build + e2e + k6 green on the first CI run of this branch (rollout plan §3–§5).
