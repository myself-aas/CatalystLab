# CatalystLab — Impeccable Audit (`$impeccable audit`, v4.7.0)

**How this ran:** `npx skills add pbakaus/impeccable -y --agent '*'` installed the skill to
`.agents/skills/impeccable` (plus `skills-lock.json` and agent symlinks). The skill launcher
(`scripts/impeccable context` and `… detect`) could not download its engine binary —
the release redirect host (`objects.githubusercontent.com`) is blocked in this sandbox
(curl exit 35) — so, per SKILL.md's launcher-unavailable path, project context was read
directly. **No PRODUCT.md or DESIGN.md exists** (noted, not invented; see A-9).
The bundled deterministic detector therefore **did not run**; findings below are from
scripted source scans across the audit's 5 dimensions, each verified in context, with
false positives called out explicitly. Rendered/browser checks (contrast pixel reads,
touch-gesture synthesis, viewport screenshots) did **not** run — scores rest on code
evidence only. Baseline includes the previous session's token fixes
(`docs/design-system-audit.md`): `npm run check:design` ✓, bundle budget ✓, 330/330 tests.

### Audit Health Score

| # | Dimension | Score | Key Finding |
|---|-----------|-------|-------------|
| 1 | Accessibility | **2/4** | Clickable `<div>`s (incl. dashboard navigation cards) are keyboard-inaccessible |
| 2 | Performance | **2/4** | 4.9 MB of unoptimized hero JPGs; initial gzip within 16 kB of budget cap |
| 3 | Theming | **2/4** | Token foundation repaired, but 934 arbitrary hex utilities bypass it |
| 4 | Responsive Design | **2/4** | Breakpoints present; verified sub-44px icon buttons and no rendered overflow check |
| 5 | Implementation Integrity | **1/4** | Systemic drift: two competing CSS systems + duplicate component trees |
| **Total** | | **9/20** | **Poor (major overhaul of weak dimensions)** |

### Implementation Integrity Verdict

**Fail.** The implementation does not yet express one coherent, product-specific system:
a 1,143-line unlayered `patch.css` still competes with the token system in `src/index.css`
(winner decided by import order), root `components/` duplicates `src/components/`, and
colour is specified as raw hex in 934 utility classes. The product-specific system *exists*
(enzyme hue tokens, semantic tokens — repaired last pass) but is routinely bypassed.
Verified evidence: A-7 (token bypass), Patterns §1 (dual CSS systems), A-9 (missing design docs). Detector findings: none (engine unavailable — above);
all findings below are human-verified source evidence, not detector output.

### Executive Summary

- Audit Health Score: **9/20 (Poor)**
- Issues: **1×P0, 4×P1, 4×P2, 2×P3** (P3s deliberately few)
- Top critical issues: keyboard-inaccessible clickable divs (A-1); 4.9 MB hero imagery
  with minimal lazy-loading (A-2); token bypass at scale (A-5); dual CSS systems (A-6);
  invisible-to-sighted hero (A-5, carried from the frontend-design audit).
- Recommended next steps: `$impeccable harden` (A-1) → `$impeccable optimize` (A-2) →
  `$impeccable extract` (A-5/A-6) → `$impeccable polish`.

---

## Detailed Findings by Severity

### [P0] A-1 — Clickable `<div>`s are not keyboard- or AT-operable
- **Location:** `src/components/dashboard/DashboardMetricsBentoGrid.tsx:60,142,209,275,338,401` (six metric cards navigating via `onClick`); `src/components/RateLimitBadge.tsx:17,39` (has `focus-visible:` styles on a `<div>` with no `tabIndex` — the focus ring can never appear); 18 `<div>/<span> onClick` sites total, incl. `NavbarSearch.tsx:429`, `UserDashboardPage.tsx:633`, `PlaygroundPage.tsx:866`.
- **Category:** Accessibility
- **Impact:** Keyboard and switch-device users cannot activate primary dashboard navigation or the quota badge at all; screen readers announce nothing actionable. `TrailCard.tsx:47` shows the intended pattern (`tabIndex`, key handling) applied inconsistently.
- **WCAG/Standard:** WCAG 2.1.1 Keyboard (A), 4.1.3/2.1.3 name-role-value (A/4.1.2).
- **Recommendation:** Convert to `<button>`/`<a>` (or add `role="button"`, `tabIndex={0}`, Enter/Space handlers where a div is unavoidable); delete dead `focus-visible` classes on non-focusable nodes.
- **Suggested command:** `$impeccable harden`

