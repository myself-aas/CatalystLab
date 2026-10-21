# CatalystLab: SEO and AEO audit (2026-10-19)

> **Status (2026-10-21): dated record — kept verbatim as evidence, not rewritten.** Point-in-time SEO/AEO audit (2026-10-19) — source of decisions D11–D15. Its recommendations shipped in `scripts/prerender.ts` (61 prerendered routes, sitemap, JSON-LD); current claims: [`docs/ENGINES.md`](../../ENGINES.md), [`docs/ops/runbook.md`](../../ops/runbook.md).

Scope: the public web app served by `server.ts` (production build, `dist/`, local server on :3000). Method: the `seo-audit` workflow (crawlability, technical, on-page, structured data, checked in a rendered browser), the `ai-seo` agent-readiness checks (access, discovery, parseability), the `seo-geo` audit script, and `seo-aeo-best-practices` checklist items. Evidence is in `tools/` and was re-runnable on the same build.

Skill sources (fetched through `npx skills use`, read in full):

| Skill | Repo | Used for |
|---|---|---|
| seo-audit | coreyhaines31/marketingskills | checklist, rendered-JSON-LD rule, CWV thresholds |
| programmatic-seo | coreyhaines31/marketingskills | not applied: no template-page strategy exists in the plan |
| ai-seo | coreyhaines31/marketingskills | agent-readiness reference (access, discovery, parseability) |
| seo-geo | resciencelab/opc-skills | `scripts/seo_audit.py` (run against :3000) |
| seo-aeo-best-practices | sanity-io/agent-toolkit | metadata, OG, sitemap, robots, JSON-LD checklist |

Not adopted: the quantified lift figures in the skill texts (for example, percentage gains from FAQ schema). The skills give no primary source for them, so the plan does not depend on them. Vendor-specific crawler behaviour (whether GPTBot, ClaudeBot, or PerplexityBot run JavaScript; how `Google-Extended` interacts with Search) is not verified here. Each one needs the vendor's current documentation before it is relied on.

## Findings

Severity: P1 = search or AI engines index wrong content, or a URL is indexable that should not be; P2 = wrong or missing signal on public pages; P3 = hygiene.

