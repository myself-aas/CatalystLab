/**
 * Programmatic page content for the documentation set.
 *
 * The 16 documentation routes used to share a single meta description and a
 * single opening paragraph, built by string interpolation from the page title:
 *
 *   `${title}: how it works, what it measures, and how to read the output.`
 *
 * Sixteen pages with one description between them is a duplicate-metadata
 * pattern that gives a crawler no reason to prefer any of them, and it reads as
 * filler to the person who lands on the page. Each entry below carries the
 * summary, the three points a reader needs first, and the related pages worth
 * opening next.
 *
 * React reads this table through `DocsLayout`, so the H1 in the hydrated app is
 * the same string the prerendered document ships.
 * `src/tests/unit/programmaticSeo.test.ts` pins the path list against the route
 * table in `scripts/prerender.ts`.
 */
export interface DocSeoEntry {
  path: string;
  /** Search-result title, kept under 60 characters. */
  seoTitle: string;
  /** The page H1, in both the delivered HTML and the hydrated app. */
  heading: string;
  /** Meta description and opening paragraph, 70 to 160 characters. */
  summary: string;
  /** The three things a reader needs from this page first. */
  points: string[];
  /** Pages to read next, as [path, label]. */
  related: [string, string][];
}

export const DOC_SEO: DocSeoEntry[] = [
  {
    path: '/docs',
    seoTitle: 'Docs: Architecture, Scoring and Rate Limits | CatalystLab',
    heading: 'CatalystLab documentation',
    summary:
      'How the platform is put together, how an engine score is calculated, what the quotas are, and how the sandbox isolates every audit run.',
    points: [
      'Start with the architecture page if you are evaluating the platform, or the scoring matrix if you are checking a result.',
      'Each engine has a reference page with the vectors it reads and the fields it returns.',
      'The API guide covers authentication, rate-limit cost per call and the response schema.'
    ],
    related: [
      ['/docs/architecture', 'Architecture'],
      ['/docs/scoring-matrix', 'Scoring matrix'],
      ['/docs/api', 'API guide']
    ]
  },
  {
    path: '/docs/architecture',
    seoTitle: 'Architecture: Gateway, Workers and Storage | CatalystLab',
    heading: 'Architecture',
    summary:
      'Requests enter through the API gateway, run in isolated workers, and are persisted as durable snapshots. Here is each stage and what it guarantees.',
    points: [
      'The gateway terminates TLS, applies the rate limit and attaches a request id before any engine runs.',
      'Each engine executes in its own worker, so one failure cannot take the run with it.',
      'Reports are stored as immutable snapshots; the permalink resolves to the reading taken, not the latest one.'
    ],
    related: [
      ['/docs/security-sandbox', 'Security sandbox'],
      ['/docs/master-audit', 'Master audit'],
      ['/docs/rate-limiting', 'Rate limiting']
    ]
  },
  {
    path: '/docs/master-audit',
    seoTitle: 'Master Audit: Running Every Engine Together | CatalystLab',
    heading: 'Master audit orchestration',
    summary:
      'The orchestrator runs the engines concurrently against one target, correlates their findings, and returns a report that keeps each engine section separate.',
    points: [
      'Engines run in parallel; the report states which ones completed and which did not.',
      'Correlated findings are grouped, not merged into a single blended score.',
      'A completed run is stored as a durable snapshot with a permalink that does not change.'
    ],
    related: [
      ['/docs/scoring-matrix', 'Scoring matrix'],
      ['/docs/architecture', 'Architecture'],
      ['/master-audit', 'Run a master audit']
    ]
  },
  {
    path: '/docs/scoring-matrix',
    seoTitle: 'Scoring Matrix: Weights, Penalties and Grades | CatalystLab',
    heading: 'Scoring matrix',
    summary:
      'Each vector carries a weight, each failure a deduction, and the total lands in a grade. The weights and the deduction table are published in full.',
    points: [
      'Vector weights differ per engine and are listed, so a score can be recalculated by hand.',
      'Deductions are capped per category, which stops one catastrophic failure zeroing the report.',
      'A reading the engine could not take is excluded from the weighted total instead of scoring zero.'
    ],
    related: [
      ['/docs/vitalzyme', 'VitalZyme engine'],
      ['/docs/master-audit', 'Master audit'],
      ['/docs', 'Documentation index']
    ]
  },
  {
    path: '/docs/rate-limiting',
    seoTitle: 'Rate Limits: Buckets, Headers and Quotas | CatalystLab',
    heading: 'Rate limiting and quotas',
    summary:
      'Quotas are counted in compute units per day, enforced by a sliding token bucket, and reported in response headers on every call.',
    points: [
      'The limit is per account and per day; each endpoint declares its cost in units.',
      'Response headers carry the remaining quota and the reset time, so a client can back off without guessing.',
      'The bucket slides rather than resetting on a fixed clock, so a burst cannot spend a whole day at midnight.'
    ],
    related: [
      ['/docs/api', 'API guide'],
      ['/pricing', 'Pricing and quotas'],
      ['/docs/architecture', 'Architecture']
    ]
  },
  {
    path: '/docs/api',
    seoTitle: 'API Guide: Endpoints, Auth and Responses | CatalystLab',
    heading: 'API guide',
    summary:
      'Authenticate with a key, POST a target to an engine endpoint, and read the measured fields back. The response schema is the same for every engine.',
    points: [
      'Every engine endpoint takes the same request shape and returns the same envelope.',
      'Responses state whether a field was measured or estimated, and name the reason when it was not measured.',
      'Long runs stream; short runs return a single JSON document.'
    ],
    related: [
      ['/api-docs', 'API studio'],
      ['/docs/rate-limiting', 'Rate limits'],
      ['/docs/scoring-matrix', 'Scoring matrix']
    ]
  },
  {
    path: '/docs/security-sandbox',
    seoTitle: 'Security Sandbox: SSRF and Isolation | CatalystLab',
    heading: 'Security sandbox',
    summary:
      'Audits fetch arbitrary URLs, so the fetcher blocks private address space and metadata endpoints, and engines run without the ability to reach each other.',
    points: [
      'Private IP ranges, loopback and cloud metadata addresses are refused before the request leaves.',
      'Engine workers run with no shared memory and no network path to each other.',
      'Shell arguments come from a fixed set; no engine string is interpolated into a command.'
    ],
    related: [
      ['/docs/architecture', 'Architecture'],
      ['/security', 'Security and trust'],
      ['/docs/riskprotease', 'RiskProtease engine']
    ]
  },
  {
    path: '/docs/cicd',
    seoTitle: 'CI/CD: Quality Gates and Webhook Recipes | CatalystLab',
    heading: 'CI/CD integration',
    summary:
      'Run an audit as a pipeline gate and fail the build on a regression, or send the result to Slack, Discord or any endpoint that takes an HMAC-signed POST.',
    points: [
      'A GitHub Actions workflow and a GitLab CI recipe are published in full on this page.',
      'The gate compares against the previous run, so a build fails on a regression rather than an absolute score.',
      'Webhook deliveries are signed, and a non-2xx response is retried with backoff.'
    ],
    related: [
      ['/docs/api', 'API guide'],
      ['/docs/gitlygase', 'GitLygase engine'],
      ['/api-docs', 'API studio']
    ]
  },
  {
    path: '/docs/vitalzyme',
    seoTitle: 'VitalZyme: DOM Health and Core Web Vitals | CatalystLab',
    heading: 'VitalZyme engine reference',
    summary:
      'VitalZyme measures DOM depth and node volume, blocking resources, payload weight and TTFB, and reports each vector against the budget it was given.',
    points: [
      'The DOM walk is recursive and reports depth as the longest path from the root, not the node count.',
      'TTFB is measured from the edge probe, with the redirect chain listed separately.',
      'The page documents the evaluation thresholds, so a reader can see why a check failed.'
    ],
    related: [
      ['/health', 'Website health audit'],
      ['/docs/scoring-matrix', 'Scoring matrix'],
      ['/docs/edgevmax', 'EdgeVmax engine']
    ]
  },
  {
    path: '/docs/edgevmax',
    seoTitle: 'EdgeVmax: Latency, TLS and HTTP/3 Reference | CatalystLab',
    heading: 'EdgeVmax engine reference',
    summary:
      'EdgeVmax compares time to first byte from twelve points of presence, plus TLS handshake cost, HTTP/3 availability and edge cache behaviour.',
    points: [
      'Results are grouped by region, so a single slow continent is visible.',
      'TLS 1.3 session resumption is measured separately from the first handshake.',
      'The page includes the cache-header recipe the probes check for.'
    ],
    related: [
      ['/latency', 'Edge latency test'],
      ['/docs/vitalzyme', 'VitalZyme engine'],
      ['/docs/architecture', 'Architecture']
    ]
  },
  {
    path: '/docs/llm-kinase',
    seoTitle: 'LLM-Kinase: llms.txt and AI Readiness | CatalystLab',
    heading: 'LLM-Kinase engine reference',
    summary:
      'LLM-Kinase reads robots.txt for AI crawler directives, looks for an llms.txt manifest, and checks the structured data and heading order an agent can extract.',
    points: [
      'Crawler directives are reported per user agent, including the ones a file never mentions.',
      'The llms.txt check covers both the short manifest and the full variant.',
      'Structured data is validated for required properties, not just presence.'
    ],
    related: [
      ['/ai-readiness', 'AI readiness audit'],
      ['/docs/allostersearch', 'AllosterSearch engine'],
      ['/docs/security-sandbox', 'Security sandbox']
    ]
  },
  {
    path: '/docs/riskprotease',
    seoTitle: 'RiskProtease: OWASP Headers and Compliance | CatalystLab',
    heading: 'RiskProtease engine reference',
    summary:
      'RiskProtease checks the response headers a browser enforces, the certificate chain, and the consent surface a page ships on first load.',
    points: [
      'CSP is reported with its nonce and hash handling, not just as present or absent.',
      'Certificate expiry is reported in days, alongside the chain depth.',
      'Accessibility contrast checks run against the delivered markup.'
    ],
    related: [
      ['/compliance', 'Security headers audit'],
      ['/docs/security-sandbox', 'Security sandbox'],
      ['/docs/scoring-matrix', 'Scoring matrix']
    ]
  },
  {
    path: '/docs/ecoholo',
    seoTitle: 'EcoHolo: Carbon Model and Energy Reference | CatalystLab',
    heading: 'EcoHolo engine reference',
    summary:
      'EcoHolo applies the Sustainable Web Design model to the bytes a page transfers, then reports energy, emissions and the asset breakdown behind them.',
    points: [
      'The calculation is shown, including the segment factors it applies to each asset type.',
      'Carbon grades run from A+ to F, with the thresholds published.',
      'Host renewable status is read from the Green Web Foundation dataset, with its date.'
    ],
    related: [
      ['/eco-audit', 'Website carbon audit'],
      ['/docs/vitalzyme', 'VitalZyme engine'],
      ['/docs/scoring-matrix', 'Scoring matrix']
    ]
  },
  {
    path: '/docs/synthshift',
    seoTitle: 'SynthShift: Migration and Redirect Reference | CatalystLab',
    heading: 'SynthShift engine reference',
    summary:
      'SynthShift compares two URL sets, collapses redirect chains, and reports the metadata and canonical differences that a migration is most likely to lose.',
    points: [
      'Redirect chains are collapsed to a single hop, with the original chain kept.',
      'Old URLs with no new destination are listed individually.',
      'Canonical and OpenGraph differences are reported per page pair.'
    ],
    related: [
      ['/migration', 'Site migration audit'],
      ['/docs/gitlygase', 'GitLygase engine'],
      ['/docs/architecture', 'Architecture']
    ]
  },
  {
    path: '/docs/gitlygase',
    seoTitle: 'GitLygase: Repository Hygiene Reference | CatalystLab',
    heading: 'GitLygase engine reference',
    summary:
      'GitLygase checks a repository for the files a security review asks for: disclosure policy, dependency automation, licence compatibility and secret scanning.',
    points: [
      'Licence obligations are evaluated against the dependency set, not just the root file.',
      'The disclosure route is quoted from SECURITY.md so it can be checked against the live page.',
      'Dependabot configuration is read, and a missing file is reported as missing.'
    ],
    related: [
      ['/repo-scanner', 'Repository hygiene audit'],
      ['/docs/cicd', 'CI/CD integration'],
      ['/docs/synthshift', 'SynthShift engine']
    ]
  },
  {
    path: '/docs/allostersearch',
    seoTitle: 'AllosterSearch: Citation and LLMO Reference | CatalystLab',
    heading: 'AllosterSearch engine reference',
    summary:
      'The AllosterSearch reference: how entity depth, factual density and author attribution are weighed, and which fields the report returns for each page.',
    points: [
      'Entity depth counts the properties linked from the page entity, not the number of JSON-LD blocks.',
      'Factual density is measured per section, so filler can be located rather than estimated.',
      'Author attribution is checked for a sameAs link to an identity that resolves.'
    ],
    related: [
      ['/llmo', 'AI search visibility audit'],
      ['/docs/llm-kinase', 'LLM-Kinase engine'],
      ['/docs/scoring-matrix', 'Scoring matrix']
    ]
  }
];

