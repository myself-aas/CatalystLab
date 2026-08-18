import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Sparkles, Terminal, Activity, ArrowUp } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          
          {/* Col 1: Brand & Mission */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 text-lg font-bold text-white">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-xs font-bold text-white">
                ⚡
              </div>
              <span>CatalystLab</span>
              <span className="rounded bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-400 border border-cyan-500/20">
                PRO
              </span>
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-400">
              Multi-dimensional web health, architecture intelligence & telemetry diagnostics. Auditing Core Web Vitals, OWASP SecOps, WCAG Accessibility, Eco-Carbon, and AI Readiness.
            </p>
            <div className="mt-4 flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400 w-fit">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Python Diagnostic Engines Active</span>
            </div>
          </div>

          {/* Col 2: Core Platform */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Platform</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/" className="hover:text-cyan-400 transition-colors">Master 8-Engine Scan</Link></li>
              <li><Link to="/dashboard" className="hover:text-cyan-400 transition-colors">User Audit Dashboard</Link></li>
              <li><Link to="/compare" className="hover:text-cyan-400 transition-colors">Side-by-Side Matrix</Link></li>
              <li><Link to="/reports" className="hover:text-cyan-400 transition-colors">Published Reports</Link></li>
              <li><Link to="/methodology" className="hover:text-cyan-400 transition-colors">10-Dimension Audit Spec</Link></li>
            </ul>
          </div>

          {/* Col 3: Diagnostic Engines */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Engines</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/health" className="hover:text-cyan-400 transition-colors">Website Health</Link></li>
              <li><Link to="/ai-readiness" className="hover:text-cyan-400 transition-colors">AI & LLM Readiness</Link></li>
              <li><Link to="/repo-scanner" className="hover:text-cyan-400 transition-colors">Repo Hygiene (Git)</Link></li>
              <li><Link to="/latency" className="hover:text-cyan-400 transition-colors">Edge Latency Radar</Link></li>
              <li><Link to="/eco-audit" className="hover:text-cyan-400 transition-colors">Eco Carbon Audit</Link></li>
            </ul>
          </div>

          {/* Col 4: Trust & Compliance */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Legal & Trust</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/privacy" className="hover:text-cyan-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-cyan-400 transition-colors">Terms of Service</Link></li>
              <li><Link to="/cookies" className="hover:text-cyan-400 transition-colors">Cookie Policy</Link></li>
              <li><Link to="/security" className="hover:text-cyan-400 transition-colors">Security Disclosure</Link></li>
              <li><Link to="/contact" className="hover:text-cyan-400 transition-colors">Contact Support</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 flex flex-col items-center justify-between border-t border-slate-900 pt-6 sm:flex-row gap-4">
          <p className="text-xs text-slate-500">
            © 2026 CatalystLab. Enterprise Telemetry & Automated Web Quality Intelligence. All rights reserved.
          </p>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-400 transition-colors hover:border-slate-700 hover:text-white"
          >
            <ArrowUp className="h-3.5 w-3.5" />
            <span>Top</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
