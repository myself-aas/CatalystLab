/**
 * Programmatic page content for the nine engine landing pages.
 *
 * Why this file exists: the nine pages at `/health`, `/latency` and so on are
 * template pages, and until now the template printed nothing but the engine's
 * name and a one-line tagline. Nine pages sharing one sentence skeleton is the
 * thin-content pattern programmatic SEO is supposed to avoid, so each entry
 * below carries the material that only that engine can answer: what it reads,
 * what the report gives back, and what it cannot measure.
 *
 * It is plain data with no image imports, because `scripts/prerender.ts` runs
 * in plain Node and needs it at build time. The React page reads the same
 * object, so the H1 and the head cannot drift from the prerendered document.
 * `src/tests/unit/programmaticSeo.test.ts` pins the engine ids, names and
 * measured vectors against `ENGINES_MAP`, which is the source of truth.
 */
export interface EngineSeoEntry {
  /** Key in `ENGINES_MAP` (`src/data/engines.ts`). */
  engineId: string;
  /** Public path of the landing page. */
  path: string;
  catalystName: string;
  /** Search-result title, kept under 60 characters. */
  seoTitle: string;
  /** The page H1, in both the delivered HTML and the hydrated app. */
  heading: string;
  /** The opening paragraph on the page: a full statement of what it does. */
  summary: string;
  /** Meta description, 70 to 160 characters, trimmed for a result snippet. */
  metaDescription: string;
  /** The vectors this engine reads. */
  measures: string[];
  /** What the report gives back. */
  returns: string[];
  /** What this engine cannot do, stated on the page. */
  limits: string[];
  /** Reference page for the implementation detail. */
  docsPath: string;
  /** Other engines worth running on the same target. */
  related: string[];
}

