import React, { useState, useEffect, useRef } from 'react';
import { clickableProps } from '../../lib/keyboard';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  SearchX,
  X,
  ArrowRight,
  Sparkles,
  Zap,
  ShieldCheck,
  Bot,
  FileText,
  Code,
  Globe,
  Leaf,
  Layers,
  CheckCircle2,
  Sliders
} from 'lucide-react';
import { getBlogPosts } from '../../lib/firebase';

export interface SearchSuggestionItem {
  id: string;
  title: string;
  category: 'Docs' | 'Engine' | 'API' | 'Blog' | 'Platform';
  description: string;
  route: string;
  keywords: string[];
}

const STATIC_SUGGESTIONS: SearchSuggestionItem[] = [
  {
    id: 'engine-health',
    title: 'Website Health & DOM Engine',
    category: 'Engine',
    description: 'DOM tree depth (≤32 levels), TTFB, and Core Web Vitals.',
    route: '/docs/vitalzyme',
    keywords: ['health', 'dom', 'vitals', 'ttfb', 'inp', 'cls', 'lcp', 'performance']
  },
  {
    id: 'engine-ai-readiness',
    title: 'AI Readiness & llms.txt',
    category: 'Engine',
    description: 'llms.txt manifests, AI bot crawler access, and JSON-LD schema.',
    route: '/docs/llm-kinase',
    keywords: ['ai', 'llms.txt', 'robots.txt', 'gptbot', 'claudebot', 'schema', 'rag']
  },
  {
    id: 'engine-compliance',
    title: 'OWASP Security & Compliance',
    category: 'Engine',
    description: 'OWASP security headers, CSP, HSTS, and WCAG 2.2 AA accessibility.',
    route: '/docs/riskprotease',
    keywords: ['security', 'owasp', 'csp', 'hsts', 'wcag', 'compliance', 'headers', 'cookie']
  },
  {
    id: 'engine-latency',
    title: 'Global Edge Latency Radar',
    category: 'Engine',
    description: '12 Global Edge PoPs, DNS lookup latency, and TLS 1.3 handshake.',
    route: '/docs/edgevmax',
    keywords: ['latency', 'edge', 'pops', 'ttfb', 'dns', 'tls', 'speed', 'global']
  },
  {
    id: 'engine-eco-audit',
    title: 'Eco-Carbon & Green Hosting',
    category: 'Engine',
    description: 'SWD CO2 carbon footprint model and renewable energy hosting audit.',
    route: '/docs/ecoholo',
    keywords: ['eco', 'carbon', 'co2', 'green', 'sustainability', 'energy']
  },
  {
    id: 'engine-repo-scanner',
    title: 'Git Repository Hygiene & SecOps',
    category: 'Engine',
    description: 'Git security audit, SECURITY.md, license compliance, and commit velocity.',
    route: '/docs/gitlygase',
    keywords: ['repo', 'git', 'github', 'secops', 'license', 'security.md']
  },
  {
    id: 'engine-llmo',
    title: 'Generative Engine Optimization (LLMO)',
    category: 'Engine',
    description: 'AI Search citation extraction for Perplexity, ChatGPT Search, and Gemini.',
    route: '/docs/allostersearch',
    keywords: ['llmo', 'ai search', 'perplexity', 'chatgpt', 'citation', 'entity']
  },
  {
    id: 'engine-migration',
    title: 'Platform Migration Risk Audit',
    category: 'Engine',
    description: 'Technical debt, headless re-platforming risk, and CDN compatibility.',
    route: '/docs/synthshift',
    keywords: ['migration', 'risk', 'headless', 're-platforming', 'cms', 'upgrade']
  },
  {
    id: 'doc-overview',
    title: 'Architecture & Multi-Engine Specs',
    category: 'Docs',
    description: 'Complete 8-engine evaluation pipeline and telemetry specifications.',
    route: '/docs#overview',
    keywords: ['architecture', 'docs', 'specs', 'pipeline', 'overview']
  },
  {
    id: 'doc-quickstart',
    title: 'Quickstart & CLI Guide',
    category: 'Docs',
    description: 'Run audits via CLI (npx catalystlab), REST API, or web interface.',
    route: '/docs#quickstart',
    keywords: ['quickstart', 'cli', 'curl', 'tutorial', 'getting started']
  },
  {
    id: 'doc-scoring',
    title: 'Scoring Matrix & Geometric Weights',
    category: 'Docs',
    description: 'Weighted telemetry index formula across Core Web Vitals, OWASP, and SEO.',
    route: '/docs#scoring-matrix',
    keywords: ['scoring', 'matrix', 'weights', 'formula', 'vitals']
  },
  {
    id: 'api-docs',
    title: 'REST API & JSON Endpoints',
    category: 'API',
    description: 'Programmatic REST API reference, POST /api/run-engine, and schema models.',
    route: '/api-docs',
    keywords: ['api', 'rest', 'endpoints', 'json', 'curl', 'developer']
  },
  {
    id: 'api-playground',
    title: 'Interactive API Playground',
    category: 'API',
    description: 'Live testbed for REST queries, webhook simulations, and response payloads.',
    route: '/playground',
    keywords: ['playground', 'test', 'sandbox', 'api', 'live']
  },
  {
    id: 'page-pricing',
    title: 'Pricing & Diagnostic Tier Plans',
    category: 'Platform',
    description: 'Free community tier, Developer API keys, and Enterprise plans.',
    route: '/pricing',
    keywords: ['pricing', 'plans', 'cost', 'subscription', 'free', 'enterprise', 'tiers']
  },
  {
    id: 'page-products',
    title: 'Products & Custom Domain Monitoring',
    category: 'Platform',
    description: 'Plugins and integrations inside custom domains for automated continuous monitoring.',
    route: '/products',
    keywords: ['products', 'plugins', 'integrations', 'custom domain', 'monitoring', 'watchdog', 'cicd', 'github action', 'webhooks']
  },
  {
    id: 'page-reports',
    title: 'Diagnostic Reports & Saved Audits',
    category: 'Platform',
    description: 'Access stored telemetry reports, audit history, and shareable links.',
    route: '/reports',
    keywords: ['reports', 'saved', 'audits', 'history', 'exports']
  },
  {
    id: 'page-blogs',
    title: 'Engineering Blogs & Case Studies',
    category: 'Blog',
    description: 'Deep dives on modern web performance, edge architecture, and AI search.',
    route: '/blogs',
    keywords: ['blogs', 'articles', 'case studies', 'news', 'engineering']
  }
];

