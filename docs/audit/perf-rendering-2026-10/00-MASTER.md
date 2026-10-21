# CatalystLab — Performance and rendering audit (2026-10)

> **Status (2026-10-21): dated record — kept verbatim as evidence, not rewritten.** Point-in-time performance audit (2026-10); remediation ([`05-remediation.md`](05-remediation.md)) landed in the tree. Locked baselines now: [`docs/ops/slo.md`](../../ops/slo.md).

**Date:** 2026-10-19 · **Branch:** `arena/9369d7c0-catalystlab` · **Build audited:** production (`NODE_ENV=production npm run build`, served by `dist/server.cjs`)

**Question:** why is the site slow, laggy, and showing rendering problems?

## Short answer

1. **The homepage lags when the mouse moves.** A global `mousemove` handler in `src/App.tsx:151–166` walks every `.group` card and writes two CSS variables on each one, on every event. In a 288-move burst on `/`, that cost 2.8–4.1 s of long tasks and 9–10 s of style recalculation. Blocking the handler removed the long tasks entirely. **This is the strongest finding and the most likely source of the "lag".** (C1)
2. **Scrolling janks.** Roughly 160 `backdrop-blur` surfaces cost frame time while scrolling, and the full-viewport blurred ambient layer adds to it on dark-theme pages. Disabling the blur cut the homepage's p95 scroll frame from 283 ms to 67 ms (software renderer, so the magnitude is inflated). (C2, C3)
3. **Every page pays for Firebase up front.** The Firebase SDK is 161 KB gzipped of the 386 KB gzipped startup JavaScript, and it loads on every route through the auth and subscription providers and the newsletter modal. (D1)
4. **Assets are not compressed or cached when served by this app.** The Express server sends JS and CSS uncompressed with `max-age=0`. Startup transfer would drop from 1.67 MB to 0.43 MB gzipped. This applies only if production serves the Express app directly, which I could not confirm. (D2)
5. **The app shell re-renders on every scroll event.** `StickyHUD` subscribes to the whole telemetry store and writes to it on each scroll. (S1)
6. **The "rendering issues" are not React errors.** The dev build produced no React warnings on five routes. The visual problems are the scroll jank above and an intermittent layout shift on `/blogs` (CLS 0.35 in one run, 0.005 in another). The shift is not yet explained. (C6)

## Scorecard (adapted dimensions, 0–2 each)

| # | Dimension | Score | Evidence | Key findings |
|---|---|:-:|---|---|
| P1 | Interaction responsiveness | **0** | M | C1 (3–4 s long tasks per 288 moves on `/`); scroll p95 up to 283 ms on `/` |
| P2 | Startup payload and load path | **1** | M + S | 1.32 MB raw / 386 KB gz JS on `/`; Firebase eager (D1); 48 lazy routes and manual vendor chunks are in place |
| P3 | Paint and compositing cost | **1** | M + S | Median frames fine on most routes (p50 17 ms; 33–83 ms on `/`); the tail is bad on `/`. ~160 backdrop blurs (C2); blurred ambient layer (C3) |
| P4 | State and update churn | **1** | S | StickyHUD re-renders on every scroll event (S1); selectors almost unused (S2) |
| P5 | Delivery and caching | **0** (conditional) | M | No compression; `max-age=0` on hashed assets (D2). Scores 2 if the production CDN already compresses and caches |
| P6 | Measurement and budgets | **1** | S + M | Bundle gate exists but is loose and not in CI (B2); Lighthouse CI warns only on perf and has no LCP/TBT/CLS asserts (B3) |
| P7 | Rendering correctness | **1** | M | No React or runtime errors in dev or prod; unexplained intermittent CLS on `/blogs` (C6); 24 of 26 `<img>` lack dimensions (C7) |
| P8 | Server and dependencies | **1** | M + S | Full-header logging on every response (S4); unused runtime dependency `dompurify` (DEP1); server not load-tested (S5) |

