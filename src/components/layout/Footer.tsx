import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowUp, 
  Check, 
  Activity, 
  Code2, 
  Lock,
  Mail,
  Send,
  Shield,
  Award,
  Share2,
  MessageSquare,
  ExternalLink,
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { SyncStatusBadge } from '../common/SyncStatusBadge';
import { TextHoverEffect, FooterBackgroundGradient } from '../ui/hover-footer';
import { cn } from '../../lib/utils';
import { CopyButton } from '../ui/CopyButton';
import { FOOTER_GROUPS, type NavBadgeVariant } from '../../navigation';

const BADGE_VARIANTS: Record<NavBadgeVariant, string> = {
  default: 'text-neutral-400 bg-white/[0.04] border-white/[0.08] group-hover:border-border-strong group-hover:text-neutral-200',
  cyan: 'text-[#00D2FF] bg-[#00D2FF]/10 border-[#00D2FF]/20 group-hover:border-[#00D2FF]/40 group-hover:bg-[#00D2FF]/15',
  emerald: 'text-[#00F298] bg-[#00F298]/10 border-[#00F298]/20 group-hover:border-[#00F298]/40 group-hover:bg-[#00F298]/15',
  violet: 'text-[#A78BFA] bg-[#8A2BE2]/15 border-[#8A2BE2]/25 group-hover:border-[#8A2BE2]/50 group-hover:bg-[#8A2BE2]/20',
  amber: 'text-[#FF9900] bg-[#FF9900]/10 border-[#FF9900]/20 group-hover:border-[#FF9900]/40 group-hover:bg-[#FF9900]/15',
  rose: 'text-[#FF3366] bg-[#FF3366]/10 border-[#FF3366]/20 group-hover:border-[#FF3366]/40 group-hover:bg-[#FF3366]/15',
};

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
          {FOOTER_GROUPS.map((col) => {
            const GroupIcon = col.items[0]?.icon ?? Activity;
            return (
              <div key={col.id} className="flex flex-col">
                {/* Uniform Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2 truncate">
                    <GroupIcon className="size-3.5 text-neutral-400 shrink-0" />
                    <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-white truncate">
                      {col.label}
                    </h3>
                  </div>
                  {col.code && (
                    <span className="font-mono text-[10px] text-neutral-500 bg-white/[0.03] border border-white/[0.06] px-1.5 py-0.5 rounded shrink-0">
                      {col.code}
                    </span>
                  )}
                </div>

                {/* Uniform Link List */}
                <ul className="space-y-1">
                  {col.items.map((link) => {
                    const Icon = link.icon ?? Activity;
                    return (
                      <li key={link.id}>
                        <Link
                          to={link.to}
                          className="group flex items-center justify-between py-1.5 px-2 -mx-2 rounded-lg text-xs sm:text-[13px] text-muted-foreground hover:text-white hover:bg-white/[0.03] transition-all duration-150"
                          aria-label={link.badge ? `${link.label} — ${link.badge}` : link.label}
                        >
                          <span className="flex items-center gap-2 truncate">
                            <Icon className="size-3.5 shrink-0 text-muted-foreground group-hover:text-[#00D2FF] transition-colors duration-150" />
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
                    );
                  })}
                </ul>
              </div>
            );
          })}
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


