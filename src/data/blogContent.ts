/**
 * Blog post bodies, kept free of image imports so the prerender can render
 * them (2026-10-23).
 *
 * `engineBlogs.ts` owns the post records but imports cover art, which plain
 * Node cannot resolve. Moving the prose here means the article HTML is written
 * into the delivered document instead of waiting for Firestore and a client
 * render: a crawler or an AI fetcher that does not run JavaScript now reads the
 * whole article.
 *
 * Writing rules for anything added here: a claim that needs a source gets a
 * link in the post's own Sources list, and no measurement is stated as fact
 * unless the page it came from is named.
 */
export const BLOG_CONTENT: Record<string, string> = {
  'optimizing-dom-depth-render-blocking-nextjs': `## Why DOM depth is a performance budget, not a style preference

Every element a component tree emits becomes a node the browser must style, lay out and paint. Wrapping a card in four containers to satisfy a design system costs something on every frame that touches it, because a change to a deeply nested node can force style recalculation and layout for its ancestors and siblings. Interaction to Next Paint, which replaced First Input Delay as a Core Web Vital in March 2024, is where that cost usually shows up first.

The practical budget is small. Lighthouse warns when a document exceeds roughly 800 nodes and flags more than about 1,400 nodes or a depth beyond 32 levels. Those are heuristics, not physics, but they mark the point where the cost stops being free.

### Where the depth comes from

Most deep trees are not deliberate. They accumulate from three habits:

- Wrapper components that exist only to apply one Tailwind class.
- Providers and contexts stacked at the root of a route rather than the branch that needs them.
- Layout primitives used for spacing that a single gap or padding rule would solve.

### Flattening without changing the design

The fix is almost always structural rather than visual. Merge a wrapper into the element it wraps and move its classes onto that element. Replace a three-level grid container with one grid and named areas. Where a wrapper exists for animation, move it to the element that actually animates.

CSS containment does the rest for subtrees that cannot be flattened:

\`\`\`css
.card-list > li {
  contain: layout paint style;
  content-visibility: auto;
  contain-intrinsic-size: auto 320px;
}
\`\`\`

\`contain\` tells the engine that layout inside the element cannot affect anything outside it, which short-circuits the ancestor walk. \`content-visibility: auto\` skips rendering work for off-screen content and needs \`contain-intrinsic-size\` so the scrollbar does not jump when the element is eventually measured.

### Render-blocking resources are the other half

A deep tree makes each frame expensive; a blocking stylesheet or synchronous script delays the first frame entirely. Two rules cover most cases: keep critical CSS in the document head and load the rest asynchronously, and never load third-party scripts synchronously in the head.

\`\`\`html
<link rel="stylesheet" href="/css/app.css" media="print" onload="this.media='all'" />
<noscript><link rel="stylesheet" href="/css/app.css" /></noscript>
\`\`\`

The \`media="print"\` trick keeps the stylesheet off the critical path; the \`noscript\` fallback covers the no-JavaScript case, which is also the case most crawlers see first.

### How to check the result

Measure before and after with the same tool on the same connection profile. Record total DOM nodes, maximum depth, the number of stylesheets in the head, and the p75 INP from field data where it exists. A lab run that improves while field INP stays flat usually means the bottleneck moved to script execution rather than layout.

## Sources

- [Core Web Vitals thresholds, web.dev](https://web.dev/articles/vitals)
- [Interaction to Next Paint, web.dev](https://web.dev/articles/inp)
- [Paint containment and content-visibility, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/content-visibility)
- [JavaScript SEO basics, Google Search Central](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)`,

  'decoupling-critical-css-font-preloading': `## What Largest Contentful Paint actually waits for

Largest Contentful Paint reports when the largest text block or image in the viewport finishes rendering. Four things have to happen first: the HTML arrives, the render-blocking CSS arrives and is parsed, the font used by the largest text block arrives (or a fallback is swapped in), and layout runs. A custom display font that is discovered late delays the last step.

The target is 2.5 seconds at the 75th percentile. Most sites miss it because of a stylesheet that blocks rendering until a font file has been fetched, not because the server is slow.

### Step one: keep the critical CSS in the document

Critical CSS is the subset of rules needed to render the first viewport. Inlining it removes a round trip from the critical path. Everything else can load asynchronously:

\`\`\`html
<style>/* inlined first-viewport rules, generated at build time */</style>
<link rel="stylesheet" href="/css/site.css" media="print" onload="this.media='all'" />
<noscript><link rel="stylesheet" href="/css/site.css" /></noscript>
\`\`\`

Inlining everything is a mistake: an oversized inline block delays the HTML itself and cannot be cached separately. Aim for a few kilobytes, regenerated whenever the hero markup changes.

### Step two: make the font non-blocking

\`font-display: swap\` lets the browser paint a fallback immediately and swap when the webfont arrives. That protects LCP at the cost of a visible swap, which is why the fallback should be metrically close to the real face.

\`\`\`css
@font-face {
  font-family: 'Inter var';
  src: url('/fonts/inter-var.woff2') format('woff2-variations');
  font-display: swap;
  font-weight: 100 900;
  unicode-range: U+0000-00FF, U+0131, U+0152-0153;
}
\`\`\`

\`unicode-range\` matters for sites with more than one script: a Latin-only visitor should never download the Cyrillic subset.

### Step three: preload only what the first viewport uses

Preloading tells the browser about a font before it has parsed the CSS that references it. It must be used sparingly, because every preload competes with the request the page actually needs.

\`\`\`html
<link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossorigin="anonymous" />
\`\`\`

The \`crossorigin\` attribute is required even for same-origin fonts. Without it the browser fetches the file twice and the preload is wasted.

### What to verify

Check that no stylesheet in the head exceeds roughly 50 KB uncompressed, that the hero font is requested in the first two network round trips, and that the LCP element is identified in the trace rather than guessed. If the LCP element is an image, the same rules apply with \`fetchpriority="high"\` and explicit dimensions instead of a font preload, because an unsized image also causes layout shift.

## Sources

- [Largest Contentful Paint, web.dev](https://web.dev/articles/lcp)
- [Optimize LCP, web.dev](https://web.dev/articles/optimize-lcp)
- [font-display, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display)
- [Preload critical assets, web.dev](https://web.dev/articles/preload-critical-assets)`,

  'decimating-ttfb-edge-workers': `## TTFB is a geography problem before it is a code problem

Time to first byte is the gap between the request leaving the client and the first byte of the response arriving. It includes DNS, the TCP or QUIC handshake, TLS, and however long the origin takes to produce the first byte. On a long-haul path, the speed of light sets a floor no application optimisation can move.

That is why the same origin measures well from one continent and poorly from another, and why a single-region deployment cannot promise a consistent TTFB worldwide.

### The four levers, in order of effect

1. **Serve from the edge.** Run the response logic that does not need the primary database at the point of presence, so the handshake and the first byte share a round trip with the user instead of crossing an ocean.
2. **Terminate TLS close to the user.** TLS 1.3 (RFC 8446) removes a round trip from the handshake compared with TLS 1.2, and session resumption removes another. 0-RTT resumption has replay risk and should be limited to requests that are safe to repeat.
3. **Use HTTP/3 where it is available.** QUIC multiplexes streams independently over UDP, so one lost packet no longer stalls every response on the connection, which is what head-of-line blocking costs on HTTP/2 over a lossy mobile link.
4. **Cache the first byte.** A hit at the edge skips the origin entirely. \`stale-while-revalidate\` keeps serving instantly while refreshing in the background.

\`\`\`http
Cache-Control: public, max-age=0, s-maxage=600, stale-while-revalidate=86400
\`\`\`

### Measure from where your users are

A single synthetic test from one region tells you almost nothing. Sample from several continents, record p50 and p75 separately, and hold the connection profile constant so the numbers are comparable across runs. Cold and warm runs must be reported separately too: a warm connection can look twice as fast as a first visit.

### Instrument the phases before optimising

A single TTFB number hides four costs that need different fixes. If DNS dominates, the answer is a resolver closer to the user or a longer-lived record cache. If the TLS handshake dominates, session resumption and certificate chain size are the suspects. If waiting on the server dominates, the query or the cold start is the problem. Collect the phases separately and fix the largest one.

### What the number does not tell you

TTFB is not a ranking factor on its own, and a fast first byte with a slow render still produces a poor Largest Contentful Paint. Treat it as a diagnostic for the network and server layers, then measure rendering separately.

## Sources

- [Time to First Byte, web.dev](https://web.dev/articles/ttfb)
- [RFC 9114: HTTP/3](https://www.rfc-editor.org/rfc/rfc9114.html)
- [RFC 8446: TLS 1.3](https://www.rfc-editor.org/rfc/rfc8446.html)
- [HTTP caching, MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching)`,

  'llmstxt-standard-autonomous-ai-crawlers': `## What llms.txt is, and what it is not

\`/llms.txt\` is a proposal published in September 2024: a markdown file at the site root that gives an AI system a short, curated map of the site's important pages and what each one covers. It is not a standard, no search engine has committed to consuming it, and Google's guidance is explicit that no special file is required for its AI features.

Useful framing: \`robots.txt\` says what a crawler may fetch, \`sitemap.xml\` lists what exists, and \`llms.txt\` says what matters and why. Only the first two are honoured universally.

### Write one for humans and machines at once

The format is plain markdown with a single H1 and a blockquote summary, followed by link sections:

\`\`\`markdown
# CatalystLab

> Web health, security and AI-readiness telemetry for one domain.

## Diagnostic engines
- [Website health](/health): DOM depth, payload and Core Web Vitals budgets.
- [Edge latency](/latency): time to first byte from every point of presence.

## Documentation
- [API guide](/docs/api): endpoints, authentication and rate limits.
\`\`\`

Two rules keep it useful. Never duplicate the sitemap: a file that lists every URL is a worse sitemap. And keep the descriptions specific, because a generic one gives the reader no reason to open the page.

### Decide crawler policy by purpose

Crawler user agents are not interchangeable, and a single "AI bots" rule conflates three different things:

- **Search discovery**: \`OAI-SearchBot\`, \`PerplexityBot\`, \`Claude-SearchBot\`, \`meta-webindexer\`. Blocking these removes you from answers that would otherwise cite and link you.
- **User-triggered retrieval**: \`ChatGPT-User\`, \`Claude-User\`, \`Perplexity-User\`. These fetch a page because a person asked about it.
- **Model training**: \`GPTBot\`, \`ClaudeBot\`, \`Google-Extended\`, \`Applebot-Extended\`, \`CCBot\`. Blocking these does not remove a page from search results.

Blocking training while allowing retrieval is a coherent position. Flipping one switch for all of them is not, and it is the most common mistake in AI crawler policy.

### Make the page readable in the first place

No manifest compensates for a page whose content only exists after a client render. If the article body arrives from an API call, many fetchers see the shell and nothing else. Server-render the prose, keep the heading hierarchy semantic, and put the answer in the first paragraph where both a person and a retrieval system will find it.

### Verify what actually happens

Fetch your own pages with the user agents you care about, then check that the response body contains the text, not just a mounting point. Check the status codes too: a soft 404 that returns 200 with an empty shell is the most expensive failure mode, because it looks fine in a log.

## Sources

- [llms.txt proposal](https://llmstxt.org/)
- [AI features and your website, Google Search Central](https://developers.google.com/search/docs/appearance/ai-features)
- [Robots.txt specification, RFC 9309](https://www.rfc-editor.org/rfc/rfc9309.html)
- [Google crawlers and user-triggered fetchers](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers)`,

  'automating-git-secops-hygiene': `## Supply chain risk starts in the repository settings

Most breach retellings start at a firewall. Most breach timelines start earlier, with a credential committed to a public repository, a dependency that was never updated, or a maintainer with no way to receive a vulnerability report. Those are configuration problems, and configuration can be tested in CI.

### Six checks worth automating

1. **Secret scanning on every push.** GitHub's push protection and equivalent pre-commit hooks block a credential before it reaches the default branch. Scanning after the fact is recovery, not prevention.
2. **A SECURITY.md with a real channel.** Without it a researcher has no safe way to report a vulnerability, so they either publish it or sell it. Name a mailbox and a response window.
3. **Branch protection on the default branch.** Required reviews and required status checks turn "please do not push directly" into an enforced rule.
4. **Dependency updates.** Dependabot or Renovate opens the pull request; a human still has to merge it. Alert fatigue is the failure mode to design against, so group minor updates.
5. **A licence file.** Without one the code is not open source in any useful sense, and downstream users inherit an unresolved legal question.
6. **Pinned CI actions.** A workflow that references an action by tag can change under you. Pin to a commit SHA for anything with repository write access.

\`\`\`yaml
name: repo-hygiene
on: [push, pull_request]
permissions:
  contents: read
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Require SECURITY.md
        run: test -f SECURITY.md
      - name: Fail on committed .env files
        run: '! git ls-files | grep -E "(^|/)\\.env$"'
\`\`\`

### Treat the check as a gate, not a report

A scan that writes a warning into a log nobody reads has the same effect as no scan. Wire the result into the required status checks so a failing hygiene job blocks the merge. Keep the rule set small enough that it stays green when the repository is healthy, because a permanently failing gate gets ignored.

### Keep the ruleset maintainable

A hygiene job that fails for reasons nobody can fix gets disabled. Keep the required checks to the ones with a clear owner, put the rest in a warning-only job, and review the rule set when the repository changes shape. The goal is a gate that is green when the repository is healthy, not a scanner with the longest possible output.

### The disclosure side

Security.txt (RFC 9116) puts the contact and the disclosure policy at a predictable path, \`/.well-known/security.txt\`. Publishing it costs one file and removes the "how do I even report this" step for a researcher.

## Sources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Adding a security policy to your repository, GitHub Docs](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/adding-a-security-policy-to-your-repository)
- [RFC 9116: security.txt](https://www.rfc-editor.org/rfc/rfc9116.html)
- [Dependabot documentation, GitHub Docs](https://docs.github.com/en/code-security/dependabot)`,

  'sustainable-web-engineering-carbon-reduction': `## Transfer weight is the lever you control

A page's carbon estimate is driven by how much data moves, how far it moves, and what the device does with it. Hosting on renewable energy addresses one part of that. The rest is page weight, and page weight is an engineering decision.

The Sustainable Web Design model, maintained by Wholegrain Digital and Mightybytes, estimates energy per gigabyte and splits it across data centres, networks and end-user devices. Device energy is the largest share in the model, which is the counter-intuitive part: a lighter page helps most on the device that renders it.

### Where the bytes go

On a typical marketing page the transfer is dominated by three things: images, JavaScript, and fonts. Measure before optimising, because the ranking varies by site.

- **Images**: serve AVIF or WebP with explicit dimensions, and size the file to the largest slot it is rendered into. A 2000-pixel image in a 600-pixel card is the most common waste on the web.
- **JavaScript**: every framework dependency ships to every visitor. Ship less, and split the rest so the first route does not pay for the last one.
- **Fonts**: subset with \`unicode-range\`, prefer variable files over four static weights, and preload only what the first viewport needs.
- **Compression**: Brotli for text, and confirm the CDN is not decompressing and recompressing on the way through.

### Measure the estimate, not the feeling

Tools disagree, and that is expected: they model different energy intensities and different grid carbon factors. Pick one model, state which, and track the same page over time rather than comparing your number to a vendor's headline claim. A shift from 1.2 g to 0.6 g CO2e per view is a real improvement in transfer terms even if the absolute figure is an estimate.

### Where teams usually start

The highest-return change is almost always the hero image and the third-party script bundle, in that order. A single unoptimised hero can outweigh every other asset on the page, and analytics or chat widgets routinely add more JavaScript than the application. Audit the third-party list before touching application code, because removing one widget is cheaper than refactoring a component tree.

### Be careful with the claims

Carbon estimates are modelled, not measured. Publishing one as a precise measurement is the same mistake as publishing a benchmark you did not run. Label the number as an estimate, name the model and the grid mix, and date it.

## Sources

- [Sustainable Web Design model](https://sustainablewebdesign.org/)
- [Website Carbon Calculator methodology](https://www.websitecarbon.com/how-does-it-work/)
- [Image formats and compression, web.dev](https://web.dev/learn/images/)
- [Reduce JavaScript payloads, web.dev](https://web.dev/articles/reduce-javascript-payloads-with-code-splitting)`,

  'owasp-security-headers-gdpr-governance': `## Headers are the cheapest defence you will ever ship

A web application firewall inspects traffic. Response headers instruct the browser, which is the only place some attacks can be stopped: a clickjacked frame, a MIME-sniffed upload, a downgraded connection. They cost one line of configuration per header and no runtime work.

### The set worth deploying today

- **Strict-Transport-Security**: \`max-age=63072000; includeSubDomains; preload\`. Once a browser has seen it, plain HTTP to your host is replaced before the request leaves. The preload list is a one-way commitment, so confirm every subdomain serves HTTPS first.
- **Content-Security-Policy**: the only header that meaningfully limits script injection. A nonce or hash based policy with \`strict-dynamic\` is the modern shape; \`unsafe-inline\` in \`script-src\` removes most of the benefit.
- **X-Content-Type-Options**: \`nosniff\`. Stops a browser guessing that an uploaded text file is executable script.
- **Referrer-Policy**: \`strict-origin-when-cross-origin\` is a sane default that keeps full paths same-origin and sends only the origin cross-site.
- **Permissions-Policy**: switch off camera, microphone and geolocation unless a feature needs them.
- **Cross-Origin-Opener-Policy**: \`same-origin\` isolates your window from cross-origin openers.

\`\`\`http
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-{RANDOM}' 'strict-dynamic'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'
\`\`\`

\`frame-ancestors 'none'\` supersedes \`X-Frame-Options\` in every browser that matters, but keep both while older clients exist.

### Consent is a data problem, not a banner problem

GDPR does not require a cookie banner. It requires a lawful basis before non-essential storage is used. A banner that fires analytics before the visitor interacts is worse than no banner, because it documents the violation.

Practical rules: block non-essential scripts until consent, store the choice with a timestamp and a policy version, make rejection as easy as acceptance, and keep the record so you can answer "what did this visitor agree to" months later.

### Roll a policy out without breaking the site

A Content-Security-Policy that ships in report-only mode first is the only sane way to deploy one. Send \`Content-Security-Policy-Report-Only\` with the intended directive set, collect the violations for a week, fix or allow-list the sources that legitimately load, then enforce. Shipping enforcement on the first deploy turns every unlisted analytics tag into a silent failure in production.

### Check the deployed response, not the source

Headers are frequently lost at a proxy, duplicated by two layers, or overridden by a CDN default. Test the production URL with an HTTP client, not the development server, and assert the headers in CI so a platform change cannot silently remove them.

## Sources

- [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/)
- [OWASP HTTP headers cheat sheet](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html)
- [Content-Security-Policy, MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy)
- [HSTS preload list](https://hstspreload.org/)`,

  'zero-downtime-platform-migration-seo-parity': `## A migration is a URL contract, not a redesign

Search engines do not care which framework renders a page. They care that the URL that used to return content still returns the same content, at the same URL, or that a permanent redirect points to it. Traffic loss after a replatform is almost always a broken URL contract: a redirect chain, a redirect to a soft 404, or a canonical tag that disagrees with the sitemap.

### Build the URL inventory before touching the stack

Export every URL with impressions or links from Search Console, the analytics tool, the server log and the sitemap. Combine them, deduplicate, and map each one to its destination. That mapping is the deliverable the cutover depends on; everything else is implementation.

The map needs to answer four questions per URL: does it still exist, does it redirect permanently, does the destination return 200, and does the destination canonical point at itself.

\`\`\`tsv
/about-us            /about              301
/blog/old-post-123   /blogs/old-post     301
/legacy/page         /                    301
\`\`\`

### Three failure modes to test for

1. **Redirect chains.** A to B to C loses signal and slows the crawl. Resolve every chain to a single hop.
2. **Soft 404s.** A 200 response with an empty shell, usually because the new router renders a not-found view without setting the status. Serve a real 404.
3. **Canonical disagreement.** If the canonical says one URL and the sitemap lists another, you have asked the engine to choose. Make them identical.

### Cutover sequence

Ship the new stack behind the same hostname with the redirect map live, then verify a sample of at least a few hundred URLs with a script that asserts status, canonical and the presence of the H1. Keep the old sitemap available for comparison, publish the new one, and watch coverage daily for the first fortnight. Do not change content and structure in the same release: if traffic moves, you want to know which change caused it.

### What actually recovers traffic

Nothing recovers a 301 that points at a page with different intent. If a URL's topic changed, the redirect target has to answer the original query or the ranking will not transfer. That is a content decision, and it is cheaper to make before the cutover than after.

## Sources

- [Site moves with URL changes, Google Search Central](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes)
- [Redirects and Google Search](https://developers.google.com/search/docs/crawling-indexing/301-redirects)
- [Consolidate duplicate URLs with canonical tags](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [HTTP redirection, MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Redirections)`,

  'generative-engine-optimization-llmo-citations': `## Being cited is a different problem from being ranked

Answer engines retrieve passages, not pages. A model reads a chunk of your document, decides whether it answers the question, and either cites it or does not. That changes what matters: a page that ranks well on a long tail can still never be quoted if its answer is buried under three paragraphs of introduction, and a page on page two can be cited if it states the answer plainly.

The documented levers are not exotic. Google's guidance remains that ordinary helpful content, structured with headings and paragraphs, is what its AI features use. For engines that read markdown-shaped text, the structural work pays off directly.

### Write passages that survive extraction

Every section should open with a direct answer of roughly 40 to 60 words, then expand. That length is long enough to be complete and short enough to be lifted whole.

- Lead with the answer, not the context.
- Use the question as the heading, phrased the way a person would ask it.
- Keep one idea per paragraph.
- Put numbers in a sentence, not only in a chart, and name where the number came from.

### Give the model an entity to attach to

Structured data tells a retrieval system what the page is about and who published it. \`Organization\`, \`WebPage\`, \`Article\` or \`TechArticle\`, \`BreadcrumbList\`, and a named author are the useful set. Google states structured data is not required for its AI features and no study isolates a citation lift from schema; the argument for it is disambiguation, not a ranking trick.

### Citations are earned off-site as much as on it

A model's shortlist is shaped by what the wider web says about you: review sites, forums, directories, press. Your own pages win citations; third-party consensus wins recommendations. Publishing a "best tools" listicle that ranks competitors above yourself is a known failure mode, and it is not a substitute for being described accurately elsewhere.

### Measure honestly

AI answers are non-deterministic. One query run once is an anecdote. Track a fixed prompt set, run each prompt several times per platform, and record the rate with its sample size. Repeat monthly and compare rates, not single observations.

## Sources

- [AI features and your website, Google Search Central](https://developers.google.com/search/docs/appearance/ai-features)
- [Structured data introduction, Google Search Central](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)
- [llms.txt proposal](https://llmstxt.org/)
- [Generative Engine Optimization, Aggarwal et al., KDD 2024](https://arxiv.org/abs/2311.09735)`,

  'modern-website-health-ai-search': `## One domain, several independent measurements

Website health is usually reported as a single score, which hides the fact that the underlying measurements disagree with each other. A page can be fast and inaccessible, secure and uncrawlable, light and unreadable by an AI retrieval system. Collapsing those into one number makes the trade-offs invisible.

The useful model is a small set of dimensions measured separately, each with its own budget and its own evidence: rendering and Core Web Vitals, network latency from real locations, transport and header security, accessibility against WCAG, transfer weight and carbon, and crawler and AI-readiness policy.

### Why separate dimensions beat a composite score

A composite hides which input moved. If the score drops four points after a deploy, someone has to guess whether a font got heavier or a header got dropped. Separate dimensions make the cause visible in one look, and they let a team own the part it can change.

The other reason is honesty. Some readings are measurements and some are estimates. A carbon figure is modelled; a TTFB sample is measured; an accessibility check covers what an automated rule set can detect, not what a person experiences. Mixing them into one number implies a precision that does not exist.

### The questions worth answering before a launch

- Does every public URL return 200 with the content in the HTML, or does some of it wait for JavaScript?
- Does a missing page return 404 rather than a 200 shell?
- Are titles and descriptions unique, and is the canonical self-referential?
- Do the security headers survive the CDN?
- Does the page work at 320 pixels wide with a keyboard only?
- Is the crawler policy deliberate per user agent rather than a single block rule?

### Make the report readable by a person

A report that only a dashboard can read is a report nobody acts on. Print the measured value, the budget it was compared against, and the one change that would close the gap. A reader should be able to hand a single row to an engineer without translating a score.

### What to do with the output

Fix in order of blast radius: indexation and status codes first, then rendering, then transport, then content. A page that is not indexed gains nothing from a faster font. And re-measure with the same tool after the change, because an improvement you cannot reproduce is a coincidence.

## Sources

- [Core Web Vitals, web.dev](https://web.dev/articles/vitals)
- [Search Essentials, Google Search Central](https://developers.google.com/search/docs/essentials)
- [WCAG 2.2 quick reference, W3C](https://www.w3.org/WAI/WCAG22/quickref/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)`
};
