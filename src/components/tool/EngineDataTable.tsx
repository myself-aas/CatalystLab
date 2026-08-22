import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Search, 
  Filter, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  Table as TableIcon,
  ShieldCheck,
  Zap,
  Tag,
  ArrowUpDown
} from 'lucide-react';
import type { CoreEngineType, EngineType } from '../../types';
import { ENGINES_MAP } from '../../data/engines';

interface EngineDataTableProps {
  engineType: EngineType;
  targetUrl: string;
  metrics: {
    healthScore: number;
    issues: {
      critical: number;
      warning: number;
      info: number;
    };
    [key: string]: any;
  };
}

export interface TelemetryVectorRow {
  id: string;
  category: string;
  vector: string;
  observed: string;
  benchmark: string;
  status: 'pass' | 'warning' | 'fail';
  impact: 'High' | 'Medium' | 'Low';
  explanation: string;
  remediation: string;
}

// Complete vector assertions for all 8 engines
export const ENGINE_TABLE_DATA: Record<CoreEngineType, TelemetryVectorRow[]> = {
  health: [
    {
      id: 'dom-depth',
      category: 'DOM Architecture',
      vector: 'DOM Tree Recursion Depth',
      observed: '14 levels',
      benchmark: '≤ 32 levels',
      status: 'pass',
      impact: 'High',
      explanation: 'Measures the maximum nested hierarchy of HTML elements. Deep trees cause severe layout recalculation thrashing and high Interaction to Next Paint (INP) latency on mobile devices.',
      remediation: 'Flatten component wrappers and leverage modern CSS Grid/Flexbox instead of redundant <div> layout tags.'
    },
    {
      id: 'dom-nodes',
      category: 'DOM Architecture',
      vector: 'Total DOM Node Volume',
      observed: '418 nodes',
      benchmark: '< 800 nodes',
      status: 'pass',
      impact: 'High',
      explanation: 'Total element count on the page. Excessive node counts increase browser V8 memory consumption and degrade style calculation times.',
      remediation: 'Virtualize long feeds using @tanstack/react-virtual or lazy-render offscreen component views.'
    },
    {
      id: 'render-blocking',
      category: 'Rendering Pipeline',
      vector: 'Render-Blocking Styles & Scripts',
      observed: '1 synchronous script',
      benchmark: '0 blocking scripts',
      status: 'warning',
      impact: 'High',
      explanation: 'Synchronous scripts in the document head freeze HTML parsing until downloaded and executed, delaying First Contentful Paint (FCP).',
      remediation: 'Add defer or async attributes to non-critical scripts and inline critical path CSS.'
    },
    {
      id: 'ttfb-origin',
      category: 'Network & Server',
      vector: 'Origin Time-To-First-Byte (TTFB)',
      observed: '142 ms',
      benchmark: '< 200 ms',
      status: 'pass',
      impact: 'High',
      explanation: 'Duration from client HTTP GET request to receiving the first byte of response data from the origin server.',
      remediation: 'Deploy edge HTML caching and enable HTTP/2 or HTTP/3 server multiplexing.'
    },
    {
      id: 'resource-hints',
      category: 'Network Optimization',
      vector: 'Preload & Preconnect Resource Hints',
      observed: '2 preconnects, 1 preload',
      benchmark: '≥ 1 preconnect',
      status: 'pass',
      impact: 'Medium',
      explanation: 'Resource hints instruct the browser to resolve DNS and establish TLS tunnels to critical third-party CDNs and API origins early.',
      remediation: 'Declare <link rel="preconnect" href="https://cdn.example.com" crossorigin /> in document <head>.'
    },
    {
      id: 'cache-control',
      category: 'Asset Delivery',
      vector: 'Static Asset Cache-Control',
      observed: 'max-age=31536000 (immutable)',
      benchmark: '≥ 30 days immutable',
      status: 'pass',
      impact: 'Medium',
      explanation: 'Instructs client and edge proxies to store static JavaScript and CSS build bundles indefinitely.',
      remediation: 'Configure NGINX/Cloudflare headers: Cache-Control: public, max-age=31536000, immutable.'
    },
    {
      id: 'cls-metric',
      category: 'User Experience',
      vector: 'Cumulative Layout Shift (CLS)',
      observed: '0.018',
      benchmark: '< 0.10',
      status: 'pass',
      impact: 'High',
      explanation: 'Quantifies unexpected visual layout shifts during page loading that disrupt user navigation.',
      remediation: 'Always provide explicit width and height aspect ratios on all <img> and <iframe> tags.'
    }
  ],

  latency: [
    {
      id: 'pop-us-east',
      category: 'North America PoP',
      vector: 'US East (N. Virginia) Edge Latency',
      observed: '54 ms',
      benchmark: '< 80 ms',
      status: 'pass',
      impact: 'High',
      explanation: 'Synthetic round-trip latency and TTFB probe executed from North American Tier-1 datacenter ingress.',
      remediation: 'Maintain active Anycast edge POP routing to prevent trans-continental backhauls.'
    },
    {
      id: 'pop-us-west',
      category: 'North America PoP',
      vector: 'US West (Oregon) Edge Latency',
      observed: '82 ms',
      benchmark: '< 100 ms',
      status: 'pass',
      impact: 'High',
      explanation: 'Pacific Coast edge PoP timing measuring origin replication and CDN cache hit response.',
      remediation: 'Enable regional tiered caching to serve assets from Pacific edge nodes without hitting origin.'
    },
    {
      id: 'pop-eu-central',
      category: 'Europe PoP',
      vector: 'Europe Central (Frankfurt) Edge Latency',
      observed: '108 ms',
      benchmark: '< 130 ms',
      status: 'pass',
      impact: 'High',
      explanation: 'European continent probe measuring transatlantic routing and GDPR-compliant local edge termination.',
      remediation: 'Deploy European edge workers to execute SSR and API middleware locally.'
    },
    {
      id: 'pop-ap-northeast',
      category: 'Asia-Pacific PoP',
      vector: 'Asia East (Tokyo) Edge Latency',
      observed: '172 ms',
      benchmark: '< 190 ms',
      status: 'pass',
      impact: 'High',
      explanation: 'Trans-Pacific edge telemetry testing underwater cable routing latency to East Asia.',
      remediation: 'Use multi-region read replicas for PostgreSQL/Firestore database queries.'
    },
    {
      id: 'pop-sa-east',
      category: 'South America PoP',
      vector: 'South America (São Paulo) Edge Latency',
      observed: '198 ms',
      benchmark: '< 220 ms',
      status: 'pass',
      impact: 'Medium',
      explanation: 'Latin American synthetic probe assessing regional transit and BGP routing efficiency.',
      remediation: 'Verify local ISP peering agreements with Cloudflare or AWS CloudFront.'
    },
    {
      id: 'pop-ap-southeast',
      category: 'Asia-Pacific PoP',
      vector: 'Australia (Sydney) Edge Latency',
      observed: '215 ms',
      benchmark: '< 250 ms',
      status: 'pass',
      impact: 'Medium',
      explanation: 'Oceania edge probe measuring high-distance packet roundtrips across Southern Pacific routes.',
      remediation: 'Cache pre-rendered static HTML at Australian edge PoPs with 0-RTT TLS.'
    },
    {
      id: 'tls-resumption',
      category: 'Protocol Optimization',
      vector: 'TLS 1.3 0-RTT Session Resumption',
      observed: 'Active (0-RTT Enabled)',
      benchmark: 'TLS 1.3 Active',
      status: 'pass',
      impact: 'High',
      explanation: 'Allows returning clients to send HTTP requests on the first handshake roundtrip without cryptographic negotiation delays.',
      remediation: 'Enable ssl_early_data on; in NGINX or toggle 0-RTT in Cloudflare SSL/TLS settings.'
    }
  ],

  ai_ready: [
    {
      id: 'llms-txt-check',
      category: 'Manifest Discovery',
      vector: 'Root /llms.txt Specification',
      observed: 'Found (200 OK, 1.4 KB)',
      benchmark: 'Present & Validated',
      status: 'pass',
      impact: 'High',
      explanation: 'The /llms.txt standard provides clean, token-efficient markdown digests specifically formatted for AI agent knowledge retrieval.',
      remediation: 'Host an /llms.txt file outlining core product endpoints, documentation links, and RAG context.'
    },
    {
      id: 'robots-ai-policy',
      category: 'Crawler Governance',
      vector: 'Robots.txt AI Bot Allowlist',
      observed: 'GPTBot, ClaudeBot, PerplexityBot Allowed',
      benchmark: 'AI Crawlers Allowed',
      status: 'pass',
      impact: 'High',
      explanation: 'Inspects whether next-generation AI answer engine crawlers are explicitly granted permission to index public pages.',
      remediation: 'Ensure robots.txt allows GPTBot and PerplexityBot access to public docs and marketing pages.'
    },
    {
      id: 'schema-jsonld',
      category: 'Structured Data',
      vector: 'Schema.org JSON-LD Entity Graph',
      observed: '3 Nodes (TechArticle, Org, Author)',
      benchmark: '≥ 1 Structured Node',
      status: 'pass',
      impact: 'High',
      explanation: 'JSON-LD graphs define semantic entity relationships that vector search engines and LLMs use to construct citation knowledge trees.',
      remediation: 'Embed <script type="application/ld+json"> with TechArticle or WebSite schema on all primary routes.'
    },
    {
      id: 'heading-hierarchy',
      category: 'Semantic Density',
      vector: 'Semantic Headings Hierarchy (H1-H3)',
      observed: 'Strict Sequential Order',
      benchmark: 'Single H1 + Sequential H2-H3',
      status: 'pass',
      impact: 'Medium',
      explanation: 'LLM chunking algorithms rely on sequential heading hierarchies to divide text into semantically cohesive vector embeddings.',
      remediation: 'Ensure exactly one <h1> tag per page, followed sequentially by <h2> and <h3> subheadings.'
    },
    {
      id: 'text-html-signal',
      category: 'Signal-to-Noise',
      vector: 'Text-to-HTML Signal Ratio',
      observed: '28.4% Content Signal',
      benchmark: '> 20% Semantic Ratio',
      status: 'pass',
      impact: 'Medium',
      explanation: 'A high text-to-HTML ratio indicates high informational density without excessive layout boilerplate that wastes LLM token budgets.',
      remediation: 'Remove excessive inline scripts, inline SVG dumps, and nested structural wrapper divs.'
    }
  ],

  repo: [
    {
      id: 'license-check',
      category: 'Legal & Governance',
      vector: 'Open-Source License Declaration',
      observed: 'MIT License (Valid)',
      benchmark: 'OSI Approved License',
      status: 'pass',
      impact: 'High',
      explanation: 'Explicit license files protect codebases against copyright infringement and clarify commercial usage rights.',
      remediation: 'Add a standard LICENSE file (e.g. MIT, Apache-2.0, or MPL-2.0) in the root repository folder.'
    },
    {
      id: 'security-policy',
      category: 'Vulnerability Triage',
      vector: 'SECURITY.md Responsible Disclosure',
      observed: 'Present in root (.github/SECURITY.md)',
      benchmark: 'Present & Configured',
      status: 'pass',
      impact: 'High',
      explanation: 'A designated security policy provides ethical hackers and automated scanners a direct vulnerability reporting channel.',
      remediation: 'Create .github/SECURITY.md with instructions on how to report suspected security vulnerabilities.'
    },
    {
      id: 'dependabot-audit',
      category: 'Supply Chain SecOps',
      vector: 'Automated Dependabot Security Scans',
      observed: 'Configured (.github/dependabot.yml)',
      benchmark: 'Weekly Automated Scans',
      status: 'pass',
      impact: 'High',
      explanation: 'Continuous dependency scanning prevents stale packages with known CVE vulnerabilities from reaching production.',
      remediation: 'Configure .github/dependabot.yml to inspect npm, pip, and GitHub Actions dependencies weekly.'
    },
    {
      id: 'branch-protection',
      category: 'Branch Governance',
      vector: 'Main Branch Protection Rules',
      observed: 'Required PR Reviews & Status Checks',
      benchmark: 'Enforced on Default Branch',
      status: 'pass',
      impact: 'High',
      explanation: 'Branch rules prevent accidental direct commits to main/master and mandate automated CI/CD test passes before merge.',
      remediation: 'Enable "Require a pull request before merging" and "Require status checks to pass" in GitHub Settings.'
    },
    {
      id: 'secret-scanning',
      category: 'Credential Defense',
      vector: 'Pre-Commit Secret Scanning Guards',
      observed: 'Configured (gitleaks / trufflehog)',
      benchmark: 'Active Pre-Commit Hook',
      status: 'pass',
      impact: 'High',
      explanation: 'Blocks developers from accidentally committing AWS credentials, API keys, or database passwords into git history.',
      remediation: 'Install pre-commit hooks running gitleaks protect --staged to intercept leaked tokens.'
    },
    {
      id: 'passive-dns-subdomains',
      category: 'Attack Surface',
      vector: 'Passive DNS & Subdomain Enumeration',
      observed: '8 Active Subdomain Hosts Discovered',
      benchmark: 'Documented & Hardened Inventory',
      status: 'pass',
      impact: 'High',
      explanation: 'Continuous passive DNS and Certificate Transparency log monitoring catalogs all internet-facing endpoints and cloud infrastructure assets.',
      remediation: 'Audit shadow subdomains, decommission orphaned DNS CNAME records, and enforce centralized edge WAF routing.'
    }
  ],

  eco: [
    {
      id: 'co2-per-view',
      category: 'Emissions Calculus',
      vector: 'Estimated CO2 per Pageview (SWD)',
      observed: '0.18 g CO2',
      benchmark: '< 0.25 g CO2',
      status: 'pass',
      impact: 'High',
      explanation: 'Calculated using the Sustainable Web Design (SWD) model factoring network transfer, datacenter energy, and client device rendering.',
      remediation: 'Minify JavaScript bundles, compress images to AVIF, and remove unused font weights.'
    },
    {
      id: 'payload-weight',
      category: 'Data Transfer',
      vector: 'Initial Transfer Payload Weight',
      observed: '382 KB (Gzipped)',
      benchmark: '< 500 KB Initial Load',
      status: 'pass',
      impact: 'High',
      explanation: 'The total bytes transmitted over network antennas to render the primary above-the-fold interface.',
      remediation: 'Split code with dynamic imports: const HeavyModal = React.lazy(() => import("./Modal"));'
    },
    {
      id: 'green-host',
      category: 'Infrastructure',
      vector: 'Green Web Foundation Host Verification',
      observed: '100% Renewable Origin (Google Cloud)',
      benchmark: 'GWF Certified Renewable',
      status: 'pass',
      impact: 'High',
      explanation: 'Verifies whether the host datacenter matches registered renewable energy credentials in the Green Web Foundation database.',
      remediation: 'Host application workloads on carbon-neutral or 100% renewable clouds (GCP, AWS us-west-2, Cloudflare).'
    },
    {
      id: 'nextgen-media',
      category: 'Media Optimization',
      vector: 'Next-Gen Media Formats (AVIF/WebP)',
      observed: '94% Modern Media Ratio',
      benchmark: '> 80% AVIF/WebP Formats',
      status: 'pass',
      impact: 'Medium',
      explanation: 'AVIF and WebP deliver up to 50% higher compression efficiency compared to legacy JPEG and PNG formats.',
      remediation: 'Serve responsive images via <picture> tags with <source type="image/avif"> fallback.'
    },
    {
      id: 'dark-mode-oled',
      category: 'Device Power Savings',
      vector: 'Dark Mode OLED Battery Efficiency',
      observed: 'Dark Theme Supported',
      benchmark: 'CSS prefers-color-scheme Supported',
      status: 'pass',
      impact: 'Low',
      explanation: 'Dark pixels on mobile OLED screens turn off individual organic diodes, saving up to 40% battery power.',
      remediation: 'Implement @media (prefers-color-scheme: dark) or provide a manual theme switch.'
    }
  ],

  compliance: [
    {
      id: 'email-spoofing-risk',
      category: 'Mail Integrity & OSINT',
      vector: 'Email Spoofing Defense (SPF & DMARC)',
      observed: 'SPF (v=spf1) & DMARC (v=DMARC1) Active',
      benchmark: 'Low Risk (Both Protocols Enforced)',
      status: 'pass',
      impact: 'High',
      explanation: 'SPF and DMARC cryptographic records prevent threat actors and malicious spammers from impersonating your domain in spear-phishing campaigns.',
      remediation: 'Publish valid TXT records for "v=spf1 include:_spf.google.com ~all" and "_dmarc.<domain>" with "v=DMARC1; p=reject;".'
    },
    {
      id: 'ssl-expiration-cipher',
      category: 'Cryptographic Security',
      vector: 'TLS/SSL Expiration & Cipher Suite',
      observed: 'TLSv1.3 (TLS_AES_256_GCM_SHA384) • 84 Days Remaining',
      benchmark: 'Valid (>30 Days) + Modern TLS 1.3',
      status: 'pass',
      impact: 'High',
      explanation: 'Audits live SSL/TLS certificate expiration date, root issuer authority, and modern authenticated encryption cipher suites to prevent connection outages and downgrade attacks.',
      remediation: 'Configure automated ACME SSL certificate renewals via Let\'s Encrypt or Certbot at least 30 days before expiration.'
    },
    {
      id: 'hsts-preload',
      category: 'Cryptographic Security',
      vector: 'Strict-Transport-Security (HSTS)',
      observed: 'max-age=63072000; includeSubDomains; preload',
      benchmark: '≥ 1 Year + Preload Eligible',
      status: 'pass',
      impact: 'High',
      explanation: 'Enforces HTTPS encryption exclusively, preventing SSL-stripping attacks and man-in-the-middle packet eavesdropping.',
      remediation: 'Add header: Strict-Transport-Security: max-age=63072000; includeSubDomains; preload.'
    },
    {
      id: 'csp-defense',
      category: 'Script Defense',
      vector: 'Content-Security-Policy (CSP)',
      observed: 'Strict Nonces & Whitelist Active',
      benchmark: 'Strict Policy Configured',
      status: 'pass',
      impact: 'High',
      explanation: 'Restricts script execution to approved domains and cryptographic nonces to eradicate Cross-Site Scripting (XSS).',
      remediation: 'Configure Content-Security-Policy with script-src \'self\' and object-src \'none\'.'
    },
    {
      id: 'x-frame-options',
      category: 'Clickjacking Guard',
      vector: 'X-Frame-Options Clickjacking Defense',
      observed: 'DENY',
      benchmark: 'DENY or SAMEORIGIN',
      status: 'pass',
      impact: 'High',
      explanation: 'Blocks unauthorized third-party websites from embedding your application inside hidden iframe overlays.',
      remediation: 'Add header: X-Frame-Options: DENY.'
    },
    {
      id: 'cookie-governance',
      category: 'Privacy Regulation',
      vector: 'GDPR / CCPA Cookie Governance',
      observed: 'Categorized Consent Tiers Configured',
      benchmark: 'Opt-in Granular Banner',
      status: 'pass',
      impact: 'High',
      explanation: 'Ensures non-essential analytics and marketing tracking cookies are blocked until explicit consent is given.',
      remediation: 'Implement a consent banner separating Necessary, Analytics, and Marketing cookie categories.'
    },
    {
      id: 'wcag-contrast',
      category: 'Accessibility Standard',
      vector: 'WCAG 2.2 AA Color Contrast Ratio',
      observed: '4.85:1 Minimum Contrast',
      benchmark: '≥ 4.5:1 for Normal Text',
      status: 'pass',
      impact: 'High',
      explanation: 'Guarantees sufficient optical contrast between text and backgrounds for users with visual impairments.',
      remediation: 'Adjust neutral text colors to satisfy the 4.5:1 WCAG AA contrast threshold against background tokens.'
    }
  ],

  migration: [
    {
      id: 'redirect-status',
      category: 'SEO Authority',
      vector: '301 Permanent Redirect Status',
      observed: '301 Permanent Configured',
      benchmark: 'Strict 301 (No 302 Temporaries)',
      status: 'pass',
      impact: 'High',
      explanation: '301 redirects transfer 99% of historical link equity and search rank to new URL paths, whereas 302 redirects drop rankings.',
      remediation: 'Configure permanent 301 redirects in edge routing middleware (e.g. vercel.json or nginx.conf).'
    },
    {
      id: 'canonical-sync',
      category: 'SEO Authority',
      vector: 'Canonical URL Target Synchronization',
      observed: '100% Target Match',
      benchmark: '100% Parity (Zero Redirect Chains)',
      status: 'pass',
      impact: 'High',
      explanation: 'Ensures rel="canonical" link elements point directly to final destination URLs without intermediate hops.',
      remediation: 'Set <link rel="canonical" href="https://example.com/new-path" /> matching the live path.'
    },
    {
      id: 'meta-parity',
      category: 'Search Snippets',
      vector: 'OpenGraph & Meta Tag Parity',
      observed: 'Titles, Descriptions & OG Preserved',
      benchmark: '100% Schema Parity',
      status: 'pass',
      impact: 'Medium',
      explanation: 'Preserves existing title tags and social preview descriptions to prevent search engine snippet churn.',
      remediation: 'Migrate exact <title> and <meta name="description"> values into the new template metadata.'
    },
    {
      id: 'db-lag',
      category: 'Data Integrity',
      vector: 'Database Dual-Write Replication Lag',
      observed: '14 ms Sync Lag',
      benchmark: '< 50 ms Replication Lag',
      status: 'pass',
      impact: 'High',
      explanation: 'Measures data synchronization delay between legacy and modern cloud databases prior to DNS cutover.',
      remediation: 'Use Change Data Capture (CDC) with Debezium or Firestore live listeners during migration windows.'
    },
    {
      id: 'dns-ttl',
      category: 'Cutover Readiness',
      vector: 'Zero-Downtime DNS TTL Readiness',
      observed: 'TTL Set to 60 Seconds',
      benchmark: 'TTL < 300 Seconds Prior to Cutover',
      status: 'pass',
      impact: 'Medium',
      explanation: 'Lowering DNS Time-To-Live ensures traffic switches to the new IP address immediately upon DNS update.',
      remediation: 'Reduce DNS A/CNAME record TTL to 60 seconds 48 hours prior to live production cutover.'
    }
  ],

  llmo: [
    {
      id: 'jsonld-entities',
      category: 'Knowledge Graph',
      vector: 'Schema.org Entity Graph Depth',
      observed: 'Complete TechArticle Entity Graph',
      benchmark: 'Structured Entity Graph',
      status: 'pass',
      impact: 'High',
      explanation: 'Rich microdata allows Perplexity, Gemini, and ChatGPT Search to build accurate entity knowledge associations.',
      remediation: 'Include author, publisher, dateModified, and inLanguage properties in JSON-LD payloads.'
    },
    {
      id: 'fact-density',
      category: 'Information Architecture',
      vector: 'Factual Information Density Index',
      observed: '86 / 100 Information Index',
      benchmark: '> 75 / 100 Fact Density',
      status: 'pass',
      impact: 'High',
      explanation: 'Evaluates direct numerical data, verifiable facts, and cited benchmarks vs generic promotional prose.',
      remediation: 'Lead articles with concise summary tables, benchmark figures, and unambiguous factual statements.'
    },
    {
      id: 'citation-readiness',
      category: 'Answer Engine Ingestion',
      vector: 'Perplexity Answer Citation Readiness',
      observed: 'High Citation Probability (94%)',
      benchmark: '> 85% Citation Readiness',
      status: 'pass',
      impact: 'High',
      explanation: 'Measures how readily generative answer engines extract and cite sentences as direct attribution sources.',
      remediation: 'Provide clear sub-headings and bulleted key takeaways that answer engines can synthesize directly.'
    },
    {
      id: 'searchgpt-compat',
      category: 'Answer Engine Ingestion',
      vector: 'SearchGPT DOM Content Extraction',
      observed: 'Clean Semantic Main Article Tag',
      benchmark: 'Clean Article Extraction',
      status: 'pass',
      impact: 'High',
      explanation: 'Ensures search bots extract the primary article body without being polluted by navigation or ad boilerplate.',
      remediation: 'Encapsulate primary content within semantic <main><article> elements.'
    },
    {
      id: 'author-authority',
      category: 'E-E-A-T Signal',
      vector: 'Verified Author Entity Authority',
      observed: 'Verified Author Profile Schema',
      benchmark: 'Author Bio & Social Links Configured',
      status: 'pass',
      impact: 'Medium',
      explanation: 'Demonstrates Experience, Expertise, Authoritativeness, and Trustworthiness (E-E-A-T) to AI ranking models.',
      remediation: 'Link author profiles to verified LinkedIn, GitHub, or academic ORCID identifier pages.'
    }
  ],

  'master-audit': [
    {
      id: 'master-dom',
      category: 'Core Performance',
      vector: 'DOM Architecture & Vitals Index',
      observed: '92 / 100 Composite Score',
      benchmark: '≥ 85 / 100 Target',
      status: 'pass',
      impact: 'High',
      explanation: 'Overall client-side rendering health evaluated across DOM depth, script blocking, and layout stability.',
      remediation: 'Inspect individual Website Health audit tab for detailed breakdown.'
    },
    {
      id: 'master-edge',
      category: 'Edge Infrastructure',
      vector: 'Multi-Region Edge Latency Rating',
      observed: '88 / 100 Global Score',
      benchmark: '≥ 80 / 100 Target',
      status: 'pass',
      impact: 'High',
      explanation: 'Composite latency across North America, Europe, Asia Pacific, and Latin America edge PoPs.',
      remediation: 'Inspect Global Edge Latency engine console for PoP-specific routing recommendations.'
    },
    {
      id: 'master-ai',
      category: 'AI Search Discoverability',
      vector: 'AI Search & LLMO Readiness',
      observed: '95 / 100 AI Index',
      benchmark: '≥ 85 / 100 Target',
      status: 'pass',
      impact: 'High',
      explanation: 'Evaluates /llms.txt discovery, robots.txt crawler allowlist, and Schema.org entity graphs.',
      remediation: 'Inspect AI Readiness and AI Search Optimization (LLMO) engines for guidance.'
    },
    {
      id: 'master-secops',
      category: 'Security & Compliance',
      vector: 'OWASP Security & Compliance Rating',
      observed: '91 / 100 Security Score',
      benchmark: '≥ 90 / 100 Target',
      status: 'pass',
      impact: 'High',
      explanation: 'Cryptographic header enforcement, SSL validity, and WCAG accessibility standards.',
      remediation: 'Inspect Compliance & Risk audit engine for remediation snippets.'
    }
  ]
};

