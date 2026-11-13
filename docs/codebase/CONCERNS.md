# Codebase Concerns

> Regenerated 2026-11-12 against branch `arena/b1761471-catalystlab` (`1babd3a`).
> Findings are ordered by blast radius. Everything here is reproducible with the command
> shown; nothing is speculative. `[TODO]` = needs a fact this session could not establish,
> `[ASK USER]` = needs owner intent. All ten were answered on 2026-11-12; the
> decisions, alternatives and rationale are in
> `docs/superpowers/plans/2026-11-12-repo-hardening-ci-integrity.md` (Decision Log).
>
> Context that shapes the risk profile: the repository is a **SHALLOW clone with exactly
> 1 commit** (`git rev-list --count HEAD` → 1), so the churn analysis in §5 is empty by
> construction and history-based findings cannot be reproduced here.

## Core Sections (Required)

### 1) Top Risks (Prioritized)

| # | Risk | Evidence | Impact |
|---|---|---|---|
| 1 | ~~`check:env` fails at HEAD~~ **RESOLVED 2026-11-12** | `.env.example` is now the 42-key base (added `NODE_ENV`, `PORT`; removed the unread `GEMINI_API_KEY`); `npm run check:env` → "preflight passed (42 parity-verified keys …)"; pinned by `src/tests/server/envTemplateParity.test.ts` | — |
| 2 | ~~`.nvmrc` is missing~~ **RESOLVED 2026-11-12** | `.nvmrc` = `24`, so the 9 `node-version-file: .nvmrc` steps resolve; pinned by `src/tests/server/runtimeContract.test.ts` (asserts the file exists and every workflow that references it can resolve) | — |
| 3 | ~~Lighthouse CI can never start its server~~ **RESOLVED 2026-11-12** | `.lighthouserc.json` now uses `startServerReadyPattern: "Server listening"`, matching `server.ts:231`; pinned by `src/tests/server/lighthouseConfig.test.ts` | — |
| 4 | ~~Node version contract is inconsistent~~ **RESOLVED 2026-11-12** | Four sources now agree on Node 24: `.nvmrc`, `package.json` `engines.node: ">=24"`, `package-lock.json` root `>=24`, and `Dockerfile:5`; pinned by `src/tests/server/runtimeContract.test.ts` | — |
| 5 | ~~`media:check` fails on unreachable but healthy assets~~ **RESOLVED 2026-11-12** | `scripts/verify-media.mjs` now exports `summarize()`: `fail` only on a definitive 4xx/5xx, `skip` (exit 0) when an endpoint is unreachable, `STRICT_MEDIA=1` escalates skip to failure; header no longer claims a "registry"; pinned by `src/tests/unit/mediaVerification.test.ts` | — |
| 6 | ~~Two handlers claim `GET /api/health`~~ **RESOLVED 2026-11-12** | Only `server/routes/system.ts` registers it; the duplicate was deleted from `server/routes/engines.ts`. Anonymous body is exactly `{ status: 'operational', timestamp }` — verified live against `dist/server.cjs` and pinned by `src/tests/server/api.test.ts` | — |
| 7 | ~~`vite`/`tsx` placement~~ **RESOLVED 2026-11-12** | `vite` stays a production dependency by necessity (`dist/server.cjs:281` `require("vite")`); `tsx` moved to `devDependencies`; `npm run check:deps` guards the contract and `npm run ci` runs it; pinned by `src/tests/server/runtimeDeps.test.ts` | — |
| 8 | ~~Some route handlers echo raw error text~~ **RESOLVED 2026-11-12** | `server/routes/engines.ts` `/api/check-url` (`:55-58`, `:222-236`) and `/api/run-engine` (`:103-109`, `:344-346`) now log the detail with the request id and return fixed messages plus `requestId`; pinned by `src/tests/server/api.test.ts` (“never reflects internal error text”) | — |
| 9 | ~~Demo/dev GitHub repo seeding is only production-gated~~ **RESOLVED 2026-11-12** | `server/core/authz.ts` `isDemoSeedAllowed()` requires `ALLOW_DEMO_SEED=true` **and** a non-production process; `server/routes/github.ts:24` reads it for both seed sites; `src/tests/setup.ts` opts the suite in; pinned by `src/tests/server/demoSeedGate.test.ts` | — |
| 10 | ~~Legal/operational artefacts referenced but absent~~ **RESOLVED 2026-11-12** | Added `SECURITY.md` (disclosure policy, `security@catalystlab.tech`, 72-hour ack), `firebase.json` + `.firebaserc` + `firestore.indexes.json` so `firestore.rules` is deployable; `LICENSE` and `CONTRIBUTING.md` were deliberately **not** added (private package, single owner) — rationale in the plan's Decision Log #8; pinned by `src/tests/server/repoHygiene.test.ts` | — |

