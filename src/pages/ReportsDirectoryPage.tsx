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
    icon: 'bolt',
    date: 'Verified Recently'
  },
  {
    domain: 'stripe.com',
    title: 'Stripe Global Financial Infrastructure',
    category: 'Fintech & Payments',
    score: 92,
    grade: 'A',
    icon: 'credit_card',
    date: 'Verified Recently'
  },
  {
    domain: 'github.com',
    title: 'GitHub Developer Platform',
    category: 'Developer Tools',
    score: 89,
    grade: 'A-',
    icon: 'inventory_2',
    date: 'Verified Recently'
  },
  {
    domain: 'vercel.com',
    title: 'Vercel Edge Platform Benchmark',
    category: 'Edge & Cloud Hosting',
    score: 95,
    grade: 'A+',
    icon: 'change_history',
    date: 'Verified Recently'
  },
  {
    domain: 'cloudflare.com',
    title: 'Cloudflare Zero-Trust & Edge POPs',
    category: 'CDN & Security',
    score: 93,
    grade: 'A',
    icon: 'shield',
    date: 'Verified Recently'
  },
  {
    domain: 'google.com',
    title: 'Google Search & Hyper-scale Edge',
    category: 'Search & Infrastructure',
    score: 96,
    grade: 'A+',
    icon: 'public',
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
    <div className="min-h-screen bg-[#f8fafc] pb-24 text-[#0b192c] selection:bg-[#c5d3e8] selection:text-[#0b192c]">
      
      {/* Header Banner */}
      <section className="border-b border-[#e2e8f0] bg-white px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[#415a77]/30 bg-[#415a77]/10 px-3 py-1 text-xs font-bold text-[#415a77] uppercase tracking-wider mb-3">
                <FileText className="h-3.5 w-3.5" />
                <span>Diagnostic Report Directory</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0b192c] tracking-tight">
                Web Performance, Security & AI Readiness Dossiers
              </h1>
              <p className="mt-2 text-sm text-[#415a77] max-w-2xl leading-relaxed">
                Explore deep engineering telemetry articles, interactive radar benchmarks, and OWASP compliance dossiers across domains worldwide.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                to="/"
                className="flex items-center gap-2 rounded-xl bg-[#0b192c] px-5 py-3 text-xs font-bold text-white hover:bg-[#152238] shadow-md transition-all"
              >
                <Zap className="h-4 w-4 fill-current text-[#c5d3e8]" />
                <span>Run New Audit</span>
              </Link>
            </div>
          </div>

          {/* Quick Domain Inspector Input */}
          <form onSubmit={handleInstantInspect} className="mt-4">
            <div className="flex flex-col sm:flex-row gap-2 rounded-2xl border border-[#415a77]/30 bg-[#0b192c] p-2.5 shadow-2xl text-[#f8fafc]">
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#c5d3e8]">
                  <Globe className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  placeholder="Enter any domain to view or generate its report (e.g. stripe.com or catalystlab.tech)..."
                  className="w-full rounded-xl bg-transparent py-2.5 pl-10 pr-4 text-xs text-[#f8fafc] placeholder:text-[#c5d3e8]/50 focus:outline-none font-mono"
                  required
                />
              </div>

              <button
                type="submit"
                className="flex items-center justify-center gap-1.5 rounded-xl bg-[#415a77] px-5 py-2.5 text-xs font-bold text-[#f8fafc] hover:bg-[#33475e] transition-colors shrink-0 shadow-md"
              >
                <span>Open Dossier</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#c5d3e8]" />
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 space-y-10">
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#415a77]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search report directory by domain name, technology, or category..."
            className="w-full rounded-2xl border border-[#415a77]/30 bg-white pl-10 pr-4 py-3 text-xs text-[#0b192c] placeholder:text-[#415a77]/60 focus:border-[#0b192c] focus:outline-none transition-colors shadow-sm"
          />
        </div>

        {/* User Saved Reports (If authenticated & has reports) */}
        {user && userReports.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#0b192c] flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#0b192c] text-white text-xs font-bold">
                  <span className="material-symbols-outlined text-xs">bolt</span>
                </span>
                <span>Your Saved Audit Reports ({filteredUserReports.length})</span>
              </h2>
              <Link to="/dashboard" className="text-xs text-[#415a77] font-semibold hover:underline flex items-center gap-1">
                <span>Manage in Dashboard</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredUserReports.map((r) => {
                const meta = ENGINES_MAP[r.engine] || { name: r.engine, icon: 'bolt' };
                const domainSlug = urlToDomainSlug(r.url);
                const domainName = extractDomainFromUrl(r.url);

                return (
                  <Link
                    key={r.id || domainSlug}
                    to={`/reports/${domainSlug}`}
                    className="group relative rounded-3xl border border-[#415a77]/30 bg-[#0b192c] p-6 shadow-xl hover:border-[#415a77]/70 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 block text-[#f8fafc]"
                  >
                    <div className="flex items-center justify-between gap-2 mb-3.5">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#152238] text-sky-300 border border-[#415a77]/40 text-sm group-hover:scale-105 transition-transform">
                        <span className="material-symbols-outlined text-base">{meta.icon}</span>
                      </span>
                      <span className="text-[10px] uppercase font-bold text-sky-300 bg-[#152238] px-2.5 py-1 rounded-full border border-sky-500/30 font-mono tracking-wider">
                        {meta.name}
                      </span>
                    </div>

                    <div className="font-bold text-base text-[#f8fafc] group-hover:text-sky-300 transition-colors truncate">
                      {domainName}
                    </div>
                    <div className="font-mono text-xs text-[#94a3b8] truncate mt-0.5">
                      {r.url}
                    </div>

                    <div className="flex items-center justify-between pt-3.5 mt-4 border-t border-[#415a77]/25 text-xs text-[#94a3b8]">
                      <span>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Recent'}</span>
                      <span className="flex items-center gap-1 font-bold text-sky-300 group-hover:text-white transition-colors">
                        <span>View Dossier</span>
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
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
            <h2 className="text-lg font-bold text-[#0b192c] flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#415a77] text-white text-xs font-bold">
                <span className="material-symbols-outlined text-xs">star</span>
              </span>
              <span>Featured Architecture & Telemetry Dossiers</span>
            </h2>
            <p className="text-xs text-[#415a77] mt-1">
              Public benchmarks demonstrating DOM depth, OWASP header compliance, and edge latency across industry standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredFeatured.map((item) => {
              const slug = urlToDomainSlug(item.domain);
              const isGradeA = item.grade.startsWith('A');

              return (
                <Link
                  key={item.domain}
                  to={`/reports/${slug}`}
                  className="group relative rounded-3xl border border-[#415a77]/30 bg-[#0b192c] p-6 shadow-xl hover:border-[#415a77]/70 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 block text-[#f8fafc]"
                >
                  <div className="flex items-center justify-between gap-2 mb-3.5">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#152238] text-white border border-[#415a77]/40 text-base group-hover:scale-105 transition-transform">
                        <span className="material-symbols-outlined text-base">{item.icon}</span>
                      </span>
                      <span className="text-[10px] uppercase font-bold text-[#94a3b8] bg-[#152238] px-2.5 py-1 rounded-full border border-[#415a77]/40 tracking-wide">
                        {item.category}
                      </span>
                    </div>
                    <span className={`text-xs font-mono font-extrabold px-2.5 py-1 rounded-full border ${
                      isGradeA 
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' 
                        : 'border-sky-500/40 bg-sky-500/10 text-sky-300'
                    }`}>
                      Grade {item.grade}
                    </span>
                  </div>

                  <div className="font-bold text-base text-[#f8fafc] group-hover:text-sky-300 transition-colors truncate">
                    {item.domain}
                  </div>
                  <p className="text-xs text-[#94a3b8] mt-1.5 line-clamp-2 leading-relaxed">
                    {item.title}
                  </p>

                  <div className="flex items-center justify-between pt-3.5 mt-4 border-t border-[#415a77]/25 text-xs text-[#94a3b8]">
                    <span className="font-mono text-[11px] font-semibold text-sky-300">{item.score}/100 Score</span>
                    <span className="flex items-center gap-1 font-bold text-sky-300 group-hover:text-white transition-colors">
                      <span>Explore Benchmark</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Guest Call-to-action Banner if not signed in */}
        {!user && (
          <div className="rounded-3xl border border-[#415a77]/30 bg-[#0b192c] p-8 sm:p-10 text-center shadow-2xl text-[#f8fafc]">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#415a77] text-white text-xl font-bold mb-3 shadow-md">
              <Sparkles className="h-6 w-6 text-[#c5d3e8]" />
            </div>
            <h3 className="text-xl font-bold text-[#f8fafc]">Save & Organize Your Custom Domain Audits</h3>
            <p className="mt-2 text-xs text-[#c5d3e8] max-w-md mx-auto leading-relaxed">
              Sign in with Google to permanently track historical audits, monitor regressions over time, and generate dedicated whitepaper dossiers.
            </p>
            <button
              onClick={() => login()}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#415a77] px-6 py-3 text-xs font-bold text-[#f8fafc] hover:bg-[#33475e] shadow-md transition-all"
            >
              Sign In with Google
            </button>
          </div>
        )}

      </main>
    </div>
  );
};
export default ReportsDirectoryPage;