**Total: 6 of 16.** The site is not broken. The problems are concentrated in three places: the mouse handler, the blur and ambient effects, and an unlimited startup payload.

## Ranked fixes (leverage = expected impact ÷ effort)

Each item links to its detailed section. The acceptance check is what must pass before the item is closed. The measurement commands are in `tools/README.md`.

| Rank | ID | Fix | Effort | Impact | Acceptance check |
|:-:|---|---|:-:|:-:|---|
| 1 | **C1** | Delete the global `mousemove` DOM sweep (`App.tsx:151–166`) and rely on the per-card `useSpotlight` hook. Confirm the spotlight still works on every `.group` card. | S | Very high | `node tools/diag.mjs`: long-task ms for the 288-move burst ≤ 200 (baseline 2,799–4,095); style recalc ≤ 2,000 ms |
| 2 | **S1** | `StickyHUD`: use store selectors, skip no-op `setScrollDepthPercentage` writes, and throttle the scroll handler to one update per frame (`StickyHUD.tsx:49, 60–70`; `useTelemetryHUDStore.ts:206–213`). | S | High (all pages) | React Profiler: ≤ 3 `StickyHUD` renders over 25 wheel ticks on `/` |
| 3 | **D2** | Compress assets and set `Cache-Control: public, max-age=31536000, immutable` for `/assets/*`, `no-cache` for HTML (`server.ts:44`). Confirm the production host behaves the same. | S | High (first visit) | `curl -sI -H 'Accept-Encoding: gzip' …/assets/*.js` shows `content-encoding` and `immutable` |
| 4 | **C2** | Reduce `backdrop-filter`: keep it on the fixed navigation and mobile overlay, use solid or semi-opaque backgrounds on cards and in scrolling lists. | M | High (scroll) | `node tools/ab2.mjs`: `/` scroll p95 ≤ 120 ms and janky frames ≤ 20 |
| 5 | **D1** | Keep Firebase out of the startup path: lazy-load `NewsletterModal`, defer the auth and subscription providers on public routes, and dynamic-import `getBlogPosts` in `NavbarSearch`. | M–L | High (JS parse and TTI) | `dist/index.html` has no `modulepreload` for `vendor-firebase`; `/` raw JS ≤ 800 KB |
| 6 | **C3** | Ambient layer: replace the `feTurbulence` SVG with a tiled noise image, replace blurred blobs with radial gradients, animate at most one layer, and pause when hidden. | S–M | Medium–high (dark theme scroll) | `node tools/ab2.mjs` with the layer on: `/` scroll p95 ≤ 120 ms |
| 7 | **C6 + C7** | Give every `<img>` explicit `width`/`height` or `aspect-ratio`, and `loading="lazy"` below the fold. Re-test `/blogs` CLS. | S–M | Medium (CLS) | `/blogs` CLS p75 ≤ 0.1 over 10 cold loads; no `<img>`-sourced shift entries |
| 8 | **D3** | Remove the duplicate Google Fonts preloads and `display=block`; self-host or use `display=swap` (`index.html:22–25`). | S–M | Medium (first paint) | No `fonts.googleapis.com` entries in Lighthouse `render-blocking-resources` |
| 9 | **C4** | Route transition: use `mode="popLayout"` or a shorter exit (`App.tsx:189–190`, `LazyAnimate.tsx:19`). | S | Medium (perceived lag) | Push-state to new `<h1>` ≤ 150 ms (not yet measured) |
| 10 | **D4** | Service worker: cache-first for hashed `/assets/*`, network-first only for HTML (`public/sw.js:36–60`). | S | Medium (repeat visits) | Second visit serves `/assets/*` from the SW with no network request |
| 11 | **B2 + B3** | Tighten the bundle budget (`scripts/check-bundle-budget.mjs:24–29`) and run it in CI. Add LCP, TBT, and CLS assertions and a mobile Lighthouse run. | S | Prevents regressions | CI job fails on a 10% rise in `initialRawKb`; LHCI asserts LCP ≤ 2.5 s and CLS ≤ 0.1 |
| 12 | **C5** | Coverflow: drive the tilt with motion values instead of `setMousePos` per move (`3-d-coverflow-carousel.tsx:107`). | S | Low–medium | ≤ 1 React render of the card per frame during a 288-move burst |
| 13 | **S4** | Skip request logging for static assets, or drop headers from 2xx logs (`server/core/logger.ts:80–100`, `server/app.ts:115`). | S | Low–medium | Static request log line < 300 bytes or absent |
| 14 | **DEP1** | Remove the unused `dompurify` and `@types/dompurify` (`package.json:32, 62`; `vite.config.ts:75`). | S | Low | `npm run build` and `check:bundle` pass; `npm ls dompurify` empty |
| 15 | **D5** | Trace the 14 JS files loaded on `/docs` (1,726 KB raw) to their source modules. | M | Medium (docs pages) | `/docs` raw JS ≤ 1,300 KB |
| 16 | **D6** | Measure and trim the 358 KB app CSS (count generated utilities, remove unused custom classes). | M | Low–medium | Built CSS ≤ 250 KB raw |
| 17 | **S3** | Start the analytics flush timer on demand, not at module load (`analyticsEngine.ts:237`). | S | Low | No timer callbacks during 10 s idle with an empty queue |

