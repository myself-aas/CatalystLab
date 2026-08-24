import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserReports } from '../lib/firebase';
import { ENGINES_MAP } from '../data/engines';
import { urlToDomainSlug, extractDomainFromUrl } from '../utils/slugUtils';
import type { AuditReport } from '../types';
import { 
  Search, 
  ArrowRight, 
  FileText, 
  Sparkles,
  Zap,
  Globe,
  Activity,
  CreditCard,
  Package,
  Triangle,
  Shield,
  Star
} from 'lucide-react';
import { SEOHead } from '../components/common/SEOHead';

const FEATURED_BENCHMARKS = [
  {
    domain: 'catalystlab.tech',
    title: 'CatalystLab Telemetry Benchmark',
    category: 'Architecture Platform',
    score: 94,
    grade: 'A+',
    icon: Zap,
    date: 'Verified Recently'
  },
  {
    domain: 'stripe.com',
    title: 'Stripe Global Financial Infrastructure',
    category: 'Fintech & Payments',
    score: 92,
    grade: 'A',
    icon: CreditCard,
    date: 'Verified Recently'
  },
  {
    domain: 'github.com',
    title: 'GitHub Developer Platform',
    category: 'Developer Tools',
    score: 89,
    grade: 'A-',
    icon: Package,
    date: 'Verified Recently'
  },
  {
    domain: 'vercel.com',
    title: 'Vercel Edge Platform Benchmark',
    category: 'Edge & Cloud Hosting',
    score: 95,
    grade: 'A+',
    icon: Triangle,
    date: 'Verified Recently'
  },
  {
    domain: 'cloudflare.com',
    title: 'Cloudflare Zero-Trust & Edge POPs',
    category: 'CDN & Security',
    score: 93,
    grade: 'A',
    icon: Shield,
    date: 'Verified Recently'
  },
  {
    domain: 'google.com',
    title: 'Google Search & Hyper-scale Edge',
    category: 'Search & Infrastructure',
    score: 96,
    grade: 'A+',
    icon: Globe,
    date: 'Verified Recently'
  }
];