| # | Sev | Finding | Evidence (raw HTML unless stated) |
|---|---|---|---|
| S1 | P1 | Unknown URLs return HTTP 200 with the homepage shell (soft 404). The rendered page reads "404 - Node Unreachable" and is `index, follow`. | `server.ts:53` catch-all `sendFile(index.html)`; `curl /this-page-does-not-exist` → 200; rendered title "404 - Node Unreachable…" with robots `index, follow` |
| S2 | P1 | Account and app routes are indexable. `SEOHead` always writes `index, follow`. | `SEOHead.tsx:54`; rendered `/login` robots `index, follow`; also `/admin`, `/dashboard`, `/forgot-password`, `/blogs/new` are routed (`App.tsx`) |
| S3 | P1 | Without JavaScript, every route has the homepage's title, canonical, and `SoftwareApplication` JSON-LD, and about 161 visible words. Browser-rendered titles and canonicals are correct, so the gap is for clients that do not run JavaScript. | `curl` of `/`, `/pricing`, `/blogs`, `/docs`, `/compare`, `/login`, `/dashboard`, unknown: identical title, canonical `https://www.catalystlab.tech/`, one JSON-LD block |
| S4 | P1 | Pages without a canonical prop fall back to `window.location.href`, which includes query strings in production. Observed without the prop: `/pricing`, `/blogs`, and unknown routes. | `SEOHead.tsx:31`; rendered canonical `http://localhost:3000/pricing` (the sandbox origin, so this is a fallback, not the production value) |
| S5 | P2 | 18 legacy static pages in `public/*.html` are served with HTTP 200. None has a canonical or noindex. They duplicate SPA routes, and their copy differs (for example `blogs.html` 362 words; rendered `/blogs` 158 words). `admin.html` and `dashboard.html` are included, and their contents need review under Phase 3. | `curl -I /admin.html /dashboard.html /blogs.html …` → 200; `canonical_tags=0`; `noindex` absent |
| S6 | P2 | The OG image is missing. `index.html:43` points to `/og-image.png`, which is not in `public/`. The request returns the SPA HTML with status 200 and `text/html`. `/favicon.ico` behaves the same. The icon in use is `/favicon.svg`. | `ls public/og-image.png` → missing; `curl -I /og-image.png` → `text/html` |
| S7 | P2 | Blog posts are not in the sitemap. `src/data/engineBlogs.ts` has 10 slugs; the sitemap has 35 entries and none is under `/blogs/`. | `grep -c '/blogs/' sitemap-paths` → 0 |
| S8 | P2 | JSON-LD `SoftwareApplication` offers claim `highPrice` 199 and `offerCount` 3. `src/data/pricingData.ts` has monthly prices 0, 9, 19, 49, and 99, and no 199 appears in the file or on the pricing page. The `author.name` "CatalystLab Inc." is an entity name that the legal `[ASK USER]` items must confirm. No ratings are claimed (`aggregateRating` count 0). | `index.html` lines 53–110; `grep 199 src/data/pricingData.ts` → none |
| S9 | P2 | Title and description lengths are above the skill guidance (about 50–60 and 150–160 characters). Homepage title 63 characters; description 171 characters. | `seo_audit.py` output: title 63, description 171 |
| S10 | P3 | `robots.txt` has one `User-agent: *` block and no AI-crawler rules. `seo_audit.py` reports `ai_bots_mentioned: none`. Default behaviour is allow-all. Disallow rules cover `/api/`, `/admin`, `/dashboard` (directory form), but not `/admin.html` or `/dashboard.html`. | `public/robots.txt`; `seo_audit.py` |
| S11 | P3 | `llms.txt` and `llms-full.txt` exist, and every route linked from `llms.txt` resolves in the route table. The pages behind those links are client-rendered (S3), so the text files are the only server-readable form of that content. | `curl /llms.txt`, `/llms-full.txt` → 200; link check against `App.tsx` routes: 0 misses |
| S12 | P3 | HTML is not compressed (`Content-Encoding` absent). This is audit item D2 and is owned by plan item 5.4. Cross-referenced, not duplicated. | `curl -H 'Accept-Encoding: gzip' /` → no `content-encoding` |

Checks that passed: `robots.txt` and `sitemap.xml` return 200 with the right content type; the 35 sitemap entries each match an SPA route; the `/docs` page renders `TechArticle` JSON-LD in addition to `SoftwareApplication`; `llms.txt` links resolve.

## Not verified (needs a deployed site or owner access)

- Google Search Console indexing state, coverage reports, and "duplicate, Google chose a different canonical" entries. These exist only after deployment with a verified property.
- How Googlebot and AI crawlers render this SPA in production. The sandbox can only show rendered output locally.
- Core Web Vitals field data (CrUX). The lab numbers in `docs/audit/perf-rendering-2026-10/` are sandbox numbers.
- Rich-result eligibility. Validate with Google's Rich Results Test and the schema.org validator after deployment.
- Entity and legal name ("CatalystLab Inc."), social handles (`@CatalystLab`), and the Organization identity. These need owner confirmation.

## Reproduce

```
npm run build && NODE_ENV=production node dist/server.cjs   # or: npm start, after the build
bash docs/audit/seo-aeo-2026-10/tools/seo-raw-check.sh http://localhost:3000
python3 <seo-geo skill dir>/scripts/seo_audit.py http://localhost:3000/
node docs/audit/seo-aeo-2026-10/tools/seo-rendered.mjs   # needs puppeteer-core and @sparticuz/chromium; see /tmp/perf setup in ../../perf-rendering-2026-10/tools/README.md
```

The rendered check is a copy of the script used during this audit. Its `import` paths assume the `/tmp/perf` install. Copy it there before running.
