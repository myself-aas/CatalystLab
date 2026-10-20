# ADR 0001 — Owner-pinned Clean SaaS palette replaces the Mission Control palette

## Status
Accepted (2026-10-21, product owner's attached palette is the brief)

## Context
The frontend carried a charcoal/ice "Mission Control" palette assembled by past
automated replacements. The owner supplied a five-colour Clean SaaS palette:
Royal Blue #2563EB, Deep Blue #1E40AF, Mist Gray #F3F4F6, Pure White #FFFFFF,
Ink Navy #111827, and directed it be implemented globally.

## Decision
The five colours are normative brand tokens in both themes: Pure White canvas
and Mist Gray panels with Ink Navy text in the (now default) light theme;
Ink Navy canvas in the optional dark theme; Royal Blue is the only action
colour, Deep Blue its hover state. Assay/severity hues remain as data colours
only — severity must stay distinguishable (WCAG 1.4.1), which a five-colour
brand palette alone cannot express.

## Consequences
- Light becomes the default theme (saved user preference still wins).
- `npm run check:design` now fails if the palette regresses.
- Hard-coded charcoal-era hex utilities were migrated; remaining raw-hex
  cleanup continues incrementally. Reversing this means re-theming tokens, not
  components — which is the point of doing it at the token layer.
