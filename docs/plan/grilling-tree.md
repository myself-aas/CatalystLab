# Grilling: design tree for the production-readiness plan

> **Status (2026-10-21): dated record — kept verbatim as evidence, not rewritten.** Decision-tree record of the grilling rounds — all rounds resolved. Outcomes: [`decisions.md`](decisions.md) (D1–D17, Q17–Q52).

Method: the `grilling` skill (`mattpocock/skills`, installed to `~/.agents/skills/grilling`), run by `grill-me`. Questions are asked in rounds. Each round holds the frontier: decisions whose prerequisites are settled. Facts are looked up in the repo or on primary sources. Decisions belong to the owner. A round is not acted on until the owner answers it.

Status 2026-10-19: Rounds 1–3 answered with every recommendation accepted (Q1–Q16, Q18–Q29). D3 revised to option b by the owner (supersedes Round 1 Q2 option A). Open: Q17 (registered address), Q30 (hosting provider and region), Q31 (`/api` proxy mechanism), Q18b (notebook destination), and Round 4 (governing law, courts, effective date, dispute steps; depends on Q17). `docs/plan/decisions.md` records the answers.

## Facts resolved without asking

| Topic | Fact | Source |
|---|---|---|
| Gateways (D2) | Both 2Checkout and Dodo are implemented. The server picks 2Checkout unless `gateway` is `dodopay`. Each has a webhook route and a sandbox flag. | `server/routes/payments.ts:20, 85, 103`; `.env.example` |
| Activation (D1) | `POST /api/v1/users/me/subscription/request` still returns 501 | `server/routes/account.ts:169` (CONCERNS) |
| Deploy files (D3) | None exist: no Dockerfile, `vercel.json`, `netlify.toml`, `wrangler.*`, `_headers`, `_redirects` | repo root |
| `api/` twins (D8) | Not imported by `server/`, `src/`, or `lib/`. The Express server already serves `/api/run-engine` | `server/routes/engines.ts:68`; grep |
| Analytics (D4) | Anonymous `GET /api/analytics/stats` and `/realtime`; any `domain` accepted | CONCERNS (Medium) |
| Node (D5) | `.nvmrc` 24; `engines` `>=24`; one workflow pins Node 20 | `.nvmrc`; `package.json:7`; `.github/workflows/` |
| Lockfile (D6) | Both `bun.lock` and `package-lock.json` are tracked. CI uses `npm install`. | `git ls-files` |
| Engine path (D7) | Top-level `lib/engines/` is imported only by Next leftovers (`app/api/scan/stream/route.ts`, `archive/legacy-next/`) and by the re-export `src/lib/engines/index.ts`. The live server uses `src/lib/nodeEngines.ts` via `server/routes/engines.ts`. | grep |
| Retention (D9) | Tiers in `pricingData.ts`: Community 14, Starter 60, Professional 90, Team/Agency 365, Enterprise 730 days. No purge or TTL code exists. | `src/data/pricingData.ts:23, 64, 104, 144, 184`; grep |
| Error tracker (D10) | No Sentry or OpenTelemetry dependency. Logs use pino. | `package.json` |
| Prerendering (D11) | No prerender or SSR tooling in `package.json` | `package.json` |
| Canonical host (D14a) | Every canonical and OG URL uses `https://www.catalystlab.tech`. No redirect configuration exists. | `index.html`; `SEOHead.tsx` |
| Legacy pages (D14b) | 18 `public/*.html` files return 200 with no canonical and no noindex | curl, 2026-10-19 |
| Entity (D15) | "CatalystLab Inc." appears in the footer and `index.html` JSON-LD. `legalMeta.ts:20` holds an `[ASK USER]` placeholder. No repo document establishes the registered entity. | grep |
| AI crawlers (D12) | `robots.txt` names no AI crawler. Google's common-crawlers page (last updated 2026-10-15) says Google-Extended "does not impact a site's inclusion in Google Search nor is it used as a ranking signal", and Googlebot preferences govern "all Google Search features". | `public/robots.txt`; developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers |
| Legal markers | 60 `[ASK USER]` markers in `src/legal/`, in about 12 topics (entity and address, hosting, refund windows, age, notice periods, governing law, liability, trial billing, cancellation) | grep |

