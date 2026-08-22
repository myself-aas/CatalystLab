import type { EngineMeta } from '../types';
import synthshiftImg from '../assets/images/synthshift_migration_1787420135413.jpg';
import gitlygaseImg from '../assets/images/gitlygase_repo_1787420147890.jpg';
import ecoholoImg from '../assets/images/ecoholo_eco_1787420162544.jpg';
import vitalzymeImg from '../assets/images/vitalzyme_health_1787420174357.jpg';
import edgevmaxImg from '../assets/images/edgevmax_latency_1787420187566.jpg';
import riskproteaseImg from '../assets/images/riskprotease_compliance_1787420200307.jpg';
import llmKinaseImg from '../assets/images/llm_kinase_ai_1787420214376.jpg';
import allostersearchImg from '../assets/images/allostersearch_llmo_1787420226857.jpg';

export const ENGINES_MAP: Record<string, EngineMeta> = {
  // SDLC Phase 1: SynthShift
  migration: {
    id: 'migration',
    name: 'SynthShift',
    shortCode: 'SYNTH',
    catalystName: 'SynthShift',
    sdlcPhase: 'SynthShift • Migration & Infrastructure',
    sdlcPhaseNumber: 1,
    lifecycleFocus: 'Architecture Blueprints, Schema Modeling & Migration Parity',
    departmentReplaced: 'Architecture Planning & Technical Systems Design',
    expertCountReplaced: 1,
    category: 'Core',
    icon: 'account_tree',
    color: '#fb923c',
    badgeClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30',
    description: 'Binding disparate systems together for a seamless, risk-free infrastructure migration.',
    pythonScript: 'platform_migration_audit.py',
    route: '/migration',
    docsAnchor: 'engine-par',
    image: synthshiftImg,
    keyVectors: [
      'Site Topology & Route Hierarchy Mapping',
      'Canonical URL Destination Synchronization',
      '301 Permanent vs 302 Temporary Redirect Tree Integrity',
      'OpenGraph, Twitter Card & Meta Blueprint Preservation',
      'Database Schema & Resource Allocation Integrity',
      'DNS TTL & Cloud Routing Cutover Readiness'
    ],
    stateOfTheArtCapabilities: [
      'Automated redirect loop and circular path detection prior to release deployment.',
      'Schema validation and structured JSON-LD knowledge graph parity verification.',
      'Pre-flight migration diffing for Next.js, Astro, WordPress, and serverless architectures.'
    ],
    autonomousActions: [
      'Generate NGINX / Cloudflare rewrite rule matrices for redirect preservation.',
      'Validate canonical tag configurations and structural JSON-LD schemas.',
      'Identify routing anomalies and orphaned URL patterns.'
    ],
    sampleTargets: ['https://shopify.com', 'https://wordpress.org', 'https://nextjs.org'],
    recommendedEngines: [
      {
        engineId: 'repo',
        rationale: 'Review repository branch rules and static analysis pipelines before infrastructure cutover.'
      },
      {
        engineId: 'health',
        rationale: 'Benchmark client-side DOM rendering performance and critical CSS parsing time.'
      },
      {
        engineId: 'latency',
        rationale: 'Verify edge routing latency across global edge points of presence.'
      }
    ],
    relevantBlogSlugs: [
      'zero-downtime-platform-migration-seo-parity'
    ]
  },

  // SDLC Phase 2: GitLygase
  repo: {
    id: 'repo',
    name: 'GitLygase',
    shortCode: 'LYGASE',
    catalystName: 'GitLygase',
    sdlcPhase: 'GitLygase • Repository Hygiene',
    sdlcPhaseNumber: 2,
    lifecycleFocus: 'Static Analysis, Dependency CVEs & Branch Protection',
    departmentReplaced: 'Static Code Analysis & Open-Source Governance',
    expertCountReplaced: 1,
    category: 'Enterprise',
    icon: 'terminal',
    color: '#4ade80',
    badgeClass: 'bg-green-500/10 text-green-600 border-green-500/30',
    description: 'Repairing, cleaning, and binding your repository structure for flawless code hygiene.',
    pythonScript: 'repo_scanner.py',
    route: '/repo-scanner',
    docsAnchor: 'engine-repo-scanner',
    image: gitlygaseImg,
    keyVectors: [
      'Open-Source License Compatibility (MIT, Apache, GPL)',
      'SECURITY.md Vulnerability Disclosure Policy',
      'Automated Dependabot Security Vulnerability Fixes',
      'Branch Protection & Mandatory Code Review Rules',
      'Pre-Commit Secret Scanning & Token Leak Guards',
      'CI/CD Pipeline Workflow Health & Velocity'
    ],
    stateOfTheArtCapabilities: [
      'Static dependency verification against known public vulnerability databases.',
      'Automated pull request policy and branch protection rule inspection.',
      'Repository hygiene scoring calibrated against standard open-source governance practices.'
    ],
    autonomousActions: [
      'Generate standard `.github/dependabot.yml` configuration templates.',
      'Review pull request approval policies against baseline security guidelines.',
      'Detect accidental token exposure in repository configuration files.'
    ],
    sampleTargets: ['https://github.com/facebook/react', 'https://github.com/vercel/next.js', 'https://github.com/tailwindlabs/tailwindcss'],
    recommendedEngines: [
      {
        engineId: 'compliance',
        rationale: 'Enforce OWASP HTTP security transport headers and privacy compliance.'
      },
      {
        engineId: 'eco',
        rationale: 'Analyze code bundle size and asset efficiency to reduce execution overhead.'
      },
      {
        engineId: 'ai_ready',
        rationale: 'Verify that public repository manifests and documentation endpoints are properly configured.'
      }
    ],
    relevantBlogSlugs: [
      'automating-git-secops-hygiene'
    ]
  },

  // SDLC Phase 3: EcoHolo
  eco: {
    id: 'eco',
    name: 'EcoHolo',
    shortCode: 'HOLO',
    catalystName: 'EcoHolo',
    sdlcPhase: 'EcoHolo • Carbon Footprint',
    sdlcPhaseNumber: 3,
    lifecycleFocus: 'Bundle Weight, Image Compression & SWD Carbon Model',
    departmentReplaced: 'Frontend Performance & Sustainability Optimization',
    expertCountReplaced: 1,
    category: 'Enterprise',
    icon: 'energy_savings_leaf',
    color: '#34d399',
    badgeClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
    description: 'Synthesizing your entire digital footprint into a complete, transparent carbon accounting system.',
    pythonScript: 'eco_carbon_audit.py',
    route: '/eco-audit',
    docsAnchor: 'engine-eco-audit',
    image: ecoholoImg,
    keyVectors: [
      'Sustainable Web Design (SWD) Carbon Model Scoring',
      'CO2 Grams per 10,000 Pageviews Benchmark',
      'Green Web Foundation Host Renewable Energy Verification',
      'Modern Media Compression (AVIF, WebP, SVG Vectorization)',
      'Client JavaScript Main-Thread CPU Power Budget',
      'Dark Mode OLED Battery Efficiency Analysis'
    ],
    stateOfTheArtCapabilities: [
      'Calculates estimated energy requirements and carbon output using the standard SWD model.',
      'Highlights uncompressed payload waterfalls and non-optimized font subsets.',
      'Identifies oversized client asset transfers affecting network and CPU budgets.'
    ],
    autonomousActions: [
      'Identify image compression opportunities with modern AVIF and WebP formats.',
      'Provide Brotli and Gzip asset delivery recommendations.',
      'Verify hosting provider renewable energy credentials against Green Web Foundation registries.'
    ],
    sampleTargets: ['https://greenpeace.org', 'https://w3.org', 'https://stripe.com'],
    recommendedEngines: [
      {
        engineId: 'health',
        rationale: 'Eliminate render-blocking assets and excessive DOM elements to reduce transfer sizes.'
      },
      {
        engineId: 'latency',
        rationale: 'Benchmark CDN edge caching performance to shorten routing hops.'
      },
      {
        engineId: 'compliance',
        rationale: 'Incorporate ESG sustainability and accessibility criteria into compliance checks.'
      }
    ],
    relevantBlogSlugs: [
      'sustainable-web-engineering-carbon-reduction'
    ]
  },

  // SDLC Phase 4: VitalZyme
  health: {
    id: 'health',
    name: 'VitalZyme',
    shortCode: 'ZYME',
    catalystName: 'VitalZyme',
    sdlcPhase: 'VitalZyme • Core Vitals & Health',
    sdlcPhaseNumber: 4,
    lifecycleFocus: 'DOM Depth, Render-Blocking Assets & TTFB',
    departmentReplaced: 'Automated QA & Performance Engineering',
    expertCountReplaced: 1,
    category: 'Core',
    icon: 'speed',
    color: '#38bdf8',
    badgeClass: 'bg-sky-500/10 text-sky-600 border-sky-500/30',
    description: 'Optimizing your site’s core vitals to ensure peak health, performance, and unbroken uptime.',
    pythonScript: 'website_health.py',
    route: '/health',
    docsAnchor: 'engine-health',
    image: vitalzymeImg,
    keyVectors: [
      'DOM Tree Recursion Depth & Total Node Volume',
      'Render-Blocking Stylesheets & Script Bottlenecks',
      'Time-To-First-Byte (TTFB) and Server Response Latency',
      'Preload, Preconnect & DNS-Prefetch Resource Hints',
      'Static Asset Cache-Control & Immutable Headers',
      'WCAG 2.2 Accessibility Contrast & ARIA Landmark Integrity'
    ],
    stateOfTheArtCapabilities: [
      'Parses DOM hierarchy and node depth to locate client-side rendering bottlenecks.',
      'Identifies render-blocking stylesheet and script tags on the critical path.',
      'Assesses resource hint implementation (preload, preconnect, dns-prefetch).'
    ],
    autonomousActions: [
      'Generate recommendations for critical CSS extraction and asynchronous script loading.',
      'Synthesize resource hint tags `<link rel="preload">` for core fonts and critical assets.',
      'Highlight deeply nested DOM branches for refactoring.'
    ],
    sampleTargets: ['https://example.com', 'https://news.ycombinator.com', 'https://github.com'],
    recommendedEngines: [
      {
        engineId: 'latency',
        rationale: 'Benchmark multi-region TTFB and edge caching response times across 12 global regions.'
      },
      {
        engineId: 'eco',
        rationale: 'Evaluate page payload weight and estimated carbon emissions per pageview.'
      },
      {
        engineId: 'compliance',
        rationale: 'Verify WCAG 2.2 accessibility standards and essential HTTP security headers.'
      }
    ],
    relevantBlogSlugs: [
      'optimizing-dom-depth-render-blocking-nextjs',
      'decoupling-critical-css-font-preloading'
    ]
  },

  // SDLC Phase 5: EdgeVmax
  latency: {
    id: 'latency',
    name: 'EdgeVmax',
    shortCode: 'VMAX',
    catalystName: 'EdgeVmax',
    sdlcPhase: 'EdgeVmax • Global Edge Routing',
    sdlcPhaseNumber: 5,
    lifecycleFocus: 'Multi-Region TTFB, TLS 1.3 & HTTP/3 Verification',
    departmentReplaced: 'CDN Architecture & Global Traffic Routing',
    expertCountReplaced: 1,
    category: 'Developer & AI',
    icon: 'public',
    color: '#f472b6',
    badgeClass: 'bg-pink-500/10 text-pink-600 border-pink-500/30',
    description: 'Pushing global edge networks to maximum velocity to achieve near-zero latency.',
    pythonScript: 'edge_latency.py',
    route: '/latency',
    docsAnchor: 'engine-latency',
    image: edgevmaxImg,
    keyVectors: [
      'Multi-Region Anycast Edge Routing Radar (US, EU, AP, SA)',
      '12 Global PoPs Time-To-First-Byte (TTFB) Comparison',
      'TLS 1.3 0-RTT Session Resumption & Handshake Latency',
      'HTTP/3 QUIC Protocol Multiplexing Verification',
      'Origin Socket Handshake & TCP Slow-Start Diagnostics',
      'Edge CDN Cache Hit Ratio & Stale-While-Revalidate Headers'
    ],
    stateOfTheArtCapabilities: [
      'Synthetic latency testing across North America, Europe, Asia-Pacific, and South America.',
      'Comparison of origin server response times versus edge cache performance.',
      'Verification of modern protocol support including HTTP/2, HTTP/3, and TLS 1.3.'
    ],
    autonomousActions: [
      'Recommend edge cache control configurations (`s-maxage`, `stale-while-revalidate`).',
      'Provide DNS TTL optimization guidelines for low-latency routing and failover.',
      'Identify geographic regions experiencing elevated Time-To-First-Byte.'
    ],
    sampleTargets: ['https://cloudflare.com', 'https://vercel.com', 'https://aws.amazon.com'],
    recommendedEngines: [
      {
        engineId: 'health',
        rationale: 'Inspect client-side DOM rendering bottlenecks and critical CSS parsing time.'
      },
      {
        engineId: 'compliance',
        rationale: 'Verify SSL certificate validity and security transport headers.'
      },
      {
        engineId: 'eco',
        rationale: 'Assess energy efficiency gains achieved through regional edge caching.'
      }
    ],
    relevantBlogSlugs: [
      'decimating-ttfb-edge-workers'
    ]
  },

  // SDLC Phase 6: RiskProtease
  compliance: {
    id: 'compliance',
    name: 'RiskProtease',
    shortCode: 'PROT',
    catalystName: 'RiskProtease',
    sdlcPhase: 'RiskProtease • Security & DevSecOps',
    sdlcPhaseNumber: 6,
    lifecycleFocus: 'OWASP Headers, Strict CSP & SSL Verification',
    departmentReplaced: 'Application Security & Compliance Auditing',
    expertCountReplaced: 1,
    category: 'Enterprise',
    icon: 'security',
    color: '#fbbf24',
    badgeClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
    description: 'Actively breaking down system liabilities to ensure absolute security and compliance.',
    pythonScript: 'compliance_risk_audit.py',
    route: '/compliance',
    docsAnchor: 'engine-compliance',
    image: riskproteaseImg,
    keyVectors: [
      'Strict-Transport-Security (HSTS 2-Year Preload Verification)',
      'Content-Security-Policy (Strict CSP Nonces & Hash Validation)',
      'X-Frame-Options Clickjacking Defenses (DENY / SAMEORIGIN)',
      'X-Content-Type-Options (nosniff MIME Protection)',
      'SSL/TLS Certificate Validity & Expiration Countdown',
      'GDPR/CCPA Cookie-less Consent & Privacy Landmark Compliance'
    ],
    stateOfTheArtCapabilities: [
      'Evaluates essential HTTP defense headers against OWASP application security guidelines.',
      'Checks SSL/TLS certificate validity dates and transport configurations.',
      'Verifies baseline accessibility and privacy landmarks.'
    ],
    autonomousActions: [
      'Generate standard header configuration snippets for NGINX, Apache, and Cloudflare.',
      'Provide alerts for upcoming SSL/TLS certificate expirations.',
      'Recommend policy configurations for frame-ancestors, CSP, and MIME sniffing prevention.'
    ],
    sampleTargets: ['https://eff.org', 'https://gov.uk', 'https://apple.com'],
    recommendedEngines: [
      {
        engineId: 'repo',
        rationale: 'Audit upstream software dependencies and Dependabot vulnerability configurations.'
      },
      {
        engineId: 'health',
        rationale: 'Review accessibility contrast standards and semantic DOM markup.'
      },
      {
        engineId: 'ai_ready',
        rationale: 'Verify robots.txt crawler policies and machine-readable data declarations.'
      }
    ],
    relevantBlogSlugs: [
      'owasp-security-headers-gdpr-governance'
    ]
  },

  // SDLC Phase 7: LLM-Kinase
  ai_ready: {
    id: 'ai_ready',
    name: 'LLM-Kinase',
    shortCode: 'KINASE',
    catalystName: 'LLM-Kinase',
    sdlcPhase: 'LLM-Kinase • AI Infrastructure',
    sdlcPhaseNumber: 7,
    lifecycleFocus: 'llms.txt Manifests, AI Crawlers & RAG Structure',
    departmentReplaced: 'AI Operations & Technical Documentation Delivery',
    expertCountReplaced: 1,
    category: 'Developer & AI',
    icon: 'psychology',
    color: '#c084fc',
    badgeClass: 'bg-purple-500/10 text-purple-600 border-purple-500/30',
    description: 'Activating and accelerating your data infrastructure to unlock true enterprise AI readiness.',
    pythonScript: 'ai_readiness.py',
    route: '/ai-readiness',
    docsAnchor: 'engine-ai-readiness',
    image: llmKinaseImg,
    keyVectors: [
      'Root /llms.txt and /llms-full.txt Manifest Discovery',
      'Robots.txt AI Agent Crawling Directives (GPTBot, ClaudeBot, PerplexityBot)',
      'Schema.org JSON-LD Structured Knowledge Graph',
      'Semantic Headings Hierarchy (H1-H6) for Vector Embeddings',
      'Text-to-HTML Clean Signal Ratio for LLM Ingestion',
      'RAG Context Window Chunkability & Semantic Density'
    ],
    stateOfTheArtCapabilities: [
      'Validates root `/llms.txt` and `/llms-full.txt` standard file declarations.',
      'Checks crawler access configurations for AI indexing agents.',
      'Measures semantic heading hierarchy and text-to-code ratios for RAG ingestion.'
    ],
    autonomousActions: [
      'Generate compliant `/llms.txt` and `/llms-full.txt` specification templates.',
      'Draft `robots.txt` rules tailored for AI crawler management.',
      'Provide structured JSON-LD schemas for key content types.'
    ],
    sampleTargets: ['https://openai.com', 'https://anthropic.com', 'https://docs.github.com'],
    recommendedEngines: [
      {
        engineId: 'llmo',
        rationale: 'Review content citation structure and factual clarity for AI search engines.'
      },
      {
        engineId: 'health',
        rationale: 'Ensure clean semantic HTML markup with balanced DOM node density.'
      },
      {
        engineId: 'compliance',
        rationale: 'Review data access terms and crawler directives.'
      }
    ],
    relevantBlogSlugs: [
      'llmstxt-standard-autonomous-ai-crawlers'
    ]
  },

  // SDLC Phase 8: AllosterSearch
  llmo: {
    id: 'llmo',
    name: 'AllosterSearch',
    shortCode: 'ALLO',
    catalystName: 'AllosterSearch',
    sdlcPhase: 'AllosterSearch • Generative AI Engine',
    sdlcPhaseNumber: 8,
    lifecycleFocus: 'Generative Engine Optimization & Entity Knowledge Graphs',
    departmentReplaced: 'Search Engine Optimization & Generative Discovery',
    expertCountReplaced: 1,
    category: 'Developer & AI',
    icon: 'auto_awesome',
    color: '#67e8f9',
    badgeClass: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/30',
    description: 'Dynamically adapting your web architecture to dominate AI search and discovery engines.',
    pythonScript: 'llmo_optimizer.py',
    route: '/llmo',
    docsAnchor: 'engine-llmo',
    image: allostersearchImg,
    keyVectors: [
      'Schema.org TechArticle & Entity Graph Depth',
      'Factual Information Density Index for AI Citation',
      'Perplexity Answer Citation Probability Score',
      'SearchGPT & Claude Context Extraction Accuracy',
      'Verified Author Entity Authority & SameAs Graph Linking',
      'Canonical Source Annotation & Citation Footnotes'
    ],
    stateOfTheArtCapabilities: [
      'Evaluates page content structure against Generative Engine Optimization principles.',
      'Checks structured entity linking and author profile markup.',
      'Analyzes content conciseness and key takeaway structure for AI answer summarizers.'
    ],
    autonomousActions: [
      'Generate Schema.org JSON-LD templates with author attribution.',
      'Suggest structured summaries and citation anchors for key claims.',
      'Provide semantic markup improvements for entity clarity.'
    ],
    sampleTargets: ['https://en.wikipedia.org', 'https://nature.com', 'https://techcrunch.com'],
    recommendedEngines: [
      {
        engineId: 'ai_ready',
        rationale: 'Verify /llms.txt manifest availability and robots.txt bot crawling directives.'
      },
      {
        engineId: 'health',
        rationale: 'Ensure semantic HTML markup with clean heading tags and high readability.'
      },
      {
        engineId: 'compliance',
        rationale: 'Review website licensing declarations and privacy metadata.'
      }
    ],
    relevantBlogSlugs: [
      'generative-engine-optimization-llmo-citations',
      'modern-website-health-ai-search'
    ]
  }
};

export const SDLC_CATALYSTS_LIST: EngineMeta[] = Object.values(ENGINES_MAP).sort((a, b) => a.sdlcPhaseNumber - b.sdlcPhaseNumber);

export const TOTAL_EXPERTS_REPLACED = 8;
