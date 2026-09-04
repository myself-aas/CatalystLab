import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
  BookOpen,
  Lock,
  FileCheck,
  Cookie,
  Mail,
  LayoutDashboard,
  Send,
  Shield,
  Award,
  Share2,
  MessageSquare,
  ExternalLink
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { SyncStatusBadge } from '../common/SyncStatusBadge';
import { TextHoverEffect, FooterBackgroundGradient } from '../ui/hover-footer';
import { cn } from '../../lib/utils';

export const Footer: React.FC = () => {
  const [copiedCli, setCopiedCli] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const copyCliCommand = () => {
    navigator.clipboard.writeText('npx catalystlab audit https://yoursite.com');
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2500);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !newsletterEmail.includes('@')) return;
    setNewsletterSubscribed(true);
    setTimeout(() => {
      setNewsletterEmail('');
    }, 3000);
  };

  return (
    <footer id="main-footer" className="w-full !max-w-none !rounded-none relative z-20 border-t border-white/10 bg-background text-slate-300 overflow-hidden m-0 p-0">

      {/* Main Multi-Column Footer Menu */}
      <div className="relative w-full max-w-none px-6 lg:px-12 py-14 z-40">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12">
          
          {/* Column 1: Brand, Mission, CLI Snippet & Newsletter */}
          <div className="sm:col-span-2 lg:col-span-4 space-y-6">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 rounded-lg"
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
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/40 hover:bg-muted/80 text-[11px] font-mono text-foreground-muted hover:text-foreground border border-border-default hover:border-accent/40 transition-all cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 active:scale-95"
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

            {/* Newsletter Subscription Box */}
            <div className="rounded-2xl border border-border-default bg-card/80 backdrop-blur-md p-4 max-w-sm space-y-3 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground font-mono">
                <Mail className="size-3.5 text-accent-bright" />
                <span>Subscribe to Telemetry Digest</span>
              </div>
              <p className="text-[11px] text-foreground-muted leading-relaxed">
                Get monthly engineering reports on Core Web Vitals algorithms, OWASP advisories, and edge performance updates.
              </p>
              {newsletterSubscribed ? (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 text-xs font-mono text-emerald-400">
                  <Check className="size-4 shrink-0" />
                  <span>Subscribed successfully! Welcome aboard.</span>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="flex items-center gap-2">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="developer@company.com"
                    required
                    className="w-full h-9 rounded-xl border border-border-default bg-muted/30 px-3 text-xs font-mono text-foreground placeholder:text-foreground-muted/50 focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                  />
                  <button
                    type="submit"
                    className="h-9 px-3 rounded-xl bg-accent text-white hover:bg-accent-bright transition-all text-xs font-medium shrink-0 flex items-center justify-center cursor-pointer active:scale-95"
                    title="Subscribe"
                  >
                    <Send className="size-3.5" />
                  </button>
                </form>
              )}
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="size-9 rounded-xl border border-border-default bg-card/80 hover:bg-card-hover flex items-center justify-center text-foreground-muted hover:text-foreground transition-all shadow-2xs hover:border-accent/40"
                aria-label="GitHub Repository"
              >
                <Code2 className="size-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="size-9 rounded-xl border border-border-default bg-card/80 hover:bg-card-hover flex items-center justify-center text-foreground-muted hover:text-foreground transition-all shadow-2xs hover:border-accent/40"
                aria-label="Twitter / X"
              >
                <Share2 className="size-4" />
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noreferrer"
                className="size-9 rounded-xl border border-border-default bg-card/80 hover:bg-card-hover flex items-center justify-center text-foreground-muted hover:text-foreground transition-all shadow-2xs hover:border-accent/40"
                aria-label="Discord Community"
              >
                <MessageSquare className="size-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="size-9 rounded-xl border border-border-default bg-card/80 hover:bg-card-hover flex items-center justify-center text-foreground-muted hover:text-foreground transition-all shadow-2xs hover:border-accent/40"
                aria-label="LinkedIn Company"
              >
                <ExternalLink className="size-4" />
              </a>
            </div>

            {/* Enterprise Trust Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <div className="inline-flex items-center gap-1.5 rounded-lg border border-border-default bg-muted/40 px-2.5 py-1 text-[11px] font-mono text-foreground-muted">
                <Shield className="size-3.5 text-emerald-400" />
                <span>SOC 2 Type II Certified</span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-lg border border-border-default bg-muted/40 px-2.5 py-1 text-[11px] font-mono text-foreground-muted">
                <Award className="size-3.5 text-indigo-400" />
                <span>ISO 27001 Compliant</span>
              </div>
            </div>
          </div>

          {/* Column 2: Diagnostic Engines (Categorical Group 1) */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5 mb-3 border-b border-border-default pb-2 font-mono">
              <Activity className="size-3.5 text-accent-bright" />
              <span>Diagnostic Engines</span>
            </h3>
            <ul className="space-y-2 text-xs sm:text-[13px] text-foreground-muted">
              <li>
                <Link to="/health" className="hover:text-foreground group flex items-center justify-between py-0.5 transition-colors" aria-label="Open VitalZyme Web Vitals diagnostic engine">
                  <span className="flex items-center gap-1.5">
                    <Activity className="size-3 text-accent-bright" />
                    <span>VitalZyme (Web Vitals)</span>
                  </span>
                  <span className="text-[10px] text-accent-bright font-mono bg-accent/10 border border-accent/20 px-1 rounded">DOM</span>
                </Link>
              </li>
              <li>
                <Link to="/ai-readiness" className="hover:text-foreground group flex items-center justify-between py-0.5 transition-colors" aria-label="Open LLM-Kinase AI crawler readiness engine">
                  <span className="flex items-center gap-1.5">
                    <Cpu className="size-3 text-purple-400" />
                    <span>LLM-Kinase (AI Readiness)</span>
                  </span>
                  <span className="text-[10px] text-purple-400 font-mono bg-purple-500/10 border border-purple-500/20 px-1 rounded">llms</span>
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
                  <span className="text-[10px] text-cyan-400 font-mono bg-cyan-500/10 border border-cyan-500/20 px-1 rounded">PoPs</span>
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
                    <span>RiskProtease (OWASP)</span>
                  </span>
                  <span className="text-[10px] text-rose-400 font-mono bg-rose-500/10 border border-rose-500/20 px-1 rounded">Sec</span>
                </Link>
              </li>
              <li>
                <Link to="/migration" className="hover:text-foreground group flex items-center justify-between py-0.5 transition-colors" aria-label="Open SynthShift architecture PAR migration analyzer">
                  <span className="flex items-center gap-1.5">
                    <GitBranch className="size-3 text-amber-400" />
                    <span>SynthShift (PAR)</span>
                  </span>
                  <span className="text-[10px] text-amber-400 font-mono bg-amber-500/10 border border-amber-500/20 px-1 rounded">PAR</span>
                </Link>
              </li>
              <li>
                <Link to="/llmo" className="hover:text-foreground group flex items-center justify-between py-0.5 transition-colors" aria-label="Open AllosterSearch entity graph LLMO search analyzer">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="size-3 text-indigo-300" />
                    <span>AllosterSearch (LLMO)</span>
                  </span>
                  <span className="text-[10px] text-indigo-300 font-mono bg-indigo-500/10 border border-indigo-500/20 px-1 rounded">GEO</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Products (Categorical Group 2) */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5 mb-3 border-b border-border-default pb-2 font-mono">
              <Radio className="size-3.5 text-accent-bright" />
              <span>Products</span>
            </h3>
            <ul className="space-y-2 text-xs sm:text-[13px] text-foreground-muted">
              <li>
                <Link to="/products" className="hover:text-foreground group inline-flex items-center gap-1.5 py-0.5">
                  <span>Watchdog Telemetry</span>
                </Link>
              </li>
              <li>
                <Link to="/launch-audit" className="hover:text-foreground group inline-flex items-center gap-1.5 py-0.5 font-medium text-foreground">
                  <Sparkles className="size-3 text-accent-bright" />
                  <span>Master Audit Suite</span>
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-foreground group inline-flex items-center gap-1.5 py-0.5">
                  <CreditCard className="size-3 text-foreground-muted" />
                  <span>Compute Units &amp; Tiers</span>
                </Link>
              </li>
              <li>
                <Link to="/compare" className="hover:text-foreground group inline-flex items-center gap-1.5 py-0.5">
                  <Scale className="size-3 text-amber-400" />
                  <span>Comparative Diff</span>
                </Link>
              </li>
              <li>
                <Link to="/reports" className="hover:text-foreground group inline-flex items-center gap-1.5 py-0.5">
                  <FileText className="size-3 text-foreground-muted" />
                  <span>Public Dossiers</span>
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-foreground group inline-flex items-center gap-1.5 py-0.5">
                  <LayoutDashboard className="size-3 text-accent-bright" />
                  <span>User Portal</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Developers & API (Categorical Group 3) */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5 mb-3 border-b border-border-default pb-2 font-mono">
              <Code2 className="size-3.5 text-accent-bright" />
              <span>Developers &amp; API</span>
            </h3>
            <ul className="space-y-2 text-xs sm:text-[13px] text-foreground-muted">
              <li>
                <Link to="/api-docs" className="hover:text-foreground group flex items-center gap-1.5 font-medium py-0.5">
                  <Code2 className="size-3 text-accent-bright" />
                  <span>REST API Reference</span>
                </Link>
              </li>
              <li>
                <Link to="/playground" className="hover:text-foreground group flex items-center gap-1.5 py-0.5">
                  <Terminal className="size-3 text-cyan-400" />
                  <span>API Playground</span>
                </Link>
              </li>
              <li>
                <Link to="/docs" className="hover:text-foreground group flex items-center gap-1.5 py-0.5">
                  <BookOpen className="size-3 text-foreground-muted" />
                  <span>Developer Docs</span>
                </Link>
              </li>
              <li>
                <Link to="/methodology" className="hover:text-foreground group flex items-center gap-1.5 py-0.5">
                  <Compass className="size-3 text-foreground-muted" />
                  <span>Scoring Methodology</span>
                </Link>
              </li>
              <li>
                <Link to="/blogs" className="hover:text-foreground group flex items-center gap-1.5 py-0.5">
                  <FileText className="size-3 text-indigo-400" />
                  <span>Engineering Blog</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Resources & Legal (Categorical Groups 4 & 5) */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5 mb-3 border-b border-border-default pb-2 font-mono">
              <FileCheck className="size-3.5 text-accent-bright" />
              <span>Resources &amp; Legal</span>
            </h3>
            <ul className="space-y-2 text-xs sm:text-[13px] text-foreground-muted">
              <li>
                <Link to="/about" className="hover:text-foreground group flex items-center gap-1.5 py-0.5">
                  <span>About CatalystLab</span>
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-foreground group flex items-center gap-1.5 py-0.5">
                  <Mail className="size-3 text-foreground-muted" />
                  <span>Support &amp; SLA</span>
                </Link>
              </li>
              <li>
                <Link to="/legal" className="hover:text-foreground group flex items-center gap-1.5 py-0.5">
                  <FileCheck className="size-3 text-foreground-muted" />
                  <span>Legal Hub</span>
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-foreground group flex items-center gap-1.5 py-0.5">
                  <Lock className="size-3 text-foreground-muted" />
                  <span>Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-foreground group flex items-center gap-1.5 py-0.5">
                  <FileText className="size-3 text-foreground-muted" />
                  <span>Terms of Service</span>
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="hover:text-foreground group flex items-center gap-1.5 py-0.5">
                  <Cookie className="size-3 text-foreground-muted" />
                  <span>Cookie Preferences</span>
                </Link>
              </li>
              <li>
                <Link to="/security" className="hover:text-foreground group flex items-center gap-1.5 py-0.5">
                  <ShieldCheck className="size-3 text-emerald-400" />
                  <span>Security Disclosure</span>
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Text Hover Effect (Catalyst) */}
        <div className="lg:flex hidden h-[26rem] -mt-20 -mb-16 z-50">
          <TextHoverEffect text="CATALYST" className="z-50" />
        </div>

        {/* Bottom Bar: Copyright, Telemetry Engine, SyncStatus, and Back to Top */}
        <div className="mt-14 flex flex-col items-center justify-between border-t border-border-default pt-6 sm:flex-row gap-4 z-50">
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <p className="text-xs text-foreground-muted font-mono">
              &copy; 2026 <strong className="text-foreground font-semibold">CatalystLab</strong>. Enterprise Telemetry &amp; Automated Web Quality Intelligence.
            </p>
            <span className="text-[11px] font-mono text-foreground-muted bg-muted/40 px-2 py-0.5 rounded-full border border-border-default">
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

      <FooterBackgroundGradient />
    </footer>
  );
};

export default Footer;

