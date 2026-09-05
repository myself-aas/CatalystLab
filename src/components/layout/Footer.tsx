import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowUp, 
  Terminal, 
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
  BookOpen,
  Lock,
  FileCheck,
  Mail,
  Send,
  Shield,
  Award,
  Share2,
  MessageSquare,
  ExternalLink,
  type LucideIcon
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { SyncStatusBadge } from '../common/SyncStatusBadge';
import { TextHoverEffect, FooterBackgroundGradient } from '../ui/hover-footer';
import { cn } from '../../lib/utils';
import { CopyButton } from '../ui/CopyButton';

interface FooterLink {
  label: string;
  to: string;
  badge?: string;
  badgeVariant?: 'default' | 'cyan' | 'emerald' | 'violet' | 'amber' | 'rose';
  icon: LucideIcon;
  ariaLabel?: string;
}

interface FooterColumn {
  id: string;
  code: string;
  title: string;
  icon: LucideIcon;
  links: FooterLink[];
}

const BADGE_VARIANTS: Record<string, string> = {
  default: 'text-neutral-400 bg-white/[0.04] border-white/[0.08] group-hover:border-border-strong group-hover:text-neutral-200',
  cyan: 'text-[#00D2FF] bg-[#00D2FF]/10 border-[#00D2FF]/20 group-hover:border-[#00D2FF]/40 group-hover:bg-[#00D2FF]/15',
  emerald: 'text-[#00F298] bg-[#00F298]/10 border-[#00F298]/20 group-hover:border-[#00F298]/40 group-hover:bg-[#00F298]/15',
  violet: 'text-[#A78BFA] bg-[#8A2BE2]/15 border-[#8A2BE2]/25 group-hover:border-[#8A2BE2]/50 group-hover:bg-[#8A2BE2]/20',
  amber: 'text-[#FF9900] bg-[#FF9900]/10 border-[#FF9900]/20 group-hover:border-[#FF9900]/40 group-hover:bg-[#FF9900]/15',
  rose: 'text-[#FF3366] bg-[#FF3366]/10 border-[#FF3366]/20 group-hover:border-[#FF3366]/40 group-hover:bg-[#FF3366]/15',
};