## Round 1 (asked)

Q1 gateway (D2). Recommended: 2Checkout is the single live gateway. Dodo stays in code but is disabled until needed.
Q2 deployment target (D3). Round 1 recommended option A (one Node host). REVISED 2026-10-19 by the owner to option b (split): static frontend on Cloudflare Pages, API on a Node host, same-origin `/api` proxy. The split depends on Q31.
Q3 public analytics (D4). Recommended: keep global aggregates public. Per-domain numbers require identity and domain ownership.
Q4 Node, lockfile, engine path (D5, D6, D7). Recommended: Node 24; keep npm and delete `bun.lock`; `nodeEngines.ts` is canonical and top-level `lib/engines/` is removed with the Next leftovers.
Q5 retention (D9). Recommended: publish the five tier values and implement the purge job at those values.
Q6 error tracker (D10). Recommended: Sentry, with PII scrubbing, listed as a subprocessor in the privacy copy.
Q7 AI-crawler policy (D12). Recommended: allow Googlebot, OAI-SearchBot, PerplexityBot, and Claude-SearchBot; allow user-triggered fetchers; disallow training-only crawlers (GPTBot, ClaudeBot, CCBot, Google-Extended).
Q8 entity identity (D15). Recommended: "CatalystLab Inc." is the registered name; the registered address and jurisdiction follow in Round 2.
Q9 canonical host (D14a). Recommended: `www` is canonical; the apex redirects with 301 to `www`.
Q10 legacy pages (D14b). Recommended: review `admin.html` and `dashboard.html` for embedded data first, then 301 each page to its SPA route and delete the file.
Q11 root clutter (Phase 9). Recommended: move the root codemods to `archive/codemods/`; delete the empty `ui-ux-pro-max-skill/`; keep `workspace/` and the notebook until classified.
Q12 CI and governance (4b.4). Recommended: agents add `ci.yml` as a pull request, reviewed by @me-aas. No governance file is edited.

## Round 2 (asked 2026-10-19, Q13–Q18)

Q13 activation model (D1). Recommended: webhook writes the subscription; the client never activates a paid plan.
Q14 `api/` twins (D8). Recommended: delete `api/`. Express serves the same routes; the API host serves them under option b.
Q15 prerendering (D11). Recommended: prerender public routes at build time; app routes stay client-only with noindex.
Q16 SLO and recovery (D16). Recommended: availability 99.5% over 30 days; RPO 24 h; RTO 4 h; latency target set after the 10.3 load test. A single host cannot honestly support 99.9%.
Q17 registered address and jurisdiction (D15 follow-up). Open question; the owner supplies the facts.
Q18 HazardNet notebook and `workspace/` (Phase 9). Recommended: move the notebook out of the repo, since it is not part of CatalystLab. Move `workspace/refactor_colors.sh` to `archive/`. Facts: the notebook is a two-cell Colab pipeline for Earth Engine and TensorFlow; nothing in the app imports it; it is tracked in git. `workspace/` holds one tracked script.

Settled from Round 1 (not re-asked): D2, D3, D4, D5, D6, D7, D9, D10, D12, D14, D15 (name).

Implementation, not a decision: the apex 301 (D14a) is implemented in Express with a Host-header check.

Round 2 notes (not yet asked)

