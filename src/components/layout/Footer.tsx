import React from 'react';
import { Link } from 'react-router-dom';
<<<<<<< HEAD
import { ArrowUp } from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
=======
import { Shield, Sparkles, Terminal, Activity, ArrowUp } from 'lucide-react';
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
<<<<<<< HEAD
    <footer className="border-t border-[#415a77]/30 bg-[#0b192c] text-[#c5d3e8]">
=======
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400">
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          
          {/* Col 1: Brand & Mission */}
          <div className="lg:col-span-2">
<<<<<<< HEAD
            <Link to="/" className="inline-block transition-opacity hover:opacity-90">
              <BrandLogo size="md" />
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#c5d3e8]">
              Multi-dimensional web health, architecture intelligence & telemetry diagnostics. Auditing Core Web Vitals, OWASP SecOps, WCAG Accessibility, Eco-Carbon, and AI Readiness.
            </p>
            <div className="mt-4 flex items-center gap-2 rounded-full border border-[#415a77]/40 bg-[#415a77]/20 px-3 py-1 text-xs text-[#c5d3e8] w-fit">
              <span className="h-1.5 w-1.5 rounded-full bg-[#c5d3e8] animate-pulse" />
=======
            <Link to="/" className="flex items-center gap-2 text-lg font-bold text-white">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500 text-xs font-bold text-slate-950">
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
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
              <span>Python Diagnostic Engines Active</span>
            </div>
          </div>

          {/* Col 2: Core Platform */}
          <div>
<<<<<<< HEAD
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#f8fafc]">Platform</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/" className="hover:text-[#f8fafc] transition-colors">Home</Link></li>
              <li><Link to="/pricing" className="hover:text-[#f8fafc] transition-colors">Pricing & Plans</Link></li>
              <li><Link to="/docs" className="hover:text-[#f8fafc] transition-colors">API & Specs (Docs)</Link></li>
              <li><Link to="/about" className="hover:text-[#f8fafc] transition-colors">About Us</Link></li>
              <li><Link to="/reports" className="hover:text-[#f8fafc] transition-colors">Audit Reports</Link></li>
=======
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Platform</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/" className="hover:text-cyan-400 transition-colors">Master 8-Engine Scan</Link></li>
              <li><Link to="/blogs" className="hover:text-cyan-400 transition-colors">Technical Insights Blog</Link></li>
              <li><Link to="/dashboard" className="hover:text-cyan-400 transition-colors">User Audit Dashboard</Link></li>
              <li><Link to="/compare" className="hover:text-cyan-400 transition-colors">Side-by-Side Matrix</Link></li>
              <li><Link to="/reports" className="hover:text-cyan-400 transition-colors">Published Reports</Link></li>
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
            </ul>
          </div>

          {/* Col 3: Diagnostic Engines */}
          <div>
<<<<<<< HEAD
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#f8fafc]">Engines</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/health" className="hover:text-[#f8fafc] transition-colors">Website Health</Link></li>
              <li><Link to="/ai-readiness" className="hover:text-[#f8fafc] transition-colors">AI & LLM Readiness</Link></li>
              <li><Link to="/repo-scanner" className="hover:text-[#f8fafc] transition-colors">Repo Hygiene (Git)</Link></li>
              <li><Link to="/latency" className="hover:text-[#f8fafc] transition-colors">Edge Latency Radar</Link></li>
              <li><Link to="/eco-audit" className="hover:text-[#f8fafc] transition-colors">Eco Carbon Audit</Link></li>
=======
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Engines</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/health" className="hover:text-cyan-400 transition-colors">Website Health</Link></li>
              <li><Link to="/ai-readiness" className="hover:text-cyan-400 transition-colors">AI & LLM Readiness</Link></li>
              <li><Link to="/repo-scanner" className="hover:text-cyan-400 transition-colors">Repo Hygiene (Git)</Link></li>
              <li><Link to="/latency" className="hover:text-cyan-400 transition-colors">Edge Latency Radar</Link></li>
              <li><Link to="/eco-audit" className="hover:text-cyan-400 transition-colors">Eco Carbon Audit</Link></li>
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
            </ul>
          </div>

          {/* Col 4: Trust & Compliance */}
          <div>
<<<<<<< HEAD
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#f8fafc]">Legal & Trust</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/privacy" className="hover:text-[#f8fafc] transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-[#f8fafc] transition-colors">Terms of Service</Link></li>
              <li><Link to="/cookies" className="hover:text-[#f8fafc] transition-colors">Cookie Policy</Link></li>
              <li><Link to="/security" className="hover:text-[#f8fafc] transition-colors">Security Disclosure</Link></li>
              <li><Link to="/contact" className="hover:text-[#f8fafc] transition-colors">Contact Support</Link></li>
=======
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Legal & Trust</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/privacy" className="hover:text-cyan-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-cyan-400 transition-colors">Terms of Service</Link></li>
              <li><Link to="/cookies" className="hover:text-cyan-400 transition-colors">Cookie Policy</Link></li>
              <li><Link to="/security" className="hover:text-cyan-400 transition-colors">Security Disclosure</Link></li>
              <li><Link to="/contact" className="hover:text-cyan-400 transition-colors">Contact Support</Link></li>
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
<<<<<<< HEAD
        <div className="mt-10 flex flex-col items-center justify-between border-t border-[#415a77]/30 pt-6 sm:flex-row gap-4">
          <p className="text-xs text-[#c5d3e8]">
=======
        <div className="mt-10 flex flex-col items-center justify-between border-t border-slate-900 pt-6 sm:flex-row gap-4">
          <p className="text-xs text-slate-500">
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
            © 2026 CatalystLab. Enterprise Telemetry & Automated Web Quality Intelligence. All rights reserved.
          </p>
          <button
            onClick={scrollToTop}
<<<<<<< HEAD
            className="flex items-center gap-1.5 rounded-lg border border-[#415a77]/30 bg-[#0d1b2a] px-3 py-1.5 text-xs text-[#c5d3e8] transition-colors hover:border-[#415a77] hover:text-[#f8fafc]"
=======
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-400 transition-colors hover:border-slate-700 hover:text-white"
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
          >
            <ArrowUp className="h-3.5 w-3.5" />
            <span>Top</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
