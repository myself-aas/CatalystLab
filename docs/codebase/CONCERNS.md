# Codebase Concerns

> Regenerated 2026-11-12 against branch `arena/b1761471-catalystlab` (`1babd3a`).
> Findings are ordered by blast radius. Everything here is reproducible with the command
> shown; nothing is speculative. `[TODO]` = needs a fact this session could not establish,
> `[ASK USER]` = needs owner intent (all collected in §6).
>
> Context that shapes the risk profile: the repository is a **SHALLOW clone with exactly
> 1 commit** (`git rev-list --count HEAD` → 1), so the churn analysis in §5 is empty by
> construction and history-based findings cannot be reproduced here.

## Core Sections (Required)

### 1) Top Risks (Prioritized)

| # | Risk | Evidence | Impact |
|---|---|---|---|
| 1 | ~~`check:env` fails at HEAD~~ **RESOLVED 2026-11-12** | `.env.example` is now the 42-key base (added `NODE_ENV`, `PORT`; removed the unread `GEMINI_API_KEY`); `npm run check:env` → "preflight passed (42 parity-verified keys …)"; pinned by `src/tests/server/envTemplateParity.test.ts` | — |
| 2 | **`.nvmrc` is missing** while 9 workflow steps use `node-version-file: .nvmrc` | `git ls-files \| grep -i nvm` → empty; `grep -n node-version-file .github/workflows/*.yml` → 9 hits (`ci.yml` ×4, `deploy.yml` ×2, `backup.yml`, `rollback.yml`, `media-verify.yml`) | `actions/setup-node` errors out → **no** workflow can run. Independently blocks CI. |
| 3 | **Lighthouse CI can never start its server** | `.lighthouserc.json` `startServerReadyPattern: "Server running"`; `server.ts:231` logs `"[CatalystLab] Server listening on http://…"` | The `lighthouse` job times out after 60 s. Masked today by risk #1. |
| 4 | **Node version contract is inconsistent** | `package.json` `engines.node: ">=22"`; `package-lock.json` root `"node": ">=24"`; `Dockerfile` `node:24-bookworm-slim`; README/docs claim Node 24 + `.nvmrc` | `npm ci` on Node 22 emits EBADENGINE; contributors get a runtime different from production. |
| 5 | **`media:check` is red in an offline/egress-restricted environment** | `npm run media:check` → 5 `FAIL (0) fetch failed` for Pexels image/video URLs | The CI `gates` job runs `media:check`; a Pexels hiccup fails the pipeline even though the UI has self-hosted fallbacks (`src/lib/media/plates.ts`). |
| 6 | **Two handlers claim `GET /api/health`** | `server/routes/engines.ts:259` and `server/routes/system.ts:52`; registration order in `server/app.ts` is engines (`:313`) before system (`:317`) | The engines handler wins; `server/routes/system.ts`'s richer liveness body is dead code for this route. Two "liveness" contracts drift silently. |
| 7 | **`vite` and `tsx` ship as production dependencies** | `package.json` `dependencies` includes `vite@^8.3.4`, `tsx@^4.23.15`; the Docker runtime stage runs `npm ci --omit=dev` | Larger, slower image and a build-time toolchain present at runtime (also means a Vite advisory is a *production* advisory). |
| 8 | **Some route handlers echo raw error text to clients** | `server/routes/engines.ts:104-108` returns `err.stderr \|\| err.message`; `:55-58` returns `e.message` in `/api/check-url` | Internal error strings (engine internals, filesystem/library messages) can leak to unauthenticated callers, unlike the generic message used elsewhere in the same file. |
| 9 | **Demo/dev GitHub repo seeding is only production-gated** | `server/routes/github.ts:22-70` seeds `myself-aas/CatalystLab` repo + synthetic telemetry unless `NODE_ENV === 'production'`; `isProdAtInit` is evaluated once per `registerGithubRoutes` call | Any non-`production` deployment (staging, preview, a mis-set env) serves synthetic integration data, which contradicts the "real or absent, never synthesised" product rule in `PRODUCT.md`. |
| 10 | **Legal/operational artefacts referenced but absent** | no `LICENSE`, no `SECURITY.md`, no `CONTRIBUTING.md`, no `firebase.json`/`.firebaserc` (`ls` all empty) | `firestore.rules` is version-controlled but not deployable from this repo without a Firebase project config; `metadata.json`/`assets/` are leftovers. `[ASK USER]` whether these live elsewhere. |

