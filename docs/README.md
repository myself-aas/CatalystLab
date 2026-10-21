# Documentation index

**What this answers:** which document to open for which job, and whether what you
are reading is a *living* spec or a *dated record*.

Two classes of document live under `docs/`:

- 🟢 **Living documents** describe current truth. They are re-verified against the
  tree when edited and change in the same commit as the behavior they describe.
- 🟡 **Dated records** are point-in-time evidence — audit findings, drill results,
  decision trees, resolution ledgers. They are kept verbatim (never silently
  rewritten) and each carries a status banner naming what supersedes it.

## Start here

| If you need to… | Read |
| --- | --- |
| Understand how the system fits together | [`ARCHITECTURE.md`](ARCHITECTURE.md) 🟢 |
| Operate or debug the running service | [`ops/runbook.md`](ops/runbook.md) 🟢 |
| Deploy from a zero state (env, VM, tunnels, backups) | [`ops/environment-and-deployment-guide.md`](ops/environment-and-deployment-guide.md) 🟢 |
| Work on the audit engines or quota tiers | [`ENGINES.md`](ENGINES.md) 🟢 |
| Know *why* a decision was made | [`plan/decisions.md`](plan/decisions.md) 🟢 (D1–D17, Q17–Q52) |
| Cut a release | [`release/checklist.md`](release/checklist.md) 🟡 (ledger; §2 owner steps are live) + [`plan/rollout-pipeline-restore-2026-10-21.md`](plan/rollout-pipeline-restore-2026-10-21.md) 🟢 |
| Onboard to the codebase itself | [`codebase/`](codebase/) 🟢 — 7 evidence-cited knowledge docs |

## Living documents 🟢

| Path | Covers |
| --- | --- |
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | Runtime architecture: one Express process, request lifecycle, trust boundaries, telemetry pipeline, edge mesh, observability, deployment |
| [`ENGINES.md`](ENGINES.md) | The 8 canonical audit engines — ids, aliases, UI product names, SSRF guard, execution surfaces, unit costs and tier budgets (verified against `server/core/rateLimit.ts`) |
| [`ops/runbook.md`](ops/runbook.md) | Topology, locked SLO table, pre-release/post-deploy commands, incident response & rollback, known failure modes |
| [`ops/slo.md`](ops/slo.md) | D16 SLOs, measured load baseline, the bottlenecks found fixing it, and how to reproduce the benchmark |
| [`ops/architecture-redundancy.md`](ops/architecture-redundancy.md) | Failure-posture matrix per layer, accepted single-host trade-offs (Q32), secret-custody planes, honest non-redundant gaps |
| [`ops/environment-and-deployment-guide.md`](ops/environment-and-deployment-guide.md) | The 42-key `.env` schema, four secret-custody planes (A–D), Oracle Always Free VM + Docker/systemd deployment, Cloudflare tunnel, backups/restore |
| `ops/alerts.yml` | Alert rules enforcing the SLOs; validated on every PR via `promtool check rules` |
| [`plan/decisions.md`](plan/decisions.md) | Owner decision log: D1–D17 plus grilling rounds Q17–Q52 — the citation target for every "D#"/"Q#" reference in these docs |
| [`plan/rollout-pipeline-restore-2026-10-21.md`](plan/rollout-pipeline-restore-2026-10-21.md) | Active rollout plan: gate evidence, deploy waves, rollback triggers, comms (produced with the `devops-rollout-plan` skill) |
| [`adr/0001-clean-saas-palette.md`](adr/0001-clean-saas-palette.md) | Superseded palette ADR, retained for history |
| [`adr/0002-meta-design-system.md`](adr/0002-meta-design-system.md) | Normative design-token source (Meta-derived `DESIGN.md`) and its open tensions |
| [`codebase/`](codebase/) | `ARCHITECTURE` · `STRUCTURE` · `STACK` · `CONVENTIONS` · `INTEGRATIONS` · `TESTING` · `CONCERNS` — regenerated 2026-10-21 (commit `0d3f465`) with `file:line` evidence |

## Dated records 🟡

| Path | Date | Superseded by / current truth |
| --- | --- | --- |
| [`audit/agentic-master-2026-10/`](audit/agentic-master-2026-10/) (3 files) | 2026-10-21 | Remediated same day → [`codebase/`](codebase/) |
| [`audit/cs-frontend-engineer-2026-10.md`](audit/cs-frontend-engineer-2026-10.md) | 2026-10 | `codebase/CONVENTIONS.md`, `codebase/CONCERNS.md` |
| [`audit/header-footer-nav-2026-10.md`](audit/header-footer-nav-2026-10.md) | 2026-10 | Shipped UI (`src/components/layout/`) |
| [`audit/perf-rendering-2026-10/`](audit/perf-rendering-2026-10/) (6 files + tools) | 2026-10 | Remediation landed (its `05-remediation.md`) → baselines in [`ops/slo.md`](ops/slo.md) |
| [`audit/seo-aeo-2026-10/00-SEO-AEO-AUDIT.md`](audit/seo-aeo-2026-10/00-SEO-AEO-AUDIT.md) | 2026-10-19 | Produced D11–D15 → shipped in `scripts/prerender.ts`; claims in [`ENGINES.md`](ENGINES.md) |
| [`design-system-audit.md`](design-system-audit.md) · [`impeccable-audit.md`](impeccable-audit.md) | 2026-10 | Meta design-system adoption → [`DESIGN.md`](../DESIGN.md), [`adr/0002`](adr/0002-meta-design-system.md) |
| [`hero-shape-brief.md`](hero-shape-brief.md) | 2026-10 | `src/components/home/HeroSection.tsx` as shipped |
| [`ops/drills/restore-drill-2026-10-21.md`](ops/drills/restore-drill-2026-10-21.md) | 2026-10-21 | Re-runnable any time: `npm run drill:restore` |
| [`plan/production-readiness-plan.md`](plan/production-readiness-plan.md) | 2026-10-19 | Executed → `plan/decisions.md` (Q43–Q52), rollout plan, `codebase/CONCERNS.md` §8 |
| [`plan/grilling-tree.md`](plan/grilling-tree.md) | 2026-10 | All rounds resolved → `plan/decisions.md` |
| [`release/checklist.md`](release/checklist.md) | 2026-10-21 | Ledger is historical; its §2 owner cutover steps remain the live procedure |
| [`security/review-2026-10.md`](security/review-2026-10.md) | 2026-10 | SEC-2026-02 resolved (Q50); SEC-2026-01 is owner action (Q44); deps have since moved |

## Conventions used everywhere in `docs/`

- **Claims cite the tree.** `file:line` where it helps; every number in a living
  doc must be reproducible from a command or a file.
- **Decision references** (`D3`, `Q32`, `SEC-2026-01`, owner answer #9) resolve
  against [`plan/decisions.md`](plan/decisions.md) and
  [`security/review-2026-10.md`](security/review-2026-10.md).
- **Dated records get banners, not edits.** When history becomes wrong, the banner
  names the successor; the body stays as written.