**Suggested order:** items 1–3 are small and high-impact, so do them first. Re-run `tools/diag.mjs`, `tools/ab2.mjs`, and `tools/measure.mjs` after each. Then take D1 and C2, which are larger changes.

## Coverage of the codebase

| Area | How it was covered | Not covered |
|---|---|---|
| Client rendering (`src/`) | Production and dev runs on 7 routes; A/B on mouse, scroll, and blur; static scan of layout, UI, store, and hooks; eager import graph | React Profiler render counts; every component; dark-theme comparison on real hardware |
| Startup path and bundle | `dist/` chunk sizes (raw and gzip); eager import graph (`tools/import-graph.mjs`); `check:bundle` run | Per-route chunk tracing for `/docs` (D5); CSS utility count (D6) |
| Delivery and caching | `curl` headers on JS, HTML, and `sw.js`; service worker source | Production CDN or host headers (not in repo); fonts (sandbox blocks Google) |
| Server (`server.ts`, `server/`) | Static serving and headers; request-logging volume; security headers observed | Load and API latency; database-backed paths (no `MONGODB_URI` here); Firestore listeners (`lib/firebase.ts:1261, 1880`) not reviewed for leaks |
| `lib/` | Analytics timer (`analyticsEngine.ts:237`) | Rate limiter internals (`lib/rate-limit.ts`, `server/core/rateLimit.ts`) |
| Config and build | `vite.config.ts`, `.lighthouserc.json`, `check:bundle`, `.github` workflows | Terser output size vs. build time trade-off |
| Tests | Inventory of `src/tests/`; absence of performance tests; known failing suite | Test runtime |
| Dependencies | Unused-import scan (`dompurify`); weight by chunk (firebase, recharts, d3, motion, cobe) | Upstream version review; license review |

## Measurement caveats

- **Sandbox, not a device.** The sandbox CPU is slow and Chromium composites in software. Absolute times are inflated (desktop FCP is 1.7 s on localhost). Compare variants within a run, and treat the blur result as a direction, not a forecast.
- **External hosts blocked.** Google Fonts, Firestore, and Pexels were unreachable. Their real network cost is absent from the numbers.
- **Lighthouse.** Mobile performance was 55–56 on the three routes tested, with an 11 s LCP. Those numbers are inflated by the sandbox CPU. The desktop homepage score is missing (`NO_SCREENSHOTS`), though its FCP, LCP, and TBT are valid. Lighthouse's main-thread attribution is mostly "Other" here, so no per-script blame comes from Lighthouse.
- **Single runs** are noisy. The CLS result on `/blogs` changed between runs (see C6), so do not treat any single CLS number as a verdict.

