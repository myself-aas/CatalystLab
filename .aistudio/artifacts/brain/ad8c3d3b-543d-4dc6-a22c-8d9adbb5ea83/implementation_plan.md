# Frontend Design System Refactor: Meta Design System

Comprehensive architectural blueprint to refactor CatalystLab's frontend design system based on Meta's `DESIGN.md` specification (from `npx getdesign@latest add meta`), adapted for dual-theme web telemetry and developer tooling.

***

## User Review & Critical Decisions

> [!IMPORTANT]
> The following core design decisions were confirmed during Phase 1 interactive clarification:

- **Confirmed Theme Architecture**: Dual-theme system pairing Meta's signature stark white canvas (`#FFFFFF`) and soft cloud surfaces (`#F1F4F7`) in light mode with an adapted deep ink-navy substrate (`#0A1317` canvas, `#1C1E21` surface) in dark mode for extended telemetry sessions.
- **Confirmed Geometry & Radii**: Full Meta standard across all interactive surfaces—`100px` pill buttons (`rounded-full`) for all action controls, `32px` (`rounded-[32px]`) curvature for primary bento cards and feature panels, and `8px` (`rounded-lg`) for form inputs.
- **Confirmed Typography Hierarchy**: Inter display and body hierarchy with negative optical tracking (`-0.02em` to `-0.04em`), paired with tabular JetBrains Mono (`tabular-nums`) reserved strictly for measurements, terminal logs, and telemetry counters.

***

## 1. Overview & Core Concept

- **What It Delivers**: A unified, high-polish visual refactor of CatalystLab that replaces mismatched design tokens and legacy border styles with Meta's confident hardware-merchandising and commerce design system.
- **Target Persona**: Web engineers, security auditors, and site reliability teams monitoring mission-critical web vitals, OWASP vulnerabilities, and AI readiness across global edge nodes.
- **Core Value**: Transforms CatalystLab from an ad-hoc dashboard into an authoritative, instrument-grade product surface that balances spacious white/ink canvases, high-contrast typography, and unmistakable action hierarchy.

***

## 2. User Experience & Visual Design

### Aesthetic Direction
- **Brand Voice**: Confident, restrained, and photography/data-first. Surfaces avoid decorative clutter, code comments, or fake version badges in favor of generous spacing and stark contrast.
- **Dual-CTA Signature**: Marketing surfaces lead with black pill buttons (`#000000` in light mode, `#FFFFFF` in dark mode) paired with 2px outlined ghost buttons; commerce and audit checkout flows use vibrant cobalt blue pills (`#0064E0`).

### Color Palette & Semantic Tokens

```
┌────────────────────────────────────────────────────────────────────────┐
│ META DESIGN SYSTEM COLOR DISTRIBUTION (60-30-10)                       │
├────────────────────┬────────────────────┬──────────────────────────────┤
│ 60% Canvas Field   │ 30% Structural     │ 10% High-Intent Accents      │
├────────────────────┼────────────────────┼──────────────────────────────┤
│ Light: #FFFFFF     │ Light: #F1F4F7     │ Primary Ink: #000000 / #FFF  │
│ Dark:  #0A1317     │ Dark:  #1C1E21     │ Buy/Action:  #0064E0 (Cobalt)│
│ Hairline: #CED0D4  │ Divider: #DEE3E9   │ Vital State: #31A24C (Green) │
│ Text: #1C1E21      │ Muted: #4B4C4F     │ Risk State:  #E41E3F (Crimson│
└────────────────────┴────────────────────┴──────────────────────────────┘
```

- **Canvas & Surface**:
  - Light Mode: Canvas `#FFFFFF`, Surface Soft `#F1F4F7`, Hairline `#CED0D4`, Muted Hairline `#DEE3E9`.
  - Dark Mode: Canvas `#0A1317` (Deep Ink), Surface `#1C1E21` (Ink), Hairline `rgba(255,255,255,0.14)`.
