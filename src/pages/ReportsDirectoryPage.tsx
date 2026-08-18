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
<<<<<<< HEAD
    icon: 'credit_card',
=======
    icon: '💳',
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
    date: 'Verified Recently'
  },
  {
    domain: 'github.com',
    title: 'GitHub Developer Platform',
    category: 'Developer Tools',
    score: 89,
    grade: 'A-',
<<<<<<< HEAD
    icon: 'inventory_2',
=======
    icon: '📦',
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
    date: 'Verified Recently'
  },
  {
    domain: 'vercel.com',
    title: 'Vercel Edge Platform Benchmark',
    category: 'Edge & Cloud Hosting',
    score: 95,
    grade: 'A+',
<<<<<<< HEAD
    icon: 'change_history',
=======
    icon: '▲',
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
    date: 'Verified Recently'
  },
  {
    domain: 'cloudflare.com',
    title: 'Cloudflare Zero-Trust & Edge POPs',
    category: 'CDN & Security',
    score: 93,
    grade: 'A',
<<<<<<< HEAD
    icon: 'shield',
=======
    icon: '🛡️',
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
    date: 'Verified Recently'
  },
  {
    domain: 'google.com',
    title: 'Google Search & Hyper-scale Edge',
    category: 'Search & Infrastructure',
    score: 96,
    grade: 'A+',
<<<<<<< HEAD
    icon: 'public',
=======
    icon: '🌐',
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
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

<<<<<<< HEAD
=======
  // Combine user reports and featured benchmarks for search filter
  const allUserReportSlugs = new Set(userReports.map(r => urlToDomainSlug(r.url)));

>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
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
<<<<<<< HEAD
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
=======
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
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
                Explore deep engineering telemetry articles, interactive radar benchmarks, and OWASP compliance dossiers across domains worldwide.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                to="/"
<<<<<<< HEAD
                className="flex items-center gap-2 rounded-xl bg-[#0b192c] px-5 py-3 text-xs font-bold text-white hover:bg-[#152238] shadow-md transition-all"
              >
                <Zap className="h-4 w-4 fill-current text-[#c5d3e8]" />
=======
                className="flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 shadow-lg shadow-cyan-500/20 transition-all"
              >
                <Zap className="h-4 w-4 fill-current" />
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
                <span>Run New Audit</span>
              </Link>
            </div>
          </div>

          {/* Quick Domain Inspector Input */}
          <form onSubmit={handleInstantInspect} className="mt-4">
<<<<<<< HEAD
            <div className="flex flex-col sm:flex-row gap-2 rounded-2xl border border-[#415a77]/30 bg-[#0b192c] p-2.5 shadow-2xl text-[#f8fafc]">
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#c5d3e8]">
=======
            <div className="flex flex-col sm:flex-row gap-2 rounded-2xl border border-slate-700 bg-slate-900/90 p-2 shadow-2xl backdrop-blur-xl">
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400">
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
                  <Globe className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  placeholder="Enter any domain to view or generate its report (e.g. stripe.com or catalystlab.tech)..."
<<<<<<< HEAD
                  className="w-full rounded-xl bg-transparent py-2.5 pl-10 pr-4 text-xs text-[#f8fafc] placeholder:text-[#c5d3e8]/50 focus:outline-none font-mono"
=======
                  className="w-full rounded-xl bg-transparent py-2.5 pl-10 pr-4 text-xs text-white placeholder:text-slate-500 focus:outline-none font-mono"
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
                  required
                />
              </div>

              <button
                type="submit"
<<<<<<< HEAD
                className="flex items-center justify-center gap-1.5 rounded-xl bg-[#415a77] px-5 py-2.5 text-xs font-bold text-[#f8fafc] hover:bg-[#33475e] transition-colors shrink-0 shadow-md"
              >
                <span>Open Dossier</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#c5d3e8]" />
=======
                className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-800 border border-slate-700 px-5 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors shrink-0"
              >
                <span>Open Dossier</span>
                <ArrowRight className="h-3.5 w-3.5 text-cyan-400" />
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Main Content */}
<<<<<<< HEAD
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 space-y-10">
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#415a77]" />
=======
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search report directory by domain name, technology, or category..."
<<<<<<< HEAD
            className="w-full rounded-2xl border border-[#415a77]/30 bg-white pl-10 pr-4 py-3 text-xs text-[#0b192c] placeholder:text-[#415a77]/60 focus:border-[#0b192c] focus:outline-none transition-colors shadow-sm"
