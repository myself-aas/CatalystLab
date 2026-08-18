import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserReports } from '../lib/firebase';
import { ENGINES_MAP } from '../data/engines';
import { urlToDomainSlug, extractDomainFromUrl } from '../utils/slugUtils';
import type { AuditReport } from '../types';
import { 
  LayoutDashboard, 
  Search, 
  ExternalLink, 
  ShieldCheck, 
  ArrowRight, 
  FileText, 
  Sparkles,
  Zap,
  Globe,
  Lock,
  Layers,
  Activity
} from 'lucide-react';

const FEATURED_BENCHMARKS = [
  {
    domain: 'catalystlab.tech',
    title: 'CatalystLab Telemetry Benchmark',
    category: 'Architecture Platform',
    score: 94,
    grade: 'A+',
    icon: '⚡',
    date: 'Verified Recently'
  },
  {
    domain: 'stripe.com',
    title: 'Stripe Global Financial Infrastructure',
    category: 'Fintech & Payments',
    score: 92,
    grade: 'A',
    icon: '💳',
    date: 'Verified Recently'
  },
  {
    domain: 'github.com',
    title: 'GitHub Developer Platform',
    category: 'Developer Tools',
    score: 89,
    grade: 'A-',
    icon: '📦',
    date: 'Verified Recently'
  },
  {
    domain: 'vercel.com',
    title: 'Vercel Edge Platform Benchmark',
    category: 'Edge & Cloud Hosting',
    score: 95,
    grade: 'A+',
    icon: '▲',
    date: 'Verified Recently'
  },
  {
    domain: 'cloudflare.com',
    title: 'Cloudflare Zero-Trust & Edge POPs',
    category: 'CDN & Security',
    score: 93,
    grade: 'A',
    icon: '🛡️',
    date: 'Verified Recently'
  },
  {
    domain: 'google.com',
    title: 'Google Search & Hyper-scale Edge',
    category: 'Search & Infrastructure',
    score: 96,
    grade: 'A+',
    icon: '🌐',
    date: 'Verified Recently'
  }
];

