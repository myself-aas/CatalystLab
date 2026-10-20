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
import { TOTAL_POPS_COUNT } from '../src/lib/edge/pops';
import {
  ENTITY_NAME,
  LEGAL_MAILBOX,
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
  ogType?: 'website' | 'article';
  jsonLd?: Record<string, unknown>[];
  /** Overrides the directive derived from the path (used for the 404 shell). */
  robots?: string;
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

// --- Route table -----------------------------------------------------------

const HOME_DESCRIPTION = `Precision auditing for the modern engineering stack. Multi-dimensional web health, architecture intelligence and automated telemetry diagnostics measured across ${TOTAL_POPS_COUNT} global edge nodes.`;

const ENGINE_ROUTES: { path: string; name: string; description: string }[] = [
  { path: '/health', name: 'Website Health & DOM Engine', description: 'Measure DOM depth, node count, render-blocking scripts and payload weight against Core Web Vitals budgets.' },
  { path: '/latency', name: 'Global Edge Latency Radar', description: `Compare TTFB, TLS 1.3 resumption and HTTP/3 availability from ${TOTAL_POPS_COUNT} anycast points of presence.` },
  { path: '/ai-readiness', name: 'AI Readiness & llms.txt Inspector', description: 'Check robots.txt crawler policy, llms.txt manifests and JSON-LD coverage for AI search and agent traffic.' },
  { path: '/compliance', name: 'Compliance, Risk & OWASP Audit', description: 'Audit OWASP security headers, WCAG 2.2 AA accessibility and cookie consent coverage.' },
  { path: '/eco-audit', name: 'Eco-Carbon & Green Web Audit', description: 'Calculate page energy (kWh) and emissions (g CO2) with the Sustainable Web Design model.' },
  { path: '/migration', name: 'Platform Migration & SEO Parity', description: 'Score re-platforming risk: redirect matrices, URL parity, OpenGraph and metadata coverage.' },
  { path: '/repo-scanner', name: 'Git Repository Hygiene & SecOps', description: 'Audit licenses, SECURITY.md disclosure, Dependabot configuration and CI/CD hygiene.' },
  { path: '/llmo', name: 'AI Search Optimisation (LLMO)', description: 'Optimise content structure for citation by Perplexity, ChatGPT Search and Gemini.' },
  { path: '/master-audit', name: 'Master Multi-Engine Audit', description: 'Run all eight diagnostic engines against one target and stream the measured results.' }
];

const DOC_ROUTES: [string, string][] = [
  ['/docs/overview', 'Platform Overview'],
  ['/docs/architecture', 'Architecture'],
  ['/docs/master-audit', 'Master Audit Orchestrator'],
  ['/docs/scoring-matrix', 'Scoring Matrix'],
  ['/docs/rate-limiting', 'Rate Limiting & Quotas'],
  ['/docs/api', 'API Guide'],
  ['/docs/api-reference', 'API Reference'],
  ['/docs/security-sandbox', 'Security Sandbox'],
  ['/docs/cicd', 'CI/CD Integration'],
  ['/docs/devops', 'DevOps Runbooks'],
  ['/docs/health', 'VitalZyme: Website Health Engine'],
  ['/docs/vitalzyme', 'VitalZyme Engine'],
  ['/docs/latency', 'EdgeVmax: Latency Engine'],
  ['/docs/edgevmax', 'EdgeVmax Engine'],
  ['/docs/ai-readiness', 'LlmKinase: AI Readiness Engine'],
  ['/docs/llm-kinase', 'LlmKinase Engine'],
  ['/docs/compliance', 'RiskProtease: Compliance Engine'],
  ['/docs/riskprotease', 'RiskProtease Engine'],
  ['/docs/eco-audit', 'EcoHolo: Carbon Engine'],
  ['/docs/ecoholo', 'EcoHolo Engine'],
  ['/docs/migration', 'SynthShift: Migration Engine'],
  ['/docs/synthshift', 'SynthShift Engine'],
  ['/docs/llmo', 'AllosterSearch: LLMO Engine'],
  ['/docs/allostersearch', 'AllosterSearch Engine'],
  ['/docs/repo-scanner', 'GitLygase: Repository Engine'],
  ['/docs/gitlygase', 'GitLygase Engine']
];

const routes: RouteMeta[] = [
  {
    path: '/',
    title: 'CatalystLab — Multi-Dimensional Web Health & Telemetry Platform',
    description: HOME_DESCRIPTION,
    jsonLd: [organizationLd, websiteLd, softwareApplicationLd]
  },
  {
    path: '/pricing',
    title: 'Pricing — CatalystLab',
    description: `Five published tiers with a free plan and ${purchasablePlans.length} paid plans billed monthly or annually in USD. Annual totals and per-tier quotas are listed in full.`,
    jsonLd: [organizationLd, softwareApplicationLd]
  },
  {
    path: '/about',
    title: 'About — CatalystLab',
    description: `CatalystLab (${ENTITY_NAME}) builds measurement tooling for web health, security posture and AI readiness.`,
    jsonLd: [organizationLd, { '@type': 'AboutPage', url: canonicalUrlFor('/about') }]
  },
  {
    path: '/contact',
    title: 'Contact — CatalystLab',
    description: `Contact CatalystLab by email: ${SUPPORT_MAILBOX} for product support and ${LEGAL_MAILBOX} for legal and privacy requests.`,
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
    title: 'Engineering & Research Blog — CatalystLab',
    description: 'Research notes on Core Web Vitals, DOM cost, AI crawler policy, structured data and sustainable web engineering.',
    jsonLd: [organizationLd, { '@type': 'CollectionPage', url: canonicalUrlFor('/blogs') }]
  },
  {
    path: '/compare',
    title: 'Compare Domains — CatalystLab',
    description: 'Run a side-by-side telemetry comparison of two domains and see the measured differences in health, latency, carbon and AI readiness.',
    jsonLd: [organizationLd, { '@type': 'WebPage', url: canonicalUrlFor('/compare') }]
  },
  {
    path: '/methodology',
    title: 'Methodology — CatalystLab',
    description: 'How CatalystLab measures: engine inputs, scoring weights, thresholds, and what is measured versus estimated.',
    jsonLd: [organizationLd, { '@type': 'TechArticle', headline: 'CatalystLab Measurement Methodology', url: canonicalUrlFor('/methodology') }]
  },
  {
    path: '/security',
    title: 'Security & Trust — CatalystLab',
    description: 'Vulnerability disclosure, subprocessors, data minimisation and the controls behind the telemetry platform.',
    jsonLd: [organizationLd, { '@type': 'WebPage', url: canonicalUrlFor('/security') }]
  },
  {
    path: '/services',
    title: 'Services — CatalystLab',
    description: 'Telemetry audits, migration risk assessment, AI-readiness reviews and continuous monitoring.',
    jsonLd: [organizationLd, { '@type': 'WebPage', url: canonicalUrlFor('/services') }]
  },
  {
    path: '/products',
    title: 'Products — CatalystLab',
    description: 'The CatalystLab product family: diagnostic engines, master audit orchestration, monitoring and the developer API.',
    jsonLd: [organizationLd, softwareApplicationLd]
  },
  {
    path: '/engines',
    title: 'Diagnostic Engines — CatalystLab',
    description: `Eight in-process diagnostic engines covering health, latency, AI readiness, compliance, carbon, migration, repository hygiene and LLMO, probed from ${TOTAL_POPS_COUNT} edge PoPs.`,
    jsonLd: [organizationLd, softwareApplicationLd]
  },
  {
    path: '/integrations',
    title: 'Integrations — CatalystLab',
    description: 'Connect CatalystLab to GitHub webhooks, Slack, Discord, generic HMAC webhooks and email digests.',
    jsonLd: [organizationLd, { '@type': 'WebPage', url: canonicalUrlFor('/integrations') }]
  },
  {
    path: '/api-docs',
    title: 'API Documentation — CatalystLab',
    description: 'REST and SSE endpoints for engine scans, master audits, quota introspection, webhooks and state sync.',
    jsonLd: [organizationLd, { '@type': 'TechArticle', headline: 'CatalystLab API Documentation', url: canonicalUrlFor('/api-docs') }]
  },
  {
    path: '/api-reference',
    title: 'API Reference — CatalystLab',
    description: 'Endpoint-by-endpoint reference: methods, parameters, rate-limit cost in daily units and response schemas.',
    jsonLd: [organizationLd, { '@type': 'TechArticle', headline: 'CatalystLab API Reference', url: canonicalUrlFor('/api-reference') }]
  },
  {
    path: '/playground',
    title: 'API Playground — CatalystLab',
    description: 'Call the CatalystLab API from the browser with your own key and inspect the measured responses.',
    jsonLd: [organizationLd, { '@type': 'WebPage', url: canonicalUrlFor('/playground') }]
  },
  {
    path: '/report',
    title: 'Audit Report — CatalystLab',
    description: 'Open a CatalystLab audit report: measured engine output, scoring breakdown and export options.',
    jsonLd: [organizationLd, { '@type': 'WebPage', url: canonicalUrlFor('/report') }]
  },
  {
    path: '/reports',
    title: 'Audit Reports — CatalystLab',
    description: 'Browse saved CatalystLab audit reports and dossiers.',
    jsonLd: [organizationLd, { '@type': 'CollectionPage', url: canonicalUrlFor('/reports') }]
  },
  {
    path: '/insights',
    title: 'Telemetry Insights — CatalystLab',
    description: 'Aggregate telemetry insights across monitored domains: traffic, health and anomaly trends.',
    jsonLd: [organizationLd, { '@type': 'WebPage', url: canonicalUrlFor('/insights') }]
  },
  {
    path: '/launch-audit',
    title: 'Pre-Launch Audit — CatalystLab',
    description: 'A pre-launch checklist run through the CatalystLab engines before a site goes live.',
    jsonLd: [organizationLd, { '@type': 'WebPage', url: canonicalUrlFor('/launch-audit') }]
  },
  {
    path: '/plugins',
    title: 'Plugins & Extensions — CatalystLab',
    description: 'Extend CatalystLab with plugins for CI, dashboards and notification pipelines.',
    jsonLd: [organizationLd, { '@type': 'WebPage', url: canonicalUrlFor('/plugins') }]
  },
  {
    path: '/docs',
    title: 'Documentation — CatalystLab',
    description: 'Product and engine documentation: architecture, scoring, rate limits, API usage and the security sandbox.',
    jsonLd: [organizationLd, { '@type': 'CollectionPage', url: canonicalUrlFor('/docs') }]
  },
  ...DOC_ROUTES.map(([docPath, title]) => ({
    path: docPath,
    title: `${title} — CatalystLab Docs`,
    description: `${title}: how it works, what it measures, and how to read the output in CatalystLab.`,
    jsonLd: [organizationLd, { '@type': 'TechArticle', headline: title, url: canonicalUrlFor(docPath) }]
  })),
  ...ENGINE_ROUTES.map((engine) => ({
    path: engine.path,
    title: `${engine.name} — CatalystLab`,
    description: engine.description,
    jsonLd: [
      organizationLd,
      { '@type': 'WebPage', url: canonicalUrlFor(engine.path), about: { '@type': 'SoftwareApplication', name: engine.name } }
    ]
  })),
  {
    path: '/privacy',
    title: 'Privacy Policy — CatalystLab',
    description: `How ${ENTITY_NAME} collects, uses, retains and deletes personal data, and how to exercise your rights.`,
    jsonLd: [organizationLd, { '@type': 'WebPage', url: canonicalUrlFor('/privacy') }]
  },
  {
    path: '/terms',
    title: 'Terms of Service — CatalystLab',
    description: `The terms on which ${ENTITY_NAME} provides the CatalystLab platform, including acceptable use, billing and liability.`,
    jsonLd: [organizationLd, { '@type': 'WebPage', url: canonicalUrlFor('/terms') }]
  },
  {
    path: '/cookies',
    title: 'Cookie Policy — CatalystLab',
    description: 'What CatalystLab stores in localStorage and Firebase Auth, and why. No third-party advertising identifiers.',
    jsonLd: [organizationLd, { '@type': 'WebPage', url: canonicalUrlFor('/cookies') }]
  },
  {
    path: '/refund',
    title: 'Refund Policy — CatalystLab',
    description: 'Refund windows (7 days monthly, 14 days annual), acknowledgement and processing times, and what is not refundable.',
    jsonLd: [organizationLd, { '@type': 'WebPage', url: canonicalUrlFor('/refund') }]
  },
  {
    path: '/legal',
    title: 'Legal — CatalystLab',
    description: `Legal information for ${ENTITY_NAME}: terms, privacy, cookies, refunds and the monitored legal mailbox.`,
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
  ['/reset-password', 'Reset Password']
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

function renderRoute(template: string, meta: RouteMeta): string {
  const canonical = canonicalUrlFor(meta.path);
  const robots = meta.robots ?? robotsDirectiveFor(meta.path);
  let html = template;

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
  const jsonLdBlock =
    meta.jsonLd && meta.jsonLd.length
      ? `<script type="application/ld+json">\n    ${JSON.stringify(
          { '@context': 'https://schema.org', '@graph': meta.jsonLd },
          null,
          2
        ).replace(/\n/g, '\n    ')}\n    </script>`
      : '';
  if (/<script type="application\/ld\+json">[\s\S]*?<\/script>/.test(html)) {
    html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, jsonLdBlock);
  } else if (jsonLdBlock) {
    html = html.replace('</head>', `    ${jsonLdBlock}\n  </head>`);
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

  for (const meta of routes) {
    if (spaRoutes.length && !spaRoutes.includes(meta.path)) {
      missing.push(meta.path);
      continue;
    }
    written.push(writeRoute(meta.path, renderRoute(template, meta)));
  }

  // noindex shells for application and authentication surfaces (D11)
  const appShells: string[] = [];
  for (const [routePath, label] of APP_SHELL_ROUTES) {
    if (spaRoutes.length && !spaRoutes.includes(routePath)) continue;
    const title = `${label} — CatalystLab`;
    const html = renderRoute(template, {
      path: routePath,
      title,
      description: 'Application surface. Sign in to use this part of CatalystLab; it is not part of the public index.'
    });
    written.push(writeRoute(routePath, html));
    appShells.push(routePath);
  }

  // 404 shell: served with a real 404 status by the production static handler.
  const notFound = renderRoute(template, {
    path: '/404',
    title: 'Page not found — CatalystLab',
    description: 'That page does not exist on CatalystLab. Use the navigation or search to find what you need.',
    robots: 'noindex, nofollow'
  });
  writeFileSync(path.join(DIST, '404.html'), notFound);

  // Sitemap generated from the same table, so it can never list a route that
  // is noindex or missing from the router (D11/D14).
  const today = new Date().toISOString().split('T')[0];
  const sitemapRoutes = routes.filter(
    (route) => !missing.includes(route.path) && !isAppRoute(route.path) && !isAuthRoute(route.path)
  );
  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...sitemapRoutes.flatMap((route) => [
      '  <url>',
      `    <loc>${canonicalUrlFor(route.path)}</loc>`,
      `    <lastmod>${today}</lastmod>`,
      `    <changefreq>${route.path === '/' ? 'daily' : 'weekly'}</changefreq>`,
      `    <priority>${route.path === '/' ? '1.0' : route.path.startsWith('/docs') ? '0.6' : '0.8'}</priority>`,
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
        prerendered: routes.map((route) => route.path).filter((routePath) => !missing.includes(routePath)),
        sitemap: sitemapRoutes.map((route) => route.path),
        appRoutes: appShells,
        dynamicRoutes,
        spaRoutes
      },
      null,
      2
    )
  );

  const indexable = routes.filter((route) => !isAppRoute(route.path) && !isAuthRoute(route.path)).length;

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