## Corrections to earlier session notes

- **`vendor-charts` is not in the startup path.** An earlier note suggested it was preloaded. The eager import graph and the `index.html` preload list both show it is lazy.
- **No client sourcemaps are shipped in a default build.** An earlier note said they were. Two builds (with and without `NODE_ENV`) both produced none.
- **The 503 responses seen in the browser runs most likely came from the sandbox's egress for Google and Pexels, not from the CatalystLab server.** The app's own routes returned 200, and its API calls on the measured routes returned no errors.

## Adaptation of the audit rubric

The master report at `myself-aas/claude-skills` (`audit/engineering-agentic-2026-07`) and its rubric AR1–AR6 are written for agent skill folders: SKILL.md structure, scripts, and agentic loops. Those dimensions do not measure a web app's speed, so I did not score CatalystLab against them literally.

What I kept from the method:
- Findings are grouped into classes and ranked by leverage.
- Each finding has a file and line reference and an executable acceptance check.
- The scorecard uses the 0–2 scale with evidence for each score.

What I changed:
- **Dimensions:** replaced AR1–AR6 with P1–P8, which cover interaction, load path, paint cost, state churn, delivery, measurement, rendering correctness, and server and dependencies.
- **Evidence grades:** each claim is marked measured (M), static (S), or unmeasured (U), instead of the rubric's pass/fail checks.
- **Dropped:** the skill-specific checks (frontmatter, skill file layout, agent loop structure), which have no equivalent in a web app.

## Verified non-issues

- No React warnings, key warnings, hydration warnings, or uncaught exceptions on `/`, `/pricing`, `/docs`, `/blogs`, or `/compare` (dev build).
- No client sourcemaps are shipped in the production build.
- Charts (`recharts`, `d3`), the globe and count-up animation files, and `cobe` are outside the startup path.
- The three `requestAnimationFrame` loops cancel their frames.
- Static HTML and manifest responses take 0.5–2 ms on the local server.

## Not yet done (next steps)

1. Trace `/docs`' 14 JS files to their modules (D5).
2. Measure the `/blogs` CLS over 10 cold loads, with images sized and without (C6).
3. Measure route-change time with `history.pushState` (C4).
4. Apply items 1–3 and re-run `tools/diag.mjs`, `tools/ab2.mjs`, and `tools/measure.mjs` to confirm the gains.
5. Run a throttled CPU and network profile (4× CPU, Fast 3G) on a machine with a GPU, to get realistic mobile numbers.
6. Review the Firestore listeners (`src/lib/firebase.ts:1261`, `:1880`) for unsubscribe on unmount.

## Reproduce

See `tools/README.md`. The production server, the measurement scripts, and the expected output files are described there.

## Files in this audit

- `00-MASTER.md` — this report
- `01-measurements.md` — all raw measurements and A/B tables
- `02-client-rendering.md` — C1–C8
- `03-delivery-and-bundle.md` — D1–D8
- `04-state-build-server-deps-tests.md` — S1–S5, B1–B4, DEP1–DEP2, T1
- `tools/` — measurement scripts and README

## Remediation status (2026-10-19)

Fixes applied and re-measured: C1, S1, C3, D2, D3, D4, plus a containing-block bug found during verification. Details, before/after tables, and open items are in `05-remediation.md`. Headline: the fixed layers (navbar, StickyHUD, ambient layer) were positioned against the document instead of the viewport. `/blogs` CLS went from 0.29–0.35 to 0, and scroll p95 on five routes went from 117–217 ms to 17 ms. Two items were not changed: translucent `backdrop-filter` (C2, visual decision) and the page transition (C4, reverted after an LCP regression).
