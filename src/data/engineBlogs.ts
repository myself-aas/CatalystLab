import type { BlogPost, EngineType } from '../types';
import authorAvatar1 from '../assets/images/avatar-1.jpg';
import authorAvatar2 from '../assets/images/avatar-2.jpg';
import { PLATE } from '../lib/media/plates';
import { BLOG_SEO_BY_SLUG } from './blogSeo';
import { BLOG_CONTENT } from './blogContent';
// Local covers: the Pexels photo 3861958 these two posts used answers 503 (D17).


export const ENGINE_SEEDED_BLOGS: Record<string, BlogPost[]> = {
  health: [
    {
      id: 'blog-health-1',
      title: 'Optimizing DOM Depth and Eliminating Render-Blocking Bottlenecks in Next.js',
      slug: 'optimizing-dom-depth-render-blocking-nextjs',
      excerpt: 'Why deep DOM hierarchies severely degrade layout recalculation and mobile INP, and architectural strategies to flatten nested component trees.',
      coverImage: PLATE.api,
      authorAvatar: authorAvatar1,
      featured: true,
      content: BLOG_CONTENT['optimizing-dom-depth-render-blocking-nextjs'],
      category: 'Core Performance',
      tags: ['DOM', 'Core Web Vitals', 'LCP', 'Next.js', 'Performance'],
      authorName: 'Alex Rivera',
      authorEmail: 'alex.rivera@catalystlab.tech',
      status: 'published',
      readTime: '5 min read',
      createdAt: Date.parse(BLOG_SEO_BY_SLUG['optimizing-dom-depth-render-blocking-nextjs'].publishedAt),
      updatedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
      views: 1240
    },
    {
      id: 'blog-health-2',
      title: 'Decoupling Critical CSS and Preloading Key Display Fonts for Sub-Second LCP',
      slug: 'decoupling-critical-css-font-preloading',
      excerpt: 'How inlining critical path CSS while asynchronous loading secondary styles reduces Largest Contentful Paint to under 800ms.',
      coverImage: PLATE.aboutHero,
      authorAvatar: authorAvatar2,
      content: BLOG_CONTENT['decoupling-critical-css-font-preloading'],
      category: 'Core Performance',
      tags: ['LCP', 'CSS', 'Fonts', 'Web Vitals'],
      authorName: 'Maria Angelica',
      authorEmail: 'maria@catalystlab.tech',
      status: 'published',
      readTime: '4 min read',
      createdAt: Date.parse(BLOG_SEO_BY_SLUG['decoupling-critical-css-font-preloading'].publishedAt),
      updatedAt: Date.now() - 6 * 24 * 60 * 60 * 1000,
      views: 890
    }
  ],

  latency: [
    {
      id: 'blog-latency-1',
      title: 'Decimating TTFB with Multi-Region Edge Workers & Smart Anycast Routing',
      slug: 'decimating-ttfb-edge-workers',
      excerpt: 'A deep-dive into synthetic edge latency telemetry across Tokyo, Frankfurt, Virginia, and Sydney points of presence.',
      coverImage: PLATE.aboutHero,
      authorAvatar: authorAvatar1,
      featured: true,
      content: BLOG_CONTENT['decimating-ttfb-edge-workers'],
      category: 'Edge Latency',
      tags: ['Edge', 'TTFB', 'Performance', 'CDN', 'Infrastructure'],
      authorName: 'Elena Rostova',
      authorEmail: 'elena.rostova@catalystlab.tech',
      status: 'published',
      readTime: '8 min read',
      createdAt: Date.parse(BLOG_SEO_BY_SLUG['decimating-ttfb-edge-workers'].publishedAt),
      updatedAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
      views: 1540
    }
  ],

  ai_ready: [
    {
      id: 'blog-ai-ready-1',
      title: 'The /llms.txt Standard: Preparing Knowledge Bases for Autonomous AI Crawlers',
      slug: 'llmstxt-standard-autonomous-ai-crawlers',
      excerpt: 'How to structure root documentation manifests and robots.txt policies to ensure seamless vector ingestion by frontier AI models.',
      coverImage: PLATE.products,
      authorAvatar: authorAvatar1,
      featured: true,
      content: BLOG_CONTENT['llmstxt-standard-autonomous-ai-crawlers'],
      category: 'AI & LLMO',
      tags: ['llms.txt', 'AI Readiness', 'RAG', 'GPTBot', 'ClaudeBot'],
      authorName: 'Marcus Chen',
      authorEmail: 'marcus.chen@catalystlab.tech',
      status: 'published',
      readTime: '6 min read',
      createdAt: Date.parse(BLOG_SEO_BY_SLUG['llmstxt-standard-autonomous-ai-crawlers'].publishedAt),
      updatedAt: Date.now() - 4 * 24 * 60 * 60 * 1000,
      views: 2120
    }
  ],

  repo: [
    {
      id: 'blog-repo-1',
      title: 'Automating Git Repository SecOps & Hygiene Verification in Modern CI/CD',
      slug: 'automating-git-secops-hygiene',
      excerpt: 'How automated branch protection, license checks, and SECURITY.md audits prevent catastrophic supply-chain leaks.',
      coverImage: PLATE.blogPerformance,
      authorAvatar: authorAvatar1,
      content: BLOG_CONTENT['automating-git-secops-hygiene'],
      category: 'SecOps',
      tags: ['Git', 'SecOps', 'Security', 'DevSecOps', 'CI/CD'],
      authorName: 'Dr. Aris Thorne',
      authorEmail: 'aris.thorne@catalystlab.tech',
      status: 'published',
      readTime: '5 min read',
      createdAt: Date.parse(BLOG_SEO_BY_SLUG['automating-git-secops-hygiene'].publishedAt),
      updatedAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
      views: 940
    }
  ],

  eco: [
    {
      id: 'blog-eco-1',
      title: 'Sustainable Web Engineering: Reducing Digital Carbon Footprints with Modern Formats',
      slug: 'sustainable-web-engineering-carbon-reduction',
      excerpt: 'Applying the Sustainable Web Design (SWD) model, choosing 100% renewable datacenters, and optimizing transfer weights.',
      coverImage: PLATE.blogPerformance,
      authorAvatar: authorAvatar2,
      content: BLOG_CONTENT['sustainable-web-engineering-carbon-reduction'],
      category: 'Sustainability',
      tags: ['Green Web', 'CO2 Reduction', 'AVIF', 'Eco', 'ESG'],
      authorName: 'Sofia Lindqvist',
      authorEmail: 'sofia.lindqvist@catalystlab.tech',
      status: 'published',
      readTime: '6 min read',
      createdAt: Date.parse(BLOG_SEO_BY_SLUG['sustainable-web-engineering-carbon-reduction'].publishedAt),
      updatedAt: Date.now() - 8 * 24 * 60 * 60 * 1000,
      views: 1100
    }
  ],

  compliance: [
    {
      id: 'blog-compliance-1',
      title: 'OWASP Hardened Security Headers & GDPR Cookie Governance Architecture',
      slug: 'owasp-security-headers-gdpr-governance',
      excerpt: 'Complete production implementation of Strict-Transport-Security, Content-Security-Policy nonces, and privacy consent tiers.',
      coverImage: PLATE.catalystBg2,
      authorAvatar: authorAvatar1,
      content: BLOG_CONTENT['owasp-security-headers-gdpr-governance'],
      category: 'Compliance & Security',
      tags: ['OWASP', 'HSTS', 'CSP', 'GDPR', 'CCPA', 'Security'],
      authorName: 'Elena Rostova',
      authorEmail: 'elena.rostova@catalystlab.tech',
      status: 'published',
      readTime: '7 min read',
      createdAt: Date.parse(BLOG_SEO_BY_SLUG['owasp-security-headers-gdpr-governance'].publishedAt),
      updatedAt: Date.now() - 9 * 24 * 60 * 60 * 1000,
      views: 1350
    }
  ],

  migration: [
    {
      id: 'blog-migration-1',
      title: 'Zero-Downtime Platform Migration: 301 Redirects and SEO Canonical Parity',
      slug: 'zero-downtime-platform-migration-seo-parity',
      excerpt: 'Architectural blueprint for transitioning legacy CMS systems to modern decoupled edge frameworks without traffic loss.',
      coverImage: PLATE.heroNetwork,
      authorAvatar: authorAvatar2,
      content: BLOG_CONTENT['zero-downtime-platform-migration-seo-parity'],
      category: 'Architecture',
      tags: ['Migration', '301 Redirects', 'SEO', 'Cloud Portability', 'DevOps'],
      authorName: 'Alex Rivera',
      authorEmail: 'alex.rivera@catalystlab.tech',
      status: 'published',
      readTime: '6 min read',
      createdAt: Date.parse(BLOG_SEO_BY_SLUG['zero-downtime-platform-migration-seo-parity'].publishedAt),
      updatedAt: Date.now() - 11 * 24 * 60 * 60 * 1000,
      views: 980
    }
  ],

  llmo: [
    {
      id: 'blog-llmo-1',
      title: 'Generative Engine Optimization (LLMO): Mastering Citations in Perplexity and SearchGPT',
      slug: 'generative-engine-optimization-llmo-citations',
      excerpt: 'How to structure Schema.org entity graphs, factual densities, and semantic hierarchies to dominate answer engine summaries.',
      coverImage: PLATE.products,
      authorAvatar: authorAvatar1,
      featured: true,
      content: BLOG_CONTENT['generative-engine-optimization-llmo-citations'],
      category: 'AI Search',
      tags: ['LLMO', 'SearchGPT', 'Perplexity', 'JSON-LD', 'Semantic Web'],
      authorName: 'Marcus Chen',
      authorEmail: 'marcus.chen@catalystlab.tech',
      status: 'published',
      readTime: '6 min read',
      createdAt: Date.parse(BLOG_SEO_BY_SLUG['generative-engine-optimization-llmo-citations'].publishedAt),
      updatedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
      views: 1890
    }
  ],

  'master-audit': [
    {
      id: 'blog-master-1',
      title: 'The Modern Anatomy of Website Health in the Era of AI Search',
      slug: 'modern-website-health-ai-search',
      excerpt: 'Why traditional SEO is yielding ground to structured RAG indexing and how llms.txt standardizes generative search ingestion.',
      coverImage: PLATE.pricing,
      authorAvatar: authorAvatar1,
      featured: true,
      content: BLOG_CONTENT['modern-website-health-ai-search'],
      category: 'AI & LLMO',
      tags: ['LLMO', 'AI Search', 'RAG', 'llms.txt', 'SEO'],
      authorName: 'Dr. Aris Thorne',
      authorEmail: 'aris.thorne@catalystlab.tech',
      status: 'published',
      readTime: '6 min read',
      createdAt: Date.parse(BLOG_SEO_BY_SLUG['modern-website-health-ai-search'].publishedAt),
      updatedAt: Date.now() - 4 * 24 * 60 * 60 * 1000,
      views: 2400
    }
  ]
};

export const getBlogsForEngine = (engineType: EngineType): BlogPost[] => {
  return ENGINE_SEEDED_BLOGS[engineType] || ENGINE_SEEDED_BLOGS.health;
};

/**
 * Every seeded post, flattened by slug (2026-10-23).
 *
 * The prerender writes these bodies into the delivered HTML. The page uses the
 * same record when Firestore is slow, empty or offline, so the article a client
 * renders is the article a crawler was served instead of two different texts.
 */
export const SEEDED_POSTS_BY_SLUG: Record<string, BlogPost> = Object.fromEntries(
  Object.values(ENGINE_SEEDED_BLOGS)
    .flat()
    .map((post) => [post.slug, post])
);

export const getSeededBlogPost = (slug: string): BlogPost | undefined => SEEDED_POSTS_BY_SLUG[slug];
