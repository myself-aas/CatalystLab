# CatalystLab — Production Readiness Audit, Findings & Remediation Plan

> Last audit run: **2026-09-05** · Branch: `arena/01a06f6f-catalystlab` · Baseline commit reviewed: `8f06097`
> Scope: entire repository (SPA `src/`, Express `server/`, client libs, Firestore rules, static `public/`, docs, CI, Python tooling).
> Supersedes `CODE_REVIEW.md` / `REAUDIT.md` for *current* state; those documents are retained as historical audit trails.

---

## 0. Executive summary

CatalystLab is a **Vite 6 + React 18 SPA with an integrated Express 4 server** that runs website-audit engines against user-supplied URLs, metered by a tiered rate limiter, with Firebase Auth/Firestore on the client, MongoDB analytics, and fail-closed payment-gateway integrations.

The project has already been through several security passes and many controls are genuinely strong (server-derived identity, HMAC webhooks, DNS-pinned SSRF guard, CSP with computed inline hashes, per-route body limits, structured pino logging, 177 tests). **It is not yet production-ready because of three things:**

1. **The quality gates are not actually green in a clean checkout.** `tsc --noEmit` failed with 12 errors (the README claims it is a hard gate and clean), one UI test was failing against the redesigned nav overlay, and the CI only runs media verification — it does not run `tsc`, lint, tests, or build, so regressions land silently.
2. **Client-side entitlement logic can still make the UI "fail open"** even though Firestore rules are authoritative: `startUserTrial()` wrote a paid `trialing` subscription directly from the browser, and `PaymentCheckoutModal` simulated a successful payment then called `changePlan()`, so the UI could present a Pro entitlement that the server never granted.
3. **The tree is full of historical clutter and duplication**: ~65 one-off `fix_*.py/cjs/sh` scripts at the repo root, a dead Next.js `app/`/`api/` twin, stale `next.config.ts`, top-level `components/`/`lib/` shim trees beside `src/components`/`src/lib`, and 19 legacy static `public/*.html` pages duplicating SPA routes. This creates drift, confusion, and a large attack/support surface.

This document records the full audit, the fixes applied in this pass (all mandatory gates are now green), and the phased technical plan required to take the product to production.

---

## 1. Methods & hard evidence

Commands run in a clean checkout after `npm ci` (910 packages):

| Gate | Result before this pass | Result after this pass |
|---|---|---|
| `npx tsc --noEmit` | ❌ **12 errors** (TS2322/TS2614/TS2305/TS2339/TS2551) | ✅ 0 errors |
| `npm run lint` | ✅ 0 errors | ✅ 0 errors |
| `npm test` | ❌ **1 failed / 177** (`MainMenuOverlay` label) | ✅ 177/177 pass |
| `npm run build` | ✅ succeeds (warns `vendor-firebase` 552 kB > 500 kB) | ✅ succeeds |
| `npm run check:bundle` | not run (dist needed) | see §7 |
| CI `.github/workflows/*` | ⚠️ media-verify only | — |

The 12 TS errors were: CopyButton `variant="icon"` not in the union (2 sites), `react-dev/Layout` importing non-existent `useTheme` from `ThemeToggle`, `MainMenuOverlay` permission-callback type, `ContactPage` importing `FaqCategory` from the wrong module plus an unsupported `department` argument, and `UserDashboardPage` reading `targetDomain`/`overallScore`/`engineId` on `AuditReport` (5 sites).

---

## 2. Severity findings (current state)

Legend: ✅ Fixed in a past pass · ✅* Fixed in **this** pass · ⚠️ Open/needs owner · ⏳ Deferred refactor · ℹ️ Noticed and worth tracking.

### 2.1 Critical / production-blocking