### 2) Technical Debt

| Area | Observation | Evidence |
|---|---|---|
| Type safety | `strict: true` is undercut by `useUnknownInCatchVariables: false` + `no-explicit-any: off`: 69 `: any`, 80 `as any`, 7 `@ts-ignore`/`@ts-expect-error`, and `catch (err: any)` throughout `server/routes/engines.ts` | `grep -rn` counts; `eslint.config.js`; `tsconfig.json` |
| Unused path aliases | `@/*` and `@server/*` are configured in three configs but used 3× in `src/` and only inside `src/tests/` | `grep -rn "@/…" src`, `grep -rn "@server/" src server` |
| Orphan configuration | ~~`metadata.json` declared a Gemini capability with no key and no reader~~ **RESOLVED 2026-11-13**: `request_capabilities` is now `[]`, pinned by `src/tests/server/repoHygiene.test.ts`. The captured dumps formerly cited here are filed under `docs/audit/` / `archive/` | `grep -rn GEMINI` (no reads), root listing |
| Dead/duplicated surfaces | second `/api/health` handler (§1.6); `vue`-free but three CSS layers (`patch.css` 65 KB + `src/index.css` 70 KB + `src/styles/*`) with `!important` interactions acknowledged in comments | `server/routes/*`, `src/index.css:1684,1798` |
| Oversized modules | `src/lib/firebase.ts` 1,905 lines mixing auth, Firestore CRUD, seeded content, API-key client calls, contact/trial/subscription calls; `src/lib/media/registry.ts` 1,022; `src/data/apiSpecs.ts` 1,331; `src/pages/PlaygroundPage.tsx` 1,191; `src/pages/UserDashboardPage.tsx` 1,005 | `find src server -name '*.ts*' \| xargs wc -l \| sort -rn` |
| `server/routes/engines.ts` breadth | 509 lines hosting 15 handlers (health, check-url, run-engine, probe, system health, compare, catalog, SSE masters) | `grep -c "app\.\(get\|post\)("` → 15 |
| Repo-root clutter | `archive/` (15 spent codemods + `audit-output-2026-10.txt`), `patch.css`, `assets/banners`, `video/hero-launch` (3.5 MB of captures/fonts/vendor under a subdirectory) tracked. The four captured audit dumps moved to `docs/audit/` / `archive/` on 2026-11-12; the 3.5 MB of film/compositing binaries are a **recorded decision to keep** (`docs/decisions/tracked-binaries.md`) | root listing; `src/tests/server/repoHygiene.test.ts` |
| Untested scripts | `scripts/**` is excluded from ESLint and from coverage; only `replace_images.py` has pytest coverage | `eslint.config.js` ignores, `vitest.config.ts` `coverage.include` |
| Hand-written `.d.ts` | `worker/api-proxy.d.ts` is maintained by hand next to `worker/api-proxy.js` | `worker/` listing |

*Test-side gaps (not production debt):* no automated check that the Lighthouse ready
pattern matches the server log; no test for `check:env`'s parity logic; no test covering
`src/lib/media/registry.ts` fallbacks.

### 3) Security Concerns

