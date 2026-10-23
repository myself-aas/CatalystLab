/**
 * SEO metadata for the seeded blog posts (owner decision D11 follow-up).
 *
 * `src/data/engineBlogs.ts` holds the full post bodies but imports image
 * modules, so the prerender script (plain Node, no Vite asset pipeline)
 * cannot read it. This module carries only the fields the head, the sitemap
 * and the static document need, and `src/tests/unit/blogSeo.test.ts` fails if
 * it drifts from the post data.
 *
 * `publishedAt` is fixed rather than derived from `Date.now()`, so the
 * sitemap `<lastmod>`, the schema.org `datePublished` and the visible byline
 * cannot disagree.
 */
export interface BlogSeoEntry {
  slug: string;
  /** The post's own title, used as the H1. */
  title: string;
  /** Search-result title: the H1 trimmed to the 60-character budget. */
  seoTitle: string;
  excerpt: string;
  author: string;
  category: string;
  /** ISO 8601 timestamp used for schema.org `datePublished`. */
  publishedAt: string;
  /** Calendar date used for `<lastmod>` in the sitemap. */
  publishedDate: string;
}

export const BLOG_SEO: BlogSeoEntry[] = [
  {
    slug: 'optimizing-dom-depth-render-blocking-nextjs',
    title: 'Optimizing DOM Depth and Eliminating Render-Blocking Bottlenecks in Next.js',
    seoTitle: 'DOM Depth and Render-Blocking in Next.js | CatalystLab',
    excerpt: 'Why deep DOM hierarchies severely degrade layout recalculation and mobile INP, and architectural strategies to flatten nested component trees.',
    author: 'Alex Rivera',
    category: 'Core Performance',
    publishedAt: '2026-10-19T09:00:00.000Z',
    publishedDate: '2026-10-19'
  },
  {
    slug: 'decoupling-critical-css-font-preloading',
    title: 'Decoupling Critical CSS and Preloading Key Display Fonts for Sub-Second LCP',
    seoTitle: 'Critical CSS and Font Preloading for Fast LCP',
    excerpt: 'How inlining critical path CSS while asynchronous loading secondary styles reduces Largest Contentful Paint to under 800ms.',
    author: 'Maria Angelica',
    category: 'Core Performance',
    publishedAt: '2026-10-15T09:00:00.000Z',
    publishedDate: '2026-10-15'
  },
  {
    slug: 'decimating-ttfb-edge-workers',
    title: 'Decimating TTFB with Multi-Region Edge Workers & Smart Anycast Routing',
    seoTitle: 'Cutting TTFB With Edge Workers | CatalystLab',
    excerpt: 'A deep-dive into synthetic edge latency telemetry across Tokyo, Frankfurt, Virginia, and Sydney points of presence.',
    author: 'Elena Rostova',
    category: 'Edge Latency',
    publishedAt: '2026-10-16T09:00:00.000Z',
    publishedDate: '2026-10-16'
  },
  {
    slug: 'llmstxt-standard-autonomous-ai-crawlers',
    title: 'The /llms.txt Standard: Preparing Knowledge Bases for Autonomous AI Crawlers',
    seoTitle: 'The llms.txt Standard for AI Crawlers | CatalystLab',
    excerpt: 'How to structure root documentation manifests and robots.txt policies to ensure seamless vector ingestion by frontier AI models.',
    author: 'Marcus Chen',
    category: 'AI & LLMO',
    publishedAt: '2026-10-17T09:00:00.000Z',
    publishedDate: '2026-10-17'
  },
  {
    slug: 'automating-git-secops-hygiene',
    title: 'Automating Git Repository SecOps & Hygiene Verification in Modern CI/CD',
    seoTitle: 'Git SecOps and Repository Hygiene in CI | CatalystLab',
    excerpt: 'How automated branch protection, license checks, and SECURITY.md audits prevent catastrophic supply-chain leaks.',
    author: 'Dr. Aris Thorne',
    category: 'SecOps',
    publishedAt: '2026-10-14T09:00:00.000Z',
    publishedDate: '2026-10-14'
  },
  {
    slug: 'sustainable-web-engineering-carbon-reduction',
    title: 'Sustainable Web Engineering: Reducing Digital Carbon Footprints with Modern Formats',
    seoTitle: 'Cutting Website Carbon With Modern Formats',
    excerpt: 'Applying the Sustainable Web Design (SWD) model, choosing 100% renewable datacenters, and optimizing transfer weights.',
    author: 'Sofia Lindqvist',
    category: 'Sustainability',
    publishedAt: '2026-10-13T09:00:00.000Z',
    publishedDate: '2026-10-13'
  },
  {
    slug: 'owasp-security-headers-gdpr-governance',
    title: 'OWASP Hardened Security Headers & GDPR Cookie Governance Architecture',
    seoTitle: 'OWASP Headers and GDPR Cookie Governance',
    excerpt: 'Complete production implementation of Strict-Transport-Security, Content-Security-Policy nonces, and privacy consent tiers.',
    author: 'Elena Rostova',
    category: 'Compliance & Security',
    publishedAt: '2026-10-12T09:00:00.000Z',
    publishedDate: '2026-10-12'
  },
  {
    slug: 'zero-downtime-platform-migration-seo-parity',
    title: 'Zero-Downtime Platform Migration: 301 Redirects and SEO Canonical Parity',
    seoTitle: 'Zero-Downtime Migration and SEO Parity',
    excerpt: 'Architectural blueprint for transitioning legacy CMS systems to modern decoupled edge frameworks without traffic loss.',
    author: 'Alex Rivera',
    category: 'Architecture',
    publishedAt: '2026-10-10T09:00:00.000Z',
    publishedDate: '2026-10-10'
  },
  {
    slug: 'generative-engine-optimization-llmo-citations',
    title: 'Generative Engine Optimization (LLMO): Mastering Citations in Perplexity and SearchGPT',
    seoTitle: 'GEO and LLMO: Earning Citations in AI Search',
    excerpt: 'How to structure Schema.org entity graphs, factual densities, and semantic hierarchies to dominate answer engine summaries.',
    author: 'Marcus Chen',
    category: 'AI Search',
    publishedAt: '2026-10-18T09:00:00.000Z',
    publishedDate: '2026-10-18'
  },
  {
    slug: 'modern-website-health-ai-search',
    title: 'The Modern Anatomy of Website Health in the Era of AI Search',
    seoTitle: 'Website Health in the Age of AI Search',
    excerpt: 'Why traditional SEO is yielding ground to structured RAG indexing and how llms.txt standardizes generative search ingestion.',
    author: 'Dr. Aris Thorne',
    category: 'AI & LLMO',
    publishedAt: '2026-10-17T09:00:00.000Z',
    publishedDate: '2026-10-17'
  },
];

export const BLOG_SEO_BY_SLUG: Record<string, BlogSeoEntry> = Object.fromEntries(
  BLOG_SEO.map((entry) => [entry.slug, entry])
);

/** Every static blog URL the build writes, newest first. */
export const BLOG_PATHS: string[] = BLOG_SEO.map((entry) => `/blogs/${entry.slug}`);

export function isKnownBlogSlug(slug: string): boolean {
  return Object.prototype.hasOwnProperty.call(BLOG_SEO_BY_SLUG, slug);
}
