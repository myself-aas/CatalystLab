# Theme Audit — Visual Consistency & Color Contrast (light / dark)

Date: 2026-10-22 · Branch: `arena/d95acddd-catalystlab` · Auditor: Arena agent
Scope: rendered CatalystLab frontend, both themes, public routes (`/`, `/products`, `/audit`, `/ai-readiness`, `/pricing`, `/blogs`) plus token-level review of authenticated surfaces (admin/dashboard components).
Criteria: WCAG 2.1 — SC 1.4.3 text 4.5:1 (large text 3:1), SC 1.4.11 non-text/graphics 3:1.

## Method

1. **Token math** — `tools/contrast-math.py` computes WCAG ratios (alpha composited over the real surface) for every foreground/background pair in the light (`html:not(.dark)`) and dark (`html.dark`) token systems, including semantic, chart, and control-boundary pairs. Full output: `evidence/contrast-table-2026-10-22.md`.
2. **Live computed-style probe** — `tools/theme-audit.mjs` (puppeteer + headless chrome) loads each route in each theme (preference via `localStorage.catalystlab_theme_preference`), records computed color/effective background for key selectors (`evidence` in `/tmp/theme-probe.json` at run time), and screenshots each route.
3. **Invisible-ink sweep** — a dark-theme pass over every visible `button/a/[role=button]` flags text-vs-background ratios < 2:1 (alpha backgrounds excluded from verdicts; solid-background hits are real).
4. **Visual review** — contact sheets `evidence/sheet-light.png`, `evidence/sheet-dark.png` (6 routes × 2 themes) read by the auditor; per-route originals in `/tmp/theme-shots/` at run time, key ones copied into `evidence/`.

## Executive summary