=======
            className="w-full rounded-xl border border-slate-800 bg-slate-900/80 pl-10 pr-4 py-3 text-xs text-white placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none transition-colors"
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
          />
        </div>

        {/* User Saved Reports (If authenticated & has reports) */}
        {user && userReports.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
<<<<<<< HEAD
              <h2 className="text-lg font-bold text-[#0b192c] flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#0b192c] text-white text-xs font-bold">
                  <span className="material-symbols-outlined text-xs">bolt</span>
                </span>
                <span>Your Saved Audit Reports ({filteredUserReports.length})</span>
              </h2>
              <Link to="/dashboard" className="text-xs text-[#415a77] font-semibold hover:underline flex items-center gap-1">
=======
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-bold">
                  ⚡
                </span>
                <span>Your Saved Audit Reports ({filteredUserReports.length})</span>
              </h2>
              <Link to="/dashboard" className="text-xs text-cyan-400 hover:underline flex items-center gap-1">
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
                <span>Manage in Dashboard</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUserReports.map((r) => {
<<<<<<< HEAD
                const meta = ENGINES_MAP[r.engine] || { name: r.engine, icon: 'bolt' };
=======
                const meta = ENGINES_MAP[r.engine] || { name: r.engine, icon: '⚡' };
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
                const domainSlug = urlToDomainSlug(r.url);
                const domainName = extractDomainFromUrl(r.url);

                return (
                  <Link
                    key={r.id || domainSlug}
                    to={`/reports/${domainSlug}`}
<<<<<<< HEAD
                    className="group rounded-3xl border border-[#415a77]/30 bg-[#0b192c] p-6 hover:border-[#c5d3e8] hover:bg-[#152238] transition-all block shadow-xl text-[#f8fafc]"
                  >
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#152238] text-[#c5d3e8] border border-[#415a77]/40 text-sm">
                        <span className="material-symbols-outlined text-base">{meta.icon}</span>
                      </span>
                      <span className="text-[10px] uppercase font-bold text-[#c5d3e8] bg-[#152238] px-2.5 py-0.5 rounded-lg border border-[#415a77]/40 font-mono">
=======
                    className="group rounded-2xl border border-cyan-500/30 bg-slate-900/60 p-5 hover:border-cyan-500 hover:bg-slate-900 transition-all block shadow-lg shadow-cyan-950/20"
                  >
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-sm">
                        {meta.icon}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 font-mono">
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
                        {meta.name}
                      </span>
                    </div>

<<<<<<< HEAD
                    <div className="font-bold text-base text-[#f8fafc] group-hover:text-[#c5d3e8] transition-colors truncate">
                      {domainName}
                    </div>
                    <div className="font-mono text-xs text-[#c5d3e8] truncate mt-0.5">
                      {r.url}
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-4 border-t border-[#415a77]/30 text-[11px] text-[#c5d3e8]">
                      <span>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Recent'}</span>
                      <span className="flex items-center gap-1 font-semibold text-[#c5d3e8] group-hover:translate-x-0.5 transition-transform">
=======
                    <div className="font-bold text-base text-white group-hover:text-cyan-400 transition-colors truncate">
                      {domainName}
                    </div>
                    <div className="font-mono text-xs text-slate-500 truncate mt-0.5">
                      {r.url}
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
                      <span>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Recent'}</span>
                      <span className="flex items-center gap-1 font-semibold text-cyan-400 group-hover:translate-x-0.5 transition-transform">
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
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
<<<<<<< HEAD
            <h2 className="text-lg font-bold text-[#0b192c] flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#415a77] text-white text-xs font-bold">
                <span className="material-symbols-outlined text-xs">star</span>
              </span>
              <span>Featured Architecture & Telemetry Dossiers</span>
            </h2>
            <p className="text-xs text-[#415a77] mt-1">
=======
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                ★
              </span>
              <span>Featured Architecture & Telemetry Dossiers</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
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
<<<<<<< HEAD
                  className="group rounded-3xl border border-[#415a77]/30 bg-[#0b192c] p-6 hover:border-[#c5d3e8] hover:bg-[#152238] transition-all block shadow-xl text-[#f8fafc]"
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#152238] text-[#f8fafc] border border-[#415a77]/40 text-base">
                        <span className="material-symbols-outlined text-base">{item.icon}</span>
                      </span>
                      <span className="text-[10px] uppercase font-bold text-[#c5d3e8] bg-[#152238] px-2.5 py-0.5 rounded-lg border border-[#415a77]/40">
                        {item.category}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#c5d3e8] bg-[#152238] px-2 py-0.5 rounded-lg border border-[#415a77]/40">
=======
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
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
                      Grade {item.grade}
                    </span>
                  </div>

<<<<<<< HEAD
                  <div className="font-bold text-base text-[#f8fafc] group-hover:text-[#c5d3e8] transition-colors truncate">
                    {item.domain}
                  </div>
                  <p className="text-xs text-[#c5d3e8] mt-1 line-clamp-1">
                    {item.title}
                  </p>

                  <div className="flex items-center justify-between pt-3 mt-4 border-t border-[#415a77]/30 text-[11px] text-[#c5d3e8]">
                    <span className="font-mono text-[#c5d3e8] font-semibold">{item.score}/100 Score</span>
                    <span className="flex items-center gap-1 font-semibold text-[#c5d3e8] group-hover:translate-x-0.5 transition-transform">
=======
                  <div className="font-bold text-base text-white group-hover:text-cyan-400 transition-colors truncate">
                    {item.domain}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                    {item.title}
                  </p>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
                    <span className="font-mono text-cyan-400 font-semibold">{item.score}/100 Score</span>
                    <span className="flex items-center gap-1 font-semibold text-cyan-400 group-hover:translate-x-0.5 transition-transform">
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
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
<<<<<<< HEAD
          <div className="rounded-3xl border border-[#415a77]/30 bg-[#0b192c] p-8 sm:p-10 text-center shadow-2xl text-[#f8fafc]">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#415a77] text-white text-xl font-bold mb-3 shadow-md">
              <Sparkles className="h-6 w-6 text-[#c5d3e8]" />
            </div>
            <h3 className="text-xl font-bold text-[#f8fafc]">Save & Organize Your Custom Domain Audits</h3>
            <p className="mt-2 text-xs text-[#c5d3e8] max-w-md mx-auto leading-relaxed">
=======
          <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900/80 via-cyan-950/20 to-slate-900/80 p-8 text-center backdrop-blur-xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xl font-bold mb-3 shadow-lg shadow-cyan-500/10">
              ⚡
            </div>
            <h3 className="text-lg font-bold text-white">Save & Organize Your Custom Domain Audits</h3>
            <p className="mt-1 text-xs text-slate-400 max-w-md mx-auto">
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
              Sign in with Google to permanently track historical audits, monitor regressions over time, and generate dedicated whitepaper dossiers.
            </p>
            <button
              onClick={() => login()}
<<<<<<< HEAD
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#415a77] px-6 py-3 text-xs font-bold text-[#f8fafc] hover:bg-[#33475e] shadow-md transition-all"
=======
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 shadow-lg shadow-cyan-500/20 transition-all"
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
            >
              Sign In with Google
            </button>
          </div>
        )}

      </main>
    </div>
  );
};
<<<<<<< HEAD
export default ReportsDirectoryPage;

=======
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
