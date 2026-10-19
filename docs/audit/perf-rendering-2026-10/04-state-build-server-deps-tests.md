# 04 — State and timers, build and budgets, server, dependencies, tests

Evidence grades: **M** measured, **S** static, **U** not measured.

---

## S1 — The app shell re-renders on every scroll event  (S, high, S effort)

**Where:**
- `src/components/layout/StickyHUD.tsx:49` destructures `useTelemetryHUDStore()` with **no selector**. The component therefore re-renders on every store update, whatever field changed.
- `src/components/layout/StickyHUD.tsx:60–70`: a `window` `scroll` listener (not throttled) computes the depth and calls `setScrollDepthPercentage` on each event.
- `src/store/useTelemetryHUDStore.ts:206–213`: `setScrollDepthPercentage` always calls `set(...)` with a new object, even when the depth has not changed. Zustand notifies every subscriber of a `set`, and a subscriber with no selector re-renders.
- `src/App.tsx:605`: `<StickyHUD />` is mounted on every route except `/design-system`.

**Why it hurts:** every wheel or scroll event on any page causes a store write and a full re-render of `StickyHUD`, which is a large component with a log drawer, charts, and animations. This runs alongside the Navbar's own `useScroll` subscriptions and the parallax sections.

**Evidence:** static (S). The per-event render cost was not isolated in this audit. The scroll p95 numbers in 01 are an upper bound on total scroll cost, not the StickyHUD share.

**Fix:**
1. Use selectors: `const scrollDepthPercentage = useTelemetryHUDStore(s => s.scrollDepthPercentage)` and one selector per field the component reads.
2. In `setScrollDepthPercentage`, return early when the clamped depth equals the current value.
3. Throttle the scroll handler to one update per animation frame, or derive depth from a Framer motion value.
4. Only mount `StickyHUD`'s heavy body when it is visible (`showAppChrome` or expanded).

**Acceptance check:** add a React Profiler `onRender` counter around `StickyHUD` in a dev build, then scroll 25 wheel ticks on `/`. Target ≤ 3 renders. Also check that `setScrollDepthPercentage` is called at most once per frame (a counter in the dev build). The existing `src/tests/` suite must still pass (`npx vitest run`).

---

## S2 — Store access is not selector-based anywhere else  (S, low–medium)

**Evidence:** `useAppStore(` appears once, and `useAppStore()` (with no selector) appears once, in `src/components/common/SyncStatusBadge.tsx:15`. The telemetry HUD store is read without selectors in `CommandCenterHUD.tsx:229`, `LiveCronLogStream.tsx:28`, and `StickyHUD.tsx:49`.

**Fix:** convert the three telemetry HUD call sites to selectors, starting with `StickyHUD`. The `SyncStatusBadge` call site can use `useShallow` from zustand if it reads several fields.

**Acceptance check:** `grep -rn 'useTelemetryHUDStore()' src` and `grep -rn 'useAppStore()' src` return no matches outside tests.

---

## S3 — Module-level timer in the analytics client  (S, low)

**Where:** `src/lib/analyticsEngine.ts:237`: `setInterval(flushQueue, 3000);` runs at module load, on every page, for the lifetime of the tab. `flushQueue` is defined at line 212 and sends queued events in batches.

**Impact:** a 3-second wake-up for the whole session. The cost is small when the queue is empty, but it is never stopped. This is a design point, not a measured problem.

**Fix:** start the timer on the first queued event and stop it when the queue is empty. Flush on `pagehide` and `visibilitychange`.

**Acceptance check:** with an empty queue, no timer fires during 10 s of idle time (dev-build counter, or a trace with no `setInterval` callbacks).

---

## S4 — Request logging writes full headers for every response  (M, low–medium)

**Where:** `server/core/logger.ts:80–100` logs every response at `info` with `req` and `res` serialized through `pino.stdSerializers`, which include all headers. Redaction (`server/core/logger.ts:11–15`) removes credential headers only. The middleware is installed at `server/app.ts:115`, before static files are served, so every JS, CSS, and image response is logged too.