### [P1] A-2 — Hero imagery ships 4.9 MB unoptimized; lazy-loading is rare
- **Location:** `src/assets/images/` — `about_us_hero…jpg` 1.19 MB, `allostersearch_llmo…jpg` 1.34 MB, `catalyst_bg_2…jpg` 1.06 MB, hero images 0.58–0.66 MB; only **9** `loading="lazy"` attributes across 30 `<img>` tags and 40+ component image usages; no `srcset`/responsive variants found.
- **Category:** Performance
- **Impact:** On mobile/slow networks the Persuade surface pays megabytes before the audit CTA is usable; LCP and data costs suffer most for first-time visitors.
- **WCAG/Standard:** Web Vitals / LCP budget (project `.lighthouserc.json`).
- **Recommendation:** Generate resized WebP/AVIF variants (`srcset` + `sizes`), lazy-load below-the-fold imagery, keep one eager hero image max, wire `scripts/verify-media.mjs` into CI if not already gated.
- **Suggested command:** `$impeccable optimize`

### [P1] A-3 — Bundle is one dependency away from its own budget ceiling
- **Location:** `npm run check:bundle` — initial gzip **524 kB / 540 kB budget (16 kB headroom)**; largest chunk `vendor-firebase` 585 kB raw; 160 `backdrop-blur` usages and 25 heavy blur utilities compound GPU cost on low-end devices.
- **Category:** Performance
- **Impact:** Any modest dependency addition breaks the project's own gate; pervasive backdrop blur risks frame drops on integrated GPUs during scroll.
- **WCAG/Standard:** Project bundle budget (`scripts/check-bundle-budget.mjs`); WCAG 2.3.3-adjacent motion/perf guidance.
- **Recommendation:** Split/lazy-load Firebase surfaces, audit blur usage to overlays that need it, tighten the ratchet after each win (per the budget script's own rule).
- **Suggested command:** `$impeccable optimize`

### [P1] A-4 — Sub-readable text is the norm in data-dense UI
- **Location:** 758 utilities at `text-[9px]/[10px]/[11px]` (408× 10px) across `src/`; e.g. `RateLimitBadge.tsx` compact badge at 11px mono.
- **Category:** Accessibility
- **Impact:** Users with low vision (and anyone on a phone at arm's length) cannot read quota, status and telemetry labels without zoom; zooming a fixed dashboard layout invites horizontal scroll (64 `overflow-x-auto` regions).
- **WCAG/Standard:** WCAG 1.4.4 Resize Text (AA) in spirit; 1.4.12; platform HIG minimums.
- **Recommendation:** 12px floor for readable text (11px permitted only for mono data labels), introduce `--text-*` scale tokens so sizes are chosen, not typed per component.
- **Suggested command:** `$impeccable typeset`

### [P1] A-5 — Visible hero has no heading or primary action (sighted users)
- **Location:** `src/components/home/HeroSection.tsx` — H1, copy and audit form exist only in an `sr-only` block; the visible viewport is an autoplaying 3D carousel + logo marquee.
- **Category:** Implementation Integrity / Accessibility (parity)
- **Impact:** Screen-reader users get the proposition sighted users never see — an inverted parity problem; sighted visitors get no visible H1 (SEO/outline) and no visible way to start the core task.
- **WCAG/Standard:** WCAG 1.3.1/2.4.6 (headings describe visible content); parity principle.
- **Recommendation:** Make the audit form the hero's visible, orchestrated moment; demote the carousel to proof; remove the `sr-only` duplicate (also removes a duplicate-form maintenance hazard).
- **Suggested command:** `$impeccable shape` (then ordinary new-work for the surface)

### [P2] A-6 — Global `0.01ms` reduced-motion kill destroys useful feedback
- **Location:** `src/index.css` `@media (prefers-reduced-motion: reduce)` sets `animation/transition-duration: 0.01ms !important` on `*, *::before, *::after` (the block exists twice, ~lines 996 and 1610).
- **Category:** Accessibility
- **Impact:** The audit playbook explicitly flags this pattern: it removes *state-change* feedback (focus transitions, expand/collapse affordance) along with decorative motion, and the duplication means edits to one block silently lose.
- **WCAG/Standard:** WCAG 2.3.3 Animation from Interactions (AAA guidance); playbook motion-sensitivity criterion.
- **Recommendation:** Replace the blanket kill with targeted removal of transform/opacity spectacle while preserving instant-but-visible state changes; delete the duplicate block.
- **Suggested command:** `$impeccable animate`

### [P2] A-7 — Tokens exist but are bypassed at scale (theming drift)
- **Location:** 934 arbitrary hex utilities (`bg-[#F0FAFF]` ×481, `text-[#F0FAFF]` ×260…) and 1,144 hex literals in TSX; the ice text colour is also a *background* in hundreds of places, so it cannot be re-themed centrally. Contrast risk verified by computation: legacy `#F0FAFF` text on white is **1.06:1** wherever old utilities meet light surfaces.
- **Category:** Theming
- **Impact:** Any palette correction (like last pass's semantic repair) cannot reach these components; light-theme leaks keep appearing one component at a time.
- **WCAG/Standard:** WCAG 1.4.3 Contrast (AA) exposure; token-system integrity.
- **Recommendation:** Migrate directory-by-directory to semantic utilities (`bg-primary`, `text-foreground`…), then ban raw hex in TSX via lint; `npm run check:design` already guards the token layer.
- **Suggested command:** `$impeccable extract`

### [P2] A-8 — Touch targets below 44px on icon actions
- **Location:** 13 verified `<button>`s sized by `p-1`/`p-1.5` padding only (e.g. `RateLimitModal.tsx:43` close, `LiveCronLogStream.tsx:101,124`, `DashboardShell.tsx:327`); hundreds of `h-6/h-7/h-8` elements are icon *containers* (not counted — verified non-targets).
- **Category:** Responsive Design
- **Impact:** Modal close and log-stream controls are miss-tap-prone on touch; particularly costly inside dialogs where the close button is the escape hatch.
- **WCAG/Standard:** WCAG 2.5.8 Target Size Minimum (AA, 24px) / 2.5.5 (AAA, 44px); Apple HIG 44pt.
- **Recommendation:** Give icon buttons a 40–44px hit area (`min-h/min-w` or `p-2.5` + icon), visually unchanged.
- **Suggested command:** `$impeccable adapt`

### [P2] A-9 — No PRODUCT.md / DESIGN.md — the system lives in code and two audit docs
- **Location:** Repo root (absent); nearest context is `AGENTS.md` + `docs/design-system-audit.md`.
- **Category:** Implementation Integrity
- **Impact:** Every future agent/contributor re-derives product truth; the skill's context loader has nothing durable to load, which is how drift like A-5/A-6 accumulates.
- **WCAG/Standard:** —
- **Recommendation:** Run `$impeccable init` (product context) and `$impeccable document` (DESIGN.md from the repaired token system); report-only here per audit rules — drift is reported, not repaired as a side effect.
- **Suggested command:** `$impeccable document`

### [P3] A-10 — Heading-count anomalies to verify in rendered routes
- **Location:** `AdminDashboardPage.tsx:72,170` (two `<h1>`s — may be alternate views), `ProtectedRoute.tsx:62,122` and `BlogPostPage.tsx:60,111` (verified conditional branches — **not** simultaneous, false-positive risk noted).
- **Category:** Accessibility
- **Impact:** If both AdminDashboard H1s render together, the outline has two top-level headings.
- **WCAG/Standard:** WCAG 1.3.1 (AA practice).
- **Recommendation:** Verify in a rendered pass (detector/live when available); demote the card-title H1 to H2 if co-present.
- **Suggested command:** `$impeccable audit` (re-run with engine/browser)

### [P3] A-11 — `transition-all` (248) and resting `will-change` as defaults
- **Location:** 248 `transition-all` utilities; `will-change` in CSS card hovers (`.framer-card-hover`) and 6 TSX sites.
- **Category:** Performance
- **Impact:** Minor: animating unspecified properties can include layout properties; resting `will-change` wastes compositor memory. No layout-property keyframe animation was found (verified).
- **WCAG/Standard:** Perf practice (playbook §2).
- **Recommendation:** Name transitioned properties (`transition-[border-color,box-shadow]`); scope `will-change` to `:hover`/active states.
- **Suggested command:** `$impeccable polish`

---

## Patterns & Systemic Issues

1. **Automation without guardrails wrote the design system twice** — root `fix_*`/`replace_*` scripts produced both the flattened palette (previous audit) and today's 934 hex utilities. The fix is process, not taste: tokens + lint + `check:design`.
2. **Interactivity is re-implemented per component** — divs-as-buttons (18), bespoke focus handling, 377 raw `<button>`s vs a small shared primitive set; the correct pattern already exists in-tree (`TrailCard`, modal close buttons with `aria-label`) but isn't the default.
3. **Density is achieved by shrinking type, not by hierarchy** — 758 sub-12px utilities, `xl:` breakpoint used only 6 times vs `sm:` 837: layouts are tuned for desktop-first density and merely survive mobile.
4. **Performance budgets exist and pass — barely** — the ratchet culture in `check-bundle-budget.mjs` is right; image weight sits outside that culture entirely.

## Positive Findings (keep and replicate)

- **Token-layer contrast now passes AA everywhere measured:** dark body 15.1:1, dark success/warning/danger 8.3/9.6/5.8:1, light primary-on-white 6.2:1, light muted 5.0:1 (computed from tokens).
- **Focus visibility is a habit:** 497 `focus-visible:` usages; skip-link, `main`/`contentinfo` landmarks, and heading roles are covered by tests in `src/tests/ui/accessibilityAndContrast.test.tsx` (330/330 tests pass).
- **Bundle governance:** `check:bundle` passes all six budgets with a documented tighten-only ratchet; route-level code-splitting (73 chunks).
- **Alt-text hygiene:** the only `<img>` without `alt` in the scan is an XSS test fixture (`phase1Hardening.test.tsx`) — a verified false positive.
- **Reduced-motion awareness, print stylesheet, safe-area tokens, tabular numerals** (`.metric-tabular`) are all present — the floor exists; it needs consistency, not invention.

## Recommended Actions

1. **[P0] `$impeccable harden`** — make all 18 clickable divs keyboard/AT-operable (A-1)
2. **[P1] `$impeccable optimize`** — responsive image pipeline + Firebase chunk split (A-2, A-3)
3. **[P1] `$impeccable typeset`** — type-scale tokens, 12px readable floor (A-4)
4. **[P1] `$impeccable shape`** — visible hero with the audit as its one moment (A-5)
5. **[P2] `$impeccable extract`** — token migration waves, merge `patch.css`, delete duplicate trees (A-7, Patterns §1)
6. **[P2] `$impeccable animate`** — replace the 0.01ms kill with intentional reduced-motion states (A-6)
7. **[P2] `$impeccable adapt`** — 44px hit areas for icon actions (A-8)
8. **[P2] `$impeccable document`** — DESIGN.md (+ `$impeccable init` for PRODUCT.md) (A-9)
9. **[P3] `$impeccable polish`** — final pass (transition/will-change hygiene) as the last step

> You can ask me to run these one at a time, all at once, or in any order you prefer.
>
> Re-run `$impeccable audit` after fixes to see your score improve.

---

## Re-audit (after running all nine commands, 2026-10-21)

All nine commands were run in the prioritized order at the owner's instruction.
Decisions confirmed via structured questions: hero = **run an audit first**,
users = **all audiences**, north star = **Mission Control**, hero fidelity =
**production rebuild**.

| # | Dimension | Before | After | Evidence |
|---|-----------|--------|-------|----------|
| 1 | Accessibility | 2 | **3** | A-1 clickable divs now keyboard-operable (`src/lib/keyboard.ts`, 17 sites + backdrop `aria-hidden`); A-4 9/10px text eliminated (11px data floor); A-5 visible H1 + native form; A-6 reduced-motion is intentional, not a 0.01ms kill. Remaining: full 12px migration for non-data 11px labels. |
| 2 | Performance | 2 | **3** | Real JPEGs re-encoded: 578→71 KB and 659→101 KB (−87%); lazy/decoding added across 15 files; bundle budgets still pass. **New finding:** 4 of 6 `.jpg` assets are corrupted in git (UTF-8 replacement bytes, no image data) — unrecoverable by optimization; they need re-supply from source. Firebase chunk (585 KB) unchanged — route-splitting remains open. |
| 3 | Theming | 2 | **3** | 307 arbitrary hex utilities migrated to semantic tokens to semantic tokens; radius unified at 16px panels. Remaining: 627 arbitrary hex utilities (934 → 627; migration continues directory-by-directory). Re-scan residual clickable divs: only TrailCard (has its own tabIndex/key parity) and the aria-hidden backdrop. |
| 4 | Responsive | 2 | **3** | 44px hit areas on verified icon buttons (7 files); hero form stacks with 44px targets and 16px input text. Rendered/touch-gesture verification still not possible in this sandbox (detector engine download blocked) — stated, not assumed. |
| 5 | Implementation Integrity | 1 | **3** | PRODUCT.md, DESIGN.md (+ `.impeccable/design.json` sidecar) and a shape brief now exist; shared keyboard primitive replaces per-component reinvention; root `components/` verified as an intentional re-export shim (not dead code — earlier deletion recommendation withdrawn). Remaining: merge `patch.css` into layers. |
| **Total** | | **9/20** | **15/20** | **Good (address weak dimensions)** |

Verification: `npm run check:design` ✓ · `npm run typecheck` ✓ · `npx vite build` ✓ ·
`npm run check:bundle` ✓ · `npm test` **330/330 passed**.

Command log: `harden` keyboard parity + backdrop; `optimize` image re-encode +
lazy loading; `typeset` role scale tokens (`text-display/headline/title/body/label/data`),
12px-floor groundwork, balanced headings; `shape` brief at `docs/hero-shape-brief.md`;
`extract` semantic-token migration waves + radius unification; `animate`
intentional reduced-motion states; `adapt` 44px targets; `document`
DESIGN.md + PRODUCT.md + sidecar; `polish` `transition-all`→`transition` (99 files),
dead focus styles revived, test suite aligned to the new hero composition.

---

## Palette refactor + media replacement (2026-10-21, owner brief)

The owner pinned a five-colour **Clean SaaS** palette and directed a global
implementation, with all existing images replaced by generated media and a
HyperFrames launch film. Eleven skills were fetched and read (temp captures):
hyperframes, frontend-design, vercel-react-best-practices, design-taste-frontend
(the repo's only skill — the requested `high-end-visual-design` and
`redesign-existing-projects` names do not exist in leonxlnx/taste-skill),
ai-image-generation (qu-skills and magentosh copies are byte-identical),
domain-modeling, ai-video-generation, product-launch-video. The pinned brief
wins over every skill's palette defaults, per frontend-design.

- **Palette**: tokens in `src/index.css` now carry #2563EB (action, both
  themes), #1E40AF (hover), #F3F4F6 (muted), #FFFFFF (canvas/cards), #111827
  (ink/dark canvas). Light is the default theme (saved preference still wins).
  200+ charcoal-era hex utilities migrated; DESIGN.md, ADR
  `docs/adr/0001-clean-saas-palette.md`, and the `check:design` guardrail were
  updated to pin the palette. Assay/severity hues survive as data colours only.
- **Images**: all six `src/assets/images/*.jpg` replaced with generated
  photorealistic assets (operations room, team, data centre, AI search, ambient
  glass, catalyst mark) — this also repairs the four previously-corrupted
  files. Sizes 62–238 KB (valid JPEG, magic bytes verified).
- **Video**: `videos/catalystlab-launch/` — HyperFrames product-launch
  composition (BRIEF.md, STORYBOARD.md silent marker `music: none`, palette +
  generated images, seekable GSAP timeline). `hyperframes check` lint: **0
  errors**; the runtime/render path requires a Chrome binary that this sandbox
  cannot download, so **no MP4 render is claimed** — run `npm run render` in
  that folder on a machine with Chrome.
- **Domain modeling**: `GLOSSARY.md` created (Audit/Assay/Engine/Finding/
  Severity/Report/Quota/Operator).
- **React**: route code-splitting already present (48 lazy imports verified);
  added `content-visibility` for below-fold home sections.

Verification: check:design ✓ · typecheck ✓ · vite build ✓ · bundle ✓ · tests 330/330 ✓.

---

## Page media + logo system (2026-10-21, owner brief)

- **Page images (8 new, generated, on-palette):** `page-pricing.jpg`,
  `page-products.jpg`, `page-methodology.jpg`, `page-contact.jpg`,
  `page-security.jpg`, `page-api.jpg`, `page-accessibility.jpg`,
  `page-blog-performance.jpg` — wired into Pricing, Products, Security,
  API Docs, and Contact heroes (Methodology renders About, which carries the
  team image). Blog covers and author avatars in `src/data/engineBlogs.ts`
  no longer hotlink Pexels (0 references left there); the central
  `src/lib/media/registry.ts` scene/avatar constants (U_/P_) now resolve to
  the self-hosted generated assets.
- **Logo system:** the generated catalyst-molecule photograph was redrawn as
  vector geometry — reaction centre + three bonded nodes in #2563EB/#1E40AF.
  `public/logo-mark.svg`, `public/logo.svg` (lockup), `public/favicon.svg`
  (Ink Navy tile), and PIL-rendered PNGs `logo.png`, `logo-mark.png`,
  `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`. `BrandLogo` now
  renders the molecule (no more generic Terminal glyph) with a royal beacon;
  the wordmark's "Lab" is Royal Blue. `manifest.json` uses the PNG icons and
  palette colours.
- **Social cards:** `public/og-image.png` and `public/og-banner.png`
  (1200×630, generated hero photo + ink gradient + white lockup, 243 KB) —
  previously both meta targets pointed at files that did not exist.
- **Limits hit, honestly:** the per-turn image cap (10) was reached, so a
  third distinct author portrait (`avatar-3.jpg`) is still to generate; two
  portraits currently cover the avatar slots. `MEDIA_REGISTRY`'s deep
  catalogue entries and the V_ Pexels video files remain licensed remotes
  with fallback chains — replacing those needs either the HyperFrames render
  (Chrome, unavailable here) or a generated-video provider with credentials.

### Product photoshoot pass (higgsfield-product-photoshoot skill)
The skill was fetched and read in full (supporting files resolve to
`/tmp/skills-use-Osfe8e/higgsfield-product-photoshoot/SKILL.md` — SKILL.md only).
Its bootstrap could not complete in this sandbox: the CLI install script and
the npm package's binary both download from GitHub release hosts that are
blocked here, and `higgsfield auth login` is interactive — so no Higgsfield
job was submitted and no Higgsfield URLs are claimed. The skill's mode system
was applied with this environment's image generation instead, for the product
(CatalystLab platform) in the Clean SaaS world:
- `hero_banner` → `src/assets/images/page-products.jpg` replaced (device trio,
  royal-blue dashboards, white studio, 82 KB) and is the Products hero.
- `product_shot` → `product-studio.jpg` (single laptop, white catalog ground),
  now the SynthShift engine image.
- `lifestyle_scene` → `product-lifestyle.jpg` (engineers using the platform),
  now the Products parallax banner.
Products data (`src/data/engines.ts`) now has **zero** Pexels image hotlinks.
If Higgsfield auth becomes available, re-run:
`higgsfield product-photoshoot create --mode hero_banner --prompt "CatalystLab dashboard on devices, Clean SaaS royal blue" --image src/assets/images/page-products.jpg --count 3`.

## Meta design system adoption + Lighthouse CI fix (2026-10-21)

CI diagnosis: the only failing check was Lighthouse CI — `/blogs` Accessibility 87 < 90
budget in `scripts/report-lhci.mjs --strict`. All other checks (Gates, E2E/CSP,
Security, Vercel, Media Verification) passed.

CI fixes:
- `/blogs`: `button-name` — icon-only filter button had no accessible name → added
  `type="button" aria-label="Filter articles"`.
- `/blogs` + `/`: `heading-order` — the shell rendered a duplicate "Discover" h1
  above the real page heading → shell heading demoted to `<p>`, page heading is the
  single h1, article titles h2 (no skips).
- `/blogs`: `color-contrast` — white-based `rgba(240,250,255,…)` text/borders left
  from the dark-canvas era were near-invisible on the light canvas → replaced with
  ink/muted-foreground tokens.

Meta system (voltagent/awesome-design-md `design-md/meta/DESIGN.md`) adopted globally:
tokens in src/index.css + patch.css + src/styles/card-tokens.css —
- Marketing primary CTA = ink-button #000000 (pressed #444950); cobalt #0064E0
  (hover #0457CB) reserved for purchase CTAs only → pricing popular plan uses
  `ds-btn-buy`.
- Canvas #FFFFFF, surface-soft #F1F4F7, ink #1C1E21,ink-deep #0A1317 (dark canvas),
  slate #4B4C4F, hairlines #CED0D4/#DEE3E9; buttons 100px pills (never squared).
- Optimistic VF type scale (64/48/36/28/24, weights 500 + 300 editorial, body
  16px/1.5/−0.16px); Optimistic is proprietary → Inter fallback stack; Space Grotesk
  dropped (also removes the fonts.gstatic 503 seen in CI on /pricing).
- Cards: 32px photo/feature radius, 16px inner tiles (`card-tokens.css`).
- DESIGN.md front-matter rewritten to Meta tokens; ADR 0001 marked superseded.
- `check-design-tokens.mjs` re-pinned to Meta ink-button/cobalt tokens.
