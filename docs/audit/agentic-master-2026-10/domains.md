# Per-domain agentic-readiness — CatalystLab, 2026-10-21

Rubric: AR v1 from `myself-aas/claude-skills/audit/engineering-agentic-2026-07/RUBRIC.md`
(0–2 per dimension; HARNESS-READY requires total ≥ 9 **and** AR4 ≥ 1 **and** AR5 ≥ 1).
Evidence is from the verification run and scripted scans recorded in 00-MASTER.md.

## 1. Design system & UI tokens — 8/12 · LOOP-CAPABLE

| AR | Score | Evidence |
|---|---|---|
| AR1 Intake | 1 | DESIGN.md pins the Meta system; no intake refusal — an agent can still hand-add raw hex (807 hex literals remain in TSX, mostly data-viz). |
| AR2 Decomposition | 1 | DESIGN.md + audit docs phase the work; no consuming plan tool. |
| AR3 Execution | 2 | `scripts/check-design-tokens.mjs` is deterministic, token-pinned (ink-button #000000, buy #0064E0). |
| AR4 Verification | 1 | Validator exists and passes — **but is in neither `npm run ci` nor any workflow** (grep-verified). Described, not required. |
| AR5 Loop discipline | 1 | Audit→remediate→re-audit cycles happened (9→15/20) with no written cap. |
| AR6 Close-out | 2 | DESIGN.md, ADR 0001 (superseded, retained), audit trail persist as artifacts. |

**Top improvement:** wire `check:design` into `npm run ci` (follow-up PR #1). → 10/12 HARNESS-READY.

## 2. Frontend app (pages, routes, components) — 9/12 · HARNESS-READY

| AR | Score | Evidence |
|---|---|---|
| AR1 | 1 | Routes/pages accept goals via issues/PRs; no machine intake. |
| AR2 | 1 | 48 lazy route splits, 142 routes, component taxonomy (atomic/content/marketing) is the decomposition. |
| AR3 | 2 | `typecheck` + `build` deterministic; prerender consumes build output. |
| AR4 | 2 | 330 vitest tests, Playwright zero-CSP e2e, strict Lighthouse (a11y ≥ 0.90 error-level) all gate CI. |
| AR5 | 1 | ChunkLoadError handling and error boundaries exist; no written retry/escalation cap. |
| AR6 | 1 | Prerendered artifacts ship; no per-change handoff artifact required. |

**Top improvement:** document a flake/retry policy for the Playwright + LHCI jobs (AR5 → 2).

## 3. Backend API & engines — 10/12 · HARNESS-READY

| AR | Score | Evidence |
|---|---|---|
| AR1 | 2 | Refuses bad input by construction: zod validation (`src/lib/validation.ts`, server routes), SSRF guard rejects internal/loopback hosts (`networkSecurity.ts`), `check-env` parity gate. |
| AR2 | 1 | Engine registry decomposes audits into named assays; no plan artifact. |
| AR3 | 2 | Deterministic engines + server tests (`src/tests/server/`), payments-sandbox and restore-drill executables. |
| AR4 | 2 | API tests, D16 p95 load SLO, idempotency/outage-retry sandbox all exit-code gated in CI. |
| AR5 | 1 | Rate limiter + middleware retries exist in code; caps not stated as policy. |
| AR6 | 1 | Zero-cost in-memory telemetry fallback is logged and documented, not silent. |

**Top improvement:** state retry caps/escalation for outbound engine fetches next to the rate-limiter config.

## 4. Testing & CI — 11/12 · HARNESS-READY

| AR | Score | Evidence |
|---|---|---|
| AR1 | 1 | Fixed gate set (`ci`, `ci:full`); no goal intake — acceptable for a gate domain. |
| AR2 | 2 | Explicit decomposition: Gates / Security / E2E / Lighthouse jobs; `ci` vs `ci:full` tiers. |
| AR3 | 2 | Every step an exact runnable command; zero orphan scripts (all 15 `scripts/*` referenced from package.json/workflows/docs — grep-verified). |
| AR4 | 2 | Coverage ratchet (68/55/72/69), bundle budget, `npm audit --audit-level=low`, strict LHCI reporter — all load-bearing exit codes. |
| AR5 | 1 | LHCI runs ×2 and E2E exists, but no flake-quarantine or escalation rule is written. |
| AR6 | 2 | Step summaries, PR Lighthouse comments, uploaded build artifacts = persistent evidence. |

**Top improvement:** add the AR5 flake policy (quarantine after 2 same-reason failures, escalate with logs).

## 5. Media pipeline — 5/12 · TOOL-ONLY

| AR | Score | Evidence |
|---|---|---|
| AR1 | 1 | Registry accepts entries with licence/sourceUrl; no completeness refusal. |
| AR2 | 1 | `MEDIA_REGISTRY` fallback chains (R3 contract) decompose sourcing. |
| AR3 | 1 | **Drift:** `scripts/verify-media.mjs` hardcodes a second manifest; its U-FACE ids verify old Unsplash URLs while the registry serves local avatars. |
| AR4 | 1 | Verifier + `media-verify.yml` exist, but non-hermetic — egress-blocked environments read as total failure (observed in this audit's sandbox run). |
| AR5 | 0 | No retry/stop/escalation semantics beyond an 8s abort. |
| AR6 | 1 | Licence provenance (`sourceUrl`) persists per entry. |

**Top improvement:** generate the verifier's list from the registry and self-host the 4 remaining `V_*` Pexels videos (follow-ups #2, #3). → LOOP-CAPABLE and beyond.

## 6. Docs & knowledge — 6/12 · LOOP-CAPABLE

| AR | Score | Evidence |
|---|---|---|
| AR1 | 1 | Templates exist (ADR, release checklist); nothing refuses an undocumented change. |
| AR2 | 2 | `docs/plan/decisions.md`, grilling-tree, production-readiness plan are real decomposition artifacts. |
| AR3 | 1 | Docs are prose; only env/deployment guide is partially executable. |
| AR4 | 0 | **No docs gate:** no link/anchor or index-drift check anywhere in CI. |
| AR5 | 0 | No review-cycle or staleness rule. |
| AR6 | 2 | Release checklist, ADRs (incl. supersession), audit trail in `docs/audit/` persist decisions. |

**Top improvement:** link + ADR-index drift check in Gates (follow-up #6).

## 7. Deployment & ops — 11/12 · HARNESS-READY

| AR | Score | Evidence |
|---|---|---|
| AR1 | 2 | `check-env` refuses drift (42 parity-verified keys); `verify-deployment.mjs` gates promotion. |
| AR2 | 2 | deploy / rollback / backup workflows + restore drill decompose the lifecycle. |
| AR3 | 2 | `drill:restore` executes a clean-instance backup/restore in CI — the loop runs itself. |
| AR4 | 2 | Production smoke + security-header contract, Docker non-root runtime verification. |
| AR5 | 1 | Rollback exists; trigger thresholds are human-judged, not stated. |
| AR6 | 2 | Runbook, SLO doc, drill artifacts persist (`docs/ops/`). |

**Top improvement:** write rollback trigger thresholds into the runbook (AR5 → 2 = 12/12).

## 8. Security — 10/12 · HARNESS-READY

| AR | Score | Evidence |
|---|---|---|
| AR1 | 2 | Refusal-oriented: SSRF guard, secrets scanner, CSP with zero-violation e2e. |
| AR2 | 1 | Plan-numbered controls (3.13/3.14/8.5) decompose the programme. |
| AR3 | 2 | gitleaks, semgrep, `scan-secrets.mjs` (590 files, 0 secrets this run), alert-rule syntax validation — all deterministic. |
| AR4 | 2 | 0-vulnerability gate across prod+dev; container audit; header contracts. |
| AR5 | 1 | Rate limiting in code; incident escalation path is prose (runbook). |
| AR6 | 1 | SEC-2026-01 legacy-secret catalogue persists with isolation evidence. |

**Top improvement:** bind alert-rule validation output to an incident-escalation checklist with caps.