**Measured (M):** on the local production server, each static request wrote a JSON log line with the full Content-Security-Policy and all security headers (about 2 KB per line), at `durationMs` 0.5 to 2.1 ms. A page load of 15 to 20 assets would therefore write roughly 30 to 40 KB of log (estimate from the per-line size, not measured per page).

**Impact:** log I/O and log storage costs on every page view, plus noisy logs. The per-request CPU cost is small.

**Fix:** skip logging for static asset requests (`/assets/`, images, `*.js`, `*.css`), or log only the method, URL, status, and duration for 2xx responses. Keep full headers for 4xx and 5xx responses.

**Acceptance check:** after `curl http://localhost:3000/assets/<file>.js`, the server log has no line for that request, or the line is under 300 bytes.

---

## S5 — No server-side performance measurement exists  (U)

**Evidence:** the server was measured only through the static pages it serves on localhost (`durationMs` 0.5–2 ms). No API endpoint was load-tested. The rate limiter (`server/core/rateLimit.ts:421`) runs a `setInterval` cleanup; it was not reviewed in depth. No database latency was measured. `MONGODB_URI` was not set in this environment, so the analytics path ran in in-memory mode.

**Next step:** run `autocannon` or `k6` against `/api/analytics/realtime`, `/api/engines/*`, and `/api/blogs` once a database is configured.

---

## B1 — Build configuration  (S, verified)

- `vite.config.ts:37` `manualChunks` splits vendor code into `vendor-firebase`, `vendor-charts`, `vendor-motion`, `vendor-react`, `vendor-icons`, `vendor-utils`, and similar groups. The split works: `vendor-charts` is not in the startup path.
- `vite.config.ts:87–90` uses terser with `passes: 2`. This is a build-time cost (21–29 s builds here), not a runtime one.
- `vite.config.ts:97` `sourcemap: process.env.NODE_ENV !== 'production'`. Confirmed in 03-D8: no client maps are shipped.
- `vite.config.ts:98–99` `cssCodeSplit: true` and `assetsInlineLimit: 4096`. Both are reasonable.

No config change is needed for the findings in 02 and 03. The gap is that nothing enforces the performance budget (B2, B3).

---

## B2 — Bundle budget is too loose and not enforced in CI  (M, medium, S effort)

**Where:** `scripts/check-bundle-budget.mjs:24–29`.

| Budget | Limit | Measured now | Headroom |
|---|---:|---:|---:|
| `initialRawKb` | 2,100 | 1,285 | 815 KB |
| `initialGzipKb` | 540 | 377 | 163 KB |
| `totalRawKb` | 3,400 | 2,548 | 852 KB |
| `totalGzipKb` | 900 | 730 | 170 KB |
| `largestChunkRawKb` | 1,050 | 541 | 509 KB |
| `largestChunkGzipKb` | 280 | 157 | 123 KB |

Measured with `npm run check:bundle` after `npm run build`. The gate passes today, but it would allow the startup JavaScript to grow by about 60% before failing. The script's own message says "do not raise the budget to pass".

**CI:** `grep -rln check:bundle .github package.json scripts` finds it only in `package.json`. No workflow runs it, so it is advisory.

**Fix:** after D1 lands, set `initialRawKb` to the new measured value plus 5%. Add `npm run check:bundle` to a CI job that runs after the build.

**Acceptance check:** a CI job that runs `npm run build && npm run check:bundle` and fails on a 10% increase in `initialRawKb`.

---

## B3 — Lighthouse CI does not guard the metrics users feel  (S, medium, S effort)

