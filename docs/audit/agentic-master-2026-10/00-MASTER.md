# Master Audit Report — CatalystLab, New-Generation Optimization (re-run)

> **Status (2026-10-21): dated record — kept verbatim as evidence, not rewritten.** Point-in-time master audit (newgen re-run). Findings were remediated the same day; the verified current state lives in [`docs/codebase/`](../../codebase/). Docs index: [`docs/README.md`](../../README.md).

**Audited:** 2026-10-21 (re-run; supersedes the AR-rubric run of the same date) ·
**Branch:** `arena/d85a5b1f-catalystlab` · **Scope:** every auditable unit of the
CatalystLab system — 8 domains, the `scripts/` tool class, and the instruction
surfaces (DESIGN.md, PRODUCT.md, docs/) that steer agents working in this repo.
**Rubric:** New-Generation Model Optimization Rubric v1 from
`myself-aas/claude-skills/audit/newgen-2026-06/RUBRIC.md`, whose 00-MASTER.md this
report mirrors. Verdicts: **KEEP · OPTIMIZE · REWRITE · CUT-OR-MERGE**, scored on
A1 trigger/context quality, A2 context economy, A3 tool wiring, A4 verification
loop, A5 real-world expertise, A6 freshness, A7 no filler — plus the source's
D-class script contract (`--help` exits 0, deterministic, machine-parseable).
**Method:** two automated sweep layers (scripted scans for triggers/freshness/
phantom paths/counter drift + a `--help` smoke of every script) followed by deep
dives per domain that **executed** empirical claims. This re-run replaces the
AR1–AR6 agentic-readiness scoring of the previous run; where the two rubrics
disagree, the disagreement is itself reported (§3, note).

**Verification executed for this audit (fresh, 2026-10-21):**

| Check | Result |
|---|---|
| check:env / check:design / lint / typecheck | ✓ all pass |
| `npm run test` | ✓ 330/330 (36 files) |
| build + check:bundle | ✓ budgets satisfied |
| sec:secrets | ✓ 593 tracked files, 0 secrets |
| Script `--help` smoke (D1 contract) | **8/10 pass** — `verify-deployment.mjs` and `verify-media.mjs` exit 1 on `--help` (they run their full check instead) |
| Phantom-path scan (42 docs, backticked repo paths) | ✓ all exist (line-number suffixes stripped) |
| Counter derivation | ✓ docs claims match tree exactly: 363 src files, 54 pages, 142 routes, 330 tests |
| Orphan scripts | ✓ zero (all 15 wired into package.json/workflows/docs) |
| media:check | ✗ in sandbox only (egress-blocked) — see P1-2 |

---

## 1. Repo-wide scorecard

**8 domains audited as units** (per-unit verdicts + "Verify (definition of done)"
blocks in [domains.md](domains.md)):

| Verdict | Count | Units |
|---|---|---|
| **KEEP** | 4 | Frontend app · Backend API & engines · Deployment & ops · Security |
| **OPTIMIZE** | 3 | Testing & CI · Media pipeline · Docs & knowledge |
| **REWRITE** | 1 | Design system (DESIGN.md body — §2, P0-1) |
| **CUT-OR-MERGE** | 0 | — nothing failed to earn its context; the root `components/` tree was re-verified as intentional 2-line re-export shims, not duplication |

Artifact classes: 15 scripts (13 wired + smoke-clean; 2 `--help` contract fails) ·
5 workflows (all jobs exit-code gated) · 42 docs (0 phantom paths, counters exact).

## 2. P0 — Correctness defects (fix before anything else)

| # | Defect | Where | Evidence |
|---|---|---|---|
| P0-1 | **DESIGN.md's body teaches a superseded design system as current.** The frontmatter and System-source note (updated 2026-10-21) declare the Meta system; the body still specifies the Clean SaaS palette ("Royal Blue #2563EB: every primary action, link, and focus ring", Deep Blue hover, Ink Navy, bench-charcoal canvas) and "Display Font: Space Grotesk" — a font removed from `index.html` in the same pass. An agent (or human) following the body rebuilds the wrong product; the code (`--app-primary: #000000`, cobalt `#0064E0` buy-only, Optimistic/Inter) contradicts it. Identical defect class to the source audit's P0-10 (stale orchestrator text bypassing shipped systems). | `DESIGN.md:103–160` vs `src/index.css:175,514` | DESIGN.md body, re-read in full this run |

No other P0s: no stale model names, dead prices, or 2024-isms in instruction
surfaces (A6 sweep clean outside P0-1); secrets scan clean; SSRF guard refuses
internal hosts in executed tests.