| # | Severity | Theme | Finding |
|---|----------|-------|---------|
| F1 | Critical | dark | Token pair `--app-primary`/`--app-primary-foreground` are both `#FFFFFF` → white-on-white controls (105 `bg-primary text-primary-foreground` combos; live on `/blogs` active chip, `/products` "Contact Engineering", integration tiles) |
| F2 | Critical | dark | patch.css forces cream ink (`#F0FAFF !important`) inside the as-shipped **white** bento cards → 1.06:1 text on `/products` (engine selector buttons, Configure Now / View YAML / View Worker links, Copy Config) |
| F3 | High | dark | `.ds-btn-primary` global `#000 !important` pill: boundary vs dark canvas 1.18:1 (SC 1.4.11 fail); hover flips to white pill (light hover is a subtle gray) — asymmetric interaction physics |
| F4 | High | both | Chart/status literals are single-palette: cyan `#06B6D4` 2.43:1, green `#10B981` 2.54:1, amber `#F59E0B` 2.15:1, bright-cyan `#00D2FF` 1.80:1 on white (light fail); violet `#8A2BE2` 2.98/2.24:1 and blue `#0066FF` 2.76:1 on dark surfaces (dark fail) |
| F5 | Medium | light | `BlogManagementView.tsx:257` hover: `hover:bg-[#F0FAFF]` under `text-primary-foreground` (#FFF in light) → ~1.1:1 on hover |
| F6 | Medium | both | Faint text tier below AA for normal text: light `#8595A4` 3.07:1 (2.78 on wells); dark `rgba(240,250,255,.35)` 3.10/2.93:1; dark `slate-500` `.45` 4.31/3.85:1 |
| F7 | Medium | both | Control boundary contrast weak in both themes: light secondary fill 1.10:1 / border 1.54:1 / input border 1.54:1; dark secondary fill 1.33:1 / border 1.40:1 / input border 1.35:1 (SC 1.4.11 advisory — labels carry meaning, outlines do not) |
| F8 | Low-Med | light | Three competing "muted" systems with different values (`--text-muted #2C3032` = not muted at 13.3:1, `--app-muted-foreground #4B4C4F`, `--foreground-muted rgba(28,30,33,.62)`) → hierarchy varies by which utility a component happens to use |
| F9 | Low | both | Semantic tokens used as text that miss AA: light `--app-info #0091FF` 3.23:1; dark `--app-destructive #DC2626` 3.67:1 (large-text only) |
| F10 | Info | both | Dead `priceStyle` variant keeps `text-white` (CardTitle.tsx:23) — latent trap if revived; `/ai-readiness` lazy band paints empty above the fold in both themes (consistent, not a theme defect); dark white bento card is an intentional shipped device (17.7:1 vs canvas) — keep, but see F2 |

**What passes (both themes):** body/heading ink (16.7–17.7:1), muted-foreground (8.6/9.5:1), links (5.4/7.2:1), focus rings (4.3/7.2:1), buy button text+boundary in light (5.39:1) and dark (3.29:1 boundary), light semantic set (success/warning/danger 4.6–5.7:1), dark semantic set except destructive, secondary-button text (15.1/12.6:1). Light theme core surfaces are consistent and airy; dark theme structure mirrors light 1:1 (same layout, inverted surfaces) — the failures below are token-scope defects, not layout drift.

## Findings detail

### F1 — dark primary token pair is white-on-white (Critical)
`src/index.css:378-380` (dark block): `--app-primary: #FFFFFF; --app-primary-foreground: #FFFFFF;`. Tailwind maps `bg-primary`/`text-primary-foreground` straight to these (`@theme inline`). Nothing redefines them (patch.css never touches `--app-primary*`; its `button[class*="bg-primary"]` rule at patch.css:470 is border-radius only). The `.ds-btn-primary` class escapes only because patch.css:711 pins it to a black pill with `!important` (which causes F3).
Live evidence (dark sweep): `/blogs` active filter chip "Discover" = `rgb(255,255,255)` on `rgb(255,255,255)` (1.0:1, see `evidence/dark-blogs.png`); `/products` `ds-card … text-primary-foreground` "Contact Engineering" 1.0:1; integration tiles `bg-primary/60` wash + cream text 1.06:1; 105 further combos in admin/dashboard components (RateLimitModal, SystemHealthWidget, BlogManagementView, …).
Fix: dark `--app-primary: #F7FDFF; --app-primary-foreground: #1F2223;` — this already matches the dark hover tokens (`--p-btn-primary-hover-bg/text`, patch.css:178-179), so hover becomes a subtle tint shift instead of an inversion.

### F2 — cream ink forced inside as-shipped white cards (Critical)
patch.css:795 & 1138 (`html.dark .text-foreground … { color:#F0FAFF !important }`) apply everywhere, including inside `--p-card: #FFFFFF` bento cards (patch.css:122, "as shipped"). Result on dark `/products` (`evidence/dark-products.png`): engine-selector buttons ("6 Hours/Balanced", "Core Vitals/DOM-TTFB", "OWASP…", "Edge Radar…", "AI Readiness…", "REST Webhook"), links "Configure Now"/"View YAML"/"View Worker", and "Copy Config"/"Drag to Rotate" render cream-on-white at 1.0–1.06:1 — functionally invisible.
Fix: give cards a scoped ink — e.g. `html.dark .framer-card, html.dark .bento-card, html.dark .ds-card { --tw/text tokens → #1C1E21 }` or exclude card subtrees from the 795/1138 overrides and drive in-card text from a `--p-card-foreground` token.

### F3 — black primary pill on dark canvas (High)
patch.css:711-715 `.ds-btn-primary { background:#000000 !important; color:#FFFFFF !important }` is unscoped and has no `html.dark` counterpart. Computed in dark: `bg rgb(0,0,0)` on canvas `#111827` → boundary 1.18:1 (SC 1.4.11 requires 3:1); visible as a void in `evidence/sheet-dark.png` (home, audit tiles). Hover uses dark tokens `#F7FDFF`/`#1F2223` (patch.css:178-179) → black→white flip on hover, while light hover is `#444950` (subtle). Fix: scope the black pill to `html:not(.dark)`; let dark use the light-pill values from its own hover tokens (aligns with F1 fix).

### F4 — single-palette chart/status literals (High)
Hardcoded in TSX (654× `#F0FAFF`, 45× `#06B6D4`, 30× `#10B981`, 15× `#F59E0B`, 8× `#00D2FF`, 6× `#8A2BE2`, 11× `#0066FF`, …), e.g. `src/components/dashboard/TelemetryInsights.tsx:159,192-248`. Ratios: on white cards cyan 2.43, green 2.54, amber 2.15, bright-cyan 1.80 (all < 3:1 graphics); on dark surfaces violet 2.98/2.24 and blue 2.76 (< 3:1). Each palette half is tuned for one theme only. Fix: introduce per-theme chart tokens (light can reuse the passing semantic set `#047857/#B45309/#C81E1E/#0064E0/#7C3AED`; dark keeps current cyan/green/amber and swaps violet/blue for `#A78BFA`/`#66A6FF`-class values) and replace literals.

### F5 — admin hover inversion (Medium, light)
`src/components/admin/BlogManagementView.tsx:257`: `bg-primary … text-primary-foreground hover:bg-[#F0FAFF]`. In light, hover keeps white text over a cream background ≈ 1.1:1. Fix: `hover:bg-primary-hover` (token) or add `hover:text-primary`.

### F6 — faint tier below AA (Medium, both)
Light `--p-text-faint/--theme-slate-400 #8595A4`: 3.07:1 on white, 2.78:1 on wells. Dark `--p-text-faint rgba(240,250,255,.35)`: 3.10/2.93:1; dark `slate-500 rgba(...,.45)`: 4.31/3.85:1. Used for micro-tags, placeholders, meta lines at 11–14px. Fix: darken light faint to ≈ `#5D6C7B` (5.39:1) and raise dark alphas to .55/.60, or restrict the tier to ≥18.66px bold / ≥24px.

### F7 — control boundaries (Medium, both)
Light: secondary fill vs canvas 1.10:1, its border 1.54:1, input border 1.54:1, hairline `#dadce0` 1.37:1. Dark: secondary fill 1.33:1, border 1.40:1, input border 1.35:1. Controls remain identifiable by label, so this is advisory under 1.4.11, but outlines/disabled states lean on these edges. Fix: light input/secondary border → `#8595A4`-class (3.07:1) or add inner shadow; dark borders → `rgba(240,250,255,.40)`-class.

### F8 — three muted systems (Low-Med, light)
`--text-muted: #2C3032` (13.3:1 — reads as primary), `--app-muted-foreground: #4B4C4F` (8.6:1), `--foreground-muted: rgba(28,30,33,.62)` (4.7:1). Components pick utilities mapped to different ones, so "muted" looks different per component. Fix: converge `text-muted*` utilities onto one value (recommend #4B4C4F) and retire `--text-muted` or alias it.

### F9 — semantic text tokens (Low)
Light `--app-info #0091FF` 3.23:1 and dark `--app-destructive #DC2626` 3.67:1 fail AA as *text* (fine as icons/graphics). Fix: use `--color-info/#0064E0` (5.39) and `#F87171`-class (6.41) when the token renders as text.

### F10 — info notes
- `CardTitle.tsx:22-24`: `priceStyle` variant keeps bare `text-white`; unused today (no call sites) but will invisible-ink on light cards if revived. The non-price path is rescued by patch.css:790 (`framer-card-title { color: var(--p-text-strong) }`) — verified in sheets (blog titles correct in both themes).
- `/ai-readiness` paints a large empty band above the fold in both themes until lazy sections mount (consistent; see sheets) — a perceived-performance note, not a theme defect.
- Dark's white bento card (`--p-card #FFFFFF`, as shipped) is an intentional high-contrast device (17.7:1 vs canvas). Keep — but it is exactly why F2 must be scoped per-card.

## Remediation order

1. F1 + F3 together (one token change + scoping the pill) — restores every primary control in dark.
2. F2 (card-scoped ink) — restores product-page controls/links in dark.
3. F4 (per-theme chart tokens) — graphics compliance both themes.
4. F5, F6, F7 — quick token/class fixes.
5. F8, F9, F10 — hygiene.

## Re-run

```bash
python3 tools/contrast-math.py                      # token tables
cd video/hero-launch && npm ci                      # puppeteer-core
LD_LIBRARY_PATH=/tmp/nsslibs node ../../tools/theme-audit.mjs   # probes + sheets (needs /tmp/chromium via video/hero-launch/tools/sandbox-runtime.sh and dev server on :3000)
```

Evidence: `evidence/sheet-light.png`, `evidence/sheet-dark.png`, `evidence/dark-products.png`, `evidence/dark-blogs.png`, `evidence/light-products.png`, `evidence/contrast-table-2026-10-22.md`.

---

## Remediation implemented (follow-up commit, same branch)

All findings F1–F9 fixed; verification re-run afterwards.

- **F1+F3:** dark `--app-primary: #F7FDFF` / `--app-primary-foreground: #1F2223` (index.css); black `.ds-btn-primary` pill scoped to `html:not(.dark)` with a dark light-pill counterpart + `--app-primary-hover` hover (patch.css). Pill boundary now 17.3:1 vs canvas, text 15.6:1; hover is a tint shift in both themes.
- **F2:** card-scoped ink blocks (patch.css, appended): inside `.ds-card` / `.bento-card` / accordion content under `html.dark`, foreground/muted/primary-foreground utilities, `bg-muted`, `bg-accent`, `border-border` and literal `text-[#F0FAFF]` classes revert to light values (self-match and descendant variants). Extended to inverted `bg-primary text-primary-foreground` islands in both themes (light island descendants get white ink; dark island gets dark ink), with `:not(.ds-card):not(.bento-card)` so white cards inside islands keep card ink.
- **F4:** per-theme chart tokens `--chart-{cyan,green,amber,red,cyan-bright,violet,blue}` (index.css both blocks); TSX literals converted to `var(--chart-*)` for plain arbitrary classes, quoted strings, and SVG attrs. Opacity-modifier forms (`border-[#10B981]/30`) left as decorative washes (exempt from SC 1.4.11); terminal popups keep their intentional dark aesthetic.
- **F5:** `BlogManagementView.tsx` hover → `hover:bg-primary-hover`.
- **F6:** light faint tier `#8595A4` → `#5D6C7B` (5.39/4.88:1); dark `--p-text-faint` .35 → .55 (5.78/4.96:1); dark `slate/gray/zinc-500` .45 → .60 (6.69/5.59:1).
- **F7:** light secondary/input borders `#CED0D4` → `#8595A4` (3.07:1); dark input/secondary borders .10/.12 → .40 (3.65/3.59:1).
- **F8:** light `--text-muted` converged to `#4B4C4F`; `.ds-input::placeholder` opacity .75 → .9 (6.48:1).
- **F9:** light `--app-info` → `#0064E0` (5.39:1). Dark destructive: no `text-destructive` consumers exist → no change needed.
- **F10:** dead `priceStyle` variant now uses `text-[var(--p-text-strong)]`; `Contact Engineering` link switched to `text-foreground` (was white-on-white in light).

**Post-fix verification:** `tools/contrast-verify.py` — all flagged pairs PASS (table above in commit). Invisible-ink sweep (both themes × 6 routes, solid backgrounds): **ALL CLEAN**. `npm run build` ✓ · `check:design` ✓. Evidence: `evidence/final-dark-products.png`, `evidence/final-light-products.png`.