**Where:** `.lighthouserc.json:9–16`.
- `categories:performance` is `warn` at `minScore: 0.5` (line 12). A warning does not fail CI.
- There are no assertions for `largest-contentful-paint`, `total-blocking-time`, or `cumulative-layout-shift`.
- `resource-summary:script-size` and `resource-summary:total-size` are `off` (lines 14–15).
- `collect.settings.preset` is `desktop`, with 3 runs. There is no mobile run, although the mobile scores are much lower (01 §4).

**Fix:** add these assertions, starting as `warn` and promoting to `error` once the fixes land:
- `largest-contentful-paint`: `maxNumericValue` 2,500 (desktop) / 4,000 (mobile)
- `total-blocking-time`: `maxNumericValue` 300
- `cumulative-layout-shift`: `maxNumericValue` 0.1
- `resource-summary:script:size`: budget tied to B2

Add a mobile collect configuration alongside the desktop one.

**Acceptance check:** `npx lhci autorun` reports the new assertions, and the `.lighthouserc.json` diff shows them.

---

## B4 — Measurement harness is not in the repository  (S)

The scripts used for this audit live in `docs/audit/perf-rendering-2026-10/tools/`. They are not run by any test or CI job, and they need `@sparticuz/chromium`, `puppeteer-core`, and `lighthouse`, which are not in the repo's dependencies. Decide whether to keep them as documentation only, or add an opt-in `npm run perf:audit` script with those packages as devDependencies.

---

## DEP1 — Unused runtime dependency: `dompurify`  (S, low)

**Where:** `package.json:32` (`"dompurify": "^3.4.17"`, in `dependencies`). No source file imports it. The only reference is `vite.config.ts:75`, which routes the package into a chunk if it is ever bundled. `@types/dompurify` is also present (`package.json:62`).

**Fix:** remove `dompurify` and `@types/dompurify`, and remove the `vite.config.ts:75` branch if it has no other effect. Confirm with `npm run build` and `npm run check:bundle`.

**Acceptance check:** `grep -rn "dompurify\|DOMPurify" src server lib` returns nothing, and `npm ls dompurify` reports no installed copy after `npm prune`.

---

## DEP2 — Dependency weight in the client (S)

Client runtime dependencies that add to the startup path: `firebase` (see D1), `motion`, `react`/`react-dom`, `lucide-react` (icons, about 11 KB gzipped in its own chunk), and `recharts` plus `d3`, which are lazy (`RiskSslGaugeChart` and `EngineCharts`, reached through lazy routes). `cobe` is used only by the globe components, which are not in the startup path. `mongodb` and `firebase-admin` are server-only.

No other unused dependencies were found. The check was a text search over `src`, `server`, `lib`, and the config files.

---

## T1 — Test suite does not cover performance  (S)

**Evidence:** `src/tests/` (20 files) covers functional behavior, accessibility, and routes. No test measures render counts, bundle size, long tasks, or layout shift. The one performance-related check in the repository is the bundle budget (B2), which is not in CI.

**Known failing suite (pre-existing, unrelated to performance):** `src/tests/rateLimiter.test.ts` fails at load with `Cannot set property localStorage of [object Window] which has only a getter`. This was already recorded in `docs/codebase/TESTING.md`.

**Fix:** add an opt-in Playwright or Puppeteer performance test that asserts the metrics in 01 (for example, the mouse-burst long-task budget from C1) and the scroll budget from C2. Keep it out of the default unit run, and run it on the production build.

---

## Verified non-issues (this area)

- **Timers with cleanup:** `TerminalOutput.tsx:62`, `LiveCronLogStream.tsx:39`, `3-d-coverflow-carousel.tsx:295`, `edge-mesh-globe.tsx:349`, `ForgotPasswordPage.tsx:36`, and `useTelemetryHUDStore.ts:282` each store the interval handle. Their cleanup functions were not reviewed line by line in this audit, so treat this as a sampling result, not a full check.
- **Animation loops:** the three `requestAnimationFrame` loops cancel their frames (see 02-C8).
- **Recharts and d3 in the startup path:** no (see 03-D8).