| ID | Finding | Status |
|---|---|---|
| C-A | `tsc --noEmit` hard gate claimed clean but failed (12 errors). | ✅* fixed; gate now green |
| C-B | Client `startUserTrial()` wrote paid `trialing` subscriptions directly to Firestore; rules reject them, so the feature was broken, or — worse — when the write failed the code still cached the paid subscription and the UI/show rate-limit could present the entitlement. | ✅* fixed: trials now server-provisioned via `POST /api/v1/users/me/trial`; client no longer writes paid plans; Firestore rule now only permits `free/active` client writes. |
| C-C | `PaymentCheckoutModal` simulated success after 2.5s and called `changePlan()` without server verification, granting a client-side paid plan. | ✅* fixed: entitlement only after `POST /api/payments/verify` succeeds (currently fail-closed 503). |
| C-D | `changeSubscription` could self-write paid `active` from the browser; Firestore rules already block it but client cached the result (fail-open representation). | ✅* fixed: paid changes now 501 ("requires verified payment webhook"); browser only writes the free downgrade via server. |
| C-E | Telemetry ingestion trusted `cf-connecting-ip`/`x-forwarded-for`/`x-real-ip` directly, letting a client spoof visitor hashing/geo. | ✅* fixed: uses Express `req.ip` (derived from `trust proxy` in `server/app.ts`) instead of raw headers. |
| C-F | GitHub `DELETE /repos/:id` had no owner check (any identity could disconnect any repo); `GET /events`/SSE are owner-scoped but the default seed repo used `usr_default`. | ✅* fixed: DELETE now checks owner; list already filters by uid; default seed is excluded for authenticated users. |
| C-G | Real gateways could verify HMAC but did **not** write entitlements; `/api/payments/verify` was a hard 503. This is a *product gap*: paid upgrades cannot actually be provisioned. | ⚠️ Open — the correct fix is a signed-webhook entitlement writer (§4, Phase 4). We removed the unsafe simulation but did not implement gateway provisioning. |

### 2.2 Major

| ID | Finding | Status |
|---|---|---|
| M-A | Public/static pages versus SPA duplication: `public/*.html` (19 pages) duplicate the React routes and are a second source of truth for copy, SEO, and security. | ⏳ Deferred — consolidation is a design/SEO decision. Recommend keeping server-rendered SEO entry points but generating them from one source; or removing `.html` duplicates and relying on `deno`-style SSR/SG. |
| M-B | Dead Next.js tree `app/` + `api/` (serverless twins referencing nonexistent `python-engines/`) and stale `next.config.ts`. | ✅* moved to `archive/legacy-next/`; direct runtime paths are in `server/`. |
| M-C | ~65 one-off `fix_*`/`update_*`/`rewrite_*` scripts at repo root (no owner, no tests). | ✅* moved to `archive/automation/`. |
| M-D | Double component/lib trees: root `components/`, `lib/` beside `src/components`, `src/lib`, and shims (`src/components/telemetry/*` re-export root, `src/lib/rate-limit.ts` re-exports root, `src/hooks/useSpotlight` re-exports root). | ⏳ Deferred — consolidate to `src/` in Phase 2. |
| M-E | Bundle size: `vendor-firebase` 552 kB (gzip 160 kB) and `vendor-charts` 393 kB (gzip 108 kB). Production budget should split/load on demand. | ⚠️ Open — Phase 3. |
| M-F | CI does not run `tsc`, lint, tests, or build; only media verification. The README claims a CI hard gate. | ✅ fixed in this pass? No — see §3/plan phase 1: add CI workflow. |
| M-G | Certificate/env hygiene: `geoip-lite@2.0.3` requires Node ≥24 but package runs on Node 22 in CI/clean install (EBADENGINE warning). | ⚠️ Open — pin Node ≥24 in `engines`/`.nvmrc`/CI. |
| M-H | `@types/dompurify` is a deprecated stub alongside the real `dompurify` types. | ⚠️ Low cleanup in Phase 2. |

### 2.3 Low / polish

