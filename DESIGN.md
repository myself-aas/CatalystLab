---
name: CatalystLab
description: Mission-control telemetry laboratory for multi-dimensional web-health auditing.
colors:
  royal-blue: "#2563EB"
  deep-blue: "#1E40AF"
  mist-gray: "#F3F4F6"
  pure-white: "#FFFFFF"
  ink-navy: "#111827"
  # Assay hues are DATA only (severity/engine identity), never brand surfaces:
  vital-emerald: "#34D399"
  risk-crimson: "#F87171"
  caution-amber: "#FBBF24"
  assay-cyan: "#22D3EE"
typography:
  display:
    fontFamily: "Space Grotesk, Inter, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 6vw, 3.75rem)"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Space Grotesk, Inter, system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 600
    lineHeight: 1.12
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.4
  data:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.6875rem"
    fontWeight: 500
    lineHeight: 1.4
    fontFeature: "tnum"
rounded:
  panel: "16px"
  inner: "12px"
  chip: "6px"
  pill: "9999px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.catalyst-blue-deep}"
    textColor: "#FFFFFF"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "44px"
  button-primary-dark:
    backgroundColor: "{colors.ice-reading}"
    textColor: "{colors.bench-charcoal}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "44px"
  card-panel:
    backgroundColor: "{colors.instrument-panel}"
    textColor: "{colors.ice-reading}"
    rounded: "{rounded.panel}"
    padding: "20px"
---

# Design System: CatalystLab

## Overview

**Creative North Star: "Mission Control"** (confirmed 2026-10-21; palette replaced 2026-10-21 by the owner-pinned Clean SaaS palette)

CatalystLab is a telemetry floor, not a marketing page with charts. Operators
arrive, read instruments, and act. The interface is a clean, light SaaS surface
— white canvas, mist-gray panels, ink-navy text, one royal blue for action —
dense where density is data and quiet everywhere else, so a single amber or
crimson reading commands the room. A dark Ink-Navy theme remains available. Colour is never decoration: it is the state of an
assay. Type is instrumentation: a geometric display face for the few moments
the product speaks in its own voice, a neutral sans for operations, and a
tabular mono reserved strictly for measurements.

**Key Characteristics:**
- Bench-charcoal canvas, instrument-panel surfaces, ice-white readings
- Catalyst Blue is the colour of action; assay hues are the colours of state
- One authored moment per surface; everything else is feedback, fast and plain
- Density through hierarchy and tabular data, never through shrinking type

## Colors

A dark operating environment (chosen from the use scene: engineers reading
telemetry for extended sessions), with a fully legible light theme for
documents and reports.

