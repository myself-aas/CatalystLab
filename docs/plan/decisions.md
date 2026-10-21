# Owner decisions log (production-readiness plan, Phase 1)

Status of every decision in `production-readiness-plan.md` §3. A row counts as answered only when the owner writes `answered` or `accepted` in the Status column with a date. Agents do not fill in owner answers.

| # | Decision | Status | Owner answer | Date |
|---|---|---|---|---|
| D1 | Paid plan activation model | answered | Round 2 Q13: webhook writes the subscription; the client never activates a paid plan. | 2026-10-19 |
| D2 | Payment gateway | answered | Round 1 Q1: 2Checkout is the single live gateway. Dodo stays in code, disabled until needed. | 2026-10-19 |
| D3 | Deployment target | answered | Revised 2026-10-19 (owner): option b, split. Static frontend on Cloudflare Pages; API on a Node host; same-origin `/api` proxy (Cloudflare Worker route, Q31 (a)). Supersedes Round 1 Q2 option A. | 2026-10-19 |
| D4 | Public analytics | answered | Round 1 Q3: global aggregates public; per-domain numbers need identity and domain ownership. | 2026-10-19 |
| D5 | Node version | answered | Round 1 Q4a: Node 24 everywhere. | 2026-10-19 |
| D6 | Canonical lockfile | answered | Round 1 Q4b: keep npm; delete `bun.lock`. | 2026-10-19 |
| D7 | Canonical engine path | answered | Round 1 Q4c: `src/lib/nodeEngines.ts` is canonical; top-level `lib/engines/` removed with the Next leftovers. | 2026-10-19 |
| D8 | `api/` Vercel twins | answered | Round 2 Q14: delete `api/`; Express serves the same routes. | 2026-10-19 |
| D9 | Retention periods | answered | Round 1 Q5: publish the five tier values (14/60/90/365/730 days); purge job enforces them. | 2026-10-19 |
| D10 | Error tracker | answered | Round 1 Q6: Sentry with PII scrubbing; listed as a subprocessor in privacy copy. | 2026-10-19 |
| D11 | Public-page rendering | answered | Round 2 Q15: prerender public routes at build time; app routes client-only with noindex. | 2026-10-19 |
| D12 | AI-crawler policy | answered | Round 1 Q7: allow Googlebot, OAI-SearchBot, PerplexityBot, Claude-SearchBot, user-triggered fetchers; disallow GPTBot, ClaudeBot, CCBot, Google-Extended. | 2026-10-19 |
| D13 | Machine-readable content for agents | answered | Round 3 Q19: keep `llms.txt` and `llms-full.txt`, generated from the same sources as the pages; defer Markdown alternates. | 2026-10-19 |
| D14 | Canonical host and legacy `.html` pages | answered | Round 1 Q9: `www` canonical; apex 301 to `www`. Q10: review `admin.html` and `dashboard.html` first, then 301 and delete all 18 legacy pages. | 2026-10-19 |
| D15 | Entity identity in structured data | answered | Round 1 Q8: "CatalystLab Inc." is the registered name. Registered address and jurisdiction pending (Round 2, Q17). | 2026-10-19 |
| D16 | SLO targets and recovery objectives | answered | Round 2 Q16: availability 99.5% over 30 days; RPO 24 h; RTO 4 h; latency target set after the 10.3 load test. | 2026-10-19 |
| D17 | Lighthouse budgets and the landing-page best-practices baseline | answered | Owner 2026-10-20: keep accessibility ≥ 0.9, SEO ≥ 0.85 and best-practices ≥ 0.85 as hard gates, and performance < 0.5 as a warning; audit the real production host (`node dist/server.cjs`), not a bare static dir. Two route-aware exceptions, both recorded rather than hidden: (a) SEO does not apply to `noindex` application shells (D11), because Lighthouse's `is-crawlable` audit fails them by design; (b) the landing page's best-practices floor is re-based to the measured 0.74 because it initialises Firebase Auth eagerly, which Chrome reports as third-party cookies and inspector issues. The baseline may only be raised, and it should be deleted once Firebase is lazy-initialised on the landing page. The dead Pexels photo 3861958 (503 on every run) was replaced with local assets, which is what lifted every other route to best-practices 1.0. | 2026-10-20 |

