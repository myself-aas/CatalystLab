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
  Sparkles
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { SyncStatusBadge } from '../common/SyncStatusBadge';

export const Footer: React.FC = () => {
  const [copiedCli, setCopiedCli] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const copyCliCommand = () => {
    navigator.clipboard.writeText('npx catalystlab audit https://yoursite.com');
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2500);
  };

  return (
    <footer id="main-footer" className="relative z-20 border-t border-brand-slate/30 bg-brand-oxford text-brand-offwhite">
      {/* Main Multi-Column Footer Menu */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12">
          
          {/* Column 1: Brand, Mission & CLI Snippet */}
          <div className="sm:col-span-2 lg:col-span-4 space-y-4">
            <Link to="/" className="inline-block transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate">
              <BrandLogo size="md" />
            </Link>
            
            <p className="text-xs sm:text-sm leading-relaxed text-brand-periwinkle max-w-sm">
              Multi-dimensional web health, architecture intelligence &amp; automated telemetry diagnostics. Auditing Core Web Vitals, OWASP SecOps, WCAG Accessibility, Eco-Carbon, and AI Readiness.
            </p>

            {/* Quick CLI Copy Box */}
            <div className="rounded-xl border border-brand-slate/30 bg-surface-panel p-2.5 max-w-sm shadow-inner">
              <div className="flex items-center justify-between gap-2 text-xs font-mono text-brand-periwinkle">
                <div className="flex items-center gap-1.5 truncate">
                  <Terminal className="h-3.5 w-3.5 text-accent-cyan shrink-0" />
                  <span className="truncate text-brand-offwhite">npx catalystlab audit</span>
                </div>
                <button
                  type="button"
                  onClick={copyCliCommand}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-brand-oxford hover:bg-brand-navy text-[11px] text-brand-periwinkle hover:text-white border border-brand-slate/40 transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate"
                  title="Copy CLI command"
                >
                  {copiedCli ? (
                    <>
                      <Check className="h-3 w-3 text-accent-emerald" />
                      <span className="text-accent-emerald">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Engine Status Indicator */}
            <div className="flex items-center gap-2 rounded-full border border-brand-slate/30 bg-surface-panel px-3 py-1 text-xs text-brand-periwinkle w-fit font-mono">
              <span className="h-2 w-2 rounded-full bg-accent-emerald animate-pulse" />
              <span>8 Python Diagnostic Engines Active</span>
            </div>
          </div>

          {/* Column 2: Platform Solutions */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-offwhite flex items-center gap-1.5 mb-3 border-b border-brand-slate/30 pb-2 font-mono">
              <Globe className="h-3.5 w-3.5 text-accent-cyan" />
              <span>Platform</span>
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-brand-periwinkle">
              <li>
                <Link to="/" className="hover:text-white transition-colors block py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate">Home</Link>
              </li>
              <li>
                <Link to="/launch-audit" className="hover:text-white transition-colors block py-0.5 text-brand-offwhite font-medium flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate">
                  <span>Launch Master Audit</span>
                  <span className="text-[10px] bg-accent-cyan/20 text-accent-cyan px-1 rounded font-mono">Instant</span>
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-white transition-colors block py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate">Pricing &amp; Plans</Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-white transition-colors block py-0.5 text-accent-cyan flex items-center justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate">
                  <span>Products &amp; Watchdog</span>
                  <span className="text-[10px] bg-accent-cyan/20 text-accent-cyan px-1 rounded font-mono">Continuous</span>
                </Link>
              </li>
              <li>
                <Link to="/compare" className="hover:text-white transition-colors block py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate">Side-by-Side Compare</Link>
              </li>
              <li>
                <Link to="/reports" className="hover:text-white transition-colors block py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate">Audit Reports Directory</Link>
              </li>
              <li>
                <Link to="/blogs" className="hover:text-white transition-colors block py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate">Engineering Blogs</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors block py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate">About Us &amp; Team</Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors block py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate">User Dashboard</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: 8 Diagnostic Engines */}
          <div className="lg:col-span-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-offwhite flex items-center gap-1.5 mb-3 border-b border-brand-slate/30 pb-2 font-mono">
              <Activity className="h-3.5 w-3.5 text-accent-emerald" />
              <span>8 Diagnostic Engines</span>
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-brand-periwinkle">
              <li>
                <Link to="/health" className="hover:text-white transition-colors flex items-center justify-between py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate">
                  <span>VitalZyme (Web Vitals)</span>
                  <span className="text-[10px] text-brand-slate-light font-mono">DOM/TTFB</span>
                </Link>
              </li>
              <li>
                <Link to="/ai-readiness" className="hover:text-white transition-colors flex items-center justify-between py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate">
                  <span>LLM-Kinase (AI Readiness)</span>
                  <span className="text-[10px] text-accent-purple font-mono">llms.txt</span>
                </Link>
              </li>
              <li>
                <Link to="/repo-scanner" className="hover:text-white transition-colors flex items-center justify-between py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate">
                  <span>GitLygase (Repo Hygiene)</span>
                  <span className="text-[10px] text-accent-emerald font-mono">SecOps</span>
                </Link>
              </li>
              <li>
                <Link to="/latency" className="hover:text-white transition-colors flex items-center justify-between py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate">
                  <span>EdgeVmax (Latency Radar)</span>
                  <span className="text-[10px] text-accent-cyan font-mono">42 PoPs</span>
                </Link>
              </li>
              <li>
                <Link to="/eco-audit" className="hover:text-white transition-colors flex items-center justify-between py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate">
                  <span>EcoHolo (Carbon Audit)</span>
                  <span className="text-[10px] text-emerald-400 font-mono">CO2e</span>
                </Link>
              </li>
              <li>
                <Link to="/compliance" className="hover:text-white transition-colors flex items-center justify-between py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate">
                  <span>RiskProtease (OWASP SecOps)</span>
                  <span className="text-[10px] text-accent-amber font-mono">Headers</span>
                </Link>
              </li>
              <li>
                <Link to="/migration" className="hover:text-white transition-colors flex items-center justify-between py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate">
                  <span>SynthShift (Architecture PAR)</span>
                  <span className="text-[10px] text-orange-400 font-mono">Phase 1</span>
                </Link>
              </li>
              <li>
                <Link to="/llmo" className="hover:text-white transition-colors flex items-center justify-between py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate">
                  <span>AllosterSearch (LLMO Search)</span>
                  <span className="text-[10px] text-accent-cyan font-mono">GEO</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Developers & Legal */}
          <div className="lg:col-span-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-offwhite flex items-center gap-1.5 mb-3 border-b border-brand-slate/30 pb-2 font-mono">
              <Code2 className="h-3.5 w-3.5 text-accent-purple" />
              <span>Developers &amp; Legal</span>
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-brand-periwinkle">
              <li>
                <Link to="/api-docs" className="hover:text-accent-cyan transition-colors flex items-center gap-1.5 font-medium text-accent-cyan py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate">
                  <span>REST API Reference</span>
                  <span className="text-[10px] bg-accent-cyan/20 px-1 py-0.2 rounded font-mono">v2.4</span>
                </Link>
              </li>
              <li>
                <Link to="/playground" className="hover:text-white transition-colors flex items-center gap-1.5 py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate">
                  <Sparkles className="h-3 w-3 text-accent-cyan" />
                  <span>Interactive API Playground</span>
                </Link>
              </li>
              <li>
                <Link to="/docs" className="hover:text-white transition-colors block py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate">Documentation &amp; Guides</Link>
              </li>
              <li>
                <Link to="/methodology" className="hover:text-white transition-colors block py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate">Audit Methodology &amp; Weights</Link>
              </li>
              <li className="pt-2 border-t border-brand-slate/30">
                <Link to="/privacy" className="hover:text-white transition-colors block py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate">Privacy Policy (GDPR / CCPA)</Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors block py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate">Terms of Service</Link>
              </li>
              <li>
                <Link to="/cookies" className="hover:text-white transition-colors block py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate">Cookie Preferences</Link>
              </li>
              <li>
                <Link to="/security" className="hover:text-white transition-colors block py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate">Security &amp; Vulnerability Disclosure</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors block py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate">Contact Support &amp; SLA</Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Copyright, Sync, and Back to Top */}
        <div className="mt-12 flex flex-col items-center justify-between border-t border-brand-slate/30 pt-6 sm:flex-row gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <p className="text-xs text-brand-slate-light font-mono">
              &copy; 2026 CatalystLab. Enterprise Telemetry &amp; Automated Web Quality Intelligence.
            </p>
            <SyncStatusBadge />
          </div>
          
          <button
            type="button"
            onClick={scrollToTop}
            className="flex items-center gap-1.5 rounded-xl border border-brand-slate/40 bg-surface-panel px-3.5 py-2 text-xs font-mono text-brand-periwinkle transition-colors hover:border-accent-cyan hover:text-white hover:bg-surface-subtle shadow-sm cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate"
            title="Scroll back to top"
          >
            <ArrowUp className="h-3.5 w-3.5 text-accent-cyan" />
            <span>Back to Top</span>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