- **Primary Actions**:
  - `button-primary`: Black pill (`#000000`) in light mode; crisp white pill (`#FFFFFF`) in dark mode.
  - `button-buy-cta`: Cobalt blue (`#0064E0`) with deep cobalt hover (`#0457CB`) for plan checkouts and audit executions.
  - `button-secondary`: Outlined ghost pill with 2px border and transparent background.
- **Assay & Status Hues**:
  - Success/Passing: `#31A24C`
  - Warning/Attention: `#F7B928` / `#F2A918`
  - Critical/Failing: `#E41E3F` / `#F0284A`
  - Assay Stream: `#0091FF` / `#22D3EE`

### Typography & Hierarchy
- **Display & Headings**: Inter variable, bold/medium weights (500/600), tight line-height (1.12 to 1.25), negative letter-spacing (`-0.02em` to `-0.04em`), `text-wrap: balance`.
- **Body Prose**: Inter regular (400), 16px base, 1.50 line-height, `-0.01em` tracking.
- **Data & Telemetry**: JetBrains Mono with tabular figures (`tabular-nums font-mono`), 11px–13px, reserved strictly for numeric scores, latency measurements, and terminal output.

### Component Styling & Spatial Geometry
- **Buttons**: `rounded-full` (`100px`), 44px minimum touch target height, `14px 30px` padding for primary actions, `12px 28px` for secondary buttons.
- **Containers & Bento Cards**: `rounded-[32px]` (`rounded-3xl`), 24px–32px internal padding (`p-6` to `p-8`), single-level elevation with hairline borders (`1px solid var(--app-border)`).
- **Form Inputs**: `rounded-lg` (`8px`), 44px height, 16px text size to prevent mobile auto-zoom, clear focus ring (`2px solid #1876F2`).
- **Category Tabs**: Pill-shaped segmented tabs (`rounded-full`), inactive with 1px hairline border, active with solid contrast fill (`bg-[#0A1317] text-white dark:bg-white dark:text-[#0A1317]`).

### Interactive Feedback & Motion
- Micro-interactions settle smoothly within 150ms–200ms using `cubic-bezier(0.16, 1, 0.3, 1)`.
- Compositor-only transforms (`transform: translateY(-2px)`, `opacity`), respecting `prefers-reduced-motion`.

***

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Root `DESIGN.md` Synchronization
- **Approach**: Update the repository's root `/DESIGN.md` with Meta's official token set and component specifications from `/meta/DESIGN.md`, enriched with CatalystLab's domain telemetry rules and guardrails.
- **Rationale**: Keeps a single canonical source of truth for both developers and automated design token linters (`scripts/check-design-tokens.mjs`).

### Decision 2: Dual-Theme Contrast Parity
- **Approach**: Maintain strict WCAG AA contrast compliance (4.5:1 text, 3:1 graphical elements) in both light and dark themes without compromising Meta's stark aesthetic.
- **Rationale**: Telemetry operators toggle between dark operating floors and daylight documentation reading. Inverting to ink-deep `#0A1317` preserves battery and dark-room readability while matching Meta's typographic rhythm.

### Decision 3: Card Curvature Standardization
- **Approach**: Standardize the card system (`src/styles/card-tokens.css`, `Card.tsx`, `.ds-card`, `.framer-card-*`) to 32px outer radius (`--card-radius-outer: 32px`) and nested inner elements to 16px.
- **Rationale**: Eliminates the "radius lottery" where components had random 16px, 20px, and 24px corners, fulfilling Meta's `{rounded.xxxl}` signature.

***

## 4. Technical Architecture & Component Mapping