const FOOTER_COLUMNS: FooterColumn[] = [
  {
    id: 'engines',
    code: '01',
    title: 'Autonomous Engines',
    icon: Activity,
    links: [
      { label: 'VitalZyme (Web Vitals)', to: '/health', badge: 'LCP/INP', badgeVariant: 'emerald', icon: Activity, ariaLabel: 'VitalZyme Core Web Vitals diagnostic engine' },
      { label: 'SynthShift (AST Diff)', to: '/migration', badge: 'AST Diff', badgeVariant: 'violet', icon: GitBranch, ariaLabel: 'SynthShift architecture AST diff engine' },
      { label: 'EdgeKinase (Mesh & TLS)', to: '/latency', badge: 'TLS 1.3', badgeVariant: 'cyan', icon: Globe, ariaLabel: 'EdgeKinase TLS and latency radar' },
      { label: 'RiskProtease (OWASP)', to: '/compliance', badge: 'OWASP', badgeVariant: 'amber', icon: ShieldCheck, ariaLabel: 'RiskProtease OWASP SecOps compliance scanner' },
      { label: 'EcoHolo (Carbon Audit)', to: '/eco-audit', badge: 'CO2e', badgeVariant: 'emerald', icon: Leaf, ariaLabel: 'EcoHolo digital carbon footprint auditor' },
      { label: 'LLM-Kinase (AI Readiness)', to: '/ai-readiness', badge: 'llms.txt', badgeVariant: 'violet', icon: Cpu, ariaLabel: 'LLM-Kinase AI crawler readiness auditor' },
      { label: 'AllosterSearch (LLMO)', to: '/llmo', badge: 'GEO', badgeVariant: 'cyan', icon: Sparkles, ariaLabel: 'AllosterSearch entity search optimization' },
      { label: 'GHLyase (Repo Hygiene)', to: '/repo-scanner', badge: 'SecOps', badgeVariant: 'rose', icon: Terminal, ariaLabel: 'GHLyase repository hygiene scanner' },
    ],
  },
  {
    id: 'platform',
    code: '02',
    title: 'Architecture & Edge',
    icon: Globe,
    links: [
      { label: '4-Stage Pipeline', to: '/docs/architecture', badge: 'v2.4', badgeVariant: 'cyan', icon: GitBranch, ariaLabel: '4-Stage telemetry pipeline architecture' },
      { label: 'Edge Latency Matrix', to: '/latency', badge: '38 PoPs', badgeVariant: 'emerald', icon: Radio, ariaLabel: 'Edge latency matrix across global PoPs' },
      { label: 'Live Dossier Explorer', to: '/reports', badge: 'Public', badgeVariant: 'default', icon: FileText, ariaLabel: 'Live web diagnostic dossier explorer' },
      { label: 'Automated PR Patches', to: '/launch-audit', badge: 'Auto-Fix', badgeVariant: 'violet', icon: Code2, ariaLabel: 'Automated GitHub pull request patches' },
      { label: 'Zero-SDK Architecture', to: '/docs/overview', badge: 'Agentless', badgeVariant: 'default', icon: Shield, ariaLabel: 'Zero-SDK agentless architecture overview' },
      { label: '38-PoP Edge Topology', to: '/admin', badge: 'Anycast', badgeVariant: 'cyan', icon: Compass, ariaLabel: '38-PoP edge network topology status' },
    ],
  },
  {
    id: 'developers',
    code: '03',
    title: 'Developers & CLI',
    icon: Code2,
    links: [
      { label: 'REST & gRPC Reference', to: '/api-docs', badge: 'v2 API', badgeVariant: 'cyan', icon: Code2, ariaLabel: 'REST and gRPC developer API reference' },
      { label: 'Catalyst CLI Runner', to: '/docs/cicd', badge: 'npx', badgeVariant: 'default', icon: Terminal, ariaLabel: 'Catalyst command line runner documentation' },
      { label: 'Interactive Playground', to: '/playground', badge: 'Live', badgeVariant: 'emerald', icon: Send, ariaLabel: 'Interactive API execution playground' },
      { label: 'GitHub Action CI/CD', to: '/docs/cicd', badge: 'CI/CD', badgeVariant: 'violet', icon: GitBranch, ariaLabel: 'GitHub Action continuous integration workflow' },
      { label: 'Claude & Cursor Plugins', to: '/docs/devops', badge: 'AI IDE', badgeVariant: 'amber', icon: Sparkles, ariaLabel: 'Claude Code and Cursor editor plugins' },
      { label: 'Engineering Changelog', to: '/blogs', badge: 'Weekly', badgeVariant: 'default', icon: BookOpen, ariaLabel: 'Weekly engineering changelog and releases' },
    ],
  },
  {
    id: 'trust',
    code: '04',
    title: 'Trust & Compliance',
    icon: ShieldCheck,
    links: [
      { label: 'OWASP Top 10 Standard', to: '/compliance', badge: 'Grade A+', badgeVariant: 'emerald', icon: ShieldCheck, ariaLabel: 'OWASP Top 10 transport security standard' },
      { label: 'SOC 2 Type II Certified', to: '/security', badge: 'Audited', badgeVariant: 'cyan', icon: Award, ariaLabel: 'SOC 2 Type II compliance audit report' },
      { label: '99.99% Edge Mesh SLA', to: '/pricing', badge: 'SLA', badgeVariant: 'default', icon: Scale, ariaLabel: '99.99 percent uptime service level agreement' },
      { label: 'Security Sandbox Policy', to: '/docs/security-sandbox', badge: 'Zero-Log', badgeVariant: 'default', icon: Lock, ariaLabel: 'Zero-log security sandbox policy' },
      { label: 'Vulnerability Disclosure', to: '/security', badge: 'Bounty', badgeVariant: 'rose', icon: Shield, ariaLabel: 'Vulnerability disclosure and bug bounty' },
      { label: 'Rate Limiting Standard', to: '/docs/rate-limiting', badge: 'RFC 6585', badgeVariant: 'default', icon: FileCheck, ariaLabel: 'RFC 6585 HTTP rate limiting framework' },
    ],
  },
  {
    id: 'company',
    code: '05',
    title: 'Company & Network',
    icon: Compass,
    links: [
      { label: 'About CatalystLab', to: '/about', badge: 'Mission', badgeVariant: 'default', icon: Compass, ariaLabel: 'About CatalystLab engineering and mission' },
      { label: 'Enterprise Customers', to: '/pricing', badge: 'Linear · Vercel', badgeVariant: 'default', icon: CreditCard, ariaLabel: 'Enterprise customers and case studies' },
      { label: 'Careers & Research', to: '/about', badge: 'Hiring', badgeVariant: 'emerald', icon: Sparkles, ariaLabel: 'Careers and research positions at CatalystLab' },
      { label: 'Contact Engineering', to: '/contact', badge: '24/7 SLA', badgeVariant: 'cyan', icon: Mail, ariaLabel: 'Contact enterprise engineering support' },
      { label: 'Legal & Terms Hub', to: '/legal', badge: 'Legal', badgeVariant: 'default', icon: FileText, ariaLabel: 'Legal disclosures and terms hub' },
      { label: 'Privacy & Cookie Shield', to: '/privacy', badge: 'GDPR', badgeVariant: 'default', icon: Lock, ariaLabel: 'Privacy shield and cookie governance' },
    ],
  },
];

