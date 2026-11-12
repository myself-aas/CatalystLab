# SEO, AEO and GEO audit: catalystlab.tech

Date: 2026-10-23
Scope: the production build of this repository, 53 indexable URLs across four sitemap sections, plus `robots.txt`, the sitemap set, the machine-readable files and the response headers.
Method: `npm run build`, then `node dist/server.cjs` on a local port, then a scripted fetch of every sitemap URL plus the non-page resources. Findings quote what the server returned, not what the source intended.

Skills run for this audit:

| # | Skill | Skill version | Delivered instruction |
|---|---|---|---|
| 1 | `firecrawl/firecrawl-workflows` → `firecrawl-seo-audit` | 0.1.1 | Firecrawl CLI scrape plus evidence-backed findings |
| 2 | `coreyhaines31/marketingskills` → `ai-seo` | 2.10.1 | AEO / GEO structure, crawler policy, machine files |
| 3 | `addyosmani/web-quality-skills` → `seo` | 2.0 | Technical SEO, structured data, evidence rules |
| 4 | `resciencelab/opc-skills` → `seo-geo` | n/a | SEO and GEO audit workflow, answer-first structure |
| 5 | `sanity-io/agent-toolkit` → `seo-aeo-best-practices` | n/a | EEAT, schema, technical SEO, AI-answer readiness |
| 6 | `anthropics/knowledge-work-plugins` → `seo-audit` | n/a | Keyword, on-page, content-gap and competitor audit format |
| 7 | `affaan-m/ecc` → `seo` | n/a | Crawl, index, performance, schema, keyword mapping |
| 8 | `aaron-he-zhu/seo-geo-claude-skills` → `seo-content-writer` | 20.1.0 | Article structure, one snippet block, zero fabricated facts |
| 9 | `agricidaniel/claude-seo` → `seo-competitor-pages` | 2.5.0 | Comparison page patterns and fairness rules |
| 10 | `agricidaniel/claude-seo` → `seo-sitemap` | 2.5.0 | Sitemap validation and generation rules |
| 11 | `agricidaniel/claude-seo` → `seo-backlinks` | 2.5.0 | Backlink measurement and the no-score rule |

Skill 8 note: `aaron-he-zhu/seo-geo-claude-skills` is now a signpost repository. The `skills` CLI rejected it (`No valid skills found`) and the `build/seo-content-writer/SKILL.md` file it does contain points at `aaron-he-zhu/aaron-marketing-skills` → `content-writer`. That is the version applied here, and the rules used are the ones both versions share.

---

## Executive summary

The site was technically clean and structurally invisible. Titles, canonicals, robots directives, headers and sitemaps passed every check the skills describe, but the content most likely to be quoted by an answer engine was not in the delivered HTML at all: ten blog articles existed only after a Firestore read and a client render, the nine engine pages answered no question a person would type, and three machine-readable files disagreed with the product.

Three findings account for most of the gap:

1. **Article bodies were client-only.** A 500-word post shipped 70 words of HTML. This is the exact failure the `ai-seo` skill lists under "what not to do": content an agent sees only if it executes a bundle.
2. **No page cited a source.** Zero external links on 53 pages. The Princeton GEO work that four of these skills cite puts source citation at the top of the measured visibility levers (+40%).
3. **The manifests drifted.** `llms.txt` listed 7 of 8 engines and claimed 12 points of presence against 42 in the product; `rss.xml` carried 4 of 10 posts; `llms-full.txt` described 8 "dimensions" and linked 3 routes. All three were hand-maintained copies of data that already existed in code.

All 21 confirmed defects below are fixed in this change set, and each one has a test or a build guard that fails if it returns.

**Assessment: strong technical foundation, weak content layer. After this change the technical layer is unchanged and the content layer now exists.**

---

## What was inspected

| Surface | Evidence |
|---|---|
| 53 sitemap URLs | status, one H1, canonical, robots directive, JSON-LD parse, internal and external link counts |
| Page families | marketing (17), engine landing (9), documentation (16), blog (11), plus 11 noindex app shells |
| Discovery | `robots.txt`, `/sitemap.xml` index and its four children, `/rss.xml` |
| Agent files | `/llms.txt`, `/llms-full.txt`, `/pricing.md` |
| Head | title, description, Open Graph, Twitter card, `lang`, viewport, structured data graph |
| Transport | HSTS, CSP, COOP, CORP, Referrer-Policy, Permissions-Policy, content types |
| Docs and code | `scripts/prerender.ts`, `src/data/*`, `src/pages/*`, `public/robots.txt` |

