# Codebase Concerns

> Generated 2026-10-14, re-validated 2026-10-19. Severity is judged from the code and the verification runs in this session. Test-only issues are listed separately from production concerns, following the workflow rule. `[TODO]` = not determinable; `[ASK USER]` = needs team intent (numbered list in §6).

## Core Sections (Required)

### 1) Top Risks (Prioritized)

| Severity | Concern | Evidence | Impact | Suggested action |
|----------|---------|----------|--------|------------------|
| **High** | **No path grants a paid plan.** Webhooks verify the HMAC and then only log and return 200. `POST /api/v1/users/me/subscription/request` returns 501 for any paid `planId`, saying it "require[s] a verified payment webhook." `POST /api/payments/verify` always returns 503. | `server/routes/payments.ts` (webhook handlers, verify handler), `server/routes/account.ts:169-181` | Revenue flow is non-functional. Docs and the 503 message say webhooks provision entitlements. | `[ASK USER]` #6. Implement the webhook → `user_subscriptions` write, or a gateway-API lookup in `/verify`. |
| **High** | **Quality gates are red.** `npm run typecheck` exits 2 with 127 errors (all in `src/tests/`). One Vitest suite fails at load. README claims 0 type errors and 177 passing tests. CI runs only the media check. | `npx tsc --noEmit` (this session), `npx vitest run` (this session), `README.md`, `.github/workflows/media-verify.yml` | Regressions can merge unnoticed. `npm run ci` cannot pass. | Fix the test typings (see §2) and the failing suite. Add a CI job that runs `npm run ci`. |
| **High** | **Security controls keep state in process memory.** Rate-limit ledger, API key store, connected repos, client-log and contact throttles are module-level `Map`s. | `server/core/rateLimit.ts:43`, `server/core/apiKeys.ts:57-58`, `server/routes/github.ts:16`, `server/routes/clientLogs.ts:30`, `server/routes/contact.ts:44` | Restart resets quotas and keys. With N instances, each instance enforces its own quota (N× budget). The API key store does not persist across deployments. | Move quotas and API keys to a shared store (Upstash is already a dependency for the burst limiter). `[ASK USER]` #10 |
| **Medium** | **Public analytics read endpoints.** `GET /api/analytics/stats` and `GET /api/analytics/realtime` need no identity and accept any `domain` query value (default `all`). | `server/routes/telemetry.ts:176-210` | Anyone can read aggregate analytics for any domain stored in the telemetry DB. | `[ASK USER]` #7. Gate by identity or ownership, or confirm the data is meant to be public. |
| **Medium** | **Telemetry retention is priced but not enforced.** `pricingData.ts` sets `telemetryRetentionDays` to 14, 60, 90, 365, and 730 by plan. No TTL or expiry exists in the analytics code. | `src/data/pricingData.ts:23,64,104,144,184`, `src/lib/analyticsEngine.ts` (~75–90) | Retention promised per plan is not applied, which is a disclosure risk. | Enforce per-plan expiry with a TTL index, or remove the field. No numbered question covers this yet. Decide retention per plan and record it in the privacy policy. |
| **Medium** | **Telemetry ingestion is not rate-limited.** No rate-limit middleware in `telemetry.ts`. The only throttle is a user-agent regex (`botRegex`), which a client can trivially spoof. | `server/routes/telemetry.ts` (no `rateLimit` reference), line ~47 | Write amplification to MongoDB or memory from unauthenticated clients. | Add a per-IP limiter to `/api/telemetry/event` and its aliases. |
| **Medium** | **SSRF gap on the generic webhook path.** The URL passes `validatePublicUrl` (DNS lookup) and is then fetched with a plain `fetch`, which resolves DNS a second time. `networkSecurity.ts` documents this TOCTOU risk and `guardedFetch` closes it. | `src/lib/webhookService.ts` lines ~254-276, `src/lib/networkSecurity.ts` (comment near line 143) | DNS rebinding can point a superadmin-triggered webhook at an internal address. Impact is limited because the route is superadmin-only. | Send generic webhooks through `guardedFetch` (pinned DNS). `[ASK USER]` #11 |
| **Medium** | **Weak Discord webhook check.** `sendDiscordWebhook` uses `url.includes('discord.com/api/webhooks/')`, not a hostname check, and skips `validatePublicUrl`. | `src/lib/webhookService.ts` line ~192 | A superadmin can POST to any host whose URL contains that substring. | Parse the URL and require `https://discord.com/api/webhooks/` as the prefix. |
| **Medium** | **Runtime mismatch.** `engines` and `.nvmrc` require Node 24. CI uses Node 20. Local runs on Node 22.22.3 and 24.22.0 fail the same way (see §2), so the runtime is not the cause of the failing suite. | `package.json`, `.nvmrc`, `.github/workflows/media-verify.yml` (`node-version: 20`), `/tmp/validate/vitest-node24-ratelimiter.log` | CI results may not reflect the declared runtime. | `[ASK USER]` #2. Set CI to Node 24, then re-run the gates. |
| **Medium** | **Two engine implementations.** Live: `src/lib/nodeEngines.ts` (939 lines, all 9 engines in one switch). Parallel: `lib/engines/*`. Documented as canonical: `lib/engines/` (`docs/ENGINES.md`). | `src/lib/nodeEngines.ts`, `lib/engines/index.ts`, `app/api/scan/stream/route.ts`, `docs/ENGINES.md` | Fixes can land in one path only. `ai_search` exists only in the parallel path. `[ASK USER]` #5 | `[ASK USER]` #4. Delete one path and update `docs/ENGINES.md`. |
| **Medium** | **Checkout prices differ from the pricing page for annual plans.** `server/routes/payments.ts:23-28` `pricingMap` annual: Starter 90, Pro 190, Team 490, Enterprise 990. `src/data/pricingData.ts` annual: Starter 84, Pro 180, Team 468, Enterprise 948. Monthly prices match. | `server/routes/payments.ts:23-28`, `src/data/pricingData.ts` | A buyer can be charged a different amount from the advertised price, which creates refund and billing disputes. | Derive both from one price table. Confirm the intended annual prices before launch. |
| **Resolved in branch** | **Legal links were missing from the footer and no refund route existed.** Mapping-time state: `FOOTER_GROUPS` had Resources, Engines, and Platform only, and no `/refund` route. Now the footer bottom bar links Terms, Privacy, Refund, and Cookies, and `/refund` is routed. | `src/components/layout/Footer.tsx`, `src/navigation/index.ts`, `src/App.tsx` | Payment reviewers and users could not find the policies. | None left in code. Legal copy still has open items (see the legal pages). |
| **Low** | **Public infrastructure status.** `GET /api/v1/system/health` returns process memory and Mongo status. `GET /api/v1/database/mongodb/status` returns Mongo health and batch metrics. Neither requires identity. | `server/routes/system.ts:12-50` | Information disclosure to unauthenticated clients. | Restrict to superadmin, or drop the detail fields for anonymous callers. |