export const DOC_SEO_BY_PATH: Record<string, DocSeoEntry> = Object.fromEntries(
  DOC_SEO.map((entry) => [entry.path, entry])
);

export function docSeoForPath(path: string): DocSeoEntry | undefined {
  const clean = path.replace(/\/+$/, '') || '/';
  return DOC_SEO_BY_PATH[clean];
}

/**
 * Published standards each reference page implements, as [url, label]
 * (2026-10-23).
 *
 * Kept as a separate map rather than a field on every entry so the prose above
 * stays readable; `docSourcesForPath` is the lookup the build uses, and the
 * unit test fails if a documentation page has no cited standard.
 */
export const DOC_SOURCES: Record<string, [string, string][]> = {
  '/docs': [
    ['https://www.rfc-editor.org/rfc/rfc9110.html', 'RFC 9110: HTTP semantics'],
    ['https://schema.org/', 'Schema.org vocabulary']
  ],
  '/docs/architecture': [
    ['https://www.rfc-editor.org/rfc/rfc9110.html', 'RFC 9110: HTTP semantics'],
    ['https://developer.mozilla.org/en-US/docs/Web/Performance', 'Web performance, MDN']
  ],
  '/docs/master-audit': [['https://web.dev/articles/vitals', 'Core Web Vitals, web.dev']],
  '/docs/scoring-matrix': [['https://web.dev/articles/vitals', 'Core Web Vitals thresholds, web.dev']],
  '/docs/rate-limiting': [
    ['https://www.rfc-editor.org/rfc/rfc9110.html', 'RFC 9110: 429 Too Many Requests'],
    ['https://datatracker.ietf.org/doc/html/draft-ietf-httpapi-ratelimit-headers', 'RateLimit header fields draft']
  ],
  '/docs/api': [['https://www.rfc-editor.org/rfc/rfc9110.html', 'RFC 9110: HTTP semantics']],
  '/docs/security-sandbox': [
    ['https://owasp.org/www-project-top-ten/', 'OWASP Top 10'],
    ['https://www.rfc-editor.org/rfc/rfc9309.html', 'RFC 9309: Robots Exclusion Protocol']
  ],
  '/docs/cicd': [['https://docs.github.com/en/actions', 'GitHub Actions documentation']],
  '/docs/vitalzyme': [
    ['https://web.dev/articles/vitals', 'Core Web Vitals, web.dev'],
    ['https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model', 'Document Object Model, MDN']
  ],
  '/docs/edgevmax': [
    ['https://web.dev/articles/ttfb', 'Time to First Byte, web.dev'],
    ['https://www.rfc-editor.org/rfc/rfc9114.html', 'RFC 9114: HTTP/3']
  ],
  '/docs/llm-kinase': [
    ['https://llmstxt.org/', 'llms.txt proposal'],
    ['https://developers.google.com/search/docs/appearance/ai-features', 'AI features, Google Search Central']
  ],
  '/docs/riskprotease': [
    ['https://owasp.org/www-project-secure-headers/', 'OWASP Secure Headers Project'],
    ['https://www.w3.org/WAI/WCAG22/quickref/', 'WCAG 2.2 quick reference, W3C']
  ],
  '/docs/ecoholo': [['https://sustainablewebdesign.org/', 'Sustainable Web Design model']],
  '/docs/synthshift': [
    ['https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes', 'Site moves, Google Search Central']
  ],
  '/docs/gitlygase': [
    ['https://docs.github.com/en/code-security', 'GitHub code security documentation'],
    ['https://www.rfc-editor.org/rfc/rfc9116.html', 'RFC 9116: security.txt']
  ],
  '/docs/allostersearch': [
    ['https://arxiv.org/abs/2311.09735', 'Generative Engine Optimization, Aggarwal et al.'],
    ['https://developers.google.com/search/docs/appearance/ai-features', 'AI features, Google Search Central']
  ]
};

export function docSourcesForPath(path: string): [string, string][] | undefined {
  return DOC_SOURCES[path.replace(/\/+$/, '') || '/'];
}