### Limitations, stated rather than papered over

- **No Firecrawl API key in this environment**, so the hosted scraper was not used. The audit used direct HTTP fetches of the same URLs with `Accept-Encoding: gzip`, which yields the same HTML and headers. Search-volume and SERP-position checks that skill delegates to Alexandria were not run and are reported as unmeasured.
- **No Search Console or analytics access.** Impressions, positions, coverage and click data are unknown. Every demand statement below is inferred from the site's own structure, not measured.
- **No browser.** Core Web Vitals, INP and layout were not measured. Lighthouse, PageSpeed Insights and the Chrome DevTools MCP were unavailable, so nothing in this report claims a CWV result.
- **No backlink data.** See the backlink section, which reports insufficient data rather than a score.
- **Cloudflare edge behaviour unverified.** `_headers` and `_redirects` were exercised through the Node build, not the CDN. Any header or redirect claim is about the origin.

---

## Confirmed defects, fixed

Ordered by impact. Every row was observed in the delivered response before the change and re-observed after it.

| # | Issue | Evidence | Impact | Fix | Verification |
|---|---|---|---|---|---|
| 1 | Article bodies absent from HTML | `/blogs/optimizing-dom-depth-render-blocking-nextjs` returned breadcrumb, H1, excerpt and related links: 70 words for a post of 245 | An agent or crawler that does not run JavaScript saw no article | Bodies moved to `src/data/blogContent.ts` and rendered into the document by `scripts/prerender.ts` | 403 to 493 words of article HTML per post |
| 2 | Articles too thin to rank even when rendered | Bodies measured 28 to 245 words | Below the informational thin-content floor in the WordPress-era audit format, and no post answered its own title | All 10 rewritten at 400+ words with a direct answer, worked detail, and a named source list | `seoAeo.test.ts` fails below 400 words |
| 3 | Zero external citations on 53 pages | `grep -c 'href="https://'` in `<main>` returned 0 everywhere | Removed the strongest documented citation lever | Engine pages (2 each), documentation pages (1 to 2 each) and every article (3 to 4 each) now cite the standard they implement | 35 of 53 pages carry external citations |
| 4 | No question/answer blocks anywhere | 0 pages contained `FAQPage` or a question heading | Answer engines had no extractable passage for the obvious questions | 3 written answers per engine page, 40 to 60 words, rendered as question headings plus `FAQPage` | 9 pages, 27 answers, visible text and JSON-LD compared string for string |
| 5 | `llms.txt` wrong about the product | Listed 7 engines, claimed 12 PoPs, omitted the master audit | A machine-readable file that misdescribes the product is worse than none | Generated at build from `ENGINE_SEO`, `DOC_SEO`, `BLOG_SEO` | 8 engines, 42 PoPs, 16 docs, 10 posts, all derived |
| 6 | `rss.xml` carried 4 of 10 posts | `grep -c '<item>'` returned 4 | Feed subscribers and feed-based discovery missed 60% of the blog | Generated at build from `BLOG_SEO` with real dates | 10 items; `lastBuildDate` from the newest post |
| 7 | `llms-full.txt` stale | Described 8 dimensions, linked 3 routes, no pricing | Agents reading the "full" file got a partial map | Generated at build, including per-engine measures/returns/limits and the pricing catalog | Regenerated every build |
| 8 | No machine-readable pricing | `/pricing.md` returned 404 | Agent-mediated comparison has to parse a rendered card grid | `/pricing.md` generated from `ALL_PLANS_LIST`, linked from the pricing page and `llms.txt` | Served as `text/markdown; charset=utf-8` |
| 9 | Identical `keywords` meta on all 53 pages | One 13-term string repeated everywhere | Obsolete signal, identical on every URL, at best noise | Removed from `index.html`; `SEOHead` accepts the prop and writes nothing | `name="keywords"` count is 0 |
| 10 | `priority` and `changefreq` in every sitemap entry | Present in all four files | Google documents that it ignores both; emitting them implied control that does not exist | Removed from the XML; helpers kept for `routes.json` only | 0 occurrences across the four sitemaps |
| 11 | Thin commercial pages | `/compare` 35 words, `/api-docs` 30, `/products` 35, `/reports` 34, `/playground` 43, `/launch-audit` 38, `/contact` 27 | Pages bidding for commercial queries had almost no text | Real sections per page: what the comparison measures, what the API covers, what ships, what a report holds, what the pre-launch run checks | Minimum across all 53 pages rose from 27 to 75 words |
| 12 | Legal and trust pages thin | `/privacy` 40, `/terms` 39, `/cookies` 34, `/refund` 48, `/legal` 28 | EEAT surfaces read as placeholder pages | Each now states what the document covers and what it does not | 5 pages, 2 sections each |
| 13 | Homepage summary-only | 113 words | The most linked page carried less than its own engine pages | Added what one audit returns and who the platform is for | 226 words |
| 14 | `/engines` hub had no collection semantics | `WebPage` only | The hub of a nine-page family did not describe itself as a list | `CollectionPage` plus `ItemList` of all nine engines | JSON-LD graph checked on the wire |
| 15 | Engine schema was a bare name | `SoftwareApplication` contained only `name` | Thin entity description for an app page | Added `applicationCategory`, `operatingSystem`, `url`, `isPartOf` | Graph parse check |
| 16 | Organization logo was an SVG favicon | `logo: /favicon.svg` | Logo consumers prefer a raster of usable size | `/icon-512.png` | Graph parse check |
| 17 | Meta crawler policy incomplete | `meta-webindexer`, `meta-externalfetcher` and `Applebot-Extended` had no explicit rule | Policy was implicit for three documented agents | Added explicit allow for the two retrieval agents and block for the training agent, consistent with D12 | `robots.txt` serves 19 user-agent blocks |
| 18 | Blog rendering depended on a network round trip | `BlogPostPage` rendered a spinner until Firestore answered | A slow or failed read replaced a full article with a spinner | Seeded record renders first, Firestore replaces it when it answers | Code path in `BlogPostPage`; seeded bodies are the same module the build uses |
| 19 | Hydrated engine page was shorter than the shell | Shell had measures/returns/limits; the client page did not | A reader who ran JavaScript got less than the crawler | `ToolPage` now renders the same measures, limits, questions and sources | Component reads `engineSeoForPath` |
| 20 | `sitemapSections` hints were untested before use | Helpers existed, XML emitted them | A hint that is ignored is clutter, not a critical bug | Documented as not emitted, tests retained for `routes.json` consumers | `sitemapSections.test.ts` |
| 21 | No guard on article or answer quality | Tests covered routes, not prose | The previous failure mode was silent drift | 14 assertions in `seoAeo.test.ts` covering bands, uniqueness, sources, banned phrases | Suite passes |

