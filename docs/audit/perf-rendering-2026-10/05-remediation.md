# 05 — Remediation and re-measurement (2026-10-19)

> **Status (2026-10-21): dated record — kept verbatim as evidence, not rewritten.** Remediation record for the 2026-10 performance audit — the fixes described here are in the tree; current locked baselines: [`docs/ops/slo.md`](../../ops/slo.md).

Companion to `00-MASTER.md`. Covers the fixes applied after the audit, how each was verified, and what was measured before and after. Measurements use the same sandbox as `01-measurements.md`: headless Chromium with software rendering, so absolute times are inflated. Compare before and after only.

## Summary

| Finding | Status | Change |
|---|---|---|
| C1 global `mousemove` sweep (`App.tsx`) | Fixed | Updates only the hovered `.group` and its `.group` ancestors, once per frame. |
| S1 StickyHUD re-renders and no-op writes | Fixed | `useShallow` selector on the fields rendered; scroll writes coalesced per frame; store setter skips no-op writes. |
| C3 ambient layer blur and SVG filter | Fixed | Light pools are radial gradients; SVG noise overlay removed. |
| D3 font preloads and `display=block` | Fixed | Duplicate preloads removed; Material Symbols uses `display=swap`. |
| D4 service worker network-first for assets | Fixed | `/assets/*` is cache-first; everything else stays network-first. |
| D2 no caching for hashed assets | Fixed in `server.ts` | `Cache-Control: public, max-age=31536000, immutable` for `/assets/*`. Applies only where this Express server serves `dist/` (see deployment note). |
| **New finding: containing-block bug** | Fixed | `.animate-app-fade-in` left a transform on `.app-shell`; see below. |
| C2 `backdrop-filter` cost | Measured, not changed | See "C2 result". |
| C4 page-transition blur | Tried, reverted | See "C4 result". |
| C6/C7 image dimensions | Not needed | `/blogs` CLS was caused by the containing-block bug, not by images. Image attributes remain open. |

## New finding: the fixed layers were not fixed

`.app-shell` (`src/App.tsx:188`) received `animate-app-fade-in` (`src/index.css`). The keyframes animated `transform` and used `forwards`, so the final `transform: matrix(1,0,0,1,0,0)` stayed on the element after the fade.

Any transform makes an element the containing block for `position: fixed` descendants. Three fixed layers sit inside `.app-shell`, so they were positioned against the document, not the viewport:

- **The ambient layer** (`LinearAmbientBackground`) sized itself to the whole document: 6373 px on `/`, 1632 px on `/blogs`, instead of 900 px. Its percentage-positioned pools moved as the page grew during load. This was the `/blogs` layout shift.
- **The top navbar** (`header.top-nav`, `top: 0`) scrolled away. After scrolling to 600 px, its top was at −600. The navbar was not sticky on any page.
- **The StickyHUD** (`aside.fixed.bottom-6`) sat at the bottom of the document (y=6276 on `/`) rather than the viewport, so it was effectively invisible except at the end of a page.

Fix: `appFadeIn` is now opacity-only, and `.animate-app-fade-in` uses `backwards` as well. Verified after the rebuild: the ambient layer is 900 px, the navbar stays at top 0 after scrolling, and the HUD is at viewport y=803.

**Behaviour change to review.** The navbar is now sticky and the HUD is now visible over content on every non-app-chrome page. That matches the intent of the markup, but it is a visible change. The HUD can be removed or reduced if it overlaps content too much.

Other `position: fixed` elements inside `.app-shell` were not enumerated beyond the three above, which are the only ones present at load on `/`, `/pricing`, `/docs`, and `/blogs`. Modals and overlays that open on interaction were not checked and should be reviewed.

## Verification gates (final state)

| Gate | Baseline | Final |
|---|---|---|
| `tsc --noEmit` | 127 errors | 127 errors (unchanged) |
| `npm run lint` | 0 | 0 |
| `vitest run` | 206 pass, 5 skip, `rateLimiter.test.ts` fails | 206 pass, 5 skip, same pre-existing failure |
| `npm run build` | pass | pass |
| `npm run check:bundle` | pass | pass |

The `rateLimiter.test.ts` failure predates this work (jsdom getter-only `localStorage`, see `04-state-build-server-deps-tests.md`). No new unit tests were added for these changes.

## Measurements

Scripts are in `tools/`. Each route row is one `measure.mjs` run unless noted. Mouse and scroll numbers come from the same build.

### Per route (before → after)

| Route | LCP ms | CLS | Scroll p95 ms | Notes |
|---|---|---|---|---|
| `/` | 896 → 896 | 0 → 0 | 267 → 283 | Mouse long tasks 61 → 0 |
| `/pricing` | 880 → 744 | 0.05 → 0 | 150 → 150 | Not re-tested for scroll |
| `/docs` | 480 → 436 | 0.059 → 0 | 200 → 17 | |
| `/compare` | 308 → 256 | 0.018 → 0 | 133 → 17 | Single run showed 200; three runs gave 17 |
| `/blogs` | 292 → 200 | 0.352 → 0 | 117 → 17 | CLS 0 on 4/4 runs with `shift.mjs` |
| `/contact` | 288 → 240 | 0.05 → 0 | 217 → 17 | |
| `/login` | 284 → 184 | 0 → 0 | 183 → 17 | |

LCP is noisy in this sandbox. The first run in a fresh browser is always slow (about 650–960 ms), so runs 1–3 are the comparison. LCP is covered in the next section.

