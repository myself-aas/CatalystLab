# Brand Guidelines v1.0 — CatalystLab

> Last updated: 2026-10-22 · Status: Active · Owner: repo owner
> Framework: claudekit `brand` skill (ui-ux-pro-max-skill, MIT) — voice, visual identity,
> messaging, asset management and consistency frameworks applied to CatalystLab.
> Verified sources: `DESIGN.md` (Meta-derived system, North Star "Mission Control",
> confirmed 2026-10-21), `src/index.css` + `patch.css` token blocks, `scripts/check-design-tokens.mjs`,
> `docs/audit/2026-10-22-theme-visual-consistency-contrast.md`, `public/manifest.json`, live copy.

## Quick Reference

| Element | Value |
|---------|-------|
| Primary (action/buy) | Cobalt `#0064E0` (hover `#0457CB`) — purchase/CTA only, enforced by `check:design` |
| Primary pill (light) | Ink-black `#000000` on white canvas; dark theme inverts to `#F7FDFF` pill / `#1F2223` ink |
| Canvas (default theme) | White `#FFFFFF`; wells `#F1F4F7`; dark Ink-Navy theme `#0A1317`/`#111827` (opt-in) |
| Ink | `#1C1E21` (text), `#4B4C4F` muted, `#5D6C7B` steel, `#8595A4` stone, hairline `#CED0D4` |
| Display/body font | Inter (fallback for proprietary Optimistic VF); weights 400/500/600/700 |
| Data font | JetBrains Mono 400/500/600, `tnum` — measurements only |
| Mark | Molecule/network node, cyan→blue gradient `#00D2FF → #0066FF` |
| Voice | Operator-grade: instrument-like, numeric, terse triplets. "Mission Control" |

---

## 1. Color Palette

### Primary Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Cobalt (primary) | #0064E0 | rgb(0,100,224) | buy/CTA, links, focus — purchase actions only (`check:design` enforced) |
| Primary deep | #0457CB | rgb(4,87,203) | cobalt hover/pressed |
| Primary soft | #0091FF | rgb(0,145,255) | icons/graphics only (not AA text) |
| Ink button | #000000 | rgb(0,0,0) | light-theme primary pill background |
| Dark primary pill | #F7FDFF | rgb(247,253,255) | dark-theme primary pill bg, ink #1F2223 |

### Secondary Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Surface soft (well) | #F1F4F7 | rgb(241,244,247) | wells, sidebars, secondary pill fill |
| Ink-navy canvas (dark) | #0A1317 | rgb(10,19,23) | dark theme app canvas |
| Page canvas (dark) | #111827 | rgb(17,24,39) | dark theme page background |
| Dark ink | #F7FDFF | rgb(247,253,255) | dark theme headings/body |
| Dark link | #66A6FF | rgb(102,166,255) | dark theme links (7.2:1) |
| Mark gradient | #00D2FF → #0066FF | — | molecule mark stroke only |

### Neutral Palette

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Canvas | #FFFFFF | rgb(255,255,255) | light page background |
| Ink | #1C1E21 | rgb(28,30,33) | body text, headings |
| Charcoal | #444950 | rgb(68,73,80) | hover ink |
| Slate (muted) | #4B4C4F | rgb(75,76,79) | muted text (8.6:1) |
| Steel (faint) | #5D6C7B | rgb(93,108,123) | faint text, control borders (≥3:1) |
| Stone | #8595A4 | rgb(133,149,164) | disabled/decorative only |
| Hairline | #CED0D4 | rgb(206,208,212) | control borders |
| Hairline soft | #DEE3E9 | rgb(222,227,233) | card edges (decorative) |

### Semantic Colors

| State | Light | Dark | Usage |
|-------|-------|------|-------|
| Success | #1E7D34 / #047857 | #31A24C / #34D399 | positive readings, passes |
| Warning | #9A6B0F / #B45309 | #F7B928 / #FBBF24 | caution states |
| Danger / critical | #E41E3F / #C81E1E | #DC2626 (bg) / #F87171 (text) | failures, destructive |
| Info | #0064E0 | #22D3EE | informational (light = cobalt) |

