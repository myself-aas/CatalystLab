/**
 * Permanent 301s for paths that render a page we already publish elsewhere
 * (SEO audit 2026-10-23, issue 5).
 *
 * Several router entries mount the same component under two or three paths, and
 * the prerender step gave every one of them its own title, description and
 * self-canonical. That published 16 near-identical documents competing for the
 * same query. The map below names the survivor for each group; `prerender.ts`
 * stops writing the alias shells, `server.ts` answers them with a 301, and
 * `public/_redirects` mirrors the same list for Cloudflare Pages.
 *
 * Rules:
 *   - a key must not also be a value (no chains);
 *   - every value must be a route that still exists in `src/App.tsx`;
 *   - `src/tests/unit/routeAliases.test.ts` asserts both, plus parity with
 *     `public/_redirects`.
 */
export const ROUTE_ALIASES: Readonly<Record<string, string>> = {
  // DiagnosticHubPage is mounted at three paths; `/engines` is the one the
  // navigation, the footer and the docs sidebar already link to.
  '/hub': '/engines',
  '/services': '/engines',

  // ProductsPage is mounted at three paths; `/products` survives.
  '/plugins': '/products',
  '/integrations': '/products',

  // BlogsPage is mounted at two paths.
  '/insights': '/blogs',

  // ReportsDirectoryPage is mounted at two paths.
  '/report': '/reports',

  // /methodology renders AboutPage, so it is the same document as /about.
  '/methodology': '/about',

  // ApiDocsPage is mounted at /api-docs, /api-reference and /developer/api;
  // only the first is prerendered, which left the other two answering with the
  // home shell.
  '/developer/api': '/api-docs',
  '/api-reference': '/api-docs',

  // The docs pair for each engine. The engine-named slug is the one the docs
  // sidebar links to; the generic alias 301s to it.
  '/docs/health': '/docs/vitalzyme',
  '/docs/latency': '/docs/edgevmax',
  '/docs/eco-audit': '/docs/ecoholo',
  '/docs/migration': '/docs/synthshift',
  '/docs/repo-scanner': '/docs/gitlygase',
  '/docs/llmo': '/docs/allostersearch',
  '/docs/compliance': '/docs/riskprotease',
  '/docs/ai-readiness': '/docs/llm-kinase',
  '/docs/overview': '/docs',
  '/docs/orchestrator': '/docs/master-audit',
  '/docs/devops': '/docs/cicd',
  '/docs/api-reference': '/docs/api',

  // Auth surfaces: one path each, for links and for the prerendered shells.
  '/signin': '/login',
  '/signup': '/register'
};

/** Prefix aliases that need a splat rather than an exact match. */
export const SPLAT_ALIASES: Readonly<Record<string, string>> = {
  '/blog': '/blogs'
};

export function aliasTargetFor(rawPath: string): string | undefined {
  const path = rawPath.split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';
  return ROUTE_ALIASES[path];
}

/** `/blog/<slug>` -> `/blogs/<slug>`, everything else untouched. */
export function splatAliasFor(rawPath: string): string | undefined {
  const path = rawPath.split('?')[0].split('#')[0];
  for (const [from, to] of Object.entries(SPLAT_ALIASES)) {
    if (path === from) return to;
    if (path.startsWith(`${from}/`)) return `${to}${path.slice(from.length)}`;
  }
  return undefined;
}
