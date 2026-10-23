/**
 * D11 (owner decision, 2026-10-19): prerender the public routes at build time
 * and keep application routes client-only with `noindex`.
 *
 * Run by `npm run build` after `vite build`. It reads the built SPA shell
 * (`dist/index.html`), rewrites the head for each route in the table below and
 * writes `dist/<route>/index.html`. It also emits:
 *   - `dist/404.html`            — served with a real 404 status by server.ts
 *   - `dist/routes.json`         — the route inventory the server matches on
 *
 * Structured data is generated from the same tables the UI renders
 * (`src/data/pricingData.ts`, `src/lib/edge/pops.ts`), so the offers, prices
 * and edge-node count in the JSON-LD cannot drift from the product (D15).
 */
// Q42: pick up APP_ORIGIN / VITE_APP_ORIGIN from .env when the build runs locally.
import dotenv from 'dotenv';
dotenv.config({ quiet: true });
import crypto from 'crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { ALL_PLANS_LIST } from '../src/data/pricingData';
import { BLOG_SEO } from '../src/data/blogSeo';
import { DOC_SEO, DOC_SEO_BY_PATH } from '../src/data/docsSeo';
import { ENGINE_SEO, ENGINE_SEO_BY_PATH } from '../src/data/engineSeo';
import { ROUTE_ALIASES } from '../src/config/routeAliases';
import { TOTAL_POPS_COUNT } from '../src/lib/edge/pops';
import {
  ENTITY_NAME,
  LEGAL_MAILBOX,
  SECURITY_MAILBOX,
  SITE_ORIGIN,
  SUPPORT_MAILBOX,
  canonicalUrlFor,
  isAppRoute,
  isAuthRoute,
  robotsDirectiveFor
} from '../src/config/site';

const DIST = path.resolve(process.cwd(), 'dist');
const APP_TSX = path.resolve(process.cwd(), 'src/App.tsx');
const TEMPLATE = path.join(DIST, 'index.html');

interface RouteMeta {
  path: string;
  title: string;
  description: string;
  /**
   * The page's H1 as delivered in the static document (SEO audit 2026-10-23,
   * issue 1). It is the same string the client renders, so a crawler that does
   * not execute JavaScript and one that does see the same heading.
   */
  heading: string;
  /** One or two sentences that summarise the page for a non-JS crawler. */
  summary: string;
  /** Optional supporting points; rendered as a list under the summary. */
  points?: string[];
  /** Optional headed lists, for pages that answer more than one question. */
  sections?: { heading: string; items: string[] }[];
  /** Optional related links, rendered as a labelled list at the end of <main>. */
  related?: ReadonlyArray<readonly string[]>;
  ogType?: 'website' | 'article';
  jsonLd?: Record<string, unknown>[];
  /** Overrides the directive derived from the path (used for the 404 shell). */
  robots?: string;
  /** Real change date for `<lastmod>`; omitted when unknown. */
  lastmod?: string;
  /**
   * Breadcrumb trail for generated page families: [label, path]. The build
   * renders it as visible text and as BreadcrumbList structured data, so a
   * spoke is never reachable only from the sitemap.
   */
  breadcrumb?: [string, string][];
}

// --- Structured data built from the live catalogs (D15) --------------------

const purchasablePlans = ALL_PLANS_LIST.filter((plan) => plan.id !== 'free');
const priceValues = ALL_PLANS_LIST.flatMap((plan) => [plan.priceMonthly, plan.annualBillingTotal]).filter(
  (value) => Number.isFinite(value)
);

const organizationLd = {
  '@type': 'Organization',
  '@id': `${SITE_ORIGIN}/#organization`,
  name: ENTITY_NAME,
  url: SITE_ORIGIN,
  logo: `${SITE_ORIGIN}/favicon.svg`,
  description:
    'CatalystLab builds multi-dimensional web health, security and AI-readiness telemetry tooling.',
  contactPoint: [
    {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: SUPPORT_MAILBOX,
      availableLanguage: 'English'
    },
    {
      '@type': 'ContactPoint',
      contactType: 'legal',
      email: LEGAL_MAILBOX,
      availableLanguage: 'English'
    }
  ]
};

const offersLd = {
  '@type': 'AggregateOffer',
  priceCurrency: 'USD',
  lowPrice: String(Math.min(...priceValues)),
  highPrice: String(Math.max(...priceValues)),
  offerCount: String(ALL_PLANS_LIST.length),
  offers: ALL_PLANS_LIST.map((plan) => ({
    '@type': 'Offer',
    name: `${plan.name} plan`,
    description: plan.tagline,
    price: String(plan.priceMonthly),
    priceCurrency: 'USD',
    category: plan.id === 'free' ? 'Free tier' : 'Paid subscription',
    url: `${SITE_ORIGIN}/pricing`
  }))
};

const softwareApplicationLd = {
  '@type': 'SoftwareApplication',
  '@id': `${SITE_ORIGIN}/#application`,
  name: 'CatalystLab',
  operatingSystem: 'Web',
  applicationCategory: 'DeveloperApplication',
  url: SITE_ORIGIN,
  description: `Multi-dimensional web health, OWASP security, WCAG accessibility and AI-readiness telemetry, measured across ${TOTAL_POPS_COUNT} anycast edge PoPs.`,
  author: { '@id': `${SITE_ORIGIN}/#organization` },
  offers: offersLd
};

const websiteLd = {
  '@type': 'WebSite',
  '@id': `${SITE_ORIGIN}/#website`,
  url: SITE_ORIGIN,
  name: 'CatalystLab',
  publisher: { '@id': `${SITE_ORIGIN}/#organization` }
};

// --- Static document -------------------------------------------------------