export const ReportsDirectoryPage: React.FC = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [userReports, setUserReports] = useState<AuditReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [domainInput, setDomainInput] = useState('');

  useEffect(() => {
    const load = async () => {
      if (user) {
        setLoading(true);
        try {
          const data = await getUserReports();
          setUserReports(data);
        } catch (e) {
          console.error("Failed to load user reports:", e);
        } finally {
          setLoading(false);
        }
      }
    };
    load();
  }, [user]);

  const handleInstantInspect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainInput.trim()) return;
    const slug = urlToDomainSlug(domainInput.trim());
    navigate(`/reports/${slug}`);
  };

  // Combine user reports and featured benchmarks for search filter
  const allUserReportSlugs = new Set(userReports.map(r => urlToDomainSlug(r.url)));

  const filteredFeatured = FEATURED_BENCHMARKS.filter(b => 
    b.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUserReports = userReports.filter(r => 
    r.url?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.engine?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.title && r.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-950 pb-24 text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Header Banner */}
      <section className="border-b border-slate-800 bg-gradient-to-b from-slate-900/60 via-slate-900/20 to-slate-950 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-xs font-bold text-cyan-300 uppercase tracking-wider mb-3">
                <FileText className="h-3.5 w-3.5" />
                <span>Diagnostic Report Directory</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Web Performance, Security & AI Readiness Dossiers
              </h1>
              <p className="mt-2 text-sm text-slate-400 max-w-2xl leading-relaxed">
                Explore deep engineering telemetry articles, interactive radar benchmarks, and OWASP compliance dossiers across domains worldwide.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                to="/"
                className="flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 shadow-lg shadow-cyan-500/20 transition-all"
              >
                <Zap className="h-4 w-4 fill-current" />
                <span>Run New Audit</span>
              </Link>
            </div>
          </div>

          {/* Quick Domain Inspector Input */}
          <form onSubmit={handleInstantInspect} className="mt-4">
            <div className="flex flex-col sm:flex-row gap-2 rounded-2xl border border-slate-700 bg-slate-900/90 p-2 shadow-2xl backdrop-blur-xl">
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400">
                  <Globe className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  placeholder="Enter any domain to view or generate its report (e.g. stripe.com or catalystlab.tech)..."
                  className="w-full rounded-xl bg-transparent py-2.5 pl-10 pr-4 text-xs text-white placeholder:text-slate-500 focus:outline-none font-mono"
                  required
                />
              </div>

              <button
                type="submit"
                className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-800 border border-slate-700 px-5 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors shrink-0"
              >
                <span>Open Dossier</span>
                <ArrowRight className="h-3.5 w-3.5 text-cyan-400" />
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search report directory by domain name, technology, or category..."
            className="w-full rounded-xl border border-slate-800 bg-slate-900/80 pl-10 pr-4 py-3 text-xs text-white placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none transition-colors"
          />
        </div>

        {/* User Saved Reports (If authenticated & has reports) */}
        {user && userReports.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-bold">
                  ⚡
                </span>
                <span>Your Saved Audit Reports ({filteredUserReports.length})</span>
              </h2>
              <Link to="/dashboard" className="text-xs text-cyan-400 hover:underline flex items-center gap-1">
                <span>Manage in Dashboard</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUserReports.map((r) => {
                const meta = ENGINES_MAP[r.engine] || { name: r.engine, icon: '⚡' };
                const domainSlug = urlToDomainSlug(r.url);
                const domainName = extractDomainFromUrl(r.url);

                return (
                  <Link
                    key={r.id || domainSlug}
                    to={`/reports/${domainSlug}`}
                    className="group rounded-2xl border border-cyan-500/30 bg-slate-900/60 p-5 hover:border-cyan-500 hover:bg-slate-900 transition-all block shadow-lg shadow-cyan-950/20"
                  >
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-sm">
                        {meta.icon}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 font-mono">
                        {meta.name}
                      </span>
                    </div>

                    <div className="font-bold text-base text-white group-hover:text-cyan-400 transition-colors truncate">
                      {domainName}
                    </div>
                    <div className="font-mono text-xs text-slate-500 truncate mt-0.5">
                      {r.url}
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
                      <span>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Recent'}</span>
                      <span className="flex items-center gap-1 font-semibold text-cyan-400 group-hover:translate-x-0.5 transition-transform">
                        <span>View Article</span>
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Featured Benchmark Articles (Always visible to everyone) */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                ★
              </span>
              <span>Featured Architecture & Telemetry Dossiers</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Public benchmarks demonstrating DOM depth, OWASP header compliance, and edge latency across industry standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFeatured.map((item) => {
              const slug = urlToDomainSlug(item.domain);

              return (
                <Link
                  key={item.domain}
                  to={`/reports/${slug}`}
                  className="group rounded-2xl border border-slate-800 bg-slate-900/40 p-5 hover:border-cyan-500/50 hover:bg-slate-900 transition-all block shadow-lg hover:shadow-cyan-950/20"
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-200 border border-slate-700 text-base">
                        {item.icon}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                        {item.category}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Grade {item.grade}
                    </span>
                  </div>

                  <div className="font-bold text-base text-white group-hover:text-cyan-400 transition-colors truncate">
                    {item.domain}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                    {item.title}
                  </p>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
                    <span className="font-mono text-cyan-400 font-semibold">{item.score}/100 Score</span>
                    <span className="flex items-center gap-1 font-semibold text-cyan-400 group-hover:translate-x-0.5 transition-transform">
                      <span>Read Article</span>
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Guest Call-to-action Banner if not signed in */}
        {!user && (
          <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900/80 via-cyan-950/20 to-slate-900/80 p-8 text-center backdrop-blur-xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xl font-bold mb-3 shadow-lg shadow-cyan-500/10">
              ⚡
            </div>
            <h3 className="text-lg font-bold text-white">Save & Organize Your Custom Domain Audits</h3>
            <p className="mt-1 text-xs text-slate-400 max-w-md mx-auto">
              Sign in with Google to permanently track historical audits, monitor regressions over time, and generate dedicated whitepaper dossiers.
            </p>
            <button
              onClick={() => login()}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 shadow-lg shadow-cyan-500/20 transition-all"
            >
              Sign In with Google
            </button>
          </div>
        )}

      </main>
    </div>
  );
};
