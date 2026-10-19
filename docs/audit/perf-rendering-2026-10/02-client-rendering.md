# 02 — Client rendering and interaction

Scope: `src/App.tsx`, `src/components/layout/*`, `src/components/ui/*`, `src/components/home/*`, `src/index.css`, `src/store/useTelemetryHUDStore.ts`, `src/components/cards/hooks/useSpotlight.ts`, `public/sw.js`.
Evidence grades: **M** measured in this audit, **S** static reading only, **U** not measured.

---

## C1 — Global `mousemove` handler sweeps every `.group` card on every event  (M, high, S effort)

**Where:** `src/App.tsx:151–166`.

```ts
const updateMousePos = (e: MouseEvent) => {
  document.querySelectorAll('.group').forEach((card) => {
    const rect = card.getBoundingClientRect();          // forced layout per card
    ...
    (card as HTMLElement).style.setProperty('--mouse-x', `${x}px`);   // style invalidation per card
    (card as HTMLElement).style.setProperty('--mouse-y', `${y}px`);
  });
};
window.addEventListener('mousemove', updateMousePos);
```

**Why it hurts:** `mousemove` fires at up to the display refresh rate, or faster. On every event the handler runs over all `.group` elements (37 on `/`). Each card gets a `getBoundingClientRect()` read and two custom-property writes. Those writes invalidate style for each card's subtree. The result is a large amount of style recalculation and long tasks, which block input and paint.

**Evidence (M):** `tools/diag.mjs`, 288 moves on `/`.

| | Long tasks | Long-task ms | Style recalc ms |
|---|---:|---:|---:|
| handler on (2 runs) | 68 / 46 | 4,095 / 2,799 | 10,265 / 9,341 |
| handler blocked (2 runs) | 0 / 0 | 0 / 0 | 1,283 / 1,183 |

**Duplicate work:** the cards already have a per-element spotlight. `useSpotlight` (`src/components/cards/hooks/useSpotlight.ts:9`, and `onSpotlightMouseMove` at `:60`) is used by `Card.tsx`, `LinearCard.tsx`, `FaqAccordion.tsx`, `HeroAuditMock.tsx`, and `Testimonials.tsx`. The global handler sets the same `--mouse-x`/`--mouse-y` variables on any `.group` element, including ones that do not use the hook.

**Fix:** delete the global handler and rely on `useSpotlight`. Before deleting, list the `.group` elements that do not use the hook (`grep -rln "className=.*group" src`) and confirm each one still gets its spotlight, or convert them to the same hook. If a global listener is still needed, read the pointer once per frame with `requestAnimationFrame` and update only the element under the pointer, using `e.target.closest('.group')`.

**Acceptance check:** `node tools/diag.mjs` (listener-on runs). Long-task ms during the 288-move burst must be ≤ 200 ms (baseline 2,799–4,095), and style recalc ≤ 2,000 ms (baseline ~9,300–10,300). Manually confirm the card spotlight still follows the cursor on the homepage cards and the pricing cards.

---

## C2 — `backdrop-filter` on a large share of UI surfaces  (M for the scroll effect, S for the count, medium–high, M effort)

**Where:** about 160 `backdrop-blur-*` utilities across `src/**/*.tsx` (counted with `grep -rn backdrop-blur src --include=*.tsx`, excluding tests). Global definitions at `src/index.css:777–778` (`backdrop-filter: blur(var(--glass-blur))`) and `src/index.css:1287` (`backdrop-filter: blur(16px)`). Example overlay: `src/components/layout/Sidebar.tsx:310`.

**Why it hurts:** a backdrop blur is re-computed for everything behind the element on every frame in which that content changes. While the page scrolls, each blurred card re-blurs the moving content underneath. This drives frame time up, most visibly in the tail (p95).

**Evidence (M):** `tools/ab2.mjs`, `/`, median of 3 scroll reps.

