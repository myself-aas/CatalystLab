/**
 * Sitemap sections (2026-10-23).
 *
 * The site used to publish one flat `sitemap.xml` for 53 URLs of four
 * different kinds: marketing pages, engine landing pages, documentation and
 * blog posts. That works, but it hides the reporting people actually use:
 * "did the ten new posts get indexed" cannot be answered from one undifferentiated
 * file, and a crawl error in the docs set is indistinguishable from one in the
 * pricing pages.
 *
 * The build now emits one sitemap per section plus a sitemap index at
 * `/sitemap.xml`. The index is what `robots.txt` points at, so nothing external
 * has to change. Sections are declared here, in one place, because three
 * consumers need the same answer: `scripts/prerender.ts` (writes the files),
 * `src/tests/unit/sitemapSections.test.ts` (asserts full coverage and no
 * duplicates) and `dist/routes.json` (reports what was written).
 *
 * Adding a page family means adding a section here, not editing a string in
 * the prerender.
 */
export type SitemapSectionId = 'core' | 'engines' | 'docs' | 'blog';

export interface SitemapSection {
  id: SitemapSectionId;
  /** Public path of the section's sitemap file. */
  path: string;
  /** Human label, used in `routes.json` and the build log. */
  label: string;
  /** The index page for the family, if it has one. */
  hub?: string;
}

export const SITEMAP_SECTIONS: readonly SitemapSection[] = [
  { id: 'core', path: '/sitemap-core.xml', label: 'Marketing and legal pages' },
  { id: 'engines', path: '/sitemap-engines.xml', label: 'Engine landing pages', hub: '/engines' },
  { id: 'docs', path: '/sitemap-docs.xml', label: 'Documentation', hub: '/docs' },
  { id: 'blog', path: '/sitemap-blog.xml', label: 'Blog posts', hub: '/blogs' }
] as const;

/** Path of the sitemap index that lists the section files. */
export const SITEMAP_INDEX_PATH = '/sitemap.xml';

/**
 * Engine landing pages. Kept as literals rather than imported from
 * `src/data/engineSeo.ts` so this module stays dependency-free and usable from
 * plain Node; the unit test asserts the two lists agree.
 */
const ENGINE_PATHS = new Set([
  '/health',
  '/latency',
  '/ai-readiness',
  '/compliance',
  '/eco-audit',
  '/migration',
  '/repo-scanner',
  '/llmo',
  '/master-audit'
]);

export function sitemapSectionFor(rawPath: string): SitemapSectionId {
  const path = rawPath.replace(/\/+$/, '') || '/';
  if (path === '/blogs' || path.startsWith('/blogs/')) return 'blog';
  if (path === '/docs' || path.startsWith('/docs/')) return 'docs';
  if (ENGINE_PATHS.has(path)) return 'engines';
  return 'core';
}

export function sitemapPathForSection(id: SitemapSectionId): string {
  const section = SITEMAP_SECTIONS.find((candidate) => candidate.id === id);
  if (!section) throw new Error(`[sitemap] unknown section: ${id}`);
  return section.path;
}

/**
 * Crawl hint per section; the home page is the only daily URL.
 *
 * Not written into the XML any more (2026-10-23): Google documents that it
 * ignores `changefreq` and `priority`, so emitting them implied control the
 * file does not have. Kept as a helper for `routes.json` consumers and tests.
 */
export function changefreqFor(rawPath: string): 'daily' | 'weekly' {
  const path = rawPath.replace(/\/+$/, '') || '/';
  return path === '/' ? 'daily' : 'weekly';
}

export function priorityFor(rawPath: string): string {
  const path = rawPath.replace(/\/+$/, '') || '/';
  if (path === '/') return '1.0';
  switch (sitemapSectionFor(path)) {
    case 'engines':
      return '0.9';
    case 'docs':
      return '0.6';
    case 'blog':
      return path === '/blogs' ? '0.8' : '0.7';
    default:
      return '0.8';
  }
}