### Mouse handler (C1), `diag.mjs` A/B on `/`, 288 events

| Variant | Long tasks | Long-task ms | Style recalc ms |
|---|---|---|---|
| Before, handler on | 68 / 46 | 4095 / 2799 | 10265 / 9341 |
| Before, handler off | 0 / 0 | 0 | 1283 / 1183 |
| After, handler on | 0 / 0 | 0 | 1839 / 1663 |
| After, handler off | 0 / 0 | 0 | 1295 / 1246 |

The handler now costs about 0.5 s of style recalc over 288 events, down from about 9 s with no long tasks left.

### Scroll ablation on `/` (`ab2.mjs`/`ab3.mjs`, median of three reps)

| Variant | Before | After |
|---|---|---|
| Baseline | 283 | 350 (ab2) |
| All `backdrop-filter` removed | 67 | 67 (ab2); 33 (ab3, separate run) |
| Only opaque-background blurs removed | not measured | 150 → 150 (ab3, baseline 150 in the same run) |

### `/blogs` CLS (`shift.mjs`)

- Before: 0.005 (ab2) and 0.352 (measure). Intermittent across runs.
- Intermediate build (ambient rewritten, containing-block bug still present): 0.29 in 3 of 4 runs.
- Hiding the four light pools removed the shift (4/4 runs at 0). Hiding only the grid, or disabling blob animation, did not.
- Final build: 0 in 4/4 runs.

### LCP on `/blogs` (`lcpel.mjs`)

| Build | Runs 1–4 (ms) | LCP element |
|---|---|---|
| Before | 248, 276, 172 | "The Modern Anatomy of Website…" |
| After, with `PageTransition` change | 664, 596, 624, 564 | "Decimating TTFB with Multi-Reg…" |
| After, `PageTransition` reverted (final) | 300, 188, 228 | "The Modern Anatomy…" |

The regression came from the `PageTransition` change (see C4 below). Removing the fade animation or the ambient layer did not change it. Bypassing the service worker did not change it.

## C2 result: `backdrop-filter`

There are 33 `backdrop-filter` elements on `/`. Measurement shows:

- 27 sit on opaque backgrounds. Removing their blur made no difference (150 → 150 ms scroll p95).
- The cost comes from the translucent or transparent ones: the coverflow card (`bg-background/75 backdrop-blur-xl`, `3-d-coverflow-carousel.tsx:174`) and the icon buttons with a transparent background and `backdrop-blur-md`.
- Removing all blur gives 33–67 ms p95, but the translucent blur is the visible glass effect.

**Not changed.** Reducing the translucent blur is a visual decision and needs sign-off. Options are a smaller radius on the coverflow card, or a static fallback below a breakpoint. Software rendering exaggerates this cost, so measure on real GPU hardware before deciding.

## C4 result: page transition

`PageTransition` (`src/components/common/LazyAnimate.tsx`) animates `filter: blur(8px)` and `scale` on the whole route. I tried an opacity-only version with a 120 ms exit. It moved the `/blogs` LCP candidate later (about 250 → 600 ms, consistently over five runs). I did not find the mechanism in this session. The change was reverted, and the file matches `HEAD`.

Still open: the blur filter on the whole page during route transitions, and the 400 ms `mode="wait"` exit. These need a trace before changing.

## Deployment note

- `express.static` with the immutable header applies only when `server.ts` serves `dist/`. If production is a static host (Cloudflare Pages, Vercel), that host sets its own cache headers, and the `_headers` or `vercel.json` rules need the same `/assets/*` rule.
- The service worker change applies to any host that serves `/assets/*` with hashed names.

## Caveats

- The "before" control for the LCP comparison ran with the post-fix `server.cjs`. A copy mistake overwrote the pre-change `server.cjs` in `/tmp/before-app/dist`. The only server difference is the static cache header, which does not affect a cold-profile load.
- Google Fonts, Pexels, and Firestore are blocked in this sandbox, so font and network-dependent timing is not measured. `display=swap` should help real users on slow networks. That is not confirmed here.
- Single-machine, software-rendered measurements. Use them for direction, not for absolute targets.
- Numbers in the "Before" column of `01-measurements.md` and `00-MASTER.md` were not regenerated. This file supersedes them for the affected metrics.

## Still open

- C2: decide whether to reduce translucent blur. Measure on GPU hardware first.
- C4: trace the `PageTransition` LCP change before reapplying any blur or opacity change.
- Review modals and overlays for the containing-block change.
- `/docs`: 14 JS files still untraced (D5); CSS size cause untraced (D6).
- Firestore listeners, rate-limiter internals, and API load not reviewed.
- Image `width`/`height` and `loading` attributes (`<img>` scan: 24 of 26 lack dimensions) are still unaddressed. They are not implicated in the `/blogs` CLS.

## Files changed

- `src/App.tsx`: spotlight handler (C1).
- `src/components/layout/StickyHUD.tsx`, `src/store/useTelemetryHUDStore.ts`: S1.
- `src/components/layout/LinearAmbientBackground.tsx`: C3.
- `index.html`: D3.
- `public/sw.js`: D4.
- `server.ts`: D2.
- `src/index.css`: containing-block fix (`appFadeIn`, `.animate-app-fade-in`).
- `docs/audit/perf-rendering-2026-10/tools/`: `ab3.mjs`, `shift.mjs`, `lcpel.mjs`, `navscroll.mjs`, `fixedlist.mjs` added.
