import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  Zap, 
  ShieldCheck, 
  Leaf, 
  Bot, 
  Globe2, 
  GitBranch, 
  Terminal, 
  Layers, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  Sparkles, 
  CheckCircle2, 
  Activity, 
  TrendingDown, 
  Gauge, 
  Sliders, 
  ExternalLink,
  X,
  Copy,
  Check
} from 'lucide-react';

export interface AuditMetricItem {
  id: string;
  category: 'performance' | 'security' | 'ai_eco' | 'architecture';
  phase: string;
  phaseNumber: number;
  engineName: string;
  title: string;
  highlightValue: string;
  highlightLabel: string;
  score: string;
  scoreColor: string;
  badge: string;
  description: string;
  icon: any;
  accentColor: string;
  route: string;
  vectors: Array<{ name: string; value: string; status: 'pass' | 'optimal' | 'verified' }>;
  telemetryDetails: {
    benchmark: string;
    cliCommand: string;
    sampleMetricSummary: string;
    probes: string[];
  };
}

export const FEATURED_AUDIT_METRICS: AuditMetricItem[] = [
  {
    id: 'vitalzyme',
    category: 'performance',
    phase: 'Phase 4 • VitalZyme',
    phaseNumber: 4,
    engineName: 'VitalZyme Engine',
    title: 'Core Web Vitals & TTFB',
    highlightValue: '18ms',
    highlightLabel: 'Edge TTFB (Optimal)',
    score: '99.4',
    scoreColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    badge: 'Top 1% Global',
    description: 'Sub-second Largest Contentful Paint with zero layout shift and instantaneous edge response times.',
    icon: Zap,
    accentColor: '#38bdf8',
    route: '/vital',
    vectors: [
      { name: 'TTFB (Time to First Byte)', value: '18ms', status: 'optimal' },
      { name: 'LCP (Largest Contentful Paint)', value: '0.62s', status: 'optimal' },
      { name: 'CLS (Cumulative Layout Shift)', value: '0.000', status: 'optimal' },
      { name: 'INP (Interaction to Next Paint)', value: '28ms', status: 'optimal' }
    ],
    telemetryDetails: {
      benchmark: 'W3C Web Performance Working Group Standard & Chrome UX Report (CrUX)',
      cliCommand: 'npx catalystlab audit --engine=vital https://yoursite.com',
      sampleMetricSummary: 'DOM render velocity benchmarked via Chrome Headless AST parser. Zero render-blocking script anomalies identified.',
      probes: [
        'Critical CSS Parsing Time: 4.2ms',
        'Font Swap / FOIT Latency: 0ms (font-display: swap)',
        'DOM Depth Index: 7 levels (optimal <= 32)',
        'Main Thread Long Tasks (>50ms): 0 detected'
      ]
    }
  },
  {
    id: 'riskprotease',
    category: 'security',
    phase: 'Phase 6 • RiskProtease',
    phaseNumber: 6,
    engineName: 'RiskProtease Engine',
    title: 'OWASP Security & Transport',
    highlightValue: '6 / 6',
    highlightLabel: 'Hardened Headers',
    score: 'A+',
    scoreColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    badge: 'Zero Leaks',
    description: 'Strict Content-Security-Policy, 2-year HSTS preloading, SRI hash validation, and automated secret shields.',
    icon: ShieldCheck,
    accentColor: '#34d399',
    route: '/risk',
    vectors: [
      { name: 'Content-Security-Policy', value: 'Enforced', status: 'pass' },
      { name: 'Strict-Transport-Security', value: '2 Years + Preload', status: 'pass' },
      { name: 'X-Frame-Options', value: 'DENY', status: 'pass' },
      { name: 'Subresource Integrity (SRI)', value: 'Validated', status: 'pass' }
    ],
    telemetryDetails: {
      benchmark: 'OWASP ASVS v4.0.3 Level 3 & NIST SP 800-53 Transport Security Matrix',
      cliCommand: 'npx catalystlab audit --engine=risk https://yoursite.com',
      sampleMetricSummary: 'Synthetic HTTP vulnerability probes executed against all public endpoint surfaces. Zero iframe clickjacking exposure.',
      probes: [
        'TLS Cipher Suite: TLS_AES_256_GCM_SHA384 (TLS 1.3)',
        'Public Key Pinning & Certificate Expiry: 312 Days Valid',
        'Permissions-Policy: camera=(), microphone=(), geolocation=()',
        'API Token Exposure Scan: 0 API keys in client JavaScript AST'
      ]
    }
  },
  {
    id: 'ecoholo',
    category: 'ai_eco',
    phase: 'Phase 3 • EcoHolo',
    phaseNumber: 3,
    engineName: 'EcoHolo Engine',
    title: 'Sustainable Carbon Accounting',
    highlightValue: '0.08g',
    highlightLabel: 'CO2e / Pageview',
    score: 'A+',
    scoreColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    badge: 'Green Certified',
    description: 'SWD v4 scientific carbon accounting measuring energy intensity, edge cache hits, and green CDN routing.',
    icon: Leaf,
    accentColor: '#4ade80',
    route: '/eco',
    vectors: [
      { name: 'Carbon Emission / View', value: '0.08 gCO2e', status: 'optimal' },
      { name: 'Initial Payload Transfer', value: '124 KB', status: 'optimal' },
      { name: 'Renewable Energy Hosting', value: '100% Verified', status: 'verified' },
      { name: 'SWD Model Rating', value: 'A+ Green', status: 'pass' }
    ],
    telemetryDetails: {
      benchmark: 'Sustainable Web Design (SWD) Model v4 & Green Web Foundation Registry',
      cliCommand: 'npx catalystlab audit --engine=eco https://yoursite.com',
      sampleMetricSummary: 'Calculates kilowatt-hours (kWh) per network gigabyte transferred based on regional grid carbon intensity factors.',
      probes: [
        'Total Compressed Payload: 124.6 KB (Gzip/Brotli)',
        'Asset Caching Efficiency: 94.2% Cache-Control hit ratio',
        'Green Grid Verification: Equinix / AWS 100% Renewable region',
        'Annual CO2e (1M views): 80 kg vs 1,840 kg industry median'
      ]
    }
  },
  {
    id: 'llmkinase',
    category: 'ai_eco',
    phase: 'Phase 7 • LLM-Kinase',
    phaseNumber: 7,
    engineName: 'LLM-Kinase Engine',
    title: 'Generative AI & /llms.txt',
    highlightValue: '24.5k',
    highlightLabel: 'Indexed Token Budget',
    score: '96.8',
    scoreColor: 'text-sky-700 bg-sky-50 border-sky-200',
    badge: '/llms.txt Active',
    description: 'Comprehensive /llms.txt validation and Schema.org knowledge graph parsing for autonomous agents.',
    icon: Bot,
    accentColor: '#c084fc',
    route: '/ai-readiness',
    vectors: [
      { name: '/llms.txt Specification', value: 'Valid (200 OK)', status: 'pass' },
      { name: 'Schema.org JSON-LD Graph', value: '8 Entities', status: 'optimal' },
      { name: 'Robots.txt AI Directives', value: 'Standardized', status: 'verified' },
      { name: 'RAG Chunking Semantic Depth', value: 'High Precision', status: 'optimal' }
    ],
    telemetryDetails: {
      benchmark: '/llms.txt Standard Specification & Schema.org Structured Data Guidelines',
      cliCommand: 'npx catalystlab audit --engine=ai https://yoursite.com',
      sampleMetricSummary: 'Validates crawlability and token budget extraction for LLM RAG pipelines without conversational hallucination traps.',
      probes: [
        'Manifest Location: https://yoursite.com/llms.txt (Found)',
        'Syntactic JSON-LD Entities: Organization, WebSite, TechArticle',
        'AI Crawler Latency: ClaudeBot 14ms, GPTBot 18ms, PerplexityBot 16ms',
        'Content-to-Boilerplate Ratio: 78.4% high-signal information'
      ]
    }
  },
  {
    id: 'edgevmax',
    category: 'performance',
    phase: 'Phase 5 • EdgeVmax',
    phaseNumber: 5,
    engineName: 'EdgeVmax Engine',
    title: 'Global Edge Latency Radar',
    highlightValue: '16.2ms',
    highlightLabel: 'Global Avg TTFB',
    score: '42/42',
    scoreColor: 'text-sky-700 bg-sky-50 border-sky-200',
    badge: 'HTTP/3 QUIC',
    description: 'Parallel synthetic routing across 42 global edge points of presence verifying TLS 1.3 0-RTT handshakes.',
    icon: Globe2,
    accentColor: '#38bdf8',
    route: '/edge',
    vectors: [
      { name: 'Americas Anycast (IAD / SFO)', value: '11.4ms', status: 'optimal' },
      { name: 'EMEA Anycast (LHR / FRA)', value: '14.8ms', status: 'optimal' },
      { name: 'APAC Anycast (NRT / SIN)', value: '18.6ms', status: 'optimal' },
      { name: 'QUIC / HTTP/3 Multiplexing', value: 'Enabled', status: 'pass' }
    ],
    telemetryDetails: {
      benchmark: 'IETF RFC 9114 (HTTP/3) & Global BGP Anycast Routing Standards',
      cliCommand: 'npx catalystlab audit --engine=edge https://yoursite.com',
      sampleMetricSummary: 'Probes synthetic round-trip time (RTT), DNS resolution latency, and TLS negotiation from 42 edge PoPs simultaneously.',
      probes: [
        'TLS 1.3 0-RTT Handshake Duration: 3.8ms',
        'ALPN Negotiation: h3, h2, http/1.1 prioritized',
        'DNS Anycast Resolution Time: 4.1ms',
        'IPv6 Dual-Stack Routing: Verified (A + AAAA records synchronized)'
      ]
    }
  },
  {
    id: 'synthshift',
    category: 'architecture',
    phase: 'Phase 1 • SynthShift',
    phaseNumber: 1,
    engineName: 'SynthShift Engine',
    title: 'Architecture & Canonical Parity',
    highlightValue: '100%',
    highlightLabel: 'Route Hierarchy Parity',
    score: '100',
    scoreColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    badge: '0 Loops',
    description: 'Full AST route topology diffing, OpenGraph metadata retention, and 301 permanent redirect tree integrity.',
    icon: Layers,
    accentColor: '#fb923c',
    route: '/migration',
    vectors: [
      { name: '301 Permanent Redirect Tree', value: '0 Loops', status: 'pass' },
      { name: 'Canonical URL Synchronization', value: '100% Match', status: 'optimal' },
      { name: 'OpenGraph / Twitter Meta Tags', value: 'Preserved', status: 'verified' },
      { name: 'Orphaned Route Anomaly Scan', value: '0 Detected', status: 'pass' }
    ],
    telemetryDetails: {
      benchmark: 'W3C URI Syntactic Specification & RFC 7231 Hypertext Transfer Protocol',
      cliCommand: 'npx catalystlab audit --engine=migration https://yoursite.com',
      sampleMetricSummary: 'Scans complete site topology before and after infrastructure migrations to ensure 100% SEO index preservation.',
      probes: [
        'Redirect Chain Depth: Max 1 hop (no multi-hop degradation)',
        'Canonical Self-Reference Consistency: 100% of routes',
        'Structured Metadata Schema Parity: Validated across 1,200 paths',
        'HTTP to HTTPS Auto-Upgrade: Enforced at edge gateway'
      ]
    }
  },
  {
    id: 'gitlygase',
    category: 'security',
    phase: 'Phase 2 • GitLygase',
    phaseNumber: 2,
    engineName: 'GitLygase Engine',
    title: 'Code Hygiene & CI/CD Security',
    highlightValue: '0 CVEs',
    highlightLabel: 'Vulnerability Index',
    score: '99.2',
    scoreColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    badge: 'Clean Build',
    description: 'Static dependency vulnerability scanning, mandatory branch protection rules, and open-source license governance.',
    icon: GitBranch,
    accentColor: '#4ade80',
    route: '/repo-scanner',
    vectors: [
      { name: 'Known Dependency CVEs', value: '0 Vulnerabilities', status: 'pass' },
      { name: 'Branch Protection Rules', value: 'Strict 2-Review', status: 'optimal' },
      { name: 'License Governance', value: 'MIT / Apache Valid', status: 'verified' },
      { name: 'SECURITY.md Policy', value: 'Configured', status: 'pass' }
    ],
    telemetryDetails: {
      benchmark: 'OpenSSF Scorecard Standard & NIST NVD Common Vulnerabilities and Exposures',
      cliCommand: 'npx catalystlab audit --engine=repo https://github.com/your/repo',
      sampleMetricSummary: 'Static AST inspection of package manifests and CI/CD workflow definitions to prevent supply chain attacks.',
      probes: [
        'Automated Vulnerability Pull Requests: Configured via Dependabot',
        'Pre-Commit Git Hooks: Secret scanning enabled',
        'CI/CD Pipeline Build Duration: 1m 18s average velocity',
        'Unpinned Dependency Risk: Zero floating major versions'
      ]
    }
  },
  {
    id: 'alloster',
    category: 'architecture',
    phase: 'Phase 8 • Alloster',
    phaseNumber: 8,
    engineName: 'Alloster Engine',
    title: 'Entity Graph & Semantic Schema',
    highlightValue: '8 Entities',
    highlightLabel: 'Validated Graph Nodes',
    score: '97.5',
    scoreColor: 'text-sky-700 bg-sky-50 border-sky-200',
    badge: 'SGE Ready',
    description: 'Schema.org JSON-LD entity graph validation enabling rich search snippets and generative AI engine comprehension.',
    icon: Sparkles,
    accentColor: '#e879f9',
    route: '/alloster',
    vectors: [
      { name: 'BreadcrumbList Schema', value: 'Valid Structure', status: 'pass' },
      { name: 'Organization & Author Nodes', value: 'Linked Graph', status: 'optimal' },
      { name: 'TechArticle & HowTo Schema', value: 'Syntactically Valid', status: 'verified' },
      { name: 'Microdata / RDFa Errors', value: '0 Warnings', status: 'pass' }
    ],
    telemetryDetails: {
      benchmark: 'Google Search Central Structured Data & Schema.org Specification v26',
      cliCommand: 'npx catalystlab audit --engine=alloster https://yoursite.com',
      sampleMetricSummary: 'Parses nested JSON-LD scripts to verify entity connectedness for generative AI citation engines.',
      probes: [
        'Schema Syntactic Validation: 100% compliant with Schema.org v26',
        'Google Rich Results Compatibility: Qualified for 4 rich features',
        'Entity Disambiguation URI: Wikidata / Wikipedia linked',
        'JSON-LD Microdata Nesting: Valid hierarchical graph representation'
      ]
    }
  }
];

