# Audit engine inventory

CatalystLab runs website-quality audit engines against user-supplied URLs. Every scan passes through the SSRF guard (`src/lib/networkSecurity.ts`) before any outbound byte is sent: scheme allowlist, private/loopback range blocking, DNS resolve → validate → socket pinning (anti-rebinding), response-size caps, TLS verification on, redirects never auto-followed.

## Decision record: `python-engines/`

The original server referenced Python engine scripts (`python-engines/*.py`) that **were never committed to this repository**. During the Phase 2 decomposition the TypeScript implementations in [`lib/engines/`](../lib/engines) were confirmed as the canonical, always-taken code path (the Python dispatch was dead fallback code). The references in `server/core/enginesCatalog.ts` (`ENGINE_SCRIPT_MAP`) are kept as vestigial documentation of the historical naming only; no `.py` file is loaded at runtime. Do not reintroduce a Python engine path without also adding the scripts and a shebang-capable runtime to the deploy image.

## Server engine catalog (`server/core/enginesCatalog.ts`)

Each engine has a canonical id and up to one alias (both resolve to the same implementation).

| Engine id | Alias | Implementation | What it audits |
| --- | --- | --- | --- |
| `health` | `testing_vitals` | `lib/engines/health.ts` | Availability, TLS certificate validity, response status, core health checks |
| `migration` | `planning_arch` | `lib/engines/migration.ts` | Platform/architecture migration readiness (server detection, legacy stack signals) |
| `repo` | `code_quality` | `lib/engines/repo-hygiene.ts` | Repository hygiene surfaces exposed by the site (manifests, source links, metadata) |
| `eco` | `build_eco` | `lib/engines/eco-carbon.ts` | Build/asset carbon efficiency — asset weight rankings, transfer size, carbon estimates |
| `compliance` | `devsecops_compliance` | `lib/engines/compliance.ts` | Security headers, OWASP baseline signals, compliance/privacy markers |
| `ai_ready` | `operations_ai_ready` | `lib/engines/ai-readiness.ts` | AI-discovery readiness (`llms.txt`, structured data, machine-readable metadata) |
| `latency` | `release_edge` | `lib/engines/edge-latency.ts` | Response timing profile and edge-delivery characteristics |
| `ai_search` | — | `lib/engines/ai-search.ts` | AI-search surface readiness (robots directives, crawlable content signals) |
| `llmo` | `evolution_llmo` | *(catalog id; dispatched through the shared pipeline)* | LLMOptimizer-style continuous-evolution scoring |

## Client-side telemetry engines (`src/data/diagnosticEngines.ts`)

Nine client-presented diagnostic engine definitions power the playground and dashboard UI (categories: Performance, Security, SEO, Accessibility, DOM & Vitals, …). They render engine cards, presets, and the interactive playground; network-level checks always execute server-side through the catalog above.

## Execution surfaces

| Route | Purpose |
| --- | --- |
| `POST /api/run-engine` | Run one engine (`engine` + `url`), rate-limited, SSRF-guarded |
| `POST /api/v1/engines/:engine/scan` | Same pipeline under the versioned surface |
| `POST /api/check-url` | Reachability pre-flight through the SSRF guard (no engine run) |
| `POST /api/monitor/probe` | Uptime-style probe used by the monitoring UI |
| `GET /api/master-audit/stream` | SSE stream for the full 8-engine master audit |

Rate costs: a single engine scan costs **1 unit**, a master audit **10 units** (see `server/core/rateLimit.ts` for per-tier daily budgets).
