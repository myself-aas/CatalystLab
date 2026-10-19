# CatalystLab: Production-Readiness Plan

Status: draft, revised 2026-10-19 after the SEO/AEO audit (Phase 7b, D11–D15) and a skills review (SRE, DevOps, security, test, monitoring, cloud, and a pre-mortem; D16, Phases 3, 4b, 5, 8, 10, and §16). Branch `arena/9369d7c0-catalystlab`. Written against the current tree (uncommitted changes on this branch, including the 2026-10-19 perf remediation in `docs/audit/perf-rendering-2026-10/05-remediation.md` and the SEO/AEO audit in `docs/audit/seo-aeo-2026-10/00-SEO-AEO-AUDIT.md`).

## 0. Scope, goal, and stop conditions

**Target.** This plan covers the CatalystLab repository in this workspace (`catalystlab` 2.4.0, served at catalystlab.tech). It does not cover `researchwith.me`, which is a separate project. On 2026-10-19 that domain served Firebase Hosting's "Site Not Found" page, and no matching code exists in this repo. If the researchwith.me codebase is needed, share its repository and this plan should be redone for it.

**Goal** (written to the define-goal quality bar: measurable, with validators):

> Make CatalystLab deployable to production with: `npm run typecheck` exits 0 with 0 errors; `npm test` has 0 failing suites on Node 24; `npm run lint`, `npm run build`, `npm run check:bundle`, and `npm run check:env` exit 0; every Critical and High item in `docs/codebase/CONCERNS.md` is resolved or explicitly accepted in writing by the repository owner; paid activation is verified end to end in a sandbox (signed webhook → subscription record → entitlement change) by automated tests; unknown URLs return 404, account and app routes are `noindex`, each public route has its own title, canonical, and structured data, and the Phase 7b validators pass; a staging smoke suite passes 100% of checks on the deployment target; the legal drafts contain 0 `[ASK USER]` markers; and a runbook exists for deploy, rollback, and incident response. Evidence is the command output and test reports, recorded in the release checklist (Phase 10).

