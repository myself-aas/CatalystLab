import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Code2, 
  Terminal, 
  Zap, 
  Layers, 
  ShieldCheck, 
  Cpu, 
  Activity, 
  Globe, 
  FileText, 
  Key, 
  Radio, 
  Sparkles,
  ExternalLink,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { API_CATEGORIES, API_ENDPOINTS } from '../../data/apiSpecs';

export const categorySlugMap: Record<string, string> = {
  'Diagnostic Engines': 'engines',
  'Master Audit': 'master-audit',
  'Reports & Dossiers': 'reports',
  'Blogs & Research': 'blogs',
  'Users & Quota': 'users-quota',
  'Workflows & Automation': 'workflows',
  'Integrations & Webhooks': 'webhooks',
  'System & Health': 'system'
};

export const slugToCategoryMap: Record<string, string> = Object.entries(categorySlugMap).reduce(
  (acc, [cat, slug]) => ({ ...acc, [slug]: cat }), 
  {}
);

export const ApiNavSidebar: React.FC = () => {
  const location = useLocation();

  const isCurrent = (path: string) => {
    return location.pathname === path;
  };

  return (
    <aside className="w-full lg:w-72 shrink-0 space-y-6">
      {/* Overview Section */}
      <div className="rounded-2xl border border-border bg-background p-4 shadow-sm">
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground mb-3">
          API Overview
        </h4>
        <nav className="space-y-1">
          <Link
            to="/api-reference"
            className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
              location.pathname === '/api-reference' || location.pathname === '/api-docs'
                ? 'bg-background text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-muted-foreground" />
              <span>Overview & Quickstart</span>
            </div>
            <ChevronRight className="h-3.5 w-3.5 opacity-60" />
          </Link>

          <Link
            to="/playground"
            className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-emerald-600" />
              <span>Interactive Playground</span>
            </div>
            <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-200/60 text-emerald-800">
              Live
            </span>
          </Link>
        </nav>
      </div>

      {/* Categories Menu */}
      <div className="rounded-2xl border border-border bg-background p-4 shadow-sm">
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground mb-3">
          Endpoint Categories
        </h4>
        <nav className="space-y-1">
          {API_CATEGORIES.map((cat) => {
            const slug = categorySlugMap[cat] || 'engines';
            const path = `/api-reference/category/${slug}`;
            const active = location.pathname.startsWith(`/api-reference/category/${slug}`);
            const count = API_ENDPOINTS.filter(ep => ep.category === cat).length;

            return (
              <Link
                key={cat}
                to={path}
                className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-background text-primary-foreground font-bold'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                <span className="truncate">{cat}</span>
                <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${
                  active ? 'bg-background/20 text-primary-foreground' : 'bg-accent text-muted-foreground'
                }`}>
                  {count}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Quick Links / Docs */}
      <div className="rounded-2xl border border-border bg-background p-4 shadow-sm">
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground mb-3">
          Documentation Guides
        </h4>
        <nav className="space-y-1 text-xs">
          <Link
            to="/docs/rate-limiting"
            className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Rate Limiting & Tier Quotas</span>
          </Link>
          <Link
            to="/docs/orchestrator"
            className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Layers className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Orchestrator Architecture</span>
          </Link>
          <Link
            to="/docs/cicd"
            className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Terminal className="h-3.5 w-3.5 text-muted-foreground" />
            <span>CI/CD & GitHub Actions</span>
          </Link>
        </nav>
      </div>
    </aside>
  );
};
