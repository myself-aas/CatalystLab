# Per-unit verdicts — CatalystLab newgen re-run, 2026-10-21

> **Status (2026-10-21): dated record — kept verbatim as evidence, not rewritten.** Point-in-time per-unit verdicts from the newgen re-run; remediation landed the same day. Current state: [`docs/codebase/`](../../codebase/).

Rubric: New-Generation Optimization v1 (A1–A7 + D script contract).
Every non-KEEP unit carries a "Verify (definition of done)" block of executable
checks — the acceptance criteria for the follow-up PRs in 00-MASTER.md §6.

## 1. Design system (DESIGN.md + token layer) — REWRITE

A1: frontmatter is precise; the body instructs a different system than the code
ships (P0-1). A2: body restates superseded rationale at length — context spent
teaching the wrong palette is worse than dead weight. A3: token tooling wired
(`check-design-tokens.mjs`) but not bound (P1-1). A4: validator exists. A5: Meta
system knowledge is real and current in the frontmatter. A6: **fail** — Clean
SaaS palette + Space Grotesk presented as current. A7: assay-hue section still
accurate (`--hue-*` normative).

**Verify (definition of done):**
- `grep -n "2563EB\|1E40AF\|Space Grotesk" DESIGN.md` → only inside explicitly-labelled history/supersession notes.
- Gate G1 (docs↔code token diff) exits 0.
- `npm run check:design` passes and is executed by `npm run ci` (G4).

## 2. Frontend app — KEEP

54 pages, 142 routes, 48 lazy splits; 330 tests + Playwright zero-CSP + strict
Lighthouse all executed green this run. **Verification contract:** `npm run ci`
exit 0; LHCI a11y ≥ 0.90 on /, /pricing, /blogs, /docs/llmo, /dashboard.

## 3. Backend API & engines — KEEP

Zod intake, SSRF refusal, rate limiting, deterministic assays; server tests,
payments sandbox, restore drill, p95 load SLO executed in CI.
**Verification contract:** `npm run test` + `test:payments-sandbox` + `drill:restore` exit 0.

## 4. Testing & CI — OPTIMIZE

Sound core (see 00-MASTER §4) with three targeted wiring edits: bind
`check:design` (G4), `--help` contracts (G2), land G1/G3/G6.

**Verify (definition of done):**
- `npm run ci` fails when a pinned design token is deliberately altered.
- `for s in scripts/*.mjs; do node $s --help; done` → all exit 0, no network calls.
- Counter-derivation script diff vs docs claims → empty.

## 5. Media pipeline — OPTIMIZE

Registry design is KEEP-grade (fallback chains, licence provenance, local
avatars/scenes); the verifier drifted (P1-2) and 4 `V_*` videos remain remote.

**Verify (definition of done):**
- `grep -rn "videos.pexels.com\|images.pexels.com\|images.unsplash.com" src/ scripts/` → 0 outside licence `sourceUrl` provenance strings.
- Verifier list is generated from `MEDIA_REGISTRY` (rename test: change a registry entry, verifier output follows with no script edit).
- `npm run media:check` reports BLOCKED-EGRESS (not FAIL) with Pexels/Unsplash egress blocked, and passes in CI.

## 6. Docs & knowledge — OPTIMIZE

42 docs, zero phantom paths, counters exact (both verified mechanically this
run) — but no gate protects either property, and audit docs accumulate stale
line references over time.

**Verify (definition of done):**
- G6 path linter + G3 counter derivation run in Gates and fail on a deliberately broken link/claim.
- `docs/audit/*` each carry date + branch + supersession status on their first screen.

## 7. Deployment & ops — KEEP

Env-parity refusal, restore drill executing in CI, deploy/rollback/backup
workflows, runbook + SLO. **Verification contract:** `verify-deployment` exit 0
post-deploy; drill artifacts present per release checklist.

## 8. Security — KEEP

Secrets clean (593 files), gitleaks/semgrep/0-vuln/CSP-zero-violation gates,
SSRF guard proven in tests. **Verification contract:** `npm run sec:secrets` +
CI Security job exit 0.

## 9. Scripts class (D rubric) — OPTIMIZE

8/10 `--help`-clean, deterministic, zero orphans. `verify-deployment.mjs` /
`verify-media.mjs` violate D1 (run full network checks on `--help`).
**Verify:** the G2 loop above, plus each script's own header documents its
exit-code contract (13/15 already do).