### Chart Palette (per theme, data state only)

| Token | Light | Dark |
|-------|-------|------|
| --chart-cyan | #0E7490 | #06B6D4 |
| --chart-green | #047857 | #10B981 |
| --chart-amber | #B45309 | #F59E0B |
| --chart-red | #C81E1E | #EF4444 |
| --chart-cyan-bright | #0891B2 | #00D2FF |
| --chart-violet | #7C3AED | #A78BFA |
| --chart-blue | #0064E0 | #66A6FF |

### 1.2 Dark Ink-Navy theme (opt-in via ThemeToggle; saved preference wins)

Canvas `#0A1317` (app) / `#111827` (patch-enforced page bg); cards ship **white** (`--p-card #FFFFFF`) as an intentional high-contrast device — inside white cards the LIGHT ink values apply (scoped rules, `patch.css` F2 block). Dark ink `#F7FDFF`/`#F0FAFF`, muted `rgba(240,250,255,.72)`, faint `rgba(240,250,255,.55)`, borders `rgba(240,250,255,.40)` on controls. Dark primary pill `#F7FDFF` + `#1F2223` ink; link `#66A6FF`.

### 1.3 Semantic + chart palettes (per theme, audit F4/F9)

| State | Light | Dark |
|-------|-------|------|
| success | `#1E7D34` / token `#047857` | `#31A24C` / `#34D399` |
| warning | `#9A6B0F` / `#B45309` | `#F7B928` / `#FBBF24` |
| danger/critical | `#E41E3F` / `#C81E1E` | `#DC2626` (bg) / `#F87171` (text) |
| info | `#0064E0` | `#22D3EE` |
| chart cyan / green / amber / red | `#0E7490` `#047857` `#B45309` `#C81E1E` | `#06B6D4` `#10B981` `#F59E0B` `#EF4444` |
| chart cyan-bright / violet / blue | `#0891B2` `#7C3AED` `#0064E0` | `#00D2FF` `#A78BFA` `#66A6FF` |

Chart/status color is **data state, never decoration**; use `var(--chart-*)` tokens in code. Opacity-wash forms (`/10`, `/30`) are decorative and exempt from SC 1.4.11.

### 1.4 Accessibility (WCAG 2.1, verified 2026-10-22)

Body ink 16.7:1 (light) / 17.7:1 (dark); muted 8.6/9.5; links 5.4/7.2; faint tier ≥4.88 both themes; focus rings 4.3/7.2; primary pills ≥15.6 text & ≥17 boundary; control borders ≥3.0. Full tables: `docs/audit/evidence/contrast-table-2026-10-22.md` + `tools/contrast-verify.py`.

---

## 2. Typography

| Role | Stack | Notes |
|------|-------|-------|
| Display/headline/title | `Inter, system-ui, -apple-system, "Segoe UI", sans-serif` | Optimistic VF is proprietary; Inter is the documented metric-compatible fallback (DESIGN.md deviation note) |
| Body/label | Inter 400/500/600/700 | label = 12px/700 uppercase tracking |
| Data | `JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace` | 11px/500 `tnum` — telemetry readings, counters, stamps ONLY |

### Font Stack

```css
--font-heading: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
--font-body: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
```

Scale (shipped): H1 72px/600 (48–32 responsive), H2 48px/600, H3 28px, body 16px/1.5, small 14px, caption/data 11–12px. Display moments are rare — the product speaks in instruments, not banners. Loading: Google Fonts `Inter:wght@400;500;600;700` + `JetBrains+Mono:wght@400;500;600` (+ Material Symbols Outlined for iconography); offline/film contexts bundle latin woff2 (`video/hero-launch/assets/fonts/`).

---

## 3. Logo & Mark

