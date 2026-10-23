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
} from 'lucide-react';
import { SEOHead } from '../components/common/SEOHead';
import { logger } from '../lib/logger';
import { SkeletonCard } from '../components/skeleton';

/**
 * Reports directory.
 *
 * Only real data is listed: the signed-in user's stored audits, plus a domain
 * lookup that opens the stored dossier for that domain (or its honest empty
 * state). A fabricated "featured benchmarks" catalogue used to live here; the
 * owner decision recorded in server/routes/reports.ts (2026-10-19) forbids
 * inventing report records, so it is gone.
 */
export const ReportsDirectoryPage: React.FC = () => {
 const { user, login } = useAuth();
 const navigate = useNavigate();
 const [userReports, setUserReports] = useState<AuditReport[]>([]);
 const [loadingReports, setLoadingReports] = useState(false);
 const [loadError, setLoadError] = useState<string | null>(null);
 const [searchQuery, setSearchQuery] = useState('');
 const [domainInput, setDomainInput] = useState('');

 useEffect(() => {
 const load = async () => {
 if (user) {
 setLoadingReports(true);
 setLoadError(null);
 try {
 const data = await getUserReports();
 setUserReports(data);
 } catch (e) {
 logger.error("Failed to load user reports:", e);
 setLoadError('Your saved reports could not be loaded.');
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

 const query = searchQuery.trim().toLowerCase();
 const filteredUserReports = userReports.filter(r =>
 r.url?.toLowerCase().includes(query) ||
 r.engine?.toLowerCase().includes(query) ||
 (r.title && r.title.toLowerCase().includes(query))
 );

 return (
 <div className="min-h-screen ds-page-top-hero bg-background text-foreground">
 <SEOHead
 title="Diagnostic Report Directory"
 description="Open the stored report for a domain, or search the audits saved to your CatalystLab account."
 keywords={['audit directory', 'web health report', 'stored reports', 'performance reports']}
 canonicalUrl="https://www.catalystlab.tech/reports"
 />

 <section className="border-b border-border ds-section sm:px-6 lg:px-8">
 <div className="mx-auto max-w-5xl space-y-6">
 <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
 <div className="max-w-2xl space-y-3">
 <h1 className="framer-hero-title flex items-center gap-3 text-foreground">
 <FileText className="size-8 shrink-0 text-info" aria-hidden="true" />
 Reports
 </h1>
 <p className="framer-body-text">
 Open the report stored for a domain, or sign in to search the audits saved to your account.
 </p>
 </div>

 <Link to="/audit" className="ds-btn ds-btn-primary shrink-0 text-sm">
 <Zap className="h-4 w-4 shrink-0"/>
 <span>Run a new audit</span>
 </Link>
 </div>

 <form onSubmit={handleInstantInspect}>
 <div className="ds-card flex flex-col gap-2 p-2 sm:flex-row">
 <div className="relative flex flex-1 items-center">
 <Globe className="pointer-events-none absolute left-3 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true"/>
 <label htmlFor="domain-inspect" className="sr-only">Domain to open</label>
 <input
 id="domain-inspect"
 type="text"
 value={domainInput}
 onChange={(e) => setDomainInput(e.target.value)}
 placeholder="example.com"
 className="ds-input w-full bg-background pl-10 pr-4 text-sm"
 required
 />
 </div>

 <button type="submit" className="ds-btn ds-btn-primary shrink-0 text-sm">
 <span>Open report</span>
 <ArrowRight className="h-4 w-4 shrink-0"/>
 </button>
 </div>
 </form>
 </div>
 </section>

 <main className="ds-page-shell space-y-10 ds-section">
 <section className="space-y-5">
 <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
 <div className="flex flex-1 flex-col gap-2 sm:max-w-md">
 <h2 className="framer-card-title text-foreground">
 Your saved reports
 {!loadingReports && user ? <span className="ml-2 font-mono text-sm text-muted-foreground">{filteredUserReports.length}</span> : null}
 </h2>
 </div>
 {user ? (
 <div className="flex flex-1 flex-wrap items-center justify-end gap-3">
 <div className="relative min-w-[220px] flex-1">
 <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true"/>
 <label htmlFor="report-search" className="sr-only">Search your saved reports</label>
 <input
 id="report-search"
 type="text"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="Search saved reports"
 className="ds-input w-full bg-background pl-10 text-sm"
 />
 </div>
 <Link to="/dashboard?tab=audits" className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
 <span>Manage</span>
 <ArrowRight className="h-4 w-4"/>
 </Link>
 </div>
 ) : null}
 </div>

 {!user ? (
 <div className="ds-card p-8 text-center">
 <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-surface text-info">
 <Sparkles className="h-6 w-6" aria-hidden="true"/>
 </div>
 <h3 className="framer-card-title text-lg text-foreground">Sign in to see your saved audits</h3>
 <p className="mx-auto mt-2 max-w-xl framer-body-text text-sm">
 Your account keeps every completed audit, so you can compare readings over time and share a permalink.
 </p>
 <button onClick={() => login()} className="ds-btn ds-btn-primary mt-6 text-sm">
 Sign in to your account
 </button>
 </div>
 ) : loadingReports ? (
 <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Loading your saved reports">
 {Array.from({ length: 3 }).map((_, i) => (
 <SkeletonCard key={i} />
 ))}
 </div>
 ) : loadError ? (
 <div className="ds-card border-danger/30 p-6" role="alert">
 <p className="text-sm font-medium text-foreground">{loadError}</p>
 <p className="mt-1 text-sm text-muted-foreground">Reload the page to try again, or run a new audit and it will be saved here.</p>
 </div>
 ) : filteredUserReports.length === 0 ? (
 <div className="ds-card border-dashed p-8 text-center">
 <Activity className="mx-auto mb-3 h-8 w-8 text-muted-foreground" aria-hidden="true"/>
 <h3 className="text-base font-semibold text-foreground">
 {userReports.length === 0 ? 'No saved reports yet' : 'No reports match that search'}
 </h3>
 <p className="mx-auto mt-1.5 max-w-md text-sm text-muted-foreground">
 {userReports.length === 0
 ? 'Run an audit while signed in and it will appear here with its full telemetry.'
 : 'Clear the search to see all of your saved reports.'}
 </p>
 {userReports.length === 0 ? (
 <Link to="/audit" className="ds-btn ds-btn-primary mt-5 text-sm">Run your first audit</Link>
 ) : (
 <button type="button" onClick={() => setSearchQuery('')} className="ds-btn ds-btn-secondary mt-5 text-sm">Clear search</button>
 )}
 </div>
 ) : (
 <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
 {filteredUserReports.map((r) => {
 const meta = ENGINES_MAP[r.engine] || { name: r.engine };
 const domainSlug = urlToDomainSlug(r.url);
 const domainName = extractDomainFromUrl(r.url);

 return (
 <Link key={r.id || domainSlug} to={`/reports/${domainSlug}`} className="ds-card ds-card-interactive group flex flex-col p-5">
 <div className="mb-4 flex items-center justify-between gap-2">
 <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface text-muted-foreground">
 <Activity className="h-4 w-4" aria-hidden="true"/>
 </span>
 {typeof r.score === 'number' ? (
 <span className="rounded-md border border-border px-2 py-0.5 font-mono text-xs text-foreground">
 Score {r.score}
 </span>
 ) : null}
 </div>

 <div className="truncate text-base font-semibold text-foreground">
 {domainName}
 </div>
 <div className="mt-1 truncate font-mono text-xs text-muted-foreground">
 {r.url}
 </div>

 <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-sm text-muted-foreground">
 <span>{meta.name}</span>
 <span className="flex items-center gap-1 font-medium text-foreground">
 Open <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"/>
 </span>
 </div>
 </Link>
 );
 })}
 </div>
 )}
 </section>

 <p className="framer-body-text text-sm">
 Looking for a domain someone else audited? Open its permalink directly, or ask the owner to share it.
 </p>
 </main>
 </div>
 );
};

export default ReportsDirectoryPage;