### 2) Technical Debt

| Area | Observation | Evidence |
|---|---|---|
| Type safety | `strict: true` is undercut by `useUnknownInCatchVariables: false` + `no-explicit-any: off`: 69 `: any`, 80 `as any`, 7 `@ts-ignore`/`@ts-expect-error`, and `catch (err: any)` throughout `server/routes/engines.ts` | `grep -rn` counts; `eslint.config.js`; `tsconfig.json` |
| Unused path aliases | `@/*` and `@server/*` are configured in three configs but used 3× in `src/` and only inside `src/tests/` | `grep -rn "@/…" src`, `grep -rn "@server/" src server` |
| Orphan configuration | `GEMINI_API_KEY` in `.env.example`, `metadata.json` declaring a Gemini capability, `audit-output.txt` (a pasted skill prompt at repo root), and root-level `SEO-AUDIT-*.md` / `PROGRAMMATIC-SEO-*.md` HTML-ish dumps | `grep -rn GEMINI` (no reads), root listing |
| Dead/duplicated surfaces | second `/api/health` handler (§1.6); `vue`-free but three CSS layers (`patch.css` 65 KB + `src/index.css` 70 KB + `src/styles/*`) with `!important` interactions acknowledged in comments | `server/routes/*`, `src/index.css:1684,1798` |
| Oversized modules | `src/lib/firebase.ts` 1,905 lines mixing auth, Firestore CRUD, seeded content, API-key client calls, contact/trial/subscription calls; `src/lib/media/registry.ts` 1,022; `src/data/apiSpecs.ts` 1,331; `src/pages/PlaygroundPage.tsx` 1,191; `src/pages/UserDashboardPage.tsx` 1,005 | `find src server -name '*.ts*' \| xargs wc -l \| sort -rn` |
| `server/routes/engines.ts` breadth | 509 lines hosting 15 handlers (health, check-url, run-engine, probe, system health, compare, catalog, SSE masters) | `grep -c "app\.\(get\|post\)("` → 15 |
| Repo-root clutter | `archive/` (14 spent codemods), `audit-output.txt`, `patch.css`, `assets/banners`, `video/hero-launch` (2.2 MB of PNGs) all tracked at root level | `git ls-files -z \| du --files0-from=- -ch` → 16 MB |
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
| Most likely to break CI on unrelated changes | `scripts/check-env.mjs` (key-parity over three templates — currently failing), `scripts/check-bundle-budget.mjs` (six ratchets), `scripts/verify-media.mjs` (live network) |
| Coupled client↔server contracts | `src/lib/validation.ts` ↔ `server/core/enginesCatalog.ts`; `src/config/routeAliases.ts` ↔ `scripts/prerender.ts` ↔ `public/_redirects`; `dist/routes.json` ↔ `server/core/spaRoutes.ts` |
| Documentation drift hotspots | `README.md` ("330 passed in 36 files", "42 parity-verified keys", `.nvmrc`), `docs/ENGINES.md` route table vs `server/app.ts` order, `docs/codebase/*` (2026-10-21 revision) |

### 6) `[ASK USER]` Questions

1. **Node runtime:** which is canonical — `>=22` (`package.json`), `>=24` (lockfile/Docker/CI intent), or something else? Shall `.nvmrc` be restored with `24` to match the 9 `node-version-file` references?
2. **Env templates:** is `GEMINI_API_KEY` supposed to be removed (no code reads it), or added to staging/production plus code that uses GenAI? Should `PORT`/`NODE_ENV` be added to `.env.example` (as `README` claims was done) or dropped from the staging/production templates?
3. **Lighthouse readiness:** should `.lighthouserc.json` match the log line `Server listening`, or should `server.ts` log `Server running`? Also, is `best-practices`/`seo` intentionally `off` in `.lighthouserc.json` (enforced only by `scripts/report-lhci.mjs`), and should that be documented in D17?
4. **`media:check` in CI:** should the gate tolerate unreachable third-party CDNs (since the UI has local fallbacks), or should Pexels/Unsplash dependencies be dropped in favour of fully self-hosted media?
5. **Dual `/api/health`:** which handler is authoritative — the terse `engines.ts` one or `system.ts`'s `handleLiveness` (whose body includes readiness detail)? Should engines stop registering it?
6. **Non-production synthetic data:** should the seeded demo GitHub repo/telemetry be gated on `NODE_ENV === 'production'` only (current), or on an explicit `ALLOW_DEMO_SEED` flag so staging never shows synthetic data?
7. **`vite`/`tsx` placement:** deliberately in `dependencies` (so the Docker runtime can rebuild/prerender?) or an oversight to move to `devDependencies`?
8. **Deployment artefacts:** do `firebase.json`/`.firebaserc`, `LICENSE`, `SECURITY.md`, `CONTRIBUTING.md` live outside this repository? If not, which are wanted here?
9. **Root clutter:** is `audit-output.txt`, `assets/banners/hero-banner.html`, root-level `SEO-*.md` dumps and `video/hero-launch` (2.2 MB binaries) intended to stay tracked, or should they move to `archive/`/external storage?
10. **Raw error messages:** are the `err.stderr \|\| err.message` responses in `/api/check-url` and `/api/run-engine` intentional (developer-facing API) or should they be genericised like the rest of the file?

