# Programmatic SEO: catalystlab.tech

Date: 2026-10-23
Skill: `programmatic-seo` (marketingskills v2.1.0)
Measured against the production build (`npm run build`, served by `node dist/server.cjs`), not against a live crawl. See "Not measured" at the end.

---

## Executive summary

**The site already runs programmatic SEO, mostly by accident.** Fifty-three indexable URLs are generated from four tables: nine engine landing pages, sixteen documentation pages, ten blog posts, and sixteen static pages. Three of those families were thin templates in the strict sense the skill warns about, and two open-ended families published a 200 for any string a crawler invented.

The fixes below took the generated set from 19 to 192 words of unique content per engine page, gave each documentation page its own summary and title, removed duplicate H1s from fifteen pages, gated the open-ended families, and added breadcrumbs with `BreadcrumbList` to every generated page. The build now refuses to ship a generated page with a duplicate or over-long title or description.

| Family | Pages | Before | After |
|---|---|---|---|
| Engine landing pages | 9 | 19 to 25 words, H1 was the engine's product name | 169 to 192 words, H1 is the query the page answers |
| Documentation | 16 | one shared description sentence, 29 to 35 words, two H1s per page | 16 unique descriptions, own summary and three points, one H1 |
| Blog posts | 10 | prerendered, linked, self-canonical (fixed in the previous audit) | unchanged, plus breadcrumbs |
| Static pages | 18 | fine | unchanged |
| `/reports/<domain>` | unbounded | 200 for any string, home-page metadata | 404 unless the slug can name a domain; `noindex` until a report exists |
| `/playground/<engine>` | unbounded | 200 for any string, then a client redirect | 302 to the canonical engine, 404-equivalent for invented ids |

**Pages deliberately not built:** glossary, comparison, and location sets. Each is a real playbook and each fails the "proprietary data" or "validated demand" test for this product today. The reasoning is in "Playbooks considered and rejected" rather than left implicit.

---

## Opportunity analysis

### What the product actually has

The defensible asset is **first-party measurement**: eight engines produce per-domain readings, and the platform stores them. That supports the Profiles and Directory playbooks, and it is the only data on the site nobody else can copy.

What it does not have is keyword volume data, competitor rankings, or a content library large enough to justify a glossary. Search Console access was not available for this audit, so demand is inferred from the page families that already exist rather than measured.

### Pattern inventory

| Pattern | Playbook | Pages today | Data behind it | Verdict |
|---|---|---|---|---|
| `[engine] audit` | Curation + tool | 9 | `ENGINES_MAP` (key vectors, capabilities) | **Build on it.** Fixed the thin content. |
| `[engine] reference` | Glossary-adjacent | 16 | Doc components with real implementation detail | **Build on it.** Fixed duplicate metadata. |
| `[topic] article` | Curation | 10 | `engineBlogs.ts` | Already correct. |
| `[domain] audit report` | Profiles | unbounded | Stored telemetry, needs auth | **Gate it.** No index until data exists. |
| `[engine] playground` | Integrations-adjacent | 12 | Fixed engine list | **Gate it.** Redirect anything else. |
| `[term] definition` | Glossary | 0 | None | **Not built.** No demand data, no unique data. |
| `[x] vs [y]` | Comparisons | 0 | None | **Not built.** No competitor benchmark data. |
| `[service] in [city]` | Locations | 0 | None | **Not applicable.** No local dimension. |

### Why the engine pages were the priority

Nine pages with 19 to 25 words of unique text is the exact pattern the skill's "Common mistakes" section calls thin content: the template swapped a name and a tagline and published the result. They also carried the product's own vocabulary (`VitalZyme`, `SynthShift`) as the H1, so the page a search engine saw was named after an invented word nobody searches for.

The rebuilt pages answer three questions each, in the product's own words: what the engine reads, what the report returns, and what it cannot measure. That third section is unusual for a marketing page and it is the point: the platform's stated position is that a reading it could not take is reported as unmeasured, so the landing pages now say the same thing.

---

## Page template

### URL structure

```
/health                 engine landing page    (query: website health audit)
/docs/vitalzyme         engine reference       (query: how VitalZyme works)
/blogs/<slug>           article                (query: long-tail topic)
/reports/<domain-slug>  stored report          (noindex until a report exists)
```

