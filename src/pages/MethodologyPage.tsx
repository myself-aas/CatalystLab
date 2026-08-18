import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, CheckCircle, Zap, Code, Heart, Sparkles } from 'lucide-react';

export const MethodologyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      <section className="border-b border-slate-800 bg-slate-900/40 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-400 mb-4">
            <Shield className="h-3.5 w-3.5" />
            <span>Audit Standard & Technical Specification</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white">
            The 10-Dimension Audit Framework
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            CatalystLab evaluates digital properties against strict W3C standards, OWASP SecOps guidelines, Google Core Web Vitals, and emerging LLM indexing protocols.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
        
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>1. DOM Complexity & Core Web Vitals</span>
          </h2>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Evaluates DOM tree node counts, maximum DOM depth (targeting ≤32 levels), resource hints (<code className="text-cyan-400 font-mono">preconnect</code>, <code className="text-cyan-400 font-mono">dns-prefetch</code>), and script deferral patterns to maximize Largest Contentful Paint (LCP) and minimize Cumulative Layout Shift (CLS).
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>2. OWASP SecOps Security Posture</span>
          </h2>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Verifies essential cryptographic defense headers: <code className="text-cyan-400 font-mono">Strict-Transport-Security (HSTS)</code>, <code className="text-cyan-400 font-mono">Content-Security-Policy (CSP)</code>, <code className="text-cyan-400 font-mono">X-Content-Type-Options: nosniff</code>, and <code className="text-cyan-400 font-mono">X-Frame-Options</code> to block clickjacking and cross-site scripting (XSS).
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>3. AI Readiness & LLM Crawlability</span>
          </h2>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Inspects the presence and formatting of <code className="text-cyan-400 font-mono">/llms.txt</code> and <code className="text-cyan-400 font-mono">/llms-full.txt</code>, checks <code className="text-cyan-400 font-mono">robots.txt</code> permissions for GPTBot, ClaudeBot, and PerplexityBot, and audits structured JSON-LD schemas.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>4. Repository Hygiene & Developer SecOps</span>
          </h2>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Directly queries Git APIs (GitHub, GitLab, Bitbucket) to audit open-source licenses, SECURITY.md policies, automated CI/CD pipelines, branch protection, and commit activity.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>5. Eco Carbon & Sustainable Computing</span>
          </h2>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Applies the Sustainable Web Design model to estimate carbon emissions per pageview (grams CO2e), auditing payload weight, DOM efficiency, and green data center hosting.
          </p>
        </div>

        <div className="text-center pt-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-400 shadow-lg shadow-cyan-500/20"
          >
            Run an Audit Against This Framework →
          </Link>
        </div>

      </main>
    </div>
  );
};
