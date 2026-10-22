# Design System Review — ui-ux-pro-max skill audit

Date: 2026-10-22 · Branch: `arena/d95acddd-catalystlab` · Auditor: Arena agent
Lens: `ui-ux-pro-max` skill (nextlevelbuilder/ui-ux-pro-max-skill, MIT) — 10 priority rule
categories, searchable data (ux-guidelines/styles/colors/typography/charts/icons/stacks),
`references/pro-rules.md` pre-delivery checklist. Companion evidence:
`2026-10-22-theme-visual-consistency-contrast.md` (contrast/tokens), `docs/brand-guidelines.md`.

## Method

1. Stack detected from `package.json`: React 19 + Vite 8 + Tailwind v4 → stacks queried: `react`, `html-tailwind`.
2. Baseline direction: `search.py "telemetry dashboard saas developer tools mission control" --design-system -p CatalystLab` (not persisted — repo already owns `DESIGN.md` + `docs/brand-guidelines.md` as sources of truth; no parallel master created).
3. Domain searches (one intent each, retry-once contract honored): focus/keyboard (ux), touch targets (ux), horizontal scroll (ux), tabular mono (typography), chart accessibility (chart), memo/virtualize (react), dark-mode class strategy (html-tailwind, 1 retry), icon semantics (icons), inline validation (ux), scroll reveal/reduced-motion (gsap).
4. Live probes: 375×844 chromium pass over 6 routes (overflow, target sizes, sub-11px text); multiline-aware `<img alt>` scan; token/usage greps; prior both-theme contrast sweep reused.

## Baseline delta (skill recommendation vs shipped system — intentional)

| Axis | Skill baseline | Shipped (source of truth) | Verdict |
|------|----------------|---------------------------|---------|
| Style | Glassmorphism ("dark supported but **avoid** for this product") | Meta-derived light SaaS, "Mission Control"; glass only as overlay utility | Aligns on light-default; glass restrained ✓ |
| Palette | Generic SaaS `#2563EB` + orange accent | Cobalt `#0064E0` buy-only, ink pills, enforced by `check:design` | Shipped wins (brand + gate); no orange CTA introduced ✓ |
| Typography | Plus Jakarta Sans | Inter (Optimistic VF fallback, documented) + JetBrains Mono data role | Skill's "Dashboard Data" mono+sans pairing validates the data-role split ✓ |
| Pattern | Hero + Features + CTA, sticky CTA | Hero + engines + audit CTA + footer CTA | ✓ |

## Findings by priority category

### P1 Accessibility (CRITICAL)
- **Contrast:** PASS post-remediation — both themes sweep-clean (`…theme-visual-consistency-contrast.md`); skill rule `color-accessible-pairs` satisfied incl. dark checked independently.
- **Focus visibility — FINDING A1 (High):** 496 `focus-visible:` usages, but 37 `focus:outline-none` occurrences carry no ring on the same line; e.g. `BlogManagementView.tsx:215,223,235` set `focus:border-background` (border → background colour = invisible indicator) and `TerminalOutput.tsx:449` plain `focus:outline-none`. Rule: *Keyboard Navigation — visible focus on every operable control* (ux, High).
- Alt text: all app `<img>` carry `alt` (multiline-aware scan; only a test fixture lacks one) ✓. `aria-label` in 70 files; icon controls named (Navbar sample) ✓. Skip-link present ✓.

### P2 Touch & Interaction (CRITICAL)
- **No horizontal scroll** at 375px on all six routes (overflow ≤ 0) ✓ (rule `horizontal-scroll`, High).
- **Target sizes — FINDING A2 (High):** 27–30 visible operables/route under 44px in one dimension: footer social links 25×44 (passes WCAG 2.5.8 AA 24px, fails 44pt guidance), **footer text links 32×15 (fail AA 24px)**, icon buttons 24–36px wide ("Close Inspector" 24×44, "Filter articles" 32×44), "View Monitored Domains" ×42h. Rule: *Touch Target Size — web uses WCAG target-size rule* (ux, High).
- **Token coverage — FINDING A3 (Med):** `--control-min-size: 2.75rem` defined (index.css:288) but consumed only via `.ds-control` (index.css:664, 3 component files); 18 files hardcode `min-h-[44px]`/`h-11` instead → drift risk.

### P3 Performance (HIGH)
- `loading="lazy"` in 29 files ✓; `preconnect` fonts ✓; viewport `viewport-fit=cover` + safe-area vars defined ✓.
- **Advisory P1:** brand/OG rasters and 2× UI plates are PNG-only (no WebP/AVIF variants); Google-Fonts `display=swap` can shift Inter metrics (no `size-adjust` fallback) — CLS risk on slow networks (rule `reserve-space`, High).

