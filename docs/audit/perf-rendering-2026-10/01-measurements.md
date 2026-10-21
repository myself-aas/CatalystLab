# 01 — Measurements (lab evidence)

> **Status (2026-10-21): dated record — kept verbatim as evidence, not rewritten.** Supporting evidence for the 2026-10 performance audit; current baselines: [`docs/ops/slo.md`](../../ops/slo.md).

Date: 2026-10-19. Build: `npm run build` with `NODE_ENV=production`, served by `node dist/server.cjs` on port 3000. Browser: headless Chromium 153 via `@sparticuz/chromium`, 1366×900 viewport, no CPU or network throttling unless noted.

**Read these numbers as relative, not absolute.** The sandbox CPU is slow, there is no GPU, and Chromium composites in software. Google Fonts, Firestore, and Pexels are unreachable from the sandbox, so those requests fail fast. Real-device numbers will differ. The A/B comparisons inside one run are the reliable part.

Tools: `tools/` (see `tools/README.md`). Raw output lived in `/tmp/perf/results/` during the audit and is not committed.

---

## 1. Route load and interaction (`tools/measure.mjs`, one run per route)

| Route | LCP ms | FCP ms | CLS | Load-time long tasks (ms) | DOM nodes | `.group` cards | JS transferred (raw KB, files) |
|---|---:|---:|---:|---:|---:|---:|---:|
| `/` | 896 | 896 | 0 | 137 (1 task) | 1273 | 37 | 1285 (6) |
| `/pricing` | 880 | 368 | 0.050 | 0 | 617 | 6 | 1301 (8) |
| `/docs` | 480 | 480 | 0.059 | 0 | 645 | 11 | **1726 (14)** |
| `/compare` | 308 | 308 | 0.018 | 0 | 510 | 6 | 1302 (8) |
| `/blogs` | 292 | 244 | **0.352** (see §4) | 0 | 383 | 9 | 1292 (7) |
| `/contact` | 288 | 288 | 0.050 | 0 | 617 | 7 | 1334 (7) |
| `/login` | 284 | 284 | 0 | 0 | 393 | 7 | 1385 (9) |

Desktop route load is fast in this lab (LCP at or under 0.9 s on every route). The outliers are `/` (the only page with a long task during load and the most `.group` cards), `/docs` (the most JS), and the `/blogs` layout shift.

### Interaction bursts on each route (same run)

| Route | Mouse: 288 moves, long tasks | Mouse: script ms | Scroll: 25 wheel ticks, p95 frame ms | Scroll: frames over 50 ms |
|---|---|---:|---:|---:|
| `/` | **68 tasks, 3,478 ms** | 703 | 267 | 42 |
| `/pricing` | 0 | 80 | 150 | 26 |
| `/docs` | 0 | 99 | 200 | 13 |
| `/compare` | 0 | 84 | 133 | 20 |
| `/blogs` | 0 | 96 | 117 | 17 |
| `/contact` | 0 | 128 | 217 | 16 |
| `/login` | 0 | 92 | 183 | 26 |

Scroll numbers vary between runs. The median of three reps on `/` in §2 gave p95 283 ms and 65 janky frames.

---

## 2. A/B experiments

### 2a. Global `mousemove` listener (`tools/diag.mjs`, 288 moves on `/`, 4 alternating runs)

The variant "blocked" removes only `window` `mousemove` listeners at page load. Everything else is unchanged.

| Run | Listener | Long tasks | Long-task ms | Max task ms | Style recalc ms | Script ms |
|---|---|---:|---:|---:|---:|---:|
| 1 | on | 68 | **4,095** | 140 | **10,265** | 685 |
| 2 | blocked | 0 | 0 | 0 | 1,283 | 428 |
| 3 | on | 46 | **2,799** | 139 | **9,341** | 640 |
| 4 | blocked | 0 | 0 | 0 | 1,183 | 400 |

**Result:** the global handler accounts for nearly all long-task time during mouse movement on the homepage. It is confirmed as the main cause of mouse-driven lag (finding C1).

### 2b. Scroll and CLS variants (`tools/ab2.mjs`, median of 3 scroll reps, external hosts blocked)

| Route | Variant | CLS (load) | Scroll p50 ms | Scroll p95 ms | Janky frames |
|---|---|---:|---:|---:|---:|
| `/` | baseline | 0 | 33 | **283** | **65** |
| `/` | `backdrop-filter` disabled | 0 | 17 | **67** | **13** |
| `/` | ambient layer hidden | 0 | 17 | 167 | 29 |
| `/` | blob animation disabled | 0 | 17 | 267 | 48 |
| `/blogs` | baseline | 0.005 | 17 | 17 | 1 |
| `/blogs` | `backdrop-filter` disabled | 0.294 | 17 | 17 | 0 |
| `/blogs` | ambient layer hidden | **0** | 17 | 17 | 0 |
| `/blogs` | blob animation disabled | 0.294 | 17 | 17 | 0 |