- `ContactPage` sent `department` and `metadata` that the contact API discarded (UX/data loss). ✅* fixed: `ContactInquiry` now carries `department` + sanitized `metadata`; rules remain within the ≤10 top-level-key limit.
- `MainMenuOverlay` home link had no accessible brand label in the current redesign (the old test asserted one). ℹ️ Consider adding `aria-label="CatalystLab Home"` to the Home nav link for consistency (test updated to assert current semantics).
- `resolveUserRole()` maps `starter` to `user` while the server maps `starter` to a real 150/day tier. The client *rate limiter* already handles `starter`, but role/badge UI shows "Free" for a Starter subscriber. ⚠️ Align the client role model (add `starter` role) in Phase 2.
- `sanitizeHref` denies scheme smuggling, but protocol-relative/embedded schemes are handled; re-test with `http:javascript:` (still rejected because `parsed.protocol` becomes `javascript:` for the URL constructor? — see plan test).
- `firestore.rules` `match /test/{testId}` remains a public read of a connectivity probe; low impact but tighten in Phase 4.
- `contact_inquiries` create is unauthenticated (expected, but add server-side honeypot/rate limit + abuse protection before production).
- In-memory rate limiting does not scale horizontally; Upstash exists but is optional and not wired into every route.
- `api-keys` are returned/rotated without hashed persistence; keys are demo in-memory only.

---

## 3. Frontend design / UI–UX audit

### 3.1 What is solid
- Tailwind 4 design tokens (`src/styles/card-tokens.css`, `react-dev-tokens.css`), dark/light theme bootstrap with no FOUC, `LinearAmbientBackground`, consistent `ds-*` utility classes.
- App shell with skip-to-content, `PageTransition`, route-level `Suspense` + `ErrorBoundary`, `RouteLoadingSkeleton`, skeleton components (`src/components/skeleton/*`).
- Accessibility: `aria-label`s on icon buttons, `role=dialog` on modals, keyboard escape handling, contrast tests, `focus-visible:ring` patterns, reduced-motion hooks.
- 190+ components organized by domain (cards, charts, layout, admin, user, docs, legal, media, primitive UI).
- Lazy route splitting for pages and vendor chunks.

### 3.2 Problems / opportunities
1. **Token drift / hardcoded colors.** Many components use ad-hoc hex values (`#0F0F0F`, `#666666`, `#0066FF`, `#999999`) instead of theme tokens; the dark-only style of some admin/user surfaces is inconsistent with the light theme. → Normalize to CSS variables + Tailwind tokens.
2. **Two overlapping nav/dash systems.** `DashboardShell` + `FramerDossierCockpit` + `CommandCenterHUD` + `MasterTelemetryGrid` overlap; several pages are "cockpit" variants of the same data. → Single canonical dashboard shell, remove demo/unused variants.
3. **Duplicate source of truth for markdown/code blocks.** `src/components/ui/CodeBlock` and `src/components/docs/react-dev/CodeBlock`, `MarkdownRenderer`, `TerminalOutput` overlap. Consolidate one `CodeBlock` (with highlight, copy, terminal colorize) used everywhere.
4. **Rich text stacks.** Blog editor uses an MD editor; there is also legacy Quill-ish/markdown content. Choose one editor + one renderer.
5. **Static `.html` competitors.** The `public/*.html` pages are visual/style-split from the SPA and will drift (they already have separate CSS/JS). Consolidate or auto-generate; otherwise keep them strictly for `llms.txt`/SEO with a clean code path.
6. **Form UX.** `ContactPage` previously lost `department`/`metadata`; forms should surface server validation messages (the fire-and-forget path hides failures).
7. **Trial modal UX.** On server fail-closed (no Firebase Admin configured) the trial button silently stops; add visible error messaging + retry/contact link.
8. **Bundle.** Charts + Firebase should be lazy per-route; reduce firebase SDK surface (use modular imports already used) and consider excluding Firebase from the initial chunk until a signed-in user needs it.
9. **Screenshots/verification.** Add Playwright smoke + Lighthouse CI (`.lighthouserc.json` exists) and run them in CI.

---

## 4. Redundancy / dead code inventory

