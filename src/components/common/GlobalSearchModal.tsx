import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  BookOpen, 
  FileText, 
  Code, 
  Cpu, 
  ShieldCheck, 
  Globe, 
  Leaf, 
  Zap, 
  ArrowRight, 
  X, 
  Command,
  Sparkles,
  ExternalLink,
  Tag,
  Clock,
  Layers,
  ChevronRight
} from 'lucide-react';
import { getBlogPosts } from '../../lib/firebase';
import type { BlogPost } from '../../types';

export interface SearchItem {
  id: string;
  title: string;
  category: 'Docs' | 'Engine' | 'API' | 'Blog' | 'Platform';
  description: string;
  route: string;
  keywords: string[];
  icon?: string;
}

const STATIC_DOC_ITEMS: SearchItem[] = [
  {
    id: 'doc-overview',
    title: 'Architecture & Multi-Engine Overview',
    category: 'Docs',
    description: 'Core telemetry architecture, 8 evaluation engines, and headless DOM analyzer specification.',
    route: '/docs#overview',
    keywords: ['architecture', 'overview', 'telemetry', 'engines', 'dom', 'pipeline', 'guide']
  },
  {
    id: 'doc-quickstart',
    title: 'Quickstart: Running Your First Audit',
    category: 'Docs',
    description: 'Step-by-step instructions for running audits via CLI, REST API, or web interface.',
    route: '/docs#quickstart',
    keywords: ['quickstart', 'getting started', 'tutorial', 'curl', 'first audit', 'run']
  },
  {
    id: 'doc-scoring',
    title: 'Telemetry Scoring Matrix & Weights',
    category: 'Docs',
    description: 'Geometric composite weighted index breakdown (Core Web Vitals, TTFB, OWASP, WCAG 2.2).',
    route: '/docs#scoring-matrix',
    keywords: ['scoring', 'matrix', 'weights', 'formula', 'vitals', 'audit score', 'calculator']
  },
  {
    id: 'engine-health',
    title: 'Website Health & DOM Tree Depth Engine',
    category: 'Engine',
    description: 'DOM tree recursion depth (≤32 levels target), node count, and render-blocking resources.',
    route: '/health',
    keywords: ['health', 'dom', 'tree', 'depth', 'inp', 'cls', 'render blocking', 'nodes']
  },
  {
    id: 'engine-ai-readiness',
    title: 'AI Readiness & llms.txt Inspector',
    category: 'Engine',
    description: 'Validates /llms.txt digests, robots.txt crawler access (GPTBot, ClaudeBot), and JSON-LD schemas.',
    route: '/ai-readiness',
    keywords: ['ai readiness', 'llms.txt', 'robots.txt', 'gptbot', 'claudebot', 'perplexity', 'json-ld']
  },
  {
    id: 'engine-repo-scanner',
    title: 'Repository Hygiene & SecOps Engine',
    category: 'Engine',
    description: 'GitHub/GitLab repository architecture, open-source licenses, SECURITY.md, and commit health.',
    route: '/repo-scanner',
    keywords: ['repo', 'git', 'github', 'gitlab', 'secops', 'license', 'security.md', 'hygiene']
  },
  {
    id: 'engine-latency',
    title: 'Global Edge Latency Radar (12 PoPs)',
    category: 'Engine',
    description: 'Multi-region Time-To-First-Byte (TTFB), DNS lookup latency, and TLS 1.3 handshakes.',
    route: '/latency',
    keywords: ['latency', 'ttfb', 'edge', 'pops', 'dns', 'tls', 'global', 'speed', 'radar']
  },
  {
    id: 'engine-eco-audit',
    title: 'Eco-Carbon & Green Hosting Audit',
    category: 'Engine',
    description: 'Estimates CO2 grams per page view and checks Green Web Foundation renewable hosting credentials.',
    route: '/eco-audit',
    keywords: ['eco', 'carbon', 'co2', 'green hosting', 'sustainability', 'energy', 'emissions']
  },
  {
    id: 'engine-compliance',
    title: 'Compliance & Risk Mitigation (OWASP & WCAG)',
    category: 'Engine',
    description: 'Audits WCAG 2.2 AA accessibility contrast, GDPR cookie consent, and HSTS/CSP security headers.',
    route: '/compliance',
    keywords: ['compliance', 'owasp', 'wcag', 'accessibility', 'csp', 'hsts', 'gdpr', 'security headers']
  },
  {
    id: 'engine-llmo',
    title: 'AI Search Optimization (LLMO)',
    category: 'Engine',
    description: 'Semantic citation readiness, AI content extractability, and generative answer brand authority.',
    route: '/llmo',
    keywords: ['llmo', 'ai search', 'answer engine', 'perplexity', 'chatgpt search', 'citation', 'entity']
  },
  {
    id: 'engine-migration',
    title: 'Platform Migration Risk Audit',
    category: 'Engine',
    description: 'Architectural technical debt, headless re-platforming risk, and CDN compatibility.',
    route: '/migration',
    keywords: ['migration', 'risk', 're-platforming', 'headless', 'debt', 'cms', 'upgrade']
  },
  {
    id: 'api-run-engine',
    title: 'REST API: POST /api/run-engine',
    category: 'API',
    description: 'Programmatic JSON endpoint to trigger live audits with automated scoring response.',
    route: '/docs#api-run-engine',
    keywords: ['api', 'rest', 'post', 'endpoint', 'run-engine', 'curl', 'json', 'programmatic']
  },
  {
    id: 'api-schema',
    title: 'JSON Response Schema & Telemetry Objects',
    category: 'API',
    description: 'Complete TypeScript interface and JSON structure for audit payload responses.',
    route: '/docs#api-schema',
    keywords: ['schema', 'json', 'typescript', 'response', 'payload', 'objects', 'metrics']
  },
  {
    id: 'ci-github',
    title: 'GitHub Actions Quality Gate Workflow',
    category: 'Docs',
    description: 'YAML configuration for automated pull request quality gating and regression blocking.',
    route: '/docs#ci-github',
    keywords: ['github actions', 'ci/cd', 'quality gate', 'yaml', 'pipeline', 'automation', 'pr']
  },
  {
    id: 'page-pricing',
    title: 'Pricing & Diagnostic Tier Plans',
    category: 'Platform',
    description: 'Free community tier, Developer API keys, and Enterprise automated monitoring plans.',
    route: '/pricing',
    keywords: ['pricing', 'plans', 'cost', 'subscription', 'free', 'enterprise', 'api key']
  },
  {
    id: 'page-methodology',
    title: 'Diagnostic Methodology & Telemetry Standards',
    category: 'Platform',
    description: 'Scientific principles and measurement tolerances behind CatalystLab evaluation engines.',
    route: '/about',
    keywords: ['methodology', 'standards', 'about', 'team', 'science', 'tolerances', 'accuracy']
  }
];

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [blogItems, setBlogItems] = useState<SearchItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Load blog articles for search
  useEffect(() => {
    const loadBlogs = async () => {
      try {
        const posts = await getBlogPosts();
        const items: SearchItem[] = posts.map((p) => ({
          id: `blog-${p.id || p.slug}`,
          title: p.title,
          category: 'Blog',
          description: p.excerpt || 'Technical article on web infrastructure and telemetry.',
          route: `/blog/${p.slug || p.id}`,
          keywords: ['blog', 'article', p.category, ...(p.tags || [])]
        }));
        setBlogItems(items);
      } catch (err) {
        console.warn('Failed to load blog search items', err);
      }
    };
    loadBlogs();
  }, []);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const allItems = [...STATIC_DOC_ITEMS, ...blogItems];

  const filteredItems = allItems.filter((item) => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    if (!query.trim()) return matchesCategory;

    const q = query.toLowerCase();
    const titleMatch = item.title.toLowerCase().includes(q);
    const descMatch = item.description.toLowerCase().includes(q);
    const keywordMatch = item.keywords.some((k) => k.toLowerCase().includes(q));

    return matchesCategory && (titleMatch || descMatch || keywordMatch);
  });

  const handleSelect = (item: SearchItem) => {
    onClose();
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

  // Keyboard navigation
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
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  const categories = ['All', 'Docs', 'Engine', 'API', 'Blog', 'Platform'];

  const getCategoryBadgeColor = (cat: string) => {
    switch (cat) {
      case 'Docs': return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'Engine': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'API': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Blog': return 'bg-pink-50 text-pink-700 border-pink-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center bg-[#0b192c]/60 p-4 sm:p-6 backdrop-blur-sm pt-20"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center border-b border-[#e2e8f0] px-4 py-3.5 bg-white">
          <Search className="h-4 w-4 text-[#415a77] shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search docs, engines, APIs, guides, and blog articles..."
            className="w-full bg-transparent text-sm text-[#0b192c] placeholder:text-[#94a3b8] focus:outline-none"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="rounded-md p-1 text-[#94a3b8] hover:text-[#0b192c]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <div className="hidden sm:flex items-center gap-1 rounded-md border border-[#e2e8f0] bg-[#f8fafc] px-2 py-0.5 text-[10px] font-medium text-[#64748b] ml-2">
            <span>ESC</span>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto border-b border-[#f1f5f9] bg-[#f8fafc] px-4 py-2 text-xs">
          <span className="text-[11px] font-bold text-[#64748b] mr-1 uppercase tracking-wider">Filter:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setSelectedIndex(0);
              }}
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold transition-all whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-[#0b192c] text-white shadow-xs'
                  : 'bg-white text-[#64748b] border border-[#e2e8f0] hover:text-[#0b192c] hover:bg-[#f1f5f9]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2 divide-y divide-[#f1f5f9]">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#64748b]">
              <BookOpen className="mx-auto h-8 w-8 text-[#cbd5e1] mb-2" />
              <div className="font-semibold text-[#0b192c]">No technical resources matched your search</div>
              <div className="mt-1">Try broader terms like "latency", "DOM", "API", or "OWASP"</div>
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-start justify-between gap-3 rounded-xl p-3 cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#f1f5f9]' : 'hover:bg-[#f8fafc]'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full border px-2 py-0.2 text-[10px] font-bold ${getCategoryBadgeColor(item.category)}`}>
                        {item.category}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-[#0b192c]">
                        {item.title}
                      </h4>
                    </div>
                    <p className="text-xs text-[#64748b] line-clamp-1">
                      {item.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center text-[#94a3b8] shrink-0 mt-1">
                    <ChevronRight className={`h-4 w-4 transition-transform ${isSelected ? 'text-[#0b192c] translate-x-0.5' : ''}`} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between border-t border-[#e2e8f0] bg-[#f8fafc] px-4 py-2 text-[11px] text-[#64748b]">
          <div className="flex items-center gap-3">
            <span><strong>↑↓</strong> Navigate</span>
            <span><strong>↵</strong> Select</span>
            <span><strong>ESC</strong> Close</span>
          </div>
          <div className="text-[10px] text-[#94a3b8]">
            CatalystLab Global Index
          </div>
        </div>
      </div>
    </div>
  );
};