/**
 * SEO audit 2026-10-23, issue 1. Until this existed, every prerendered file
 * carried a finished `<head>` and a 566-byte `<body>`: a `<noscript>` note and
 * an empty `#root`. Crawlers that do not execute JavaScript (Bing, the AI
 * crawlers this product sells against, every unfurler) saw 61 blank documents
 * with no heading, no text and no links.
 *
 * The build now writes a real document into `#root` — one H1, a summary, the
 * supporting points and the site links — and React replaces it on the first
 * commit. The markup uses only tokens and classes that already exist in the
 * built stylesheet, so it needs no new CSP hash and no `unsafe-inline`.
 */
const PRIMARY_LINKS: [string, string][] = [
  ['/engines', 'Diagnostic engines'],
  ['/pricing', 'Pricing'],
  ['/docs', 'Documentation'],
  ['/api-docs', 'API'],
  ['/compare', 'Compare domains'],
  ['/blogs', 'Blog'],
  ['/reports', 'Reports'],
  ['/about', 'About']
];

const FOOTER_LINKS: [string, string][] = [
  ['/contact', 'Contact'],
  ['/security', 'Security'],
  ['/legal', 'Legal'],
  ['/terms', 'Terms of service'],
  ['/privacy', 'Privacy policy'],
  ['/cookies', 'Cookie policy'],
  ['/refund', 'Refund policy']
];

const LEGAL_RELATED: [string, string][] = [
  ['/legal', 'Legal overview'],
  ['/privacy', 'Privacy policy'],
  ['/terms', 'Terms of service'],
  ['/cookies', 'Cookie policy'],
  ['/refund', 'Refund policy']
];

const DOC_RELATED: [string, string][] = [
  ['/docs', 'All documentation'],
  ['/api-docs', 'API reference'],
  ['/engines', 'Diagnostic engines'],
  ['/pricing', 'Pricing']
];

function linkList(links: ReadonlyArray<readonly string[]>): string {
  return links
    .map(([href, label]) => {
      if (typeof href !== 'string' || typeof label !== 'string') {
        throw new Error(`[prerender] malformed link pair: ${JSON.stringify([href, label])}`);
      }
      return `            <li><a href="${escapeAttr(href)}">${escapeAttr(label)}</a></li>`;
    })
    .join('\n');
}

function renderBreadcrumb(trail: [string, string][] | undefined): string {
  if (!trail || trail.length < 2) return '';
  const items = trail
    .map(([label, href], index) =>
      index === trail.length - 1
        ? `            <li aria-current="page">${escapeAttr(label)}</li>`
        : `            <li><a href="${escapeAttr(href)}">${escapeAttr(label)}</a></li>`
    )
    .join('\n');
  return `\n          <nav class="seo-shell__crumbs" aria-label="Breadcrumb">\n            <ol>\n${items}\n            </ol>\n          </nav>`;
}

function renderStaticDocument(meta: RouteMeta): string {
  const points = meta.points?.length
    ? `\n          <ul class="seo-shell__points">\n${meta.points
        .map((point) => `            <li>${escapeAttr(point)}</li>`)
        .join('\n')}\n          </ul>`
    : '';
  const sections = meta.sections?.length
    ? meta.sections
        .map(
          (section) =>
            `\n          <section class="seo-shell__section">\n            <h2>${escapeAttr(section.heading)}</h2>\n            <ul class="seo-shell__points">\n${section.items
              .map((item) => `              <li>${escapeAttr(item)}</li>`)
              .join('\n')}\n            </ul>\n          </section>`
        )
        .join('')
    : '';

  const related = meta.related?.length
    ? `\n        <section class="seo-shell__links" aria-labelledby="seo-related">\n          <h2 id="seo-related">Related</h2>\n          <ul>\n${linkList(meta.related)}\n          </ul>\n        </section>`
    : '';

  return `      <div class="seo-shell">
        <header class="seo-shell__masthead">
          <a class="seo-shell__brand" href="/">CatalystLab</a>
        </header>
        <nav class="seo-shell__nav" aria-label="Primary">
          <ul>
${linkList(PRIMARY_LINKS)}
          </ul>
        </nav>
        <main class="seo-shell__main">${renderBreadcrumb(meta.breadcrumb)}
          <h1>${escapeAttr(meta.heading)}</h1>
          <p class="seo-shell__lede">${escapeAttr(meta.summary)}</p>${points}${sections}${related}
        </main>
        <footer class="seo-shell__footer">
          <nav aria-label="Legal and trust">
            <ul>
${linkList(FOOTER_LINKS)}
            </ul>
          </nav>
          <p>CatalystLab Inc. Multi-dimensional web health, security and AI-readiness telemetry.</p>
        </footer>
      </div>`;
}

