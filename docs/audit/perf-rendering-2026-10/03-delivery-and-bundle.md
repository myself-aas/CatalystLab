# 03 — Startup path, bundle, delivery, and caching

Scope: `src/main.tsx`, `src/App.tsx`, `src/context/*`, `src/lib/firebase.ts`, `src/components/common/NewsletterModal.tsx`, `index.html`, `vite.config.ts`, `public/sw.js`, `server.ts`, `server/app.ts`.
Evidence grades: **M** measured, **S** static, **U** not measured.

---

## D1 — Firebase SDK is on the startup path of every route  (M size, S cause, high, M–L effort)

**Measured (M):** `vendor-firebase` is 553,627 bytes raw and 160,943 bytes gzipped. It is one of the modulepreloads in `dist/index.html`, so it downloads and parses before any route renders. It is 42% of the startup JavaScript (161 KB of 386 KB gzipped). Lighthouse `unused-javascript` reports about 394 KB of the Firebase chunk unused on `/` (desktop run). This matches the import graph.

**Why it is on the path (S):** the static import chain reaches Firebase three ways:
1. `src/main.tsx:5` imports `SubscriptionProvider` → `src/context/SubscriptionContext.tsx` → `src/lib/firebase.ts`. `src/main.tsx:4` also imports `AuthProvider` → `src/context/AuthContext.tsx`, which imports `../lib/firebase`. Both providers wrap the entire app.
2. `src/App.tsx:1` imports `NewsletterModal` → `src/components/common/NewsletterModal.tsx:4–5`, which imports `db` from `lib/firebase` and `firebase/firestore`. The modal is rendered on every page, even when closed.
3. `src/components/layout/NavbarSearch.tsx:20` imports `getBlogPosts` from `lib/firebase`. `NavbarSearch` is part of the eager `Navbar`.

**Fix:**
- Make `NewsletterModal` a lazy import, rendered only when opened (`React.lazy` plus `Suspense` at the call site).
- Load the auth and subscription providers without blocking first paint. Public routes do not need the Firebase Auth state to render. Protected routes already wrap in `ProtectedRoute`, so they can wait for auth state there.
- Replace the `getBlogPosts` import in `NavbarSearch` with a dynamic `import('../../lib/firebase')` on first search focus.
- Once the changes are in, `vendor-firebase` should appear only in the lazy chunks that need it.

**Acceptance check:** `npm run build`, then `grep -o 'modulepreload[^>]*vendor-firebase' dist/index.html` returns nothing. Also run `node tools/measure.mjs` with `ROUTES=/`: the raw JS total on `/` must drop from about 1,285 KB to ≤ 800 KB. Tighten the `initialRawKb` budget in `scripts/check-bundle-budget.mjs` to match (see 04-B2).

---

## D2 — Static assets are not compressed and not cached long-term when served by Express  (M, high, S effort)

**Where:** `server.ts:44` serves the build with `app.use(express.static(distPath))`, using default options. `server/app.ts` configures `helmet` (line 59) but has no compression middleware. Nothing in the repo (`vercel.json`, Dockerfile, or similar) adds compression at the edge.

**Measured (M), `curl -H 'Accept-Encoding: gzip'` against the local production server:**

| Resource | Raw | Response |
|---|---:|---|
| `/assets/vendor-firebase-*.js` | 553,627 B | no `Content-Encoding`; `Cache-Control: public, max-age=0` |
| `/` (`index.html`) | 6,224 B | no `Content-Encoding`; `max-age=0` |

**Impact estimate:** startup transfer is 1,673,897 bytes raw and 433,021 bytes gzipped (gzip -9), a 3.9× reduction. That is about 1.24 MB less transfer per first visit, if the production host does not already compress. Hashed `/assets/*` files also revalidate on every visit, which costs a round trip per file.

**Caveat:** the production host is not in the repository. Confirm the real response headers on the deployed site before reporting this as a production defect.

**Fix:**
- Add gzip/brotli. Either use the `compression` middleware before `express.static`, or enable compression at the CDN or host.
- Serve hashed assets with `Cache-Control: public, max-age=31536000, immutable`. Serve `index.html` and `sw.js` with `no-cache`. Example: `express.static(distPath, { index: false, setHeaders(res, p) { if (p.includes('/assets/')) res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); else res.setHeader('Cache-Control', 'no-cache'); } })`.

**Acceptance check:**
```bash
curl -sI -H 'Accept-Encoding: gzip, br' http://localhost:3000/assets/<any vendor js> | grep -i 'content-encoding\|cache-control'
# expect: content-encoding: gzip (or br), cache-control: ...immutable
```

---

## D3 — Google Fonts are render-blocking and fetched twice  (S, medium, S effort)

**Where:** `index.html:22–25`.
- Lines 22–23: `<link rel="preload" as="style">` for the Inter/JetBrains Mono CSS and the Material Symbols CSS.
- Lines 24–25: `<link rel="stylesheet">` for the same two URLs.