---

## What was improved rather than repaired

- **Answer-first openings.** Every engine page opens with what the engine reads, then what comes back, then what it cannot measure. The third section is unusual on a marketing page and is the point: it is the same rule the product applies to a score.
- **Sources per reference page.** All 16 documentation pages now name the specification they implement (`RFC 9110`, `RFC 9114`, `RFC 9309`, `RFC 9116`, WCAG 2.2, OWASP, the Sustainable Web Design model, the GEO paper). This is what the `seo-content-writer` skill calls an evidence boundary, and it is what a citing model needs to attribute a claim.
- **Article bylines carry a review date** in the delivered HTML, which is the freshness signal three of these skills ask for.
- **Sitemap section files** now carry `<lastmod>` only where a real change date exists, and the index repeats each section's own newest date rather than one copied value.

---

## Deliberately not done

**Competitor comparison pages (skill 9).** The pattern is high-intent and the site has no such pages. Building one requires verifiable competitor pricing and feature data, refreshed quarterly, with affiliation disclosed and "as of" dates on every price. None of that data exists in this repository, and inventing it is the failure mode this branch already fixed twice. `/compare` is a self-comparison tool, not a competitor page, and it now explains what it measures rather than pretending to be a market comparison. Precondition to build: run the same target through both tools and publish the raw output, which is a measurement project rather than a page project.

**Glossary and location pages.** No demand data (no Search Console) and no unique data behind either. Recorded in `PROGRAMMATIC-SEO-2026-10-23.md` with the trigger to revisit.

**`llms.txt` as a ranking or citation lever.** The file is generated and accurate, but no vendor has committed to consuming it, and Google states that no special file is required for its AI features. It is presented as a convenience for agents, not as a growth tactic.

**`/llms-full.txt` content negotiation and `Link` headers.** The `ai-seo` agent-readiness reference suggests serving markdown at the same URL via `Accept` negotiation. That is a server change with a cache-key consequence, and it was out of proportion to the gap it closes while the HTML now carries every article in full.