**Stop and ask the owner** (do not decide these in code):
- Any payment, pricing, or gateway decision (Phase 2).
- Any legal or privacy wording, and any data-retention period (Phase 6).
- Deployment target, hosting cost, or instance count (Phase 5).
- Public-page rendering, AI-crawler policy, canonical host, legacy `public/*.html` pages, and the entity identity used in structured data (Phase 7b, D11–D15).
- SLO targets, error budgets, and recovery objectives (Phase 8, D16). The SRE skill requires each target to be justified by user impact, so the owner supplies the numbers.
- Deleting or moving files the owner has not classified (Phase 9).
- Any change to governance files (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.github/copilot-instructions.md`, `.github/CODEOWNERS`). These are owned by @me-aas and are out of scope for agents.

**Ground rules.** Each change gets a failing test or reproduction first where practical. Each phase ends with its validator passing on a clean checkout (`npm ci`, not `npm install`). Changes land as small commits on the working branch. Nothing merges to `main` without owner review.

**Skill sources for this revision.** The reviews used the installed `~/.agents/skills` (from `jeffallan/claude-skills`): `sre-engineer` (SLOs, burn-rate alerts, toil), `devops-engineer` (CI, images, rollback, approval), `security-reviewer` (scans, manual review, report format), `test-master` and `playwright-expert` (test quality, Playwright configuration), `monitoring-expert` (metrics, k6), `cloud-architect` (redundancy, recovery objectives), and `the-fool` (pre-mortem, §16). The skills give method, not facts; each rule taken from them is checked against this repo before it becomes a validator.

## 1. Current state (baseline, verified 2026-10-19)

| Area | Verified state | Source |
|---|---|---|
| Type check | 127 errors, all in `src/tests/` | `npx tsc --noEmit` |
| Lint | 0 errors; ESLint targets `src/**` only, so `server/` is not linted | `eslint.config.js` |
| Tests | 206 pass, 5 skipped, 1 suite fails at load (`rateLimiter.test.ts`, getter-only `localStorage` in jsdom) | `vitest run` |
| Runtime | `.nvmrc` and `engines` require Node 24; CI uses Node 20 | `.nvmrc`, `package.json` |
| CI | One workflow, `media-verify.yml`, runs `npm install` then `npm run media:check`. It does not run typecheck, lint, tests, or build | `.github/workflows/` |
| Scripts | `dev build start test typecheck lint ci check:env media:check test:coverage check:bundle` | `package.json` |
| Build | Passes; initial gzip bundle within budget (`check:bundle`) | run 2026-10-19 |
| Port and host | `server.ts:26` hard-codes `PORT = 3000`, though the comment says PORT is read from the environment (M11) and `README.md` says it is honoured | `server.ts:24–27` |
| Deploy files | No Dockerfile, `vercel.json`, `netlify.toml`, `wrangler.*`, `_headers`, or `_redirects` | repo root |
| Observability | `pino` logger and `helmet`; no error tracker (no Sentry or OpenTelemetry dependency); health route `/api/v1/system/health` | `package.json`, `server/routes/system.ts` |
| Rate limiting | `@upstash/ratelimit` is a dependency, but the ledger is also an in-process `Map` | `server/core/rateLimit.ts:43`, `:421` |
| Env template | `.env.example` lacks `APP_ORIGIN`, `VITE_APP_ORIGIN`, `JWT_SECRET`, `PAYMENT_SIGNING_SECRET` | `.env.example` |
| Payments | Webhooks verify the HMAC and only log and return 200. Paid activation returns 501 | `server/routes/payments.ts`, `server/routes/account.ts:169–181` |
| Pricing | Checkout annual prices differ from the pricing page (Starter 90 vs `pricingData.ts`) | `payments.ts:23–28`, `src/data/pricingData.ts` |
| Legal | Terms, privacy, refund, and cookies drafted at SPA routes, with 60 `[ASK USER]` markers | `src/legal/`, `docs/codebase/` |
| Performance | Remediated in part; open items listed in `05-remediation.md` | `docs/audit/perf-rendering-2026-10/` |
| SEO and AEO | Unknown URLs return 200 (soft 404). Login, admin, and dashboard routes are `index, follow`. Raw HTML has the homepage title, canonical, and JSON-LD on every route. The OG image and `favicon.ico` return HTML. Blog posts are not in the sitemap. The JSON-LD price range (199) does not match `pricingData.ts`. Findings S1–S12 | `docs/audit/seo-aeo-2026-10/00-SEO-AEO-AUDIT.md` |

Known open decisions are recorded as `[ASK USER]` items 1–13 in `docs/codebase/CONCERNS.md` §6. This plan refers to them by number.

## 2. Dependency graph

```
Phase 1 (decisions) ──► Phase 2 (paid activation, pricing) ──► Phase 6 (legal copy must match behaviour)
        │                          │
        ▼                          ▼
Phase 3 (security) ──► Phase 4 (state and scaling) ──► Phase 5 (build and deploy)
        │
        ▼
Phase 4b (quality gates, CI) runs in parallel from day 1, and must be green before Phase 10
Phase 7 (performance), Phase 8 (observability), Phase 9 (repo hygiene) run in parallel after Phase 5
Phase 7b (SEO and AEO) runs after Phase 5 and needs D11–D15; its code items 7b.1, 7b.2, 7b.4, 7b.6, 7b.8 need no decision and can start earlier
Phase 10 (release) requires all phases' validators to pass
```

Phases 1 and 4b can start immediately. Phase 2 cannot finish before Phase 1 decisions are made.

## 3. Phase 1: Decisions (blocking)

Each decision is a one-line answer from the owner. Record each one in `docs/plan/decisions.md` (status, answer, date), and copy the answer into the ADR section of the runbook (8.6).

| # | Decision | Options | Blocks |
|---|---|---|---|
| D1 | Paid plan activation model | (a) webhook writes `user_subscriptions`; (b) `/subscription/request` activates after verifying the gateway | Phase 2 |
| D2 | Payment gateway | 2Checkout vs Dodo (both referenced in `payments.ts`) | Phase 2, Phase 6 |
| D3 | Deployment target | Settled 2026-10-19 (revised by the owner): option b, split. Static frontend on Cloudflare Pages; API on a Node host; same-origin `/api` proxy (mechanism pending Q31) | Phase 4, Phase 5 |
| D4 | Public analytics | Keep `GET /api/analytics/stats` and `/realtime` public, or require identity and domain ownership | Phase 3 |
| D5 | Node version | Keep Node 24 everywhere (recommended, matches `.nvmrc`) or move the project to 20 | Phase 4b |
| D6 | Canonical lockfile | `package-lock.json` (npm, used by CI) or `bun.lock`. Recommended: keep npm and delete `bun.lock` | Phase 4b |
| D7 | Canonical engine path | `src/lib/nodeEngines.ts` (live on Express) or `lib/engines/*` (used only by the Next leftover). Recommended: `nodeEngines.ts` | Phase 9 |
| D8 | `api/` Vercel twins | Delete, or keep as deployment targets | Phase 5 |
| D9 | Retention periods | Confirm `telemetryRetentionDays` by plan: 14, 60, 90, 365, 730 | Phase 4, Phase 6 |
| D10 | Error tracker | Sentry or similar, or a self-hosted log pipeline only | Phase 8 |
| D11 | Public-page rendering | (a) prerender public routes to static HTML at build time, with per-route title, canonical, JSON-LD, and body text; (b) client-only, with rendered-DOM checks only. Recommended: (a). The static frontend target from D3 supports it | Phase 5, Phase 7b |
| D12 | AI-crawler policy | Per purpose, not per vendor: search and answer crawlers; user-triggered fetchers; training crawlers (for example GPTBot, ClaudeBot, Google-Extended, CCBot). Owner chooses allow or disallow for each. Recommended: allow search and answer crawlers, decide training crawlers separately. This is a legal and business decision | Phase 7b |
| D13 | Machine-readable content for agents | (a) keep `llms.txt` and `llms-full.txt` only; (b) add Markdown alternates on the same canonical URLs (content negotiation with `Vary: Accept`). Recommended: (a) now, (b) after D11 | Phase 7b |
| D14 | Canonical host and legacy `.html` pages | `www.catalystlab.tech` or apex as canonical, with a 301 from the other; for the 18 `public/*.html` copies: 301 to the SPA route and delete, or keep with noindex. Recommended: `www`, and 301 and delete | Phase 5, Phase 7b |
| D15 | Entity identity in structured data | Legal entity name (the "CatalystLab Inc." in `index.html` JSON-LD is unconfirmed), social handles, and whether to publish a price range. Recommended: publish only the confirmed entity name and prices generated from `pricingData.ts` | Phase 6, Phase 7b |
| D16 | SLO targets and recovery objectives | Availability and latency targets for `/` and the engine API, the error budget policy, and RTO and RPO in hours. Recommended: start from the measured baseline in §1, then set targets the owner can defend against user impact | Phase 4.6, Phase 8.0, Phase 10.3 |

Exit criterion: all sixteen decisions recorded in `docs/plan/decisions.md` (one row per decision, with the owner's answer and date), and the owner signs off in the release checklist. Validator: `grep -cE "^\| D[0-9]+ .*\| (answered|accepted) " docs/plan/decisions.md` returns 16. This replaces the earlier `grep -c "D[0-9]"` check, which counted any occurrence of the text and could not show that a decision was answered.

**Settled 2026-10-19** (grilling Rounds 1–2, recorded in `docs/plan/decisions.md`): D1(a), D2 (2Checkout single live gateway), D3 (revised to option b, split: frontend on Cloudflare Pages, API on a Node host; Round 1 had chosen option A), D4, D5, D6, D7, D8, D9, D10, D11(a), D12, D14, D16. Open: D13 (waits for Round 3), and the registered address (Q17).

## 4. Phase 2: Payments and entitlements (blocking revenue)

Goal: a paid purchase activates the right plan, exactly once, and the pricing page, checkout, and entitlements agree.

**2.1 Pricing parity.** Make `src/data/pricingData.ts` the single source for plan prices. Have `server/routes/payments.ts` import it instead of the local `pricingMap` (`payments.ts:23–28`). Add a unit test that fails when the two disagree for any plan and cycle.
- Validator: `npx vitest run src/tests/server/payments` passes; a deliberate price change in `pricingData.ts` makes the test fail.

**2.2 Webhook to subscription.** Implement the write path for D1(a), settled 2026-10-19: the gateway's signed notification writes the subscription, and the client never activates a paid plan. Requirements:
- Verify the signature over the raw body with a constant-time comparison (the existing HMAC check in `src/lib/webhookSecurity.ts`).
- Idempotent on the gateway event ID: store processed IDs and ignore duplicates.
- Ordering-safe: an older event must not downgrade a newer state.
- Write the subscription record and the entitlement in one transaction (Firestore transaction or Mongo session, per D3).
- Replace the 501 in `account.ts:169–181` with the agreed path. Paid plans must not activate from the client.
- Validator: new tests cover: valid signature activates; invalid signature returns 401 and writes nothing; replayed event is a no-op; out-of-order event does not downgrade; duplicate event is idempotent. All pass.

**2.3 Checkout hardening.** Encode `planId` in the checkout URLs (`payments.ts`: `prod=${planId}` and `plan=${planId}`). Confirm the amount is computed server-side only.
- Validator: test that an unknown or malicious `planId` is rejected and the URL is encoded.

**2.4 Sandbox end-to-end.** Run a sandbox purchase against the chosen gateway in its test mode. Record the event payloads (redacted) in the release evidence.
- Validator: a scripted test (`scripts/e2e-payment-sandbox.*`, to be written) completes purchase → webhook → entitlement check, and the entitlement is visible through the authenticated account API.

Exit criterion: 2.1–2.4 validators pass; the owner confirms the gateway decision (D2) has been implemented, not only chosen.

## 5. Phase 3: Security (blocking)

Work in this order. Each item needs a test or a reproducible check.

| # | Item | Where | Fix | Validator |
|---|---|---|---|---|
| 3.1 | Public analytics reads | `server/routes/telemetry.ts:176–210` | Per D4: require identity and domain ownership, or keep public and restrict `domain` to a whitelist | Test: anonymous request for another domain returns 403 |
| 3.2 | Telemetry ingestion has no rate limit | `telemetry.ts` | Add rate-limit middleware keyed by API key or IP (`TRUST_PROXY` aware) | Test: over the limit returns 429 |
| 3.3 | SSRF on generic webhook | `src/lib/webhookService.ts:254–276` | Route through `guardedFetch` with pinned DNS (`networkSecurity.ts`) | Test: a hostname that resolves to a private IP is blocked, including on a second DNS lookup |
| 3.4 | Discord check is a substring match | `webhookService.ts:192` | Parse the URL and require `https` and host `discord.com` (or `discordapp.com`) with path `/api/webhooks/` | Test: `https://evil.example/?discord.com/api/webhooks/x` is rejected |
| 3.5 | Public system detail endpoints | `server/routes/system.ts:12–50` | Keep a minimal liveness endpoint public. Require auth for memory, Mongo, and batch details | Test: anonymous call returns only the liveness field |
| 3.6 | `X-Forwarded-For` trust | `server/core/rateLimit.ts:59–68` | Keep `TRUST_PROXY` off by default. Take the rightmost trusted value when enabled | Test: spoofed leftmost header does not change the rate-limit key |
| 3.7 | Seeded demo data | `server/routes/github.ts:16–24`; `src/store/slices/alertsSlice.ts` | Remove demo seed from production. Fail closed when `GITHUB_WEBHOOK_SECRET` is unset in production | Test: webhook without secret returns 503 in production mode |
| 3.8 | CSP breadth | `server/app.ts` | Restrict `connectSrc` (`ws:` and `wss:` to the Firebase and API hosts), `imgSrc` (`https:` to an allowlist), and move `'unsafe-inline'` styles to hashes or nonces. Test each change in the browser | `curl -I` shows the new header; the Playwright smoke suite passes with no CSP violations in the console |
| 3.9 | Public key-store state | `server/core/apiKeys.ts` | Covered by Phase 4 (state moves to shared store) | See 4.1 |
| 3.10 | Dependency audit | all | `npm audit --omit=dev` with an agreed threshold; remove `dompurify` if unused (audit DEP1, `package.json:32`) | `npm audit --omit=dev --audit-level=high` exits 0 or every finding has a written exception |
| 3.11 | Secret hygiene | `.env.example`; `firebase-applet-config.json` | Add `APP_ORIGIN`, `VITE_APP_ORIGIN`, `JWT_SECRET`, `PAYMENT_SIGNING_SECRET`. Confirm the Firebase web config is public by design (accepted in `README.md`). Production secrets come from the platform secret store (D3), never from env files or CI variables; `.env.example` is for local development only. | `npm run check:env` fails when a required secret is missing in production mode |
| 3.12 | Logging of sensitive data | `logger.ts:80–100` | Remove full request headers from every response log (about 2 KB per request). Log an allowlist of fields | Test: `Authorization` and `Cookie` never appear in log output |
| 3.13 | Secrets in git history | whole repository and history | Run `gitleaks detect --source=. --no-banner` in CI and once locally. Rotate any credential found before removing it from the tree. Rewrite history only with owner approval | `gitleaks detect --source=. --no-banner` exits 0, or each finding has a rotation record in the release checklist |
| 3.14 | Static analysis (SAST) | `src/`, `server/`, `lib/` | Add `semgrep` (pin the ruleset version) to the CI job in 4b.4. Triage each finding: fix it, or record a written exception | CI job fails on a seeded test pattern; the first full run is triaged in `docs/security/review-2026-10.md` |
| 3.15 | Manual review of auth, input, and payment flows | `server/routes/payments.ts`, `server/routes/account.ts`, `server/core/rateLimit.ts`, `src/lib/webhookService.ts` | Tools miss context, so review auth checks, input validation, and webhook handling by hand. Write each finding with an ID, severity (CVSS), file and line, impact, and remediation | `docs/security/review-2026-10.md` has one entry per finding, and no Critical or High finding is open without a written exception |
| 3.16 | Active-testing rules | staging and production | Penetration tests and fuzzing run only on staging, after the owner records written authorisation in the release checklist. Testing production needs a separate written authorisation. Stop exploitation at proof of concept | Release checklist has the authorisation row before any active test. `grep -rn "https://www.catalystlab.tech" e2e/security/` returns nothing |

Exit criterion: items 3.1–3.16 done or accepted in writing. Validator: a security regression test file exists and passes, and `docs/codebase/CONCERNS.md` shows no open Critical or High items.

## 6. Phase 4: State, scaling, and data

**4.1 Move in-process security state to a shared store (required if D3 is more than one instance).** Rate-limit ledgers, API key store, connected repos, client-log throttles, and contact throttles are module-level `Map`s (`server/core/rateLimit.ts:43`, `server/core/apiKeys.ts`, `server/routes/github.ts`). Move them to Upstash Redis (already a dependency) or to Mongo/Firestore.
- Validator: two server processes sharing the store enforce one rate limit. A test starts two instances against one Redis and confirms the combined count.

**4.2 Bound every in-memory map.** `githubSseSubscribers`, `dailyRateLimitStore`, and throttle maps have no cleanup except the hourly rate-limit sweep (`rateLimit.ts` line ~421). Add TTL or size caps.
- Validator: a test inserts N+1 entries and confirms the cap holds.

**4.3 Analytics buffer loss.** With `MONGODB_URI` unset, analytics run in an in-memory buffer and events are lost on restart (`src/lib/analyticsEngine.ts`). In production, refuse to start without `MONGODB_URI`, or add a visible degraded-mode flag in health output.
- Validator: `NODE_ENV=production npm start` without `MONGODB_URI` exits non-zero with a clear message.

**4.4 Retention.** Enforce `telemetryRetentionDays` (D9) with a TTL index (Mongo) or a scheduled purge job.
- Validator: a test inserts an event older than the retention window and confirms it is removed by the purge job.

**4.5 Firestore listeners.** Review the listeners at `src/lib/firebase.ts:1261` and `:1880`. Confirm each is unsubscribed on unmount and bounded by a query limit. (Not yet reviewed in the audit.)
- Validator: a React test mounts and unmounts the owning component and confirms the listener count returns to zero.

**4.6 Backups and recovery.** Define backup for Mongo and Firestore, and a restore drill. Record the recovery point and time objectives in the runbook.
- Validator: a restore drill is executed on staging and the restored record count matches.

Exit criterion: 4.1–4.6 done (4.1 only if D3 is multi-instance). Validator: integration tests in `src/tests/server/` pass, and the restore drill is recorded.

## 7. Phase 4b: Quality gates and CI (start now)

This phase runs from day one. It is the cheapest way to make every other change verifiable.

**4b.1 Fix the 127 type errors.** Import the jest-dom matchers for Vitest in `src/tests/setup.ts`. This was verified during the 2026-10-19 session: `tsc --noEmit` returns 0 errors with that import. Then make `typecheck` a hard gate.
- Validator: `npm run typecheck` exits 0.

**4b.2 Fix the failing suite.** `src/tests/rateLimiter.test.ts` fails because `setup.ts:28` assigns `globalThis.localStorage` to a getter-only property in jsdom 30. Use `Object.defineProperty` with a configurable value in the setup file.
- Validator: `npx vitest run src/tests/rateLimiter.test.ts` passes on Node 22 and Node 24.

**4b.3 Extend lint to `server/`.** Change `eslint.config.js` so `files` covers `server/**` and `scripts/**`. Fix or suppress only with a reason comment. Reduce `as any` in touched files first (78 in `src/`, 6 in `server/`).
- Validator: `npm run lint` exits 0 with the expanded scope.

**4b.4 Replace CI.** Rewrite `.github/workflows/` (add a new `ci.yml` and keep `media-verify.yml`) so each pull request runs, on Node 24: `npm ci`, `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `npm run check:bundle`, `npm run check:env` with a fixture env, `npm audit --omit=dev --audit-level=high`, the secret scan (3.13), and SAST (3.14). Run the Vitest suite with `--sequence.shuffle` (verified flag in this repo's Vitest) so order-dependent tests fail.
- Note: `.github/workflows` is not one of the governance files listed in §0, so changes there are in scope, but the CODEOWNERS entry applies.
- Validator: a test PR shows all jobs green, and a deliberate failure in each job turns the check red.

**4b.5 Lockfile (D6, settled).** Delete `bun.lock`; keep `package-lock.json`.
- Validator: `npm ci` succeeds; CI does not rewrite `package-lock.json` (`git diff --exit-code package-lock.json` after `npm ci`).

**4b.6 Coverage.** Set coverage thresholds in `vitest.config.ts` for `server/` and `src/lib/` (start at the measured baseline, then ratchet up). Note that coverage gives no thresholds while a suite fails (see `docs/codebase/TESTING.md`).
- Validator: `npm run test:coverage` exits 0 and reports the thresholds.

**4b.7 Test-only gaps.** Add the server-side tests the concerns list calls out: rate limiter (`src/tests/server/rateLimit.test.ts`), engine routes (`api.test.ts`), and the payment webhook tests from Phase 2.
- Validator: each test file exists and passes.

**4b.8 Test quality rules (test-master, playwright-expert).** Quarantine a flaky test with a linked issue, and do not re-run it until it passes. No `.only` or unexplained `.skip` in committed tests. Fixtures must not contain production data. Each unit test mocks external services (no live APIs or databases). Each feature has an error-path test as well as the success path.
- Validator: `grep -rnE "\.only\(" src/tests server/ --include=*.ts --include=*.tsx` returns nothing; `npx vitest run --sequence.shuffle` passes three runs in a row.

Exit criterion: 4b.1–4b.8 validators pass in CI on a clean branch.

## 8. Phase 5: Build, configuration, and deployment

**Hosting under a zero budget (Q30, researched 2026-10-19).** Frontend: Cloudflare Pages Free (static unlimited; 500 builds a month). Proxy: Cloudflare Workers Free (100,000 requests a day; 10 ms CPU per request; 50 subrequests), which is enough for forwarding `/api`. API host (Q32, settled: Oracle Always Free, with Render Free as the fallback):
- **Oracle Cloud Always Free, Ampere A1.** Always-on, no spin-down. Oracle cut the Always Free allowance to 1,500 OCPU-hours and 9,000 GB-hours a month (2 OCPU / 12 GB) in 2026; community reports say instances were disabled from 18 August 2026 on some free accounts, and PAYG reports conflict. A card is needed. Verify current terms and commercial use before launch.
- **Render Free web service.** No card. 512 MB RAM and 0.1 CPU. Spins down after 15 minutes idle; wake takes about 1 minute. The filesystem is ephemeral, and Render may restart the service at any time. One always-on service fits the 750 monthly instance hours, but keeping it awake with an external ping is not a supported fix. Paid checkout should not run here until 4.1 (shared state) and the webhook retry behaviour are verified.
- **Student Developer Pack hosts (Azure for Students, Heroku credit).** Azure for Students is for education, non-commercial research, and development and testing; its FAQ says it is not for commercial production use. Azure Dev Tools for Teaching prohibits commercial use. Heroku's partner terms were not checked. Use these for staging or prototypes only, not for the revenue-generating API.
- **Decision (Q32, 2026-10-19).** Oracle Always Free sized to 2 OCPU / 12 GB, with Render Free as the documented fallback. Paid checkout stays off until 4.1, 4.6 (restore drill), and a webhook retry test pass. Q36 (Oracle home region, fixed at signup) is open.

**5.1 Implement D3 (option b, settled 2026-10-19) and D8 (delete `api/`).** Build the API as a multi-stage `Dockerfile` (Node 24 slim, `npm ci --omit=dev` in the runtime stage, non-root user, `HEALTHCHECK` against `/api/v1/system/health`) for the Oracle Always Free host (Q32). Deploy the static frontend to Cloudflare Pages with `_headers` for the cache rules. Serve `/api/*` from the apex origin through a Cloudflare Worker route on the zone (Q31 (a), settled). Cloudflare's `_redirects` cannot proxy external origins (checked 2026-10-19), so a `_redirects` proxy rule is not an option. Delete `api/` (D8, settled).
- Validator: `docker build` succeeds and the container passes the smoke test. Split deployment: the staging URL serves the SPA from Pages, and `/api/v1/system/health` returns 200 through the Q31 proxy, with the origin of the API host unreachable from the browser. Image and deploy rules (devops-engineer): tag each image by commit SHA and never `latest`; scan the image in CI with `trivy image --severity HIGH,CRITICAL --exit-code 1 <image>`; set CPU and memory limits in the deployment config; deploy only artifacts built by CI.

**5.2 Port and host.** Make `server.ts` read `PORT` from the environment with 3000 as the default, as `README.md` and the M11 comment already say (`server.ts:24–27`).
- Validator: `PORT=4100 npm start` listens on 4100.

**5.3 Static serving.** `server.ts:35` uses `path.join(process.cwd(), 'dist')`, so the server only works when started from the repo root. Resolve `dist` relative to the built file. Keep the immutable cache header for `/assets/*` (added 2026-10-19 in `server.ts`).
- Validator: starting the server from another directory serves the SPA.

**5.4 Compression and caching.** Express sends no compression (audit D2). Add `compression` for HTML, JS, CSS, and JSON, and keep `Cache-Control` as configured. Re-measure the transfer size.
- Validator: `curl -H 'Accept-Encoding: gzip' -I /` returns `Content-Encoding: gzip`.

**5.5 Graceful shutdown.** On `SIGTERM`, stop accepting connections, drain in-flight requests within a timeout, close DB and Redis clients, then exit.
- Validator: a test sends `SIGTERM` during a slow request and confirms the request completes and the process exits 0. (Confirm first whether `server.ts` already handles this; the 2026-10-19 review did not check.)

**5.6 Environment contract.** Extend `check:env` to list required variables per mode, with the production set including the Firebase service account, the payment webhook secrets, `JWT_SECRET`, `PAYMENT_SIGNING_SECRET`, `APP_ORIGIN`, and `MONGODB_URI` (per 4.3).
- Validator: `npm run check:env` with `NODE_ENV=production` and no secrets exits non-zero and names the missing variables.

**5.7 Production build hygiene.** Confirm no sourcemap is published publicly (the only `.map` today is `dist/server.cjs.map`, which `server.ts:38` blocks). Confirm `dist/` is not committed.
- Validator: `curl -I /server.cjs.map` returns 404 and `git check-ignore dist` matches.

**5.8 Logging.** Route the `console.*` calls in `src/lib/analyticsEngine.ts` and `src/lib/serverAuth.ts` through pino (`CONVENTIONS.md` §4). Set `LOG_LEVEL` defaults per environment.
- Validator: `grep -rn "console\." src/lib server | grep -v test` returns no matches outside an allowlist.

**5.9 Redundancy and single points of failure (cloud-architect).** After D3 is chosen, list each component (app process, Mongo, Redis, Firebase, payment gateway, DNS, static hosting) with its redundancy and its failure behaviour in `docs/ops/architecture-redundancy.md`. Remove each single point of failure, or accept it in writing.
- Validator: every component row has a redundancy answer and a failure behaviour, with no blank cells.

**5.10 Cost and tags (cloud-architect).** Record the monthly cost estimate for the D3 target in the same file. Set a budget alert on the hosting account. Tag resources by environment and service.
- Validator: the budget alert exists (export or screenshot in the release checklist), and the estimate appears in `docs/ops/architecture-redundancy.md`.

Exit criterion: 5.1–5.10 validators pass against a built artifact, not only the dev server.

## 9. Phase 6: Legal, privacy, and compliance

The drafts (`src/legal/terms.ts`, `privacy.ts`, `refund.ts`) are a starting point. They are not legal advice and need counsel review.

**Settled legal positions (Round 3, 2026-10-19; counsel to review the legal wording).** Minimum age 18, and no accounts for under-18s. Breach notice to the supervisory authority within 72 hours; to users without undue delay. Refunds: monthly plans 7 days and annual plans 14 days from the first paid charge; acknowledge in 2 business days, decide in 5, process in 10 after approval; provider fees not refunded; manual refunds until automated. The 7-day trial needs no payment method and charges nothing; billing starts only after a paid choice. Self-service cancellation: paid features run to the end of the period, then the account moves to Community (a Phase 2 build item). Annual prices in `pricingData.ts` are the published values, and checkout reads them. USD; 2Checkout is the merchant of record. Liability cap: fees paid in the 12 months before the claim. Indemnity limited to misuse and breach. No availability commitment. Material changes: 30 days' notice by email and in the app. Retention: results per the plan tier (D9); contact messages 365 days; deletion within 30 days; server logs 30 days with credentials redacted; API keys not persisted until 4.1 ships. No third-party analytics or advertising identifiers at launch. Cookie policy lists `localStorage` and Firebase Auth storage. Seven subprocessors (Firebase, Mailgun, Upstash, MongoDB, 2Checkout, Sentry, the host), each under a DPA before launch. Rights: access, correction, deletion, portability, objection, restriction; response within one month. Legal bases: contract, legitimate interest, consent. One monitored legal mailbox; a DPO only if required. Remove the internal reviewer note in `terms.ts:161` before publication. Governing law and courts settled (Q33): Bangladesh law; the courts in Mymensingh, Bangladesh. Effective date: the day each page is published (Q34). Dispute steps: 30 days of good-faith negotiation by email, then the courts in Mymensingh, Bangladesh; no arbitration (Q35). Oracle home region: picked at signup, nearest to users, with Always Free A1 capacity (Q36). Counsel review items: the dispute clause, and whether a geographic address is required (Q17).

**6.1 Resolve the 60 `[ASK USER]` markers.** Each marker is a fact the owner must supply (entity name, address, retention periods, subprocessors, gateway name, support contact). Do not invent values.
- Validator: `grep -rc "\[ASK USER\]" src/legal` returns 0.

**6.2 Make the copy match the code.** Before publishing, check each claim against the implementation. Do not reuse the earlier claims listed as unsafe in the session notes ("GDPR & CCPA CERTIFIED", "Third-Party Access: None", "Google OAuth only", "cryptographic purge", mock export). Each privacy statement needs a code reference.
- Validator: a claims table in `docs/legal/claims-trace.md` maps each statement to a file and line. Every row is verified.

**6.3 Account deletion.** No deletion endpoint exists. Add one that deletes or anonymises the user's records across Firestore, Mongo, and Redis, with an audit log entry.
- Validator: an integration test creates a user with data, calls the endpoint, and confirms no record remains in each store.

**6.4 Data export.** The current export is mock JSON. Replace it with a real export of the user's records, or remove the feature from the UI until it is real.
- Validator: export returns the user's stored records and matches a fixture.

**6.5 Refund and billing alignment.** The refund policy must match the gateway's refund process (D2) and the 7-day trial behaviour recorded in the codebase notes.
- Validator: counsel and owner sign-off recorded in the release checklist.

**6.6 Cookie policy.** Confirm the cookies actually set (Firebase auth, analytics) match `CookiePolicyPage.tsx`. This review has not been done.
- Validator: a cookie inventory in the browser, compared with the page, shows no undeclared cookies.

**6.7 Legal routes.** Decide whether the `.html` alias routes stay. Owner decision on 2026-10-19: SPA routes chosen, and the `public/{privacy,terms,cookies}.html` duplicates deleted. The alias routes in `App.tsx` (for example `/refund.html`, `/privacy.html`) are not yet decided. The same question applies to the 18 legacy `public/*.html` pages in Phase 7b (D14).
- Validator: `curl -I /terms`, `/privacy`, `/refund`, `/cookies`, and `/legal` return 200.

Exit criterion: 6.1–6.7 validators pass, and counsel sign-off is recorded.

## 10. Phase 7: Performance (from the 2026-10-19 audit)

Completed in `05-remediation.md`: C1 (global mousemove), S1 (StickyHUD), C3 (ambient layer), D2 (immutable asset cache), D3 (font links), D4 (service worker assets), and the containing-block bug that broke the sticky navbar and HUD and caused the `/blogs` layout shift.

Open:
- **7.1 Translucent `backdrop-filter` (C2).** Measured cost is in the translucent blurs, not the opaque ones. Reducing them is a visual decision. Measure on GPU hardware first.
- **7.2 Route transition (C4).** An opacity-only transition moved the `/blogs` LCP later (about 250 → 600 ms in the sandbox). Trace the cause before changing `PageTransition`.
- **7.3 Bundle (D5, D6).** Trace the 14 untraced JS files on `/docs` and the CSS size cause.
- **7.4 Image attributes.** 24 of 26 `<img>` lack width, height, or sizes. Fix on the pages that have CLS.
- **7.5 Budgets and Lighthouse CI.** Add `.lighthouserc.json` runs to CI with budgets (B2, B3).
- **7.6 Coverflow (C5) and StickyHUD render cost.** Measure before changing.
- **7.7 Fonts.** Measure fonts on a network that can reach Google Fonts. The sandbox blocks it.

Exit criterion: Lighthouse CI budgets pass on `/`, `/pricing`, `/docs`, `/blogs` on mobile and desktop profiles, and the remaining open items have owner decisions.

## 10b. Phase 7b: Search and AI discoverability (SEO and AEO)

Source: `docs/audit/seo-aeo-2026-10/00-SEO-AEO-AUDIT.md` (findings S1–S12). Validators use `docs/audit/seo-aeo-2026-10/tools/seo-raw-check.sh` (raw HTML, no JavaScript) and `tools/seo-rendered.mjs` (browser). Run them against the built production server (`npm run build`, then `NODE_ENV=production node dist/server.cjs`), not the dev server.

Items 7b.1, 7b.2, 7b.4, 7b.6, and 7b.8 need no owner decision and can start now. Items 7b.3, 7b.5, 7b.7, 7b.9, 7b.10, and 7b.11 wait for D11–D15.

**7b.1 Real status codes for unknown URLs (S1).** Return 404 for any path that is not an SPA route, a static asset, or an API route. Serve the 404 page with status 404 and `noindex`. The SPA fallback (`server.ts:53`) stays for real routes only. The route list must come from one source that both server and client use.
- Validator: `curl -s -o /dev/null -w '%{http_code}' localhost:3000/this-page-does-not-exist` prints `404`. The rendered page on that path has `meta[name=robots]` containing `noindex`. Every `<loc>` in `sitemap.xml` returns 200.

**7b.2 `noindex` for app and account routes (S2).** Add a `noindex` option to `SEOHead` (`SEOHead.tsx:54`). Apply it to login, signup, forgot and reset password, dashboard, admin, command center, and blog editor routes, including their `.html` aliases. Send `X-Robots-Tag: noindex` from the server for `/admin*`, `/dashboard*`, `/user-dashboard*`, `/login*`, and `/signup*`.
- Validator: `curl -sI localhost:3000/admin | grep -i x-robots-tag` shows `noindex`. `seo-rendered.mjs` reports `noindex` for `/login`, `/dashboard`, `/admin`, and `/blogs/new`. A vitest test renders `SEOHead` with `noindex` and checks the meta tag.

**7b.3 Per-route HTML for clients that do not run JavaScript (S3). D11 settled as (a).** Generate static HTML for each public route at build time, with its own title, description, canonical, JSON-LD, and body text, then hydrate in the browser. Public set: `/`, `/pricing`, `/docs` and its pages, `/blogs` and `/blogs/:slug`, `/compare`, `/contact`, `/about`, and the legal pages. App routes stay client-only with `noindex` (7b.2).
- Validator: `seo-raw-check.sh` shows a unique title and canonical for each public route. `/` shows at least 500 visible words in raw HTML (baseline 161; 500 is the default target, owner may change it). `seo-rendered.mjs` shows no hydration warnings in the console.

**7b.4 Canonical from the route, never from the URL (S4).** Every `SEOHead` call site must pass `canonicalPath` or `canonicalUrl`. The repo has 38 canonical props in `src` (grep count of lines); 29 files use `<SEOHead`. The validator below checks every call site, not the count. The fallback at `SEOHead.tsx:31` uses `window.location.href`, which carries query strings and hashes into the canonical. Change the fallback to the route path without query or hash, and fix the call sites that still rely on it (observed: `/pricing`, `/blogs`, unknown routes).
- Validator: a vitest test renders each public route with `?utm_source=x` and checks that the canonical has no `?`. `seo-rendered.mjs` compares each sitemap route's canonical with `https://www.catalystlab.tech` plus the path.

**7b.5 Legacy `public/*.html` pages (S5). D14 settled.** There are 18 legacy static pages (for example `blogs.html`, `contact.html`, `compare.html`, `admin.html`, `dashboard.html`). Each returns 200 with no canonical and no `noindex`, and several differ from the SPA copy. Settled (D14): 301 each to its SPA route, then delete the file, after the review of `admin.html` and `dashboard.html`. Before deciding, review `admin.html` and `dashboard.html` for embedded data under Phase 3.
- Validator: `curl -sI localhost:3000/blogs.html` returns 301 with `location: /blogs` (or 404 after deletion). No `.html` URL appears in `sitemap.xml`, `llms.txt`, or internal links: `grep -rn '\.html"' src` returns nothing outside tests.

**7b.6 Social preview and icon assets (S6).** Add `public/og-image.png` at 1200×630 and keep the absolute URL in `index.html:43`. Add `public/favicon.ico` or stop requesting it. Unknown static paths must return 404 (7b.1).
- Validator: `curl -s -o /dev/null -w '%{content_type}' localhost:3000/og-image.png` prints `image/png`. `file public/og-image.png` reports 1200 x 630. `/favicon.ico` returns an image content type or 404, not HTML.

**7b.7 Structured data that matches the page (S8). D15 partly settled (name confirmed; address pending Q17).** Generate the `SoftwareApplication` offer range from `pricingData.ts` (monthly prices 0, 9, 19, 49, 99 today), or remove the range. Use page-appropriate types: `Organization` and `WebSite` on `/`, `BlogPosting` on posts, and the existing `TechArticle` on docs. Publish no rating unless there is a source for it. Publish the entity name "CatalystLab Inc." (confirmed in Q8). Do not publish the registered address until Q17 is answered.
- Validator: a unit test reads the generated JSON-LD and fails if `highPrice` differs from the highest public monthly price in `pricingData.ts`. After deployment, the Google Rich Results Test and the schema.org validator report 0 errors on `/`, `/pricing`, `/docs`, and one blog post.

**7b.8 Title and description lengths (S9).** Titles about 50–60 characters, with the primary term first. Descriptions 150–160 characters. Google truncates by pixel width, so these are guides, not hard limits. Wording is marketing copy; the owner signs it off in the release checklist.
- Validator: a vitest test renders each public route and asserts title length ≤ 60 and description length ≤ 160. Current values: homepage title 63, description 171.

**7b.9 Sitemap built from the route list (S7). Depends on D11 and D14.** Generate `sitemap.xml` at build time from the public-route list used by 7b.3 and the 10 slugs in `src/data/engineBlogs.ts`. Exclude `noindex` routes and `.html` aliases. Use each page's content date for `lastmod`, not the build date.
- Validator: the set of `<loc>` values equals the public indexable route set (a script diff is empty). Each `<loc>` returns 200 and has a self-referencing canonical.

**7b.10 `robots.txt` policy by purpose (S10). D12 settled.** Replace the single `User-agent: *` block with one block per purpose, as settled in D12: allow Googlebot, OAI-SearchBot, PerplexityBot, Claude-SearchBot, and user-triggered fetchers; disallow GPTBot, ClaudeBot, CCBot, and Google-Extended. Add `Disallow` for `/admin.html`, `/dashboard.html`, `/user-dashboard`, `/login`, and `/signup`. Keep the `Sitemap:` line. Vendor caveat from the audit: user-triggered fetchers may not honour `robots.txt`, so do not treat it as an access control.
- Validator: `seo_audit.py` reports named AI bots (`ai_bots_mentioned` is no longer `none`). `curl /robots.txt` contains each bot named in D12. A test checks that each route in D12 is allowed or disallowed as recorded.

**7b.11 Machine-readable content for agents (S11). Depends on D13.** Keep `llms.txt` and `llms-full.txt`. Generate both from the same sources as the pages (`pricingData.ts`, the route list, docs), not from hand-maintained copies. If D13 = (b), serve Markdown on the same canonical URL with `Vary: Accept`. Google's own guidance requires no special file for Search. These files serve non-Google agents, and this plan claims no ranking effect from them.
- Validator: a script compares prices in `llms-full.txt` with `pricingData.ts` and reports no differences. Every link in `llms.txt` returns 200.

**7b.12 SEO checks in CI (with 4b.4).** Convert `seo-raw-check.sh` from a printed report into assertions that exit non-zero. The CI job builds, starts the production server, and checks status codes (7b.1), `noindex` on app routes (7b.2), sitemap-to-route equality (7b.9), and the OG image type (7b.6).
- Validator: a deliberate canonical change, or deleting `public/og-image.png`, turns the job red.

**7b.13 Owner-only steps (agents do not do these).** Search Console and Bing Webmaster verification, sitemap submission, and entity details (D15) need owner accounts. They are recorded in 10.7.

Exit criterion: 7b.1, 7b.2, 7b.4, 7b.6, 7b.8, and 7b.12 pass in CI now. 7b.3, 7b.5, 7b.7, 7b.9, 7b.10, and 7b.11 pass after D11–D15 are recorded. Findings S1–S9 are closed or accepted in writing.

## 11. Phase 8: Observability and operations

**8.0 SLOs and error budgets (sre-engineer).** Define the SLIs and targets from D16 (settled: availability 99.5% over 30 days; latency target set after the 10.3 load test): availability (share of non-5xx responses on `/` and the engine API) and latency (p95 of the engine routes). Calculate the error budget from each target (for example, 99.9% over 30 days allows 43.2 minutes of downtime). Write the error-budget policy: when the budget is spent, non-critical releases pause until it recovers.
- Validator: `docs/ops/slo.md` lists each SLI query, target, and budget. The alert rules file `docs/ops/alerts.yml` passes `promtool check rules docs/ops/alerts.yml` in CI (install `promtool` in the job).

**8.1 Health probes.** Keep `/api/v1/system/health` as liveness. Add readiness that checks configured dependencies (Mongo if configured, Redis if configured, Firebase Admin init).
- Validator: readiness returns 503 when a configured dependency is unreachable.

**8.2 Error tracking (D10).** Add the chosen tracker, with PII scrubbing and release tagging.
- Validator: a deliberate error in staging appears in the tracker with the release tag.

**8.3 Metrics and alerts.** Track request rate, 5xx rate, p95 latency for the engine routes, rate-limit rejections, webhook failures, and queue or SSE subscriber counts. Use `prom-client` (not yet a dependency) with route templates such as `/api/v1/engines/:engine` as labels, never raw paths, so label cardinality stays bounded. Use multiwindow burn-rate alerts from 8.0 (fast: 14.4× the budget rate over 1 h and 5 m; slow: 1× over 6 h). Every alert links to a runbook section; an alert without one is not shipped (sre-engineer).
- Validator: a staged 5xx burst triggers the alert.

**8.4 Log retention and access.** Define retention, who can read logs, and redaction (3.12).
- Validator: runbook section exists; a log sample contains no secret or cookie.

**8.5 Uptime monitor.** External check on the public URL and `/api/v1/system/health`.
- Validator: monitor reports up for 24 h on staging.

**8.6 Runbook.** Write `docs/ops/runbook.md`: deploy steps, rollback steps (previous image or artifact, plus the database migration policy), incident response, on-call contacts, the decisions log (D1–D16), a blameless postmortem template, and a toil log (sre-engineer).
- Validator: a dry-run rollback on staging is recorded with timestamps.

Exit criterion: 8.0–8.6 validators pass.

## 12. Phase 9: Repository hygiene

Each item needs owner classification (`[ASK USER]` #12 and #13) before deletion.

- **9.1** Classify the 52 root-level one-off scripts (codemods). Settled (Q11): move the codemods to `archive/codemods/`, after confirming none is referenced by `package.json` or CI.
- **9.2** Settled. HazardNet files removed completely (Q18b, 2026-10-19): the notebook, and the HazardNet seed entry in `src/lib/firebase.ts` (`INITIAL_MONITORED_SITES`). Also move `workspace/refactor_colors.sh` to `archive/` (Q18), and delete the empty `ui-ux-pro-max-skill/` (Q11). `patch.css` is not yet classified.
- **9.3** Remove dead Next.js and Prisma leftovers (`next.config.ts`, `app/`, `archive/legacy-next/`, the `prisma` entry in `tsconfig.json`) after confirming nothing imports them.
- **9.4** Resolve duplicate engine implementations per D7. Update `docs/ENGINES.md` to match. Remove the Python engine map (`server/core/enginesCatalog.ts`, `server/routes/engines.ts` ~261–268) if no script exists.
- **9.5** Split large modules over time, starting with the most-changed. `src/lib/firebase.ts` (1914 lines) and `src/lib/nodeEngines.ts` (939 lines) first, one domain per change.
- **9.6** Correct stale docs: `README.md` claims (0 type errors, 177 tests, `PRODUCTION_READINESS_AUDIT` link), and `CODE_REVIEW.md` line references.
- **9.7** Complete `.env.example` and remove the README `VITE_FIREBASE_*` section (never read by code).
- **9.8** Reduce `as any` and `@ts-ignore` in touched files only.

Validator: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` all still pass after each deletion, and the file count of the root is recorded before and after.

## 13. Phase 10: Release

**10.1 Staging.** Deploy the release candidate to staging with production-like configuration (D3 target, real gateway in test mode, real Firebase project in a non-production instance).
- Validator: a diff of environment variable names between the staging and production templates is empty, or each difference is listed with a reason in the release checklist.

**10.2 Smoke suite.** Write a Playwright suite (`e2e/smoke/`) covering: landing page, sign-up and log-in, dashboard, one engine audit, pricing page and checkout entry, the payment sandbox flow (2.4), legal pages (`/terms`, `/privacy`, `/refund`, `/cookies`), the health endpoint, the 404 page with a 404 status (7b.1), `noindex` on `/login` and `/dashboard` (7b.2), and `/robots.txt`, `/sitemap.xml`, and `/llms.txt` returning 200. Require 0 console errors except the allowlisted third-party ones.
Configure `trace: 'on-first-retry'` and `screenshot: 'only-on-failure'`. Use role-based locators (`getByRole`, `getByLabel`). No `waitForTimeout` (playwright-expert).
- Validator: `grep -rn "waitForTimeout" e2e/` returns nothing; `npx playwright test --repeat-each=5` passes against staging; the suite then passes three consecutive full runs.

**10.3 Load test.** Test the engine audit route and the telemetry ingest route at the expected peak. Set the target p95 and error rate before the test, not after. Record the results.
Use k6 (the monitoring-expert pattern), with the thresholds written into the script before the run: `p(95)` below the D16 latency target and `http_req_failed` rate below the D16 error threshold.
- Validator: the k6 run exits 0 with those thresholds, sustained for 10 minutes at peak.

**10.4 Security re-check.** Re-run the Phase 3 regression tests, `npm audit`, and a header check on staging (`curl -I` for CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy`).
- Validator: no Critical or High finding without a written exception.

**10.5 Go/no-go checklist.** Create `docs/release/checklist.md` with every gate in this plan, its command, its result, and the owner's sign-off. Include the decision log.
- Validator: each row is either checked with evidence or has an owner exception.

**10.7 Search Console and Bing Webmaster (owner).** After deployment, the owner verifies both properties, submits the sitemap, and reviews coverage at day 14 and day 28. Agents do not perform these steps.
- Validator: the exported coverage report shows 0 soft-404 entries and 0 canonical-choice mismatches for the sitemap URLs.

**10.6 Production deploy and 72-hour watch.** Deploy with the runbook. Keep the rollback artifact ready. Watch error rate, latency, and alerts for 72 hours.
- Approval gate (devops-engineer): the owner signs the release checklist (10.5) before any production deploy command runs. No production deploy on a Friday unless the owner accepts the 72-hour watch.
- Validator: the checklist has the owner's signed approval row before the deploy timestamp, and no rollback trigger was hit during the watch window (trigger defined in 8.6).

Exit criterion: 10.1–10.7 complete, and the goal in §0 is met as stated.

## 14. Order of work for the next two weeks

1. Day 1: owner answers D1–D16 (Phase 1). Start 4b.1 and 4b.2 (they are small and unblock everything). Start 7b.1, 7b.2, 7b.4, 7b.6, and 7b.8, which need no decision.
2. Days 2–3: 4b.3–4b.8, 2.1 (pricing parity), and 3.13 (secret scan, a cheap first check). Add the payment webhook tests (2.2 test-first).
3. Days 4–6: 2.2–2.4 (paid activation and sandbox). Phase 3 items 3.1–3.4 and 3.12.
4. Days 7–9: Phase 3 remainder, Phase 4 items that D3 requires, Phase 5.1–5.3, and 8.0 (SLOs, once D16 is answered).
5. Days 10–12: Phase 5.4–5.8, Phase 7b.3, 7b.5, 7b.7, 7b.9–7b.11 (once D11–D15 are recorded), Phase 8.1 and 8.6 (runbook draft), Phase 6 with counsel.
6. Days 13–14: staging, smoke suite, load test, go/no-go.

Phase 7 and Phase 9 run in parallel where capacity allows and do not block release unless the owner says so.

## 15. Known risks to this plan

- **Payment and legal decisions are outside code.** A single unanswered D2 or counsel item blocks Phase 2 or Phase 6.
- **Node 20 CI.** If D5 keeps CI on Node 20 while the project requires 24, the release gates can pass in CI and fail in production. Phase 4b.4 fixes this.
- **Single-process assumptions.** Several controls are in memory. If D3 is multi-instance and 4.1 is skipped, rate limits and API keys will not hold.
- **Sandbox limits.** Google Fonts, Pexels, and Firestore are blocked in the build sandbox, so network-dependent timing and some Firebase behaviour are not measured.
- **Prerendering changes the build (D11a).** It adds a build step and a hydration risk. It needs the same staging checks as 10.2.
- **Search results are not testable here.** The sandbox cannot show indexing or ranking. Item 10.7 measures them after deployment. This plan promises no ranking outcome.
- **Skill statistics are unverified.** The SEO and AEO skills quote lift figures without primary sources. This plan does not use them, and copy should not cite them either.
- **Governance files.** `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.github/copilot-instructions.md`, and `.github/CODEOWNERS` are owned by @me-aas and may need owner edits for the CI or process changes in 4b.4.
- **Skill installation.** `npx skills add https://github.com/jeffallan/claude-skills -y -g` installed 67 skills to `~/.agents/skills`. Some agent targets rejected global installs; the canonical copies exist. The skills are method guides, not sources of fact.
- **Skill availability.** The requested `create-plan` skill does not exist in `openai/skills` (43 skills, none named create-plan). This plan was written without it. The `define-goal` skill was installed to `/home/user/.agents/skills/` (outside the repo) and used only for the goal statement in §0.

## 16. Pre-mortem (the-fool, failure-mode method)

The skill normally asks for an interactive mode selection. This section runs its pre-mortem mode directly, because the revision was requested as a plan update. The owner can ask for another mode (for example, red team on §5).

**Steelmanned thesis.** The plan hardens payments, security, and state first, then ships one reproducible artifact after a staging proof. Every gate has a command and an owner, so a launch cannot pass on opinion.

**Strongest objection.** The schedule. Sixteen owner decisions and the full item list in two weeks is ambitious. The response is in §14: no-decision work starts on day 1, and slippage moves a phase, not a gate.

**Failure narratives, ranked by impact**

1. **Duplicate entitlements after a webhook retry.** Gateway events arrive twice or out of order and grant a plan twice or downgrade a paid account. Early signal: sandbox logs show two subscription writes for one gateway event ID. Mitigation: 2.2 idempotency and ordering tests, plus a replay fixture run before any live key is set.
2. **A launch that search and AI engines cannot read.** Soft 404s and JavaScript-only content stay in place. Early signal: Search Console reports soft 404s or "crawled, not indexed" at day 14. Mitigation: 7b.1–7b.4 before launch; D11 decided before 7b.3.
3. **Rate limits that reset on every deploy or instance.** In-memory state lets callers exceed limits across restarts or behind a load balancer. Early signal: 429 counts drop to zero after each deploy. Mitigation: 4.1 if D3 is multi-instance, and its two-instance test.
4. **Legal copy that promises what the product does not do.** Deletion, export, or retention claims the code does not meet. Early signal: a deletion request the product cannot fulfil. Mitigation: 6.2 claims table; 6.3 and 6.4 built or removed before publication.
5. **Staging passes while production fails.** Different secrets, no Redis, untested Firestore rules. Early signal: environment variable names differ between the staging and production templates. Mitigation: a 10.1 parity diff in the release checklist.
6. **Performance regresses after the next visual change.** The backdrop blur or blob effects return. Early signal: Lighthouse CI budget failures in the first week. Mitigation: 7.5 budgets in CI.
7. **Alerts that page nobody, or everybody.** Early signal: alert volume in the first week, or alerts with no runbook. Mitigation: 8.0 burn-rate alerts, runbook links, and the alert review in the postmortem template.
8. **Decisions that take longer than the schedule.** Early signal: rows in `docs/plan/decisions.md` still pending on day 3. Mitigation: §14 runs no-decision work first.

**Inversion check (how to guarantee a failed launch).** Deploy from a laptop; use the `latest` tag; keep secrets in an env file; skip staging; merge without CI; launch without a rollback artifact; accept a Critical finding without a written exception; publish legal copy with `[ASK USER]` markers. Each one is blocked by a gate above: 5.1 (image tags), 3.11 (secret store), 10.1 (staging), 4b.4 (CI), 10.6 (rollback and approval), 3.14 and 3.15 (findings), and 6.1 (markers).

**Output.** The pre-mortem adds no decision beyond D16. Of the eight narratives, one gap had no gate (environment parity between staging and production); it is now the validator in 10.1. The others map to existing items, which the narratives cite.