## Other questions (not decisions in the D-table)

| Q | Question | Status | Owner answer | Date |
|---|---|---|---|---|
| Q17 | Registered address and jurisdiction of CatalystLab Inc. | partly answered | Owner (2026-10-19): the public site is https://www.catalystlab.tech; the owner is a solo developer and business owner with no physical location. Jurisdiction still open (Q33). | 2026-10-19 |
| Q19 | Agent-readable content (D13): keep `llms.txt` and `llms-full.txt`; defer Markdown alternates. | answered | Round 3 Q19: yes. | 2026-10-19 |
| Q20 | Minimum age 18; breach notice 72 h to authority, without undue delay to users. | answered | Round 3 Q20: yes. | 2026-10-19 |
| Q21 | Refunds: monthly 7 days, annual 14 days; acknowledge 2 / decide 5 / process 10 business days; provider fees not refunded; manual refunds until automated. | answered | Round 3 Q21: yes. | 2026-10-19 |
| Q22 | Trial with no payment method; billing only after a paid choice; self-service cancel to Community at period end; paid checkout after plan items 2.1–2.4. | answered | Round 3 Q22: yes. Cancel control is a Phase 2 build item. | 2026-10-19 |
| Q23 | Annual prices in `pricingData.ts` are published and checkout reads them; USD; 2Checkout is merchant of record; renewal per merchant terms. | answered | Round 3 Q23: yes. | 2026-10-19 |
| Q24 | Liability cap 12 months' fees; indemnity limited to misuse; no availability commitment; dispute resolution in Round 4. | answered | Round 3 Q24: yes (counsel to review). | 2026-10-19 |
| Q25 | 30 days' notice for material changes; "material" defined. | answered | Round 3 Q25: yes. | 2026-10-19 |
| Q26 | Retention promises: results per tier (D9); contact messages 365 days; deletion within 30 days; API keys not persisted until 4.1; logs 30 days with credentials redacted; metadata limited. | answered | Round 3 Q26: yes. | 2026-10-19 |
| Q27 | No third-party analytics or ad identifiers at launch; cookie policy lists localStorage and Firebase Auth; seven subprocessors with DPAs. | answered | Round 3 Q27: yes. | 2026-10-19 |
| Q28 | Rights list with one-month response; legal basis by purpose (counsel to confirm). | answered | Round 3 Q28: yes. | 2026-10-19 |
| Q29 | One monitored legal mailbox; DPO only if required. | answered | Round 3 Q29: yes. | 2026-10-19 |
| Q30 | Hosting provider and region for the API host and the frontend. | partly answered | Owner: no funding; use the best free options, including Student Developer Pack offers. Frontend: Cloudflare Pages (free). API host: open (Q32), because Azure for Students and the pack's partner offers are restricted to non-commercial use. | 2026-10-19 |
| Q32 | API host under a zero budget and commercial use. | answered | Round 3 Q32: Oracle Always Free sized to 2 OCPU / 12 GB; Render Free as the documented fallback. Paid checkout stays off until 4.1, 4.6, and a webhook retry test pass. | 2026-10-19 |
| Q34 | Effective date of the legal copy. | answered | Round 3 Q34: each legal page states its effective date as the day it is published. | 2026-10-19 |
| Q35 | Dispute steps. | answered | Round 3 Q35: 30 days of good-faith negotiation by email, then the courts in Mymensingh, Bangladesh; no arbitration. Counsel to confirm (review item). | 2026-10-19 |
| Q36 | Oracle home region (fixed at signup). | answered | Round 3 Q36: pick, at signup, the region with Always Free A1 capacity nearest to users; the home region cannot be changed later. | 2026-10-19 |
| Q37 | `patch.css` (live: imported by `src/index.css:4`). | answered | Round 5 (owner accepted):  keep it; do not delete. Fold into `src/index.css` only as a later cleanup. | 2026-10-19 |
| Q38 | Typecheck as a hard gate; 127 test-file errors. | answered | Round 5 (owner accepted):  yes. Import `@testing-library/jest-dom/vitest` in `src/tests/setup.ts` (earlier verification reported 0 errors; re-verify in 4b). | 2026-10-19 |
| Q39 | `ai_search` engine (listed in `docs/ENGINES.md`, not on the server). | answered | Round 5 (owner accepted):  do not expose at launch; correct `docs/ENGINES.md`. | 2026-10-19 |
| Q40 | `PORT` environment variable. | answered | Round 5 (owner accepted):  honour `PORT`, defaulting to 3000 (README says so). | 2026-10-19 |
| Q41 | Generic webhook SSRF gap; Discord hostname check. | answered | Round 5 (owner accepted):  use `guardedFetch` (pinned DNS) on the generic webhook path, and parse the hostname for the Discord check. | 2026-10-19 |
| Q42 | `.env.example` keys and README `VITE_FIREBASE_*` section. | answered | Round 5 (owner accepted):  add `APP_ORIGIN`, `VITE_APP_ORIGIN`, `JWT_SECRET`, `PAYMENT_SIGNING_SECRET`; remove the README `VITE_FIREBASE_*` section (never read). | 2026-10-19 |
| Q33 | Governing law and courts. | answered | Round 3 Q33: Bangladesh law; courts in Mymensingh, Bangladesh. Owner's wording mentioned "Bangladesh Agricultural University Campus"; a university campus is not a court venue, so the copy says "the courts in Mymensingh, Bangladesh". Owner to confirm. | 2026-10-19 |
| Q31 | Same-origin `/api` proxy mechanism for split hosting (D3 b). | answered | Round 3 Q31: yes to (a), a Cloudflare Worker route on the apex zone forwarding `/api/*` to the API host. | 2026-10-19 |
| Q18 | HazardNet notebook and `workspace/` classification | answered | Round 2 Q18: move the notebook out of this repo (destination to be named); move `workspace/refactor_colors.sh` to `archive/`. | 2026-10-19 |
| Q18b | HazardNet files: remove completely. | answered | Round 3 Q18b: removed the notebook and the HazardNet seed entry in `src/lib/firebase.ts` (INITIAL_MONITORED_SITES). | 2026-10-19 |


