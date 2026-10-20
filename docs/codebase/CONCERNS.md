# Codebase Concerns

> Regenerated 2026-10-19 by the `acquire-codebase-knowledge` workflow. Severity is judged from the code plus the gate runs in this session (Node v22.22.3). Test-only problems are separated from production debt per the workflow rule. Owner decisions already recorded in `docs/plan/decisions.md` (D1–D16, Q17–Q42, all dated 2026-10-19) are cited inline, and §6 distinguishes "answered but not implemented" from genuinely open questions.

## Core Sections (Required)

### 1) Top Risks (Prioritized)

| Severity | Concern | Evidence | Impact | Suggested action |
|----------|---------|----------|--------|------------------|
| **High** | **No code path grants a paid plan.** Gateway webhooks verify the HMAC then only log and return `200`; `POST /api/v1/users/me/subscription/request` returns `501` for any non-`free` `planId`; `POST /api/payments/verify` always returns `503 PAYMENTS_VERIFICATION_UNAVAILABLE`. | `server/routes/payments.ts` (both webhook handlers, verify handler), `server/routes/account.ts:169-200` | Revenue flow is non-functional, while `README.md`, `docs/ARCHITECTURE.md`, and the 503 message all state that signed webhooks provision entitlements. Owner decision **D1** (webhook writes the subscription) is unimplemented. | Implement the webhook → `user_subscriptions` write with idempotency + a replay guard, then an end-to-end sandbox test (signed webhook → record → entitlement change), as the plan's goal statement requires. |
| **High** | **Quality gates are red and CI does not run them.** `npm run typecheck` exits 2 with 127 errors; `npm test` exits 1 (one suite fails at load); the only workflow runs `npm run media:check` on Node 20. `npm run ci` cannot pass. | this session's `npx tsc --noEmit`, `npx vitest run`, `.github/workflows/media-verify.yml`, `package.json` `ci` | Any regression — including a security one — can merge to `main` unimpeded. `README.md` still advertises four green gates and "177 passed". | Apply **Q38** (`import '@testing-library/jest-dom/vitest'` in `src/tests/setup.ts:1`) → 0 type errors; fix the `localStorage` stub; add a PR workflow running `npm run ci` on Node 24 (**D5**). |
| **High** | **Security-critical state lives in process memory.** Daily rate-limit ledger, hashed API-key store, connected GitHub repos, GitHub SSE subscribers, and client-log/contact throttles are module-level `Map`s. Only the 60 s burst limiter can be distributed (Upstash). | `server/core/rateLimit.ts:43,421-425`, `server/core/apiKeys.ts`, `server/routes/github.ts:15-16`, `server/routes/clientLogs.ts:30`, `server/routes/contact.ts` | Restart wipes quotas **and issued API keys**; with N instances each enforces a full budget (N× quota). The chosen host (**Q32**: Oracle Always Free, Render Free fallback) redeploys frequently. | Persist API keys (Firestore `api_keys` is already referenced in `.env.production.example` copy) and move the daily ledger to Upstash. |
| **High** | **Three rate-limit implementations with conflicting budgets.** Authoritative `server/core/rateLimit.ts`: visitor 20, free 50, starter 150, pro 500, team 1500, enterprise 5000, api_pro 500. `lib/rate-limit.ts` `TIER_DAILY_LIMITS`: visitor **5**, free **20**, enterprise **10000**, superadmin 999999. `src/utils/rateLimiter.ts` duplicates the server numbers for display. | `server/core/rateLimit.ts:13-21`, `lib/rate-limit.ts:25-33`, `src/utils/rateLimiter.ts:11-18` | Reviving the dormant path (it is the only limiter behind `app/api/scan/stream/route.ts`) silently changes guest and enterprise quotas; any budget edit must be made in three places and can drift. | Delete `lib/rate-limit.ts` + its shim `src/lib/rate-limit.ts` (single importer is a dormant Next route; **D7/D8** already authorise removing that path) and export the display constants from one module. |
| **Medium** | **Hard-coded master-audit score.** `POST /api/v1/audit/master` returns `compositeScore: 92, grade: 'A'` for every target; the store seeds the same constant; the public API spec documents it. | `server/routes/engines.ts:377-378`, `src/store/slices/auditsSlice.ts:29`, `src/data/apiSpecs.ts:420` | Consumers of the JSON (non-SSE) master audit receive a fabricated headline score. Only the SSE path + client-side averaging produces measured numbers (`src/pages/MasterAuditExecutionPage.tsx:155-159`). | Derive the composite from the per-engine outputs (`extractScoreFromOutput` already exists at `server/routes/engines.ts:18`) or remove the field until it is real. |
| **Medium** | **Public analytics reads.** `GET /api/analytics/stats` and `GET /api/analytics/realtime` require no identity and accept any `domain` value (default `all`); only `/api/analytics/anomalies/check` is superadmin-gated. | `server/routes/telemetry.ts:176-218` | Anyone can read per-domain aggregate traffic for any stored domain. Owner decision **D4** says global aggregates may be public but *per-domain numbers need identity and domain ownership* — unimplemented. | Gate `domain != all` behind identity + ownership; keep the global aggregate public. |
| **Medium** | **Retention is promised but not enforced.** `pricingData.ts` publishes `telemetryRetentionDays` 14/60/90/365/730 per plan, and the privacy copy repeats it, but there is no TTL index, purge job, or `deleteMany` anywhere in the analytics layer. Owner decision **D9** says publish the five values *and* "purge job enforces them". | `src/data/pricingData.ts:23,64,104,144,184`; `grep -n` for `retention`/`TTL`/`expireAfterSeconds`/`purge`/`deleteMany` in `src/lib/analyticsEngine.ts` → 0 hits; `src/legal/privacy.ts:298` ("nothing enforces it") | A published retention promise with no mechanism is a compliance exposure (GDPR-style storage limitation) and a growing-collection cost. | Add a TTL index or a scheduled purge keyed to the owner's plan; until then, soften the public claim. |
| **Medium** | **Telemetry ingestion has no rate limit.** No limiter middleware on any of the 4 event aliases; the only abuse filter is a user-agent regex plus a prefetch check, both client-controlled. | `server/routes/telemetry.ts:47-49,166-169` (no `createEngineRateLimitMiddleware` import) | Unauthenticated write amplification into MongoDB or the in-memory buffer; the in-memory path is also an unbounded-growth risk. | Add a cheap per-IP token bucket in front of the event aliases. |
| **Medium** | **SSRF gaps on secondary outbound paths.** (a) Generic webhook: `validatePublicUrl` then a **plain `fetch`** — DNS resolves twice (TOCTOU/rebinding). (b) Discord: `webhookUrl.includes('discord.com/api/webhooks/')` — substring test, no hostname parse, no SSRF validation. (c) TLS certificate probe: `tls.connect({ host: hostname, port })` after validation, so the connection is **not pinned** and the port comes from the user URL. Owner decision **Q41** accepted fixing (a) and (b). | `src/lib/webhookService.ts:253-254,301` and `:190-192`; `server/routes/engines.ts:145-156` → `server/core/ssl.ts:16-22`; `src/lib/securityAudit.ts:16-30,242` | (a)/(b) are superadmin-only, so impact is bounded but real; (c) is reachable by any caller of `/api/monitor/probe` and gives a TLS port-probe oracle against arbitrary hosts/ports, plus a rebinding window. | Route (a) through `guardedFetch`; make (b) a `new URL(...).hostname === 'discord.com'` + pathname-prefix check; pin (c) to the validated IP (or reuse `guardedFetch`'s lookup) and restrict the port to 443. |
| **Medium** | **Two engine implementations, and the docs name the wrong one.** Live: `src/lib/nodeEngines.ts` (939 lines, one switch, 8 engines × 2 aliases). Parallel: `lib/engines/*` (8 modules + `ENGINE_EXECUTORS`), imported **only** by the dormant `app/api/scan/stream/route.ts`. `docs/ENGINES.md` calls `lib/engines/` canonical and lists `ai_search` as a server engine — it is unreachable from Express. Owner decisions **D7** (nodeEngines canonical, delete `lib/engines/`) and **Q39** (don't expose `ai_search`; correct the doc) are unimplemented. | `src/lib/nodeEngines.ts:29-58`, `lib/engines/index.ts:22-32`, `app/api/scan/stream/route.ts:3,109`, `server/core/enginesCatalog.ts`, `docs/ENGINES.md` | Engine fixes can land in the dead path; the doc misleads integrators; `docs/ENGINES.md` also claims "redirects never auto-followed" while `guardedFetch` follows up to 3 revalidated hops. | Delete `lib/engines/` + `src/lib/engines/index.ts` with the Next leftovers, then rewrite `docs/ENGINES.md` from `enginesCatalog.ts` + `runNativeEngine`. |
| **Medium** | **Checkout prices contradict the published price table.** `payments.ts` `pricingMap` annual totals: Starter 90, Pro 190, Team 490, Enterprise 990. `pricingData.ts` annual totals: 84, 180, 468, 948 (monthly 9/19/49/99 match). Owner decision **Q23** says "annual prices in `pricingData.ts` are published and checkout reads them". | `server/routes/payments.ts:23-28` vs `src/data/pricingData.ts:51-53,91-93,131-133,171-173` | A buyer can be charged more than the advertised annual price — refund/chargeback and consumer-law exposure, and it contradicts the published refund policy in `src/legal/refund.ts`. | Import the price table into the checkout handler (or generate both from one module) before paid checkout is enabled. |
| **Medium** | **Dormant gateway contradicts the gateway decision.** The client selects the gateway with `gateway: 'dodopay'` in the request body; **D2** says 2Checkout is the single live gateway and Dodo "stays in code, disabled until needed". | `server/routes/payments.ts` (`const selectedGateway = gateway === 'dodopay' ? 'dodopay' : '2checkout'`) | A caller can route a live checkout to the backup gateway that the owner intends to keep dark. | Server-side gateway pinning (env or constant) instead of a client-chosen field. |
| **Medium** | **`server/` is outside the lint scope.** `eslint.config.js` applies rules only to `src/**`; `npx eslint server/app.ts` answers "File ignored because no matching configuration was supplied". No `@typescript-eslint` recommended rule set is enabled anywhere. | `eslint.config.js`, terminal output this session | `npm run lint` exit 0 says nothing about the 4,101-line Express layer that holds every security control. | Add a config block for `server/**`, `lib/**`, `components/**`, `types/**` (start with `tseslint.configs.recommended` at warn, then ratchet). |
| **Medium** | **SEO/AEO defects on public routes (P1).** Unknown URLs return HTTP 200 with the homepage shell (soft 404) and the rendered page is `index, follow`; `SEOHead` always writes `index, follow`, so `/login`, `/admin`, `/dashboard`, `/forgot-password`, `/blogs/new` are indexable; without JS every route serves the homepage title/canonical/JSON-LD; canonicals fall back to `window.location.href` (query strings included). Owner decisions **D11** (prerender public routes; app routes client-only with `noindex`) and **D14** (`www` canonical; 301 + delete the 18 legacy `public/*.html`) are unimplemented. | `docs/audit/seo-aeo-2026-10/00-SEO-AEO-AUDIT.md` S1–S5, `server.ts:53-58`, `src/components/common/SEOHead.tsx:31,54`, `public/*.html` (18 files, all served 200, no canonical/noindex) | Wasted crawl budget, duplicate content across 18 legacy pages + SPA routes, app/account pages in the index. | Implement D11/D14 as a build-time prerender + redirect map; that also fixes the JSON-LD mismatch below. |
| **Medium** | **Structured data and marketing numbers don't match the product.** `index.html` JSON-LD claims `offerCount: 3`, `lowPrice: 0`, `highPrice: 199` while `pricingData.ts` has **5** plans and no 199 anywhere (max monthly 99, max annual total 948); `author.name` is "CatalystLab Inc." (**D15** confirms the name; address/jurisdiction still open per **Q17/Q33**). `index.html` and `Footer.tsx:46` say "**38** global edge nodes" while `src/lib/edge/pops.ts` holds **42** PoPs and 10+ UI strings say 42. | `index.html:53-110`, `src/data/pricingData.ts`, `src/lib/edge/pops.ts` (42 entries), `src/components/layout/Footer.tsx:46`, SEO audit S8 | Structured-data mismatch can trigger rich-result manual actions; inconsistent numbers undermine the "measurement platform" positioning. | Generate offers from `pricingData.ts`; pick one PoP number and derive it from `pops.ts`. |
| **Medium** | **AI-crawler policy decided but not published.** **D12** (2026-10-19): allow Googlebot, OAI-SearchBot, PerplexityBot, Claude-SearchBot and user-triggered fetchers; disallow GPTBot, ClaudeBot, CCBot, Google-Extended. `public/robots.txt` has a single `User-agent: *` block and no AI-crawler rules; it also disallows `/admin` and `/dashboard` but not `/admin.html` / `/dashboard.html`. | `public/robots.txt` (19 lines), `docs/plan/decisions.md` D12, SEO audit S10 | The decided policy has no effect; training crawlers are currently allowed by default. | Emit the D12 rule set (and cover the `.html` twins until D14 deletes them). Note `llms.txt`/`llms-full.txt` already exist per **D13**. |
| **Low** | **Public infrastructure detail endpoints.** `GET /api/v1/system/health` returns RSS/heap, uptime, `nodeVersion`, `platform`, Mongo connection state and masked URI, plus `activeEnginesCount` = **16** (alias-inflated: `Object.keys(ENGINE_SCRIPT_MAP).length`); `GET /api/v1/database/mongodb/status` returns health + ingestion batch metrics. Neither requires identity. | `server/routes/system.ts:12-50`, `server/core/enginesCatalog.ts` | Fingerprinting surface for attackers; a wrong public engine count. | Restrict detail fields to superadmin; count distinct implementations, not map keys. |
| **Low** | **Synthetic data on public v1 endpoints.** `/api/v1/reports`, `/api/v1/reports/permalink/:slug` (fabricates a dossier for any slug: "Passed 48 quality assertions"), `/api/v1/reports/:id/export`, `/api/v1/blogs`, `/api/v1/blogs/:slug` (same body for any slug). No store, no identity, no rate limit. | `server/routes/reports.ts:8-76` | Third parties can cite invented audit results as CatalystLab output; the export stub admits scores are not synthesized. | Wire to Firestore/Mongo, gate by ownership, or return `501` until implemented. `[ASK USER]` §6(b) #3 |
| **Low** | **Stale hard-coded monitoring seed.** `INITIAL_MONITORED_SITES` ships a Google Cloud Run hostname and the note "Edge API gateway hosting 8 **Python** telemetry engines" — `docs/ENGINES.md` records that no Python engine is loaded at runtime. | `src/lib/firebase.ts:777-793`, `docs/ENGINES.md` "Decision record" | New contributors believe a Python engine tier exists; a dev-cluster URL is baked into product data. | Remove the seed or move it behind an env flag. |
| **Low** | **Undeclared runtime dependency.** 4 files in root `components/telemetry/` import `framer-motion`, which is absent from `package.json` and resolves only as a transitive dep of `motion@13` (`framer-motion@13.2.0` in the lockfile). Three of them are live (reached through the `src/components/telemetry/` shims); the fourth is the orphaned duplicate below. The other 72 animated files import `motion/react` as `AGENTS.md` §5 requires. | `grep -rl "from 'framer-motion'"` → `components/telemetry/{DiagnosticConsoleCard,GuestQuotaBanner,MasterTelemetryGrid,SideBySideDeltaMatrix}.tsx`; `node -e` on `package-lock.json` | A `motion` upgrade that renames or drops the transitive package breaks the build with no manifest warning. | Switch those files to `motion/react` (no new dependency needed). |
| **Low** | **Divergent duplicate component.** `SideBySideDeltaMatrix` exists twice as a full implementation: root `components/telemetry/` (329 lines, `framer-motion`, 14 lucide icons) and `src/components/telemetry/` (339 lines, uses `Skeleton`/`SkeletonTable`, different engine metadata). `src/pages/ComparePage.tsx:2` resolves to the **`src/`** copy; the root copy has **no importer**. | `cmp -s` → DIFFERS; `wc -l` 329 vs 339; repo-wide grep for importers | Edits can land in the dead copy; the two already disagree on which engines/metrics are compared. | Delete the root copy (or make it a shim like its 4 siblings). |

### 2) Technical Debt

**Production debt** (test-only debt is listed separately below, per the workflow rule).

| Debt item | Why it exists | Where | Risk if ignored | Suggested fix |
|-----------|---------------|-------|-----------------|---------------|
| Archiving was copy, not move | A cleanup pass duplicated files into `archive/` without deleting the originals | 38 root `*.py`/`*.cjs` codemods are **byte-identical** to `archive/automation/` copies (0 differing); all 6 compared `archive/legacy-next/` files are byte-identical to live `api/`, `app/api/scan/stream/route.ts`, `next.config.ts`; `workspace/refactor_colors.sh` also exists at `archive/automation/workspace/` | Two editable copies of every codemod and of the Next leftovers; contributors can't tell which is live. **Q18** already authorised moving `workspace/` to `archive/`. | `git rm` the root copies whose archive twin is identical; delete `api/`, `app/`, `next.config.ts` per **D7/D8**. |
| 52 root one-off codemods | Past colour/typography/layout fix-up passes | root `35 *.py`, `11 *.cjs`, `5 *.mjs`, `1 *.sh` (`fix_colors_*.py`, `replace_padding_v2.cjs`, `massive_hex_replace.py`, `ds_upgrade.py`, …) | Repo-root noise; referenced by no npm script, workflow, or source file (verified by grep) | Delete, or move the whole set under `archive/automation/` (38 are already there). |
| Vestigial Next.js / Prisma / AI-Studio artifacts | Earlier stack iterations | `next.config.ts`, `app/` (incl. `app/applet/` with its own `main.tsx`/`index.css`), `metadata.json` (claims `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API`), `firebase-blueprint.json` (0 code references), `tsconfig.json` `include: ["prisma"]` (no such directory) and `exclude: ["app"]` while `app` is also in `include` | Misleads new contributors; `app/**` is neither type-checked nor linted | Remove with **D7/D8**; drop `prisma` from `include`. |
| Empty directory | Placeholder | `ui-ux-pro-max-skill/` (0 files) | Dead weight; git doesn't track empty dirs, so it only exists in working copies | Delete. |
| Two lockfiles | Bun was tried, npm won | `package-lock.json` (469.5 KB) + `bun.lock` (230.6 KB) | Installs can diverge between contributors and CI. **D6** settled it: keep npm, delete `bun.lock`. | `git rm bun.lock`. |
| Vestigial Python engine names | Python engines were never committed | `server/core/enginesCatalog.ts` (`ENGINE_SCRIPT_MAP` values like `website_health.py`), surfaced by `/api/v1/engines` and by `activeEnginesCount` | The public catalog advertises scripts that do not exist and inflates the engine count to 16 | Replace values with the TS module ids (or drop them) and count distinct engines. |
| Root ↔ `src/` mirror layer | Historical split between root `components/`, `lib/`, `types/` and `src/` | Shims point **both ways**: 5 real implementations live at root (`components/telemetry/{DiagnosticConsoleCard,GuestQuotaBanner,LiveTerminalStream,MasterTelemetryGrid}.tsx`, `components/ui/dashboard-sidebar.tsx`) behind 1–2 line `src/components/` shims, while 8 root files (`components/ui/{BenchmarkCard,CodeBlock,TelemetryCard,TerminalInput,cobe-globe-cdn,edge-mesh-globe,demo}.tsx`, `components/telemetry/AuditScoreMatrixRadar.tsx`) are reverse shims into `src/`. Plus `src/lib/rate-limit.ts`, `src/lib/engines/index.ts`, `src/types/telemetry.ts`, `lib/utils.ts` | Indirection hides where code lives; `src/lib/rate-limit.ts` and `src/lib/engines/index.ts` have **no importer**, and one pair diverged into two implementations (see §1) | Move the 5 root implementations under `src/`, invert their shims, delete the unused ones — do it together with the D7/D8 cleanup |
| Mixed logging | Pino adoption was partial | 18 `console.*` calls under `src/lib/` (incl. server-side `analyticsEngine.ts`, `serverAuth.ts`, `emailService.ts` mock dispatch) and `server.ts:71-72` | Unstructured output on server paths; mock-mode email sends are invisible to the JSON log pipeline | Route through `server/core/logger.ts` on server-executed modules. |
| Heavy `any` under `strict: true` | Speed of development, plus `useUnknownInCatchVariables: false` | `as any` 78× in non-test `src/`, 6× in `server/`; `@ts-ignore`/`@ts-expect-error` 6×; `@typescript-eslint/no-explicit-any` is **off** | Type safety is weaker than `strict` implies; `err.message` reaches clients in several 500 handlers | Tighten touched files first; return generic messages from 500 handlers. |
| Large modules | Accumulation | `src/lib/firebase.ts` 1,898 lines (Firestore client + all API calls + seed data), `src/data/apiSpecs.ts` 1,396, `src/pages/PlaygroundPage.tsx` 1,190, `src/lib/media/registry.ts` 1,006, `src/pages/UserDashboardPage.tsx` 970, `src/lib/nodeEngines.ts` 939, `src/components/ui/edge-mesh-globe.tsx` 797, `src/lib/edge/pops.ts` 795, `src/lib/analyticsEngine.ts` 744, `src/App.tsx` 639 (142 routes) | High blast radius per edit; `firebase.ts` mixes client SDK, business calls, and seeded demo records | Split `firebase.ts` by collection; extract the route table from `App.tsx`. |
| Committed binary weight | Generated hero/banner imagery checked in | `src/assets/images/*.jpg` 1.31 MB / 1.16 MB / 1.03 MB / 644 KB / 565 KB / 253 KB; `assets/banners/hero-banner.png` 797.7 KB | The six largest files in the repo are images; they inflate clones and the build | Move to a CDN or compress/convert to AVIF/WebP (the vestigial `next.config.ts` already lists those formats). |
| No error tracker | Not yet added | no Sentry/OTel dependency or config anywhere | **D10** chose Sentry with PII scrubbing; today production errors exist only in pino lines and the client-log sink | Add the SDK during the observability phase. |
| Legal copy has 6 open placeholders | Business decisions pending | `src/legal/privacy.ts:248,296-301` (paid-checkout go-live, account deletion/backup period, contact-message retention, analytics retention enforcement, API-key persistence, host log retention) | The plan's release goal requires 0 `[ASK USER]` markers in the legal drafts. **Q26** already answers most of them (contact 365 d, deletion ≤30 d, logs 30 d, keys not persisted until 4.1) — the copy just hasn't been updated. | Fill the table from Q26/D9, then implement the enforcement so the copy stays true. |
| Stale intent documents | Docs written against an earlier tree | `README.md` ("gates are green", "177 passed", `PORT` honoured, links to a non-existent `PRODUCTION_READINESS_AUDIT.md`, documents `VITE_FIREBASE_*` that no code reads), `docs/ENGINES.md` (canonical path, `ai_search`, "redirects never auto-followed"), `docs/plan/production-readiness-plan.md` §1 (claims "60 `[ASK USER]` markers" in legal; 7 exist) | Contributors and reviewers plan against false premises; **Q42** already ordered the README `VITE_FIREBASE_*` removal | Refresh README/ENGINES alongside the D1–D16 implementation work. |

**Test-only debt** (coverage gaps, *not* production risk):

| Item | Where | Note |
|---|---|---|
| 127 type errors from the wrong jest-dom entry point | `src/tests/setup.ts:1` + 10 suites | One-line fix accepted as **Q38**; blocks the `typecheck` gate for the whole repo |
| Suite aborts on a getter-only `localStorage` | `src/tests/rateLimiter.test.ts:28` | 5 quota tests never execute → client rate-limit maths is untested |
| No E2E suite although Playwright is installed | no `playwright.config.*`; `test-browser.mjs` is a 12-line manual script | Route-level regressions and the SEO P1s are invisible to CI |
| Coverage thresholds never evaluated | `vitest.config.ts` (`server/**`: 70/50/85/70) | `npm run test:coverage` aborts on the failing suite |
| Python suite not wired to npm or CI | `scripts/tests/test_replace_images.py` (22 `def test_`) | `[TODO]` not executed in this sandbox (pytest absent) |
| No tests for the SEO invariants, the synthetic `reports.ts` endpoints, or the hard-coded composite score | — | Each has an audit finding or a fabricated value behind it |
| Misleading suite labels | `src/tests/ui/*.test.tsx` describe blocks say "Browserbase UI-Test" | They run in jsdom; the naming implies a real browser |

### 3) Security Concerns

| Risk | OWASP category | Evidence | Current mitigation | Gap |
|------|----------------|----------|--------------------|-----|
| Paid entitlements cannot be granted (and the docs say they can) | A01 Broken Access Control / A04 Insecure Design | `server/routes/payments.ts`, `server/routes/account.ts:169-200` | Verify endpoint is a hard 503; the client cannot self-activate; Firestore rules allow only `free`/`active` client writes | No provisioning path at all (**D1** unimplemented) |
| Public per-domain analytics reads | A01 | `server/routes/telemetry.ts:176-210` | None | No identity or ownership check (**D4** unimplemented) |
| SSRF on the generic webhook (unpinned) | A10 SSRF | `src/lib/webhookService.ts:253-254,301` | `validatePublicUrl` (scheme, private-range, DNS check), `https://` required, superadmin-only route | DNS resolves twice → rebinding window; **Q41** accepted `guardedFetch`, not applied |
| SSRF/host confusion on the Discord webhook | A10 SSRF | `src/lib/webhookService.ts:190-192` | Superadmin-only route | Substring `includes()` instead of hostname parse; no `validatePublicUrl` (**Q41**) |
| Unpinned TLS probe with a user-chosen port | A10 SSRF | `server/routes/engines.ts:145-156` → `server/core/ssl.ts:16-22`; `src/lib/securityAudit.ts:16-30,242` | `validatePublicUrl` runs first on the URL; 4 s socket timeout | `tls.connect` re-resolves by hostname and accepts any port from the URL → rebinding window + TLS port-probe oracle on `/api/monitor/probe` (1 unit, rate-limited) |
| Raw error text returned to clients | A05 / information disclosure | `server/routes/payments.ts` (`err.message` in 500s), `server/routes/notifications.ts`, enabled by `useUnknownInCatchVariables: false` | Route handlers mostly log detail and return a generic message | Inconsistent: several handlers echo `err.message` |
| In-memory credential and quota state | A07 (operational) | `server/core/apiKeys.ts` (SHA-256 hashed, `byHash`/`byId`), `server/core/rateLimit.ts:43` | Keys hashed; constant-time compare for the legacy `VALID_API_KEYS` allowlist; secrets never echoed (`toPublicRepo`) | Lost on restart, not shared across instances (**Q32** host redeploys often) |
| Public system detail endpoints | A05 | `server/routes/system.ts:12-50` | Mongo URI masked | Memory, `nodeVersion`, `platform`, Mongo state exposed anonymously |
| Unencoded, unvalidated `planId` in checkout URLs | A03 Injection (low) | `server/routes/payments.ts` (`prod=${planId}`, `plan=${planId}`) | Amount is computed server-side from `pricingMap` (unknown ids fall back to `pro`) | `planId` is not URL-encoded and not checked against the map before interpolation |
| Telemetry ingestion abuse | A04 | `server/routes/telemetry.ts:166-169` | zod schema, bot/prefetch UA filter | No rate limit; the UA filter is client-controlled |
| CSP breadth | A05 | `server/app.ts` CSP | Production drops `'unsafe-inline'` from `script-src` via startup-computed sha256 hashes of `dist/index.html`; `object-src 'none'`; `frame-ancestors` restricted; HSTS preload | `connect-src` allows any `ws:`/`wss:`; `img-src` allows any `https:`; `style-src` keeps `'unsafe-inline'` in all environments; `frameguard: false` |
| `X-Forwarded-For` trust | A01 (low) | `server/core/rateLimit.ts` (leftmost XFF value) | Only honoured when `TRUST_PROXY === 'true'`; `app.set('trust proxy', 1)` | If the proxy appends rather than replaces, the leftmost value is client-controlled |
| Soft-404 + indexable app routes | A05 (SEO/attack-surface adjacent) | `server.ts:53-58` catch-all, `SEOHead.tsx:54` | API paths get a JSON 404 catch-all | Unknown URLs return 200 HTML; `/login`, `/admin`, `/dashboard` are `index, follow` (**D11** unimplemented) |
| Seeded demo records in production code paths | A05 (low) | `server/routes/github.ts:16-24` (demo repo, secret defaults to `''`), `src/store/slices/alertsSlice.ts:55` (placeholder Discord URL), `src/lib/firebase.ts:777-793` (Cloud Run seed) | The seeded webhook is inert because its secret is empty | Demo data ships live; the seed asserts a Python engine tier that does not exist |
| Client Firebase config committed | — (accepted) | `firebase-applet-config.json` | Documented as public by design (`README.md` "Secrets hygiene"); default-deny `firestore.rules` | None — accepted by the owner |

**Mitigations verified as present this session:** fail-closed Firebase Admin verifier (`src/lib/serverAuth.ts:44-77`); HMAC-SHA256 over the **raw body** with `timingSafeEqual` (`src/lib/webhookSecurity.ts`, captured by the body-parser `verify` hook in `server/app.ts`); server-derived identity with client headers ignored (`server/core/rateLimit.ts:111-114`); state-sync ownership from the verified token (`server/routes/stateSync.ts` → 401 without identity); default-deny Firestore rules with per-collection validators (`firestore.rules:4-6`); SSRF guard with DNS pinning, per-hop redirect revalidation, and a 5 MB cap (`src/lib/networkSecurity.ts:186-317`); pino redaction of credential headers (`server/core/logger.ts`); client-log sink with zod caps, 64 KB body limit, and 30 req/5 min (`server/routes/clientLogs.ts`). No `TODO`/`FIXME`/`HACK` markers exist in production code (grep: 0 across `src`, `server`, `lib`, `api`, `app`, `components` excluding tests) — matching the scan's "None found".

### 4) Performance and Scaling Concerns

| Concern | Evidence | Current symptom | Scaling risk | Suggested improvement |
|---------|----------|-----------------|-------------|-----------------------|
| Master-audit fan-out | `server/routes/engines.ts:360-372` (`Promise.allSettled` over 8 engines) | One request → 8 concurrent outbound fetches, each up to 10 s, plus cheerio parsing in-process | Bounded only by the 10-unit cost and burst limits; CPU contention with the API in one process | Cap in-handler concurrency (2-3) or move scans to a worker/queue |
| SSE master audit is sequential | `server/routes/engines.ts:445-486` (`for` loop, `await` per engine) | A stream can hold a connection for ~8 × 10 s worst case | Connection and event-loop occupancy under load; two different resource profiles for one documented feature | Parallelise with ordered emission, or document the latency contract |
| Per-engine timeouts | `HTTP_TIMEOUT_MS = 10000`, `guardedFetch` default 10 s, `check-url` 4 s, TLS 4-4.5 s, DoH 3 s, crt.sh 3.5 s | Slow targets hold request-scoped resources | No per-request total budget | Add an overall deadline per scan |
| **No timeout on Mailgun or webhook sends** | `src/lib/emailService.ts:332-339`, `src/lib/webhookService.ts:152,204,301` (no `signal`) | A hung upstream keeps the handler open indefinitely | Ties up the single process; user-visible stalls on contact/notification flows | Add `AbortSignal.timeout(...)` and treat a timeout as a mock/failed dispatch |
| Client bundle weight | Build output: `vendor-firebase` 553.63 kB raw / 160.95 gzip, `vendor-charts` 392.64 / 108.52, `index` 351.89 / 92.18; Vite warns "Some chunks are larger than 500 kB" | Budget gate passes with headroom (initial 1287/2100 kB raw, 377/540 gzip; largest chunk 541/1050) | Budgets are a ratchet set ~5-10% above reality (`scripts/check-bundle-budget.mjs` header) — headroom shrinks as features land | Lazy-load Firebase by feature; keep the ratchet tight |
| jsdom recreated per test file | Vitest run: "jsdom was created 21 times · 8.62s total, 41% of tracked time"; `fileParallelism: false` | 22.75 s suite | Slow feedback loop discourages running tests | `pool: 'vmThreads'` or `isolate: false` where safe |
| In-memory analytics buffer | `src/lib/analyticsEngine.ts:41-43,183-239` | Events queue in memory when `MONGODB_URI` is unset; lost on restart | Silent data loss in degraded mode, unbounded growth if flush never runs | Surface the mode in `/api/v1/system/health` and bound the buffer |
| Unbounded in-process maps | `dailyRateLimitStore` (hourly cleanup at `server/core/rateLimit.ts:421-425`), `githubSseSubscribers`, client-log/contact throttle maps, API-key maps | Only the rate-limit ledger is cleaned | Memory growth on long-running processes; SSE subscribers on close `[TODO]` not verified | Add cleanup on socket close and a periodic sweep for each map |
| Measured rendering performance | `docs/audit/perf-rendering-2026-10/05-remediation.md`: LCP `/` 896 ms, `/pricing` 744, `/docs` 436, `/blogs` 200; CLS 0 on all audited routes after the containing-block fix; mouse long tasks 61 → 0 | Remediated items C1/C3/D2/D3/D4 + the fixed-layer bug are done | Open: C2 `backdrop-filter` (measured, not changed), C4 page-transition blur (tried, reverted), image `width`/`height` attributes, and "modals and overlays that open on interaction were not checked" | Finish the open items; re-measure after the D11 prerender change |
| No compression from this server | SEO audit S12: `curl -H 'Accept-Encoding: gzip' /` → no `content-encoding` | HTML/CSS/JS served uncompressed by Express | Owned by plan item 5.4; likely handled by the Cloudflare edge in the **D3** topology, but nothing in the repo configures it | Add `compression` or confirm the edge does it, and record it in the runbook |

### 5) Fragile/High-Churn Areas

**Git history is unusable in this checkout:** `git rev-list --count HEAD` → `1` and `.git/shallow` exists, so the scan's "HIGH-CHURN FILES (last 90 days)" list is all `1`s and carries no signal. `[TODO]` re-run the churn analysis on a full clone. The table below uses size, fan-in, and coupling as proxies instead.

| Area | Why fragile | Churn signal | Safe change strategy |
|------|-------------|-------------|----------------------|
| `src/lib/nodeEngines.ts` (939 lines) | One switch dispatches 8 engines × 2 aliases; 10 `guardedFetch` call sites; callers are `server/routes/engines.ts` (many routes) and `api/run-engine.ts` | Size + fan-in (proxy); it is the file **D7** makes canonical | Add per-engine tests before editing; keep the text output shape stable — `extractScoreFromOutput` (`server/routes/engines.ts:18`) parses scores out of it |
| `server/routes/engines.ts` (539 lines) | 13 routes incl. SSE streaming, compare, catalog, probe, and the hard-coded composite | Size + fan-in (proxy) | Change one route at a time; re-run `src/tests/server/api.test.ts` (58 tests) |
| `src/lib/firebase.ts` (1,898 lines) | Client Firestore SDK + every collection's CRUD + seeded demo records in one module | Largest source file in the repo | Change one collection at a time; `firestore.rules` validators must be updated in the same PR |
| `server/core/rateLimit.ts` (428 lines) | Tier resolution, daily ledger, bursts, Upstash, 429 envelope, cleanup interval — on the path of every engine route; budgets duplicated in two other files | Central fan-in | Never change a tier constant without updating `src/tests/server/rateLimit.test.ts` (15 tests) **and** checking `src/utils/rateLimiter.ts` / `lib/rate-limit.ts` |
| `src/App.tsx` (639 lines, 142 `<Route>` elements) | Whole route table + layout shell + global mousemove spotlight handler (perf finding C1 was fixed here) | Size + fan-in; the perf audit touched it | Add routes in one block; check `src/tests/ui/routes.test.tsx` (13 tests); keep the spotlight handler's per-frame coalescing |
| `server/routes/github.ts` (510 lines) | In-memory repo state, SSE subscriber map, HMAC webhook, dev-only event simulator | Size (proxy) | Keep the HMAC check before any state mutation; secrets must stay out of `toPublicRepo` |
| `src/lib/networkSecurity.ts` (318 lines) | Every outbound user-URL fetch depends on it; 9 unit tests | High fan-in, security-critical | Any change needs a `networkSecurity.test.ts` case first (loopback/private/link-local/rebinding/redirect) |
| `src/store/middleware/mongoSyncMiddleware.ts` + `src/store/slices/*` | Optimistic mutations with pending/failed queues | Concurrency-sensitive | Exercise the sync paths before changing slice shapes |
| `src/lib/media/registry.ts` (1,006 lines) + `public/*.html` (18 files) | Media URLs verified by the only CI job; legacy pages duplicate SPA routes | CI-visible | Run `npm run media:check` after touching the registry; treat `public/*.html` as frozen until **D14** deletes them |

### 6) `[ASK USER]` Questions

**(a) Already answered by the owner in `docs/plan/decisions.md` (2026-10-19) but *not implemented in code*.** These no longer need a decision — they need the work, and each is a divergence between intent and reality:

1. **D1** webhook writes the subscription → still no write (`server/routes/payments.ts`).
2. **D2** 2Checkout is the single live gateway, Dodo disabled → the client can still select `dodopay` at runtime.
3. **D3/Q31/Q32** Cloudflare Pages + Node host (Oracle Always Free, Render fallback) + Worker `/api` proxy → no deploy config of any kind exists in the repo.
4. **D4** per-domain analytics need identity + ownership → `/api/analytics/{stats,realtime}` are still open.
5. **D5** Node 24 everywhere → CI still pins Node 20.
6. **D6** delete `bun.lock` → still committed.
7. **D7** `src/lib/nodeEngines.ts` canonical, `lib/engines/` removed → both paths still present; `docs/ENGINES.md` still names the wrong one.
8. **D8** delete `api/` → still present (and duplicated in `archive/legacy-next/`).
9. **D9** publish retention values *and* enforce them with a purge job → values published, no enforcement.
10. **D10** Sentry with PII scrubbing → no tracker dependency or config.
11. **D11** prerender public routes; app routes client-only with `noindex` → single SPA shell, soft-404s, `index, follow` everywhere.
12. **D12** AI-crawler allow/disallow list → `robots.txt` has no AI rules.
13. **D14** `www` canonical, 301 + delete the 18 legacy `public/*.html` → canonical is `www` (done), the 18 pages still serve 200 with no canonical/noindex.
14. **D15** "CatalystLab Inc." confirmed; JSON-LD offers should be generated from `pricingData.ts` → `index.html` still hard-codes `offerCount: 3`, `highPrice: 199`.
15. **Q23** checkout reads `pricingData.ts` annual prices → `payments.ts` hard-codes 90/190/490/990 vs published 84/180/468/948.
16. **Q38** import `@testing-library/jest-dom/vitest` → `src/tests/setup.ts:1` still imports the Jest entry point (127 type errors).
17. **Q39** don't expose `ai_search`; correct `docs/ENGINES.md` → the doc still lists it as a server engine.
18. **Q40** honour `PORT`, default 3000 → `server.ts:26` hard-codes 3000.
19. **Q41** `guardedFetch` on the generic webhook + hostname parse for Discord → neither applied.
20. **Q42** add `APP_ORIGIN`, `VITE_APP_ORIGIN`, `JWT_SECRET`, `PAYMENT_SIGNING_SECRET` to `.env.example`; remove the README `VITE_FIREBASE_*` section → neither applied.
21. **Q18** move `workspace/refactor_colors.sh` to `archive/` → the root copy still exists alongside the archive copy.

**(b) Genuinely open — these still need an owner answer:**

1. `[ASK USER]` **Deployment shape for state.** Q32 names a single free Node host, but the rate-limit ledger, API-key store, connected repos, and SSE subscribers are all in-process. Is a single instance the launch posture (accepting quota/key loss on every redeploy), or should keys and quotas move to Firestore/Upstash **before** launch?
2. `[ASK USER]` **Retention enforcement mechanism.** D9/Q26 fix the periods (results 14/60/90/365/730 d, contact 365 d, deletion ≤30 d, logs 30 d). On a free host with no cron, what runs the purge — a MongoDB TTL index, an on-request sweep, or a scheduled job on the host?
3. `[ASK USER]` **Synthetic v1 endpoints.** Keep `/api/v1/reports*` and `/api/v1/blogs*` returning hard-coded demo data (and `permalink/:slug` fabricating a dossier for any slug), wire them to a store, or return `501` until they are real?
4. `[ASK USER]` **Master-audit composite score.** Should `/api/v1/audit/master` compute the composite from engine output (and drop the constant `92`/`A`), or should the JSON endpoint be removed in favour of the SSE stream that the UI actually uses?
5. `[ASK USER]` **TLS probe port policy.** `/api/monitor/probe` accepts any port from the submitted URL for the certificate check. Restrict to 443, or keep arbitrary ports as a product feature (with pinning)?
6. `[ASK USER]` **Legal copy placeholders.** `src/legal/privacy.ts:248,296-301` still carries 6 `[ASK USER]` markers (paid-checkout go-live date, account deletion + backup period, contact retention, analytics retention enforcement, API-key persistence, host log retention). Q26 answers most of them — confirm so the copy can be finalised and the plan's "0 markers" release goal met.
7. `[ASK USER]` **Jurisdiction/entity details.** Q17 is only partly answered (no physical location; jurisdiction "still open" pointing at Q33, itself marked "Owner to confirm"). The privacy/terms pages and the JSON-LD `author` need the final wording.
8. `[ASK USER]` **CI gate scope.** Should the new PR workflow run the full `npm run ci` (including `check:bundle` and the media check that needs outbound network), and should `server/**` be added to the ESLint scope in the same change?
9. `[ASK USER]` **Archive policy.** 38 root codemods are byte-identical to `archive/automation/` copies and 6 root files are byte-identical to `archive/legacy-next/` copies. Delete the root copies, delete `archive/`, or keep both? (`ui-ux-pro-max-skill/` is an empty directory — remove?)
10. `[ASK USER]` **`framer-motion` phantom import.** Convert the 4 `components/telemetry/` files to `motion/react` (matching `AGENTS.md` §5 and the other 72 files), or declare `framer-motion` explicitly?
11. `[ASK USER]` **`typescript` in `dependencies`.** Intentional (e.g. the deploy image runs `tsc`), or should it move to `devDependencies`?
12. `[ASK USER]` **Lighthouse CI.** `.lighthouserc.json` exists with error-level a11y/SEO/best-practice assertions but nothing runs it. Wire it into CI (needs a build + a static server), or delete the config?
13. `[ASK USER]` **`firebase-blueprint.json` and `metadata.json`.** No code references either. Are they AI-Studio/blueprint artifacts to keep, or removable?
14. `[ASK USER]` **Churn data.** This checkout is shallow (1 commit). Should the mapping be re-run against a full clone so `CONCERNS.md` §5 can use real 90-day churn instead of size proxies?

### 7) Evidence

- Scan output: `docs/codebase/.codebase-scan.txt` — `TODO / FIXME / HACK (production code only)` = "None found"; `CODE METRICS` (653 files, 100,612 lines, largest files); `CI/CD PIPELINES` = GitHub Actions only; `CONTAINERS & ORCHESTRATION`, `SECURITY & COMPLIANCE`, `PERFORMANCE & TESTING` = none detected (the last is wrong: `.lighthouserc.json` exists); `HIGH-CHURN FILES` = all `1` (shallow clone); `MONOREPO SIGNALS` = none
- Terminal output this session: `npm ci` (888 packages), `npx tsc --noEmit` (exit 2, 127 × TS2339 in 10 files), `npm run lint` (exit 0), `npx eslint server/app.ts` ("File ignored…"), `npx vitest run` (206 passed / 5 skipped / 21 files, 1 failed suite, 22.75 s), `npm run build` (exit 0, 18.06 s, >500 kB chunk warning), `npm run check:bundle` (exit 0, 6/6 budgets), `npm run check:env` (exit 0, 8 warnings), `git rev-list --count HEAD` (1), `python3 -m pytest --version` (module missing)
- Duplicate/identity checks: `cmp -s` root↔`archive/automation` (38 identical, 0 differing) and root↔`archive/legacy-next` (6/6 identical); `grep -rl "from 'framer-motion'"` (4 files) vs `"from 'motion/react'"` (72 files); lockfile check for `node_modules/framer-motion` (13.2.0, transitive)
- Code: `server/routes/{payments,account,telemetry,system,reports,engines,github,notifications,clientLogs,contact,stateSync}.ts`, `server/core/{rateLimit,apiKeys,ssl,enginesCatalog,logger,authz}.ts`, `server/app.ts`, `server.ts`, `src/lib/{networkSecurity,nodeEngines,securityAudit,serverAuth,analyticsEngine,emailService,webhookService,webhookSecurity,firebase,logger}.ts`, `lib/{rate-limit.ts,engines/index.ts}`, `src/utils/rateLimiter.ts`, `src/data/{pricingData,apiSpecs}.ts`, `src/store/slices/{auditsSlice,alertsSlice}.ts`, `src/legal/privacy.ts`, `src/App.tsx`, `index.html`, `public/robots.txt`, `src/lib/edge/pops.ts`
- Config: `eslint.config.js`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `.lighthouserc.json`, `scripts/{check-env,check-bundle-budget,verify-media}.mjs`, `.env.example`, `.env.production.example`, `.gitignore`, `.github/workflows/media-verify.yml`, `.github/CODEOWNERS`
- Intent/audit documents cross-checked: `README.md`, `docs/ARCHITECTURE.md`, `docs/ENGINES.md`, `CODE_REVIEW.md`, `docs/plan/production-readiness-plan.md`, `docs/plan/decisions.md`, `docs/audit/perf-rendering-2026-10/05-remediation.md`, `docs/audit/seo-aeo-2026-10/00-SEO-AEO-AUDIT.md`

## Extended Sections (Optional)

### `CODE_REVIEW.md` historical findings — status re-checked 2026-10-19

| Historical finding | Current state | Evidence |
|--------------------|---------------|----------|
| C1 `/api/payments/verify` granted entitlements | **Fixed** — always 503 with a `code` | `server/routes/payments.ts` |
| C2 identity taken from spoofable headers | **Fixed** — server-derived from verified tokens; headers ignored | `src/lib/serverAuth.ts`, `server/core/rateLimit.ts:111-114` |
| C3 GitHub webhook HMAC never verified | **Fixed** — HMAC over the raw body; unknown `repoId` rejected | `server/routes/github.ts`, `src/lib/webhookSecurity.ts` |
| C4 `/api/state/sync` IDOR | **Fixed** — owner comes from the verified token; 401 without identity | `server/routes/stateSync.ts:22,77,142` |
| C5 SSRF TOCTOU / fail-open | **Mostly fixed** — `guardedFetch` pins DNS for engine and probe fetches. Still open: generic webhook (unpinned), Discord (substring check), TLS probe (unpinned, any port) | `src/lib/networkSecurity.ts`, `src/lib/webhookService.ts`, `server/core/ssl.ts` |
| M3 `server.ts` god file (2,906 lines) | **Fixed** — 85-line entrypoint + `server/app.ts` + 12 route modules | `server.ts`, `server/` |
| M4 `server.ts` vs `api/*` drift | **Still open** — `api/` is dormant, unlinted, and duplicated in `archive/legacy-next/` | `api/run-engine.ts`, `cmp -s` results |
| M6 `strict: false` | **Fixed** — `strict: true` | `tsconfig.json` |
| M12 coverage silent on server criticals | **Partly fixed** — `src/tests/server/*` (79 tests) + coverage thresholds on `server/**`, but the thresholds are never evaluated because a suite fails first | `vitest.config.ts`, this session's run |
| No CI gate for lint/tsc/test/build | **Still open** — `media-verify.yml` only | `.github/workflows/` |

### Suggested remediation order (smallest unblocking change first)

1. `src/tests/setup.ts:1` → `@testing-library/jest-dom/vitest` (**Q38**): removes all 127 type errors and unblocks `typecheck` as a hard gate.
2. `src/tests/rateLimiter.test.ts:28` → `vi.stubGlobal('localStorage', …)`: turns the suite green so `test:coverage` can evaluate the `server/**` thresholds.
3. Add a PR workflow on Node 24 running `npm run ci` (**D5**), and extend the ESLint config to `server/**`.
4. One price table shared by `pricingData.ts` and `payments.ts` (**Q23**), and server-side gateway pinning (**D2**).
5. Webhook → `user_subscriptions` provisioning with an end-to-end sandbox test (**D1**).
6. `guardedFetch` for the generic webhook, hostname parse for Discord, pinned/443-only TLS probe (**Q41** + §3).
7. Honour `PORT` (**Q40**), add the four missing `.env.example` keys and drop the README `VITE_FIREBASE_*` section (**Q42**).
8. Repo hygiene: delete `bun.lock` (**D6**), `api/`, `app/`, `next.config.ts`, `lib/engines/`, `lib/rate-limit.ts` + shims, the 38 duplicated root codemods, `workspace/`, and the empty `ui-ux-pro-max-skill/` (**D7/D8/Q18**); then rewrite `docs/ENGINES.md` (**Q39**) and refresh `README.md`.
9. SEO/AEO: prerender public routes, `noindex` app routes, real 404s, robots AI rules, JSON-LD generated from `pricingData.ts`, one PoP number (**D11/D12/D14/D15**).
10. Retention enforcement (**D9/Q26**) + Sentry (**D10**) + the legal-copy placeholders.


## Corrections after the 2026-10-19 implementation pass

- The **duplicated engine tree** (`lib/engines/`), the legacy Next.js layers
  (`api/`, `app/`, `next.config.ts`), `archive/`, `workspace/`,
  `ui-ux-pro-max-skill/`, `bun.lock` and 38 duplicated root codemods were deleted
  on 2026-10-19 (answer #9). `src/lib/nodeEngines.ts` is the single engine
  implementation (D7).
- **API keys**: the "hashed keys live in memory and are lost on restart" concern
  was factually wrong — they are stored in Firestore (`server/core/apiKeys.ts`).
  The related concern (quota counters being per-process) is fixed by
  `server/core/dailyQuota.ts`, which uses Upstash when configured (answer #1).
- **Synthetic data**: `/api/v1/reports*` and `/api/v1/blogs*` answer `501`
  (answer #3) and the JSON master-audit endpoint that returned a hard-coded
  `compositeScore: 92` was removed in favour of the SSE stream (answer #4). The
  remaining invented rate-limit strings in `src/data/apiSpecs.ts` were replaced
  with copy the code can back.
- **SEO/indexability**: public routes are prerendered, app and auth routes are
  `noindex`, unknown paths return a real 404, the sitemap is generated and the
  JSON-LD is built from live pricing and PoP data (D11/D12/D14/D15).
- **Coverage**: `npm run test:coverage` is green against the measured baseline
  (statements 68.36, branches 55.89, functions 72.58, lines 69.86) with a ratchet
  comment in `vitest.config.ts` (plan §4b.6).
- **Churn (answer #14)**: `git fetch --unshallow` succeeded on 2026-10-19, so the
  hot-spot list is now measured from the full history. See the next section.
- Still open: Phase 3 items 3.2, 3.5-3.8 and 3.10-3.16 from
  `docs/plan/production-readiness-plan.md`.

## Measured churn (answer #14, full clone, 2026-10-19)

`git fetch --unshallow` succeeded on 2026-10-19, so this replaces the
"unmeasured" caveat above with real data: **145 commits** from 2026-03-19 to
2026-10-19.

Most-touched source files (commit count, whole history):

| Touches | File | Why it churns |
| --- | --- | --- |
| 32 | `src/App.tsx` | route table: every page addition edits it |
| 31 | `src/components/layout/Navbar.tsx` | shared chrome: every visual change touches it |
| 30 | `src/pages/UserDashboardPage.tsx` | page-level UI iterated repeatedly |
| 29 | `src/index.css` | shared chrome: every visual change touches it |
| 29 | `src/components/layout/Footer.tsx` | shared chrome: every visual change touches it |
| 28 | `src/pages/BlogsPage.tsx` | page-level UI iterated repeatedly |
| 27 | `src/pages/PricingPage.tsx` | page-level UI iterated repeatedly |
| 27 | `src/pages/ContactPage.tsx` | page-level UI iterated repeatedly |
| 26 | `src/pages/MasterAuditPage.tsx` | page-level UI iterated repeatedly |
| 26 | `src/components/home/HeroSection.tsx` | page-level UI iterated repeatedly |
| 25 | `src/pages/ToolPage.tsx` | page-level UI iterated repeatedly |
| 24 | `src/pages/ReportsDirectoryPage.tsx` | page-level UI iterated repeatedly |

Largest source files (lines, excluding tests):

| Lines | File |
| --- | --- |
| 1898 | `src/lib/firebase.ts` |
| 1331 | `src/data/apiSpecs.ts` |
| 1190 | `src/pages/PlaygroundPage.tsx` |
| 1006 | `src/lib/media/registry.ts` |
| 971 | `src/pages/UserDashboardPage.tsx` |
| 939 | `src/lib/nodeEngines.ts` |

Reading of the numbers:

- The hot spots are all **presentation-layer** files (`src/App.tsx`, `Navbar`,
  `Footer`, `index.css` and a handful of pages). Nothing in `server/**` appears
  in the top twelve, which matches the code review finding that the API layer is
  new and stable while the UI is iterated constantly.
- `src/App.tsx` is the single most fragile file: it is the 142-route table, so
  every new page edits the same file, and it is now also read by
  `scripts/prerender.ts` to build `dist/routes.json`. A malformed route breaks
  both the SPA and the sitemap.
- `src/lib/firebase.ts` (~1.9k lines) is by far the largest module and mixes
  auth, Firestore access, config loading and helpers. It is the strongest
  candidate for the split recommended in `docs/plan/production-readiness-plan.md`.
- Commit dates cluster (18 commits on 2026-09-05, 14 on 2026-09-11), which is
  typical of burst work rather than continuous delivery; there is no evidence of
  a long-lived branch strategy beyond the arena/* PR branches.