export const Footer: React.FC = () => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    <footer id="main-footer" className="w-full !max-w-none !rounded-none relative z-20 border-t border-white/[0.08] bg-[#020202] text-neutral-300 overflow-hidden m-0 p-0">
      
      <div className="relative w-full max-w-none px-6 lg:px-12 pt-14 pb-10 z-40">
        
        {/* Tier 1: Top Live Telemetry & Quick CLI Runner Row */}
        <div className="pb-8 mb-10 border-b border-white/[0.08] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm sm:text-[15px] font-semibold text-white tracking-[-0.02em]">
              Autonomous Web Health &amp; Multi-PoP Edge Diagnostic Mesh
            </span>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>38 Global PoPs Active &bull; P95 1.06s</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-surface border border-border rounded-xl px-3 py-1.5 font-mono text-xs text-muted-foreground shadow-xs">
            <span className="text-[#00D2FF] font-semibold">$</span>
            <span className="text-white select-all">curl -sSL api.catalystlab.tech/v2/audit</span>
            <CopyButton
              text="curl -sSL api.catalystlab.tech/v2/audit"
              variant="terminal"
              label="Copy"
              copiedLabel="Copied"
              className="py-0.5 px-2 text-[10px] ml-2"
            />
          </div>
        </div>

        {/* Tier 2: Unified Brand Discovery, Trust Badges & Telemetry Newsletter */}
        <div className="pb-10 mb-12 border-b border-white/[0.08] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066FF] rounded-lg"
              aria-label="CatalystLab home"
            >
              <BrandLogo size="md" />
            </Link>
            <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground max-w-xl">
              Multi-dimensional web health, architecture intelligence &amp; automated telemetry diagnostics. Auditing Core Web Vitals, OWASP SecOps, WCAG Accessibility, Eco-Carbon, and AI Readiness across 38 global edge nodes.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <div className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[11px] font-mono text-muted-foreground">
                <Shield className="size-3.5 text-emerald-400" />
                <span>SOC 2 Type II Certified</span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[11px] font-mono text-muted-foreground">
                <Award className="size-3.5 text-[#00D2FF]" />
                <span>ISO 27001 Compliant</span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[11px] font-mono text-muted-foreground">
                <Lock className="size-3.5 text-purple-400" />
                <span>Zero-SDK Architecture</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-white font-mono uppercase tracking-wider">
                  <Mail className="size-3.5 text-[#00D2FF]" />
                  <span>Telemetry Digest</span>
                </div>
                <span className="text-[10px] font-mono text-neutral-500 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06]">Monthly</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                Monthly engineering telemetry on Core Web Vitals, OWASP advisories, and automated AST diff patch branches.
              </p>
              {newsletterSubscribed ? (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-3 py-2.5 text-xs font-mono text-emerald-400">
                  <Check className="size-4 shrink-0" />
                  <span>Subscribed to Telemetry Digest. Welcome aboard.</span>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="flex items-center gap-2">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="engineer@company.com"
                    required
                    aria-label="Work email address for newsletter"
                    className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs font-mono text-white placeholder-neutral-600 focus:border-[#0066FF] focus:outline-none focus:ring-1 focus:ring-[#0066FF] transition-all"
                  />
                  <button
                    type="submit"
                    className="h-9 px-3.5 rounded-xl bg-[#0066FF] text-white hover:bg-[#0052cc] transition-all text-xs font-medium shrink-0 flex items-center justify-center cursor-pointer active:scale-95 shadow-[0_0_12px_rgba(0,102,255,0.4)]"
                    title="Subscribe to Telemetry Digest"
                    aria-label="Subscribe to Telemetry Digest"
                  >
                    <Send className="size-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Tier 3: The 5-Column Slickplan-Grade Uniform Navigation Directory */}
        <nav aria-label="Footer directory navigation" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-8 mb-12">
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.id} className="flex flex-col">
              {/* Uniform Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2 truncate">
                  <col.icon className="size-3.5 text-neutral-400 shrink-0" />
                  <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-white truncate">
                    {col.title}
                  </h3>
                </div>
                <span className="font-mono text-[10px] text-neutral-500 bg-white/[0.03] border border-white/[0.06] px-1.5 py-0.5 rounded shrink-0">
                  {col.code}
                </span>
              </div>

              {/* Uniform Link List */}
              <ul className="space-y-1">
                {col.links.map((link) => (
                  <li key={link.to + link.label}>
                    <Link
                      to={link.to}
                      className="group flex items-center justify-between py-1.5 px-2 -mx-2 rounded-lg text-xs sm:text-[13px] text-muted-foreground hover:text-white hover:bg-white/[0.03] transition-all duration-150"
                      aria-label={link.ariaLabel || link.label}
                    >
                      <span className="flex items-center gap-2 truncate">
                        <link.icon className="size-3.5 shrink-0 text-muted-foreground group-hover:text-[#00D2FF] group-hover:scale-110 transition-all duration-150" />
                        <span className="truncate group-hover:translate-x-0.5 transition-transform duration-150">
                          {link.label}
                        </span>
                      </span>
                      {link.badge && (
                        <span className={cn(
                          "ml-2 shrink-0 font-mono text-[10px] px-1.5 py-0.5 rounded border transition-colors duration-150",
                          BADGE_VARIANTS[link.badgeVariant || 'default']
                        )}>
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Tier 4: Background Typography Wordmark */}
        <div className="lg:flex hidden h-28 sm:h-36 -mt-6 -mb-6 pointer-events-none select-none items-center justify-center opacity-35">
          <TextHoverEffect text="CATALYST" className="w-full max-w-4xl" />
        </div>

        {/* Tier 5: Bottom Metadata Bar & Actions */}
        <div className="mt-8 flex flex-col items-center justify-between border-t border-white/[0.08] pt-6 sm:flex-row gap-4 z-50">
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <p className="text-xs text-muted-foreground font-mono">
              &copy; 2026 <strong className="text-white font-semibold">CatalystLab Inc.</strong> Multi-Dimensional Web Health &amp; Edge Telemetry Platform.
            </p>
            <span className="text-[11px] font-mono text-neutral-400 bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/[0.08]">
              Engine v2.4
            </span>
            <SyncStatusBadge />
          </div>

          {/* Social Channels Uniform Row */}
          <div className="flex items-center gap-2">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="size-8 rounded-lg border border-border bg-surface hover:bg-surface-elevated hover:border-border-strong flex items-center justify-center text-neutral-400 hover:text-white transition-all shadow-2xs"
              aria-label="CatalystLab GitHub repository"
            >
              <Code2 className="size-4" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              className="size-8 rounded-lg border border-border bg-surface hover:bg-surface-elevated hover:border-border-strong flex items-center justify-center text-neutral-400 hover:text-white transition-all shadow-2xs"
              aria-label="CatalystLab on X / Twitter"
            >
              <Share2 className="size-4" />
            </a>
            <a
              href="https://discord.com"
              target="_blank"
              rel="noreferrer"
              className="size-8 rounded-lg border border-border bg-surface hover:bg-surface-elevated hover:border-border-strong flex items-center justify-center text-neutral-400 hover:text-white transition-all shadow-2xs"
              aria-label="CatalystLab Discord community"
            >
              <MessageSquare className="size-4" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              className="size-8 rounded-lg border border-border bg-surface hover:bg-surface-elevated hover:border-border-strong flex items-center justify-center text-neutral-400 hover:text-white transition-all shadow-2xs"
              aria-label="CatalystLab on LinkedIn"
            >
              <ExternalLink className="size-4" />
            </a>

            {/* Back to Top */}
            <button
              type="button"
              onClick={scrollToTop}
              className="group ml-2 flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-mono text-neutral-400 transition-all duration-200 hover:border-border-strong hover:text-white hover:bg-surface-elevated shadow-2xs cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066FF]"
              title="Scroll back to top"
              aria-label="Scroll back to top of page"
            >
              <ArrowUp className="size-3.5 text-[#00D2FF] group-hover:-translate-y-0.5 transition-transform duration-200" />
              <span className="hidden sm:inline">Top</span>
            </button>
          </div>
        </div>
      </div>

      <FooterBackgroundGradient />
    </footer>
  );
};

export default Footer;


