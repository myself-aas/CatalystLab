import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
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
    route: '/health',
    keywords: ['health', 'dom', 'vitals', 'ttfb', 'inp', 'cls', 'lcp', 'performance']
  },
  {
    id: 'engine-ai-readiness',
    title: 'AI Readiness & llms.txt',
    category: 'Engine',
    description: 'llms.txt manifests, AI bot crawler access, and JSON-LD schema.',
    route: '/ai-readiness',
    keywords: ['ai', 'llms.txt', 'robots.txt', 'gptbot', 'claudebot', 'schema', 'rag']
  },
  {
    id: 'engine-compliance',
    title: 'OWASP Security & Compliance',
    category: 'Engine',
    description: 'OWASP security headers, CSP, HSTS, and WCAG 2.2 AA accessibility.',
    route: '/compliance',
    keywords: ['security', 'owasp', 'csp', 'hsts', 'wcag', 'compliance', 'headers', 'cookie']
  },
  {
    id: 'engine-latency',
    title: 'Global Edge Latency Radar',
    category: 'Engine',
    description: '12 Global Edge PoPs, DNS lookup latency, and TLS 1.3 handshake.',
    route: '/latency',
    keywords: ['latency', 'edge', 'pops', 'ttfb', 'dns', 'tls', 'speed', 'global']
  },
  {
    id: 'engine-eco-audit',
    title: 'Eco-Carbon & Green Hosting',
    category: 'Engine',
    description: 'SWD CO2 carbon footprint model and renewable energy hosting audit.',
    route: '/eco-audit',
    keywords: ['eco', 'carbon', 'co2', 'green', 'sustainability', 'energy']
  },
  {
    id: 'engine-repo-scanner',
    title: 'Git Repository Hygiene & SecOps',
    category: 'Engine',
    description: 'Git security audit, SECURITY.md, license compliance, and commit velocity.',
    route: '/repo-scanner',
    keywords: ['repo', 'git', 'github', 'secops', 'license', 'security.md']
  },
  {
    id: 'engine-llmo',
    title: 'Generative Engine Optimization (LLMO)',
    category: 'Engine',
    description: 'AI Search citation extraction for Perplexity, ChatGPT Search, and Gemini.',
    route: '/llmo',
    keywords: ['llmo', 'ai search', 'perplexity', 'chatgpt', 'citation', 'entity']
  },
  {
    id: 'engine-migration',
    title: 'Platform Migration Risk Audit',
    category: 'Engine',
    description: 'Technical debt, headless re-platforming risk, and CDN compatibility.',
    route: '/migration',
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
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'API':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'Blog':
        return 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30';
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
          width: isOpen ? (window.innerWidth < 640 ? '220px' : '280px') : '36px',
        }}
        transition={{ type: 'spring', stiffness: 450, damping: 35 }}
        className={`relative flex items-center h-9 rounded-full transition-colors overflow-visible ${
          isOpen
            ? 'bg-card border border-accent/50 text-foreground shadow-linear-card ring-2 ring-accent/20'
            : 'bg-card/80 border border-border-default text-foreground-muted hover:text-foreground hover:bg-card-hover hover:border-accent/40 shadow-linear-card'
        }`}
      >
        {/* Search Trigger / Left Icon */}
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            setTimeout(() => inputRef.current?.focus(), 50);
          }}
          className={`h-9 w-9 flex items-center justify-center shrink-0 cursor-pointer rounded-full transition-transform active:scale-95 ${
            !isOpen ? 'w-9' : 'w-8 pl-1.5'
          }`}
          aria-label="Search"
          title={isOpen ? 'Search' : 'Search (Cmd+K)'}
        >
          <Search className="size-3.5 shrink-0 text-foreground-muted" />
        </button>

        {/* Expandable Input Field */}
        {isOpen && (
          <div className="flex items-center w-full pr-1.5 overflow-hidden">
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
              placeholder="Search engines, docs..."
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
                className="p-1 rounded-md hover:bg-muted/80 transition-colors shrink-0 text-foreground-muted hover:text-foreground"
                title="Clear input"
              >
                <X className="size-3" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setQuery('');
                }}
                className="px-1.5 py-0.5 rounded-md text-[10px] font-mono shrink-0 transition-colors bg-muted/60 text-foreground-muted hover:text-foreground"
                title="Close search"
              >
                Esc
              </button>
            )}
          </div>
        )}
      </motion.div>

      {/* Typing Suggestions Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border border-border-default bg-card/95 shadow-linear-card z-50 overflow-hidden font-mono text-xs backdrop-blur-2xl text-foreground"
          >
            {/* Header label inside dropdown */}
            <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-border-default bg-muted/20 text-[10px] uppercase tracking-wider text-foreground-muted">
              <span>{query ? `Suggestions for "${query}"` : 'Quick Navigation'}</span>
              <span className="text-[10px] font-normal normal-case opacity-75">↑↓ Navigate • ↵ Select</span>
            </div>

            {/* Suggestions list */}
            <div className="max-h-[320px] overflow-y-auto p-1.5 space-y-1">
              {filteredItems.length > 0 ? (
                filteredItems.map((item, idx) => {
                  const isSelected = selectedIndex === idx;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex items-start gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
                        isSelected
                          ? 'bg-muted/80 text-foreground shadow-2xs'
                          : 'hover:bg-muted/40 text-foreground-muted'
                      }`}
                    >
                      {/* Left icon according to category */}
                      <div className="mt-0.5 shrink-0">
                        {item.category === 'Engine' && (
                          <Zap className="size-3.5 text-amber-400" />
                        )}
                        {item.category === 'Docs' && (
                          <FileText className="size-3.5 text-emerald-400" />
                        )}
                        {item.category === 'API' && (
                          <Code className="size-3.5 text-purple-400" />
                        )}
                        {item.category === 'Blog' && (
                          <Sparkles className="size-3.5 text-indigo-400" />
                        )}
                        {item.category === 'Platform' && (
                          <Layers className={`size-3.5 ${isSelected ? 'text-foreground' : 'text-foreground-muted'}`} />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1.5">
                          <span className={`text-xs font-medium truncate ${
                            isSelected ? 'text-foreground font-semibold' : ''
                          }`}>
                            {item.title}
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-md border font-mono shrink-0 ${getCategoryBadgeClass(item.category)}`}>
                            {item.category}
                          </span>
                        </div>
                        <p className="text-[11px] truncate mt-0.5 text-foreground-muted">
                          {item.description}
                        </p>
                      </div>

                      {isSelected && (
                        <ArrowRight className="size-3 mt-1 shrink-0 text-accent-bright" />
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="px-4 py-5 text-center">
                  <p className="text-xs text-foreground-muted">
                    No direct matches found for "{query}"
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      navigate(`/docs?search=${encodeURIComponent(query)}`);
                    }}
                    className="mt-2 text-[11px] text-accent-bright hover:underline flex items-center justify-center gap-1 mx-auto focus-visible:outline-none"
                  >
                    <span>Search full documentation</span>
                    <ArrowRight className="size-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Quick action chips when not typing */}
            {!query && (
              <div className="px-3 py-2 border-t border-border-default bg-muted/20 flex flex-wrap items-center gap-1.5 text-[10px] text-foreground-muted">
                <span>Trending:</span>
                <button
                  type="button"
                  onClick={() => handleSelect(STATIC_SUGGESTIONS[0])}
                  className="px-2 py-0.5 rounded-md hover:bg-muted/80 text-foreground font-medium cursor-pointer transition-colors"
                >
                  Health
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => handleSelect(STATIC_SUGGESTIONS[1])}
                  className="px-2 py-0.5 rounded-md hover:bg-muted/80 text-foreground font-medium cursor-pointer transition-colors"
                >
                  llms.txt
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => handleSelect(STATIC_SUGGESTIONS[2])}
                  className="px-2 py-0.5 rounded-md hover:bg-muted/80 text-foreground font-medium cursor-pointer transition-colors"
                >
                  OWASP
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => handleSelect(STATIC_SUGGESTIONS[11])}
                  className="px-2 py-0.5 rounded-md hover:bg-muted/80 text-foreground font-medium cursor-pointer transition-colors"
                >
                  API
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NavbarSearch;