/** The mismatch guard: a shell without a heading or links is not shippable. */
function assertReadableDocument(routePath: string, html: string): void {
  const body = html.slice(html.indexOf('<body'));
  const headings = body.match(/<h1[^>]*>/g)?.length ?? 0;
  const links = body.match(/<a\s+href="/g)?.length ?? 0;
  if (headings !== 1) {
    throw new Error(`[prerender] ${routePath} has ${headings} <h1> elements in the delivered document; expected exactly 1.`);
  }
  if (links < 8) {
    throw new Error(`[prerender] ${routePath} has ${links} links in the delivered document; expected at least 8.`);
  }
}

// --- Route table -----------------------------------------------------------

const HOME_DESCRIPTION = `Precision auditing for the modern engineering stack. Multi-dimensional web health, architecture intelligence and automated telemetry diagnostics measured across ${TOTAL_POPS_COUNT} global edge nodes.`;

const ENGINE_ROUTES: { path: string; name: string; catalystName: string; seoTitle: string; description: string }[] = [
  { path: '/health', name: 'Website Health & DOM Engine', seoTitle: 'Website Health and Core Web Vitals Audit | CatalystLab', catalystName: 'VitalZyme', description: 'Measure DOM depth, node count, render-blocking scripts and payload weight against Core Web Vitals budgets.' },
  { path: '/latency', name: 'Global Edge Latency Radar', seoTitle: 'Edge Latency Radar: Global TTFB Test | CatalystLab', catalystName: 'EdgeVmax', description: `Compare TTFB, TLS 1.3 resumption and HTTP/3 availability from ${TOTAL_POPS_COUNT} anycast points of presence.` },
  { path: '/ai-readiness', name: 'AI Readiness & llms.txt Inspector', seoTitle: 'AI Readiness and llms.txt Audit | CatalystLab', catalystName: 'LLM-Kinase', description: 'Check robots.txt crawler policy, llms.txt manifests and JSON-LD coverage for AI search and agent traffic.' },
  { path: '/compliance', name: 'Compliance, Risk & OWASP Audit', seoTitle: 'OWASP Headers and Compliance Audit | CatalystLab', catalystName: 'RiskProtease', description: 'Audit OWASP security headers, WCAG 2.2 AA accessibility and cookie consent coverage.' },
  { path: '/eco-audit', name: 'Eco-Carbon & Green Web Audit', seoTitle: 'Website Carbon and Energy Audit | CatalystLab', catalystName: 'EcoHolo', description: 'Calculate page energy (kWh) and emissions (g CO2) with the Sustainable Web Design model.' },
  { path: '/migration', name: 'Platform Migration & SEO Parity', seoTitle: 'Platform Migration and SEO Parity Audit | CatalystLab', catalystName: 'SynthShift', description: 'Score re-platforming risk: redirect matrices, URL parity, OpenGraph and metadata coverage.' },
  { path: '/repo-scanner', name: 'Git Repository Hygiene & SecOps', seoTitle: 'Git Repository Hygiene and SecOps Audit | CatalystLab', catalystName: 'GitLygase', description: 'Audit licenses, SECURITY.md disclosure, Dependabot configuration and CI/CD hygiene.' },
  { path: '/llmo', name: 'AI Search Optimisation (LLMO)', seoTitle: 'LLMO: AI Search Optimisation Audit | CatalystLab', catalystName: 'AllosterSearch', description: 'Optimise content structure for citation by Perplexity, ChatGPT Search and Gemini.' },
  { path: '/master-audit', name: 'Master Multi-Engine Audit', seoTitle: 'Master Audit: All Eight Engines at Once | CatalystLab', catalystName: 'Master Audit', description: 'Run all eight diagnostic engines against one target and stream the measured results.' }
];

const DOC_ROUTES: [string, string][] = [
  ['/docs/architecture', 'Architecture'],
  ['/docs/master-audit', 'Master Audit Orchestrator'],
  ['/docs/scoring-matrix', 'Scoring Matrix'],
  ['/docs/rate-limiting', 'Rate Limiting & Quotas'],
  ['/docs/api', 'API Guide'],
  ['/docs/security-sandbox', 'Security Sandbox'],
  ['/docs/cicd', 'CI/CD Integration'],
  ['/docs/vitalzyme', 'VitalZyme Engine'],
  ['/docs/edgevmax', 'EdgeVmax Engine'],
  ['/docs/llm-kinase', 'LlmKinase Engine'],
  ['/docs/riskprotease', 'RiskProtease Engine'],
  ['/docs/ecoholo', 'EcoHolo Engine'],
  ['/docs/synthshift', 'SynthShift Engine'],
  ['/docs/allostersearch', 'AllosterSearch Engine'],
  ['/docs/gitlygase', 'GitLygase Engine']
];

const ENGINE_COUNT = ENGINE_ROUTES.filter((route) => route.path !== '/master-audit').length;

/** Link label for a path, preferring the page's own heading. */
function titleForPath(href: string): string {
  const doc = DOC_SEO_BY_PATH[href];
  if (doc) return doc.heading;
  const engine = ENGINE_SEO_BY_PATH[href];
  if (engine) return engine.heading;
  const known: Record<string, string> = {
    '/pricing': 'Pricing',
    '/engines': 'Diagnostic engines',
    '/docs': 'Documentation',
    '/api-docs': 'API',
    '/compare': 'Compare domains',
    '/blogs': 'Engineering blog',
    '/reports': 'Reports',
    '/about': 'About',
    '/master-audit': 'Master audit'
  };
  return known[href] ?? href;
}

const routes: RouteMeta[] = [
  {
    path: '/',
    title: 'Website Health Audit: Six-Dimension Analysis | CatalystLab',
    description: `Run a website health audit across rendering, latency, security headers, carbon and AI readiness. Every field is labelled measured or estimated.`,
    heading: 'Website health audits across six dimensions',
    summary: `CatalystLab runs ${ENGINE_COUNT} diagnostic engines against one domain and returns a scored report with the measurement behind every field, in minutes rather than sprints.`,
    points: [
      'VitalZyme scores rendering, DOM depth and Core Web Vitals; EdgeVmax measures time to first byte from every edge point of presence.',
      'RiskProtease checks OWASP headers and cookie consent; EcoHolo estimates page energy and carbon with the Sustainable Web Design model.',
      'AllosterSearch tracks AI crawler policy and llms.txt coverage; GitLygase audits repository hygiene and disclosure files.',
      'A field the platform could not measure is reported as unmeasured, never as a passing score.'
    ],
    related: [
      ['/pricing', 'Pricing and quotas'],
      ['/engines', 'Diagnostic engines'],
      ['/products', 'Products and plugins'],
      ['/docs', 'Documentation'],
      ['/blogs', 'Engineering blog']
    ],
    jsonLd: [organizationLd, websiteLd, softwareApplicationLd]
  },
  {
    path: '/pricing',
    title: 'Pricing: Audit Plans From Free to Enterprise | CatalystLab',
    description: `Five published tiers: a free plan and ${purchasablePlans.length} paid plans billed monthly or annually in USD. Quotas, annual totals and refund windows are listed in full.`,
    heading: 'Simple pricing, one catalog',
    summary: `Five published tiers, one catalog. The free plan and ${purchasablePlans.length} paid plans below are the same data that drives the pricing page and the structured data on it.`,
    points: ALL_PLANS_LIST.map(
      (plan) =>
        `${plan.name}: $${plan.priceMonthly} per month${plan.annualBillingTotal > 0 ? `, or $${plan.annualBillingTotal} per year` : ', no card required'}`
    ),
    related: [
      ['/engines', 'What the engines measure'],
      ['/launch-audit', 'Pre-launch audit'],
      ['/docs/rate-limiting', 'Rate limits and quotas'],
      ['/refund', 'Refund policy'],
      ['/compare', 'Compare two domains']
    ],
    jsonLd: [organizationLd, softwareApplicationLd]
  },
  {
    path: '/about',
    title: 'About CatalystLab: Web Health and AI-Readiness Telemetry',
    description: `Who builds CatalystLab, what the ${ENGINE_COUNT} engines measure, and how a score is produced from measured inputs rather than estimates.`,
    heading: 'Engineering the standard in autonomous web telemetry',
    summary: `CatalystLab Inc. builds measurement tooling for web health, security posture and AI readiness. This page covers who is behind it and how the engines reach a score.`,
    points: [
      'The registered entity is CatalystLab Inc.',
      'Support, legal and security mailboxes are published on the contact page.',
      'Privacy requests go to a monitored legal mailbox; the company has no DPO.'
    ],
    related: [
      ['/security', 'Security and trust'],
      ['/contact', 'Contact'],
      ['/docs/scoring-matrix', 'Scoring matrix'],
      ['/blogs', 'Engineering blog']
    ],
    jsonLd: [organizationLd, { '@type': 'AboutPage', url: canonicalUrlFor('/about') }]
  },
  {
    path: '/contact',
    title: 'Contact CatalystLab: Support, Legal and Security',
    description: `Support: ${SUPPORT_MAILBOX}. Legal and privacy: ${LEGAL_MAILBOX}. Security reports: ${SECURITY_MAILBOX}.` ,
    heading: 'Direct line to our engineering team',
    summary: `Support goes to ${SUPPORT_MAILBOX}, legal and privacy requests to ${LEGAL_MAILBOX}, and vulnerability reports to ${SECURITY_MAILBOX}.`,
    related: [
      ['/security', 'Security disclosure'],
      ['/legal', 'Legal'],
      ['/docs', 'Documentation'],
      ['/pricing', 'Pricing']
    ],
    jsonLd: [
      organizationLd,
      {
        '@type': 'ContactPage',
        url: canonicalUrlFor('/contact'),
        mainEntity: {
          '@type': 'Organization',
          name: ENTITY_NAME,
          contactPoint: organizationLd.contactPoint
        }
      }
    ]
  },
  {
    path: '/blogs',
    title: 'Engineering Blog: Web Health, Performance and AI Search',
    description: 'Research notes on Core Web Vitals, DOM cost, AI crawler policy, structured data and sustainable web engineering, written by the team that builds the engines.',
    heading: 'Engineering notes on web health and AI search',
    summary: 'Every post below is written by the engineers who build the diagnostic engines. Each one names the measurement it is based on rather than the opinion behind it.',
    related: BLOG_SEO.map((post) => [`/blogs/${post.slug}`, post.title] as [string, string]),
    jsonLd: [
      organizationLd,
      {
        '@type': 'CollectionPage',
        url: canonicalUrlFor('/blogs'),
        hasPart: BLOG_SEO.map((post) => ({
          '@type': 'BlogPosting',
          headline: post.title,
          url: canonicalUrlFor(`/blogs/${post.slug}`),
          datePublished: post.publishedAt,
          author: { '@type': 'Person', name: post.author }
        }))
      }
    ]
  },
  {
    path: '/compare',
    title: 'Compare Two Domains Side by Side | CatalystLab',
    description: 'Run a side-by-side telemetry comparison of two domains and read the measured differences in health, latency, carbon and AI readiness.',
    heading: 'Compare two domains',
    summary: 'Enter two domains and the engines run against both, so the differences in health, latency, carbon and AI readiness come from the same measurement pass.',
    related: [
      ['/engines', 'Diagnostic engines'],
      ['/pricing', 'Pricing'],
      ['/docs', 'Documentation'],
      ['/reports', 'Saved reports']
    ],
    jsonLd: [organizationLd, { '@type': 'WebPage', url: canonicalUrlFor('/compare') }]
  },
  {
    path: '/security',
    title: 'Security and Trust: Disclosure, Subprocessors | CatalystLab',
    description: 'Vulnerability disclosure, safe harbour, subprocessors, data minimisation and the controls behind the telemetry platform.',
    heading: 'Security Disclosure & Safe Harbor',
    summary: `How to report a vulnerability to ${SECURITY_MAILBOX}, what safe harbour covers, which subprocessors hold data, and how long it is kept.`,
    points: [
      'Report vulnerabilities to the security mailbox; the page records the disclosure window.',
      'Subprocessors are listed with the data each one can see.',
      'Audit inputs are processed in an isolated sandbox.'
    ],
    related: [
      ['/docs/security-sandbox', 'Security sandbox'],
      ['/legal', 'Legal'],
      ['/privacy', 'Privacy policy'],
      ['/contact', 'Contact']
    ],
    jsonLd: [organizationLd, { '@type': 'WebPage', url: canonicalUrlFor('/security') }]
  },
  {
    path: '/products',
    title: 'Products: Plugins, Watchdogs and the Master Audit',
    description: 'The CatalystLab product family: diagnostic engines, master audit orchestration, custom domain watchdogs, monitoring and the developer API.',
    heading: 'Automated Plugins & Custom Domain Watchdogs',
    summary: 'Deploy telemetry agents, CI quality gates and webhook dispatchers inside your own domains, or run the audit on demand from the API.',
    related: [
      ['/engines', 'Diagnostic engines'],
      ['/api-docs', 'API'],
      ['/playground', 'API playground'],
      ['/pricing', 'Pricing']
    ],
    jsonLd: [organizationLd, softwareApplicationLd]
  },
  {
    path: '/engines',
    title: 'Diagnostic Engines: Eight Audits, One Report | CatalystLab',
    description: `Eight in-process engines covering health, latency, AI readiness, compliance, carbon, migration, repository hygiene and LLMO, probed from ${TOTAL_POPS_COUNT} edge PoPs.`,
    heading: 'Diagnostic engines.',
    summary: `${ENGINE_COUNT} engines share one input and one output format, so a report can compare a rendering score against a carbon estimate without normalising anything by hand.`,
    related: [
      ...ENGINE_ROUTES.map((engine) => [engine.path, `${engine.catalystName}: ${engine.name}`] as [string, string]),
      ['/compare', 'Compare two domains']
    ],
    jsonLd: [organizationLd, softwareApplicationLd]
  },
  {
    path: '/api-docs',
    title: 'API Documentation: Scans, Audits and Webhooks | CatalystLab',
    description: 'REST and SSE endpoints for engine scans, master audits, quota introspection, webhooks and state sync, with rate-limit cost per call.',
    heading: 'CatalystLab API',
    summary: 'Every engine is reachable over HTTP: single scans, the master audit, quota introspection and webhook delivery, documented endpoint by endpoint.',
    related: [
      ['/docs/api', 'API guide'],
      ['/playground', 'API playground'],
      ['/docs/rate-limiting', 'Rate limits'],
      ['/pricing', 'Pricing']
    ],
    jsonLd: [organizationLd, { '@type': 'TechArticle', headline: 'CatalystLab API Documentation', url: canonicalUrlFor('/api-docs') }]
  },
  {
    path: '/playground',
    title: 'API Playground: Call the Engines From a Browser',
    description: 'Call the CatalystLab API from the browser with your own key and read the measured response, including the metrics block each engine appends.',
    heading: 'Engine Test Playground',
    summary: 'Paste a URL or a domain, choose an engine, and the playground issues the same request the API serves so you can see the raw response before you write a client.',
    related: [
      ['/api-docs', 'API reference'],
      ['/docs/api', 'API guide'],
      ['/docs/rate-limiting', 'Rate limits'],
      ['/engines', 'Diagnostic engines']
    ],
    jsonLd: [organizationLd, { '@type': 'WebPage', url: canonicalUrlFor('/playground') }]
  },
  {
    path: '/reports',
    title: 'Audit Reports: Open a Stored Report | CatalystLab',
    description: 'Open the report stored for a domain, or sign in to search the audits saved to your account. Reports keep the raw measurements, not just the score.',
    heading: 'Reports',
    summary: 'Every stored report keeps the engine output it was built from, so a score can be traced back to the measurement that produced it.',
    related: [
      ['/compare', 'Compare two domains'],
      ['/pricing', 'Pricing'],
      ['/engines', 'Diagnostic engines'],
      ['/contact', 'Contact support']
    ],
    jsonLd: [organizationLd, { '@type': 'CollectionPage', url: canonicalUrlFor('/reports') }]
  },
  {
    path: '/launch-audit',
    title: 'Pre-Launch Audit: Ship a Site That Passes | CatalystLab',
    description: 'A pre-launch checklist run through the engines before a site goes live: metadata, redirects, headers, mobile rendering and AI crawler policy.',
    heading: 'Pre-Launch Audit',
    summary: 'The checklist a site should pass before it goes live, run by the engines rather than by hand: metadata and redirect parity, security headers, mobile rendering and crawler policy.',
    related: [
      ['/pricing', 'Pricing'],
      ['/engines', 'Diagnostic engines'],
      ['/docs/scoring-matrix', 'Scoring matrix'],
      ['/contact', 'Contact']
    ],
    jsonLd: [organizationLd, { '@type': 'WebPage', url: canonicalUrlFor('/launch-audit') }]
  },
  {
    path: '/docs',
    title: 'Docs: Architecture, Scoring and Rate Limits | CatalystLab',
    breadcrumb: [
      ['Home', '/'],
      ['Documentation', '/docs']
    ],
    description: 'Product and engine documentation: architecture, scoring weights, rate limits, API usage and the security sandbox.',
    heading: 'CatalystLab documentation',
    summary: 'How the platform is built, how a score is calculated, what the quotas are and how the sandbox isolates every audit.',
    related: [
      ...DOC_ROUTES.map(([docPath, title]) => [docPath, title] as [string, string]),
      ['/api-docs', 'API reference']
    ],
    jsonLd: [organizationLd, { '@type': 'CollectionPage', url: canonicalUrlFor('/docs') }]
  },
  ...DOC_ROUTES.map(([docPath, fallbackTitle]) => {
    // Per-page content from src/data/docsSeo.ts. The fallback keeps the build
    // honest if a route is added to the table before its copy is written: the
    // page still ships, and the test suite names the gap.
    const entry = DOC_SEO_BY_PATH[docPath];
    return {
      path: docPath,
      title: entry?.seoTitle ?? `${fallbackTitle}: CatalystLab Docs`,
      description:
        entry?.summary ??
        `${fallbackTitle}: how it works, what it measures, and how to read the output in CatalystLab.`,
      heading: entry?.heading ?? fallbackTitle,
      summary: entry?.summary ?? `${fallbackTitle}, as implemented in CatalystLab.`,
      points: entry?.points,
      related: entry?.related ?? DOC_RELATED,
      breadcrumb: [
        ['Home', '/'],
        ['Documentation', '/docs'],
        [entry?.heading ?? fallbackTitle, docPath]
      ] as [string, string][],
      jsonLd: [organizationLd, { '@type': 'TechArticle', headline: entry?.heading ?? fallbackTitle, url: canonicalUrlFor(docPath) }]
    };
  }),
  ...ENGINE_ROUTES.map((engine) => {
    const entry = ENGINE_SEO_BY_PATH[engine.path];
    return {
      path: engine.path,
      title: entry?.seoTitle ?? engine.seoTitle,
      description: entry?.metaDescription ?? entry?.summary ?? engine.description,
      heading: entry?.heading ?? engine.catalystName,
      summary: entry?.summary ?? engine.description,
      // The page carries what the engine reads, what the report returns and
      // what it cannot measure, which is what separates nine template pages
      // from nine swapped variables (programmatic-seo skill, principle 1).
      sections: entry
        ? [
            { heading: 'What it measures', items: entry.measures },
            { heading: 'What the report returns', items: entry.returns },
            { heading: 'What it does not measure', items: entry.limits }
          ]
        : undefined,
      related: entry
        ? [
            [entry.docsPath, `${entry.catalystName} reference`],
            ...entry.related.map((href) => [href, titleForPath(href)] as [string, string])
          ]
        : undefined,
      breadcrumb: [
        ['Home', '/'],
        ['Diagnostic engines', '/engines'],
        [entry?.heading ?? engine.catalystName, engine.path]
      ] as [string, string][],
      jsonLd: [
        organizationLd,
        {
          '@type': 'WebPage',
          url: canonicalUrlFor(engine.path),
          about: { '@type': 'SoftwareApplication', name: engine.catalystName }
        }
      ]
    };
  }),
  {
    path: '/privacy',
    title: 'Privacy Policy: Data, Retention and Rights | CatalystLab',
    description: `How ${ENTITY_NAME} collects, uses, retains and deletes personal data, and how to exercise your rights under the applicable law.`,
    heading: 'Privacy Policy',
    summary: `What ${ENTITY_NAME} collects, why it is collected, how long it is retained, who processes it and how to ask for a copy or a deletion.`,
    related: LEGAL_RELATED,
    jsonLd: [organizationLd, { '@type': 'WebPage', url: canonicalUrlFor('/privacy') }]
  },
  {
    path: '/terms',
    title: 'Terms of Service: Use, Billing and Liability | CatalystLab',
    description: `The terms on which ${ENTITY_NAME} provides the CatalystLab platform, including acceptable use, billing, termination and liability.`,
    heading: 'Terms of Service',
    summary: `The agreement between ${ENTITY_NAME} and the account holder: what the service covers, what acceptable use means, how billing works and where liability sits.`,
    related: LEGAL_RELATED,
    jsonLd: [organizationLd, { '@type': 'WebPage', url: canonicalUrlFor('/terms') }]
  },
  {
    path: '/cookies',
    title: 'Cookie Policy: What Is Stored and Why | CatalystLab',
    description: 'What CatalystLab stores in localStorage and Firebase Auth, and why. No third-party advertising identifiers and no cross-site tracking cookies.',
    heading: 'Cookie Policy',
    summary: 'What the site stores in your browser, why each entry exists, how long it lasts and how to remove it.',
    related: LEGAL_RELATED,
    jsonLd: [organizationLd, { '@type': 'WebPage', url: canonicalUrlFor('/cookies') }]
  },
  {
    path: '/refund',
    title: 'Refund Policy: 7-Day and 14-Day Windows | CatalystLab',
    description: 'Refund windows of 7 days on monthly plans and 14 days on annual plans, how acknowledgement works, processing times and what is not refundable.',
    heading: 'Refund Policy',
    summary: 'Monthly plans can be refunded within 7 days and annual plans within 14 days of the charge. The page records how to ask, what is acknowledged and how long a refund takes to appear.',
    related: LEGAL_RELATED,
    jsonLd: [organizationLd, { '@type': 'WebPage', url: canonicalUrlFor('/refund') }]
  },
  {
    path: '/legal',
    title: 'Legal: Terms, Privacy, Cookies and Refunds | CatalystLab',
    description: `Legal information for ${ENTITY_NAME}: terms, privacy, cookies, refunds and the monitored legal mailbox.`,
    heading: 'Legal',
    summary: `The documents that govern the service, and the mailbox that answers questions about them: ${LEGAL_MAILBOX}.`,
    related: LEGAL_RELATED,
    jsonLd: [organizationLd, { '@type': 'WebPage', url: canonicalUrlFor('/legal') }]
  }
];

// Application and authentication surfaces: prerendered as noindex shells so a
// crawler that fetches them without JavaScript still sees the directive.
const APP_SHELL_ROUTES: [string, string][] = [
  ['/dashboard', 'Dashboard'],
  ['/admin', 'Admin Console'],
  ['/app', 'Application'],
  ['/audit', 'Audit Workspace'],
  ['/user-dashboard', 'User Dashboard'],
  ['/hud', 'Command Center HUD'],
  ['/hub', 'Hub'],
  ['/login', 'Sign In'],
  ['/signin', 'Sign In'],
  ['/register', 'Create Account'],
  ['/signup', 'Create Account'],
  ['/forgot-password', 'Reset Password'],
  ['/reset-password', 'Reset Password'],
  // Developer surface: reachable in production, never a landing page.
  ['/design-system', 'Design System']
];

// --- Rendering -------------------------------------------------------------

function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function replaceMeta(html: string, attr: 'name' | 'property', key: string, content: string): string {
  const pattern = new RegExp(`<meta\\s+${attr}="${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"\\s+content="[^"]*"\\s*/?>`);
  const tag = `<meta ${attr}="${key}" content="${escapeAttr(content)}" />`;
  return pattern.test(html) ? html.replace(pattern, tag) : html.replace('</title>', `</title>\n    ${tag}`);
}

function breadcrumbLd(trail: [string, string][] | undefined): Record<string, unknown> | null {
  if (!trail || trail.length < 2) return null;
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map(([label, href], index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: label,
      item: canonicalUrlFor(href)
    }))
  };
}

