# CatalystLab — Frontend Design System Audit

> **Status (2026-10-21): dated record — kept verbatim as evidence, not rewritten.** Point-in-time audit against the `frontend-design` skill; predates the Meta design-system adoption ([ADR 0002](adr/0002-meta-design-system.md), 2026-10-21). Normative tokens now: [`DESIGN.md`](../DESIGN.md) + `.impeccable/design.json`, guarded by `npm run check:design`.

**Method:** Audited against the `frontend-design` skill (anthropics/skills) — distinctive,
subject-grounded identity; deliberate typography; no templated defaults; restraint;
accessible quality floor. Skill instructions were fetched with
`npx skills use "https://github.com/anthropics/skills" --skill "frontend-design"`
(full output captured to a temp file and read before this audit; supporting files
resolved from the directory it reported).

**Scope scanned:** 375 TS/TSX files (~51k LOC in `src/`), 4 CSS sources
(`src/index.css` 1,620 lines, `patch.css` 1,143, `src/styles/card-tokens.css`,
`src/styles/react-dev-tokens.css`), `index.html`, `components.json`, root-level
`components/` tree. Metrics below are from scripted scans, not sampling.

---

## 1. The subject, and the design plan the skill asks for

CatalystLab is a **biochemistry-flavoured web-telemetry laboratory**: eight diagnostic
"enzymes" (VitalZyme, RiskProtease, LLMKinase, EdgeVmax, EcoHolo, SynthShift,
GitLygase, Alloster) run assays against a domain and report instrument readings.
Audience: engineering teams. Primary job: make a stranger trust an audit enough to
run one, then read dense results without fatigue. That subject — *lab instrument,
not SaaS dashboard* — is where every choice below comes from.

### Proposed token system (the plan, reviewed against the brief before building)

| Axis | Decision | Why it is this product, not a default |
|---|---|---|
| **Colour** | Bench Charcoal `#1F2223` (canvas), Instrument Panel `#2C3032` (surface), Ice Reading `#F0FAFF`/`#F7FDFF` (text), **Catalyst Blue `#0066FF`** (primary action — the reaction starting), **Assay Cyan `#22D3EE`** (live data), plus the per-enzyme hues already defined in `card-tokens.css` (emerald `#10B981`, crimson `#EF4444`, violet `#8B5CF6`, amber `#F59E0B`…) | Blue was already the ghost in the machine (`--border-glow: rgba(0,102,255,.4)`, hero glows) before the palette was flattened. Enzyme hues already exist as `--hue-*` tokens. Colour = which assay / what severity. |
| **Type** | **Space Grotesk** (display only), **Inter** (body/UI), **JetBrains Mono** (data, scores, terminal output only) | Space Grotesk's geometric, instrument-dial character gives headlines a lab-equipment voice; Inter stays for legibility at small sizes; mono is *earned* by numbers, not sprayed on labels. |
| **Layout** | Left-aligned, instrument-panel grid; one orchestrated hero moment (the live audit itself), quiet sections after; hairline borders encode panel boundaries, radius 16px panels / full-pill actions only | Structure should read like a bench instrument: readings first, decoration last. |
| **Principles** | (1) Colour is data — never decoration, never collapsed. (2) Spend boldness once: the audit/terminal moment. (3) Type size ≥12px for anything a user must read. (4) One token source; utilities consume tokens, never raw hex. | Directly answers the failures found below. |

**Self-critique of the plan (skill: review before building):** the first draft kept the
existing monochrome palette "because it's intentional" — but monochrome here is not a
choice, it's residue of automated colour-replacement scripts (see F1), and it makes
severity unreadable. The plan therefore *restores* the colour the product already
encodes in its enzyme tokens rather than inventing a new brand. The acid-green/near-black
and cream/serif clusters the skill warns about were avoided; charcoal + reaction-blue is
grounded in this codebase's own pre-flattening tokens.

---

## 2. Findings