| Variant | File / component | Use |
|---------|------------------|-----|
| Molecule mark (gradient) | `public/logo-mark.svg`, `public/logo-mark.png`, component `MoleculeMark.tsx` | nav, favicon source, film end-card |
| Full lockup | `public/logo.svg` + `BrandLogo.tsx` (mark + "CatalystLab" wordmark) | headers, docs |
| Raster set | `favicon.svg`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `logo.png`, `og-image.png`, `og-banner.png` | PWA/social; manifest theme_color `#0064E0`, background `#FFFFFF` |

Mark spec: network-bond molecule, stroke gradient `#00D2FF → #0066FF`, viewBox 100×100. Clear space ≥ mark height; min digital width 24px (mark) / 120px (lockup). Don'ts: rotate/skew, recolor outside palette, add shadows/glows, crop proportions, place on busy backgrounds < 3:1 contrast, replace gradient with flat fill except mono contexts (use ink `#1C1E21` light / `#F7FDFF` dark).
**Asset findings (2026-10-22):** `public/logo.svg` shipped as the upstream Meta template lockup (Meta glyph, `aria-label="Meta"`, `.meta-wordmark`); it was **relabeled/rebuilt** the same day as a valid standalone CatalystLab lockup (molecule mark 24px + Inter wordmark, `#00D2FF→#0066FF`, ink/cream dark-scheme toggle). Note: `public/logo-mark.svg` previously contained JSX-style attributes (`strokeWidth`, `{/* */}` comments) making it invalid standalone; it was **converted to valid standalone SVG** the same day and render-verified via `<img>` and CSS `background-image` on light and dark surfaces (film copy at `video/hero-launch/assets/brand/logo-mark.svg` updated in lockstep). `logo.svg`'s cream wordmark toggles via `prefers-color-scheme`; in-app theming stays token-driven through `BrandLogo.tsx`.

---

## 4. Voice & Tone — "Mission Control"

CatalystLab is a telemetry floor. Operators arrive, read instruments, act. The voice is the control room: calm, numeric, exact.

### Brand Personality

| Trait | Description |
|-------|-------------|
| **Instrument-like** | States readings, not adjectives — numbers are the rhetoric |
| **Terse** | Triplet rhythm, no preamble; every sentence carries a value |
| **Confident** | Imperatives with targets; no hype, no hedging |
| **Honest** | Names limits and states (fail-closed, rate-limited) plainly |
| **Operational** | Written for the operator on shift, not the boardroom |

### Core Attributes

| Attribute | Description |
|-----------|-------------|
| **Mission Control** | Creative north star: a telemetry floor, instruments not banners |
| **Numeric proof** | Every claim carries a measurable (42 PoPs, p95 24.13 ms, 8 engines) |
| **Single action color** | Cobalt reserved for purchase/action; everything else stays ink |
| **Data mono** | JetBrains Mono tnum for measurements only — type is instrumentation |
| **Quiet density** | Dense where density is data, quiet everywhere else |

| Trait | We are | We are not |
|-------|--------|------------|
| Instrument-like | State the reading: "p95 24.13 ms across 42 PoPs" | Adjectival: "blazing-fast global network" |
| Terse | Triplet rhythm: "More engines. More dimensions. More edge intelligence." | Paragraphs of preamble |
| Confident | Imperatives with a target: "Run Instant Audit", "Audit Now" | Hype: "revolutionary", "game-changing" |
| Honest | Name limits and states (fail-closed, rate-limited, zero-cost mode) | Glossing failures |

Tone by context: marketing = benefit + number ("Pricing that scales with the mesh."); docs/README = declarative operator prose with gate evidence; errors = calm + next action ("Verify your domain and re-run the audit."); success = brief confirmation ("Audit complete — 8 engines, 0 critical.").
### Prohibited Terms

| Avoid |
|-------|
| seamless |
| revolutionary |
| best-in-class |
| synergy |
| leverage |
| unleash |
| cutting-edge |

Numbers over adjectives; engines/PoPs/ms over superlatives.

---

## 5. Messaging Framework