export const FeaturedAuditMetrics: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [dragProgress, setDragProgress] = useState<number>(0);
  const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false);
  const [canScrollRight, setCanScrollRight] = useState<boolean>(true);
  const [maxDragWidth, setMaxDragWidth] = useState<number>(1800);
  
  // Interactive Inspector Modal State
  const [inspectedMetric, setInspectedMetric] = useState<AuditMetricItem | null>(null);
  const [copiedCli, setCopiedCli] = useState<boolean>(false);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter metrics
  const filteredMetrics = selectedCategory === 'all' 
    ? FEATURED_AUDIT_METRICS 
    : FEATURED_AUDIT_METRICS.filter((m) => m.category === selectedCategory);

  // Calculate drag bounds
  const updateDragBounds = () => {
    if (sliderRef.current && containerRef.current) {
      const scrollWidth = sliderRef.current.scrollWidth;
      const clientWidth = containerRef.current.clientWidth;
      const calculatedMax = Math.max(0, scrollWidth - clientWidth);
      setMaxDragWidth(calculatedMax);
    }
  };

  useEffect(() => {
    updateDragBounds();
    window.addEventListener('resize', updateDragBounds);
    return () => window.removeEventListener('resize', updateDragBounds);
  }, [filteredMetrics]);

  // Framer motion drag X coordinate value
  const dragX = useMotionValue(0);

  // Update progress bar and scroll arrows on drag
  const handleDrag = () => {
    const currentX = dragX.get();
    if (maxDragWidth > 0) {
      const progress = Math.min(100, Math.max(0, (-currentX / maxDragWidth) * 100));
      setDragProgress(progress);
      setCanScrollLeft(currentX < -10);
      setCanScrollRight(currentX > -maxDragWidth + 10);
    }
  };

  // Programmatic Scroll Buttons with Smooth Animation
  const scrollStep = (direction: 'left' | 'right') => {
    const currentX = dragX.get();
    const stepSize = 380;
    let targetX = direction === 'left' ? currentX + stepSize : currentX - stepSize;
    targetX = Math.min(0, Math.max(-maxDragWidth, targetX));
    dragX.set(targetX);
    
    if (maxDragWidth > 0) {
      const progress = Math.min(100, Math.max(0, (-targetX / maxDragWidth) * 100));
      setDragProgress(progress);
      setCanScrollLeft(targetX < -10);
      setCanScrollRight(targetX > -maxDragWidth + 10);
    }
  };

  const copyCli = (command: string) => {
    navigator.clipboard.writeText(command);
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  const categories = [
    { id: 'all', label: 'All Vectors Active', count: 8 },
    { id: 'performance', label: 'Core Performance', count: 2 },
    { id: 'security', label: 'OWASP Security', count: 2 },
    { id: 'ai_eco', label: 'AI & Carbon', count: 2 },
    { id: 'architecture', label: 'Architecture', count: 2 },
  ];

  const currentCategory = categories.find((c) => c.id === selectedCategory) || categories[0];

  return (
    <section className="py-10 lg:py-12 bg-[#f8fafc] border-y border-brand-gray text-brand-navy relative overflow-hidden">
      
      {/* Background Subtle Gradient Accents */}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* =========================================================================
            SECTION HEADER & CONTROLS
        ========================================================================= */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-6 border-b border-brand-gray">
          
          <div className="space-y-2.5 max-w-2xl text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-gray bg-white px-3.5 py-1 text-sm font-mono text-brand-slate-hover shadow-sm">
              <Activity className="h-3.5 w-3.5 text-sky-600 animate-pulse" />
              <span>Continuous SDLC Observability • 8 Vector Metrics</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black font-sans tracking-tight text-brand-navy">
              Featured Audit Telemetry Metrics
            </h2>
            
            <p className="text-sm sm:text-base text-brand-slate leading-relaxed">
              Real-time synthetic probes benchmarked across 42 global edge points of presence. Select any vector to launch targeted diagnostics.
            </p>
          </div>

          {/* Interactive Dropdown & Minimalist Scroll Controls - Top Right Corner */}
          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
            
            {/* Minimalist Dropdown Selector */}
            <div ref={dropdownRef} className="relative inline-block text-left">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-1.5 text-sm font-mono text-brand-slate-hover hover:text-slate-900 bg-white border border-brand-gray py-1.5 px-3 rounded-xl shadow-sm hover:bg-brand-offwhite transition-colors cursor-pointer"
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
              >
                <span className="text-slate-400">Filter:</span>
                <span className="font-semibold text-brand-navy">{currentCategory.label}</span>
                <ChevronDown className={`h-3 w-3 text-sky-600 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.98 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 mt-1.5 w-48 rounded-xl bg-white border border-brand-gray shadow-xl py-1.5 z-40 font-mono text-sm"
                  >
                    {categories.map((cat) => {
                      const isSelected = selectedCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setSelectedCategory(cat.id);
                            setIsDropdownOpen(false);
                            dragX.set(0);
                            setDragProgress(0);
                            setCanScrollLeft(false);
                            setCanScrollRight(true);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-1.5 transition-colors text-left cursor-pointer ${
                            isSelected
                              ? 'bg-sky-50 text-sky-700 font-bold'
                              : 'text-brand-slate-hover hover:text-slate-900 hover:bg-brand-offwhite'
                          }`}
                        >
                          <span>{cat.label}</span>
                          <span className={`text-xs ${isSelected ? 'text-sky-700' : 'text-slate-400'}`}>
                            {cat.count}
                          </span>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Minimalist Navigation Arrows & Drag Hint */}
            <div className="flex items-center gap-1.5 text-sm font-mono">
              <span className="hidden sm:inline text-slate-400 text-sm">Drag to explore</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => scrollStep('left')}
                  disabled={!canScrollLeft}
                  className={`p-2 rounded-xl bg-white border border-brand-gray transition-colors shadow-sm cursor-pointer ${
                    canScrollLeft
                      ? 'text-brand-slate-hover hover:text-slate-900 hover:bg-brand-offwhite'
                      : 'text-slate-300 cursor-not-allowed opacity-50'
                  }`}
                  aria-label="Scroll metrics left"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollStep('right')}
                  disabled={!canScrollRight}
                  className={`p-2 rounded-xl bg-white border border-brand-gray transition-colors shadow-sm cursor-pointer ${
                    canScrollRight
                      ? 'text-brand-slate-hover hover:text-slate-900 hover:bg-brand-offwhite'
                      : 'text-slate-300 cursor-not-allowed opacity-50'
                  }`}
                  aria-label="Scroll metrics right"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Scroll / Drag Track Progress Bar */}
        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden my-4">
          <motion.div
            style={{ width: `${Math.max(15, dragProgress)}%` }}
            className="h-full bg-gradient-to-r from-slate-700 to-brand-navy rounded-full transition-all duration-150"
          />
        </div>

        {/* =========================================================================
            FRAMER MOTION DRAGGABLE CAROUSEL TRACK
        ========================================================================= */}
        <div ref={containerRef} className="relative overflow-hidden cursor-grab active:cursor-grabbing select-none py-2">
          
          <motion.div
            ref={sliderRef}
            drag="x"
            dragConstraints={{ right: 0, left: -maxDragWidth }}
            dragElastic={0.12}
            dragMomentum={true}
            style={{ x: dragX }}
            onDrag={handleDrag}
            className="flex gap-5 w-max items-stretch pb-2"
          >
            {filteredMetrics.map((metric) => {
              const IconComponent = metric.icon;

              return (
                <div
                  key={metric.id}
                  className="w-[300px] sm:w-[330px] flex-shrink-0 flex flex-col justify-between bg-white border border-brand-gray/90 hover:border-brand-slate/30 rounded-2xl p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-navy/5 group relative overflow-hidden"
                >
                  {/* Subtle top accent gradient line */}
                  <div 
                    className="absolute top-0 inset-x-0 h-1 bg-brand-navy opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />

                  {/* Header: Phase badge & Score */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-mono font-semibold text-brand-slate-light tracking-wide uppercase flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                        {metric.phase}
                      </span>
                      <span className={`text-sm font-mono font-bold px-2 py-0.5 rounded border ${metric.scoreColor}`}>
                        {metric.score}
                      </span>
                    </div>

                    {/* Title and Icon */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base sm:text-lg font-bold font-sans text-brand-navy group-hover:text-sky-700 transition-colors leading-tight">
                          {metric.title}
                        </h3>
                        <p className="text-sm font-mono text-brand-slate-light mt-1">
                          {metric.engineName}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-brand-ghost border border-brand-gray flex items-center justify-center text-brand-navy shrink-0 group-hover:bg-brand-navy group-hover:text-white transition-all">
                        <IconComponent className="h-5 w-5" />
                      </div>
                    </div>

                    {/* Primary Highlight Metric Box */}
                    <div className="p-3.5 rounded-xl bg-brand-offwhite border border-brand-gray/80 flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-black font-mono text-brand-navy tracking-tight">
                          {metric.highlightValue}
                        </div>
                        <div className="text-sm font-mono text-brand-slate-light mt-0.5">
                          {metric.highlightLabel}
                        </div>
                      </div>
                      <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-white border border-brand-gray text-brand-slate-hover shadow-2xs">
                        {metric.badge}
                      </span>
                    </div>
                  </div>

                  {/* Card Footer / CTA Text Action */}
                  <div className="pt-4 mt-4 border-t border-brand-greige">
                    <Link
                      to={metric.route}
                      className="w-full flex items-center justify-center gap-2 bg-brand-navy hover:bg-[#1b2a4a] text-white py-2.5 px-4 rounded-xl font-mono text-sm font-bold transition-all shadow-sm active:scale-[0.98] group-hover:shadow-md cursor-pointer"
                    >
                      <span>Run Vector Audit</span>
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>

                </div>
              );
            })}
          </motion.div>

        </div>

      </div>

      {/* =========================================================================
          INTERACTIVE TELEMETRY INSPECTOR MODAL / DRAWER
      ========================================================================= */}
      <AnimatePresence>
        {inspectedMetric && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-5">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setInspectedMetric(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Dialog Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white border border-brand-gray rounded-3xl p-5 sm:p-8 shadow-2xl text-left z-10 space-y-6 overflow-hidden max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setInspectedMetric(null)}
                className="absolute top-5 right-5 p-2 rounded-xl bg-brand-ghost border border-brand-gray text-brand-slate hover:text-brand-navy hover:bg-slate-200 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Header */}
              <div className="space-y-2 pr-10">
                <div className="flex items-center gap-2 text-sm font-mono text-sky-600">
                  <span className="h-2 w-2 rounded-full bg-sky-500 animate-ping" />
                  <span>{inspectedMetric.phase}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black font-sans text-brand-navy">
                  {inspectedMetric.title} Telemetry Vector
                </h3>
                <p className="text-sm sm:text-base text-brand-slate">
                  {inspectedMetric.telemetryDetails.benchmark}
                </p>
              </div>

              {/* Primary Values Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {inspectedMetric.vectors.map((vec, idx) => (
                  <div key={idx} className="bg-brand-offwhite p-3 rounded-xl border border-brand-gray font-mono">
                    <div className="text-xs text-brand-slate-light truncate">{vec.name}</div>
                    <div className="text-base font-bold text-brand-navy mt-1">{vec.value}</div>
                    <div className="text-xs text-emerald-600 uppercase font-bold mt-0.5">● {vec.status}</div>
                  </div>
                ))}
              </div>

              {/* Live CLI Command with Copy */}
              <div className="space-y-2">
                <div className="text-sm font-mono text-brand-slate flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="h-3.5 w-3.5 text-sky-600" />
                    <span>Run Synthetic Vector Probe via Terminal</span>
                  </span>
                  <span className="text-xs text-slate-400">Node.js / CI CLI</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3 text-sm font-mono text-slate-100">
                  <span className="text-slate-200 truncate">
                    {inspectedMetric.telemetryDetails.cliCommand}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyCli(inspectedMetric.telemetryDetails.cliCommand)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm transition-colors shrink-0 cursor-pointer"
                  >
                    {copiedCli ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Autonomous Probes Breakdown List */}
              <div className="bg-brand-offwhite p-4 rounded-2xl border border-brand-gray space-y-2.5 font-mono text-sm">
                <div className="flex items-center justify-between text-brand-slate pb-1.5 border-b border-brand-gray">
                  <span>Simulated AST Inspection Probes</span>
                  <span className="text-emerald-600 font-bold">4/4 Validated</span>
                </div>
                <div className="space-y-1.5">
                  {inspectedMetric.telemetryDetails.probes.map((probe, pIdx) => (
                    <div key={pIdx} className="flex items-center gap-2 text-brand-slate-hover text-sm">
                      <span className="text-sky-600 font-bold">›</span>
                      <span>{probe}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setInspectedMetric(null)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-brand-gray text-sm font-mono text-brand-slate-hover hover:bg-brand-ghost transition-colors cursor-pointer"
                >
                  Dismiss
                </button>
                <Link
                  to={inspectedMetric.route}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand-navy hover:bg-[#152238] text-white px-6 py-2.5 rounded-xl text-sm font-mono font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <span>Launch {inspectedMetric.engineName}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
};

export default FeaturedAuditMetrics;
