# Reaudit — CatalystLab (`arena/01a06478-catalystlab`)

> **Superseded (2026-09-05):** see [`PRODUCTION_READINESS_AUDIT.md`](./PRODUCTION_READINESS_AUDIT.md) for the current findings and the fixes applied in this pass (hard gates are now green; trial/entitlement provisioning is server-side; legacy `app/`/`api/` and root `fix_*` scripts are archived).

**Verdict: Request Changes**

The previous Critical/Major/Low pass landed most of the intended controls (`tsc` clean, 175/175 tests). This reaudit checks those fixes on disk and looks for leftover holes. Original C1–C6 are largely closed; **two Critical items remain** (one is an incomplete C4, one is a new ACL bypass against the Pro-only blog constraint). Dual `app/`+`src/` merge is still deferred.

---

## Original findings — status

| ID | Finding | Status |
|----|---------|--------|
| C1 | Firestore email-allowlist superadmin | **Fixed.** Claims only. |
| C2 | Entitlements `.where('userId')` | **Fixed.** `user_subscriptions/{uid}`. Residual: no `ownerId`/`status` check (Major). |
| C3 | Discord `test-discord` ungated | **Fixed.** `requireSuperadmin`. |
| C4 | GitHub unauth in-memory bus | **Partial.** Identity required, HMAC webhook intact, secrets via `crypto.randomBytes`. **New-repo `ownerId` is still `'usr_default'`**; list/SSE/delete still leak across tenants. |
| C5 | Markdown + public HTML XSS | **Partial.** `sanitizeHref` + `xss-guard.js` when loaded. Fallback path and dashboard `host` interpolation still XSS. |
| C6 | Public `reports/{id}` get | **Fixed.** Owner / superadmin / `public == true`. |
| M1 | `limit: null` → 50 | **Fixed.** Early unlimited return. |
| M2 | Authz open off-prod | **Fixed.** Default-deny; demo only `ALLOW_UNAUTH_DEMO=true` && not production. |
| M3 | Bearer as API key | **Fixed.** `x-api-key` only. |
| M4 | Spoofable XFF on RL | **Fixed** on rate-limit + client-logs. Telemetry still trusts XFF/CF headers (Major residual). |
| M5 | In-memory RL vs Upstash | **Fixed** (optional Upstash). |
| M6 | Mock 92-score engines | **Partial.** Live parse on master/compare; CI-CD/webhook-test 501. `/api/v1/reports*` still hardcodes 92. |
| M7 | Dual `app/` + `src/` | **Open** (deferred). `app/`, `api/` still on disk. |
| M8 | 401 vs 403 | **Fixed.** |
| L1 | DRY claims | **Fixed.** `isSuperadminClaim`. Empty `SUPERADMIN_EMAILS` export remains. |
| L2 | `Math.random` secrets | **Partial.** API keys server-side use CSPRNG; client `generateSecureApiKey` still `Math.random`. |
| L3 | CSP `imgSrc http:` | **Fixed.** |
| L4 | Mongo empty-200 | **Fixed** (503). |
| L5 | Role simulator | **Fixed** (DEV-only). |
| Blog | Pro/superadmin only | **Broken.** Client may write `trialing`+`pro` and then `canPublishBlog()`. |

---

## Remaining Critical

### R-C1 — Any signed-in user can grant themselves Pro (trial) and publish blogs

`firestore.rules` `isClientSafeSubscription` allows the client to `create`/`update` `user_subscriptions/{uid}` with `status == 'trialing'` and `planId in ['starter','pro','team']`.

`src/lib/firebase.ts` `startUserTrial()` does exactly that (default `planId: 'pro'`).

`canPublishBlog()` treats `planId in ['pro','team','enterprise']` + `status in ['active','trialing']` as a publisher.

**Impact:** Free users self-trial to Pro and pass both Firestore blog rules and `feature:write_blogs` (trial maps to Pro in `resolveUserRole`). Violates the production multi-tenant rule: only paid Pro+ and superadmin may publish.

**Fix direction:** Do not treat `trialing` as sufficient for `canPublishBlog`, or require a server/admin write for trial documents (remove client `trialing` from `isClientSafeSubscription` except `starter` if product still wants a gated trial). Paid `active` plans must remain server-only (already true).

