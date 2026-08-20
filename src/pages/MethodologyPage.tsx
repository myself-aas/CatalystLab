import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, CheckCircle, Zap, Code, Heart, Sparkles, ArrowRight } from 'lucide-react';
import { SEOHead } from '../components/common/SEOHead';
import { Breadcrumbs } from '../components/common/Breadcrumbs';

export const MethodologyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24 text-[#0b192c] selection:bg-[#c5d3e8] selection:text-[#0b192c]">
      <SEOHead
        title="Diagnostic Methodology & Evaluation Standards"
        description="Explore the scientific principles, telemetry tolerances, and 10-dimension evaluation framework powering CatalystLab's automated web quality engines."
        keywords={['CatalystLab methodology', 'audit standards', 'telemetry tolerances', 'Core Web Vitals measurement', 'OWASP evaluation framework']}
        canonicalUrl="https://www.catalystlab.tech/about"
      />

      <section className="border-b border-[#e2e8f0] bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6">
            <Breadcrumbs
              items={[
                { label: 'About Us' },
                { label: 'Audit Methodology' }
              ]}
            />
          </div>

          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#415a77]/30 bg-[#415a77]/10 px-3.5 py-1 text-xs font-semibold text-[#415a77] mb-4">
              <Shield className="h-3.5 w-3.5 text-[#415a77]" />
              <span>Audit Standard & Technical Specification</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#0b192c]">
              The 10-Dimension Audit Framework
            </h1>
            <p className="mt-4 text-sm sm:text-base text-[#415a77] max-w-2xl mx-auto">
              CatalystLab evaluates digital properties against strict W3C standards, OWASP SecOps guidelines, Google Core Web Vitals, and emerging LLM indexing protocols.
            </p>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-6">
        
        <div className="rounded-3xl border border-[#415a77]/30 bg-[#0b192c] p-6 sm:p-8 shadow-2xl text-[#f8fafc]">
          <h2 className="text-xl font-bold text-[#f8fafc] flex items-center gap-2">
            <span className="text-[#c5d3e8] font-mono">01.</span>
            <span>DOM Complexity & Core Web Vitals</span>
          </h2>
          <p className="mt-3 text-sm text-[#c5d3e8] leading-relaxed">
            Evaluates DOM tree node counts, maximum DOM depth (targeting ≤32 levels), resource hints (<code className="text-[#c5d3e8] font-mono bg-[#152238] px-1.5 py-0.5 rounded border border-[#415a77]/40">preconnect</code>, <code className="text-[#c5d3e8] font-mono bg-[#152238] px-1.5 py-0.5 rounded border border-[#415a77]/40">dns-prefetch</code>), and script deferral patterns to maximize Largest Contentful Paint (LCP) and minimize Cumulative Layout Shift (CLS).
          </p>
        </div>

        <div className="rounded-3xl border border-[#415a77]/30 bg-[#0b192c] p-6 sm:p-8 shadow-2xl text-[#f8fafc]">
          <h2 className="text-xl font-bold text-[#f8fafc] flex items-center gap-2">
            <span className="text-[#c5d3e8] font-mono">02.</span>
            <span>OWASP SecOps Security Posture</span>
          </h2>
          <p className="mt-3 text-sm text-[#c5d3e8] leading-relaxed">
            Verifies essential cryptographic defense headers: <code className="text-[#c5d3e8] font-mono bg-[#152238] px-1.5 py-0.5 rounded border border-[#415a77]/40">Strict-Transport-Security (HSTS)</code>, <code className="text-[#c5d3e8] font-mono bg-[#152238] px-1.5 py-0.5 rounded border border-[#415a77]/40">Content-Security-Policy (CSP)</code>, <code className="text-[#c5d3e8] font-mono bg-[#152238] px-1.5 py-0.5 rounded border border-[#415a77]/40">X-Content-Type-Options: nosniff</code>, and <code className="text-[#c5d3e8] font-mono bg-[#152238] px-1.5 py-0.5 rounded border border-[#415a77]/40">X-Frame-Options</code> to block clickjacking and cross-site scripting (XSS).
          </p>
        </div>

        <div className="rounded-3xl border border-[#415a77]/30 bg-[#0b192c] p-6 sm:p-8 shadow-2xl text-[#f8fafc]">
          <h2 className="text-xl font-bold text-[#f8fafc] flex items-center gap-2">
            <span className="text-[#c5d3e8] font-mono">03.</span>
            <span>AI Readiness & LLM Crawlability</span>
          </h2>
          <p className="mt-3 text-sm text-[#c5d3e8] leading-relaxed">
            Inspects the presence and formatting of <code className="text-[#c5d3e8] font-mono bg-[#152238] px-1.5 py-0.5 rounded border border-[#415a77]/40">/llms.txt</code> and <code className="text-[#c5d3e8] font-mono bg-[#152238] px-1.5 py-0.5 rounded border border-[#415a77]/40">/llms-full.txt</code>, checks <code className="text-[#c5d3e8] font-mono bg-[#152238] px-1.5 py-0.5 rounded border border-[#415a77]/40">robots.txt</code> permissions for GPTBot, ClaudeBot, and PerplexityBot, and audits structured JSON-LD schemas.
          </p>
        </div>

        <div className="rounded-3xl border border-[#415a77]/30 bg-[#0b192c] p-6 sm:p-8 shadow-2xl text-[#f8fafc]">
          <h2 className="text-xl font-bold text-[#f8fafc] flex items-center gap-2">
            <span className="text-[#c5d3e8] font-mono">04.</span>
            <span>Repository Hygiene & Developer SecOps</span>
          </h2>
          <p className="mt-3 text-sm text-[#c5d3e8] leading-relaxed">
            Evaluates GitHub/GitLab repository architecture, open-source license declarations, SECURITY.md triage policies, and commit velocity.
          </p>
        </div>

        <div className="rounded-3xl border border-[#415a77]/30 bg-[#0b192c] p-6 sm:p-8 shadow-2xl text-[#f8fafc]">
          <h2 className="text-xl font-bold text-[#f8fafc] flex items-center gap-2">
            <span className="text-[#c5d3e8] font-mono">05.</span>
            <span>Global Edge Latency & Multi-PoP TTFB</span>
          </h2>
          <p className="mt-3 text-sm text-[#c5d3e8] leading-relaxed">
            Dispatches synthetic HTTP probes from 12 global edge locations to evaluate DNS lookup duration, TLS 1.3 handshake negotiation, and origin Time-To-First-Byte.
          </p>
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/docs"
            className="inline-flex items-center gap-2 rounded-2xl bg-[#0b192c] px-6 py-3.5 text-xs font-bold text-[#f8fafc] hover:bg-[#152238] transition-all shadow-md active:scale-98"
          >
            <span>Read Complete Developer Documentation</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

      </main>
    </div>
  );
};
export default MethodologyPage;