Severity: **P0** breaks comprehension/accessibility · **P1** system integrity ·
**P2** generic-default tells (skill) · **P3** hygiene.

### P0 — Colour stopped meaning anything (automated palette flattening)
Root-level one-shot scripts (`replace-colors.mjs`, `fix-slate-replacements.mjs`, …)
replaced hues wholesale with the text colour. Measurable damage:

- `--color-success`, `--color-warning`, `--color-danger`, `--color-link` were **all
  `#F0FAFF`** in both themes; `--app-destructive` was the surface grey `#2C3032`.
  A failing security check and a passing one rendered in the same colour — a
  **WCAG 1.4.1 (Use of Color)** failure in a product whose entire job is severity.
- Light theme was illegible by construction: `--app-primary: #F0FAFF` on
  `--app-background: #ffffff` (primary buttons ≈ invisible), `--app-muted-foreground:
  rgba(240,250,255,.45)` — white text on white.
- The slate/gray/zinc scales remapped in `@theme inline` collapse steps
  (e.g. dark `slate-600/700/800` are one value), so `text-slate-400` vs `slate-500`
  distinctions silently vanish.
- 1,273 raw hex literals in TSX (926× `#F0FAFF`), 3,312 arbitrary-value utilities —
  components bypass tokens, so any future re-theme is another sed script.

### P0 — `patch.css` overrides the design system it patches
`src/index.css` imports `../patch.css` (1,143 lines, 253 `!important` across CSS
sources). Being unlayered, it beats Tailwind's layered utilities. It set
`background:#1F2223 !important` on `html,body,#root` and ice-white colours on bare
`h1–h4`/`p` selectors **in both themes**, and contradicts `card-tokens.css`
(card radius 24px vs 16px, different shadow stacks) — two competing "systems",
winner decided by import order.

### P1 — The visible hero has no headline
`HeroSection` renders a full-viewport autoplaying 3D carousel; the H1, copy and the
audit URL form exist **only inside an `sr-only` block**. Sighted users get no
proposition, no visible primary action — the skill's "open with the most
characteristic thing" inverted: the characteristic thing (run an audit) is hidden.
(Not redesigned in this pass — see roadmap; needs a visual decision, not a token fix.)

### P1 — Typography: undefined token, default stack, sub-readable sizes
- `font-display` was used (docs pages) but `--font-display` was **never defined** —
  those headings silently fell back.
- Stack was Inter + JetBrains Mono: the two most default choices available.
- **788 instances of `text-[9px]/[10px]/[11px]`**, 431 of them 10px. Telemetry
  density is real, but 10px body-adjacent text fails the quality floor.
- No type scale: sizes are per-component arbitrary values (`text-[13px]` ×35, etc.).

### P2 — Generic-default tells (the skill's checklist, found verbatim)
- **202** tracked-out ALL-CAPS eyebrow labels (`uppercase tracking-*`, incl. the
  `framer-micro-tag` utility and `SectionHeader` eyebrow pill above headings).
- **961** `font-mono` usages — mono as generic "technical" garnish, not just data.
- 1,576 radius utilities across 10+ values, 590 shadow utilities — the SaaS-card kit:
  identical rounded cards, one soft shadow, gradient washes (188 gradient usages).
- 19 literal `→` appended to links/buttons; 12 `01/02/03` markers (some legitimate —
  `HowItWorks` is a real sequence; audit before removing elsewhere).
- Motion: 47 `whileHover` + 25 `whileInView` + marquee/pulse/ping — scattered
  fade-and-rise entrances rather than one orchestrated moment. Reduced-motion is
  handled in CSS and via `useReducedMotion` in places (19 files) — keep that.

### P3 — Hygiene
- Duplicate component trees: `src/components/ui` **and** root `components/ui`
  (incl. a `demo.tsx`), plus `components/telemetry` duplicating `src` equivalents.
- ≥10 one-off fix scripts at repo root (`fix_*.cjs`, `update_heroes.cjs`, …) —
  the mechanism that caused F1; they should be deleted, not kept as tooling.