### Primary (owner-pinned Clean SaaS palette)
- **Royal Blue** (#2563EB): every primary action, link, and focus ring.
- **Deep Blue** (#1E40AF): primary hover/pressed, nothing else.
- **Mist Gray** (#F3F4F6): muted panels and wells. **Pure White** (#FFFFFF):
  canvas and cards. **Ink Navy** (#111827): text, and the dark-theme canvas.

### Tertiary (assay hues — one per engine family, normative in
`src/styles/card-tokens.css` as `--hue-*`)
- **Vital Emerald** (#34D399): health passing, VitalZyme/EcoHolo readings
- **Risk Crimson** (#F87171): security risk, failing readings
- **Caution Amber** (#FBBF24): warnings, quota pressure, SynthShift
- **Assay Cyan** (#22D3EE): live data, terminal output, EdgeVmax
- **Synth Violet** (#A78BFA): AI/LLM readiness readings

### Neutral
- **Ink Navy** (#111827) on **Pure White** (#FFFFFF), muted text at 68% ink;
  dark theme inverts to white on Ink Navy with Mist at 8% white.

### Named Rules
**The Colour-Is-Data Rule.** Every hue on screen answers "what is the state of
what?" If it doesn't, it's removed. Severity must never collapse to the text
colour (guarded by `npm run check:design`).

## Typography

**Display Font:** Space Grotesk (headlines only — the instrument dial voice)
**Body Font:** Inter (operations and reading)
**Label/Mono Font:** JetBrains Mono (measurements, terminal, code only)

**Character:** One distinctive face spent in one place. Mono is earned by
numbers; it is not a costume for labels.

### Hierarchy
- **Display** (600, clamp(2.25rem, 6vw, 3.75rem), 1.05): hero headlines only
- **Headline** (600, 2.25rem, 1.12): section headings, balanced wrapping
- **Title** (500, 1.25rem, 1.3): card and panel titles
- **Body** (400, 1rem, 1.65): prose at 45–75ch, `text-wrap: pretty`
- **Label** (600, 0.75rem): control labels — sentence case, not tracked-out caps
- **Data** (500, 0.6875rem, tabular): scores, quotas, telemetry figures

### Named Rules
**The 12px Floor Rule.** Nothing a user must read is set below 12px; 11px
exists only as the mono `data` role. Density comes from grouping, not shrinkage.

## Layout

Left-aligned operating surfaces on a 1400px max canvas with fluid gutters
(`clamp(1rem, 3vw, 2rem)`); Persuade surfaces may centre a single pitch measure
(≤65ch) above a full-width instrument strip. Spacing rhythm 8/16/24/32.
Breakpoints are Tailwind defaults (sm 640 / md 768 / lg 1024); layouts stack
single-column on mobile with 44px minimum touch targets. No horizontal-scroll
content regions except deliberate data tables and logo marquees.

## Elevation & Depth

Flat by default. Depth is tonal (canvas → panel → elevated) plus a single
hairline border; shadows are ambient and diffuse, appearing on hover or for
floating chrome (menus, modals, the nav glass) — never a hard offset, never a
coloured halo at rest.

### Named Rules
**The Flat-By-Default Rule.** A surface earns shadow only by floating or by
responding. Border *or* shadow at rest, not both.

## Shapes

Instrument-panel geometry: panels at 16px radius, inner wells at 12px, chips
at 6px, pills reserved for small controls and primary actions. No radius
lottery — a radius names the role, per `src/styles/card-tokens.css`.

## Components

### Buttons
- **Shape:** pill, 44px minimum height, sentence-case labels naming the action
- **Primary:** Catalyst Blue (light theme) / Ice on charcoal (dark theme)
- **Hover / Focus:** colour shift plus a visible 2px focus ring; never rely on
  shadow alone

### Chips
- **Style:** muted surface, hairline border, mono for data chips only
- **State:** selected chips take the assay hue of their engine at 10% fill

### Cards / Containers
- **Corner Style:** 16px panel radius
- **Background:** Instrument Panel on Bench Charcoal
- **Border:** one hairline; shadow only on hover (see Elevation)
- **Internal Padding:** 16–20px, tight groups inside, generous separation out

### Inputs / Fields
- **Style:** recessed well, hairline border, 44px height, 16px text
  (prevents iOS focus zoom)
- **Focus:** border brightens plus ring; error states name the problem and the
  recovery in sentence case

### Navigation
- Fixed top instrument bar with glass blur (functional: content scrolls under
  it), sentence-case links, active state by fill and weight, not colour alone

### Terminal / Telemetry Stream (signature)
The live audit stream is the product's signature component: Assay Cyan mono on
the deepest canvas, tabular figures, state changes announced via colour *and*
text. It is the one place spectacle is earned — readings arriving.

## Do's and Don'ts

### Do:
- **Do** route every colour through semantic tokens (`npm run check:design`
  must pass); raw hex belongs in token files, not components.
- **Do** keep one authored moment per surface and let the audit be it on
  Persuade surfaces.
- **Do** give every interactive element a native element or full keyboard
  parity (`src/lib/keyboard.ts`), a visible focus state, and 44px of target.
- **Do** respect reduced motion by removing spectacle while preserving
  state-change feedback.

### Don't:
- **Don't** put an eyebrow/kicker label above a heading. The heading speaks.
- **Don't** use mono, uppercase, or tracking as "technical" decoration on
  non-data text.
- **Don't** set readable text below the 12px floor, or ship a clickable
  `<div>` without keyboard parity.
- **Don't** reintroduce unscoped global element rules or a second CSS system;
  `patch.css` is legacy to be merged into layers, then deleted.
- **Don't** flatten severity into one colour, ever — that regression is what
  the guardrail exists to catch.