interface NavbarSearchProps {
  isScrolled: boolean;
}

export const NavbarSearch: React.FC<NavbarSearchProps> = ({ isScrolled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [blogItems, setBlogItems] = useState<SearchSuggestionItem[]>([]);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Load blog articles for live suggestions
  useEffect(() => {
    const loadBlogs = async () => {
      try {
        const posts = await getBlogPosts();
        const items: SearchSuggestionItem[] = posts.slice(0, 10).map((p) => ({
          id: `blog-${p.id || p.slug}`,
          title: p.title,
          category: 'Blog',
          description: p.excerpt || 'Engineering article on web infrastructure and telemetry.',
          route: `/blog/${p.slug || p.id}`,
          keywords: ['blog', 'article', p.category, ...(p.tags || [])]
        }));
        setBlogItems(items);
      } catch {
        // Silently fallback to static suggestions
      }
    };
    loadBlogs();
  }, []);

  // Handle global keyboard shortcuts (Cmd+K / Ctrl+K or '/')
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in another input or textarea
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) && target !== inputRef.current) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      } else if (e.key === '/' && !isOpen) {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isOpen]);

  // Handle click outside to collapse
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 60);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // All combined items
  const allItems = [...STATIC_SUGGESTIONS, ...blogItems];

  // Filter items based on query
  const filteredItems = query.trim()
    ? allItems
        .filter((item) => {
          const q = query.toLowerCase().trim();
          const titleMatch = item.title.toLowerCase().includes(q);
          const descMatch = item.description.toLowerCase().includes(q);
          const categoryMatch = item.category.toLowerCase().includes(q);
          const keywordMatch = item.keywords.some((k) => k.toLowerCase().includes(q));
          return titleMatch || descMatch || categoryMatch || keywordMatch;
        })
        .slice(0, 6)
    : allItems.slice(0, 5); // Default top 5 suggestions when empty

  const handleSelect = (item: SearchSuggestionItem) => {
    setIsOpen(false);
    setQuery('');
    
    if (item.route.startsWith('/docs#')) {
      const hash = item.route.replace('/docs#', '');
      navigate('/docs');
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) {
          const y = el.getBoundingClientRect().top + window.pageYOffset - 90;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 100);
    } else {
      navigate(item.route);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        handleSelect(filteredItems[selectedIndex]);
      } else if (query.trim()) {
        // If user pressed enter on custom query
        setIsOpen(false);
        navigate(`/docs?search=${encodeURIComponent(query.trim())}`);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      if (query) {
        setQuery('');
      } else {
        setIsOpen(false);
      }
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'Engine':
        return 'bg-accent/15 text-accent-bright border-accent/30';
      case 'Docs':
        return 'bg-cream/10 text-emerald-400 border-emerald-500/30';
      case 'API':
        return 'bg-cream/10 text-purple-400 border-purple-500/30';
      case 'Blog':
        return 'bg-cream/10 text-indigo-300 border-indigo-500/30';
      default:
        return 'bg-muted/40 text-foreground-muted border-border-default';
    }
  };

  return (
    <div ref={containerRef} className="relative inline-flex items-center">
      {/* Search Bar Container with Fluid Expand Animation */}
      <motion.div
        initial={false}
        animate={{
          width: isOpen ? (window.innerWidth < 640 ? '200px' : '260px') : '40px',
        }}
        transition={{ type: 'spring', stiffness: 450, damping: 35 }}
        className={`relative flex items-center h-10 rounded-full transition-colors overflow-visible ${
          isOpen
            ? 'bg-background border border-accent/50 text-foreground shadow-lg ring-2 ring-accent/20 focus-within:ring-ring px-2'
            : 'hover:bg-foreground/15 text-foreground transition-colors'
        }`}
      >
        {/* Search Trigger / Left Icon */}
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            setTimeout(() => inputRef.current?.focus(), 50);
          }}
          className={`h-10 w-10 flex items-center justify-center shrink-0 cursor-pointer rounded-full transition-transform active:scale-95 ${
            !isOpen ? 'text-foreground' : 'w-8 pl-1'
          }`}
          aria-label="Search"
          title={isOpen ? 'Search' : 'Search (Cmd+K)'}
        >
          <Search className="size-5 shrink-0 stroke-[2]" />
        </button>

        {/* Expandable Input Field */}
        {isOpen && (
          <div className="flex items-center w-full pr-1 overflow-hidden">
            <input
              ref={inputRef}
              type="text"
              aria-label="Search CatalystLab"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search..."
              className="w-full bg-transparent text-xs font-mono py-1.5 pr-1 focus:outline-none placeholder:text-[11px] text-foreground placeholder:text-foreground-muted/60"
            />

            {/* Clear or Close Button */}
            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  inputRef.current?.focus();
                }}
                className="p-1 rounded-md hover:bg-foreground/10 transition-colors shrink-0 text-foreground-muted hover:text-foreground"
                title="Clear input"
              >
                <X className="size-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setQuery('');
                }}
                className="px-1.5 py-0.5 rounded-md text-[11px] font-mono shrink-0 transition-colors bg-foreground/10 text-foreground-muted hover:text-foreground"
                title="Close search"
              >
                Esc
              </button>
            )}
          </div>
        )}
      </motion.div>

      {/* Simplified Dropdown Suggestions Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-full mt-2 w-72 sm:w-88 rounded-2xl border border-border bg-background/95 shadow-xl z-50 overflow-hidden font-mono text-xs backdrop-blur-xl text-foreground"
          >
            {/* Header label inside dropdown */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30 text-[11px] uppercase tracking-wider text-foreground-muted">
              <span>{query ? `Results for "${query}"` : 'Quick Jump'}</span>
              <span>↑↓ / ↵</span>
            </div>

            {/* Suggestions grouped by category in a grid layout */}
            <div className="max-h-[340px] overflow-y-auto p-2 space-y-3">
              {filteredItems.length > 0 ? (
                Object.entries(
                  filteredItems.reduce((acc, item) => {
                    const cat = item.category || 'Platform';
                    if (!acc[cat]) acc[cat] = [];
                    acc[cat].push(item);
                    return acc;
                  }, {} as Record<string, SearchSuggestionItem[]>)
                ).map(([category, items]) => (
                  <div key={category} className="space-y-1">
                    <div className="px-2 py-0.5 text-[11px] font-mono font-semibold uppercase tracking-wider text-foreground-muted/70">
                      {category}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                      {items.map((item) => {
                        const globalIdx = filteredItems.findIndex((i) => i.id === item.id);
                        const isSelected = selectedIndex === globalIdx;
                        return (
                          <div
                            key={item.id}
                            {...clickableProps} onClick={() => handleSelect(item)}
                            onMouseEnter={() => setSelectedIndex(globalIdx)}
                            className={`flex flex-col justify-between p-2.5 rounded-xl cursor-pointer transition duration-150 border ${
                              isSelected
                                ? 'bg-foreground/10 border-accent/40 text-foreground shadow-sm'
                                : 'bg-muted/20 border-border/40 hover:bg-foreground/5 text-foreground-muted hover:text-foreground'
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="text-xs font-medium text-foreground truncate">{item.title}</div>
                              <div className="text-[11px] text-foreground-muted/80 line-clamp-1 mt-0.5">{item.description}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-8 text-center space-y-3">
                  <div className="size-10 mx-auto rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent-bright shadow-inner">
                    <SearchX className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground">No telemetry signals found for "{query}"</p>
                    <p className="text-[11px] text-foreground-muted/70 mt-0.5">Check query syntax or explore engine documentation.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      setQuery('');
                      navigate('/docs');
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground/10 hover:bg-foreground/15 text-foreground text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    <span>Browse Documentation</span>
                    <ArrowRight className="size-3" />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NavbarSearch;
