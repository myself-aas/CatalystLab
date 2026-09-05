# Code-review fix reports (chronological)

> **Superseded (2026-09-05):** see [`PRODUCTION_READINESS_AUDIT.md`](./PRODUCTION_READINESS_AUDIT.md) for the current status and the production-readiness fixes applied this pass.

Each item is the original finding, what changed, and how to verify.

## Critical

### C1 — Firestore superadmin via email allowlist
**Issue:** `isSuperAdmin()` / `hasSuperAdminClaim()` treated four hardcoded emails as admin, so a spoofed or compromised Google account with those addresses bypassed claims.
**Fix:** Superadmin is exclusively `request.auth.token.role == 'superadmin'` or `token.superadmin == true`. Email lists removed from `firestore.rules`.
**Verify:** Rules no longer mention `shuvo*` emails; unauthenticated or claim-less users cannot write privileged collections.

### C2 — Entitlements query `userId` vs `ownerId` / document id
**Issue:** `fetchEntitlements` queried `user_subscriptions` with `.where('userId', '==', uid)`, missing the real doc keyed by uid / `ownerId`.
**Fix:** `src/lib/serverAuth.ts` reads `user_subscriptions/{uid}`. Vitest mock updated to `.doc().get()` with `{ exists, data }`.
**Verify:** `phase1Hardening.test.tsx` “maps Firestore subscription docs…” passes with `plan: 'pro'`.

### C3 — Discord `test-discord` ungated
**Issue:** `/api/notifications/webhook/test-discord` posted to caller-supplied URLs without auth.
**Fix:** Same `requireSuperadmin` gate as Slack/email (demo only when `ALLOW_UNAUTH_DEMO=true` and not production).
**Verify:** Production without identity → 401; signed-in non-admin → 403.

### C4 — GitHub unauthenticated in-memory bus
**Issue:** List/create/stream/events were public; webhook secrets used `Math.random`; SSE broadcast to every subscriber.
**Fix:** `requireIdentity` on all GitHub routes except HMAC webhook. `ownerId` from verified uid. `crypto.randomBytes` for secrets. SSE `Map<Response, uid>` filters events.
**Verify:** `api.test.ts` GitHub suite still 200 under test `ALLOW_UNAUTH_DEMO`; webhook HMAC tests unchanged.

### C5 — Markdown / public HTML XSS
**Issue:** Markdown `[text](javascript:…)` and `public/*.html` interpolated engine output / URLs into `innerHTML`.
**Fix:** `sanitizeHref` in `MarkdownRenderer` (http/https/mailto/relative/# only). Shared `public/xss-guard.js` (`CLEscape` / `CLColorize`) included from static pages; interpolations escaped before colorize.
**Verify:** `javascript:` links render as text; terminal output with `<script>` is escaped.

### C6 — Public `reports/{id}` get
**Issue:** Any client could `get` any report by id.
**Fix:** `allow get` only for owner, superadmin, or `resource.data.public == true`.
**Verify:** Guest get of a private report is denied.

## Major

### M1 — Superadmin `limit: null` coerced to 50
**Issue:** `identity.limit || FREE_USER_DAILY_UNITS` charged unlimited admins.
**Fix:** Early return in `evaluateAndChargeRateLimit` when `limit === null` (no burst, no units).
**Verify:** Superadmin identity: `allowed: true`, `limit: null`, `unitsRemaining: Infinity`.

### M2 — Authz open off-production
**Issue:** `requireIdentity` / `requireSuperadmin` no-op unless `NODE_ENV=production`.
**Fix:** Default-deny. Demo skip only if `ALLOW_UNAUTH_DEMO=true` **and** not production. 401 anonymous / 403 non-admin. Aliases kept.
**Verify:** `src/tests/setup.ts` sets `ALLOW_UNAUTH_DEMO` for vitest; production ignores the flag.

### M3 — Bearer treated as API key
**Issue:** `Authorization: Bearer` was parsed as `cat_live_` keys, colliding with Firebase ID tokens.
**Fix:** API keys accepted only via `x-api-key`.
**Verify:** Bearer without a verified token stays visitor; `x-api-key: cat_live_…` still maps to `api_pro` when allowlisted.

### M4 — Untrusted `X-Forwarded-For`
**Issue:** Client-supplied XFF reset visitor rate-limit buckets.
**Fix:** Honor XFF only when `TRUST_PROXY=true`. Express `trust proxy` matches. Client-log sink aligned.
**Verify:** `rateLimit.test.ts` separates IPs via `socket.remoteAddress`.

### M5 — In-memory rate limit vs Upstash
**Issue:** Multi-instance deployments did not share quotas.
**Fix:** Optional `@upstash/ratelimit` when `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` are set; production fail-closed if Redis errors. Tests stay in-memory.
**Verify:** Unset env → no Redis calls; set env → sliding-window 120/min on identifier.

### M6 — Mock 92-score APIs
**Issue:** Master audit / compare / CI-CD / webhook-test returned hardcoded scores.
**Fix:** Master composite and compare scores parsed from live engine output (or `null`). CI-CD evaluate and webhook test return **501** instead of fake 92.
**Verify:** Compare no longer returns `score: 92` without an engine run.

### M7 — Dual `app/` + `src/` trees
**Issue:** Leftover Next.js `app/` / `api/` alongside Vite `src/`.
**Fix:** Deferred — architectural merge, out of this security pass as previously scoped.

### M8 — 401 vs 403
**Issue:** Missing vs insufficient privilege collapsed to one status.
**Fix:** `requireSuperadmin`: 401 if no uid, 403 if uid but `!isSuperadmin`.

## Minor / Low

### L1 — DRY superadmin claims
**Fix:** `src/lib/authClaims.ts` `isSuperadminClaim()`. Used by `AuthContext` and `AdminRoute`. `SUPERADMIN_EMAILS` is an empty deprecated export.

### L2 — `Math.random` secrets
**Fix:** GitHub webhook secrets and API keys use `crypto.randomBytes`.

### L3 — CSP `imgSrc http:`
**Fix:** Helmet `imgSrc` is `'self'`, `data:`, `blob:`, `https:` only.

### L4 — Mongo empty-200
**Fix:** DB-offline handler always **503** JSON (no fake empty GET arrays).

### L5 — Role simulator
**Already DEV-only** (`import.meta.env.DEV`); no production change.

## Product constraint — blog publishing

Only **Pro / Team / Enterprise** (active or trialing `user_subscriptions/{uid}`) and **superadmin claims** may create/update/delete `blogPosts` / `blogs`. Starter maps to `user` and does **not** get `feature:write_blogs`. Firestore `canPublishBlog()` + existing `ProtectedRoute` `minPlan="Pro"`.
