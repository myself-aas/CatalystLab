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
import { logger } from '../lib/logger';
import { SkeletonCard } from '../components/skeleton';

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
 const [loadingReports, setLoadingReports] = useState(false);
 const [searchQuery, setSearchQuery] = useState('');
 const [domainInput, setDomainInput] = useState('');

 useEffect(() => {
 const load = async () => {
 if (user) {
 setLoadingReports(true);
 try {
 const data = await getUserReports();
 setUserReports(data);
 } catch (e) {
 logger.error("Failed to load user reports:", e);
 } finally {
 setLoadingReports(false);
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
 <div data-theme="dark" className="min-h-screen ds-page-top bg-background pb-24 text-foreground font-mono">
 <SEOHead
 title="Diagnostic Report Directory"
 description="Explore deep engineering telemetry articles, interactive radar benchmarks, and OWASP compliance dossiers across domains worldwide."
 keywords={['audit directory', 'web health benchmark', 'dossier directory', 'performance reports']}
 canonicalUrl="https://www.catalystlab.tech/reports"
 />
 
 {/* Header Banner */}
 <section className="relative overflow-hidden border-b border-border pb-16 sm:pb-20 sm:px-6 lg:px-8">
 <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(0,102,255,0.12)_0%,transparent_70%)] pointer-events-none z-0"/>

 <div className="relative z-10 max-w-3xl mx-auto space-y-6">
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
 <div>
 <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-3.5 py-1 framer-micro-tag text-[#0066FF] mb-4">
 <FileText className="h-3.5 w-3.5 text-[#0066FF] shrink-0"/>
 <span>Diagnostic Report Directory</span>
 </div>
 <h1 className="framer-hero-title text-foreground">
 Web Performance, Security &amp; AI Readiness Dossiers
 </h1>
 <p className="mt-3 framer-body-text max-w-3xl leading-relaxed">
 Explore deep engineering telemetry articles, interactive radar benchmarks, and OWASP compliance dossiers across domains worldwide.
 </p>
 </div>

 <div className="flex items-center gap-2 shrink-0">
 <Link
 to="/master-audit"
 className="ds-btn ds-btn-primary text-xs sm:text-sm"
 >
 <Zap className="h-4 w-4 text-amber-300 shrink-0"/>
 <span>Run New Audit</span>
 </Link>
 </div>
 </div>

 {/* Quick Domain Inspector Input */}
 <form onSubmit={handleInstantInspect} className="mt-4">
 <div className="ds-card flex flex-col sm:flex-row gap-2 p-2">
 <div className="relative flex-1 flex items-center">
 <span className="absolute left-4 text-muted-foreground">
 <Globe className="h-4 w-4 shrink-0"/>
 </span>
 <label htmlFor="domain-inspect" className="sr-only">Domain to inspect</label>
 <input
 id="domain-inspect"
 type="text"
 value={domainInput}
 onChange={(e) => setDomainInput(e.target.value)}
 placeholder="Enter any domain to view dossier (e.g. stripe.com or catalystlab.tech)..."
 className="w-full ds-input pl-11 pr-4 text-sm font-sans bg-background"
 required
 />
 </div>

 <button
 type="submit"
 className="ds-btn ds-btn-primary text-sm shrink-0"
 >
 <span>Open Dossier</span>
 <ArrowRight className="h-4 w-4 shrink-0"/>
 </button>
 </div>
 </form>
 </div>
 </section>

 {/* Main Content */}
 <main className="ds-page-shell space-y-12">
 
 {/* Search Bar */}
 <div className="relative">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground shrink-0"/>
 <input
 type="text"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="Search report directory by domain name, technology, or category..."
 className="ds-input pl-11 w-full text-sm font-sans bg-background"
 />
 </div>

 {/* User Saved Reports (If authenticated & has reports) */}
 {user && (loadingReports || userReports.length > 0) && (
 <section className="space-y-6">
 <div className="flex items-center justify-between border-b border-border pb-3">
 <h2 className="text-sm font-extrabold text-foreground flex items-center gap-2">
 <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-accent text-muted-foreground border border-border">
 <Zap className="h-3.5 w-3.5 text-amber-500"/>
 </span>
 <span>Your Saved Audit Reports {loadingReports ? '' : `(${filteredUserReports.length})`}</span>
 </h2>
 <Link to="/dashboard"className="text-sm font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors">
 <span>Manage in Dashboard</span>
 <ArrowRight className="h-4 w-4"/>
 </Link>
 </div>

 {loadingReports ? (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"role="status"aria-label="Loading your saved reports...">
 {Array.from({ length: 3 }).map((_, i) => (
 <SkeletonCard key={i} />
 ))}
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
 {filteredUserReports.map((r) => {
 const meta = ENGINES_MAP[r.engine] || { name: r.engine };
 const domainSlug = urlToDomainSlug(r.url);
 const domainName = extractDomainFromUrl(r.url);

 return (
 <Link
 key={r.id || domainSlug}
 to={`/reports/${domainSlug}`}
 className="ds-card group p-5 ds-card-interactive"
 >
 <div className="flex items-center justify-between gap-2 mb-4">
 <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted text-muted-foreground border border-border shadow-sm">
 <Activity className="h-4 w-4"/>
 </span>
 <span className="text-[10px] uppercase font-bold text-muted-foreground bg-accent .5 py-1 rounded-md border border-border tracking-wider">
 {meta.name}
 </span>
 </div>

 <div className="font-extrabold text-base text-foreground group-hover:text-amber-600 transition-colors truncate font-sans">
 {domainName}
 </div>
 <div className="text-xs text-muted-foreground truncate mt-1 font-sans">
 {r.url}
 </div>

 <div className="flex items-center justify-between pt-4 mt-4 border-t border-border text-xs text-muted-foreground font-sans">
 <span>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Recent'}</span>
 <span className="flex items-center gap-1 font-bold text-muted-foreground group-hover:text-foreground transition-colors">
 <span>View Dossier</span>
 <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"/>
 </span>
 </div>
 </Link>
 );
 })}
 </div>
 )}
 </section>
 )}

 {/* Featured Benchmark Articles (Always visible to everyone) */}
 <section className="space-y-6">
 <div className="border-b border-border pb-3">
 <h2 className="text-sm font-extrabold text-foreground flex items-center gap-2">
 <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
 <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500"/>
 </span>
 <span>Featured Architecture &amp; Telemetry Dossiers</span>
 </h2>
 <p className="text-sm text-muted-foreground mt-2 font-sans">
 Public benchmarks demonstrating DOM depth, OWASP header compliance, and edge latency across industry standards.
 </p>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
 {filteredFeatured.map((item) => {
 const slug = urlToDomainSlug(item.domain);
 const isGradeA = item.grade.startsWith('A');
 const Icon = item.icon;

 return (
 <Link
 key={item.domain}
 to={`/reports/${slug}`}
 className="ds-card group p-5 ds-card-interactive"
 >
 <div className="flex items-center justify-between gap-2 mb-4">
 <div className="flex items-center gap-2">
 <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface text-muted-foreground border border-border shadow-sm">
 <Icon className="h-4 w-4 shrink-0"/>
 </span>
 <span className="text-[10px] uppercase font-mono text-muted-foreground bg-white/5 px-2 py-0.5 rounded border border-white/10 tracking-wider">
 {item.category}
 </span>
 </div>
 <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
 isGradeA 
 ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' 
 : 'border-amber-500/20 bg-amber-500/10 text-amber-400'
 }`}>
 Grade {item.grade}
 </span>
 </div>

 <div className="framer-card-title text-foreground group-hover:text-[#0066FF] transition-colors truncate">
 {item.domain}
 </div>
 <p className="framer-body-text text-sm mt-1.5 line-clamp-2">
 {item.title}
 </p>

 <div className="flex items-center justify-between pt-4 mt-4 border-t border-border text-xs text-muted-foreground font-mono">
 <span className="text-[#00D2FF] font-bold">{item.score}/100 Score</span>
 <span className="flex items-center gap-1 font-bold text-muted-foreground group-hover:text-foreground transition-colors">
 <span>Explore Benchmark</span>
 <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 shrink-0"/>
 </span>
 </div>
 </Link>
 );
 })}
 </div>
 </section>

 {/* Guest Call-to-action Banner if not signed in */}
 {!user && (
 <div className="ds-card p-8 sm:p-12 text-center">
 <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-surface border border-border text-amber-400 mb-4 shadow-sm">
 <Sparkles className="h-6 w-6"/>
 </div>
 <h3 className="framer-card-title text-xl sm:text-2xl text-foreground">Save &amp; Organize Your Custom Domain Audits</h3>
 <p className="mt-3 framer-body-text max-w-3xl mx-auto">
 Sign in to permanently track historical audits, monitor regressions over time, and generate dedicated whitepaper dossiers.
 </p>
 <button
 onClick={() => login()}
 className="mt-6 ds-btn ds-btn-primary text-sm"
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