### 2) Technical Debt

| Debt item | Why it exists | Where | Risk if ignored | Suggested fix |
|-----------|---------------|-------|-----------------|---------------|
| Type errors in test files (127) | Test matchers from `@testing-library/jest-dom` are not typed for Vitest's `expect` | `src/tests/ui/*.test.tsx` (9 files), `src/tests/phase1Hardening.test.tsx`, `src/tests/setup.ts` line 1 | Blocks the typecheck gate. `[ASK USER]` #3 | Change `src/tests/setup.ts` line 1 to `import '@testing-library/jest-dom/vitest';`. Verified this session: `tsc --noEmit` drops from 127 errors to 0 (change reverted, test run not repeated) |
| Failing `rateLimiter.test.ts` | Assigning `globalThis.localStorage` fails on jsdom 30.0.1 (getter-only property). Reproduced on Node 22.22.3 and 24.22.0. | `src/tests/rateLimiter.test.ts:28` | Rate-limit behavior is untested | Use `vi.stubGlobal('localStorage', …)` or `Object.defineProperty`. This is a test-code issue, not a runtime one. |
| Duplicate engine implementations | Migration to native TypeScript left `lib/engines/` in place | `src/lib/nodeEngines.ts`, `lib/engines/*`, `src/lib/engines/index.ts` | Drift and double maintenance | Decide the canonical path (`[ASK USER]` #4), then delete the other |
| Vestigial Python engine map | Python engines were never committed (per `docs/ENGINES.md`) | `server/core/enginesCatalog.ts` (`ENGINE_SCRIPT_MAP`), `server/routes/engines.ts` lines ~261-268 (`script: 'website_health.py'` in the v1 catalog) | `/api/v1/engines` advertises scripts that do not exist | Remove the `script` fields and the map, or document them as legacy names |
| Dormant serverless twins | Vercel deployment target | `api/*.ts` (4 files, incl. 90-line `api/run-engine.ts`) | Drift from `server/routes/engines.ts` (already reported in `CODE_REVIEW.md` M4) | `[ASK USER]` #9. Delete if unused |
| Next.js and Prisma leftovers | Earlier stack | `next.config.ts`, `app/` (`app/api/scan/stream`, `app/applet`), `archive/legacy-next/`, `tsconfig.json` `include: ["prisma"]` (no such directory) | Misleading for new contributors | `[ASK USER]` #12. Remove or archive |
| 52 root-level one-off scripts | Past codemod passes (colors, components, hero layout) | root `*.py`, `*.cjs`, `*.mjs`, `*.sh`; `archive/automation/` | Clutter; a few reference paths that may no longer exist | Move to `archive/` or delete |
| Mixed logging | Pino on server, but `console.*` in `src/lib/analyticsEngine.ts` and `src/lib/serverAuth.ts` and 1 call in `server/` | see `CONVENTIONS.md` §4 | Logs are not structured on those paths | Route through the pino logger |
| Heavy `any` usage | Speed of development | `as any` 78× in non-test `src/`, 6× in `server/`; `@ts-ignore` 6× | Type safety is weaker than `strict: true` implies | Tighten in touched files first |
| Large modules | Accumulation | `src/lib/firebase.ts` (1914 lines, Firestore client plus all API calls), `src/data/apiSpecs.ts` (1396, data), `src/pages/PlaygroundPage.tsx` (1190), `src/pages/UserDashboardPage.tsx` (970), `src/lib/nodeEngines.ts` (939), `src/App.tsx` (621, 111 routes) | Hard to review and test | Split by domain (e.g. `firebase.ts` into reports/subscriptions/keys modules) |
| Two lockfiles | Bun experiment | `bun.lock` (230 KB) and `package-lock.json` (469 KB). No script or workflow runs Bun. CI runs `npm install`, not `npm ci`, so it can rewrite `package-lock.json`. | Dependency drift | `[ASK USER]` #1. Delete the one not used. Switch CI to `npm ci`. |
| Lint scope excludes server code | `eslint.config.js` only targets `src/**` and ignores `api/`, `scripts/` | `eslint.config.js` lines 4-14 | `server/` is not linted at all | Extend the `files` glob to `server/**` and `server.ts` |
| Stale and missing docs | Historical audit and removed docs | `CODE_REVIEW.md` (references `server.ts` line numbers from a 2,906-line version; current `server.ts` is ~70 lines); `README.md` links `PRODUCTION_READINESS_AUDIT.md` (missing); `CLAUDE.md`, `GEMINI.md`, `.github/copilot-instructions.md` point to `/home/runner/work/CatalystLab/CatalystLab/AGENTS.md` | Guidance drifts from code | Refresh or remove; update the README |
| Unused or misleading config | Copy-paste from templates | README `VITE_FIREBASE_*` (never read), `.env.example` (missing `APP_ORIGIN`, `VITE_APP_ORIGIN`, `JWT_SECRET`, `PAYMENT_SIGNING_SECRET`), `server.ts` `PORT` hard-coded | Operators set variables that do nothing | `[ASK USER]` #8, #13 |
| Unrelated artifacts | Repo scope creep | empty `ui-ux-pro-max-skill/`, `workspace/refactor_colors.sh`, `patch.css` (40 KB, usage `[TODO]`) | Noise in search and review | `[ASK USER]` #12 |

### 3) Security Concerns

| Risk | OWASP category (if applicable) | Evidence | Current mitigation | Gap |
|------|--------------------------------|----------|--------------------|-----|
| Entitlement bypass or absence (see §1) | A01 Broken Access Control | `server/routes/payments.ts`, `server/routes/account.ts:169-181` | Verify endpoint is 503; client cannot self-activate | Paid activation is not implemented. Webhook signature checks exist (`src/lib/webhookSecurity.ts`). |
| Public analytics reads | A01 Broken Access Control | `server/routes/telemetry.ts:176-210` | None | No identity or domain-ownership check |
| SSRF via generic webhook | A10 SSRF | `src/lib/webhookService.ts:254-276` | `validatePublicUrl` (DNS check, private-range block) | Not pinned: TOCTOU DNS rebinding |
| Discord URL substring check | A10 SSRF (low) | `src/lib/webhookService.ts:192` | Superadmin-only route | No hostname parsing |
| In-memory credential state | A07 Identification and Auth Failures (operational) | `server/core/apiKeys.ts` (SHA-256 hashed keys, in-memory) | Hashed secrets; constant-time compare for the legacy allowlist | Keys vanish on restart and are not shared |
| Public system detail endpoints | A05 Security Misconfiguration | `server/routes/system.ts:12-50` | None | Memory and DB status exposed to anonymous callers |
| Unencoded `planId` in checkout URL | A03 Injection (low) | `server/routes/payments.ts` (`prod=${planId}` in the 2Checkout URL; `plan=${planId}` in the Dodo URL) | Amount is computed server-side from `pricingMap` (falls back to `pro`) | `planId` is not URL-encoded and not validated against the map before being placed in the URL |
| Telemetry ingestion abuse | A04 Insecure Design | `server/routes/telemetry.ts` | Zod validation; bot UA filter | No rate limit (see §1) |
| CSP breadth | A05 Security Misconfiguration | `server/app.ts` (CSP): `connectSrc` allows `ws:` and `wss:` for any host; `imgSrc` allows any `https:`; `styleSrc` allows `'unsafe-inline'` in all environments; `frameguard: false` | Production drops `'unsafe-inline'` from `scriptSrc` (hash allowlist); `frame-ancestors` restricted | Broad `connect-src`/`img-src`; styles unsafe-inline |
| `X-Forwarded-For` trust | A01 (low) | `server/core/rateLimit.ts:59-68` | Honored only when `TRUST_PROXY=true`; takes the leftmost value | If the proxy appends rather than replaces, the leftmost value is client-controlled |
| Seeded demo data in code | A05 (low) | `server/routes/github.ts:16-24` (demo repo with `GITHUB_WEBHOOK_SECRET` default `''`); `src/store/slices/alertsSlice.ts` (`usr_default` alerts, placeholder Discord URL `XXXX…`) | Seeded webhook is disabled; repo secrets never echoed (`toPublicRepo`) | Demo records ship in production code paths |
| Client config | — | `firebase-applet-config.json` committed | Documented as public by design (`README.md`) | None (accepted by the team per README) |

Mitigations verified as present: fail-closed Firebase Admin (`src/lib/serverAuth.ts`), HMAC over raw body with `timingSafeEqual` (`src/lib/webhookSecurity.ts`), server-derived identity and no client-header trust (`server/core/rateLimit.ts` comment), state-sync IDOR fix (`server/routes/stateSync.ts`), default-deny Firestore rules (`firestore.rules`), SSRF guard with DNS pinning in `guardedFetch`, 5 MB response cap, redirect re-validation.

### 4) Performance and Scaling Concerns

| Concern | Evidence | Current symptom | Scaling risk | Suggested improvement |
|---------|----------|-----------------|-------------|-----------------------|
| Master audit fans out 8 outbound scans per request | `server/routes/engines.ts` `primaryEngines` with `Promise.allSettled` | One request drives 8 parallel fetches, each up to 10 s | Concurrency per process is bounded only by request cost (10 units) and burst limits | Cap concurrency inside the handler (e.g. 2-3 at a time) |
| Engine fetch timeouts | `HTTP_TIMEOUT_MS = 10000` in `src/lib/nodeEngines.ts`; `guardedFetch` default 10 s; `/api/check-url` 4 s | A slow target holds the request up to 10 s per engine | Thread-equivalent resources held per request | Keep the timeouts; add a per-request budget |
| Single-process CPU work | Engines parse HTML with cheerio in the same process as the API | CPU-heavy scans can delay API responses | Multi-tenant contention inside one Node process | Move scans to a worker or queue `[TODO]` design decision |
| In-memory analytics buffer | `src/lib/analyticsEngine.ts` (zero-cost mode when `MONGODB_URI` is unset) | Events lost on restart when Mongo is off | Data loss in degraded mode | Document the trade-off; alert when running in memory |
| Client bundle size | `vendor-firebase` 553 kB raw (above Vite's 500 kB warning); initial raw 1285 kB against a 2100 kB budget | Build emits chunk-size warning; budget passes | Slower first load on mobile | Split firebase by feature, as `CODE_REVIEW.md` suggests |
| Unbounded in-memory maps | `dailyRateLimitStore`, `githubSseSubscribers`, throttle maps. Hourly cleanup exists for the rate-limit map (`server/core/rateLimit.ts` line ~421). Cleanup for the others is `[TODO]` not verified. | Memory grows with distinct identities and SSE subscribers | Memory growth on long-running processes | Verify and bound each map |

### 5) Fragile/High-Churn Areas

Git history is not usable in this clone: `git rev-list --count HEAD` returns 1, so the scan's 90-day churn list is all 1s and carries no signal. The list below uses size and coupling as proxies. `[TODO]` re-run with full history for real churn data.

| Area | Why fragile | Churn signal | Safe change strategy |
|------|-------------|-------------|----------------------|
| `src/lib/nodeEngines.ts` (939 lines) | One switch dispatches 9 engines. Callers: `server/routes/engines.ts` (several routes) and `api/run-engine.ts`. | Size and fan-in (proxy) | Add tests per engine before editing; keep output shape stable (`extractScoreFromOutput` parses "score: N") |
| `server/routes/engines.ts` (21 KB) | Engine routes, SSE master audit, compare, and catalog in one file | Size and fan-in (proxy) | Change one route at a time; re-run `src/tests/server/api.test.ts` |
| `server/routes/github.ts` (20 KB) | In-memory repo state, SSE subscribers, HMAC webhook | Size (proxy) | Keep the HMAC check before any state change |
| `server/core/rateLimit.ts` (15 KB) | Tier resolution, daily units, bursts, Upstash | Central to every engine route | Do not change tier constants without a test in `src/tests/server/rateLimit.test.ts` |
| `src/lib/firebase.ts` (1914 lines) | All Firestore reads and writes plus REST calls | Size (proxy) | Change one domain at a time |
| `src/App.tsx` (621 lines, 111 routes) | Route table and layout shell | Size (proxy) | Add routes in a single block; check `src/tests/ui/routes.test.tsx` |
| `src/store/middleware/mongoSyncMiddleware.ts` and `src/store/slices/*` | Optimistic mutations with pending and failed queues | Concurrency-sensitive | Test sync paths before changing |

### 6) `[ASK USER]` Questions

Each item is marked `[ASK USER]` in the documents above. Answers resolve the open design questions.

1. Which lockfile is canonical: `package-lock.json` (npm, used by CI) or `bun.lock`? Should the other be deleted?
2. The project declares Node 24 (`.nvmrc`, `engines`) but CI uses Node 20. Local runs used Node 22, and the failing suite also fails on Node 24, so the runtime is not the cause. Should CI move to Node 24, and should the full gate (`npm run ci`) run on every PR?
3. Should `npm run typecheck` be a hard gate? If so, should the 127 test-file errors be fixed by importing `@testing-library/jest-dom/vitest` in `src/tests/setup.ts` (verified: 0 errors), or should `src/tests` move to a separate test `tsconfig`?
4. Which engine path is canonical: `src/lib/nodeEngines.ts` (live on Express) or `lib/engines/*` (used only by `app/api/scan/stream`)? Can the other be removed, and should `docs/ENGINES.md` be corrected to match?
5. Should `ai_search` be exposed on the server? `docs/ENGINES.md` lists it, but no server route runs it.
6. How should paid plans be activated? Webhooks currently verify but grant nothing, and `/api/v1/users/me/subscription/request` returns 501 for paid plans. Should the webhook write `user_subscriptions`, or should `/api/payments/verify` call the gateway API?
7. Are `GET /api/analytics/stats` and `GET /api/analytics/realtime` meant to be public, and may any caller query any `domain`?
8. Should `PORT` be honored, as `README.md` says, or is the fixed `3000` in `server.ts` intended?
9. Are the Vercel twins in `api/` deployed anywhere? Keep or remove?
10. What is the deployment target (single process, one container, or multiple instances)? If multiple, should rate limits, API keys, and connected repos move to a shared store before launch?
11. Should the generic webhook path use `guardedFetch` (pinned DNS), and should the Discord check parse the hostname?
12. Are the root-level scripts (52), `archive/`, `app/`, `workspace/`, and the empty `ui-ux-pro-max-skill/` in scope for this repository? (Answered: the HazardNet notebook is removed, Q18b, 2026-10-19.)
13. Should `.env.example` gain `APP_ORIGIN`, `VITE_APP_ORIGIN`, `JWT_SECRET`, and `PAYMENT_SIGNING_SECRET`, and should the README's `VITE_FIREBASE_*` section be removed?

### 7) Evidence

- Scan output: `/tmp/codebase-scan.txt` was lost in a `/tmp` reset. Regenerate with the skill's `scripts/scan.py`.
- Verification re-run 2026-10-19 on Node 22.22.3 (logs in `/tmp/validate/`, may not persist): `npm ci` (exit 0), `npx tsc --noEmit` (exit 2, 127 errors in 10 files), `npm run lint` (exit 0), `npx vitest run` (185 passed, 5 skipped, 1 suite failed), `npm run build` (exit 0), `npm run check:bundle` (exit 0, initial raw 1285 kB / 2100 kB), `npm run check:env` (exit 0, warnings only), `python -m pytest -q scripts/tests` (32 passed)
- Node 24.22.0 (from the npm registry, `node@24`): `npx vitest run src/tests/rateLimiter.test.ts` fails with the same TypeError (`/tmp/validate/vitest-node24-ratelimiter.log`)
- Verification run after `setup.ts` change (reverted): `npx tsc --noEmit` returns 0 errors
- `git rev-list --count HEAD` → 1 (no churn history)
- `grep` counts: `as any` 78 (src non-test) and 6 (server); `console.` 18 (src/lib) and 1 (server); TODO/FIXME/HACK in non-test `server/`, `src/`, `lib/`, `api/`: none (one placeholder `XXXX` in `src/store/slices/alertsSlice.ts:55`)
- `server/routes/payments.ts`, `server/routes/account.ts`, `server/routes/telemetry.ts`, `server/routes/system.ts`, `server/app.ts`, `server/core/rateLimit.ts`, `server/core/apiKeys.ts`, `server/routes/github.ts`, `src/lib/webhookService.ts`, `src/lib/networkSecurity.ts`, `src/lib/nodeEngines.ts`, `src/store/slices/alertsSlice.ts`, `eslint.config.js`, `tsconfig.json`, `CODE_REVIEW.md`
- Historical: `CODE_REVIEW.md` lists 5 Criticals and 12 Majors. Most were fixed in code (identity verification, webhook HMAC, state-sync IDOR, payment verify fail-closed). Their file and line references are stale.

## Extended Sections (Optional)

### Items from `CODE_REVIEW.md` status check (2026-10-14)

| Historical finding | Current state | Evidence |
|--------------------|---------------|----------|
| C1 payments verify grants entitlements | **Fixed** (always 503) | `server/routes/payments.ts` |
| C2 identity from spoofable headers | **Fixed** (server-derived identity, headers ignored) | `server/core/rateLimit.ts` comments, `src/lib/serverAuth.ts` |
| C3 GitHub webhook HMAC never verified | **Fixed** (HMAC over raw body; unknown `repoId` → 404) | `server/routes/github.ts` |
| C4 `/api/state/sync` IDOR | **Fixed** (owner from verified token only) | `server/routes/stateSync.ts` |
| C5 SSRF TOCTOU / fail-open | **Mostly fixed** (`guardedFetch` pins DNS). Generic webhook path still unpinned (see §1). | `src/lib/networkSecurity.ts`, `src/lib/webhookService.ts` |
| M3 God file (`server.ts` 2,906 lines) | **Fixed** (`server.ts` plus `server/app.ts` and 12 route modules) | `server.ts`, `server/routes/` |
| M4 `server.ts` vs `api/*` drift | **Still open** (`api/*` dormant) | `api/run-engine.ts` |
| M6 `strict: false` | **Fixed** (`strict: true`) | `tsconfig.json` |
| M12 test coverage silent on server criticals | **Partly fixed** (`src/tests/server/*`, but suite currently fails) | `src/tests/server/` |