The preloads duplicate the stylesheet requests. The two stylesheets are render-blocking, so first paint waits for two cross-origin round trips to `fonts.googleapis.com`. The Material Symbols URL uses `display=block`, which keeps icon ligatures invisible for up to about 3 seconds while the font loads. Icons will appear as blank space before they render.

**Evidence:** static only (U). The sandbox cannot reach Google, so the real cost was not measured. Lighthouse's `render-blocking-resources` audit is the right check on a networked run.

**Fix:** self-host Inter, JetBrains Mono, and a subset of Material Symbols with `font-display: swap`. Remove the preloads and the `display=block` parameter. Until then, drop the duplicate preloads.

**Acceptance check:** on a networked Lighthouse run, `render-blocking-resources` lists no `fonts.googleapis.com` entries. Or, with self-hosting, `grep -c fonts.googleapis.com dist/index.html` returns 0.

---

## D4 — Service worker is network-first for every same-origin GET  (S, medium, S effort)

**Where:** `public/sw.js:36–60`. The `fetch` handler responds to every GET except `/api/` and Vite paths. It fetches from the network first and writes every successful same-origin response into the cache, including large images and hashed JS/CSS. The cache is used only when the network fails.

**Why it matters:** on a normal connection the cache never speeds anything up. Each request costs an extra cache write. The cache also keeps every old build's assets, which is storage use without a benefit.

**Registration:** `src/main.tsx:14–16` registers `/sw.js` in production only.

**Evidence:** static only (U).

**Fix:** keep network-first for navigations (HTML) so content stays fresh. Use cache-first for `/assets/*` (hashed, immutable), and do not cache anything else. Delete old cache versions on activate (the code already does this for `CACHE_NAME`).

**Acceptance check:** after one visit, a second visit's requests for `/assets/*.js` show `(ServiceWorker)` as the source in DevTools, with no network request. Or via the Cache API: the number of cached entries after loading `/` once is ≤ the number of HTML and manifest entries.

---

## D5 — `/docs` ships the most JavaScript  (M, medium, U cause)

**Measured (M):** `/docs` loads 14 JS files, 1,726 KB raw. The homepage loads 6 files, 1,285 KB. `/blogs` loads 7 files and 1,292 KB. The extra weight on `/docs` has not been traced to chunks in this audit.

**Next step (U):** open the docs route in `tools/measure.mjs` with the `requests` array printed, and map each JS URL to its chunk and source module via the Vite manifest. Check whether the docs pages import `recharts`, `motion`, or the full `lucide-react` set.

**Acceptance check:** `/docs` raw JS ≤ 1,300 KB after the fix, measured with `tools/measure.mjs`.

---

## D6 — CSS is large and unanalyzed  (M size, U cause, low–medium)

**Measured (M):** the app stylesheet is `index-*.css`, 357,646 bytes raw and 47,355 gzipped. It is render-blocking.

**Cause (U):** `src/index.css` is 1,300+ lines of custom utilities and keyframes. The large size is probably caused by many arbitrary Tailwind values (`bg-[...]`, `shadow-[...]`) generated across the components. This has not been checked by counting utilities in the compiled CSS.

**Fix (after measuring):** count unique generated utilities in the built CSS and remove unused custom utilities. Consider purging the design-system demo classes if they ship to production.

**Acceptance check:** built CSS raw ≤ 250 KB, measured with `ls -l dist/assets/index-*.css`.

---

## D7 — Remote photos are loaded at full size with no fallback  (S, low–medium)

**Evidence (S):** the blog pages and home sections load Pexels/Unsplash images with `w=1260` or `w=2400` in the URL, and in the diag run several of them returned 503 from the sandbox egress proxy (the sandbox cannot reach the image hosts, so this is not a site error). There is no `srcset`, no local fallback, and most `<img>` tags have no dimensions (see 02-C7).

**Fix:** use `srcset` with 640/1080/1600 widths for remote photos, or serve photos from the app's own `public/` directory where the license allows. Add `fetchpriority="high"` to the hero image only.

**Acceptance check:** Lighthouse `uses-responsive-images` and `image-delivery-insight` report no oversized images on `/` and `/blogs`.

---

## D8 — Verified non-issues in delivery

- **Source maps:** the client build ships no `.map` files. `vite.config.ts:97` sets `sourcemap: process.env.NODE_ENV !== 'production'`, and the observed result is no client `.map` files, both with `NODE_ENV=production` and with `NODE_ENV` unset (two separate builds). The only map is `dist/server.cjs.map` from the esbuild step, and `server.ts:38` returns 404 for `.map` requests. An earlier note that sourcemaps shipped was wrong.
- **Chunking:** the eager graph does not include `recharts`, `d3`, `cobe`, or the globe and count-up animation files (`tools/import-graph.mjs`). Route-level lazy loading works for the 48 `React.lazy` routes.
- **Preconnect and DNS prefetch:** `index.html:18–21` connects to the font and image origins early. This is correct, though the image origin is only useful if images load from it.