export const ENGINE_SEO: EngineSeoEntry[] = [
  {
    engineId: 'health',
    path: '/health',
    catalystName: 'VitalZyme',
    seoTitle: 'Website Health and Core Web Vitals Audit | CatalystLab',
    heading: 'Website health audit: DOM depth, payload and Core Web Vitals',
    summary:
      'VitalZyme walks the live DOM and the network waterfall, then scores depth, node volume, blocking resources, payload weight and TTFB against fixed budgets. Every field carries the reading behind it.',
    metaDescription:
      'VitalZyme walks the live DOM and scores depth, blocking resources, payload weight and TTFB against fixed budgets, with the reading behind each field.',
    measures: [
      'DOM recursion depth and total node volume',
      'Render-blocking stylesheets and scripts',
      'Time to first byte and server response latency',
      'Preload, preconnect and dns-prefetch hints',
      'Cache-Control and immutable asset headers',
      'Contrast ratios and ARIA landmarks in the delivered markup'
    ],
    returns: [
      'A health score with the per-check breakdown behind it',
      'Each failing check named against the budget it broke',
      'The raw reading for every vector, so the score can be re-derived'
    ],
    limits: [
      'It reads the URL it is given; a page behind a login returns nothing to measure',
      'Contrast and landmark checks see the delivered markup, not states created after interaction'
    ],
    docsPath: '/docs/vitalzyme',
    related: ['/latency', '/eco-audit', '/master-audit']
  },
  {
    engineId: 'latency',
    path: '/latency',
    catalystName: 'EdgeVmax',
    seoTitle: 'Edge Latency and TTFB Test From 12 PoPs | CatalystLab',
    heading: 'Global edge latency test: TTFB, TLS and HTTP/3',
    summary:
      'EdgeVmax probes one target from anycast points of presence on four continents and compares the timings, so a slow region shows up as a region rather than an average.',
    metaDescription:
      'EdgeVmax measures TTFB, TLS handshake cost and HTTP/3 support from twelve points of presence, so a slow region shows up as a region rather than an average.',
    measures: [
      'Anycast routing across US, EU, APAC and South America regions',
      'Time to first byte from each point of presence',
      'TLS 1.3 handshake and 0-RTT session resumption',
      'HTTP/3 QUIC availability',
      'Origin socket setup and TCP slow start',
      'Edge cache hit ratio and stale-while-revalidate headers'
    ],
    returns: [
      'A per-region TTFB reading with the spread across points of presence',
      'The slowest and fastest regions, named',
      'Certificate and protocol details collected during the handshake'
    ],
    limits: [
      'Synthetic probes measure the path from our edge, not from a visitor on mobile data',
      'HTTP/3 is reported as offered or not offered, not benchmarked per connection'
    ],
    docsPath: '/docs/edgevmax',
    related: ['/health', '/compliance', '/master-audit']
  },
  {
    engineId: 'ai_ready',
    path: '/ai-readiness',
    catalystName: 'LLM-Kinase',
    seoTitle: 'llms.txt and AI Crawler Readiness Audit | CatalystLab',
    heading: 'AI readiness audit: llms.txt, crawler policy and structured data',
    summary:
      'LLM-Kinase reads the robots.txt directives that govern GPTBot, ClaudeBot and PerplexityBot, looks for /llms.txt and /llms-full.txt, and checks the structured data an agent needs to describe the page.',
    metaDescription:
      'LLM-Kinase reads robots.txt for GPTBot, ClaudeBot and PerplexityBot, checks for llms.txt, and reports the structured data an agent can extract.',
    measures: [
      '/llms.txt and /llms-full.txt presence and structure',
      'AI crawler directives in robots.txt, by user agent',
      'Schema.org JSON-LD coverage of the page entity',
      'Heading order and the text-to-markup ratio of the body',
      'Whether the page reads as one topic an extractor can chunk'
    ],
    returns: [
      'Each AI crawler classified as allowed, blocked or unmentioned',
      'The structured-data types found, and the properties missing from them',
      'A per-page list of what an assistant would have to guess'
    ],
    limits: [
      'It reports whether a crawler is allowed, not whether it has visited',
      'Structured data is validated structurally; a search or assistant result is not guaranteed'
    ],
    docsPath: '/docs/llm-kinase',
    related: ['/llmo', '/compliance', '/health']
  },
  {
    engineId: 'compliance',
    path: '/compliance',
    catalystName: 'RiskProtease',
    seoTitle: 'Security Headers Audit: CSP, HSTS and OWASP | CatalystLab',
    heading: 'Security headers and OWASP compliance audit',
    summary:
      'RiskProtease reads the response headers a browser would enforce, the certificate chain, and the consent surface the page ships, then reports each one as set, weak or missing.',
    metaDescription:
      'RiskProtease reads CSP, HSTS, frame and sniffing headers, the certificate chain and the consent surface, then names each gap and its OWASP source.',
    measures: [
      'Strict-Transport-Security including preload eligibility',
      'Content-Security-Policy, with nonce and hash handling called out',
      'X-Frame-Options and frame-ancestors clickjacking defence',
      'X-Content-Type-Options and MIME sniffing protection',
      'Certificate validity and days remaining',
      'Cookie and tracker consent markers on first load'
    ],
    returns: [
      'A header-by-header table with the value that was actually sent',
      'Each gap mapped to the OWASP guidance it comes from',
      'Certificate expiry, so renewal does not arrive as an outage'
    ],
    limits: [
      'Header checks read what the origin returns; a proxy that rewrites them afterwards is invisible',
      'Consent detection looks for known consent tooling, not for every possible implementation'
    ],
    docsPath: '/docs/riskprotease',
    related: ['/ai-readiness', '/latency', '/master-audit']
  },
  {
    engineId: 'eco',
    path: '/eco-audit',
    catalystName: 'EcoHolo',
    seoTitle: 'Website Carbon and Page Energy Audit | CatalystLab',
    heading: 'Website carbon audit: page energy and CO2 per view',
    summary:
      'EcoHolo estimates page energy and emissions with the Sustainable Web Design model, from the bytes the page actually transfers and the hosting provider published in the Green Web Foundation dataset.',
    metaDescription:
      "EcoHolo estimates page energy and CO2 with the Sustainable Web Design model, from the bytes a page transfers and the host's published energy source.",
    measures: [
      'Transfer weight, split by images, scripts, fonts and markup',
      'Estimated energy in kWh and grams of CO2 per thousand views',
      'Whether the host is listed as running on renewable energy',
      'Modern image formats and any bytes they would save',
      'Main-thread CPU time attributable to client JavaScript'
    ],
    returns: [
      'A carbon rating with the per-asset byte breakdown behind it',
      'The three heaviest assets and the saving each format change would make',
      'The hosting energy source used in the calculation, with its source'
    ],
    limits: [
      'Emissions are modelled from SWD v4, not metered at the server',
      'Host renewable claims come from a third-party dataset that lags provider changes'
    ],
    docsPath: '/docs/ecoholo',
    related: ['/health', '/latency', '/master-audit']
  },
  {
    engineId: 'migration',
    path: '/migration',
    catalystName: 'SynthShift',
    seoTitle: 'Site Migration Audit: Redirects and SEO Parity | CatalystLab',
    heading: 'Site migration audit: redirects, canonicals and SEO parity',
    summary:
      'SynthShift compares an old URL set with the new one: redirect chains and loops, canonical targets, metadata and OpenGraph parity, and the addresses that stop resolving after a cutover.',
    metaDescription:
      'SynthShift compares an old URL set with a new one: redirect chains and loops, canonical targets, metadata parity and the routes that 404 after a cutover.',
    measures: [
      'Route hierarchy on the old site against the new one',
      'Redirect chains, loops and 302s that should be 301',
      'Canonical targets, and pages that canonicalise to the wrong host',
      'Title, description and OpenGraph parity across the pair',
      'DNS records and cutover readiness'
    ],
    returns: [
      'A redirect map, with the chains collapsed to a single hop',
      'Every old URL that has no new destination',
      'Metadata differences where the copy changed but the URL did not'
    ],
    limits: [
      'It needs both URL sets; the old structure cannot be inferred from the new one',
      'It reports DNS records as served, and does not simulate a cutover'
    ],
    docsPath: '/docs/synthshift',
    related: ['/repo-scanner', '/health', '/master-audit']
  },
  {
    engineId: 'repo',
    path: '/repo-scanner',
    catalystName: 'GitLygase',
    seoTitle: 'Repository Hygiene Audit: SECURITY.md and CI | CatalystLab',
    heading: 'Repository hygiene audit: disclosure, dependencies and CI',
    summary:
      'GitLygase checks a repository for the files a security review asks about: a disclosure policy, dependency automation, licence compatibility, branch rules and secret scanning.',
    metaDescription:
      'GitLygase checks a repository for a disclosure policy, dependency automation, licence obligations, branch rules and secret scanning, then lists the gaps.',
    measures: [
      'Licence file and compatibility with the declared dependencies',
      'SECURITY.md and the disclosure route it names',
      'Dependabot or equivalent dependency update configuration',
      'Branch protection and required review rules',
      'Secret scanning and pre-commit guards',
      'CI workflow health, in configuration terms'
    ],
    returns: [
      'A checklist of present, partial and missing files',
      'The licence obligations that apply to the dependency set',
      'The disclosure path a researcher would follow, quoted from the repository'
    ],
    limits: [
      'It reads repository files and configuration, and does not clone history or run a pipeline',
      'Branch protection needs API access with the right scope, so it is reported as unverified without it'
    ],
    docsPath: '/docs/gitlygase',
    related: ['/migration', '/compliance', '/master-audit']
  },
  {
    engineId: 'llmo',
    path: '/llmo',
    catalystName: 'AllosterSearch',
    seoTitle: 'AI Search Visibility: LLM Citation Audit | CatalystLab',
    heading: 'AI search visibility audit: citation and entity depth',
    summary:
      'AllosterSearch scores how quotable a page is: entity depth in its structured data, factual density, author attribution, and whether its claims carry sources a citing model can point at.',
    metaDescription:
      'AllosterSearch scores how quotable a page is, from entity depth and factual density to author attribution and the sources attached to its claims.',
    measures: [
      'Entity graph depth in the JSON-LD',
      'Factual density per section, against filler',
      'Author entity and sameAs links',
      'Citation and source annotation on claims',
      'Heading structure as an extraction outline'
    ],
    returns: [
      'A citation-readiness score with the signals that produced it',
      'Sections an extractor would skip, and why',
      'The entity properties that are missing or ambiguous'
    ],
    limits: [
      'Citation probability is modelled from page signals, not tested against a live assistant',
      'Assistant retrieval behaviour changes, so a score describes the page on the day it ran'
    ],
    docsPath: '/docs/allostersearch',
    related: ['/ai-readiness', '/health', '/master-audit']
  },
  {
    engineId: 'master',
    path: '/master-audit',
    catalystName: 'Master Audit',
    seoTitle: 'Full Website Audit: Every Engine at Once | CatalystLab',
    heading: 'Full website audit across every engine',
    summary:
      'The master audit runs the engines against one target in parallel and keeps their findings separate, so a weak security score is not averaged away by a strong performance one.',
    metaDescription:
      'The master audit runs every engine against one target at once and keeps their findings separate, so a weak score is not averaged away by a strong one.',
    measures: [
      'Every vector the individual engines report, in one run',
      'Which engines completed and which did not, with the reason',
      'The readings behind each engine score, kept separate',
      'Correlated findings, where two engines observed the same page'
    ],
    returns: [
      'One report with a section per engine and no blended headline number',
      'An explicit list of the engines that did not run',
      'A composite that states how many engines it averaged'
    ],
    limits: [
      'A skipped engine lowers coverage, not the score; the report says which ones ran',
      'A master run costs more quota than a single engine run'
    ],
    docsPath: '/docs/master-audit',
    related: ['/health', '/compliance', '/pricing']
  }
];

export const ENGINE_SEO_BY_ENGINE: Record<string, EngineSeoEntry> = Object.fromEntries(
  ENGINE_SEO.map((entry) => [entry.engineId, entry])
);

export const ENGINE_SEO_BY_PATH: Record<string, EngineSeoEntry> = Object.fromEntries(
  ENGINE_SEO.map((entry) => [entry.path, entry])
);

export function engineSeoForPath(path: string): EngineSeoEntry | undefined {
  return ENGINE_SEO_BY_PATH[path.replace(/\/+$/, '') || '/'];
}