- `components.json` declares shadcn `baseColor: neutral` while the app is a custom
  token system — misleading to future contributors/codegen.
- Strengths to keep: focus-visible coverage is broad (497 usages), `aria-label`
  present (123), exactly 1 `<img>` missing `alt`, print stylesheet, safe-area and
  reduced-motion blocks, tabular-nums for metrics (`.metric-tabular`).

---

## 3. What was fixed in this pass (foundation, verified)

Subject-grounded, token-level fixes — no page redesigns:

1. **Semantic colour restored** (`src/index.css`): success/warning/danger/info/link
   are distinct in both themes (dark `#34D399/#FBBF24/#F87171/#22D3EE/#66A6FF`;
   light `#047857/#B45309/#C81E1E/#0066FF/#0057D9`, all ≥4.5:1 on their surfaces);
   exposed to Tailwind as `text-success` etc. via `--app-*` vars in `@theme inline`.
   Terminal/accent tokens regain assay hues (cyan data, emerald vital, crimson risk).
2. **Light theme legible**: `--app-primary` is Catalyst Blue `#0057D9` with white
   foreground; muted foreground is `rgba(31,34,35,.68)`; destructive is `#C81E1E`
   (light) / `#DC2626` (dark) instead of surface grey.
3. **Display type defined & loaded**: `--font-display: "Space Grotesk"` added and
   loaded in `index.html`; `framer-hero-title`/`framer-section-headline` now use it.
   `framer-code-terminal` is assay-cyan again. Body (Inter) and data (JetBrains Mono)
   roles unchanged — one distinctive face, spent on headlines only.
4. **`patch.css` global rules scoped to `html.dark`** (body canvas, `h1–h4`, `p`,
   `.text-foreground/.text-muted-foreground` overrides) so light mode is no longer
   force-painted dark. Dark appearance unchanged.
5. **Guardrail**: `npm run check:design` (`scripts/check-design-tokens.mjs`, zero
   deps) fails CI-style if semantic colours collapse, light primary/muted regress,
   `--font-display` disappears, or unscoped global colour rules return to patch.css.

**Verification:** `npm run check:design` ✓ · `npx vite build` ✓ (compiled CSS
contains the new tokens) · `npm run typecheck` ✓ · `npm test` — **330/330 passed**.

## 4. Roadmap (not done here — needs design review per item)

| # | Item | Effort |
|---|---|---|
| R1 | **Visible hero**: real H1 + audit URL form as the hero's one bold moment; carousel becomes supporting proof, `sr-only` duplicate removed. | M |
| R2 | Delete root `components/` duplicate tree and the `fix_*`/`replace_*` scripts; point `components.json` at the real system or remove it. | S |
| R3 | Merge `patch.css` into `src/index.css` layers; one radius scale (16 panel / 12 inner / pill action) resolving the 16-vs-24 conflict; drop `!important` count to ~0. | M |
| R4 | Type scale tokens (`--text-*` in `@theme`), minimum 12px for readable text; replace the 788 tiny-text utilities by role (data-dense tables may keep 11px mono *labels only*). | M |
| R5 | De-eyebrow: `SectionHeader` eyebrow becomes optional plain label; numbered markers only where content is a true sequence; remove `→` suffixes (icon or nothing). | S |
| R6 | Token-only lint (stylelint/eslint rule banning raw hex in TSX); migrate the 926 `#F0FAFF` literals to `text-foreground` etc. in waves per directory. | L |
| R7 | Restore real slate/gray scales under the semantic remap, or delete the remap and migrate usages — decide once, document in `AGENTS.md`. | M |
| R8 | Motion budget: one page-load orchestration per view; remove blanket `whileInView` fade-rise from card grids. | M |

*Rule going forward:* tokens first (`src/index.css` + `src/styles/card-tokens.css`),
utilities consume tokens, and `npm run check:design` guards the semantics that a
find-and-replace once erased.