| Topic | Status | Evidence |
|---|---|---|
| CSP | Strong: zero `'unsafe-inline'`, per-request nonce + SHA-256 hashes, explicit `img-src`/`connect-src` allowlists, `script-src-attr 'none'`, `object-src 'none'` | `server/app.ts:28-62,232-300`; `e2e/smoke/release-smoke.spec.ts` |
| Identity | Server-derived only; verifier returns `null` without credentials → fail closed; `ALLOW_UNAUTH_DEMO` is honoured only when `NODE_ENV === 'test'` | `src/lib/serverAuth.ts`, `server/core/authz.ts:10-16` |
| Payments | Fail closed `503`; HMAC-SHA256 over raw body; idempotent + monotonic; sandbox e2e proves forged HMAC → `401` and duplicate → `DUPLICATE_EVENT` (green this session) | `server/routes/payments.ts`, `server/core/subscriptions.ts`, `scripts/e2e-payment-sandbox.ts` |
| SSRF | Layered guard (scheme, private/loopback/link-local/CGNAT/metadata, DNS pinning, redirect revalidation, 5 MB cap, TLS verify, 10 s timeout); TLS probe pinned to 443 | `src/lib/networkSecurity.ts`, `server/core/ssl.ts`, `src/tests/networkSecurity.test.ts`, `src/tests/server/tlsProbe.test.ts` |
| Logging | Allowlist serializers (6 request / 7 response headers) + query-key redaction; **no `console.*` in `server/`** | `server/core/logger.ts`, `grep -rn "console\." server` → 0 |
| Firestore rules | Deny-by-default, then per-collection grants; superadmin only via signed claims; paid plan writes rejected from the client | `firestore.rules:1-40` |
| Secrets | `npm run sec:secrets` clean over 650 HEAD files; `firebase-applet-config.json` is a public web config by design; `.github/fixtures/ci-service-account.json` is an explicit placeholder (`"_note": "NOT A CREDENTIAL"`) | `npm run sec:secrets` output; `.github/fixtures/ci-service-account.json` |
| Residual risks | (a) raw error strings echoed by two engine handlers (§1 item 8); (b) `/api/telemetry/event` is unauthenticated by design and only rate-limited (60/min per IP, 300/min per key) — a distributed flood bypasses per-IP limits; (c) no WAF/bot-management in front of the Node host beyond the Worker; (d) `x-forwarded-for` trust depends on `TRUST_PROXY=true` being set correctly, which is only warned about by `check:env` | `server/routes/engines.ts:55-58,104-108`, `server/core/sharedLimiter.ts`, `scripts/check-env.mjs` |
| Historical credential | `docs/security/review-2026-10.md` documents SEC-2026-01 (an Atlas URI in commit `e4bff70`, absent from HEAD) as **owner rotation still required** (`Q44`). Not reproducible here (1-commit shallow clone) | `docs/security/review-2026-10.md` §1-2, `docs/plan/decisions.md` Q44 |

### 4) Performance and Scaling Concerns

| Concern | Detail | Evidence |
|---|---|---|
| Single-instance assumptions | daily quota, API-key index, telemetry buffer and rate-limit records are process-memory by default; correctness across instances requires Upstash **and** Firestore Admin | `server/core/{dailyQuota,apiKeys,rateLimit,sharedLimiter}.ts`, `src/tests/server/multiInstanceState.test.ts` |
| In-memory caches | prerendered HTML shell cache capped at 256 entries, miss-set at 1,024; unbounded-ish `dailyRateLimitStore` capped at 10,000 entries/256 session costs | `server.ts:109-120`, `server/core/rateLimit.ts:44` |
| Bundle weight | initial JS 2,252 kB raw / 667 kB gzip; largest chunk `vendor-firebase` 570 kB raw / 167 kB gzip — Firebase dominates every route | `npm run check:bundle` output |
| Eager Firebase on landing | `D17` documents best-practices 0.74 on `/` because Firebase Auth initialises eagerly; the fix (lazy init) is still open | `docs/plan/decisions.md` D17 |
| Engine work per request | 8 engines run sequentially in the master audit stream; each does its own outbound fetch; the master audit costs 10 units but can run for tens of seconds against a slow target | `server/routes/engines.ts:355-470`, `src/lib/nodeEngines.ts` |
| sRGB/DPR images | self-hosted plates ship JPEG+WebP+AVIF (`scripts/generate-image-variants.mjs`), but `dist/assets` and `src/assets/images` are not budgeted by `check:bundle` | `src/lib/media/plates.ts`, `scripts/check-bundle-budget.mjs` (JS only) |
| Vitest startup cost | jsdom created 44× (21.8 s, 42% of test time); Vitest itself suggests `pool: 'vmThreads'` or `isolate: false` | `npm test` output |
| Load-test path drift | comments in `scripts/run-loadtest.mjs:9` and `ops/loadtest/k6-peak.js:10` name `POST /api/audit/run`, which does not exist; the executable code posts to `/api/run-engine` (verified: `/api/audit/run` → 404) | `grep -rn "api/audit/run"`, live smoke |