### P4 Style Selection (HIGH)
- Single coherent system (Meta-derived) across routes ✓; icons = Material Symbols Outlined + inline SVG (no emoji structural icons observed) ✓; flat + raised-depth language consistent (no mixed skeuomorphism) ✓.

### P5 Layout & Responsive (HIGH)
- Mobile-first Tailwind breakpoints; no fixed-px containers found in probes; menu collapses to sheet ✓. Deep links = real routes ✓. No bottom nav (desktop IA + sheet) — ≤5 rule n/a ✓.

### P6 Typography & Color (MEDIUM)
- Base 16px / lh 1.5 ✓; semantic tokens ✓; per-theme chart tokens ✓ (audit F4).
- **Raw hex in components — FINDING T1 (Med):** ~650 `#F0FAFF` literals + status hexes remain outside tokens (chart set tokenized 2026-10-22; chip/wash literals pending). Rule: *Semantic color tokens / no raw hex in components*.
- **Sub-role text — FINDING T2 (Med):** 28 occurrences of `text-[9px]/[10px]` (NavbarSearch meta, TelemetryInsights labels) and live **8px** axis characters on `/` — below the brand's own 11px data role; 763× `text-[11px]` = sanctioned data role ✓.

### P7 Animation (MEDIUM)
- `prefers-reduced-motion` collapse present (3 rule sets) ✓; film/motion constants (stagger .02–.05s, power3/4.out, fast-in-slow-out) match skill gsap guidance ✓; no width/height tweens in product CSS ✓.

### P8 Forms & Feedback (MEDIUM)
- **Advisory F1 (Med):** inline error placement/`aria-describedby` pass not evidenced repo-wide (admin inputs rely on placeholders + border focus that A1 flags); rule *Error Placement / Focusable Error Summary* (ux, High) → schedule a forms pass.

### P9 Navigation (HIGH)
- Predictable hierarchy (6 primaries + overflow sheet), consistent across themes post-remediation ✓; back behavior = router ✓.

### P10 Charts & Data (LOW)
- Recharts `Tooltip`/`Legend` in 6 chart components ✓; state never colour-alone (chips carry text) ✓; per-theme chart palette ≥3:1 both themes ✓ (rule chart accessibility).

## Pro-rules (web-applicable subset) & pre-delivery checklist

| Checklist item | Status |
|----------------|--------|
| Relevant searches only, one intent each | ✓ (log above) |
| quick-reference §1–§3 final pass | ✓ (P1–P3 findings above) |
| 375px + landscape test | 375px ✓ (landscape not probed — advisory) |
| Reduced-motion verified | ✓ CSS collapse present |
| Dark contrast checked independently | ✓ (theme audit, both themes sweep-clean) |
| Touch targets ≥44 / WCAG 24px | ✗ partial — A2 |
| Safe areas | ✓ vars + viewport-fit |
| Icon semantics / stroke consistency | ✓ Material Symbols variable weight; decorative icons beside text hidden in sampled components |
| Correct brand logos | ✓ (logo.svg relabeled, mark standalone-valid 2026-10-22) |

## Recommendations (prioritized)

1. **A1 (High):** replace the 37 ring-less `focus:outline-none` patterns with the focus-ring token (`--color-focus-ring` / `--p-input-focus-ring`); never `focus:border-background`.
2. **A2 (High):** pad footer text links to ≥24px height (target 44 row), expand social/icon-button hit areas to 44×44 via padding or `::after` hitbox.
3. **T1 (Med):** tokenize remaining `#F0FAFF`/status literals into `--p-*`/semantic tokens (continue audit-F4 approach).
4. **T2 (Med):** raise 8–10px text to the 11px data role (28 sites + chart axis labels).
5. **A3 (Med):** consume `--control-min-size` in button/input/link primitives (or delete the token).
6. **F1 (Med):** forms pass — inline errors + `aria-describedby` + focusable error summary.
7. **P1 (Low):** AVIF/WebP variants for plates/OG; font `size-adjust` or preload to kill swap shift; landscape probe.

## Verdict

System is coherent, token-driven, and accessibility-strong post theme-remediation (P1/P5/P9/P10 clean). Residual debt concentrates in **focus-indicator hygiene (A1)**, **small touch targets (A2)**, and **literal-color/typography-role drift (T1/T2)** — all catalogued with rule citations and repo evidence above.

---

## Remediation log — R1–R5 implemented (2026-10-22)

