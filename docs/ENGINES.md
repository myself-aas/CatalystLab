# Audit engine inventory

**What this answers:** exactly which engines exist, what each one is called in
the API vs the UI, what a scan costs, and what stands between a user-supplied URL
and the open internet. Every number below is verified against
`server/core/rateLimit.ts` and `src/lib/edge/pops.ts` as of 2026-10-21.

CatalystLab runs website-quality audit engines against user-supplied URLs. Every
scan passes through the SSRF guard (`src/lib/networkSecurity.ts`, `guardedFetch`)
before any outbound byte is sent: scheme allowlist, private/loopback/reserved
range blocking, a single DNS resolution pinned to the validated address
(anti-rebinding), per-hop revalidation of redirects (max 3), a 5 MB response cap,
TLS verification on, and a 10 s default timeout. The TLS certificate probe is
restricted to port **443** (owner answer #5, 2026-10-19).

## Canonical implementation

`src/lib/nodeEngines.ts` is the only engine implementation (D7). The duplicated
`lib/engines/` tree and the legacy Next.js/`api/` layers were deleted on
2026-10-19 (owner answer #9), so any doc, comment or map that still points at
`lib/engines/*.ts` is describing a path that no longer exists.

`server/core/enginesCatalog.ts` keeps `ENGINE_SCRIPT_MAP`, whose values name the
historical Python engine scripts (`python-engines/*.py`) that were **never
committed** to this repository. It is vestigial documentation of the original
naming only: no `.py` file is loaded at runtime, and the catalog header says so.

## Server engine catalog

Eight engines, each with a canonical id and one alias; both resolve to the same
implementation. `GET /api/v1/engines` returns exactly these ids. The UI presents
the same eight under product names (`src/data/diagnosticEngines.ts`); the
subtitle↔alias correspondence is 1:1.

| Engine id | Alias | UI product name | What it audits |
| --- | --- | --- | --- |
| `health` | `testing_vitals` | **VitalZyme** (Web Vitals) | Availability, TLS certificate validity on port 443, response status, core health checks |
| `latency` | `release_edge` | **EdgeVmax** (Latency Radar) | Response timing profile and edge-delivery characteristics |
| `ai_ready` | `operations_ai_ready` | **LLM-Kinase** (AI Readiness) | AI-discovery readiness (`llms.txt`, structured data, machine-readable metadata) |
| `repo` | `code_quality` | **GitLygase** (Repo Hygiene) | Repository hygiene surfaces exposed by the site (manifests, source links, metadata) |
| `eco` | `build_eco` | **EcoHolo** (Carbon Audit) | Build/asset carbon efficiency — asset weight rankings, transfer size, carbon estimates |
| `compliance` | `devsecops_compliance` | **RiskProtease** (OWASP SecOps) | Security headers, OWASP baseline signals, compliance/privacy markers |
| `migration` | `planning_arch` | **SynthShift** (Architecture PAR) | Platform/architecture migration readiness (server detection, legacy stack signals) |
| `llmo` | `evolution_llmo` | **AllosterSearch** (LLMO Search) | LLMOptimizer-style continuous-evolution scoring |

There is **no `ai_search` engine** (owner answer Q39). Older docs and the legacy
marketing pages listed a ninth engine for "AI-search surface readiness"; that id
was never in the server catalog, and the legacy pages that claimed it were
deleted with the rest of `public/*.html` (D14).

## Client-side telemetry engines

`src/data/diagnosticEngines.ts` defines the **8** client-presented diagnostic
engines in the table above (categories: Performance, Security, SEO,
Accessibility, DOM & Vitals, and others). They render engine cards, presets and
the interactive playground; every network-level check still executes server-side
through the catalog above. The client ids (`vitalzyme`, `llm-kinase`, …) are UI
identifiers — the API speaks the canonical ids/aliases.

## Execution surfaces

| Route | Purpose |
| --- | --- |
| `POST /api/check-url` | Reachability pre-flight through the SSRF guard (no engine run) |
| `POST /api/run-engine` | Run one engine (`engine` + `url`), rate-limited, SSRF-guarded |
| `POST /api/monitor/probe` | Uptime-style probe used by the monitoring UI |
| `GET /api/monitor/system-health` | Host and dependency status for the system page |
| `GET /api/health` | Liveness probe (used by the CI smoke test and the runbook) |
| `GET /api/v1/engines` · `GET /api/v1/engines/:engine` | Catalog and single-engine metadata |
| `POST /api/v1/engines/:engine/scan` | One engine under the versioned surface |
| `GET`/`POST /api/v1/audit/master/stream` (aliases: `GET`/`POST /api/scan/stream`) | SSE stream for the full 8-engine master audit: `session_init`, per-engine `engine_start` / `engine_complete`, then `audit_complete` |

The JSON master-audit endpoint that used to return a hard-coded
`compositeScore: 92` was **removed** in favour of this stream (owner answer #4).
The stream reports per-engine results only; no composite score is invented.

`/api/v1/reports*` and `/api/v1/blogs*` answer **`501 Not Implemented`** until a
real implementation exists (owner answer #3), so no synthetic payload is served
as if it were data.

## Cost model

A single engine scan costs **1 unit**; a master audit costs **10 units**
(`MASTER_AUDIT_COST = 10`, `SINGLE_ENGINE_COST = 1`, `server/core/rateLimit.ts:22-23`).

| Tier | Daily units | Burst per 60 s |
| --- | --- | --- |
| Visitor | 20 | 15 |
| Free (Community) | 50 | 45 |
| Starter | 150 | 45 |
| Pro | 500 | 45 |
| Team | 1500 | 45 |
| Enterprise | 5000 | 45 |
| API key (`api_pro`) | 500 (or the key's `dailyComputeLimit`) | 120 |
| Superadmin | unlimited | unlimited |

(Constants verified at `server/core/rateLimit.ts:15-27`: `VISITOR_DAILY_UNITS`,
`FREE_USER_DAILY_UNITS`, `STARTER_DAILY_UNITS`, `PRO_DAILY_UNITS`,
`TEAM_DAILY_UNITS`, `ENTERPRISE_DAILY_UNITS`, `PRO_API_DAILY_UNITS`,
`VISITOR_BURST_MAX = 15`, `USER_BURST_MAX = 45`, `BURST_WINDOW_MS = 60_000`.)

Daily units reset at UTC midnight. The ledger lives in Upstash Redis when it is
configured (`catalystlab:quota:<date>:<identifier>`) and falls back to
per-process memory otherwise, which resets on restart — production must
configure Upstash (owner answer #1).

## Two different "PoP" numbers — don't conflate them

- **42** = the product's measurement/edge-mesh registry
  (`TOTAL_POPS_COUNT`, `src/lib/edge/pops.ts:753`). It feeds the dashboard globe,
  the JSON-LD in `scripts/prerender.ts`, and telemetry edge claims.
- **330+** = Cloudflare's anycast delivery network, which serves the static
  frontend (`ops/runbook.md` §1). It is not a CatalystLab data structure.
