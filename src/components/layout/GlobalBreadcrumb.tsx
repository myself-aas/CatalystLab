import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  ChevronRight, 
  ArrowLeft, 
  Copy, 
  Check, 
  BookOpen, 
  Terminal, 
  Activity, 
  ShieldCheck, 
  Layers, 
  Sparkles, 
  FileText, 
  Scale, 
  HelpCircle, 
  Cpu, 
  Globe, 
  FolderGit2, 
  Leaf, 
  Key, 
  Mail, 
  DollarSign, 
  Package, 
  ShieldAlert,
  BarChart3
} from 'lucide-react';
import { ENGINES_MAP } from '../../data/engines';

export interface DynamicCrumb {
  label: string;
  href?: string;
  isCurrent?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface BreadcrumbMeta {
  sectionCategory: string;
  categoryIcon: React.ComponentType<{ className?: string }>;
  categoryColor: string;
  crumbs: DynamicCrumb[];
  parentHref?: string;
}

/**
 * Format dynamic URL slugs into readable, capitalized title strings
 */
export function formatSlugToTitle(slug: string): string {
  if (!slug) return '';
  
  // Clean potential domain strings like openai.com or github.com
  if (slug.includes('.com') || slug.includes('.org') || slug.includes('.io') || slug.includes('.tech') || slug.includes('.ai') || slug.includes('.net')) {
    const cleanDomain = slug.replace(/-(audit|report|analysis|dossier|verification)/gi, '');
    return cleanDomain;
  }

  return slug
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

/**
 * Map of static and prefix routes to structured breadcrumb metadata
 */
export function resolveBreadcrumbs(pathname: string, search: string = ''): BreadcrumbMeta | null {
  // Normalize pathname: remove trailing slash & .html suffix
  let cleanPath = pathname.replace(/\/$/, '');
  cleanPath = cleanPath.replace(/\.html$/, '');
  if (cleanPath === '') cleanPath = '/';

  // If we are on the exact root homepage, no breadcrumb bar is needed
  if (cleanPath === '/') {
    return null;
  }

  // 1. Documentation Suite (/docs/...)
  if (cleanPath.startsWith('/docs')) {
    const docSlug = cleanPath.replace(/^\/docs\/?/, '');
    
    const docTitles: Record<string, string> = {
      '': 'Documentation Suite',
      'overview': 'System Overview',
      'architecture': 'System Architecture',
      'security-sandbox': 'Security Sandbox & Isolation',
      'rate-limiting': 'Rate Limiting & Quotas',
      'scoring-matrix': 'Unified Scoring Matrix',
      'synthshift': 'SynthShift (Cloud Migration)',
      'migration': 'SynthShift (Cloud Migration)',
      'gitlygase': 'GitLygase (Repo Scanner)',
      'repo-scanner': 'GitLygase (Repo Scanner)',
      'ecoholo': 'EcoHolo (Green Audit Engine)',
      'eco-audit': 'EcoHolo (Green Audit Engine)',
      'vitalzyme': 'VitalZyme (Health & Vitality)',
      'health': 'VitalZyme (Health & Vitality)',
      'edgevmax': 'EdgeVmax (Latency & Edge)',
      'latency': 'EdgeVmax (Latency & Edge)',
      'riskprotease': 'RiskProtease (Compliance & Security)',
      'compliance': 'RiskProtease (Compliance & Security)',
      'llm-kinase': 'LLM Kinase (AI Readiness)',
      'ai-readiness': 'LLM Kinase (AI Readiness)',
      'allostersearch': 'AllosterSearch (LLMO)',
      'llmo': 'AllosterSearch (LLMO)',
      'orchestrator': 'Master Audit Orchestrator',
      'master-audit': 'Master Audit Orchestrator',
      'api': 'API Reference & Endpoints',
      'api-reference': 'API Reference & Endpoints',
      'cicd': 'CI/CD & DevOps Automation',
      'devops': 'CI/CD & DevOps Automation',
    };

    if (!docSlug) {
      return {
        sectionCategory: 'Documentation',
        categoryIcon: BookOpen,
        categoryColor: 'text-sky-600 bg-sky-50 border-sky-200',
        crumbs: [
          { label: 'Documentation', isCurrent: true, icon: BookOpen }
        ],
        parentHref: '/'
      };
    }

    const title = docTitles[docSlug] || formatSlugToTitle(docSlug);
    return {
      sectionCategory: 'Documentation',
      categoryIcon: BookOpen,
      categoryColor: 'text-sky-600 bg-sky-50 border-sky-200',
      crumbs: [
        { label: 'Documentation', href: '/docs', icon: BookOpen },
        { label: title, isCurrent: true }
      ],
      parentHref: '/docs'
    };
  }

  // 2. Developer Tools: API Reference & Playground
  if (cleanPath.startsWith('/api-reference') || cleanPath.startsWith('/api-docs') || cleanPath === '/developer/api') {
    if (cleanPath.includes('/category/')) {
      const categorySlug = cleanPath.split('/category/')[1] || '';
      return {
        sectionCategory: 'Developer',
        categoryIcon: Terminal,
        categoryColor: 'text-indigo-600 bg-indigo-50 border-indigo-200',
        crumbs: [
          { label: 'API Reference', href: '/api-reference', icon: Terminal },
          { label: `Category: ${formatSlugToTitle(categorySlug)}`, isCurrent: true }
        ],
        parentHref: '/api-reference'
      };
    }

    return {
      sectionCategory: 'Developer',
      categoryIcon: Terminal,
      categoryColor: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      crumbs: [
        { label: 'API Reference & Endpoints', isCurrent: true, icon: Terminal }
      ],
      parentHref: '/'
    };
  }

  if (cleanPath.startsWith('/playground')) {
    const engineId = cleanPath.replace(/^\/playground\/?/, '');
    if (!engineId) {
      return {
        sectionCategory: 'Interactive',
        categoryIcon: Terminal,
        categoryColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
        crumbs: [
          { label: 'API Playground', isCurrent: true, icon: Terminal }
        ],
        parentHref: '/'
      };
    }

    const engineMeta = ENGINES_MAP[engineId];
    const engineName = engineMeta ? `${engineMeta.name} (${engineMeta.shortCode || engineMeta.id})` : formatSlugToTitle(engineId);

    return {
      sectionCategory: 'Interactive',
      categoryIcon: Terminal,
      categoryColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      crumbs: [
        { label: 'API Playground', href: '/playground', icon: Terminal },
        { label: `${engineName} Console`, isCurrent: true }
      ],
      parentHref: '/playground'
    };
  }

  // 3. Master Audit & Diagnostic Engines
  if (cleanPath === '/launch-audit' || cleanPath === '/master-audit' || cleanPath === '/audit') {
    return {
      sectionCategory: 'Engines',
      categoryIcon: Sparkles,
      categoryColor: 'text-purple-600 bg-purple-50 border-purple-200',
      crumbs: [
        { label: 'Master Audit Execution', isCurrent: true, icon: Sparkles }
      ],
      parentHref: '/'
    };
  }

  // Individual Engine Pages
  const engineRouteMap: Record<string, { id: string; name: string; icon: any }> = {
    '/health': { id: 'health', name: 'VitalZyme (Health & Vitality)', icon: Activity },
    '/latency': { id: 'latency', name: 'EdgeVmax (Latency & Edge)', icon: Globe },
    '/ai-readiness': { id: 'ai_ready', name: 'LLM Kinase (AI Readiness)', icon: Cpu },
    '/repo-scanner': { id: 'repo', name: 'GitLygase (Repo Scanner)', icon: FolderGit2 },
    '/eco-audit': { id: 'eco', name: 'EcoHolo (Green & Eco Audit)', icon: Leaf },
    '/compliance': { id: 'compliance', name: 'RiskProtease (Compliance & Security)', icon: ShieldCheck },
    '/migration': { id: 'migration', name: 'SynthShift (Cloud Migration)', icon: Layers },
    '/llmo': { id: 'llmo', name: 'AllosterSearch (LLM Optimization)', icon: Sparkles },
  };

  if (engineRouteMap[cleanPath]) {
    const engine = engineRouteMap[cleanPath];
    return {
      sectionCategory: 'Engines',
      categoryIcon: engine.icon,
      categoryColor: 'text-cyan-700 bg-cyan-50 border-cyan-200',
      crumbs: [
        { label: 'Diagnostic Engines', href: '/launch-audit' },
        { label: engine.name, isCurrent: true, icon: engine.icon }
      ],
      parentHref: '/launch-audit'
    };
  }

  // 4. Intelligence & Audit Reports
  if (cleanPath.startsWith('/reports') || cleanPath.startsWith('/report')) {
    const reportSlug = cleanPath.replace(/^\/(reports|report)\/?/, '');
    
    if (!reportSlug) {
      return {
        sectionCategory: 'Intelligence',
        categoryIcon: BarChart3,
        categoryColor: 'text-amber-700 bg-amber-50 border-amber-200',
        crumbs: [
          { label: 'Audit Dossiers & Reports', isCurrent: true, icon: BarChart3 }
        ],
        parentHref: '/'
      };
    }

    return {
      sectionCategory: 'Intelligence',
      categoryIcon: BarChart3,
      categoryColor: 'text-amber-700 bg-amber-50 border-amber-200',
      crumbs: [
        { label: 'Audit Reports', href: '/reports', icon: BarChart3 },
        { label: formatSlugToTitle(reportSlug), isCurrent: true }
      ],
      parentHref: '/reports'
    };
  }

  if (cleanPath === '/compare') {
    return {
      sectionCategory: 'Intelligence',
      categoryIcon: Scale,
      categoryColor: 'text-blue-700 bg-blue-50 border-blue-200',
      crumbs: [
        { label: 'Audit Intelligence', href: '/reports' },
        { label: 'Domain Comparison Matrix', isCurrent: true, icon: Scale }
      ],
      parentHref: '/reports'
    };
  }

  // 5. User Workspace & Dashboard
  if (cleanPath.startsWith('/dashboard') || cleanPath.startsWith('/user-dashboard')) {
    const subRoute = cleanPath.replace(/^\/(dashboard|user-dashboard)\/?/, '');
    
    // Check URL tab query param as fallback
    const params = new URLSearchParams(search);
    const tabParam = params.get('tab');
    const effectiveSub = subRoute || tabParam || '';

    const subTitles: Record<string, { label: string; icon: any }> = {
      'audits': { label: 'Saved Audit Dossiers', icon: FileText },
      'rate-limits': { label: 'Rate Limits & Quota', icon: Cpu },
      'api-keys': { label: 'API Keys & White-Label', icon: Key },
      'monitoring': { label: 'Domain Health & Radar', icon: Activity },
      'blogs': { label: 'My Technical Articles', icon: BookOpen },
    };

    if (!effectiveSub || !subTitles[effectiveSub]) {
      return {
        sectionCategory: 'Workspace',
        categoryIcon: Activity,
        categoryColor: 'text-teal-700 bg-teal-50 border-teal-200',
        crumbs: [
          { label: 'User Dashboard', isCurrent: true, icon: Activity }
        ],
        parentHref: '/'
      };
    }

    const matchedSub = subTitles[effectiveSub];
    return {
      sectionCategory: 'Workspace',
      categoryIcon: Activity,
      categoryColor: 'text-teal-700 bg-teal-50 border-teal-200',
      crumbs: [
        { label: 'User Dashboard', href: '/dashboard', icon: Activity },
        { label: matchedSub.label, isCurrent: true, icon: matchedSub.icon }
      ],
      parentHref: '/dashboard'
    };
  }

  // 6. Admin Portal
  if (cleanPath.startsWith('/admin')) {
    const adminSub = cleanPath.replace(/^\/admin\/?/, '');
    
    const adminTitles: Record<string, { label: string; icon: any }> = {
      'monitoring': { label: 'Live System Health & Probes', icon: Activity },
      'blogs': { label: 'Blog Post Creation & CMS', icon: BookOpen },
      'inquiries': { label: 'Contact Leads & Inquiries', icon: Mail },
    };

    if (!adminSub || !adminTitles[adminSub]) {
      return {
        sectionCategory: 'Management',
        categoryIcon: ShieldAlert,
        categoryColor: 'text-rose-700 bg-rose-50 border-rose-200',
        crumbs: [
          { label: 'Admin Command Center', isCurrent: true, icon: ShieldAlert }
        ],
        parentHref: '/'
      };
    }

    const matchedAdmin = adminTitles[adminSub];
    return {
      sectionCategory: 'Management',
      categoryIcon: ShieldAlert,
      categoryColor: 'text-rose-700 bg-rose-50 border-rose-200',
      crumbs: [
        { label: 'Admin Command Center', href: '/admin', icon: ShieldAlert },
        { label: matchedAdmin.label, isCurrent: true, icon: matchedAdmin.icon }
      ],
      parentHref: '/admin'
    };
  }

  // 7. Services: Pricing & Products
  if (cleanPath === '/pricing') {
    return {
      sectionCategory: 'Services',
      categoryIcon: DollarSign,
      categoryColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      crumbs: [
        { label: 'Services', href: '/pricing' },
        { label: 'Pricing Plans & Quotas', isCurrent: true, icon: DollarSign }
      ],
      parentHref: '/'
    };
  }

  if (cleanPath === '/products' || cleanPath === '/plugins' || cleanPath === '/integrations') {
    return {
      sectionCategory: 'Services',
      categoryIcon: Package,
      categoryColor: 'text-violet-700 bg-violet-50 border-violet-200',
      crumbs: [
        { label: 'Services', href: '/pricing' },
        { label: 'Products & Ecosystem Integrations', isCurrent: true, icon: Package }
      ],
      parentHref: '/pricing'
    };
  }

  // 8. Blogs & Articles
  if (cleanPath.startsWith('/blogs') || cleanPath.startsWith('/blog')) {
    const blogSlug = cleanPath.replace(/^\/(blogs|blog)\/?/, '');
    
    if (!blogSlug) {
      return {
        sectionCategory: 'Resources',
        categoryIcon: BookOpen,
        categoryColor: 'text-amber-800 bg-amber-50 border-amber-200',
        crumbs: [
          { label: 'Engineering Blog', isCurrent: true, icon: BookOpen }
        ],
        parentHref: '/'
      };
    }

    return {
      sectionCategory: 'Resources',
      categoryIcon: BookOpen,
      categoryColor: 'text-amber-800 bg-amber-50 border-amber-200',
      crumbs: [
        { label: 'Engineering Blog', href: '/blogs', icon: BookOpen },
        { label: formatSlugToTitle(blogSlug), isCurrent: true }
      ],
      parentHref: '/blogs'
    };
  }

  // 9. Support & About
  if (cleanPath === '/about' || cleanPath === '/methodology') {
    return {
      sectionCategory: 'Platform',
      categoryIcon: HelpCircle,
      categoryColor: 'text-slate-700 bg-slate-100 border-slate-200',
      crumbs: [
        { label: 'Platform Methodology & Standards', isCurrent: true, icon: HelpCircle }
      ],
      parentHref: '/'
    };
  }

  if (cleanPath === '/contact') {
    return {
      sectionCategory: 'Support',
      categoryIcon: Mail,
      categoryColor: 'text-blue-700 bg-blue-50 border-blue-200',
      crumbs: [
        { label: 'Contact & Advisory Support', isCurrent: true, icon: Mail }
      ],
      parentHref: '/'
    };
  }

  // 10. Trust & Legal Pages
  const legalRoutes: Record<string, string> = {
    '/privacy': 'Privacy Policy',
    '/terms': 'Terms of Service',
    '/cookies': 'Cookie Policy',
    '/security': 'Security Architecture & Standards',
  };

  if (legalRoutes[cleanPath]) {
    return {
      sectionCategory: 'Legal & Trust',
      categoryIcon: ShieldCheck,
      categoryColor: 'text-slate-700 bg-slate-100 border-slate-200',
      crumbs: [
        { label: 'Legal & Compliance', href: '/terms' },
        { label: legalRoutes[cleanPath], isCurrent: true, icon: ShieldCheck }
      ],
      parentHref: '/'
    };
  }

  // General Fallback for arbitrary or custom nested paths
  const segments = cleanPath.split('/').filter(Boolean);
  if (segments.length > 0) {
    const trail: DynamicCrumb[] = segments.map((seg, idx) => {
      const isLast = idx === segments.length - 1;
      const pathUpToHere = '/' + segments.slice(0, idx + 1).join('/');
      return {
        label: formatSlugToTitle(seg),
        href: isLast ? undefined : pathUpToHere,
        isCurrent: isLast
      };
    });

    return {
      sectionCategory: 'Navigation',
      categoryIcon: Layers,
      categoryColor: 'text-gray-700 bg-gray-100 border-gray-200',
      crumbs: trail,
      parentHref: segments.length > 1 ? '/' + segments.slice(0, segments.length - 1).join('/') : '/'
    };
  }

  return null;
}

export const GlobalBreadcrumb: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const meta = resolveBreadcrumbs(location.pathname, location.search);

  // If null, we are on the root homepage or no breadcrumb needed
  if (!meta) {
    return null;
  }

  const { sectionCategory, categoryIcon: CategoryIcon, categoryColor, crumbs, parentHref } = meta;

  // Build JSON-LD BreadcrumbList Schema for SEO & search engine rich snippets
  const schemaItems = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://www.catalystlab.tech/'
    },
    ...crumbs.map((crumb, idx) => ({
      '@type': 'ListItem',
      position: idx + 2,
      name: crumb.label,
      ...(crumb.href ? { item: `https://www.catalystlab.tech${crumb.href}` } : {})
    }))
  ];

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: schemaItems
  };

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <aside 
      id="global-breadcrumb-bar" 
      aria-label="Site Hierarchy Breadcrumb Bar" 
      className="sticky top-16 z-40 border-b border-[#e2e8f0] bg-white/95 backdrop-blur-md shadow-[0_1px_3px_rgba(0,0,0,0.03)] text-[#0b192c] transition-all"
    >
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
        
        {/* Left Side: Hierarchy Trail with Interactive Links */}
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          
          {/* Quick Back Jump button if 2 or more levels deep */}
          {parentHref && crumbs.length > 1 && (
            <button
              onClick={() => navigate(parentHref)}
              className="mr-1 inline-flex h-7 w-7 items-center justify-center rounded-lg border border-[#e2e8f0] bg-[#f8fafc] text-[#415a77] hover:border-[#cbd5e1] hover:bg-[#e2e8f0] hover:text-[#0b192c] transition-colors shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              title="Navigate Up One Level"
              aria-label="Navigate Up One Level"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Section Category Badge (Visual Anchor) */}
          <div className={`hidden sm:inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-bold uppercase tracking-wider shrink-0 ${categoryColor}`}>
            <CategoryIcon className="h-3 w-3" />
            <span>{sectionCategory}</span>
          </div>

          <div className="hidden sm:block text-[#cbd5e1] shrink-0 font-mono">|</div>

          {/* Semantic Navigation Breadcrumb Trail */}
          <nav aria-label="Breadcrumb" className="flex items-center text-xs sm:text-sm text-[#415a77]">
            <ol className="flex items-center gap-1.5 list-none m-0 p-0 flex-nowrap">
              
              {/* Home Item */}
              <li className="flex items-center shrink-0">
                <Link
                  to="/"
                  className="flex items-center gap-1 text-[#415a77] hover:text-[#0b192c] hover:underline font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                  title="CatalystLab Platform Home"
                >
                  <Home className="h-3.5 w-3.5 text-[#415a77]" />
                  <span className="hidden xs:inline">Home</span>
                </Link>
              </li>

              {/* Dynamic Crumbs */}
              {crumbs.map((crumb, idx) => {
                const isLast = idx === crumbs.length - 1;
                const CrumbIcon = crumb.icon;

                return (
                  <li key={idx} className="flex items-center gap-1.5 shrink-0">
                    <ChevronRight className="h-3.5 w-3.5 text-[#94a3b8] shrink-0" aria-hidden="true" />
                    
                    {crumb.href && !isLast ? (
                      <Link
                        to={crumb.href}
                        className="flex items-center gap-1 font-medium text-[#415a77] hover:text-[#0b192c] hover:underline transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                      >
                        {CrumbIcon && <CrumbIcon className="h-3 w-3" />}
                        <span>{crumb.label}</span>
                      </Link>
                    ) : (
                      <span 
                        className="flex items-center gap-1 font-bold text-[#0b192c] whitespace-nowrap truncate max-w-[200px] sm:max-w-xs md:max-w-md lg:max-w-xl"
                        aria-current={isLast ? 'page' : undefined}
                        title={crumb.label}
                      >
                        {CrumbIcon && <CrumbIcon className="h-3.5 w-3.5 text-[#0b192c] shrink-0" />}
                        <span className="truncate">{crumb.label}</span>
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>

        {/* Right Side: Quick Action (Copy URL) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-2.5 py-1 text-xs font-semibold text-[#415a77] hover:border-[#cbd5e1] hover:bg-white hover:text-[#0b192c] transition-all cursor-pointer shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            title="Copy Page Link"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-emerald-600" />
                <span className="text-emerald-700 font-bold hidden xs:inline">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3 text-[#64748b]" />
                <span className="hidden xs:inline">Copy Link</span>
              </>
            )}
          </button>
        </div>

      </div>
    </aside>
  );
};