## Extended Sections (Optional)

### 7) Verification Log (this session)

| Command | Result |
|---|---|
| `npm ci` | exit 0 |
| `npx eslint .` | exit 0, no problems |
| `npx tsc --noEmit` | exit 0, no errors |
| `npx vitest run` | **44 files / 420 tests passed** (58 s) |
| `npm run test:coverage` | 71.3 / 59.22 / 75.3 / 72.53 — ratchet (68/55/72/69) passes |
| `NODE_ENV=production APP_ORIGIN=… npm run build` | exit 0; 64 route shells, 53 indexable, 11 noindex; 5 sitemaps; 2 esbuild `import.meta` warnings |
| `npm run check:bundle` | all 6 budgets pass |
| `npm run check:colors` / `check:design` | pass |
| `npm run check:env` | **FAIL** — 3 parity mismatches |
| `npm run sec:secrets` | clean (650 files HEAD, 1 commit) |
| `npm run drill:restore` | pass, `withinRto: true` |
| `npm run test:payments-sandbox` | pass, 6 contract checks |
| `npm run media:check` | **FAIL** — 5 unreachable remote endpoints |
| Production boot smoke | `/` 200, `/pricing` 200, `/dashboard` 200 (noindex), `/nope` 404, `/api/health` 200, `/api/v1/system/health` 200, `/api/v1/system/ready` 200, `/api/v1/engines` 200, `/api/v1/reports` 501, `/docs/llmo` 301, `/docs/llm-kinase` 200, `/api/audit/run` 404 |
| Python gates (pytest/ruff/mypy/black) | **[TODO]** — not installed in this sandbox (`python3 -m pytest --version` → "No module named pytest") |

### 8) Evidence

- `package.json`, `package-lock.json:70-71`, `git ls-files | grep -i nvm` (empty), `.lighthouserc.json:15-20`, `server.ts:231`, `.github/workflows/*.yml`
- `.env.example` (41 keys), `.env.staging.example`, `.env.production.example`, `scripts/check-env.mjs`
- `server/app.ts:309-320`, `server/routes/engines.ts:55-58,104-108,259`, `server/routes/system.ts:52`, `server/routes/github.ts:22-70`, `server/core/authz.ts:10-16`
- `src/lib/firebase.ts`, `src/lib/networkSecurity.ts`, `src/lib/serverAuth.ts`, `server/core/{rateLimit,dailyQuota,apiKeys,subscriptions,logger}.ts`
- `src/store/middleware/mongoSyncMiddleware.ts`, `src/store/index.ts`
- `firestore.rules`, `firebase-applet-config.json`, `metadata.json`, `.github/fixtures/ci-service-account.json`
- `Dockerfile`, `wrangler.toml`, `worker/api-proxy.js`, `ops/systemd/catalystlab.service`, `ops/loadtest/k6-peak.js`, `scripts/run-loadtest.mjs`, `scripts/verify-media.mjs`, `scripts/check-bundle-budget.mjs`
- `README.md` (claims "330 passed in 36 files", "42 parity-verified keys", `.nvmrc`), `docs/ENGINES.md`, `docs/plan/decisions.md`, `docs/security/review-2026-10.md`, `docs/ops/slo.md`, `PRODUCT.md`