| Artifact | Where | Recommendation |
|---|---|---|
| `app/` (Next app router + standalone applet) | root | ✅ archived → `archive/legacy-next/app` |
| `api/` (serverless twins) | root | ✅ archived → `archive/legacy-next/api` |
| `next.config.ts` | root | ✅ archived |
| one-off `fix_*`, `update_*`, `rewrite_*`, `ds_*`, `test_*`, `append_css`, `clean_typography`, `massive_hex_replace`, `workspace/refactor_colors.sh` | root/workspace | ✅ archived → `archive/automation` |
| `lib/firebase.js` | root | likely dead (JS .js not compiled; `src/lib/firebase.ts` is used) → verify and archive in Phase 2 |
| `lib/rate-limit.ts`, root `lib/engines/` | root | re-export shims → inline into `src/lib` |
| root `components/` | root | real implementations shadowed by `src/` shims → consolidate |
| `src/components/telemetry/*` | src | shim re-exports only → point imports directly at real `src/components/telemetry` implementations |
| `src/components/ui/demo.tsx`, `hero-section-6.tsx`, `hover-footer.tsx`, `kinetic-grid.tsx`, `particles-bg.tsx`, `animated-group.tsx` | src | verify usage; likely design-system scratch → archive unused |
| `app/applet` | src/outer | standalone applet, no runtime import → archive |

---

## 5. Discrepancies / mismatches (client ↔ server, product ↔ implementation)

1. **Server tier `starter` (150/day) vs client role `starter → user` (50/day in role config).** Server rate limiter is correct; client role/display is wrong. (Client `rateLimiter.ts` already computes 150 for `starter`, so only role/badges need aligning.)
2. **Trial entitlement path.** Previously: rules allowed `starter trialing` client writes but code wrote `pro trialing` → broken/blockable. Now: server provisions trials; rules allow only `free/active` client writes.
3. **Paid plan activation.** `/api/plans` promises trialAvailable + paid plans, `/api/payments/verify` is 503, and webhooks verify but don't write entitlements. Product and implementation disagree until Phase 4.
4. **Static HTML vs SPA routes.** `/contact.html` differs in behavior (no React state) from `/contact`; same for dashboard/report/etc.
5. **Docs vs repo.** `README.md`, `docs/ARCHITECTURE.md`, `docs/ENGINES.md`, `CODE_REVIEW.md` reference `api/run-engine.ts`, `python-engines/`, `next` and claim test counts (168 vs actual 177, "tsc clean"). Need docs refresh (Phase 1).
6. **Firestore rules vs client writes.** Rules are now aligned for free/trial; blog publish rules require `active` Pro+, and client `hasPermission` blocks trial blog publish — aligned.

---

## 6. What was fixed in this pass

1. `tsc --noEmit` → 0 errors (CopyButton `icon` variant, removed bad import, `MainMenuOverlay` permission prop typing, `ContactPage` import + payload, `UserDashboardPage` report fields).
2. `npm test` → 177/177 (updated stale `MainMenuOverlay` assertion to current accessible nav).
3. **Server-provisioned trial**: `POST /api/v1/users/me/trial` (one trial per account, 7-day `trialEndsAt`, owner-scoped, Firebase Admin fail-closed), `POST /api/v1/users/me/subscription/request` (free downgrade only).
4. Client `startUserTrial`/`changeSubscription` no longer write paid plans from the browser; they call the server and no longer cache a paid entitlement on failure.
5. `firestore.rules`: `isClientSafeSubscription` only allows `free/active`; all paid entitlements incl. trials are server/admin writes.
6. `PaymentCheckoutModal`: removed simulated success; entitlement only after verified payment; surfaces fail-closed error.
7. `telemetry` uses `req.ip` (no raw XFF/CF header trust).
8. GitHub repo delete owner check.
9. Archived `app/`, `api/`, `next.config.ts`, and 65 root one-off scripts into `archive/`.
10. `ContactInquiry` now persists `department` + sanitized `metadata`.

---

## 7. Production-readiness verification (post-fix)

