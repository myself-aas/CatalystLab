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
    <footer id="main-footer" className="relative z-20 border-t border-border/80 bg-[#04060d] text-muted-foreground">
      {/* Main Multi-Column Footer Menu */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12">
          
          {/* Column 1: Brand, Mission & CLI Snippet */}
          <div className="sm:col-span-2 lg:col-span-4 space-y-4">
            <Link to="/" className="inline-block transition-opacity hover:opacity-90 focus-visible:outline-none">
              <BrandLogo size="md" />
            </Link>
            
            <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground max-w-sm">
              Multi-dimensional web health, architecture intelligence &amp; automated telemetry diagnostics. Auditing Core Web Vitals, OWASP SecOps, WCAG Accessibility, Eco-Carbon, and AI Readiness.
            </p>

            {/* Quick CLI Copy Box */}
            <div className="rounded-xl border border-border bg-[#0a0f1d] p-2.5 max-w-sm shadow-sm">
              <div className="flex items-center justify-between gap-2 text-xs font-mono text-muted-foreground">
                <div className="flex items-center gap-1.5 truncate">
                  <Terminal className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                  <span className="truncate text-primary-foreground font-semibold">npx catalystlab audit</span>
                </div>
                <button
                  type="button"
                  onClick={copyCliCommand}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted hover:bg-muted/80 text-[11px] text-muted-foreground hover:text-foreground border border-border transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50"
                  title="Copy CLI command"
                >
                  {copiedCli ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      <span className="text-emerald-400 font-semibold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 text-muted-foreground" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Engine Status Indicator */}
            <div className="flex items-center gap-2 rounded-full border border-border bg-[#0a0f1d] px-3 py-1 text-xs text-muted-foreground w-fit font-mono shadow-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>8 Python Diagnostic Engines Active</span>
            </div>
          </div>

          {/* Column 2: Platform Solutions */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5 mb-3 border-b border-border pb-2 font-mono">
              <Globe className="h-3.5 w-3.5 text-cyan-400" />
              <span>Platform</span>
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li>
                <Link to="/" className="hover:text-cyan-400 transition-colors block py-0.5 focus-visible:outline-none">Home</Link>
              </li>
              <li>
                <Link to="/launch-audit" className="hover:text-cyan-400 transition-colors block py-0.5 text-muted-foreground font-medium flex items-center gap-1 focus-visible:outline-none">
                  <span>Launch Master Audit</span>
                  <span className="text-[10px] bg-cyan-950/60 text-cyan-400 border border-cyan-500/30 px-1 rounded font-mono font-semibold">Instant</span>
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-cyan-400 transition-colors block py-0.5 focus-visible:outline-none">Pricing &amp; Plans</Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-cyan-400 transition-colors block py-0.5 text-muted-foreground font-medium flex items-center justify-between focus-visible:outline-none">
                  <span>Products &amp; Watchdog</span>
                  <span className="text-[10px] bg-cyan-950/60 text-cyan-400 border border-cyan-500/30 px-1 rounded font-mono font-semibold">Continuous</span>
                </Link>
              </li>
              <li>
                <Link to="/compare" className="hover:text-cyan-400 transition-colors block py-0.5 focus-visible:outline-none">Side-by-Side Compare</Link>
              </li>
              <li>
                <Link to="/reports" className="hover:text-cyan-400 transition-colors block py-0.5 focus-visible:outline-none">Audit Reports Directory</Link>
              </li>
              <li>
                <Link to="/blogs" className="hover:text-cyan-400 transition-colors block py-0.5 focus-visible:outline-none">Engineering Blogs</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-cyan-400 transition-colors block py-0.5 focus-visible:outline-none">About Us &amp; Team</Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-cyan-400 transition-colors block py-0.5 focus-visible:outline-none">User Dashboard</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: 8 Diagnostic Engines */}
          <div className="lg:col-span-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5 mb-3 border-b border-border pb-2 font-mono">
              <Activity className="h-3.5 w-3.5 text-cyan-400" />
              <span>8 Diagnostic Engines</span>
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li>
                <Link to="/health" className="hover:text-cyan-400 transition-colors flex items-center justify-between py-0.5 focus-visible:outline-none">
                  <span>VitalZyme (Web Vitals)</span>
                  <span className="text-[10px] text-cyan-400 font-mono">DOM/TTFB</span>
                </Link>
              </li>
              <li>
                <Link to="/ai-readiness" className="hover:text-cyan-400 transition-colors flex items-center justify-between py-0.5 focus-visible:outline-none">
                  <span>LLM-Kinase (AI Readiness)</span>
                  <span className="text-[10px] text-purple-400 font-mono">llms.txt</span>
                </Link>
              </li>
              <li>
                <Link to="/repo-scanner" className="hover:text-cyan-400 transition-colors flex items-center justify-between py-0.5 focus-visible:outline-none">
                  <span>GitLygase (Repo Hygiene)</span>
                  <span className="text-[10px] text-emerald-400 font-mono">SecOps</span>
                </Link>
              </li>
              <li>
                <Link to="/latency" className="hover:text-cyan-400 transition-colors flex items-center justify-between py-0.5 focus-visible:outline-none">
                  <span>EdgeVmax (Latency Radar)</span>
                  <span className="text-[10px] text-cyan-300 font-mono">42 PoPs</span>
                </Link>
              </li>
              <li>
                <Link to="/eco-audit" className="hover:text-cyan-400 transition-colors flex items-center justify-between py-0.5 focus-visible:outline-none">
                  <span>EcoHolo (Carbon Audit)</span>
                  <span className="text-[10px] text-emerald-400 font-mono">CO2e</span>
                </Link>
              </li>
              <li>
                <Link to="/compliance" className="hover:text-cyan-400 transition-colors flex items-center justify-between py-0.5 focus-visible:outline-none">
                  <span>RiskProtease (OWASP SecOps)</span>
                  <span className="text-[10px] text-rose-400 font-mono">Headers</span>
                </Link>
              </li>
              <li>
                <Link to="/migration" className="hover:text-cyan-400 transition-colors flex items-center justify-between py-0.5 focus-visible:outline-none">
                  <span>SynthShift (Architecture PAR)</span>
                  <span className="text-[10px] text-amber-400 font-mono">Phase 1</span>
                </Link>
              </li>
              <li>
                <Link to="/llmo" className="hover:text-cyan-400 transition-colors flex items-center justify-between py-0.5 focus-visible:outline-none">
                  <span>AllosterSearch (LLMO Search)</span>
                  <span className="text-[10px] text-sky-400 font-mono">GEO</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Developers & Legal */}
          <div className="lg:col-span-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5 mb-3 border-b border-border pb-2 font-mono">
              <Code2 className="h-3.5 w-3.5 text-purple-400" />
              <span>Developers &amp; Legal</span>
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li>
                <Link to="/api-docs" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5 font-medium text-muted-foreground py-0.5 focus-visible:outline-none">
                  <span>REST API Reference</span>
                  <span className="text-[10px] bg-cyan-950/60 text-cyan-400 border border-cyan-500/30 px-1 py-0.5 rounded font-mono">v2.4</span>
                </Link>
              </li>
              <li>
                <Link to="/playground" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5 py-0.5 focus-visible:outline-none">
                  <Sparkles className="h-3 w-3 text-cyan-400" />
                  <span>Interactive API Playground</span>
                </Link>
              </li>
              <li>
                <Link to="/docs" className="hover:text-cyan-400 transition-colors block py-0.5 focus-visible:outline-none">Documentation &amp; Guides</Link>
              </li>
              <li>
                <Link to="/methodology" className="hover:text-cyan-400 transition-colors block py-0.5 focus-visible:outline-none">Audit Methodology &amp; Weights</Link>
              </li>
              <li className="pt-2 border-t border-border">
                <Link to="/privacy" className="hover:text-cyan-400 transition-colors block py-0.5 focus-visible:outline-none">Privacy Policy (GDPR / CCPA)</Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-cyan-400 transition-colors block py-0.5 focus-visible:outline-none">Terms of Service</Link>
              </li>
              <li>
                <Link to="/cookies" className="hover:text-cyan-400 transition-colors block py-0.5 focus-visible:outline-none">Cookie Preferences</Link>
              </li>
              <li>
                <Link to="/security" className="hover:text-cyan-400 transition-colors block py-0.5 focus-visible:outline-none">Security &amp; Vulnerability Disclosure</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-cyan-400 transition-colors block py-0.5 focus-visible:outline-none">Contact Support &amp; SLA</Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Copyright, Credits, Sync, and Back to Top */}
        <div className="mt-12 flex flex-col items-center justify-between border-t border-border pt-6 sm:flex-row gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <p className="text-xs text-muted-foreground font-mono">
              &copy; 2026 CatalystLab. Enterprise Telemetry &amp; Automated Web Quality Intelligence.
            </p>
            <span className="text-[11px] font-mono text-muted-foreground bg-muted/60 px-2 py-0.5 rounded border border-border">
              Telemetry Engine v2.4
            </span>
            <SyncStatusBadge />
          </div>
          
          <button
            type="button"
            onClick={scrollToTop}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-muted px-3.5 py-2 text-xs font-mono text-muted-foreground transition-colors hover:border-cyan-500 hover:text-primary-foreground shadow-xs cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50"
            title="Scroll back to top"
          >
            <ArrowUp className="h-3.5 w-3.5 text-cyan-400" />
            <span>Back to Top</span>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