## 3. P1 — Systemic wiring failures (one fix clears many)

1. **`check:design` is not load-bearing.** The token validator passes but is in
   neither `npm run ci` nor any workflow — P0-1 survived precisely because nothing
   diffs DESIGN.md against the tokens it describes. (Under the previous AR-rubric
   run this was "AR4 described ≠ required"; both rubrics converge here — the
   finding is rubric-independent.)
2. **`verify-media.mjs` verifies a manifest the app no longer serves.** It
   hardcodes 19 URLs; its U-FACE-1…4 point at Unsplash portraits while
   `src/lib/media/registry.ts` serves self-hosted avatars (avatar-1…4). It also
   cannot distinguish dead links from blocked egress (all-FAIL in this sandbox,
   green in CI). Only the 4 `V_*` Pexels videos remain genuinely remote.
3. **`--help` contract fails on 2/10 scripts** (D1): `verify-deployment.mjs` and
   `verify-media.mjs` execute their full (network-dependent) check on `--help`.
   The source audit's meta-tool-hygiene defect, verbatim.
4. **Dual CSS systems persist** (baseline A-6, still open): `patch.css` (1,148
   lines) competes with `src/index.css` tokens, winner decided by import order;
   `index.html:129` fallback markup still paints the old `#1F2223` charcoal.
5. **807 raw hex literals in TSX** — mostly legitimate data-viz encoding, but
   unscope-guarded: nothing stops new arbitrary hex in page components
   (the `--hue-*` token route exists and is unused as a lint rule).

## 4. What's already excellent (the template to copy)

- **Testing & CI gates** — coverage ratchet, bundle budget, 0-vulnerability,
  strict Lighthouse reporter, restore drill and payments sandbox executing real
  contracts in CI. 330/330 green under shuffled sequence.
- **Refusal-oriented intake** — zod validation, SSRF guard, env-parity gate:
  the newgen "forcing/refusal" pattern, already shipped in the backend domain.
- **Counter honesty** — every number in the docs (363 files, 54 pages, 142
  routes, 330 tests) derives exactly from the tree today; rare, and worth
  protecting with gate G3 below.
- **Media registry design** — fallback chains + licence provenance per entry;
  its verifier (P1-2), not the registry, is the defect.

## 5. Recommended verification harness (CI gates to add)

Adapted from the source audit's G-gates to this repo's defect classes:

| Gate | Catches | Spec |
|---|---|---|
| **G1 docs↔code token diff** | P0-1 | Assert every hex/font named in DESIGN.md's Colors/Typography sections exists in `src/index.css` tokens; fail on orphans either direction. |
| **G2 `--help` contract** | P1-3 | Every `scripts/*` exits 0 on `--help` within 5s, side-effect-free; exceptions listed in-file. |
| **G3 counter derivation** | future drift | Script derives files/pages/routes/tests counts and diffs against audit-doc claims (currently exact — lock it in). |
| **G4 design gate binding** | P1-1 | `npm run ci` includes `check:design`; breaking a pinned token fails Gates. |
| **G5 media manifest single-source** | P1-2 | Verifier generates its list from `MEDIA_REGISTRY`; sandbox runs report BLOCKED-EGRESS ≠ DEAD. |
| **G6 path-existence linter** | phantom paths | Backticked repo paths in docs must exist (passes today — keep it that way). |

## 6. Suggested execution order (follow-up PRs)

1. **PR-1 (P0, ~1h):** rewrite DESIGN.md Colors/Typography/North-Star body to the
   shipped Meta system; fix `index.html:129` fallback colours. Verify: G1 passes.
2. **PR-2 (binding):** G4 + G2 (add `--help` short-circuits to the two scripts).
3. **PR-3 (media):** G5 + self-host/poster the 4 `V_*` videos → media:check hermetic.
4. **PR-4 (structure):** close A-6 — fold `patch.css` into the token layer; scope
   the hex rule (charts via `--hue-*` only).
5. **PR-5 (CI):** land G1, G3, G6 as blocking gates.

## 7. Where the per-unit verification criteria live

[domains.md](domains.md): every unit carries A-dimension notes and 2–4 executable
"Verify (definition of done)" checks — the input for gates G1–G6.
[improvement-fields.md](improvement-fields.md): the cross-unit fields by leverage.
Prior AR-rubric scoring is superseded by this re-run; its one rubric-independent
finding (unbound design gate) is carried above as P1-1.