### 5) Fragile / High-Churn Areas

**Churn data is unavailable in this session:** the checkout is shallow with a single commit
(`git rev-list --count HEAD` → 1), so `git log --since=90 days` returns one entry per file
and the churn table conveys nothing. `[TODO]` re-run the scan on a full clone to obtain
real churn. Substitute fragility signals from static evidence:

| Signal | Evidence |
|---|---|
| Largest, most entangled module | `src/lib/firebase.ts` (1,905 lines, auth + 8 Firestore domains + HTTP client wrappers) |
| Highest decision density (most `D#`/`Q##` tags per file) | `server/app.ts`, `server/core/subscriptions.ts`, `server/core/rateLimit.ts`, `server/routes/engines.ts`, `worker/api-proxy.js` |
| Most likely to break CI on unrelated changes | `scripts/check-env.mjs` (key-parity over three templates — now green with 42 keys), `scripts/check-bundle-budget.mjs` (six ratchets), `scripts/verify-media.mjs` (live network — now `skip`, not `fail`, when the network is unreachable) |
| Coupled client↔server contracts | `src/lib/validation.ts` ↔ `server/core/enginesCatalog.ts`; `src/config/routeAliases.ts` ↔ `scripts/prerender.ts` ↔ `public/_redirects`; `dist/routes.json` ↔ `server/core/spaRoutes.ts` |
| Documentation drift hotspots | `README.md` (test counts and the gate list — refreshed 2026-11-12 to 51 files / 448 tests), `docs/ENGINES.md` route table vs `server/app.ts` order, `docs/codebase/*` (this revision, 2026-11-12) |

### 6) `[ASK USER]` Questions — all answered 2026-11-12

1. ~~**Node runtime:** which is canonical?~~ **Answered — `24`** everywhere; see plan Decision Log #1 and `runtimeContract.test.ts`. [Docs: `superpowers/plans/2026-11-12-repo-hardening-ci-integrity.md`]
2. ~~**Env templates:** `GEMINI_API_KEY` removed or used?~~ **Answered — removed**, and `NODE_ENV`/`PORT` added to `.env.example` (42-key parity). Plan Decision Log #2. [Docs: same plan]
3. ~~**Lighthouse readiness:** change the pattern or the log line?~~ **Answered — the config matches the log** (`Server listening`); `best-practices`/`seo` stay `off` in `.lighthouserc.json` by design (enforced by `scripts/report-lhci.mjs`), now documented in `ARCHITECTURE.md`. Plan Decision Log #3. [Docs: same plan]
4. ~~**`media:check` in CI:** tolerate CDN blips or self-host?~~ **Answered — tolerate**: `summarize()` returns `skip` (exit 0) only when nothing 4xx/5xx answered, `STRICT_MEDIA=1` escalates. Plan Decision Log #4. [Docs: same plan]
5. ~~**Dual `/api/health`:** which handler wins?~~ **Answered — `system.ts` owns it**, anonymous shape is `{ status, timestamp }`. Plan Decision Log #5. [Docs: same plan]
6. ~~**Non-production synthetic data:** production-only or explicit flag?~~ **Answered — explicit `ALLOW_DEMO_SEED`** plus non-production. Plan Decision Log #6. [Docs: same plan]
7. ~~**`vite`/`tsx` placement:** deliberate or oversight?~~ **Answered — `vite` deliberate** (the bundle requires it), **`tsx` moved** to devDependencies, guarded by `npm run check:deps`. Plan Decision Log #7. [Docs: same plan]
8. ~~**Deployment artefacts:** which are wanted?~~ **Answered — `SECURITY.md` + the three Firebase files added; no `LICENSE`, no `CONTRIBUTING.md`** (private, single-owner). Plan Decision Log #8. [Docs: same plan]
9. ~~**Root clutter:** intended or move?~~ **Answered** — the four captured dumps are filed under `docs/audit/`/`archive/`, and the `video/hero-launch` binaries **stay tracked by decision** (they are referenced by `.assets/manifest.json` and brand guidelines; moving them would need a history rewrite). See `docs/decisions/tracked-binaries.md`. Plan Decision Log #9. [Docs: same plan]
10. **Raw error messages:** are the `err.stderr \|\| err.message` responses in `/api/check-url` and `/api/run-engine` intentional (developer-facing API) or should they be genericised like the rest of the file?