Executed the same day as the audit, on branch `arena/d95acddd-catalystlab`. Recommendation numbers refer to the list above.

**R1 — focus-indicator hygiene (A1): DONE.**
All 45 ring-less `focus:outline-none`/`outline-none` sites triaged:
- 32 interactive elements (nav links, icon buttons, switches, stretched links, bordered inputs/selects/textareas) now carry the repo-canonical `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring` (Sidebar keeps its local `ring-accent` variant; the DiagnosticHub stretched link gained `rounded-[inherit]`).
- Invisible `focus:border-background` indicators removed (BlogManagementView, HeroImageLivePreview, UserBlogManagementView).
- 9 borderless inputs inside styled containers (cmd-K rows, terminal prompts, filter bars, nav search, time-range pill) keep `outline-none` but their **wrappers** now expose `focus-within:ring-2 focus-within:ring-ring` (ring-inset where flush to a panel edge); NavbarSearch's open-state ring upgrades via `focus-within:ring-ring`; CommandCenterHUD's wrapper pairs the ring with its existing `focus-within:border-primary`.
- 2 intentionally left: `EngineInput` (wrapper already had focus-within border+ring) and `CatalystCarouselRail` scroll container (not focusable).
- Verified live: 25-stop keyboard tab-sweep at 375px on 6 routes → **0 stops without a visible indicator**.

**R2 — touch targets (A2): DONE.**
- Footer: column links (`inline-flex items-center min-w-[var(--control-min-size)]`), legal links (`inline-flex items-center`) → measured **44×44** (was 32×15); social buttons `size-9`→`size-11 shrink-0` + `flex-wrap` container (were flex-shrunk to 25px in narrow mobile columns) → measured **44×44**.
- New base-layer rule: `input[type="checkbox"], input[type="radio"]` exempt from the 44px control height but held to the WCAG 2.5.8 **24px minimum** (fixes 13×44 stretched checkboxes app-wide).
- Password-visibility toggles (Login/SignUp) rebuilt as centered 44px hits; text-only clear buttons (TerminalOutput, LiveTerminalStream) padded to ≥24px; “Create an account”/“Log in to console” links blockified so the base min-height applies.
- Re-probe at 375×844 (`/`, `/login`, `/signup`, `/contact`, `/blogs`, `/products`, `/pricing`): **AA failures (<24px) 0 on every route** (was: 32×15 footer links, 25px socials, 21×44 “API”, 16px eye toggles, 13px checkboxes); no horizontal overflow anywhere; residual under-44 elements (4–7/route) are ≥24px dense-UI affordances (TOP button, skip link, nav icon rows) allowed by the WCAG-24 criterion.

**R3 — raw color literals (T1): PARTIAL (ratchet in place, mass migration deferred).**
- New CI gate `scripts/check-raw-color-literals.mjs` (`npm run check:colors`, wired into `npm run ci`): counts all raw hex literals in `src/**/*.ts(x)` and fails above a frozen baseline of **923** (across 152 files) — new color decisions must use tokens; tighten the baseline as literals are tokenized.
- Targeted tokenization done en route: chart pie slices `COLORS`/`BRAND_COLORS` moved from indistinguishable `#F0FAFF` repeats to theme-aware `var(--chart-*)` (this also closes the only genuine color-only encoding found — see R5 note), Footer brand-link `ring-[#F0FAFF]` → `ring-ring`, and recharts tooltip text colors fixed from white-on-#F3F4F6 (illegible) to #1F2937.
- The remaining ~900 literals are legacy debt for a dedicated migration pass (would touch 150+ files); the ratchet prevents growth.

**R4 — 8–10px typography (T2): DONE.**
All 28 sub-11px sites consolidated to the 11px data role: `text-[8px]/[9px]/[10px]` → `text-[11px]` (EnzymeGrid mobile labels, LiveTerminalStream, NavbarSearch, MasterTelemetryGrid, DiagnosticConsoleCard, TelemetryInsights, GuestQuotaBanner, dashboard-sidebar), redundant `text-[8px] sm:text-[11px]` responsive pairs collapsed, and the UserAnalyticsDashboard axis ticks `fontSize: 10` → `11`. Live 375px probe: tiny-text (<11px) count **0** on all re-probed routes (was 15 on `/`).

**R5 — `--control-min-size` consumption (A3): DONE.**
All 29 hardcoded control-size literals (`min-h-[44px]` ×11, `min-w-[44px]` ×5, `min-h-11` ×13) across 14 files now consume `min-h-[var(--control-min-size)]` / `min-w-[var(--control-min-size)]`, matching the token's definition (index.css) and the base-layer `:where(button, a, input, select, textarea)` rule; the footer social/link fixes above add two more consumers.

