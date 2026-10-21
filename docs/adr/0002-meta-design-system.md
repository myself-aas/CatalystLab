# ADR 0002 — Meta-derived design system becomes the normative token source

## Status
Accepted (2026-10-21). Supersedes [ADR 0001](0001-clean-saas-palette.md)
(Clean SaaS palette), which had already been marked superseded by owner
direction on the same date.

## Context
The owner directed adoption of the Meta design system
(voltagent/awesome-design-md `design-md/meta/DESIGN.md`) adapted to CatalystLab
telemetry branding. Two artifacts in the tree carry it:

- **`DESIGN.md`** (repo root) — the adaptation itself: front-matter token sheet
  with primary `#0064E0`, `primary-deep #0457CB`, `fb-blue #1876F2`, canvas
  `#FFFFFF`, ink scale (`#1C1E21` → `#8595A4`), severity hues (`success #31A24C`,
  `attention #F2A918`, `warning #F7B928`, `critical #E41E3F`), and Optimistic VF
  (Inter/system-ui fallback) as the display face.
- **`.impeccable/design.json`** — generated token metadata (`schemaVersion 2`,
  `generatedAt 2026-10-21`): "Catalyst Blue" `#0066FF` primary ramp, "Bench
  Charcoal" `#1F2223` neutral ramp, assay-cyan tertiary.

## Decision
`DESIGN.md` is the normative design-language document for the product; the
executable guard is `npm run check:design` (`scripts/check-design-tokens.mjs`),
which enforces the Meta cobalt `--color-buy: #0064E0` (purchase CTAs only) in
`src/index.css` and fails CI on regression — the same guard position ADR 0001
established for its palette.

Carried over from ADR 0001: severity/assay hues remain **data colours** only.
Severity must stay distinguishable (WCAG 1.4.1); brand tokens alone may not
express it.

## Consequences
- Component theming flows from tokens, not hard-coded hex — reversing a palette
  decision remains a token-layer operation (the point ADR 0001 made).
- **Open tension 1 — two primaries.** `DESIGN.md` says `#0064E0`;
  `.impeccable/design.json` says Catalyst Blue `#0066FF`. The CI guard enforces
  the `DESIGN.md` value, so `DESIGN.md` wins where they conflict; the design.json
  ramps predate full reconciliation and are illustrative until regenerated.
- **Open tension 2 — stale contributor instructions.** `AGENTS.md` still
  describes a "dark-mode-first" platform with `data-theme="dark"` scaffolding,
  while `src/index.css` implements a light-gray CSS-variable base with light as
  the default theme (ADR 0001's consequence). Flagged here, not resolved: either
  `AGENTS.md` gets updated or dark-first gets reinstated — owner call.
- Dated design audits (`../design-system-audit.md`, `../impeccable-audit.md`)
  pre-date this adoption; their findings are read against `DESIGN.md`, not
  against the Clean SaaS palette of ADR 0001.