---

## Implementation status (2026-10-19)

Every decision above is now reflected in code, or in the docs where the decision
was about docs. The rows keep their original wording; this section records where
each one landed so a reviewer can check the claim in one step.

| Decision | Where it landed |
| --- | --- |
| D1, D2 payments | `server/core/pricing.ts`, `server/core/subscriptions.ts`, `server/routes/payments.ts` (`PAYMENT_GATEWAY` = `2checkout` or `dodopay`); 18 tests in `src/tests/server/subscriptions.test.ts` |
| D3 (b) split hosting, Q31, Q32 | `public/_redirects`, `public/_headers`, `worker/api-proxy.js`, `wrangler.toml`, `docs/ops/runbook.md` §1 |
| D4 domain access | `server/core/domainAccess.ts` (fail-closed 401/403/503) + `src/tests/server/domainAccess.test.ts` |
| D5 TLS probe port 443 (answer #5) | `server/core/ssl.ts` + `src/tests/server/tlsProbe.test.ts` |
| D6/D7/D8/D13 | `src/lib/nodeEngines.ts` is canonical; the duplicated `lib/engines/`, `api/`, `app/` and `next.config.ts` layers were deleted; `docs/ENGINES.md` rewritten |
| D9 + answer #2 retention | `server/core/retention.ts` (TTL index **and** per-plan sweep) wired into `server/app.ts`, `routes/contact.ts`, `core/subscriptions.ts`, `routes/telemetry.ts`; 11 tests |
| D10 Sentry | `server/core/errorTracking.ts` (scrubber + `beforeSend`, disabled without `SENTRY_DSN`), relayed from `server/routes/clientLogs.ts` and the Express error handler; `src/tests/server/errorTracking.test.ts`; listed as a subprocessor in the privacy policy |
| D11 prerender + real 404s | `scripts/prerender.ts` (74 shells, `dist/404.html`, `dist/sitemap.xml`, `dist/routes.json`), `server/core/spaRoutes.ts`, the `app.get('*')` handler in `server.ts` |
| D12 crawler policy | `public/robots.txt` |
| D14 canonical www + legacy 301s | `public/_redirects` (Cloudflare Pages) and the `.html` → clean-route 301s in `server.ts`; the 18 legacy `public/*.html` pages are deleted |
| D15 entity, offers, edge count | `src/config/site.ts`, the JSON-LD generated by `scripts/prerender.ts`, and the `TOTAL_POPS_COUNT` reads in `Navbar`, `Footer`, `DashboardMetricsBentoGrid`, `FramerDossierCockpit`, `UserDashboardPage` |
| D16 SLO/RPO/RTO | `docs/ops/runbook.md` §2 |
| Answer #1 quota in Upstash | `server/core/dailyQuota.ts`; 11 tests in `src/tests/server/dailyQuota.test.ts` |
| Answer #3 synthetic endpoints | `/api/v1/reports*` and `/api/v1/blogs*` answer `501` |
| Answer #4 audit JSON endpoint | Removed; the SSE stream (`/api/v1/audit/master/stream`) is the only master-audit surface |
| Answers #6, #7, Q20-Q29, Q33-Q36 | `src/legal/legalMeta.ts` + `src/legal/{privacy,terms,refund}.ts`; no `[ASK USER]` marker remains and `src/tests/ui/legalPages.test.tsx` asserts the decided values |
| Answer #8 PR gate | `.github/workflows/ci.yml`; ESLint already covers `server/**`, `components/**`, `types/**` |
| Answer #9 deletions | 38 duplicated root codemods, `archive/`, `workspace/`, `ui-ux-pro-max-skill/`, `bun.lock` removed |
| Answer #10 motion/react | The 4 remaining `framer-motion` imports converted |
| Answer #11 typescript | Moved to `devDependencies` |
| Answer #12 Lighthouse CI | `@lhci/cli` devDependency, `npm run lhci`, `.lighthouserc.json`, CI job |
| Answer #13 unused metadata | `firebase-blueprint.json`, `metadata.json`, `public/comparison-schema.json` removed (zero code references) |
| Q39 engine catalog | `docs/ENGINES.md` and `server/core/enginesCatalog.ts` document 8 engines; no `ai_search` |
| Q40 12-factor | `PORT`/`HOST` from the environment in `server.ts` |
| Q41 SSRF-guarded fetch | `src/lib/networkSecurity.ts` `guardedFetch` used by every outbound engine call |
| Q42 `.env.example` | Rewritten with `APP_ORIGIN`, `VITE_APP_ORIGIN`, `JWT_SECRET`, `PAYMENT_SIGNING_SECRET`, `PAYMENT_GATEWAY`, Upstash and Sentry keys; the README `VITE_FIREBASE_*` row is gone; `src/config/site.ts` reads the origin overrides |
| Plan §4b.6 coverage ratchet | `vitest.config.ts` thresholds set to the measured baseline (68/55/72/69) |
| Answer #14 churn mapping | Attempted against a full clone; see `docs/codebase/CONCERNS.md` |

Still open (tracked in `docs/plan/production-readiness-plan.md`, not decisions):
Phase 3 items 3.2, 3.5-3.8, 3.10-3.16 (telemetry ingest limit, public system
detail endpoints, trusted-proxy hop count, demo seed removal, CSP tightening,
`npm audit`, gitleaks, semgrep, the security review note and staging-only active
testing).

---

## Owner answers — codebase-knowledge session (2026-10-21)

The ten `[ASK USER]` questions raised by the regenerated `docs/codebase/CONCERNS.md` §6, answered by the owner in the Arena session of 2026-10-21 and implemented on branch `arena/8a8e3bc4-catalystlab` the same day. Rollout details: `docs/plan/rollout-pipeline-restore-2026-10-21.md`.

| Q | Decision | Status | Owner answer | Implementation |
|---|---|---|---|---|
| Q43 | Restore the missing pipeline files (`.nvmrc`, `package-lock.json`, `.env.staging.example`, `.env.production.example`)? | answered | "regenerate … per D5/D6" | `.nvmrc` = `24` (D5); lockfile regenerated with npm (D6); both env templates restored with 40-key parity, prod `APP_ORIGIN=https://www.catalystlab.tech` + `PAYMENTS_ENABLED=false` (D14/Q32); `check:env` passes in CI mode |
| Q44 | SEC-2026-01 Atlas credential rotation + remote history purge? | answered (owner action) | "No, I'll rotate Atlas password" | Owner rotates the Atlas password out-of-band; no repo change. History in this clone is already the single squashed commit |
| Q45 | Consolidate root `components/` into `src/components/`? | answered | "Yes" | 5 implementations + root `types/telemetry.ts` moved into `src/`; shim web deleted; `tsconfig.json` `@/*` single-root + `include` trimmed; `eslint.config.js` files list trimmed; typecheck/lint/suite green |
| Q46 | Refresh README / `docs/ARCHITECTURE.md` to HEAD? | answered | "Yes" | Vite 8 / React 19 / Express 5, 36 test files, `src/lib/nodeEngines.ts`, dead `PRODUCTION_READINESS_AUDIT.md` link replaced with plan/decisions links, CI job inventory incl. new `python-tooling` job, mermaid labels fixed |
| Q47 | Archive the 14 root codemods? | answered | "Move … to the archive/ that Q18 named but never created" | `archive/` created (14 scripts + README explaining each); root `patch.css` stays (Q37) |
| Q48 | Purge committed artifacts/binaries? | answered | "Yes" | Deleted `.aistudio/`, `videos/`, `public/assets/aistudio/`, regenerable `assets/banners/hero-banner.png`, 4 zero-reference images in `src/assets/images/` (~4.4 MB); `.gitignore` += `.aistudio/`; referenced hero JPEGs verified already-efficiently-encoded (recompression gained only 7% ⇒ left untouched) |
| Q49 | Single-commit history squash intentional? | answered | "Yes" | Recorded; churn analysis stays impossible by design; CODE_REVIEW.md hashes are historical references only |
| Q50 | Hardcoded dev Cloud Run URL in `INITIAL_MONITORED_SITES`? | answered | "Do the best practices" | Seed URL now `${SITE_ORIGIN}/api/v1/system/health` (env-derived per Q42/D14, real health endpoint per Dockerfile/CI/runbook); stale "8 Python telemetry engines" note corrected to the D7 TypeScript reality |
| Q51 | Empty `recaptchaSiteKey` in `firebase-applet-config.json`? | answered | "Don't know … do best practices" | Investigated: zero consumers repo-wide and not a standard Firebase web-config field ⇒ dead config removed; if bot protection is ever needed it returns with a real implementation |
| Q52 | Wire the Python pytest suite into CI? | answered | "Wire up into CI" | New `python-tooling` job in `ci.yml` (Python 3.11: pytest 32 tests, ruff, mypy strict, black --check — all verified green locally before wiring) |

Additional repair in the same session (no question raised): the 3 UI tests broken by the `d2c26ef` design refactor (`accessibilityAndContrast`, `partnerMarquee`, `unifiedNavigationMenu`) were re-based on the new hero/navbar contract, and `HeroSection.tsx` dead imports (`CoverFlowCarousel`, `PartnerMarquee`, `PRESETS`) were removed. `PartnerMarquee`/`CoverFlowCarousel` remain in the codebase as standalone components — re-surfacing them on the landing page is a future design decision, not part of this change.