- **Mission:** We measure the web others ship — every engine, every edge, every request — so operators act on readings, not opinions.
- **Vision:** A web where health, security, accessibility and AI-readiness are one instrument panel, not four dashboards.
- **Value proposition:** For DevOps and platform teams who audit across scattered point tools, CatalystLab is the website-quality intelligence platform that runs 8 diagnostic engines from one URL in one request. Unlike single-purpose scanners, every reading is cross-engine, edge-timed and exportable (JSON/PDF).
- **Positioning:** CatalystLab is the mission-control floor for web telemetry — 42 global PoPs, 8 engines, one audit.

| Key message | Audience need | Proof point |
|-------------|---------------|-------------|
| One request, 42 answers | Tool sprawl | 42 PoPs fan-out; single audit form |
| Eight engines, one runtime | Coverage gaps | Website Health, Edge Latency Radar, AI Readiness, OWASP SecOps, Core Web Vitals, Eco-Carbon, Cron Watchdogs, DXI |
| Numbers you can ship | Reporting friction | p95 24.13 ms stamp; JSON/PDF exports; LCP tiers 2.3/1.9/1.6 s |
| Safe by default | Compliance risk | PII split 75/20/5; fail-closed payments; zero-unsafe-inline CSP |

Elevator (10 s): "Paste a URL; eight engines audit it from 42 edge PoPs and hand you one report." CTAs (consistent everywhere): **Run Instant Audit** (tool), **Audit Now** (hero), **Shop** (nav buy, cobalt).

---

## 6. Imagery & Motion

Photography: real product UI plates over stock abstraction; light-theme captures at 2× on white canvas; people-photos only in context (pricing/office), natural light, no duotones. UI plates: `video/hero-launch/assets/captures/` naming `<route>.png`, full-page `<route>-full.png`.
Motion (product + film): fast-in slow-out; stagger 0.02–0.05 s; `power3.out`/`power4.out`; hover 0.2–0.4 s; transitions 0.6–1.2 s; one hero move per shot; respect `prefers-reduced-motion` (global 0.01 ms collapse). No glow, no purple/blue gradient washes, no dark voids in light-theme contexts.

---

## 7. Components (shipped truth)

| Component | Light | Dark |
|-----------|-------|------|
| Primary pill | `#000000` bg / `#FFFFFF` ink, radius full, 44px h | `#F7FDFF` bg / `#1F2223` ink |
| Buy CTA | cobalt `#0064E0` / white (both themes) | same |
| Secondary pill | transparent, 2px `#0A1317`-ink border; well fill on hover | `#2C3032` fill, `#F0FAFF` ink, border `rgba(240,250,255,.40)` |
| Cards | white, hairline `#DEE3E9`, radius 32px (product feature) | white bento cards on ink canvas (as shipped) |
| Inputs | white, `#8595A4` border (3.07:1), radius 14px, cobalt focus ring | `#1F2223` fill, `rgba(240,250,255,.40)` border |
| Pills/tabs/chips | well fill + hairline; active = ink pill | active = cream pill / ink text |

Radius scale: 2/4/6/8/16/24/32/full (`DESIGN.md`); spacing 8/10/12/16/20/24/32/64.

---

## 8. AI Image Generation

### Base Prompt Template

Always prepend to image generation prompts:

```
Clean light SaaS instrumentation aesthetic ("Mission Control"): white #FFFFFF canvas,
mist #F1F4F7 wells, ink #1C1E21 type, single cobalt #0064E0 action color,
JetBrains Mono data stamps, soft neutral shadows, dense-where-data quiet-elsewhere
composition, no glow, no purple gradients, no dark voids.
```

### Style Keywords

| Category | Keywords |
|----------|----------|
| **Lighting** | soft neutral, even, no bloom |
| **Mood** | precise, calm, operational |
| **Composition** | instrument-grid, left-anchored type, generous whitespace |
| **Treatment** | high-clarity, low-saturation except cobalt |
| **Aesthetic** | modern control-room, light SaaS |

### Visual Mood Descriptors