### R-C2 — GitHub in-memory tenancy still collapsed to `usr_default`

`POST /api/v1/integrations/github/repos` still sets `ownerId: 'usr_default'` (the identity assignment did not stick).

Consequences:

- `GET /repos` and `GET /events` include every `usr_default` record for every authenticated uid.
- `DELETE /repos/:id` does not check owner — any identity can disconnect any repo.
- SSE broadcast treats `usr_default` as visible to everyone (`event.ownerId !== uid && event.ownerId !== 'usr_default'`).
- Demo path with no uid returns **all** repos.

**Fix direction:** `ownerId: getAttachedIdentity(req)?.uid`; filter strictly by uid (no `usr_default` wildcard); DELETE/test-payload must match owner.

---

## Remaining Major

### R-M1 — XSS fallbacks in `public/*.html`

When `/xss-guard.js` is missing, engine pages still assign unescaped `coloredOutput` (regex on raw `data.output`) to `innerHTML`.

`dashboard.html` interpolates unescaped `host` into HTML and into `onclick="deleteSavedAudit('${report.id}', '${host}')"`. `getEngineBadge(report.engine)` injects `engine` into HTML.

HTML-escaping `photoURL` does not block `javascript:` in `img src`.

### R-M2 — Entitlements ignore `ownerId` and `status`

`fetchEntitlements` accepts any `planId` on `user_subscriptions/{uid}` including `canceled` / `expired`. Should require `ownerId == uid` and `status in ['active','trialing']`.

### R-M3 — Telemetry IP spoofing

`server/routes/telemetry.ts` still uses `cf-connecting-ip` / `x-forwarded-for` / `x-real-ip` without `TRUST_PROXY`. Visitor hashing and geo can be rotated.

### R-M4 — Dual trees

`app/` and `api/` (including `app/api/scan/stream/route.ts` with untrusted XFF) remain beside the Vite/Express app.

### R-M5 — `ALLOW_UNAUTH_DEMO` on any non-production runtime

Vitest sets the flag (correct). Staging with `NODE_ENV=development` and the same env var opens GitHub, Discord, API keys, and notifications without Firebase. Production is safe; mis-set staging is not.

### R-M6 — Demo report/blog HTTP API still fake scores

`/api/v1/reports`, permalink, export still return score 92. Not a privilege bypass, but still the original M6 surface.

---

## Remaining Low

| ID | Note |
|----|------|
| R-L1 | `sanitizeHref` allows `http:javascript:…` because `https?:` matches before scheme denylist. |
| R-L2 | Client API-key generator still `Math.random`. |
| R-L3 | GitHub webhook fallback commit ids still `Math.random`. |
| R-L4 | `contact_inquiries` create is unauthenticated (spam). |
| R-L5 | `match /test/{testId} { allow get: if isValidId }` is public. |
| R-L6 | Deprecated empty `SUPERADMIN_EMAILS` export; seed blogs still use personal emails (content only). |
| R-L7 | Reports create still allows `ownerId == 'guest'` while signed in; `public` is an unconstrained extra key (5–12). |
| R-L8 | Anomaly notify in non-production does not require superadmin. |

---

## What is solid

- Superadmin is claim-only on rules, `attachIdentity`, `AuthContext`, `AdminRoute`.
- Rate limiter: unlimited skip, `x-api-key` only, XFF gated by `TRUST_PROXY`, optional Upstash.
- Helmet CSP `imgSrc` is https-only; Mongo errors 503.
- Markdown renderer drops `javascript:` / `data:` / `vbscript:` / protocol-relative hrefs.
- Starter role has no `feature:write_blogs`.
- Engine scan path still SSRF-guarded.

---

## Priority if another fix pass

1. Stop client `trialing` Pro from unlocking `canPublishBlog` (R-C1).
2. Stamp GitHub `ownerId` from verified uid; owner-check DELETE; drop `usr_default` wildcard (R-C2).
3. Fail closed on missing `xss-guard`; escape `host` / engine / onclick args (R-M1).
4. Entitlements: `ownerId` + active/trialing only (R-M2).
5. Telemetry IP behind `TRUST_PROXY` (R-M3).
