import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowUp, 
  Terminal, 
  Copy, 
  Check, 
  Activity, 
  Code2, 
  ShieldCheck, 
  FileText, 
  Globe, 
  Sparkles,
  Layers,
  Cpu,
  Mail
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { SyncStatusBadge } from '../common/SyncStatusBadge';
import { openGetInTouchModal } from '../common/GetInTouchEmailModal';

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
    <footer id="main-footer" className="relative z-20 border-t border-slate-800/80 bg-[#070b12] text-white">
      {/* Main Multi-Column Footer Menu */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12">
          
          {/* Column 1: Brand, Mission & CLI Snippet (Spans 4 columns on large screens) */}
          <div className="sm:col-span-2 lg:col-span-4 space-y-4">
            <Link to="/" className="inline-block transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
              <BrandLogo size="md" />
            </Link>
            
            <p className="text-xs sm:text-sm leading-relaxed text-slate-300 max-w-sm">
              Multi-dimensional web health, architecture intelligence & automated telemetry diagnostics. Auditing Core Web Vitals, OWASP SecOps, WCAG Accessibility, Eco-Carbon, and AI Readiness.
            </p>

            {/* Quick CLI Copy Box */}
            <div className="rounded-xl border border-slate-800 bg-[#0d1322] p-2.5 max-w-sm shadow-inner">
              <div className="flex items-center justify-between gap-2 text-xs font-mono text-slate-300">
                <div className="flex items-center gap-1.5 truncate">
                  <Terminal className="h-3.5 w-3.5 text-[#38bdf8] shrink-0" />
                  <span className="truncate text-white">npx catalystlab audit</span>
                </div>
                <button
                  type="button"
                  onClick={copyCliCommand}
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#070b12] hover:bg-[#162035] text-[11px] text-slate-300 hover:text-white border border-slate-700/60 transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                  title="Copy CLI command"
                >
                  {copiedCli ? (
                    <>
                      <Check className="h-3 w-3 text-[#34d399]" />
                      <span className="text-[#34d399]">Copied</span>
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
            <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-[#0d1322] px-3 py-1 text-xs text-slate-300 w-fit">
              <span className="h-2 w-2 rounded-full bg-[#34d399] animate-pulse" />
              <span>8 Python Diagnostic Engines Active</span>
            </div>
          </div>

          {/* Column 2: Platform Solutions */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5 mb-3 border-b border-slate-800/80 pb-2">
              <Globe className="h-3.5 w-3.5 text-[#38bdf8]" />
              <span>Platform</span>
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
              <li>
                <Link to="/" className="hover:text-white transition-colors block py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">Home</Link>
              </li>
              <li>
                <Link to="/launch-audit" className="hover:text-white transition-colors block py-0.5 text-white font-medium flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
                  <span>Launch Master Audit</span>
                  <span className="text-[10px] bg-[#38bdf8]/20 text-[#38bdf8] px-1 rounded font-mono">Instant</span>
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-white transition-colors block py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">Pricing &amp; Plans</Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-white transition-colors block py-0.5 text-[#38bdf8] flex items-center justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
                  <span>Products &amp; Plugins</span>
                  <span className="text-[10px] bg-[#38bdf8]/20 text-[#38bdf8] px-1 rounded font-mono">Watchdog</span>
                </Link>
              </li>
              <li>
                <Link to="/compare" className="hover:text-white transition-colors block py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">Side-by-Side Compare</Link>
              </li>
              <li>
                <Link to="/reports" className="hover:text-white transition-colors block py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">Audit Reports Directory</Link>
              </li>
              <li>
                <Link to="/blogs" className="hover:text-white transition-colors block py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">Engineering Blogs</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors block py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">About Us & Team</Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors block py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">User Dashboard</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: 8 Diagnostic Engines */}
          <div className="lg:col-span-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5 mb-3 border-b border-slate-800/80 pb-2">
              <Activity className="h-3.5 w-3.5 text-[#34d399]" />
              <span>8 Diagnostic Engines</span>
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
              <li>
                <Link to="/health" className="hover:text-white transition-colors flex items-center justify-between py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
                  <span>VitalZyme (Web Vitals)</span>
                  <span className="text-[10px] text-slate-400 font-mono">DOM/TTFB</span>
                </Link>
              </li>
              <li>
                <Link to="/ai-readiness" className="hover:text-white transition-colors flex items-center justify-between py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
                  <span>LLM-Kinase (AI Readiness)</span>
                  <span className="text-[10px] text-[#c084fc] font-mono">llms.txt</span>
                </Link>
              </li>
              <li>
                <Link to="/repo-scanner" className="hover:text-white transition-colors flex items-center justify-between py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
                  <span>GitLygase (Repo Hygiene)</span>
                  <span className="text-[10px] text-[#34d399] font-mono">SecOps</span>
                </Link>
              </li>
              <li>
                <Link to="/latency" className="hover:text-white transition-colors flex items-center justify-between py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
                  <span>EdgeVmax (Latency Radar)</span>
                  <span className="text-[10px] text-[#38bdf8] font-mono">42 PoPs</span>
                </Link>
              </li>
              <li>
                <Link to="/eco-audit" className="hover:text-white transition-colors flex items-center justify-between py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
                  <span>EcoHolo (Carbon Audit)</span>
                  <span className="text-[10px] text-[#4ade80] font-mono">CO2e</span>
                </Link>
              </li>
              <li>
                <Link to="/compliance" className="hover:text-white transition-colors flex items-center justify-between py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
                  <span>RiskProtease (OWASP SecOps)</span>
                  <span className="text-[10px] text-[#f59e0b] font-mono">Headers</span>
                </Link>
              </li>
              <li>
                <Link to="/migration" className="hover:text-white transition-colors flex items-center justify-between py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
                  <span>SynthShift (Architecture PAR)</span>
                  <span className="text-[10px] text-orange-400 font-mono">Phase 1</span>
                </Link>
              </li>
              <li>
                <Link to="/llmo" className="hover:text-white transition-colors flex items-center justify-between py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
                  <span>AllosterSearch (LLMO Search)</span>
                  <span className="text-[10px] text-cyan-400 font-mono">GEO</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Developers & Legal */}
          <div className="lg:col-span-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5 mb-3 border-b border-slate-800/80 pb-2">
              <Code2 className="h-3.5 w-3.5 text-[#c084fc]" />
              <span>Developers & Legal</span>
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
              <li>
                <Link to="/api-docs" className="hover:text-[#38bdf8] transition-colors flex items-center gap-1.5 font-medium text-[#38bdf8] py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
                  <span>REST API Reference</span>
                  <span className="text-[10px] bg-[#38bdf8]/20 px-1 py-0.2 rounded font-mono">v2.4</span>
                </Link>
              </li>
              <li>
                <Link to="/playground" className="hover:text-white transition-colors flex items-center gap-1.5 py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
                  <Sparkles className="h-3 w-3 text-cyan-400" />
                  <span>Interactive API Playground</span>
                </Link>
              </li>
              <li>
                <Link to="/docs" className="hover:text-white transition-colors block py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">Documentation & Guides</Link>
              </li>
              <li>
                <Link to="/methodology" className="hover:text-white transition-colors block py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">Audit Methodology & Weights</Link>
              </li>
              <li className="pt-2 border-t border-slate-800/80">
                <Link to="/privacy" className="hover:text-white transition-colors block py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">Privacy Policy (GDPR / CCPA)</Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors block py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">Terms of Service</Link>
              </li>
              <li>
                <Link to="/cookies" className="hover:text-white transition-colors block py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">Cookie Preferences</Link>
              </li>
              <li>
                <Link to="/security" className="hover:text-white transition-colors block py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">Security & Vulnerability Disclosure</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors block py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">Contact Support & SLA</Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Copyright, Sync, and Back to Top */}
        <div className="mt-12 flex flex-col items-center justify-between border-t border-slate-800/80 pt-6 sm:flex-row gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <p className="text-xs text-slate-400">
              © 2026 CatalystLab. Enterprise Telemetry & Automated Web Quality Intelligence. All rights reserved.
            </p>
            <SyncStatusBadge />
          </div>
          
          <button
            type="button"
            onClick={scrollToTop}
            className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-[#0d1322] px-3.5 py-2 text-xs font-mono text-slate-300 transition-all hover:border-[#38bdf8] hover:text-white hover:bg-[#131b2e] shadow-sm cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            title="Scroll back to top"
          >
            <ArrowUp className="h-3.5 w-3.5 text-[#38bdf8]" />
            <span>Back to Top</span>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