- **Scroll on `/`:** disabling `backdrop-filter` cut p95 by about 4× and janky frames by about 5×. This is the largest rendering lever (finding C2). The software renderer probably overstates blur cost, so treat the magnitude as an upper bound.
- **Ambient layer:** hiding it helps moderately (p95 283 → 167). The blob animation alone does nothing measurable (267), so the animation is not the cost. The cost is the layer's blur and noise filter.
- **`/blogs` CLS:** the baseline run scored 0.005, while the earlier baseline run scored 0.352. Treat the shift as intermittent. Hiding the ambient layer gave 0 in one run, which is not enough to attribute it (see C6).

### 2c. Startup JavaScript and CSS composition (from `dist/`, gzip -9)

| Chunk (loaded on `/`) | Raw bytes | Gzip bytes |
|---|---:|---:|
| `vendor-firebase` (modulepreloaded) | 553,627 | 160,943 |
| `index` (app entry) | 351,437 | 91,375 |
| `vendor-react` | 181,652 | 59,345 |
| `vendor-motion` | 137,588 | 43,724 |
| `vendor-utils` | 56,435 | 19,395 |
| `vendor-icons` | 35,512 | 10,884 |
| **JS subtotal** | **1,316,251** | **385,666** |
| `index` CSS | 357,646 | 47,355 |
| **Startup total** | **1,673,897** | **433,021** |

Note: `vendor-charts` (392,639 raw) is **not** in the startup path. It loads only on pages that use charts. The earlier suspicion that it was preloaded was wrong.

Firebase is about 42% of startup JavaScript (161 KB of 386 KB gzipped). It is loaded on every route (finding D1).

---

## 3. Transfer and caching (`curl`, `Accept-Encoding: gzip`)

| Request | Response |
|---|---|
| `GET /assets/vendor-firebase-*.js` | `Content-Length: 553627`, **no `Content-Encoding`**, `Cache-Control: public, max-age=0`, ETag |
| `GET /` (`index.html`) | `Content-Length: 6224`, **no `Content-Encoding`**, `Cache-Control: public, max-age=0` |
| `GET /sw.js` | `Cache-Control: public, max-age=0` |
| `GET /manifest.json` (repeat) | `304 Not Modified` on revalidation |

Headers were checked against the local Express server only. The repo has no `vercel.json`, Dockerfile, or other hosting config, so the production CDN/proxy headers are unknown. If production serves this Express app directly, JS and CSS ship uncompressed and revalidate on every visit (finding D2).

---

## 4. Lighthouse (`tools/lh.mjs`, simulated throttling; sandbox CPU)

| Preset | Route | Performance | FCP | LCP | TBT | CLS | Notes |
|---|---|---:|---:|---:|---:|---:|---|
| desktop | `/` | **not obtained** | 1.7 s | 2.1 s | 0 | 0 | `NO_SCREENSHOTS`; metrics valid, score not computed |
| desktop | `/pricing` | 75 | 1.8 s | 2.1 s | 0 | 0.047 | |
| desktop | `/docs` | **not obtained** | 1.8 s | 2.2 s | 0 | 0.056 | `NO_SCREENSHOTS` |
| mobile | `/` | 56 | 10.2 s | 11.3 s | 0 | 0 | main-thread work 23.7 s |
| mobile | `/pricing` | 55 | 10.3 s | 11.2 s | 0 | 0.066 | main-thread work 16.6 s |
| mobile | `/docs` | 55 | 10.4 s | 11.5 s | 0 | 0.064 | main-thread work 16.3 s |

The mobile LCP of about 11 s is inflated by the sandbox CPU. The desktop FCP of 1.7 s on localhost shows how slow this machine is, so only compare the routes against each other.

Lighthouse did not produce a usable main-thread attribution in this sandbox ("Other" dominates), so per-script blame is not available from Lighthouse. Lighthouse `unused-javascript` put Firebase at about 394 KB of unused code on `/`. That figure is consistent with the module graph (finding D1).

The `uses-text-compression` and `uses-long-cache-ttl` audits were absent from this Lighthouse version's output. Compression and caching are therefore confirmed by `curl` only (§3).

---

## 5. Console and runtime errors (`tools/measure.mjs`, `tools/devwarn.mjs`)

- **Production build, six routes:** no uncaught page errors. The 7–31 console messages per route were all network failures to hosts the sandbox cannot reach (Google Fonts, `www.google.com`, Firestore, Pexels). The app's own `/api/*` calls returned no errors on the measured routes.
- **Dev build (`vite`, port 3001), five routes (`/`, `/pricing`, `/docs`, `/blogs`, `/compare`):** no React warnings, no key or hydration warnings, no uncaught exceptions. The only message was the aborted external font request, which the script blocked on purpose.

**Conclusion for "rendering issues":** the reproducible rendering problems are the mouse lag (C1), scroll jank from blur and ambient effects (C2, C3), and an intermittent layout shift on `/blogs` (C6). None of them are React errors or warnings.

---

## 6. Reproduce

```bash
cd /home/user/CatalystLab && NODE_ENV=production npm run build
NODE_ENV=production node dist/server.cjs            # port 3000
# in a scratch folder with the tools installed (see tools/README.md)
node measure.mjs; node diag.mjs; node ab2.mjs; node lh.mjs
```