- Mission-control calm
- Instrument-panel clarity
- Quiet confidence with one cobalt action

### Visual Don'ts

| Avoid | Reason |
|-------|--------|
| Neon / dark-void backgrounds | contradicts light-default identity |
| Gradient headlines | type is instrumentation, not decoration |
| 3-D glass blobs | off-brand aesthetic |
| Fake dashboards with unreadable numerals | all data must be real token values |
| Purple/blue gradient washes | cobalt is a point color, never a wash |

### Example Prompts

**Hero banner**:
```
<base prompt> Hero banner: left-anchored Inter 72px headline "Meet the all-new
Catalyst Telemetry", right side a fan of 42 small mono-numbered tiles raining into
place, one cobalt #0064E0 stamp reading "24.13 ms", white canvas, soft shadows.
```

**Social post**:
```
<base prompt> Square social card: single JetBrains Mono reading "p95 24.13 ms /
42 PoPs / 8 engines" centered on mist #F1F4F7 well, hairline #CED0D4 border,
molecule mark top-left in #00D2FF→#0066FF gradient.
```

## 9. Asset Organization & Management

```
public/                     web-served brand rasters/svg (logo*, favicon, icons, og-*, manifest)
src/components/common/      BrandLogo.tsx, MoleculeMark.tsx (code-owned mark variants)
video/hero-launch/assets/brand/      logo-mark.svg copy for film compositing
video/hero-launch/assets/captures/   2x UI plates (<route>.png, <route>-full.png)
video/hero-launch/assets/{fonts,vendor}/  bundled woff2 + gsap (offline/film)
docs/audit/evidence/        dated audit sheets/tables (committed, PNG ok)
*.mp4, .hyperframes/, node_modules/   generated — gitignored, never committed
```
Naming: web-served product files keep kebab-case (`logo-mark.svg`, `og-banner.png`) as a legacy exemption — they are referenced by manifest/routes and must not be renamed. New marketing/brand assets follow the skill convention `{type}_{campaign}_{description}_{timestamp}_{variant}.{ext}` (e.g. `banner_launch42_hero-fanout_20261022_light.png`) and are registered in `.assets/manifest.json` (schema per skill asset-organization reference: id, type, path, dimensions, tags, status, approvedBy). Other naming: kebab-case; type-purpose-variant order (`logo-mark.svg`, `og-banner.png`, `home-full.png`); captures carry route name; evidence carries date (`contrast-table-2026-10-22.md`). Metadata: manifest.json for PWA; film assets tracked in `video/hero-launch/SPEC.md`.
Approval workflow (per asset): 1) palette/type compliance (§1–2) → 2) `node` brand scripts below → 3) `npm run check:design` + `npm run lint` → 4) theme sweep (`tools/theme-audit.mjs`) for UI-affecting assets → 5) owner sign-off for mark/lockup changes. Legacy cleanup queue: `public/logo.svg` Meta leftovers (§3).

---

## 10. Consistency Framework

Automated gates (CI + local): `check:design` (cobalt buy token, semantic distinctness, light legibility), `lint`, `tsc --noEmit`, vitest, `check:bundle`, theme audit sweep + `contrast-verify.py` (both themes), film `hyperframes check` for motion assets.
Manual checklist per release (adapted from skill consistency-checklist): logo variant + clear space ✓; palette-only colors incl. chart tokens ✓; contrast ≥ AA text / 3:1 controls ✓; Inter/JetBrains roles ✓; voice: numbers over adjectives, triplet rhythm, CTA set unchanged ✓; messaging proof points still true (42 PoPs / 8 engines / p95) — update copy when telemetry changes ✓; channels: site, og-/social rasters, llms.txt, film end-card, manifest ✓.
Cadence: site monthly; social/og + email quarterly; full brand audit annually or after any token-system change (last: 2026-10-22 theme audit).

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-10-22 | Initial guidelines: identity, voice, messaging, assets, consistency; incorporates Meta-derived DESIGN.md, light-default theme split, audit-verified ratios, per-theme chart tokens |