- D1 activation model (needs Q1).
- D8 `api/` twins (needs Q2).
- D11 prerendering and D13 agent content (need Q2 and D3's static target).
- D14b apex redirect implementation (needs Q2).
- D16 SLO and recovery targets (needs Q2 and the hosting answer).
- Phase 9 notebook and `workspace/` classification (needs Q11's follow-up).

## Round 3 (questionnaire, waits for Q1 and Q8)

The 60 legal markers, grouped by topic. These are facts only the owner has. Examples from the markers: registered address, hosting provider and region, refund windows (the markers suggest 7 days for monthly and 14 for annual, to confirm), minimum age, notice periods, governing law, liability cap, billing currency, merchant of record per provider, and the legal mailbox.

## Session end

The session ends when the frontier is empty, every branch has been visited, and the owner confirms shared understanding. Only then are `decisions.md`, the plan, and the legal `[ASK USER]` markers updated.

## Round 3 (asked 2026-10-19, Q19–Q30)

Facts gathered for this round (not asked):
- No third-party analytics or ad tags in `index.html` or `src/`; the only mention is a documentation page.
- Browser storage: `localStorage` in 9 source files; no `document.cookie` use.
- Outgoing email: Mailgun (`src/lib/emailService.ts`), used by notification and telemetry routes.
- Logger redaction (`server/core/logger.ts`, REDACT_PATHS): authorization, cookie, API key, user-id and user-email headers, passwords, tokens. The privacy copy's "authorization headers redacted" matches this list. The audit cited full-header logging at `logger.ts:80–100`; that conflict must be re-verified under plan item 3.12 before publication.
- Trial: the code tracks `isTrialActive` (`server/core/rateLimit.ts`); no payment-method requirement exists.
- Only the downgrade to Community exists; no self-service cancellation route.
- Subprocessors evident from code and copy: Firebase (Auth, Firestore), Mailgun, Upstash (if configured), MongoDB (analytics), 2Checkout (gateway), Sentry (Q6), and the host (not yet named).

Q19 agent-readable content (D13). Recommended: keep `llms.txt` and `llms-full.txt`, generated from the same sources; defer Markdown alternates.
Q20 eligibility and incidents. (a) Minimum age 18; no accounts for under-18s. (b) Breach notice to the supervisory authority within 72 hours; to users without undue delay.
Q21 refunds. (a) Monthly plans: refund window 7 days from the first paid charge. Annual plans: 14 days. (b) Acknowledge within 2 business days, decide within 5, process within 10 business days after approval. (c) Payment-provider fees are not refunded; the copy says so. (d) Refunds are processed manually until automated.
Q22 trial, billing, cancellation, go-live. (a) The 7-day trial needs no payment method and charges nothing. (b) Billing starts only after the user chooses a paid plan. (c) Cancellation is self-service: paid features run to the end of the period, then the account moves to Community. (d) Paid checkout opens only after plan items 2.1–2.4 pass.
Q23 pricing and billing. (a) Annual prices in `pricingData.ts` are the published values, and checkout reads them (2.1). (b) USD; tax as charged by the merchant of record. (c) 2Checkout is the merchant of record (the only live gateway, Q1). (d) Renewal notice as the merchant of record's terms require.
Q24 liability and commitments (counsel to review). (a) Liability cap: fees paid in the 12 months before the claim. (b) Indemnity limited to users' misuse and breach of the terms. (c) No availability commitment; the D16 SLO is internal. (d) Dispute resolution: deferred to Round 4 (depends on Q17).
Q25 changes to the terms. (a) 30 days' notice by email and in the app for material changes. (b) "Material" means a change to price, to what data is collected or shared, or to a user's rights.
Q26 retention promises. (a) Reports and results kept for the plan's tier (D9). (b) Contact messages kept 365 days. (c) Account deletion within 30 days; backups purged on their normal rotation, which is disclosed. (d) API keys do not persist across restarts until plan item 4.1 ships; the copy says so. (e) Server logs kept 30 days, with credential headers redacted. (f) Metadata fields are those the code writes: timestamp, route, status, duration, plan tier; never credentials.
Q27 trackers, storage, subprocessors. (a) No third-party analytics or advertising identifiers at launch; the analytics clause is removed until analytics is enabled. (b) The cookie policy lists `localStorage` and Firebase Auth storage. (c) The subprocessor list is the seven named above; each has a data processing agreement before launch.
Q28 rights and legal basis (counsel to confirm). (a) Rights: access, correction, deletion, portability, objection, restriction; respond within one month. (b) Legal basis: contract for accounts and paid service; legitimate interest for security and abuse prevention; consent for optional storage.
Q29 contacts. (a) One monitored legal mailbox. (b) A data protection officer only if the law requires one (counsel).
Q30 hosting provider and region (fact; privacy copy rows at `privacy.ts:246` and `:269`). Open: the owner names the provider and region.

Deferred to Round 4 (depends on Q17): governing law and courts, effective date, dispute resolution steps, and the legal entity's jurisdiction.
Action, not a question: remove the internal reviewer note at `terms.ts:161` before publication.

## Round 3 result and new questions (2026-10-19)

- Q19–Q29: every recommendation accepted.
- D3: owner chose option b (split). Revised from Round 1 Q2 option A.
- Finding: Cloudflare Pages `_redirects` proxying "will only support relative URLs on your site. You cannot proxy external domains" (developers.cloudflare.com/pages/configuration/redirects/, checked 2026-10-19). The split therefore cannot use a `_redirects` rule to reach a separate API host.
- Q30 (open fact): which provider and region host the API, and which host serves the frontend.
- Q31 (new decision): how `/api` reaches the API host. Recommended: a Cloudflare Worker route on the apex zone that forwards `/api/*` to the API origin, so the browser sees one origin. Alternatives: (b) the API on its own subdomain with CORS and cross-site cookie changes; (c) return to option A.
- Q18b (new fact): where the HazardNet notebook goes once it leaves this repository.

## Round 3 follow-up (2026-10-19)

- Q18b answered: HazardNet removed. Notebook deleted; HazardNet seed entry removed from `INITIAL_MONITORED_SITES`. Gates after the change: tsc 127 (baseline), vitest 206 pass, 5 skip, rateLimiter fail (pre-existing); lint 0; build 0; check:bundle 0. `node_modules` was reinstalled with `npm ci` (Node 22 in this sandbox).
- Q31 answered (a): Cloudflare Worker route for `/api/*`.
- Q30 partly answered: no funding. Frontend on Cloudflare Pages. API host open (Q32). Student-pack hosts are restricted to non-commercial use, which conflicts with a paid product.
- Q17 partly answered: website https://www.catalystlab.tech; no physical location. Jurisdiction open (Q33). Caveat for counsel: some regimes expect a geographic address from online service providers (for example, the EU e-commerce directive, Article 5). Confirm before publishing.
- Open: Q32 (API host), Q33 (jurisdiction and governing law), Round 4 (effective date, dispute steps), Q30 region (follows Q32).

## Round 3 closing (2026-10-19)

- Q32 answered: Oracle Always Free, 2 OCPU / 12 GB; Render Free as fallback.
- Q33 answered: Bangladesh law; courts in Mymensingh, Bangladesh. The owner's reference to "Bangladesh Agricultural University Campus" is not a court venue. The copy uses "the courts in Mymensingh, Bangladesh" unless the owner says otherwise.
- New round-4 items, recommended answers: Q34 effective date (publication date); Q35 dispute steps (30 days of good-faith negotiation by email, then the courts in Mymensingh; no arbitration); Q36 Oracle home region (fixed at signup).
- Still open: Q17 counsel check on a geographic address (not a question for the owner, a review item).

## Round 4 answers and Round 5 (2026-10-19)

- Q34 effective date: the day of publication. Q35 dispute steps: 30 days of good-faith negotiation by email, then the courts in Mymensingh, Bangladesh; no arbitration (counsel to confirm). Q36 Oracle region: picked at signup, nearest to users, with Always Free A1 capacity.
- Finding: `patch.css` is imported by `src/index.css:4`, so it is live styling, not clutter. The `CONCERNS.md` usage note is stale.
- Finding: five `CONCERNS.md` §6 items (3, 5, 8, 11, 13) had only default answers and were never put to the owner. Round 5 asks them, with `patch.css` (Q37).
- Round 5 questions: Q37 `patch.css` (keep); Q38 typecheck hard gate; Q39 `ai_search` (do not expose); Q40 `PORT`; Q41 webhook SSRF and Discord hostname; Q42 `.env.example` and README.

## Close (2026-10-19)

- Round 5: owner accepted all six recommendations (Q37–Q42).
- Shared understanding confirmed by the owner.
- Open questions: none. Review items for counsel remain: the dispute clause (Q35) and whether a geographic address is required (Q17).
- Implementation pending (settled decisions, not yet executed): move `workspace/refactor_colors.sh` to `archive/` (Q18); move the root codemods to `archive/codemods/` (Q11); delete the empty `ui-ux-pro-max-skill/` (Q11); keep `patch.css` (Q37); the `[ASK USER]` markers in `src/legal/` (Phase 6.1).