Topic hubs at `/engines`, `/docs` and `/blogs` link every spoke. No subdomains, no query parameters, no IDs.

### Title and meta patterns

| Family | Title pattern | Length | Meta description |
|---|---|---|---|
| Engine | `[query]: [what it answers] \| CatalystLab` | ≤60 | what it measures and what comes back, 70 to 160 chars |
| Docs | `[Engine]: [subject] reference \| CatalystLab` | ≤60 | what the reference covers, 70 to 160 chars |
| Blog | `[topic] \| CatalystLab` where it fits | ≤60 | the excerpt, 70 to 160 chars |

The H1 for each family is deliberately different from the other family covering the same engine: the landing page answers "audit my site", the reference answers "how does this work". `src/tests/unit/programmaticSeo.test.ts` fails if the two H1s collide.

### Content outline (engine page)

1. Breadcrumb: Home › Diagnostic engines › page heading
2. H1 answering the query
3. Two-sentence summary of what the engine does
4. **What it measures**: 5 to 6 vectors, one line each
5. **What the report returns**: 3 lines
6. **What it does not measure**: 2 lines
7. Related: the engine reference, then 2 to 3 engines worth running on the same target
8. Footer: primary nav and legal links

Documentation pages use the same skeleton with three "start here" points and 2 to 3 related pages, without the measurement sections.

### Schema

| Family | JSON-LD |
|---|---|
| Engine | `WebPage` + `about: SoftwareApplication` + `BreadcrumbList` + `Organization` |
| Docs | `TechArticle` + `BreadcrumbList` + `Organization` |
| Blog | `BlogPosting` + `BreadcrumbList` + `Organization` |
| `/blogs` | `CollectionPage` with `hasPart` for every post |

Every block is server-rendered in the delivered HTML and validated as parseable JSON on every build.

---

## Implementation

### Where the content lives

| File | Holds | Read by |
|---|---|---|
| `src/data/engineSeo.ts` | 9 engines: title, H1, summary, meta description, measures, returns, limits, docs path, related | prerender + `ToolPage` |
| `src/data/docsSeo.ts` | 16 docs: title, H1, summary, three points, related | prerender + `DocsLayout` |
| `src/data/blogSeo.ts` | 10 posts: title, excerpt, author, dates | prerender + `BlogPostPage` |
| `src/data/playgroundEngines.ts` | 12 accepted engine ids | server + playground |
| `scripts/prerender.ts` | renders the document, head, breadcrumbs and sitemap | build |

Each table is plain data with no image imports, because the prerender runs in plain Node. React reads the same objects, so the delivered H1 and the hydrated H1 are the same string by construction rather than by discipline. A test asserts the engine table matches `ENGINES_MAP` on ids, names and docs routes, and that the docs table matches the prerender's own route list.

### Build-time guards

The prerender now fails the build when:

- a generated page has no H1 or fewer than eight links (`assertReadableDocument`);
- an indexable title is longer than 60 characters, or two pages share one;
- an indexable description falls outside 70 to 160 characters, or two pages share one.

That is the difference between a page set that erodes quietly and one that cannot regress without a red build.

### Indexation strategy

| Surface | Treatment |
|---|---|
| 53 generated public pages | indexable, in `sitemap.xml`, self-canonical, one H1 |
| `/reports/<domain>` | 200 only for domain-shaped slugs, `X-Robots-Tag: noindex` until a stored report exists |
| `/playground/<engine>` | 200 for the 12 known ids, `noindex`; anything else 302s to `/playground/master` |
| `/dashboard/*`, `/admin/*`, `/design-system` | `noindex` |

A report becomes indexable only when the data behind it exists. That is the skill's "noindex very thin variations" applied literally: the page family is allowed to grow to any size, but a page does not enter the index until it has content.

### One sitemap, by decision

The skill recommends splitting sitemaps by page type. At 53 URLs that adds a sitemap index and three files to manage without changing crawl behaviour, and a sitemap index that is wrong is worse than a sitemap that is long. The split is worth doing at roughly 500 URLs, when a single regeneration starts to matter and Search Console reporting per section becomes useful. Recorded here so the decision is visible rather than assumed.

