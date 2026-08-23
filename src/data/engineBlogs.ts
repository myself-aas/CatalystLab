import type { BlogPost, EngineType } from '../types';

export const ENGINE_SEEDED_BLOGS: Record<string, BlogPost[]> = {
  health: [
    {
      id: 'blog-health-1',
      title: 'Optimizing DOM Depth and Eliminating Render-Blocking Bottlenecks in Next.js',
      slug: 'optimizing-dom-depth-render-blocking-nextjs',
      excerpt: 'Why deep DOM hierarchies severely degrade layout recalculation and mobile INP, and architectural strategies to flatten nested component trees.',
      coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1200',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      featured: true,
      content: `## The Hidden Cost of Deep DOM Hierarchies

Modern component-driven frameworks like React and Next.js make it easy to wrap elements in multiple layout containers, provider contexts, and styling wrappers. However, when DOM depth exceeds 32 levels or total nodes exceed 1,500, browser rendering engines suffer severe performance bottlenecks.

### Why DOM Depth Degrades Core Web Vitals
1. **Interaction to Next Paint (INP)**: Layout recalculations scale super-linearly with DOM depth. Every dynamic DOM mutation triggers expensive style recalculation passes.
2. **Cumulative Layout Shift (CLS)**: Unbounded child containers without explicit dimensions cause unpredictable reflow shifts during hydration.
3. **Memory Footprint on Low-End Mobile Devices**: Each DOM node retains associated V8 JavaScript wrappers and style recalculation trees.

\`\`\`tsx
// Before: Deep, redundant container nesting
export const UserCard = ({ user }) => (
  <div className="card-wrapper">
    <div className="card-inner">
      <div className="card-content">
        <div className="avatar-container">
          <img src={user.avatar} alt={user.name} />
        </div>
        <div className="details-container">
          <h3>{user.name}</h3>
        </div>
      </div>
    </div>
  </div>
);

// After: Flattened semantic HTML with modern CSS Grid/Flexbox
export const UserCard = ({ user }) => (
  <article className="grid grid-cols-[auto_1fr] items-center gap-3 p-4">
    <img src={user.avatar} alt={user.name} className="h-10 w-10 rounded-full" />
    <h3 className="text-sm font-bold">{user.name}</h3>
  </article>
);
\`\`\`

### 3 Actionable Strategies to Remediate DOM Bloat
- **Audit Component Trees**: Use the React DevTools Profiler to identify wrapper components that emit unnecessary \`<div>\` tags.
- **Implement CSS Subgrid and Flexbox**: Eliminate intermediate structural wrappers by adopting modern CSS layout features.
- **Virtualize Long Lists**: Use \`@tanstack/react-virtual\` for feeds with more than 50 repeating elements.`,
      category: 'Core Performance',
      tags: ['DOM', 'Core Web Vitals', 'LCP', 'Next.js', 'Performance'],
      authorName: 'Alex Rivera',
      authorEmail: 'alex.rivera@catalystlab.tech',
      status: 'published',
      readTime: '5 min read',
      createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
      updatedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
      views: 1240
    },
    {
      id: 'blog-health-2',
      title: 'Decoupling Critical CSS and Preloading Key Display Fonts for Sub-Second LCP',
      slug: 'decoupling-critical-css-font-preloading',
      excerpt: 'How inlining critical path CSS while asynchronous loading secondary styles reduces Largest Contentful Paint to under 800ms.',
      coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200',
      authorAvatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=200',
      content: `## Achieving Sub-Second Largest Contentful Paint (LCP)

Largest Contentful Paint measures when the main visual content of a webpage is rendered. For text-heavy hero sections, custom display fonts and blocking stylesheets are the primary contributors to delayed rendering.

### The Font Display Strategy
Using \`font-display: swap\` prevents invisible text flashes (FOIT), while preloading with \`crossorigin\` ensures the font file begins downloading during the initial HTML handshake.

\`\`\`html
<!-- Critical path font preloading in document <head> -->
<link
  rel="preload"
  href="/fonts/inter-var.woff2"
  as="font"
  type="font/woff2"
  crossorigin="anonymous"
/>
\`\`\``,
      category: 'Core Performance',
      tags: ['LCP', 'CSS', 'Fonts', 'Web Vitals'],
      authorName: 'Maria Angelica',
      authorEmail: 'maria@catalystlab.tech',
      status: 'published',
      readTime: '4 min read',
      createdAt: Date.now() - 6 * 24 * 60 * 60 * 1000,
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
      coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200',
      authorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
      featured: true,
      content: `## The Geography of Milliseconds

Time To First Byte (TTFB) is the single highest predictor of bounce rates for modern interactive web applications. When packets must traverse trans-Pacific fiber lines, round-trip latency often exceeds 220ms before JavaScript execution even begins.

### Global Radar Telemetry Results Across 6 Regions:
- **US East (Virginia)**: ~54ms
- **US West (Oregon)**: ~82ms
- **EU Central (Frankfurt)**: ~108ms
- **AP Northeast (Tokyo)**: ~172ms
- **SA East (São Paulo)**: ~198ms
- **AP Southeast (Sydney)**: ~215ms

### 3 Pillars of Sub-100ms Edge Latency:
1. **Edge HTML Generation**: Compute personalized content directly at the CDN point of presence using Cloudflare Workers or Vercel Edge Middleware.
2. **0-RTT TLS 1.3 Session Resumption**: Returning visitors bypass cryptographic roundtrips entirely.
3. **HTTP/3 QUIC Multiplexing**: Eliminate head-of-line packet blocking over unstable mobile connections.`,
      category: 'Edge Latency',
      tags: ['Edge', 'TTFB', 'Performance', 'CDN', 'Infrastructure'],
      authorName: 'Elena Rostova',
      authorEmail: 'elena.rostova@catalystlab.tech',
      status: 'published',
      readTime: '8 min read',
      createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
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
      coverImage: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=1200',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      featured: true,
      content: `## The Paradigm Shift: From Keywords to Vector Embeddings

In 2026, web crawlers are no longer simple heuristic indexers—they are autonomous LLM retrieval agents powering Perplexity, ChatGPT Search, and Gemini.

### The 3 Pillars of AI Readiness
1. **The \`/llms.txt\` Standard**: Providing clear markdown directives for AI crawlers drastically minimizes token waste and eliminates synthetic hallucinations.
2. **Schema.org Structured Microdata**: JSON-LD payload graphs establish semantic entity relationships that vector databases can easily parse.
3. **Semantic Purity & Content-to-HTML Ratio**: Sites with over 90% nested DOM boilerplates suffer severe chunking degradation during RAG extraction.

\`\`\`markdown
# Project Overview for AI Agents & Search Engines
> Documentation: https://example.com/docs
> API Endpoint: https://api.example.com/v1

## Primary Knowledge Entities
- Product Architecture: /docs/architecture
- OpenAPI Schema: /openapi.json
- Pricing & Limits: /pricing
\`\`\``,
      category: 'AI & LLMO',
      tags: ['llms.txt', 'AI Readiness', 'RAG', 'GPTBot', 'ClaudeBot'],
      authorName: 'Marcus Chen',
      authorEmail: 'marcus.chen@catalystlab.tech',
      status: 'published',
      readTime: '6 min read',
      createdAt: Date.now() - 4 * 24 * 60 * 60 * 1000,
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
      coverImage: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&q=80&w=1200',
      authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
      content: `## Securing the Modern Software Supply Chain

A high percentage of security breaches begin not in production firewalls, but in misconfigured public repositories with exposed secrets, stale dependencies, and missing vulnerability disclosure policies.

### The 6 Essential Repository Hygiene Checks:
1. **License Declaration**: Mitigates open-source copyright liabilities.
2. **SECURITY.md Policy**: Establishes a responsible vulnerability reporting pipeline.
3. **Branch Protection Rules**: Mandates code reviews and status checks before staging merges.
4. **Automated Secret Scanning**: Pre-commit hooks to block exposed API keys.
5. **Dependency Audit (Dependabot/Snyk)**: Proactive CVE patching.
6. **Code of Conduct & Contributing Guides**: Standardizes OSS maintenance workflows.`,
      category: 'SecOps',
      tags: ['Git', 'SecOps', 'Security', 'DevSecOps', 'CI/CD'],
      authorName: 'Dr. Aris Thorne',
      authorEmail: 'aris.thorne@catalystlab.tech',
      status: 'published',
      readTime: '5 min read',
      createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
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
      coverImage: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=1200',
      authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
      content: `## The Environmental Impact of Cloud Computing

The internet accounts for over 3.7% of global greenhouse gas emissions—exceeding the commercial airline industry. Every kilobyte transmitted across cellular towers and rendered on mobile displays consumes measurable electrical energy.

### The Sustainable Web Design (SWD) Model
The standard SWD formula models energy consumption across four primary segments:
- **Data Centers (15%)**: Compute and storage energy.
- **Networks (14%)**: Transmission across fiber backbones and 5G cellular antennas.
- **End-User Devices (52%)**: CPU/GPU computation and OLED screen rendering.
- **Embodied Energy (19%)**: Hardware manufacturing lifecycle.

### Quick Wins to Cut Page Transfer Carbon by 65%:
- Convert all images to AVIF and WebP with quality 80.
- Strip unused JavaScript polyfills from modern browser targets.
- Enable high-efficiency brotli compression at level 6.`,
      category: 'Sustainability',
      tags: ['Green Web', 'CO2 Reduction', 'AVIF', 'Eco', 'ESG'],
      authorName: 'Sofia Lindqvist',
      authorEmail: 'sofia.lindqvist@catalystlab.tech',
      status: 'published',
      readTime: '6 min read',
      createdAt: Date.now() - 8 * 24 * 60 * 60 * 1000,
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
      coverImage: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=1200',
      authorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
      content: `## Defense-in-Depth for Modern Ingress Points

Web application firewalls are insufficient if individual HTTP responses lack cryptographic defense instructions. Security headers inform the browser how to safely handle cookies, scripts, frames, and TLS negotiations.

### Essential Security Headers Checklist:
1. **Strict-Transport-Security**: \`max-age=63072000; includeSubDomains; preload\` enforces HTTPS exclusively.
2. **X-Content-Type-Options**: \`nosniff\` blocks MIME-sniffing exploits.
3. **X-Frame-Options**: \`DENY\` eradicates clickjacking in hidden iframes.
4. **Content-Security-Policy**: Restricts script execution to approved domains and cryptographic nonces.`,
      category: 'Compliance & Security',
      tags: ['OWASP', 'HSTS', 'CSP', 'GDPR', 'CCPA', 'Security'],
      authorName: 'Elena Rostova',
      authorEmail: 'elena.rostova@catalystlab.tech',
      status: 'published',
      readTime: '7 min read',
      createdAt: Date.now() - 9 * 24 * 60 * 60 * 1000,
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
      coverImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=1200',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      content: `## Migrating Without Losing Organic Authority

Re-platforming from legacy systems like WordPress or Magento to modern edge stacks (Next.js, Remix, Astro) often triggers severe organic traffic drops if redirect mapping and canonical tags are not synchronized.

### Pre-Flight Migration Verification Steps:
1. **Extract Historical Crawl Map**: Audit every URL with existing search impressions.
2. **Verify 301 Status Codes**: Ensure permanent 301 redirects are returned rather than 302 temporary redirects.
3. **Canonical Synchronization**: Verify that all \`rel="canonical"\` links point to the new destination domain without redirect chains.
4. **Database Replication Parity**: Confirm sub-50ms replication lag before cutover.`,
      category: 'Architecture',
      tags: ['Migration', '301 Redirects', 'SEO', 'Cloud Portability', 'DevOps'],
      authorName: 'Alex Rivera',
      authorEmail: 'alex.rivera@catalystlab.tech',
      status: 'published',
      readTime: '6 min read',
      createdAt: Date.now() - 11 * 24 * 60 * 60 * 1000,
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
      coverImage: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&q=80&w=1200',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      featured: true,
      content: `## Winning Citations in Generative Answer Engines

Traditional search engines ranked pages based on backlink counts and keyword densities. Answer engines like Perplexity, ChatGPT Search, and Gemini synthesize responses using multi-source RAG retrieval.

### Strategies for High-Authority Generative Citations:
1. **Entity Graph Cohesion**: Define explicit Schema.org \`TechArticle\`, \`Organization\`, and \`Author\` nodes.
2. **High Factual Density**: Lead every section with direct factual summaries and key metric tables before expanding with long-form prose.
3. **Clean Markdown Structure**: Keep semantic header hierarchies intact to aid LLM chunking algorithms.`,
      category: 'AI Search',
      tags: ['LLMO', 'SearchGPT', 'Perplexity', 'JSON-LD', 'Semantic Web'],
      authorName: 'Marcus Chen',
      authorEmail: 'marcus.chen@catalystlab.tech',
      status: 'published',
      readTime: '6 min read',
      createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
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
      coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200',
      authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
      featured: true,
      content: `## The Next Decade of Web Quality Intelligence

Evaluating websites requires a holistic approach spanning DOM complexity, edge latency, zero-trust security compliance, sustainability, and generative AI search discoverability.`,
      category: 'AI & LLMO',
      tags: ['LLMO', 'AI Search', 'RAG', 'llms.txt', 'SEO'],
      authorName: 'Dr. Aris Thorne',
      authorEmail: 'aris.thorne@catalystlab.tech',
      status: 'published',
      readTime: '6 min read',
      createdAt: Date.now() - 4 * 24 * 60 * 60 * 1000,
      updatedAt: Date.now() - 4 * 24 * 60 * 60 * 1000,
      views: 2400
    }
  ]
};

export const getBlogsForEngine = (engineType: EngineType): BlogPost[] => {
  return ENGINE_SEEDED_BLOGS[engineType] || ENGINE_SEEDED_BLOGS.health;
};
