import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowUp, 
  Terminal, 
  Copy, 
  Check, 
  Activity, 
  Code2, 
  Globe, 
  Sparkles,
  ShieldCheck,
  CreditCard,
  Radio,
  Scale,
  FileText,
  GitBranch,
  Leaf,
  Cpu,
  Compass,
  ArrowRight,
  ExternalLink,
  BookOpen,
  Lock,
  FileCheck,
  Cookie,
  Mail,
  LayoutDashboard
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { SyncStatusBadge } from '../common/SyncStatusBadge';
import { cn } from '../../lib/utils';

export const Footer: React.FC = () => {
  const [copiedCli, setCopiedCli] = useState(false);
  const [quickAuditUrl, setQuickAuditUrl] = useState('');
  const navigate = useNavigate();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const copyCliCommand = () => {
    navigator.clipboard.writeText('npx catalystlab audit https://yoursite.com');
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2500);
  };

  const handleQuickAuditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAuditUrl.trim()) return;
    let url = quickAuditUrl.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }
    navigate(`/launch-audit?url=${encodeURIComponent(url)}`);
  };

  return (
    <footer id="main-footer" className="relative z-20 border-t border-border-default bg-[#020203] text-foreground-muted overflow-hidden">
      {/* Layer 1: Ambient Lighting Glow */}
      <div className="pointer-events-none absolute -top-48 left-1/2 -translate-x-1/2 h-96 w-[1000px] rounded-full bg-accent/10 blur-[150px]" />
      <div className="pointer-events-none absolute bottom-0 right-10 h-72 w-72 rounded-full bg-purple-900/10 blur-[120px]" />
      
      {/* Hairline Accent Glow Line on Top Edge */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

      {/* Interactive Quick Audit Callout Header */}
      <div className="relative border-b border-border-default bg-card/30 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-accent shadow-[0_0_8px_rgba(94,106,210,0.8)]" />
                </span>
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-accent-bright">
                  Continuous Telemetry Engine
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">
                Run an instant diagnostic audit on any production domain
              </h3>
              <p className="text-xs sm:text-sm text-foreground-muted max-w-xl">
                Synthesize DOM performance, OWASP SecOps headers, llms.txt AI readiness, and edge latency across 42 global PoPs.
              </p>
            </div>

            <form onSubmit={handleQuickAuditSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 max-w-md w-full">
              <div className="relative flex-1">
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-foreground-muted/60" />
                <input
                  type="text"
                  value={quickAuditUrl}
                  onChange={(e) => setQuickAuditUrl(e.target.value)}
                  placeholder="domain.com or https://..."
                  className="w-full h-10 rounded-xl border border-border-default bg-white/[0.03] pl-10 pr-3 text-xs font-mono text-foreground placeholder:text-foreground-muted/50 focus:border-accent/60 focus:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all shadow-inner"
                />
              </div>
              <button
                type="submit"
                className="relative group/btn overflow-hidden inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-accent px-4 text-xs font-medium text-white transition-all duration-200 hover:bg-accent-bright active:scale-95 shadow-linear-cta shrink-0 cursor-pointer"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 ease-out" />
                <Sparkles className="size-3.5 text-indigo-200" />
                <span>Launch Audit</span>
                <ArrowRight className="size-3.5 text-white/80 group-hover/btn:translate-x-0.5 transition-transform" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Multi-Column Footer Menu */}
      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12">
          
          {/* Column 1: Brand, Mission & CLI Snippet */}
          <div className="sm:col-span-2 lg:col-span-4 space-y-4">
            <Link 
              to="/" 
              className="inline-block transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 rounded-lg"
              aria-label="CatalystLab home"
            >
              <BrandLogo size="md" />
            </Link>
            
            <p className="text-xs sm:text-sm leading-relaxed text-foreground-muted max-w-sm">
              Multi-dimensional web health, architecture intelligence &amp; automated telemetry diagnostics. Auditing Core Web Vitals, OWASP SecOps, WCAG Accessibility, Eco-Carbon, and AI Readiness.
            </p>

            {/* Quick CLI Copy Box with Linear styling */}
            <div className="rounded-2xl border border-border-default bg-card/60 backdrop-blur-md p-3 max-w-sm shadow-linear-card">
              <div className="flex items-center justify-between gap-2 text-xs font-mono text-foreground-muted">
                <div className="flex items-center gap-2 truncate">
                  <div className="size-6 rounded-md bg-accent/15 border border-accent/30 flex items-center justify-center shrink-0">
                    <Terminal className="size-3.5 text-accent-bright" />
                  </div>
                  <span className="truncate text-foreground font-medium font-mono text-[11px]">
                    npx catalystlab audit
                  </span>
                </div>
                <button
                  type="button"
                  onClick={copyCliCommand}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[11px] font-mono text-foreground-muted hover:text-foreground border border-border-default hover:border-accent/40 transition-all cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 active:scale-95"
                  title="Copy CLI command"
                >
                  {copiedCli ? (
                    <>
                      <Check className="size-3 text-emerald-400" />
                      <span className="text-emerald-400 font-medium">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3 text-foreground-muted" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Live Edge Telemetry Status Pill */}
            <Link
              to="/latency"
              className="group inline-flex items-center gap-2 rounded-full border border-border-default bg-card/80 px-3 py-1.5 text-xs text-foreground-muted hover:text-foreground hover:border-accent/40 transition-all font-mono shadow-2xs"
              aria-label="View edge latency radar and 42 active points of presence"
            >
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
              </span>
              <span className="text-[11px]">8 Diagnostic Engines Active</span>
              <span className="text-foreground-muted/40">•</span>
              <span className="text-[11px] text-accent-bright font-semibold group-hover:underline">42 PoPs</span>
            </Link>
          </div>

          {/* Column 2: Platform Solutions */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5 mb-3 border-b border-border-default pb-2 font-mono">
              <Globe className="size-3.5 text-accent-bright" />
              <span>Platform</span>
            </h3>
            <ul className="space-y-2 text-xs sm:text-[13px] text-foreground-muted">
              <li>
                <Link to="/" className="hover:text-foreground hover:translate-x-0.5 transition-all inline-flex items-center gap-2 py-0.5" aria-label="Navigate to CatalystLab home page">
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link to="/launch-audit" className="hover:text-foreground group inline-flex items-center gap-1.5 py-0.5" aria-label="Launch Master Audit diagnostic tool">
                  <Sparkles className="size-3 text-accent-bright" />
                  <span className="font-medium text-foreground">Launch Master Audit</span>
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-foreground hover:translate-x-0.5 transition-all inline-flex items-center gap-1.5 py-0.5" aria-label="View pricing tiers and subscription plans">
                  <CreditCard className="size-3 text-foreground-muted" />
                  <span>Pricing &amp; Plans</span>
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-foreground group inline-flex items-center justify-between w-full py-0.5" aria-label="Explore Watchdog telemetry products and plugins">
                  <span className="flex items-center gap-1.5">
                    <Radio className="size-3 text-emerald-400" />
                    <span>Watchdog Telemetry</span>
                  </span>
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-1 py-0.2 rounded font-mono">Live</span>
                </Link>
              </li>
              <li>
                <Link to="/compare" className="hover:text-foreground hover:translate-x-0.5 transition-all inline-flex items-center gap-1.5 py-0.5" aria-label="Compare multiple URLs side by side">
                  <Scale className="size-3 text-amber-400" />
                  <span>Side-by-Side Compare</span>
                </Link>
              </li>
              <li>
                <Link to="/reports" className="hover:text-foreground hover:translate-x-0.5 transition-all inline-flex items-center gap-1.5 py-0.5" aria-label="Browse public audit reports directory">
                  <FileText className="size-3 text-foreground-muted" />
                  <span>Audit Reports Directory</span>
                </Link>
              </li>
              <li>
                <Link to="/blogs" className="hover:text-foreground hover:translate-x-0.5 transition-all inline-flex items-center gap-1.5 py-0.5" aria-label="Read engineering blogs and articles">
                  <FileText className="size-3 text-indigo-400" />
                  <span>Engineering Blogs</span>
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-foreground hover:translate-x-0.5 transition-all inline-flex items-center gap-1.5 py-0.5" aria-label="Learn about CatalystLab mission and team">
                  <span>About Us &amp; Team</span>
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-foreground hover:translate-x-0.5 transition-all inline-flex items-center gap-1.5 py-0.5" aria-label="Access user telemetry dashboard and audit history">
                  <LayoutDashboard className="size-3 text-accent-bright" />
                  <span>User Dashboard</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: 8 Diagnostic Engines */}
          <div className="lg:col-span-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5 mb-3 border-b border-border-default pb-2 font-mono">
              <Activity className="size-3.5 text-accent-bright" />
              <span>8 Diagnostic Engines</span>
            </h3>
            <ul className="space-y-2 text-xs sm:text-[13px] text-foreground-muted">
              <li>
                <Link to="/health" className="hover:text-foreground group flex items-center justify-between py-0.5 transition-colors" aria-label="Open VitalZyme Web Vitals diagnostic engine">
                  <span className="flex items-center gap-1.5">
                    <Activity className="size-3 text-accent-bright" />
                    <span>VitalZyme (Web Vitals)</span>
                  </span>
                  <span className="text-[10px] text-accent-bright font-mono bg-accent/10 border border-accent/20 px-1 rounded">DOM/TTFB</span>
                </Link>
              </li>
              <li>
                <Link to="/ai-readiness" className="hover:text-foreground group flex items-center justify-between py-0.5 transition-colors" aria-label="Open LLM-Kinase AI crawler readiness engine">
                  <span className="flex items-center gap-1.5">
                    <Cpu className="size-3 text-purple-400" />
                    <span>LLM-Kinase (AI Readiness)</span>
                  </span>
                  <span className="text-[10px] text-purple-400 font-mono bg-purple-500/10 border border-purple-500/20 px-1 rounded">llms.txt</span>
                </Link>
              </li>
              <li>
                <Link to="/repo-scanner" className="hover:text-foreground group flex items-center justify-between py-0.5 transition-colors" aria-label="Open GitLygase repository AST hygiene scanner">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="size-3 text-emerald-400" />
                    <span>GitLygase (Repo Hygiene)</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 border border-emerald-500/20 px-1 rounded">SecOps</span>
                </Link>
              </li>
              <li>
                <Link to="/latency" className="hover:text-foreground group flex items-center justify-between py-0.5 transition-colors" aria-label="Open EdgeVmax latency radar across 42 PoPs">
                  <span className="flex items-center gap-1.5">
                    <Globe className="size-3 text-cyan-400" />
                    <span>EdgeVmax (Latency Radar)</span>
                  </span>
                  <span className="text-[10px] text-cyan-400 font-mono bg-cyan-500/10 border border-cyan-500/20 px-1 rounded">42 PoPs</span>
                </Link>
              </li>
              <li>
                <Link to="/eco-audit" className="hover:text-foreground group flex items-center justify-between py-0.5 transition-colors" aria-label="Open EcoHolo digital carbon footprint auditor">
                  <span className="flex items-center gap-1.5">
                    <Leaf className="size-3 text-emerald-400" />
                    <span>EcoHolo (Carbon Audit)</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 border border-emerald-500/20 px-1 rounded">CO2e</span>
                </Link>
              </li>
              <li>
                <Link to="/compliance" className="hover:text-foreground group flex items-center justify-between py-0.5 transition-colors" aria-label="Open RiskProtease OWASP SecOps header compliance scanner">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="size-3 text-rose-400" />
                    <span>RiskProtease (OWASP SecOps)</span>
                  </span>
                  <span className="text-[10px] text-rose-400 font-mono bg-rose-500/10 border border-rose-500/20 px-1 rounded">Headers</span>
                </Link>
              </li>
              <li>
                <Link to="/migration" className="hover:text-foreground group flex items-center justify-between py-0.5 transition-colors" aria-label="Open SynthShift architecture PAR migration analyzer">
                  <span className="flex items-center gap-1.5">
                    <GitBranch className="size-3 text-amber-400" />
                    <span>SynthShift (Architecture PAR)</span>
                  </span>
                  <span className="text-[10px] text-amber-400 font-mono bg-amber-500/10 border border-amber-500/20 px-1 rounded">Phase 1</span>
                </Link>
              </li>
              <li>
                <Link to="/llmo" className="hover:text-foreground group flex items-center justify-between py-0.5 transition-colors" aria-label="Open AllosterSearch entity graph LLMO search analyzer">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="size-3 text-indigo-300" />
                    <span>AllosterSearch (LLMO Search)</span>
                  </span>
                  <span className="text-[10px] text-indigo-300 font-mono bg-indigo-500/10 border border-indigo-500/20 px-1 rounded">GEO</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Developers & Legal */}
          <div className="lg:col-span-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5 mb-3 border-b border-border-default pb-2 font-mono">
              <Code2 className="size-3.5 text-accent-bright" />
              <span>Developers &amp; Legal</span>
            </h3>
            <ul className="space-y-2 text-xs sm:text-[13px] text-foreground-muted">
              <li>
                <Link to="/api-docs" className="hover:text-foreground group flex items-center gap-1.5 font-medium py-0.5" aria-label="View REST API reference documentation">
                  <Code2 className="size-3 text-accent-bright" />
                  <span>REST API Reference</span>
                  <span className="text-[9px] bg-accent/15 text-accent-bright border border-accent/30 px-1 py-0.2 rounded font-mono">v2.4</span>
                </Link>
              </li>
              <li>
                <Link to="/playground" className="hover:text-foreground group flex items-center gap-1.5 py-0.5" aria-label="Open interactive API test playground">
                  <Terminal className="size-3 text-cyan-400" />
                  <span>Interactive API Playground</span>
                </Link>
              </li>
              <li>
                <Link to="/docs" className="hover:text-foreground group flex items-center gap-1.5 py-0.5" aria-label="Browse technical documentation and user guides">
                  <BookOpen className="size-3 text-foreground-muted" />
                  <span>Documentation &amp; Guides</span>
                </Link>
              </li>
              <li>
                <Link to="/methodology" className="hover:text-foreground group flex items-center gap-1.5 py-0.5" aria-label="Read audit methodology and scoring weights">
                  <Compass className="size-3 text-foreground-muted" />
                  <span>Audit Methodology &amp; Weights</span>
                </Link>
              </li>
              <li className="pt-2 border-t border-border-default">
                <Link to="/privacy" className="hover:text-foreground group flex items-center gap-1.5 py-0.5" aria-label="Read privacy policy and data compliance details">
                  <Lock className="size-3 text-foreground-muted" />
                  <span>Privacy Policy (GDPR / CCPA)</span>
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-foreground group flex items-center gap-1.5 py-0.5" aria-label="Read terms of service agreement">
                  <FileCheck className="size-3 text-foreground-muted" />
                  <span>Terms of Service</span>
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="hover:text-foreground group flex items-center gap-1.5 py-0.5" aria-label="Manage cookie preferences and privacy settings">
                  <Cookie className="size-3 text-foreground-muted" />
                  <span>Cookie Preferences</span>
                </Link>
              </li>
              <li>
                <Link to="/security" className="hover:text-foreground group flex items-center gap-1.5 py-0.5" aria-label="Read security and vulnerability disclosure policy">
                  <ShieldCheck className="size-3 text-emerald-400" />
                  <span>Security &amp; Vulnerability Disclosure</span>
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-foreground group flex items-center gap-1.5 py-0.5" aria-label="Contact customer support and service level agreement">
                  <Mail className="size-3 text-foreground-muted" />
                  <span>Contact Support &amp; SLA</span>
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Copyright, Telemetry Engine, SyncStatus, and Back to Top */}
        <div className="mt-14 flex flex-col items-center justify-between border-t border-border-default pt-6 sm:flex-row gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <p className="text-xs text-foreground-muted font-mono">
              &copy; 2026 <strong className="text-foreground font-semibold">CatalystLab</strong>. Enterprise Telemetry &amp; Automated Web Quality Intelligence.
            </p>
            <span className="text-[11px] font-mono text-foreground-muted bg-white/[0.04] px-2 py-0.5 rounded-full border border-border-default">
              Engine v2.4
            </span>
            <SyncStatusBadge />
          </div>
          
          <button
            type="button"
            onClick={scrollToTop}
            className="group flex items-center gap-2 rounded-full border border-border-default bg-card/80 px-4 py-2 text-xs font-mono text-foreground-muted transition-all duration-200 hover:border-accent/40 hover:text-foreground hover:bg-card-hover shadow-linear-card cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
            title="Scroll back to top"
          >
            <ArrowUp className="size-3.5 text-accent-bright group-hover:-translate-y-0.5 transition-transform duration-200" />
            <span>Back to Top</span>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
