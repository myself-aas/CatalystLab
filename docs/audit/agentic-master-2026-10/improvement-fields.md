# Improvement fields — CatalystLab agentic audit, 2026-10-21

Roll-up of domains.md into the fields where investment moves the most domains,
ordered by leverage. Distribution today (8 domains):
**5 HARNESS-READY · 2 LOOP-CAPABLE · 1 TOOL-ONLY · 0 PROSE-ONLY.**

## Field 1 — Binding verification (AR4): described ≠ required

The repo's signature defect class, twice: `check:design` passes but gates nothing;
the docs tree has no gate at all. Fix pattern: convert "run the validator" into
"the workflow does not proceed until `<cmd>` exits 0".
- Targets: design tokens (one line into `npm run ci`), docs links/ADR index.
- **Movement: design system 8→10 (HARNESS-READY), docs AR4 0→2.**
- Acceptance: breaking a pinned token or an intra-docs link fails `npm run ci` locally.

## Field 2 — Loop discipline (AR5): write the stop rule

Median 1/2 across all 8 domains; the source audit found the same repo-wide gap.
One standardized block, ported to runbook + engine docs:

> Remediate → re-run `<gate>` → exit 0 required. Max **3** cycles; a repeat failure
> for the same reason after 2 attempts means a structural assumption is wrong —
> stop and escalate with the evidence log.

- Targets: CI flake policy, engine outbound retries, rollback thresholds, media verifier.
- **Movement: four domains gain AR5 1→2 (frontend 10, testing 12, ops 12, security 11).**
- Acceptance: the block exists in `docs/ops/runbook.md` and is cited by drill/test script headers.

## Field 3 — Manifest drift (AR3): single-source every inventory

`verify-media.mjs` hardcodes a stale second manifest (its U-FACE ids verify URLs
the app no longer serves). Any hand-duplicated inventory drifts; generate or derive.
- Targets: media verifier (generate from `MEDIA_REGISTRY`); consider the same for
  the Lighthouse URL list vs the route table.
- **Movement: media AR3 1→2, AR4 becomes trustworthy.**
- Acceptance: renaming a registry entry changes verifier output with zero script edits;
  sandbox runs report BLOCKED-EGRESS instead of FAIL.

## Field 4 — Retire the last remote runtime dependencies

Only four `V_*` Pexels videos remain remote; everything visual else is self-hosted.
Until they are local, the media domain cannot be hermetic and Field 3's verifier
can never go fully green offline.
- **Movement: media 5→8 (LOOP-CAPABLE, knocking on HARNESS-READY).**
- Acceptance: `grep -r "videos.pexels.com" src/` → 0; `media:check` passes with
  Pexels egress blocked; hero/poster fallbacks verified visually.

## Field 5 — Structural debt deferred since the baseline (A-6)

`patch.css` (1,148 lines) still competes with the token layer by import order, and
807 raw hex literals remain in TSX (majority legitimate data-viz encoding — the fix
is scoping, not a purge: chart palettes via the existing `--hue-*` tokens).
- **Movement: design-system AR1 1→2 (intake becomes refusable: lint rule against
  new arbitrary hex outside charts).**
- Acceptance: `patch.css` < 100 lines or deleted; a new arbitrary hex utility in a
  page component fails `check:design`.
