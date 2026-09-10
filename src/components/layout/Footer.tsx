import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowUp, 
  Code2, 
  Share2,
  MessageSquare,
  ExternalLink,
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { SyncStatusBadge } from '../common/SyncStatusBadge';
import { FooterBackgroundGradient } from '../ui/hover-footer';
import { FOOTER_GROUPS } from '../../navigation';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="main-footer" className="w-full !max-w-none !rounded-none relative z-20 border-t border-foreground/[0.08] bg-background text-neutral-300 overflow-hidden m-0 p-0">
      
      <div className="relative w-full max-w-none px-6 lg:px-12 pt-16 pb-12 z-40">
        
        {/* Unified Navigation Directory Grid */}
        <nav aria-label="Footer directory navigation" className="grid grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-16">
          
          {/* Segment 1: Brand identity & Social presence */}
          <div className="flex flex-col space-y-8">
            <div className="flex flex-col space-y-6">
              <Link 
                to="/" 
                className="inline-flex items-center gap-2 transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0FAFF] rounded-lg"
                aria-label="CatalystLab home"
              >
                <BrandLogo size="md" />
              </Link>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Multi-dimensional web health, architecture intelligence &amp; automated telemetry diagnostics across 38 global edge nodes. Precision auditing for the modern engineering stack.
                <span className="block mt-4 font-mono text-[#F0FAFF] opacity-60">CONNECT &lt;/&gt; &amp;</span>
              </p>
            </div>

            <div className="flex flex-col space-y-4">
              <h4 className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">
                Connect
              </h4>
              <div className="flex items-center gap-3">
                {[
                  { icon: Code2, label: 'GitHub', href: 'https://github.com' },
                  { icon: Share2, label: 'Twitter', href: 'https://twitter.com' },
                  { icon: MessageSquare, label: 'Discord', href: 'https://discord.com' },
                  { icon: ExternalLink, label: 'LinkedIn', href: 'https://linkedin.com' },
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    className="size-9 rounded-lg border border-border bg-surface hover:bg-surface-elevated hover:border-border-strong flex items-center justify-center text-neutral-400 hover:text-foreground transition-all shadow-2xs group"
                    aria-label={`CatalystLab on ${social.label}`}
                  >
                    <social.icon className="size-4.5 transition-transform group-hover:scale-110" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Segment 2: Resources */}
          <div className="flex flex-col">
            <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-foreground mb-8 border-l-2 border-foreground/40 pl-4">
              Resources
            </h3>
            <ul className="space-y-4">
              {[
                { label: 'About', to: '/about' },
                { label: 'Blogs', to: '/blogs' },
                { label: 'Docs', to: '/docs' },
                { label: 'Pricing', to: '/pricing' },
                { label: 'Contact', to: '/contact' },
                { label: 'Privacy', to: '/privacy' },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="text-[13px] text-muted-foreground hover:text-foreground transition-colors duration-150 hover:pl-1 transition-all"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Segment 3: Engines */}
          <div className="flex flex-col">
            <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-foreground mb-8 border-l-2 border-foreground/40 pl-4">
              Engines
            </h3>
            <ul className="space-y-4">
              {FOOTER_GROUPS[0].items.slice(0, 6).map((item) => (
                <li key={item.id}>
                  <Link
                    to={item.to}
                    className="text-[13px] text-muted-foreground hover:text-foreground transition-colors duration-150 hover:pl-1 transition-all"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Segment 4: Platform */}
          <div className="flex flex-col">
            <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-foreground mb-8 border-l-2 border-foreground/40 pl-4">
              Platform
            </h3>
            <ul className="space-y-4">
              {[...FOOTER_GROUPS[1].items.slice(0, 3), ...FOOTER_GROUPS[2].items.slice(0, 3)].map((item) => (
                <li key={item.id}>
                  <Link
                    to={item.to}
                    className="text-[13px] text-muted-foreground hover:text-foreground transition-colors duration-150 hover:pl-1 transition-all"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </nav>

        {/* Bottom Metadata Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-foreground/[0.08] pt-8 gap-6">
          <div className="flex flex-wrap items-center gap-4 justify-center sm:justify-start">
            <p className="text-xs text-muted-foreground font-mono">
              &copy; 2026 <span className="text-foreground">CatalystLab Inc.</span>
            </p>
            <div className="hidden sm:block w-1 h-1 rounded-full bg-foreground/20" />
            <SyncStatusBadge />
            <div className="hidden sm:block w-1 h-1 rounded-full bg-foreground/20" />
            <span className="text-[11px] font-mono text-neutral-500">v2.4.0</span>
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            className="group flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-xs font-mono text-neutral-400 transition-all duration-200 hover:border-border-strong hover:text-foreground hover:bg-surface-elevated shadow-2xs cursor-pointer"
            aria-label="Scroll to top"
          >
            <ArrowUp className="size-3.5 text-[#F0FAFF] group-hover:-translate-y-0.5 transition-transform duration-200" />
            <span>TOP</span>
          </button>
        </div>
      </div>

      <FooterBackgroundGradient />
    </footer>
  );
};

export default Footer;