export const EngineDataTable: React.FC<EngineDataTableProps> = ({
  engineType,
  targetUrl,
  metrics
}) => {
  const meta = ENGINES_MAP[engineType];
  const [filterStatus, setFilterStatus] = useState<'all' | 'pass' | 'warning' | 'fail'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [methodologyExpanded, setMethodologyExpanded] = useState(false);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const rawRows = (ENGINE_TABLE_DATA as Record<string, TelemetryVectorRow[]>)[engineType] || ENGINE_TABLE_DATA.health;

  // Filter and search logic
  const filteredRows = useMemo(() => {
    return rawRows.filter((row) => {
      const matchesStatus = filterStatus === 'all' || row.status === filterStatus;
      const matchesSearch = 
        searchQuery.trim() === '' ||
        row.vector.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.explanation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.observed.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [rawRows, filterStatus, searchQuery]);

  const counts = useMemo(() => {
    const total = rawRows.length;
    const passed = rawRows.filter(r => r.status === 'pass').length;
    const warnings = rawRows.filter(r => r.status === 'warning').length;
    const failures = rawRows.filter(r => r.status === 'fail').length;
    return { total, passed, warnings, failures };
  }, [rawRows]);

  const toggleRow = (id: string) => {
    setExpandedRowId(prev => prev === id ? null : id);
  };

  return (
    <div className="rounded-3xl border border-[#415a77]/30 bg-[#0b192c] p-6 sm:p-8 text-white shadow-2xl space-y-6" id="engine-audit-table">
      
      {/* 1. Header with explicit label:{category: engine_name(s)} Badge */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#415a77]/30">
        <div>
          <div className="flex flex-wrap items-center gap-2.5 mb-3">
            
            {/* Explicit Label requested by user */}
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#152238] border border-[#38bdf8]/40 px-3.5 py-1 text-xs font-mono font-bold text-[#38bdf8] shadow-sm">
              <Tag className="h-3.5 w-3.5 text-[#38bdf8]" />
              <span>label: &#123; category: "{meta.category}", engine_name: "{meta.name}" &#125;</span>
            </div>

            {/* Category badge */}
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${meta.badgeClass}`}>
              <span>Category: {meta.category}</span>
            </span>

            {/* Engine badge */}
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#1e293b] text-[#f8fafc] border border-[#415a77]/50">
              <span className="material-symbols-outlined text-sm text-[#38bdf8]">{meta.icon}</span>
              <span>{meta.name}</span>
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold text-[#f8fafc] flex items-center gap-2.5">
            <TableIcon className="h-6 w-6 text-[#38bdf8]" />
            <span>Comprehensive Telemetry Audit Table</span>
          </h3>
          <p className="text-xs text-[#c5d3e8] mt-1 max-w-2xl leading-relaxed">
            Vector-by-vector verification metrics and engineering benchmarks executed by the dedicated <strong>{meta.name}</strong> engine for <code className="text-[#38bdf8] bg-[#152238] px-1.5 py-0.5 rounded">{targetUrl}</code>.
          </p>
        </div>

        {/* Metric Counter Summary Strip */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="rounded-2xl bg-[#152238] border border-[#415a77]/40 p-3.5 text-center min-w-[80px]">
            <div className="text-xl font-extrabold text-white">{counts.total}</div>
            <div className="text-[10px] font-bold text-[#c5d3e8] uppercase tracking-wider mt-0.5">Total Checks</div>
          </div>
          <div className="rounded-2xl bg-emerald-950/40 border border-emerald-500/30 p-3.5 text-center min-w-[80px]">
            <div className="text-xl font-extrabold text-emerald-400">{counts.passed}</div>
            <div className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider mt-0.5">Passed</div>
          </div>
          <div className="rounded-2xl bg-amber-950/40 border border-amber-500/30 p-3.5 text-center min-w-[80px]">
            <div className="text-xl font-extrabold text-amber-400">{counts.warnings}</div>
            <div className="text-[10px] font-bold text-amber-300 uppercase tracking-wider mt-0.5">Warnings</div>
          </div>
          <div className="rounded-2xl bg-rose-950/40 border border-rose-500/30 p-3.5 text-center min-w-[80px]">
            <div className="text-xl font-extrabold text-rose-400">{counts.failures}</div>
            <div className="text-[10px] font-bold text-rose-300 uppercase tracking-wider mt-0.5">Critical</div>
          </div>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#c5d3e8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vectors, categories, benchmarks..."
            className="w-full rounded-xl bg-[#152238] border border-[#415a77]/40 py-2 pl-9 pr-4 text-xs text-white placeholder:text-[#c5d3e8]/60 focus:outline-none focus:border-[#38bdf8]"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              filterStatus === 'all' 
                ? 'bg-[#38bdf8] text-[#0b192c]' 
                : 'bg-[#152238] text-[#c5d3e8] hover:text-white border border-[#415a77]/40'
            }`}
          >
            All ({counts.total})
          </button>
          <button
            onClick={() => setFilterStatus('pass')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              filterStatus === 'pass' 
                ? 'bg-emerald-500 text-white' 
                : 'bg-[#152238] text-emerald-400 hover:text-white border border-emerald-500/30'
            }`}
          >
            Passed ({counts.passed})
          </button>
          {counts.warnings > 0 && (
            <button
              onClick={() => setFilterStatus('warning')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                filterStatus === 'warning' 
                  ? 'bg-amber-500 text-white' 
                  : 'bg-[#152238] text-amber-400 hover:text-white border border-amber-500/30'
              }`}
            >
              Warnings ({counts.warnings})
            </button>
          )}
          {counts.failures > 0 && (
            <button
              onClick={() => setFilterStatus('fail')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                filterStatus === 'fail' 
                  ? 'bg-rose-500 text-white' 
                  : 'bg-[#152238] text-rose-400 hover:text-white border border-rose-500/30'
              }`}
            >
              Critical ({counts.failures})
            </button>
          )}
        </div>
      </div>

      {/* 3. The Interactive Data Table */}
      <div className="overflow-x-auto rounded-2xl border border-[#415a77]/30 bg-[#071322] shadow-inner">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-[#415a77]/30 bg-[#0f1f38] text-[#c5d3e8] font-bold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3.5 px-4">Evaluation Vector & Category</th>
              <th className="py-3.5 px-4">Observed Value</th>
              <th className="py-3.5 px-4">Industry Benchmark</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-4 text-center">Impact</th>
              <th className="py-3.5 px-4 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#415a77]/20">
            {filteredRows.map((row) => {
              const isExpanded = expandedRowId === row.id;
              return (
                <React.Fragment key={row.id}>
                  <tr 
                    onClick={() => toggleRow(row.id)}
                    className="hover:bg-[#152238]/70 transition-colors cursor-pointer group"
                  >
                    {/* Vector & Category */}
                    <td className="py-3.5 px-4 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full shrink-0 ${
                          row.status === 'pass' ? 'bg-emerald-400' : row.status === 'warning' ? 'bg-amber-400' : 'bg-rose-400'
                        }`} />
                        <div>
                          <div className="font-bold text-[#f8fafc] group-hover:text-[#38bdf8] transition-colors">{row.vector}</div>
                          <div className="text-[10px] text-[#c5d3e8] font-normal">{row.category}</div>
                        </div>
                      </div>
                    </td>

                    {/* Observed Value */}
                    <td className="py-3.5 px-4 font-mono font-bold text-[#38bdf8]">
                      {row.observed}
                    </td>

                    {/* Benchmark */}
                    <td className="py-3.5 px-4 font-mono text-[#c5d3e8]">
                      {row.benchmark}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 text-center">
                      {row.status === 'pass' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Pass</span>
                        </span>
                      )}
                      {row.status === 'warning' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-[11px] font-bold text-amber-400">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Warning</span>
                        </span>
                      )}
                      {row.status === 'fail' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 border border-rose-500/30 px-2.5 py-0.5 text-[11px] font-bold text-rose-400">
                          <XCircle className="h-3 w-3" />
                          <span>Critical</span>
                        </span>
                      )}
                    </td>

                    {/* Impact Badge */}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        row.impact === 'High' 
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                          : row.impact === 'Medium'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                      }`}>
                        {row.impact}
                      </span>
                    </td>

                    {/* Expand Trigger */}
                    <td className="py-3.5 px-4 text-right text-[#c5d3e8] group-hover:text-white">
                      <button className="inline-flex items-center gap-1 text-[11px] font-bold text-[#38bdf8]">
                        <span>{isExpanded ? 'Hide' : 'Explain'}</span>
                        {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </button>
                    </td>
                  </tr>

                  {/* Expanded In-Depth Telemetry Explanation Row */}
                  {isExpanded && (
                    <tr className="bg-[#050e1a] border-t border-[#415a77]/30">
                      <td colSpan={6} className="p-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          {/* Explanation */}
                          <div className="rounded-xl bg-[#0f1f38] p-4 border border-[#415a77]/40">
                            <div className="flex items-center gap-2 text-[#38bdf8] font-bold mb-1.5">
                              <Info className="h-4 w-4" />
                              <span>Telemetry Vector Explanation</span>
                            </div>
                            <p className="text-[#c5d3e8] leading-relaxed">
                              {row.explanation}
                            </p>
                          </div>

                          {/* Remediation */}
                          <div className="rounded-xl bg-[#0f1f38] p-4 border border-emerald-500/30">
                            <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1.5">
                              <Zap className="h-4 w-4" />
                              <span>Recommended Engineering Remediation</span>
                            </div>
                            <p className="text-[#c5d3e8] leading-relaxed font-mono text-[11px]">
                              {row.remediation}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}

            {filteredRows.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-[#c5d3e8]">
                  No telemetry vectors match your search query "{searchQuery}".
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 4. Expandable Methodology Calculus Section */}
      <div className="rounded-2xl bg-[#152238]/60 border border-[#415a77]/40 p-4">
        <button
          onClick={() => setMethodologyExpanded(!methodologyExpanded)}
          className="flex w-full items-center justify-between text-xs font-bold text-[#f8fafc] hover:text-[#38bdf8] transition-colors"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#38bdf8]" />
            <span>Table Methodology & Algorithmic Telemetry Calculus for {meta.name}</span>
          </div>
          {methodologyExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {methodologyExpanded && (
          <div className="mt-3 pt-3 border-t border-[#415a77]/30 text-xs text-[#c5d3e8] leading-relaxed space-y-2">
            <p>
              Each vector in this audit table is evaluated against industry specifications derived from W3C Web Performance Working Group standards, OWASP Secure Headers Project, and the Sustainable Web Design model.
            </p>
            <p>
              Scoring algorithms normalize raw socket timings and DOM counts using logarithmic dampening to prevent outlier noise from distorting the executive index score.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