| Variant | Scroll p50 ms | Scroll p95 ms | Janky frames (>50 ms) |
|---|---:|---:|---:|
| baseline | 33 | 283 | 65 |
| `backdrop-filter: none` on all `[class*=backdrop-blur]` | 17 | **67** | **13** |

The sandbox composites in software with no GPU, which probably exaggerates blur cost. Use the ratio as a direction, not as a forecast of real-device impact.

**Fix:** keep blur only where it earns its cost. Good candidates are the fixed top navigation and the mobile sidebar overlay. For cards and panels, use an opaque or semi-opaque background with the existing gradient. Do not apply blur to elements inside a scrolling list. Where blur is kept, reduce its radius (`blur-sm`, 8px) and check that the element is not larger than the viewport.

**Acceptance check:** `node tools/ab2.mjs` on `/`. The baseline scroll p95 must be ≤ 120 ms and janky frames ≤ 20. Visual sign-off on cards in light and dark themes.

---

## C3 — Full-viewport ambient layer on every dark-theme page  (M, medium, S effort)

**Where:** `src/App.tsx:176` renders `<LinearAmbientBackground />` when `resolvedTheme === "dark"`. The layer is `src/components/layout/LinearAmbientBackground.tsx`:
- line 18: an SVG `feTurbulence` fractal-noise filter applied to a full-viewport `rect` with `mix-blend-overlay` (a full-screen blend stage);
- lines 25–29: four large blurred blobs (`blur-[110px]` to `blur-[140px]`, up to 900×550 px). Three of them animate with `animate-linear-blob*` (transform-only keyframes, `src/index.css:749–768`);
- line 31: a `linear-grid-overlay` at `opacity-60`.

**Evidence (M):** `tools/ab2.mjs`, `/`. Hiding the layer cut scroll p95 from 283 ms to 167 ms and janky frames from 65 to 29. Disabling only the blob animation changed nothing (p95 267 ms), so the cost is the blur and noise rendering, not the motion.

**Fix:**
1. Replace the `feTurbulence` SVG with a small tiled noise image (PNG or WebP) or drop it. A pre-rendered noise texture costs nothing per frame.
2. Replace the blurred blobs with `radial-gradient` backgrounds on a single element. Gradients are cheap, and the blur filters are not.
3. Keep at most one animated layer, and pause it when `document.hidden` is true or when the user has reduced motion.

**Acceptance check:** `node tools/ab2.mjs` with the layer enabled. Scroll p95 on `/` must be ≤ 120 ms. Dark-theme screenshots must look the same (manual check).

---

## C4 — Route change waits for the exit animation  (S, medium perceived lag, S effort)

**Where:** `src/App.tsx:189–190` wraps the routes in `<AnimatePresence mode="wait">` with `<PageTransition key={location.pathname}>`. `mode="wait"` mounts the new page only after the old page has finished animating out. The default duration is `0.45` s (`src/components/common/LazyAnimate.tsx:19`), and the enter animations use `0.4` s (`:138`, `:160`).

**Why it hurts:** each navigation adds about 0.45 s of exit time before the new route appears. That is not a rendering bug, but on a SPA it reads as lag, and it is added on top of the lazy-chunk fetch.

**Evidence:** static only (U for the measured delay; the timing comes from the code). The planned measurement is the time from `history.pushState` to the new `<h1>`.

**Fix:** use `mode="popLayout"`, or shorten the exit to about 120 ms and animate opacity only. Keep the enter animation short.

**Acceptance check:** push a route change in a headless page and measure time to the new `h1` text. Target ≤ 150 ms (not yet measured; add to `tools/`).

---

## C5 — 3D coverflow stores mouse position in React state on every move  (S, low–medium, S effort)

**Where:** `src/components/ui/3-d-coverflow-carousel.tsx:96` (`useState` for `mousePos`), `:107` (`setMousePos` inside `handleMouseMove`), `:113` (`onMouseMove={handleMouseMove}`), and `:117` (reset on leave).