**Bonus (R6 forms + chart pass, landed in the same change):**
- Forms pass per rec 6 delivered as [`docs/forms.md`](../forms.md): Login/SignUp/ForgotPassword error banners gained `role="alert"` + `tabIndex={-1}` + ids referenced by conditional `aria-describedby` on their forms; ContactPage's blocking `alert()` replaced with an inline `role="alert"` banner and its success panel became a focusable `role="status"` region that receives focus.
- Charts (rec list had none outstanding; verification found two real defects, both fixed): the EngineCharts and UserAnalyticsDashboard pies rendered **4–5 identical `#F0FAFF` slices with no legend** — now theme-token colored with `<Legend>`; illegible tooltip text colors corrected. TelemetryInsights (4 gradient cards, titled single-series + Tooltip) and BenchmarkCard (labeled category axis + Tooltip) verified not-color-alone.

**Gates after remediation:** `tsc --noEmit` clean · `eslint .` clean · vitest **330/330** · `check:design` pass · `check:colors` ratchet pass (923 ≤ 923) · 375×844 probe: 0 AA target failures, 0 horizontal overflow, 0 focus stops without indicator on 6 routes.

**Still open (not in R1–R5 scope):** R3 full literal migration (ratchet holds the line), rec 7 perf items (AVIF/WebP plates, font `size-adjust`/preload, landscape probe).

---

## Second remediation pass — T1 completion + rec 7 (2026-10-22)

**T1 raw-literal migration: effectively complete (923 → 5).**
- New brand constants in `src/index.css` `@theme`: `cream` #F0FAFF, `ink-navy` #111827,
  `ink-panel` #111726, `ink-soft` #1C1E21, `fog` #F3F4F6, `mist` #F1F4F7, `graphite`
  #1F2937, `smoke` #888888 — theme-invariant by design, so every migration is
  byte-identical (verified in-browser: `bg-cream` computes to `rgb(240,250,255)`).
- Reused existing tokens where they already matched exactly: `accent-cyan/amber/red/
  emerald`, `buy` / `buy-hover` (the Navbar CTA hover moved from #0052CC to the
  `buy-hover` #0457CB token — one deliberate shade alignment), and `white` for #FFFFFF.
- 952 replacements: 715 bracket utilities (`bg-[#F0FAFF]/10` → `bg-cream/10`), 149
  quoted prop values (`fill="#F0FAFF"` → `var(--color-cream)`), 88 `rgba(240,250,255,x)`
  bracket utilities → `cream/x`; plus gradient/shadow internals and `var()` fallbacks.
- Ratchet hardened: HTML entities (`&#123;`, `#412` prose) excluded, and
  `src/lib/emailService.ts` exempt (email clients do not support CSS custom properties,
  so its inline CSS must stay literal). New baseline **5**: single-use deep-ink fills
  (#0A1317, #0B111A, #090D16), the brand node-gradient stop (#0066FF), one graphite
  label style (#374151). Semantic promotion (e.g. cream → foreground on themed
  surfaces) remains the follow-up; the constants now make it a one-variable change.

**Rec 7 performance: landed where architecture allows.**
- Plates: all 20 JPEGs recompressed in place (q78 progressive, 4:2:0, stripped) —
  2 570 KB → 2 246 KB (−323 KB) with unchanged dimensions and visually verified
  output. AVIF/WebP *variants* + `<picture>` wiring deferred: plates are imported as
  module URLs and flow through data-driven registries (`engines.ts`, `engineBlogs.ts`,
  `DynamicBanner`), so per-consumer `<picture>` markup needs an image-renderer
  component first — recommended as the next perf ticket.
- Font swap: added metric-compatible `@font-face 'Inter Fallback'` (local Arial,
  `size-adjust: 107%; ascent-override: 90%; descent-override: 22%`) and inserted it
  into both `--font-sans` stacks and `--font-display` — the fallback now matches
  Inter's box metrics, removing the swap-time layout shift (JetBrains Mono left as
  `display=swap`; its small data-role sizes make shift negligible).
- Landscape probe (844×375, 7 routes): **no document-level horizontal overflow
  anywhere**; the only right-edge overflow elements sit inside the intentional
  `overflow-x-auto` snap rails (Products carousel). Portrait AA/touch/focus results
  from the first pass unchanged (0 failures).

**Gates after second pass:** tsc clean · eslint clean · vitest 330/330 · `check:design`
pass · `check:colors` pass (5 ≤ 5) · `npm run build` (incl. prerender + bundle budget)
pass · probes as above.
