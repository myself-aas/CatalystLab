import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-[#415a77]/30 bg-[#0b192c] text-[#c5d3e8]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          
          {/* Col 1: Brand & Mission */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block transition-opacity hover:opacity-90">
              <BrandLogo size="md" />
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#c5d3e8]">
              Multi-dimensional web health, architecture intelligence & telemetry diagnostics. Auditing Core Web Vitals, OWASP SecOps, WCAG Accessibility, Eco-Carbon, and AI Readiness.
            </p>
            <div className="mt-4 flex items-center gap-2 rounded-full border border-[#415a77]/40 bg-[#415a77]/20 px-3 py-1 text-xs text-[#c5d3e8] w-fit">
              <span className="h-1.5 w-1.5 rounded-full bg-[#c5d3e8] animate-pulse" />
              <span>Python Diagnostic Engines Active</span>
            </div>
          </div>

          {/* Col 2: Core Platform */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#f8fafc]">Platform</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/" className="hover:text-[#f8fafc] transition-colors">Home</Link></li>
              <li><Link to="/pricing" className="hover:text-[#f8fafc] transition-colors">Pricing & Plans</Link></li>
              <li><Link to="/docs" className="hover:text-[#f8fafc] transition-colors">API & Specs (Docs)</Link></li>
              <li><Link to="/about" className="hover:text-[#f8fafc] transition-colors">About Us</Link></li>
              <li><Link to="/reports" className="hover:text-[#f8fafc] transition-colors">Audit Reports</Link></li>
            </ul>
          </div>

          {/* Col 3: Diagnostic Engines */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#f8fafc]">Engines</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/health" className="hover:text-[#f8fafc] transition-colors">Website Health</Link></li>
              <li><Link to="/ai-readiness" className="hover:text-[#f8fafc] transition-colors">AI & LLM Readiness</Link></li>
              <li><Link to="/repo-scanner" className="hover:text-[#f8fafc] transition-colors">Repo Hygiene (Git)</Link></li>
              <li><Link to="/latency" className="hover:text-[#f8fafc] transition-colors">Edge Latency Radar</Link></li>
              <li><Link to="/eco-audit" className="hover:text-[#f8fafc] transition-colors">Eco Carbon Audit</Link></li>
            </ul>
          </div>

          {/* Col 4: Trust & Compliance */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#f8fafc]">Legal & Trust</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/privacy" className="hover:text-[#f8fafc] transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-[#f8fafc] transition-colors">Terms of Service</Link></li>
              <li><Link to="/cookies" className="hover:text-[#f8fafc] transition-colors">Cookie Policy</Link></li>
              <li><Link to="/security" className="hover:text-[#f8fafc] transition-colors">Security Disclosure</Link></li>
              <li><Link to="/contact" className="hover:text-[#f8fafc] transition-colors">Contact Support</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 flex flex-col items-center justify-between border-t border-[#415a77]/30 pt-6 sm:flex-row gap-4">
          <p className="text-xs text-[#c5d3e8]">
            © 2026 CatalystLab. Enterprise Telemetry & Automated Web Quality Intelligence. All rights reserved.
          </p>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 rounded-lg border border-[#415a77]/30 bg-[#0d1b2a] px-3 py-1.5 text-xs text-[#c5d3e8] transition-colors hover:border-[#415a77] hover:text-[#f8fafc]"
          >
            <ArrowUp className="h-3.5 w-3.5" />
            <span>Top</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