**Why it hurts:** each mouse move on the centre card calls `setMousePos`, which re-renders that card. The handler is not throttled, and the value is only used for a visual tilt, which motion values can drive without React renders.

**Evidence:** static only (U). The coverflow is on the homepage (`HeroSection.tsx` imports it eagerly).

**Fix:** store the pointer position in a `useMotionValue` and feed it to `useTransform`, or throttle `setMousePos` to one call per animation frame.

**Acceptance check:** count React renders of `CoverflowCard` during a 288-move burst on `/` (React Profiler `onRender`, dev build). Target ≤ 1 per frame (≈ 60 max over a 1 s burst).

---

## C6 — Intermittent layout shift on `/blogs`  (M for occurrence, cause unproven, medium)

**Evidence:**
- First `measure.mjs` run: CLS 0.352 on `/blogs`, with two shift events at 187 ms and 292 ms. The shift sources were the ambient-layer blobs (`LinearAmbientBackground.tsx:25–28`).
- `ab2.mjs` run: CLS 0.005 on the baseline and 0.294 in two other variants. Hiding the ambient layer gave 0 in one run.
- Other routes: CLS 0 to 0.066 across measured runs.

**Analysis:** the blobs are `position: absolute` in a `fixed` container, and their keyframes change only `transform`. Transform changes do not contribute to layout shift, so the blobs are probably the most visible element that changed position, not the cause. The likeliest real causes are the 24 `<img>` tags without `width`/`height`/`sizes` (`src/pages/BlogsPage.tsx`, `src/components/home/LatestBlogsSection.tsx`, and others), which resize when their images arrive. This is a hypothesis and has not been tested.

**Fix:** (1) add explicit `width`/`height` or an `aspect-ratio` box to every image on list pages; (2) reserve space for the blog grid while data loads. Then re-check the shift entries with `tools/diag.mjs`, which already records shift sources.

**Acceptance check:** run `/blogs` 10 times with a cold cache (`tools/measure.mjs` with `ROUTES=/blogs`, repeated). CLS p75 ≤ 0.1, and no layout-shift entry with a source that is an `<img>` element.

---

## C7 — Images without intrinsic dimensions or lazy loading  (S, medium)

**Evidence (S):** `src/**/*.tsx` contains 26 `<img>` tags. Using a multi-line-aware scan, 24 have no `width`, `height`, or `sizes`, and 18 have no `loading` attribute. Several load remote Pexels/Unsplash photos at up to `w=2400` (for example `https://images.pexels.com/photos/1148820/...?w=2400` in the blog pages).

**Fix:** add dimensions or `aspect-ratio` to every `<img>`. Add `loading="lazy"` and `decoding="async"` to everything below the fold. Use a `srcset` or a smaller `w=` for remote images that render at card size.

**Acceptance check:** the scan above returns `withoutWidthHeightOrSizes: 0` for `src/**/*.tsx`, excluding hero images that are deliberately sized with CSS (listed in the report with a reason).

---

## C8 — Verified non-issues in the client

- **Rendering errors:** the dev build logged no React warnings, key warnings, hydration warnings, or uncaught exceptions on `/`, `/pricing`, `/docs`, `/blogs`, and `/compare`.
- **Animation loops:** the three `requestAnimationFrame` loops (`edge-mesh-globe.tsx`, `kinetic-grid.tsx`, `useCountUp.ts`) each call `cancelAnimationFrame`. The globe also pauses with an `IntersectionObserver` (`edge-mesh-globe.tsx:331–334`). None of the three files is in the eager startup module graph (`tools/import-graph.mjs` walks static imports from `src/main.tsx`), so they load only with the lazy routes or components that use them.
- **Charts:** `recharts` and `d3` load only through lazy routes or lazy components; they are not in the startup path (static graph check in `tools/import-graph.mjs`).