export const ReportsDirectoryPage: React.FC = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [userReports, setUserReports] = useState<AuditReport[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [domainInput, setDomainInput] = useState('');

  useEffect(() => {
    const load = async () => {
      if (user) {
        try {
          const data = await getUserReports();
          setUserReports(data);
        } catch (e) {
          console.error("Failed to load user reports:", e);
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
    <div className="min-h-screen bg-white pb-24 text-black selection:bg-black selection:text-white font-mono">
      <SEOHead
        title="Diagnostic Report Directory"
        description="Explore deep engineering telemetry articles, interactive radar benchmarks, and OWASP compliance dossiers across domains worldwide."
        keywords={['audit directory', 'web health benchmark', 'dossier directory', 'performance reports']}
        canonicalUrl="https://www.catalystlab.tech/reports"
      />
      
      {/* Header Banner */}
      <section className="border-b border-slate-200 bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-amber-600 uppercase tracking-wider mb-3">
                <FileText className="h-3.5 w-3.5" />
                <span>Diagnostic Report Directory</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
                Web Performance, Security &amp; AI Readiness Dossiers
              </h1>
              <p className="mt-2 text-xs text-slate-600 max-w-2xl leading-relaxed font-sans">
                Explore deep engineering telemetry articles, interactive radar benchmarks, and OWASP compliance dossiers across domains worldwide.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                to="/master-audit"
                className="flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all"
              >
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                <span>Run New Audit</span>
              </Link>
            </div>
          </div>

          {/* Quick Domain Inspector Input */}
          <form onSubmit={handleInstantInspect} className="mt-3">
            <div className="flex flex-col sm:flex-row gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Globe className="h-3.5 w-3.5" />
                </span>
                <label htmlFor="domain-inspect" className="sr-only">Domain to inspect</label>
                <input
                  id="domain-inspect"
                  type="text"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  placeholder="Enter any domain to view dossier (e.g. stripe.com or catalystlab.tech)..."
                  className="w-full rounded-lg bg-transparent py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 px-4 py-2 text-xs font-bold text-white transition-colors shrink-0 shadow-sm cursor-pointer"
              >
                <span>Open Dossier</span>
                <ArrowRight className="h-3 w-3 text-amber-400" />
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search report directory by domain name, technology, or category..."
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none transition-colors shadow-sm"
          />
        </div>

        {/* User Saved Reports (If authenticated & has reports) */}
        {user && userReports.length > 0 && (
          <section className="space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-amber-50 text-amber-600 text-xs border border-amber-200">
                  <Zap className="h-3 w-3" />
                </span>
                <span>Your Saved Audit Reports ({filteredUserReports.length})</span>
              </h2>
              <Link to="/dashboard" className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1">
                <span>Manage in Dashboard</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUserReports.map((r) => {
                const meta = ENGINES_MAP[r.engine] || { name: r.engine };
                const domainSlug = urlToDomainSlug(r.url);
                const domainName = extractDomainFromUrl(r.url);

                return (
                  <Link
                    key={r.id || domainSlug}
                    to={`/reports/${domainSlug}`}
                    className="group relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:bg-slate-50 transition-all block text-slate-900"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
                        <Activity className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {meta.name}
                      </span>
                    </div>

                    <div className="font-bold text-xs text-slate-900 group-hover:text-amber-600 transition-colors truncate">
                      {domainName}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">
                      {r.url}
                    </div>

                    <div className="flex items-center justify-between pt-2.5 mt-3 border-t border-slate-200 text-[11px] text-slate-500">
                      <span>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Recent'}</span>
                      <span className="flex items-center gap-1 font-bold text-slate-600 group-hover:text-slate-900 transition-colors">
                        <span>View Dossier</span>
                        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Featured Benchmark Articles (Always visible to everyone) */}
        <section className="space-y-3.5">
          <div>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-amber-50 text-amber-600 text-xs border border-amber-200">
                <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
              </span>
              <span>Featured Architecture &amp; Telemetry Dossiers</span>
            </h2>
            <p className="text-xs text-slate-600 mt-0.5 font-sans">
              Public benchmarks demonstrating DOM depth, OWASP header compliance, and edge latency across industry standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFeatured.map((item) => {
              const slug = urlToDomainSlug(item.domain);
              const isGradeA = item.grade.startsWith('A');
              const Icon = item.icon;

              return (
                <Link
                  key={item.domain}
                  to={`/reports/${slug}`}
                  className="group relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:bg-slate-50 transition-all block text-slate-900"
                >
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-amber-600 border border-slate-200">
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {item.category}
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      isGradeA 
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700' 
                        : 'border-amber-200 bg-amber-50 text-amber-700'
                    }`}>
                      Grade {item.grade}
                    </span>
                  </div>

                  <div className="font-bold text-xs text-slate-900 group-hover:text-amber-600 transition-colors truncate">
                    {item.domain}
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed font-sans">
                    {item.title}
                  </p>

                  <div className="flex items-center justify-between pt-2.5 mt-3 border-t border-slate-200 text-[11px] text-slate-500">
                    <span className="text-amber-600 font-bold">{item.score}/100 Score</span>
                    <span className="flex items-center gap-1 font-bold text-slate-600 group-hover:text-slate-900 transition-colors">
                      <span>Explore Benchmark</span>
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Guest Call-to-action Banner if not signed in */}
        {!user && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 text-center shadow-sm text-slate-900">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 border border-amber-200 text-amber-600 mb-2.5 shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Save &amp; Organize Your Custom Domain Audits</h3>
            <p className="mt-1.5 text-xs text-slate-600 max-w-md mx-auto leading-relaxed font-sans">
              Sign in to permanently track historical audits, monitor regressions over time, and generate dedicated whitepaper dossiers.
            </p>
            <button
              onClick={() => login()}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 px-5 py-2 text-xs font-bold text-white shadow-sm transition-all cursor-pointer"
            >
              Sign In to Your Account
            </button>
          </div>
        )}

      </main>
    </div>
  );
};

export default ReportsDirectoryPage;