### Internal linking

- `/engines` links all nine engine pages; each engine page links its reference and 2 to 3 sibling engines.
- `/docs` links all sixteen documentation pages; each documentation page links 2 to 3 siblings.
- `/blogs` links all ten posts; each post links the three most recent posts and the index.
- Every generated page carries the primary nav and the legal footer.
- Breadcrumbs are visible text as well as structured data, so the trail a crawler reads is the trail a person sees.

No generated page is reachable only from the sitemap. Measured after the change: 53 of 53 indexable pages have at least one inbound internal link.

---

## Playbooks considered and rejected

**Glossary ("what is llms.txt", "what is INP").** The strongest untapped fit in principle: the product measures the exact concepts a glossary would define, and the blog already covers them in depth. It fails on data and on demand: there is no keyword volume in this audit, and the definitions already exist as blog posts that would then compete with the glossary for the same query. Building it blind is the "over-generation" mistake the skill names. The trigger to revisit: Search Console shows the blog's informational posts within striking distance for `what is` queries.

**Comparisons ("CatalystLab vs Lighthouse").** High commercial intent and a natural next step, but the skill requires honest, balanced data per comparison. There is no benchmark dataset comparing the engines against alternatives, and inventing one is the failure mode the previous work on this repo was specifically fixing (fabricated scores). The trigger: run the same target through both tools and publish the raw output, which is a measurement project rather than a page-count project.

**Locations.** No local dimension to the product.

**Translations.** No translated content and no demand evidence.

---

## Resolution status

Every issue found in the audit of the existing programmatic surface is fixed in this change set.

| # | Issue | Fix |
|---|---|---|
| 1 | Nine engine landing pages carried 19 to 25 words of content and used the product's invented engine name as the H1 | Each page now carries what the engine measures, what the report returns and what it cannot measure, with a query-shaped H1; 169 to 192 words, unique per engine |
| 2 | Sixteen documentation pages shared one description sentence built from a template, and fifteen of them rendered two H1s | Per-page summaries, titles and points from `docsSeo.ts`; the in-body H1 became an H2, so each page has exactly one H1 |
| 3 | `/reports/<slug>` answered 200 for any string with the home page's metadata | 404 unless the slug can name a domain; `noindex` until a report exists; `/report/<id>` 301s to `/reports/<id>` |
| 4 | `/playground/<engine>` answered 200 for any string, then quietly rewrote to one real page | 302 to `/playground/master` for anything outside the 12 known ids |
| 5 | Generated pages had no breadcrumbs and no `BreadcrumbList` structured data | Visible trail plus `BreadcrumbList` on all 35 docs, engine and blog pages |
| 6 | Engine and docs pages disagreed with their own prerendered head after hydration | One table per family, read by both the build and the page; `absoluteTitle` stops the site suffix from lengthening a pre-built title |
| 7 | Nothing stopped a duplicate or over-long title from shipping | Build-time metadata budget, plus 19 assertions in `src/tests/unit/programmaticSeo.test.ts` |

### Measured after the change

- 53 of 53 sitemap URLs return 200 with one H1, a self-canonical, an `index` directive and at least 10 internal links.
- Unique body content per indexable page: minimum 27 words (static legal pages), median 75, maximum 192 (was a median of 40, with engine pages at 19 to 25).
- 35 generated pages carry a visible breadcrumb and a `BreadcrumbList`; every JSON-LD block on every sitemap URL parses.
- `/reports/foo` and `/reports/not-a-post` return 404; `/reports/stripe-com` returns 200 with `X-Robots-Tag: noindex`.
- `/playground/nope` and `/playground/MASTER` return 302 to `/playground/master`.
- `tsc`, `eslint`, `npm test` (393 tests, 42 files) and `npm run build` pass.

### Not measured

- Search Console: no impressions, positions or index counts, so demand for any new family is inferred rather than observed.
- Rankings and competitors: no crawl of the SERP was possible.
- Core Web Vitals for the generated pages: no browser in this environment.
- Edge behaviour of `_redirects` and `_headers` on Cloudflare Pages: the Node build was exercised, not the CDN.