```
┌────────────────────────────────────────────────────────────────────────┐
│ DESIGN SYSTEM REFACTOR ARCHITECTURE                                    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
       ┌─────────────────────────────────────────────────────────┐
       │              meta/DESIGN.md & DESIGN.md                 │
       │   Canonical Tokens: Colors, Typography, Shapes, Buttons │
       └────────────────────────────┬────────────────────────────┘
                                    │
            ┌───────────────────────┴───────────────────────┐
            ▼                                               ▼
┌───────────────────────────────┐       ┌───────────────────────────────┐
│        src/index.css          │       │   src/styles/card-tokens.css  │
│  - Semantic CSS Variables     │       │  - 32px Card Radii            │
│  - .ds-btn / .ds-card         │       │  - Pill Radius (100px)        │
│  - Dual-Theme Mappings        │       │  - Enzyme Hue Accents         │
│  - 3-Zone Top Bar Primitives  │       │  - Flat-by-Default Elevation  │
└───────────────┬───────────────┘       └───────────────┬───────────────┘
                │                                       │
                └───────────────────┬───────────────────┘
                                    │
                                    ▼
       ┌─────────────────────────────────────────────────────────┐
       │            Core UI Primitives & Components              │
       │  - Card (primitives/Card.tsx) -> 32px rounded-3xl       │
       │  - PillCTA (primitives/PillCTA.tsx) -> 100px pill       │
       │  - Navbar (layout/Navbar.tsx) -> 3-zone, pill tabs      │
       │  - StickyHUD & CommandCenterHUD -> Meta data console    │
       │  - HeroSection (home/HeroSection.tsx) -> Dual CTA       │
       │  - BentoGrid & Telemetry Cards -> 32px Meta panels      │
       └────────────────────────────┬────────────────────────────┘
                                    │
                                    ▼
       ┌─────────────────────────────────────────────────────────┐
       │           Verification & Quality Gateways               │
       │  - npm run check:design (Token guardrails)              │
       │  - npm run lint & npm run typecheck                     │
       │  - compile_applet (Vite build)                          │
       └─────────────────────────────────────────────────────────┘
```

### Component Execution Plan

1. **Design System Definitions (`DESIGN.md`)**:
   - Merge Meta's structured tokens into root `DESIGN.md`.
   - Ensure color definitions (`primary: "#0064E0"`, `ink-button: "#000000"`, `canvas: "#FFFFFF"`, `ink-deep: "#0A1317"`) and shape definitions (`rounded.full: "100px"`, `rounded.xxxl: "32px"`) are normalized.

2. **Global CSS & Token Architecture (`src/index.css` & `src/styles/card-tokens.css`)**:
   - Align `:root` and `[data-theme="light"]` with Meta tokens: `--app-primary: #000000`, `--color-buy: #0064E0`, `--app-background: #FFFFFF`, `--app-card: #FFFFFF`, `--app-muted: #F1F4F7`.
   - Align `[data-theme="dark"]` with Meta dark adaptation: `--app-background: #0A1317`, `--app-card: #1C1E21`, `--app-primary: #FFFFFF`, `--app-border: rgba(255,255,255,0.14)`.
   - Refactor `.ds-btn`, `.ds-btn-primary`, `.ds-btn-secondary`, and `.ds-card` classes to enforce 100px pill curvature and 32px container radii.

3. **Card & Bento Primitives (`src/components/cards/`)**:
   - Update `Card.tsx` variant classes to use `rounded-[32px]` and Meta surface colors.
   - Refactor `PillCTA.tsx` to ensure `rounded-full` 100px pills with Meta button paddings (`14px 30px`), 44px touch height, and correct variant themes (primary ink, cobalt buy CTA, ghost outline).

4. **Navigation & Global Chrome (`src/components/layout/Navbar.tsx` & `StickyHUD.tsx`)**:
   - Ensure 3-zone layout contract: single-element wordmark, single-line pill-tab navigation links, and single primary action CTA.
   - Category pill tabs styled with Meta pill-tab specs (quiet 1px border at rest, solid contrast fill when active).

5. **Landing & Persuade Surfaces (`src/components/home/HeroSection.tsx`, `MasterAuditPage.tsx`)**:
   - Update Hero to Meta dual-CTA signature: primary black pill ("Run Instant Audit") + secondary ghost outlined pill ("View Sample Report").
   - Update feature cards and bento grids to 32px rounded panels with photographic or high-contrast telemetry backgrounds.

6. **Automated Verification**:
   - Run `npm run check:design` to verify token integrity.
   - Run `compile_applet` to verify compilation and zero build regressions.
