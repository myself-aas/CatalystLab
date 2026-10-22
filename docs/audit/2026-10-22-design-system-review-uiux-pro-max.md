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