function renderRoute(template: string, meta: RouteMeta, options: { document?: boolean } = {}): string {
  const canonical = canonicalUrlFor(meta.path);
  const robots = meta.robots ?? robotsDirectiveFor(meta.path);
  // Idempotent: `vite build` writes the template, but this script can also be
  // run again over an already-rendered dist/, where the root is no longer
  // empty. Strip any previous document before injecting the new one.
  let html = template.replace(/<div id="root">[\s\S]*?<\/div>(\s*<\/body>)/, '<div id="root"></div>$1');

  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeAttr(meta.title)}</title>`);
  html = replaceMeta(html, 'name', 'description', meta.description);
  html = replaceMeta(html, 'name', 'robots', robots);
  html = replaceMeta(html, 'property', 'og:title', meta.title);
  html = replaceMeta(html, 'property', 'og:description', meta.description);
  html = replaceMeta(html, 'property', 'og:url', canonical);
  html = replaceMeta(html, 'property', 'og:type', meta.ogType ?? 'website');
  html = replaceMeta(html, 'name', 'twitter:title', meta.title);
  html = replaceMeta(html, 'name', 'twitter:description', meta.description);
  html = html.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/, `<link rel="canonical" href="${escapeAttr(canonical)}" />`);

  // Structured data: generated per route, or removed entirely for noindex pages.
  const crumbs = breadcrumbLd(meta.breadcrumb);
  const graph = meta.jsonLd ? [...meta.jsonLd, ...(crumbs ? [crumbs] : [])] : crumbs ? [crumbs] : [];
  const jsonLdBlock =
    graph.length
      ? `<script type="application/ld+json">\n    ${JSON.stringify(
          { '@context': 'https://schema.org', '@graph': graph },
          null,
          2
        ).replace(/\n/g, '\n    ')}\n    </script>`
      : '';
  if (/<script type="application\/ld\+json">[\s\S]*?<\/script>/.test(html)) {
    html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, jsonLdBlock);
  } else if (jsonLdBlock) {
    html = html.replace('</head>', `    ${jsonLdBlock}\n  </head>`);
  }

  // The delivered document. `document: false` keeps the bare shell for the
  // noindex application routes, which have no content to summarise.
  if (options.document !== false) {
    const document_ = renderStaticDocument(meta);
    html = html.replace('<div id="root"></div>', `<div id="root">\n${document_}\n    </div>`);
    assertReadableDocument(meta.path, html);
  }

  return html;
}

function writeRoute(routePath: string, html: string): string {
  if (routePath === '/') {
    writeFileSync(path.join(DIST, 'index.html'), html);
    return 'dist/index.html';
  }
  const dir = path.join(DIST, routePath.replace(/^\/+/, ''));
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, 'index.html'), html);
  return `dist/${routePath.replace(/^\/+/, '')}/index.html`;
}

function extractSpaRoutes(): string[] {
  if (!existsSync(APP_TSX)) return [];
  const source = readFileSync(APP_TSX, 'utf8');
  const paths = new Set<string>();
  for (const match of source.matchAll(/path="([^"]+)"/g)) {
    const value = match[1];
    if (value === '*' || value.endsWith('.html')) continue;
    paths.add(value.startsWith('/') ? value : `/${value}`);
  }
  return Array.from(paths).sort();
}

function main(): void {
  if (!existsSync(TEMPLATE)) {
    throw new Error(`[prerender] ${TEMPLATE} not found — run "vite build" first.`);
  }
  const template = readFileSync(TEMPLATE, 'utf8');
  const spaRoutes = extractSpaRoutes();
  const written: string[] = [];
  const missing: string[] = [];
  const aliasPaths = new Set(Object.keys(ROUTE_ALIASES));
  const sitemapEntries: { path: string; lastmod?: string; priority: string }[] = [];
  const metaForPath = new Map<string, RouteMeta>();

  for (const meta of routes) {
    // Aliases are redirected, not published (SEO audit 2026-10-23, issue 5).
    if (aliasPaths.has(meta.path)) continue;
    if (spaRoutes.length && !spaRoutes.includes(meta.path)) {
      missing.push(meta.path);
      continue;
    }
    written.push(writeRoute(meta.path, renderRoute(template, meta)));
    metaForPath.set(meta.path, meta);
    sitemapEntries.push({
      path: meta.path,
      lastmod: meta.lastmod,
      priority: meta.path === '/' ? '1.0' : meta.path.startsWith('/docs') ? '0.6' : '0.8'
    });
  }

  // Blog posts (SEO audit issue 4). The slugs and titles come from the same
  // module the app renders, so a post cannot exist in the UI and be missing
  // from the build.
  for (const post of BLOG_SEO) {
    const path_ = `/blogs/${post.slug}`;
    const others = BLOG_SEO.filter((entry) => entry.slug !== post.slug).slice(0, 3);
    const html = renderRoute(template, {
      path: path_,
      title: post.seoTitle,
      description: post.excerpt,
      heading: post.title,
      summary: post.excerpt,
      ogType: 'article',
      lastmod: post.publishedDate,
      breadcrumb: [
        ['Home', '/'],
        ['Engineering blog', '/blogs'],
        [post.title, path_]
      ],
      related: [
        ['/blogs', 'All posts'],
        ...others.map((entry) => [`/blogs/${entry.slug}`, entry.title] as [string, string]),
        ['/pricing', 'Pricing']
      ],
      jsonLd: [
        organizationLd,
        {
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.excerpt,
          url: canonicalUrlFor(path_),
          mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrlFor(path_) },
          datePublished: post.publishedAt,
          dateModified: post.publishedAt,
          author: { '@type': 'Person', name: post.author },
          publisher: { '@id': `${SITE_ORIGIN}/#organization` },
          articleSection: post.category,
          image: `${SITE_ORIGIN}/og-image.png`
        }
      ]
    });
    written.push(writeRoute(path_, html));
    metaForPath.set(path_, {
      path: path_,
      title: post.seoTitle,
      description: post.excerpt,
      heading: post.title,
      summary: post.excerpt
    });
    sitemapEntries.push({ path: path_, lastmod: post.publishedDate, priority: '0.7' });
  }

  // Build-time metadata budget. A duplicated or over-long title in a generated
  // family is the failure mode this whole page set is most exposed to, so it
  // fails the build instead of waiting for a crawl (programmatic-seo skill,
  // quality checks: unique titles and descriptions).
  const seenTitles = new Map<string, string>();
  const seenDescriptions = new Map<string, string>();
  for (const entry of sitemapEntries) {
    const meta = metaForPath.get(entry.path);
    if (!meta) continue;
    if (meta.title.length > 60) {
      throw new Error(`[prerender] ${entry.path} title is ${meta.title.length} characters; the budget is 60.`);
    }
    if (meta.description.length < 70 || meta.description.length > 160) {
      throw new Error(
        `[prerender] ${entry.path} description is ${meta.description.length} characters; the range is 70 to 160.`
      );
    }
    const titleOwner = seenTitles.get(meta.title);
    if (titleOwner) throw new Error(`[prerender] ${entry.path} and ${titleOwner} share a title: "${meta.title}"`);
    seenTitles.set(meta.title, entry.path);
    const descriptionOwner = seenDescriptions.get(meta.description);
    if (descriptionOwner) {
      throw new Error(`[prerender] ${entry.path} and ${descriptionOwner} share a description.`);
    }
    seenDescriptions.set(meta.description, entry.path);
  }

  // noindex shells for application and authentication surfaces (D11)
  const appShells: string[] = [];
  for (const [routePath, label] of APP_SHELL_ROUTES) {
    if (aliasPaths.has(routePath)) continue;
    if (spaRoutes.length && !spaRoutes.includes(routePath)) continue;
    const title = `${label} — CatalystLab`;
    const html = renderRoute(
      template,
      {
        path: routePath,
        title,
        description: 'Application surface. Sign in to use this part of CatalystLab; it is not part of the public index.',
        heading: label,
        summary: 'Application surface.'
      },
      { document: false }
    );
    written.push(writeRoute(routePath, html));
    appShells.push(routePath);
  }

  // 404 shell: served with a real 404 status by the production static handler.
  const notFound = renderRoute(template, {
    path: '/404',
    title: 'Page not found — CatalystLab',
    description: 'That page does not exist on CatalystLab. Use the navigation or search to find what you need.',
    heading: 'Page not found',
    summary: 'That page does not exist. The links below are the fastest way back to something that does.',
    related: PRIMARY_LINKS,
    robots: 'noindex, nofollow'
  });
  writeFileSync(path.join(DIST, '404.html'), notFound);

  // Sitemap generated from the same tables, so it can never list a route that
  // is noindex, redirected or missing from the router (D11/D14).
  const sitemapRoutes = sitemapEntries.filter(
    (entry) => !isAppRoute(entry.path) && !isAuthRoute(entry.path) && !aliasPaths.has(entry.path)
  );
  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...sitemapRoutes.flatMap((entry) => [
      '  <url>',
      `    <loc>${canonicalUrlFor(entry.path)}</loc>`,
      // `<lastmod>` only when the change date is known: a build timestamp on
      // every URL teaches crawlers to ignore the field (SEO audit T8).
      ...(entry.lastmod ? [`    <lastmod>${entry.lastmod}</lastmod>`] : []),
      `    <changefreq>${entry.path === '/' ? 'daily' : 'weekly'}</changefreq>`,
      `    <priority>${entry.priority}</priority>`,
      '  </url>'
    ]),
    '</urlset>',
    ''
  ].join('\n');
  writeFileSync(path.join(DIST, 'sitemap.xml'), sitemap);

  const dynamicRoutes = spaRoutes.filter((route) => route.includes(':'));
  writeFileSync(
    path.join(DIST, 'routes.json'),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        origin: SITE_ORIGIN,
        entity: ENTITY_NAME,
        edgeNodes: TOTAL_POPS_COUNT,
        prerendered: sitemapEntries.map((entry) => entry.path),
        sitemap: sitemapRoutes.map((entry) => entry.path),
        appRoutes: appShells,
        dynamicRoutes,
        /** Slugs the server accepts for `/blogs/:slug`; anything else is a 404. */
        blogSlugs: BLOG_SEO.map((post) => post.slug),
        /** 301 map mirrored in public/_redirects. */
        aliases: ROUTE_ALIASES,
        spaRoutes
      },
      null,
      2
    )
  );

  const indexable = sitemapRoutes.length;

  // Plan 3.8: stamp exact SHA-256 hashes of all built inline <script> blocks
  // across dist/index.html into dist/_headers so Cloudflare Pages enforces the
  // exact same zero-'unsafe-inline' CSP as Express in server/app.ts.
  const builtIndexHtml = readFileSync(path.join(DIST, 'index.html'), 'utf8');
  const scriptHashes = new Set<string>();
  for (const htmlDoc of [builtIndexHtml, notFound]) {
    const inlineScriptRegex = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
    let match: RegExpExecArray | null;
    while ((match = inlineScriptRegex.exec(htmlDoc)) !== null) {
      const content = match[1];
      if (content.trim().length > 0) {
        scriptHashes.add(`'sha256-${crypto.createHash('sha256').update(content).digest('base64')}'`);
      }
    }
  }
  const distHeadersPath = path.join(DIST, '_headers');
  if (existsSync(distHeadersPath)) {
    const rawHeaders = readFileSync(distHeadersPath, 'utf8');
    const stampedHeaders = rawHeaders
      .replace('__INLINE_SCRIPT_HASHES__', Array.from(scriptHashes).join(' '))
      .replace(/  +/g, (spaces, offset, full) => (full[offset - 1] === '\n' ? spaces : ' '));
    writeFileSync(distHeadersPath, stampedHeaders);
  }

  console.log(
    `[prerender] wrote ${written.length} route shells (${indexable} indexable, ${appShells.length} noindex), dist/404.html, dist/sitemap.xml (${sitemapRoutes.length} URLs), dist/_headers (${scriptHashes.size} CSP hashes) and dist/routes.json`
  );
  if (missing.length) {
    console.warn(`[prerender] skipped ${missing.length} route(s) absent from src/App.tsx: ${missing.join(', ')}`);
  }
}

main();
