# Improvement fields — newgen re-run, 2026-10-21

> **Status (2026-10-21): dated record — kept verbatim as evidence, not rewritten.** Point-in-time improvement fields from the newgen re-run; remediation landed the same day. Current state: [`docs/codebase/`](../../codebase/).

Leverage-ordered fields; gates referenced are defined in 00-MASTER.md §5.

## Field 1 — Freshness of instruction surfaces (A6)
P0-1 is the field: DESIGN.md's body is one palette behind its own frontmatter.
Docs that steer agents must diff against code, not memory. → Gate G1.
**Movement: design system REWRITE → KEEP.**

## Field 2 — Binding (A4): validators that gate nothing
`check:design` unwired; docs properties (paths, counters) ungated despite being
true today. Truth without a gate is a loan. → Gates G4, G3, G6.
**Movement: Testing & CI and Docs OPTIMIZE items close.**

## Field 3 — Meta-tool hygiene (D1)
Scripts must be safe to interrogate: `--help` side-effect-free, exit 0.
→ Gate G2. **Movement: scripts class OPTIMIZE → KEEP.**

## Field 4 — Single-source inventories
Hand-duplicated manifests drift (media verifier). Generate from the registry.
→ Gate G5. **Movement: media pipeline's verifier becomes evidence again.**

## Field 5 — Deferred structural debt (A7)
`patch.css` dual-CSS (baseline A-6, third audit to carry it) and unscoped hex.
Each re-run that re-reports without closing lowers the report's credibility —
close it or formally accept it in an ADR. **Movement: removes the oldest open
finding in the repo's audit history.**
