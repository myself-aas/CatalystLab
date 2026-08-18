import React from 'react';
import { Link } from 'react-router-dom';
<<<<<<< HEAD
import { Shield, CheckCircle, Zap, Code, Heart, Sparkles, ArrowRight } from 'lucide-react';

export const MethodologyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24 text-[#0b192c] selection:bg-[#c5d3e8] selection:text-[#0b192c]">
      <section className="border-b border-[#e2e8f0] bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#415a77]/30 bg-[#415a77]/10 px-3.5 py-1 text-xs font-semibold text-[#415a77] mb-4">
            <Shield className="h-3.5 w-3.5 text-[#415a77]" />
            <span>Audit Standard & Technical Specification</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#0b192c]">
            The 10-Dimension Audit Framework
          </h1>
          <p className="mt-4 text-sm sm:text-base text-[#415a77] max-w-2xl mx-auto">
=======
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
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
            CatalystLab evaluates digital properties against strict W3C standards, OWASP SecOps guidelines, Google Core Web Vitals, and emerging LLM indexing protocols.
          </p>
        </div>
      </section>

<<<<<<< HEAD
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
=======
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
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
            Directly queries Git APIs (GitHub, GitLab, Bitbucket) to audit open-source licenses, SECURITY.md policies, automated CI/CD pipelines, branch protection, and commit activity.
          </p>
        </div>

<<<<<<< HEAD
        <div className="rounded-3xl border border-[#415a77]/30 bg-[#0b192c] p-6 sm:p-8 shadow-2xl text-[#f8fafc]">
          <h2 className="text-xl font-bold text-[#f8fafc] flex items-center gap-2">
            <span className="text-[#c5d3e8] font-mono">05.</span>
            <span>Eco Carbon & Sustainable Computing</span>
          </h2>
          <p className="mt-3 text-sm text-[#c5d3e8] leading-relaxed">
=======
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>5. Eco Carbon & Sustainable Computing</span>
          </h2>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
            Applies the Sustainable Web Design model to estimate carbon emissions per pageview (grams CO2e), auditing payload weight, DOM efficiency, and green data center hosting.
          </p>
        </div>

<<<<<<< HEAD
        <div className="text-center pt-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl bg-[#0b192c] px-7 py-3.5 text-sm font-bold text-[#f8fafc] hover:bg-[#152238] shadow-xl transition-all"
          >
            <span>Run an Audit Against This Framework</span>
            <ArrowRight className="h-4 w-4 text-[#c5d3e8]" />
=======
        <div className="text-center pt-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-400 shadow-lg shadow-cyan-500/20"
          >
            Run an Audit Against This Framework →
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
          </Link>
        </div>

      </main>
    </div>
  );
};
<<<<<<< HEAD
export default MethodologyPage;

=======
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