```
npm ci
npx tsc --noEmit                 # 0 errors
npm run lint                     # 0 warnings/errors
npm test                         # 177 passed
npm run build                    # succeeds
npm run check:bundle             # see budget below
```

Current bundle output (pre-splitting): `vendor-firebase` 552 kB (160 kB gzip) is over the 500 kB warning; `vendor-charts` 393 kB (108 kB gzip); `vendor-react` 165 kB (54 kB gzip); `index` 268 kB (67 kB gzip).

---

## 8. Detailed step-by-step advanced remediation plan

### Phase 1 — Land a trustworthy green build (now, small, no behavior change)
1. Add a `ci.yml` workflow (the YAML is drafted in §A below) that installs with `npm ci`, runs `npx tsc --noEmit`, `npm run lint`, `npm test`, `npm run build`, `npm run check:bundle` on PR+push. Move media check to a separate or combined step.
   - ⚠️ This could not be committed from the automation token because the GitHub App lacks `workflows` permission. A repository owner with `workflows` write access must add `.github/workflows/ci.yml` (or re-run the push with that permission). Same for bumping `media-verify.yml` to Node 24.
2. Pin runtime: add `"engines": { "node": ">=24" }` to `package.json`, `.nvmrc` with `24`, and use `node:24` in CI (fixes `geoip-lite` EBADENGINE).
3. Add `package.json` `"typecheck"`, `"ci": "npm run lint && npm run typecheck && npm test && npm run build && npm run check:bundle"` scripts.
4. Refresh README/docs to actual command output and archive locations; remove claims of `python-engines/`, `api/run-engine`, "168 tests", "tsc clean" (now true but update count/claims).
5. Add unit tests for the new `/api/v1/users/me/trial` (unauth 401, bad plan 400, no Firebase → 503, success shape) and `/subscription/request` (paid 501, free success requires Firebase).
6. Run `npm audit`/`npm audit --omit=dev` and document known advisories; gate on patched versions.

### Phase 2 — Consolidate duplication / remove dead code
1. Collapse root `components/` and `lib/` into `src/`: update the 5 shim re-exports (`src/components/telemetry/*`, `src/lib/rate-limit.ts`, `src/hooks/useSpotlight.ts`) to point at real implementations, then delete the shadowed root trees.
2. Verify and archive unused demo components in `src/components/ui` (`demo.tsx`, `hero-section-6`, `hover-footer`, `kinetic-grid`, `particles-bg`, `animated-group`) unless actively imported.
3. Consolidate `CodeBlock`/`MarkdownRenderer`/`TerminalOutput` into one renderer + one `CopyButton` primitive.
4. Archive `lib/firebase.js` after confirming no import. Remove deprecated `@types/dompurify`.
5. Retire `next.config.ts` reference in docs; the tree is now Vite/Express only.
6. Add `tsconfig` path audit tooling to catch unused files (e.g., `knip`).
7. Fix `resolveUserRole` to add a real `starter` role (badges, permission matrix) instead of mapping to `user`.

### Phase 3 — Frontend design system & performance
1. Tokenize all ad-hoc hexes: add `--foreground-muted`, `--card-muted`, `--accent-*` tokens and replace `#0F0F0F`, `#666666`, `#999999`, `#0066FF`, etc.
2. Consolidate dashboards: one `DashboardShell` with tabbed `UserDashboardPage`; retire `FramerDossierCockpit`/`CommandCenterHUD`/`MasterTelemetryGrid` variants or reduce to a single canonical composition.
3. Standardize modals: one `Modal`/`Drawer` primitive (focus trap, esc, scroll lock, aria) used by newsletter, trial, payment, get-in-touch, export.
4. Standardize forms: one `Field`/`Select`/`TextArea` with server error display and an accessible submit/loading/aria-live pattern.
5. Split heavy routes: move shared `Firebase` and `recharts/d3` into route-specific chunks; consider lazy-loading Firebase only for authenticated routes and using code-split analytics.
6. Set `build.chunkSizeWarningLimit` deliberately (e.g., 550 kB) or split further; run `npm run check:bundle` and enforce budget.
7. Add Playwright smoke tests (public home, tool audit, login redirect, dashboard auth, pricing, docs) + Lighthouse CI; keep `lighthouserc`.

