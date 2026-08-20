import type { EngineMeta } from '../types';

export const ENGINES_MAP: Record<string, EngineMeta> = {
  health: {
    id: 'health',
    name: 'Website Health',
    category: 'Core',
    icon: 'health_and_safety',
    color: '#38bdf8',
    badgeClass: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    description: 'DOM complexity, TTFB, resource hints & render blocking bottlenecks.',
    pythonScript: 'website_health.py',
    route: '/health',
    docsAnchor: 'engine-health',
    keyVectors: [
      'DOM Tree Recursion Depth',
      'Total DOM Node Volume',
      'Render-Blocking Stylesheets & Scripts',
      'Time-To-First-Byte (TTFB)',
      'Preload & Preconnect Resource Hints',
      'Static Asset Cache-Control'
    ],
    sampleTargets: ['https://example.com', 'https://news.ycombinator.com', 'https://github.com'],
    recommendedEngines: [
      {
        engineId: 'latency',
        rationale: 'Benchmark multi-region edge TTFB and origin server response times across 12 global PoPs.'
      },
      {
        engineId: 'eco',
        rationale: 'Evaluate page payload transfer weight and calculate grams of CO2 emitted per pageview.'
      },
      {
        engineId: 'compliance',
        rationale: 'Verify WCAG 2.2 accessibility standards and OWASP HTTP security headers.'
      }
    ],
    relevantBlogSlugs: [
      'optimizing-dom-depth-render-blocking-nextjs',
      'decoupling-critical-css-font-preloading'
    ]
  },
  latency: {
    id: 'latency',
    name: 'Global Edge Latency',
    category: 'Developer & AI',
    icon: 'public',
    color: '#f472b6',
    badgeClass: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
    description: 'Multi-region synthetic edge latency & TTFB benchmarks across 12 global PoPs.',
    pythonScript: 'edge_latency.py',
    route: '/latency',
    docsAnchor: 'engine-latency',
    keyVectors: [
      'Multi-Region Anycast Routing',
      'Regional TTFB Radar (US, EU, AP, SA)',
      'TLS 1.3 0-RTT Session Resumption',
      'HTTP/3 QUIC Multiplexing',
      'Origin Socket Handshake Latency',
      'Edge CDN Cache Hit Ratio'
    ],
    sampleTargets: ['https://cloudflare.com', 'https://vercel.com', 'https://aws.amazon.com'],
    recommendedEngines: [
      {
        engineId: 'health',
        rationale: 'Inspect client-side DOM rendering bottlenecks and critical CSS parsing time.'
      },
      {
        engineId: 'migration',
        rationale: 'Assess zero-downtime cutover readiness and CDN edge routing mapping.'
      },
      {
        engineId: 'eco',
        rationale: 'Analyze energy efficiency improvements from low-latency edge caching.'
      }
    ],
    relevantBlogSlugs: [
      'decimating-ttfb-edge-workers'
    ]
  },
  ai_ready: {
    id: 'ai_ready',
    name: 'AI Readiness',
    category: 'Developer & AI',
    icon: 'psychology',
    color: '#c084fc',
    badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    description: 'LLM crawler policy, llms.txt validation, RAG readiness & Schema.org entities.',
    pythonScript: 'ai_readiness.py',
    route: '/ai-readiness',
    docsAnchor: 'engine-ai-readiness',
    keyVectors: [
      'Root /llms.txt Manifest Discovery',
      'Robots.txt AI Bot Allowlist (GPTBot, ClaudeBot)',
      'Schema.org JSON-LD Structured Graph',
      'Semantic Headings Hierarchy (H1-H3)',
      'Text-to-HTML Semantic Signal Ratio',
      'RAG Context Chunkability'
    ],
    sampleTargets: ['https://openai.com', 'https://anthropic.com', 'https://docs.github.com'],
    recommendedEngines: [
      {
        engineId: 'llmo',
        rationale: 'Maximize citation probability and authoritative entity parsing in Perplexity and SearchGPT.'
      },
      {
        engineId: 'health',
        rationale: 'Ensure clean semantic DOM structure and low node overhead for RAG extractors.'
      },
      {
        engineId: 'compliance',
        rationale: 'Audit privacy policies and terms of service regarding autonomous data training.'
      }
    ],
    relevantBlogSlugs: [
      'llmstxt-standard-autonomous-ai-crawlers'
    ]
  },
  repo: {
    id: 'repo',
    name: 'Repo Hygiene',
    category: 'Enterprise',
    icon: 'inventory_2',
    color: '#4ade80',
    badgeClass: 'bg-green-500/10 text-green-400 border-green-500/30',
    description: 'GitHub/GitLab/Bitbucket security, license & branch protections.',
    pythonScript: 'repo_scanner.py',
    route: '/repo-scanner',
    docsAnchor: 'engine-repo-scanner',
    keyVectors: [
      'Open-Source License Compatibility',
      'SECURITY.md Vulnerability Policy',
      'Automated Dependabot Security Config',
      'Branch Protection & Required Reviews',
      'Pre-Commit Secret Scanning Guards',
      'CI/CD Workflow Health & Velocity'
    ],
    sampleTargets: ['https://github.com/facebook/react', 'https://github.com/vercel/next.js', 'https://github.com/tailwindlabs/tailwindcss'],
    recommendedEngines: [
      {
        engineId: 'compliance',
        rationale: 'Enforce OWASP HTTP security headers and GDPR/CCPA privacy standards in production.'
      },
      {
        engineId: 'ai_ready',
        rationale: 'Verify that public repository documentation and manifests are AI search indexed.'
      },
      {
        engineId: 'migration',
        rationale: 'Audit infrastructure-as-code configuration and deployment automation pipelines.'
      }
    ],
    relevantBlogSlugs: [
      'automating-git-secops-hygiene'
    ]
  },
  eco: {
    id: 'eco',
    name: 'Eco Carbon Footprint',
    category: 'Enterprise',
    icon: 'eco',
    color: '#34d399',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    description: 'CO2 grams per pageview, green host verification & sustainability.',
    pythonScript: 'eco_carbon_audit.py',
    route: '/eco-audit',
    docsAnchor: 'engine-eco-audit',
    keyVectors: [
      'Sustainable Web Design (SWD) Carbon Model',
      'Grams of CO2 per 10,000 Pageviews',
      'Green Web Foundation Host Certification',
      'Modern Media Compression (AVIF/WebP)',
      'Client JavaScript CPU Power Budget',
      'Dark Mode OLED Battery Efficiency'
    ],
    sampleTargets: ['https://greenpeace.org', 'https://w3.org', 'https://stripe.com'],
    recommendedEngines: [
      {
        engineId: 'health',
        rationale: 'Eliminate render-blocking assets and heavy uncompressed DOM trees to reduce transfer size.'
      },
      {
        engineId: 'latency',
        rationale: 'Shorten physical routing distances with renewable-powered Anycast edge caches.'
      },
      {
        engineId: 'compliance',
        rationale: 'Incorporate ESG sustainability metrics into corporate compliance disclosures.'
      }
    ],
    relevantBlogSlugs: [
      'sustainable-web-engineering-carbon-reduction'
    ]
  },
  compliance: {
    id: 'compliance',
    name: 'Compliance & Risk',
    category: 'Enterprise',
    icon: 'shield',
    color: '#fbbf24',
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    description: 'WCAG accessibility, GDPR cookie consent & OWASP security headers.',
    pythonScript: 'compliance_risk_audit.py',
    route: '/compliance',
    docsAnchor: 'engine-compliance',
    keyVectors: [
      'Strict-Transport-Security (HSTS Preload)',
      'Content-Security-Policy (CSP Nonces)',
      'X-Frame-Options Clickjacking Guard',
      'X-Content-Type-Options (nosniff)',
      'GDPR/CCPA Granular Cookie Tiers',
      'WCAG 2.2 AA Contrast & ARIA Labels'
    ],
    sampleTargets: ['https://eff.org', 'https://gov.uk', 'https://apple.com'],
    recommendedEngines: [
      {
        engineId: 'repo',
        rationale: 'Audit upstream software supply chain security and Dependabot CVE patches.'
      },
      {
        engineId: 'health',
        rationale: 'Ensure high color contrast and semantic accessibility landmarks in your DOM.'
      },
      {
        engineId: 'ai_ready',
        rationale: 'Align copyright and training compliance with explicit robots.txt AI directives.'
      }
    ],
    relevantBlogSlugs: [
      'owasp-security-headers-gdpr-governance'
    ]
  },
  migration: {
    id: 'migration',
    name: 'Platform Migration',
    category: 'Core',
    icon: 'transform',
    color: '#fb923c',
    badgeClass: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    description: 'WordPress, Shopify & Next.js re-platforming pre-flight auditor.',
    pythonScript: 'platform_migration_audit.py',
    route: '/migration',
    docsAnchor: 'engine-migration',
    keyVectors: [
      '301 Permanent Redirect Route Mapping',
      'Canonical URL Destination Synchronization',
      'OpenGraph & Historical Meta Tag Preservation',
      'Database Replication Latency Lag',
      'Cloud Asset CDN Path Rewrites',
      'Zero-Downtime DNS TTL Readiness'
    ],
    sampleTargets: ['https://shopify.com', 'https://wordpress.org', 'https://nextjs.org'],
    recommendedEngines: [
      {
        engineId: 'latency',
        rationale: 'Compare legacy origin vs new edge server TTFB across 12 global regions.'
      },
      {
        engineId: 'health',
        rationale: 'Verify that the new decoupled frontend flattens DOM depth and improves Core Web Vitals.'
      },
      {
        engineId: 'compliance',
        rationale: 'Ensure no cryptographic security headers or privacy policies were omitted during re-platforming.'
      }
    ],
    relevantBlogSlugs: [
      'zero-downtime-platform-migration-seo-parity'
    ]
  },
  llmo: {
    id: 'llmo',
    name: 'AI Search Optimization',
    category: 'Developer & AI',
    icon: 'smart_toy',
    color: '#67e8f9',
    badgeClass: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    description: 'Generative search engine citations and Perplexity indexability.',
    pythonScript: 'llmo_optimizer.py',
    route: '/llmo',
    docsAnchor: 'engine-llmo',
    keyVectors: [
      'Schema.org TechArticle & Entity Graph Depth',
      'Factual Information Density Index',
      'Perplexity Answer Citation Readiness',
      'SearchGPT DOM Content Extraction',
      'Verified Author Entity Authority',
      'Canonical Source Annotation'
    ],
    sampleTargets: ['https://en.wikipedia.org', 'https://nature.com', 'https://techcrunch.com'],
    recommendedEngines: [
      {
        engineId: 'ai_ready',
        rationale: 'Verify /llms.txt manifest discovery and robots.txt bot crawling allowances.'
      },
      {
        engineId: 'health',
        rationale: 'Ensure semantic HTML markup with high text-to-HTML ratio for RAG tokenizers.'
      },
      {
        engineId: 'compliance',
        rationale: 'Protect proprietary data with explicit machine-readable crawler licenses.'
      }
    ],
    relevantBlogSlugs: [
      'generative-engine-optimization-llmo-citations',
      'modern-website-health-ai-search'
    ]
  }
};