## Extended Sections (Optional)

### 7) Verification Log

**2026-11-12 (post-hardening, `npm run ci:full` exit 0):**

| Command | Result |
|---|---|
| `npm run check:env` | pass — 42 parity-verified keys across `.env`, `.env.staging` & `.env.production` |
| `npm run lint` | pass, 0 problems |
| `npm run typecheck` (`tsc --noEmit`, `strict`) | pass, 0 errors |
| `npm test` | **51 files / 448 tests passed** |
| `npm run build` | pass (prerender included) |
| `npm run check:bundle` | all 6 budgets pass |
| `npm run check:deps` | pass — 15 runtime requires, all declared |
| `npm run test:coverage` | 71.41 / 59.47 / 75.3 / 72.64 — ratchet (68/55/72/69) passes |
| `npm run drill:restore` | pass, `withinRto: true` |
| `npm run test:payments-sandbox` | pass, 6 contract checks |
| `npm run sec:secrets` | clean — 666 tracked files in HEAD, 12 commits, 0 uncatalogued secrets |
| `npm run media:check` | **SKIP** (exit 0) — 19 endpoints unreachable from this sandbox; `STRICT_MEDIA=1` → exit 1, as designed |
| Production boot smoke (`dist/server.cjs`) | `/api/health` → `{"status":"operational","timestamp":…}`; `/api/v1/system/health` → 200 |
| Python gates (pytest/ruff/mypy/black) | **[TODO]** — not installed in this sandbox |

**2026-11-12 baseline (before the hardening tasks):** `npm test` 44 files / 420 tests;
`check:env` **FAIL** (3 parity mismatches); `media:check` **FAIL** (5 unreachable endpoints);
`.nvmrc` absent.

### 8) Evidence

- `package.json`, `package-lock.json:70-71`, `git ls-files | grep -i nvm` (empty), `.lighthouserc.json:15-20`, `server.ts:231`, `.github/workflows/*.yml`
- `.env.example` (41 keys), `.env.staging.example`, `.env.production.example`, `scripts/check-env.mjs`
- `server/app.ts:309-320`, `server/routes/engines.ts` (error branches), `server/routes/system.ts` (`handleLiveness`), `server/routes/github.ts:24` (`isDemoSeedAllowed`), `server/core/authz.ts` (`isDemoSeedAllowed`), `scripts/{check-runtime-deps,verify-media}.mjs`, `SECURITY.md`, `firebase.json`
- `src/lib/firebase.ts`, `src/lib/networkSecurity.ts`, `src/lib/serverAuth.ts`, `server/core/{rateLimit,dailyQuota,apiKeys,subscriptions,logger}.ts`
- `src/store/middleware/mongoSyncMiddleware.ts`, `src/store/index.ts`
- `firestore.rules`, `firebase-applet-config.json`, `metadata.json`, `.github/fixtures/ci-service-account.json`
- `Dockerfile`, `wrangler.toml`, `worker/api-proxy.js`, `ops/systemd/catalystlab.service`, `ops/loadtest/k6-peak.js`, `scripts/run-loadtest.mjs`, `scripts/verify-media.mjs`, `scripts/check-bundle-budget.mjs`
- `README.md` (test counts and gate list, refreshed 2026-11-12), `docs/ENGINES.md`, `docs/plan/decisions.md`, `docs/security/review-2026-10.md`, `docs/ops/slo.md`, `PRODUCT.md`