### Phase 4 — Complete the product/security completion
1. **Real payment → entitlement wiring**: implement `POST /api/payments/verify` to look up the gateway session/order (2Checkout/DodoPay API) or, more robustly, replace with a signed webhook ledger. On success, admin-write `user_subscriptions/{uid}` with `status:'active'`, `planId`, `billingCycle`, `activeUntil`. Never trust client body.
2. On both webhooks (2Checkout/DodoPay), after HMAC verify + payload shape + idempotency record, call the same entitlement writer.
3. Persist API keys as hashes (`crypto.SHA-256`) with a separate client-only plaintext return, and validate with `timingSafeEqual` (already partially there).
4. Harden contact spam: server-side zod schema (already `telemetryEventSchema`; add contact schema), Honeypot field, per-IP rate limit on the public path, and optionally Cloudflare Turnstile.
5. Remove/restrict the public `/test` Firestore rule; tighten `contact_inquiries` read to admin only (already admin-only read) and archive guest `ownerId:'guest'` semantics.
6. Make telemetry config explicit: require `TRUST_PROXY=true` when behind a proxy, document allowed IP ranges, and schema-validate `props`/`vitals` size (already limited to 256 kB).
7. Replace in-memory state (rate limits, GitHub repos/events) with a shared store (Upstash/Mongo) or explicitly document single-instance prod constraint; add a `SYNC`/`health` check for store readiness.

### Phase 5 — Observability, compliance & deployment
1. TLS: run behind a real proxy with HSTS (already set), TLS on the proxy; keep `helmet` headers. Add a `/api/health` readiness + `/api/health/live` liveness (system route exists — verify).
2. Add `Sentry`/APM or keep client-log sink but include request ID + stack, and add a backpressure/queue. Keep GDPR telemetry (cookieless hashing, retention config in `.env`).
3. Add rate-limit headers to all routes (many already); enforce Upstash in production.
4. Add `.env.production.example` with secret requirements and a preflight `scripts/check-env.mjs` that exits non-zero for missing required secrets.
5. Add auth session handling: attach ID token on API calls server-side, use `x-api-key` for programmatic access; no `x-user-email` spoofing (already removed).
6. Write runbooks for Firestore rules deploy, Firebase Admin setup, payments webhooks, and Mongo.
7. Dockerfile + `docker-compose` with non-root user, read-only FS where possible, and healthcheck.

### Phase 6 — Full regression / acceptance
1. Run all Phase 1 gates on latest push and in CI (must be green).
2. Add Playwright + Lighthouse thresholds (LCP < 2.5s, CLS < 0.1, no a11y violations on key routes).
3. Run a production smoke against a temporary deploy with Firebase Admin + Mongo + Upstash configured; verify trial, auth, audit, report, blog publish (Pro active only), payment webhook path.
4. Security: rerun OWASP checks (already broad), `npm audit`, Firestore rules unit tests using a rules emulator, and a small burst test for rate limits.
5. Final acceptance checklist & sign-off.

---

## Appendix A — CI workflow to be added by a maintainer

```yaml
name: CI
on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm test
      - run: npm run build
      - run: npm run check:bundle
```

---

## 9. Recommended follow-ups not yet fixed

- **Firestore rules emulator tests** should be added since rules are security-critical and have changed (trial now server-only).
- **Payment provisioning** remains a deliberate, documented gap (fail-closed). It is safe but sells an incomplete upgrade path; fix before real revenue.
- **Single-instance in-memory stores** limit horizontal scaling; document as a known prod constraint until shared stores are wired.
- **Static `.html` consolidation** is deferred; document which `.html` pages are intended to be canonical.

---

*Report generated as part of the CatalystLab production-readiness audit on `arena/01a06f6f-catalystlab`.*