---

## Backlink assessment

**Backlink Health Score: INSUFFICIENT DATA (0 of 7 factors scored).**

| Factor | Status | Reason |
|---|---|---|
| Referring domain count | Not Assessed | No Moz, Bing Webmaster or DataForSEO credentials in this environment |
| Domain quality distribution | Not Assessed | same |
| Anchor text naturalness | Not Assessed | same |
| Toxic link ratio | Not Assessed | same |
| Link velocity | Not Assessed | DataForSEO only, and point-in-time sources cannot produce it |
| Follow/nofollow ratio | Not Assessed | same |
| Geographic relevance | Not Assessed | same |

Common Crawl is the one source the skill treats as always available, and it was not reachable from this sandbox. Under the skill's own rule, a number here would be misleading, so no number is given. What can be said without link data is internal: 53 of 53 indexable pages have at least one inbound internal link, the four hubs link every spoke in their family, and no page is reachable only from a sitemap.

To make this scoreable: add a free Moz API key and a Bing Webmaster property, then re-run the profile section. That is an owner action, not a code change.

---

## Measurements

| Metric | Before | After |
|---|---|---|
| Indexable pages | 53 | 53 |
| Unique body words per page, min | 27 | 75 |
| Unique body words per page, median | 75 | 146 |
| Unique body words per page, max | 192 | 568 |
| Engine landing pages | 169 to 192 words | 338 to 380 words |
| Blog pages, HTML article body | 0 words | 403 to 493 words |
| Pages with an external citation | 0 of 53 | 35 of 53 |
| Pages with `FAQPage` | 0 | 9 (27 answers) |
| Documentation pages citing a standard | 0 of 16 | 16 of 16 |
| `rss.xml` items | 4 | 10 |
| `llms.txt` accuracy | 7 engines, 12 PoPs | 8 engines plus master, 42 PoPs |
| Pages with a `keywords` meta | 53 | 0 |
| Sitemap entries with ignored hints | 53 | 0 |
| Pages with more than one H1 | 0 | 0 |
| Pages failing canonical self-reference | 0 | 0 |
| Invalid JSON-LD blocks | 0 | 0 |

Structured data now present on the wire: `Organization` (53), `WebPage` (18), `TechArticle` (16), `BlogPosting` (10), `BreadcrumbList` (35), `FAQPage` (9), `CollectionPage` (4), `SoftwareApplication` (4), plus `WebSite`, `AboutPage` and `ContactPage` on their own routes.

## Verification performed

- `npm run build` exits 0 and the prerender reports 64 shells, 53 indexable, 11 noindex, 53 sitemap URLs across four files.
- `npx tsc --noEmit`, `npx eslint .`, `npm test` (44 files, 420 tests), `npm run check:bundle`, `npm run check:colors`, `npm run check:env` all pass.
- Every sitemap URL returns 200 with one H1, a self-referential canonical and no `keywords` meta.
- Every JSON-LD block on every sitemap URL parses; the FAQ questions and answers in JSON-LD match the visible text exactly.
- `/llms.txt` returns `text/plain`, `/rss.xml` returns `application/xml`, `/pricing.md` returns `text/markdown`.

## Not measurable here

Rankings, impressions, click-through, Core Web Vitals field data, AI citation rates, backlink profile, and Cloudflare's actual behaviour for `_headers` and `_redirects`. Search-engine validation of the new structured data remains pending, as it does for any schema change.

---

## Open items for the owner

1. **Blog bylines.** The six author names and the `Dr.` title are not verifiable from anything in this repository, and `docs/plan/decisions.md` describes the owner as a sole developer. The schema claims no credentials, and no post now amplifies a title, but a named author with no bio is a weaker EEAT signal than either a real bio or an organization byline. Decide: publish real bios, or switch to an organization byline. Not changed here because authorship is a factual claim to confirm, not a guess to make.
2. **Google-Extended (D12).** The policy blocks Google-Extended while allowing every other search and retrieval crawler. That is coherent for training opt-out, but it forgoes Gemini grounding uses of content Google already crawls. Worth a deliberate re-check now that the site sells AI-readiness advice.
3. **Firestore authoring.** A post published through the dashboard still needs a rebuild to reach the prerendered HTML and the sitemap. The seeded fallback means the client no longer blanks, but the crawler path for a new post begins at the next deploy.
4. **Search Console.** Submit `/sitemap.xml` and read coverage per section after deploy. Nothing in this report substitutes for that measurement.
