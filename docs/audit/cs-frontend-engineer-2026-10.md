# Frontend audit — against `cs-frontend-engineer` (claude-skills/agents/engineering)

**Audited:** 2026-10-21 · **Branch:** `arena/d85a5b1f-catalystlab` · **Standard:**
`myself-aas/claude-skills/agents/engineering/cs-frontend-engineer.md` + its
forcing-question library (`engineering-team/skills/senior-frontend/references/
forcing_questions.md`). **Method:** the agent walks 7 forcing questions before any
framework/rendering choice and refuses to ship until choices are verifiable. This
audit answered each question *from repository evidence only* (PRODUCT.md, DESIGN.md,
`.lighthouserc.json`, `scripts/{prerender,check-bundle-budget}*`, CI, prior audits) —
where no artifact answers, the question is scored unanswered, exactly as the agent
would surface it. Specialist forks mapped to this repo's equivalents (a11y-audit →
Lighthouse strict gate; performance-profiler → `docs/audit/perf-rendering-2026-10/`).

## Scorecard — the seven forcing questions

| Q | Question | Verdict | Kill criterion |
|---|---|---|---|
| Q1 | Primary device + network | ❌ **Unanswered** | Tripped ("all users equally" by omission) |
| Q2 | LCP target in ms (+INP/CLS) | ❌ **Unanswered** | Tripped ("as fast as possible" by proxy) |
| Q3 | Rendering model, defended | ✅ Answered | — |
| Q4 | Per-route bundle budget in KB | ⚠️ Partial | Partially tripped |
| Q5 | SEO-dependent vs auth-walled | ✅ Answered (best in repo) | — |
| Q6 | Design-system source of truth | ⚠️ Partial | — |
| Q7 | WCAG target + named owner | ⚠️ Partial | Tripped (no named owner) |

### Q1 — Primary device + network ❌
No artifact names a primary device segment. `PRODUCT.md` names audiences, not a
device/network floor; `.lighthouserc.json` collects **desktop preset only**, so the
mobile floor is never measured in CI. The one mobile measurement on record
(perf-rendering audit: mobile perf 55–56, LCP ~11s, sandbox-inflated, explicitly
non-verdict) has no follow-up. **Every downstream budget (Q4) is therefore set
without the floor the canon requires.**

### Q2 — LCP target in ms ❌
No client-side CWV number exists anywhere. LHCI asserts only
`categories:performance: warn ≥ 0.5` — literally the agent's banned target
("fast"). No LCP/INP/CLS assertions, no p75, no `web-vitals` RUM in `src/`.
Contrast: the *server* side has exact ms SLOs (D16: HTML p95 ≤ 100ms, API p95
≤ 150ms, verified) — the discipline exists in this repo, it just stops at the
origin. Perf-audit item B3 (add LCP/TBT/CLS asserts + mobile run) is still open.

### Q3 — Rendering model ✅
**Vite SPA + build-time prerender of public routes**, chosen by written owner
decision D11 (2026-10-19) in `scripts/prerender.ts`: public routes get rewritten
heads + JSON-LD generated from the same tables the UI renders (D15, no drift);
app routes stay client-only. Closest profile: `vite-spa`. Caveat the agent would
flag: prerender rewrites the *head*; body content still renders client-side, so
Q3's SEO defence rests on meta/structured data + crawlability of the shell —
acceptable for this surface, but it should be a stated trade-off, not an accident.

### Q4 — Bundle budget ⚠️
A real, exit-code budget exists and **is in CI** (`check:bundle` runs inside
`npm run ci`): initial ≤ 2100KB raw / 540KB gzip, total ≤ 900KB gzip, largest
chunk ≤ 280KB gzip, as an honest ratchet ("never loosen — split the chunk").
Two gaps vs canon: budgets are **app-level, not per-route**, and 540KB gzip
initial is ~2.7× the library's 200KB mobile hard cap — indefensible until Q1
names the device floor that would justify it.

### Q5 — SEO vs auth ✅
The model answer. Written split (D11): public marketing/docs surface is
SEO-dependent (prerendered heads, canonical URLs, robots directives per route
class in `src/config/site.ts`); the dashboard/app surface is auth-walled,
client-only, `noindex`. No kill criterion; copy this pattern.

### Q6 — Design system ⚠️
Source of truth exists: Meta system in `DESIGN.md` frontmatter + tokens in
`src/index.css` + Tailwind/shadcn (`components.json`), with an executable
validator. Two deficits: **no named owner**, and (per the newgen re-run, P0-1)
DESIGN.md's body still documents the superseded palette — the source of truth
currently contradicts itself below the fold.

### Q7 — WCAG ✅ target / ❌ owner
Target is explicit: **WCAG AA** (`PRODUCT.md:39`), enforced by the strict LHCI
a11y gate (error < 0.90) that already caught and fixed the /blogs failure, plus
keyboard-parity and contrast remediation history. But the agent's kill criterion
is unambiguous — *customer-facing + no named a11y owner → STOP* — and no owner
is named in any artifact. The gate is automated; accountability is not.

## Anti-pattern checklist (from the agent definition)

| Anti-pattern | Status |
|---|---|
| Framework as universal default | ✅ Avoided — Vite SPA defended via D11 |
| "Fast" as a target | ❌ **Present** — LHCI perf is a warn-only category score |
| Skipping a11y audit on customer-facing surface | ✅ Avoided — strict a11y gate in CI |
| Reimplementing perf profiling instead of forking | ✅ Avoided — dedicated perf audit + LHCI |
| Auto-approving bundle increases past budget | ✅ Avoided — ratchet policy forbids loosening |

## Karpathy gate note
The agent's pre-commit gate (`complexity_checker.py`, `diff_surgeon.py`) lives in
the claude-skills repo, not this one, and cannot run here; the local equivalents
(lint, typecheck, 330 tests, bundle/design validators inside `npm run ci`) were
all executed green for the companion audits of this date.

## Required digest (agent's ≤200-word contract)

**Profile:** vite-spa (+ build-time prerender). **CWV targets:** none set — set
LCP ≤ 2.5s / INP ≤ 200ms / CLS ≤ 0.1 at p75 on the Q1 device before next feature.
**Bundle budget:** app-level 540KB gzip initial (ratchet, in CI); needs per-route
budgets once Q1 lands. **A11y owner:** unnamed — assign one; target WCAG AA is set
and CI-enforced. **Next sub-skill:** performance-profiler (mobile baseline), then
a11y-audit ownership.

## Follow-ups (leverage order, each with its Verify)

1. **Answer Q1+Q2 in PRODUCT.md** (device segment + CWV numbers). Verify: a
   mobile LHCI job exists and asserts LCP ≤ 2500ms, CLS ≤ 0.1 on /, /pricing, /blogs.
2. **Per-route bundle budgets** in `check-bundle-budget.mjs`. Verify: a 10%
   route-chunk increase fails CI (perf-audit B2/B3 closure).
3. **Name the a11y + design-system owners** in PRODUCT.md/DESIGN.md. Verify:
   `grep -i "owner" PRODUCT.md DESIGN.md` returns a named person/role for both.
4. **DESIGN.md body rewrite** (already PR-1 of the newgen re-run) — closes Q6.
