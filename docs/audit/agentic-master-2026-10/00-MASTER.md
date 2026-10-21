# Master report — CatalystLab agentic-loop audit

**Audited:** 2026-10-21 · **Branch:** `arena/d85a5b1f-catalystlab` (from `af86b7f`, main incl. PR #31/#32)
**Scope:** the whole CatalystLab system, decomposed into 8 auditable domains — design system/UI,
frontend app, backend API & engines, testing & CI, media pipeline, docs & knowledge,
deployment & ops, security — scored on the agentic-readiness rubric of
`myself-aas/claude-skills/audit/engineering-agentic-2026-07` (AR v1), whose 00-MASTER.md
this report deliberately mirrors.
**Method:** (1) re-read the prior baselines (`docs/design-system-audit.md`,
`docs/impeccable-audit.md` 9/20 → 15/20, `docs/plan/*`, ADR 0001); (2) re-ran every
locally-runnable Verify criterion deterministically (results below — no sampling);
(3) scripted source scans (363 src files, 54 pages, 142 routes, 15 scripts,
5 workflows) for orphan tooling, drift, and loop-discipline evidence.

**Verification actually executed for this audit (2026-10-21):**

| Gate | Command | Result |
|---|---|---|
| Env parity | `npm run check:env` | ✓ 42 keys parity-verified |
| Design tokens | `npm run check:design` | ✓ — **but see Finding 1: not wired into CI** |
| Lint | `npm run lint` | ✓ |
| Typecheck | `npm run typecheck` | ✓ |
| Unit/integration | `npm run test` | ✓ 330/330 (36 files) |
| Build + bundle budget | `npm run build`, `check:bundle` | ✓ 80 chunks, budgets satisfied |
| Secrets | `npm run sec:secrets` | ✓ 590 files, 0 secrets |
| Media endpoints | `npm run media:check` | ✗ in sandbox (egress-blocked hosts) — **Finding 2** |

---

## 1. The two questions

The prior audit wave (frontend-design + impeccable) asked: **does the frontend earn
its context window?** (identity, tokens, a11y floor). It drove the 9/20 → 15/20
remediation, the owner palettes, the Meta-system adoption, and Lighthouse-green CI.

This audit asks the next question, per the source rubric: **can an agent pick up a
goal in each domain and drive it to a verified close?** — the gather → act → verify →
repeat loop, scored AR1 goal intake, AR2 decomposition, AR3 deterministic execution,
AR4 verification, AR5 loop discipline, AR6 close-out (0–2 each; classes gated on
AR4 ≥ 1 **and** AR5 ≥ 1 for HARNESS-READY, regardless of total).

## 2. Combined scorecard (8 domains)

| Class | Domains | Count | Meaning |
|---|---|---|---|
| **HARNESS-READY** (≥9, AR4≥1, AR5≥1) | Frontend app (9), Backend & engines (10), Testing & CI (11), Deployment & ops (11), Security (10) | **5** | An agent can loop this today |
| **LOOP-CAPABLE** (6–8) | Design system (8), Docs & knowledge (6) | **2** | One or two additions away |
| **TOOL-ONLY** (3–5) | Media pipeline (5) | **1** | Good tools, no loop spine |
| **PROSE-ONLY** (0–2) | — | **0** | — |

Full per-domain AR tables and evidence: [domains.md](domains.md).

**Delta vs the prior baselines:** of the impeccable A-1…A-11 findings, all are
RESOLVED except A-6 (dual CSS systems — `patch.css`, 1,148 lines, still competes
with `src/index.css` by import order) and the media-catalogue depth item, both
PARTIALLY-RESOLVED and carried into §6. New since baseline: logo system, Meta
tokens, zero Pexels *image* hotlinks in the frontend, 4 distinct author avatars.

## 3. The single biggest finding: two verification gates are described, not required (AR4), and loop discipline (AR5) is nowhere written down

CatalystLab is unusually gate-rich — coverage ratchets, bundle budgets, strict
Lighthouse, 0-vulnerability, CSP-zero-violation, restore drills. But the audit found
the exact failure mode the source rubric warns about, twice:

1. **`check:design` is not load-bearing.** `scripts/check-design-tokens.mjs` passes
   today, yet it appears in **neither** `npm run ci` nor any GitHub workflow. The
   Meta-token system it pins can regress silently — the same "validator exists but
   its exit code isn't required" defect class as the source audit's Field 3.
   **Fix cost: one line** (add to the `ci` script). This alone moves the design
   system 8 → 10, LOOP-CAPABLE → HARNESS-READY.
2. **`verify-media.mjs` has drifted from the registry it verifies.** It hardcodes a
   second, stale manifest (19 URLs): its `U-FACE-1…4` still point at Unsplash
   portraits while `src/lib/media/registry.ts` now serves self-hosted avatars, and
   it cannot distinguish a dead link from blocked egress (it failed every check in
   this sandbox while CI passes). The runtime truth is narrower: only the four
   `V_*` Pexels *videos* remain remote. A verifier that cries wolf trains agents to
   ignore it — the reward-hacking hazard the rubric's AR4/AR5 gate exists to prevent.

Second gap, mirroring the source audit: **AR5 (loop discipline) is the weakest
dimension repo-wide** (median 1/2). Retries exist in code (mongo sync middleware,
webhook fan-out, LHCI's 2 runs) but no domain states an iteration cap or escalation
threshold an agent could obey. Nothing today can "run confidently and forever" in
production paths — but an *agent following these docs* has no written stop rule.

## 4. What this audit ships

This report set, in `docs/audit/agentic-master-2026-10/`, following the source layout:

- **00-MASTER.md** (this file) — scorecard, biggest finding, follow-ups.
- **domains.md** — per-domain AR tables with file/line evidence and each domain's
  single top improvement.
- **improvement-fields.md** — the cross-domain fields ordered by leverage, each with
  an executable acceptance criterion.
- No code changes: like the source audit, fixes land as the follow-up PRs in §6 so
  each carries its own verification.

## 5. Per-domain reports

- [domains.md](domains.md) — 8 domains, AR 0–2 per dimension, evidence, top fix each.
- [improvement-fields.md](improvement-fields.md) — five fields, leverage-ordered.
- Baselines: `docs/impeccable-audit.md`, `docs/design-system-audit.md`.

## 6. Recommended follow-up PRs (in leverage order)

1. **Bind the design gate** — add `npm run check:design` to the `ci` script (and
   thereby CI Gates). Acceptance: deliberately breaking a pinned token makes
   `npm run ci` exit non-zero locally. *(Design system → HARNESS-READY.)*
2. **Single-source the media manifest** — generate `verify-media`'s URL list from
   `MEDIA_REGISTRY` (no hardcoded duplicate); make the verifier hermetic-aware
   (report `BLOCKED-EGRESS` distinctly from `DEAD`, exit 1 only on DEAD in CI mode).
   Acceptance: rename a registry entry → verifier output changes with zero edits to
   the script; sandbox run reports BLOCKED-EGRESS, not FAIL.
3. **Retire the last remote media** — self-host or poster-replace the four `V_*`
   Pexels videos (HyperFrames render on a Chrome-equipped machine is the standing
   path). Acceptance: `grep -r "videos.pexels.com" src/` → 0; media:check passes
   with egress to Pexels blocked.
4. **Loop-cap sweep (AR5)** — one standardized block in the runbook + engine docs:
   "remediate → re-run gate → exit 0 required; max 3 cycles, then escalate with the
   evidence log." Acceptance: `docs/ops/runbook.md` carries the block and every
   `drill:*`/`test:*` script header cites it.
5. **Close the dual-CSS debt (A-6, deferred since the impeccable audit)** — fold
   `patch.css` rules into the token layer or formally scope it, so import order no
   longer decides winners. Acceptance: `patch.css` < 100 lines or deleted;
   `check:design` + visual smoke on /, /pricing, /dashboard unchanged.
6. **Docs gate (AR4 for knowledge)** — link/anchor check + ADR-index drift check in
   CI. Acceptance: a deliberately broken intra-docs link fails Gates.

Every item has an executable acceptance criterion — the "definition of done"
discipline both the source audit and this repo's prior waves established.
