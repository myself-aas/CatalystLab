import React, { useState } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Scale, 
  Cpu, 
  ShieldAlert, 
  Clock, 
  Award, 
  ExternalLink,
  ChevronRight,
  Zap
} from 'lucide-react';
import { LazyReveal, LazyStaggerContainer, LazyStaggerItem } from '../common/LazyAnimate';

export const TermsSection: React.FC = () => {
  const [activeTier, setActiveTier] = useState<'free' | 'pro' | 'enterprise'>('pro');

  const permitted = [
    "Scanning public web domains and endpoints you own or manage",
    "Benchmarking staging and QA environments prior to production launch",
    "Running synthetic latency probes across edge global nodes",
    "Exporting PDF audit dossiers for engineering stakeholders and clients",
    "Analyzing open-source GitHub repositories for security best practices"
  ];

  const prohibited = [
    "Executing volumetric Distributed Denial of Service (DDoS) simulations",
    "Scraping, harvesting, or targeting government/military non-public networks",
    "Automated brute-forcing of credentials through our proxy workers",
    "Attempting to decompile or extract proprietary diagnostic container binaries",
    "Circumventing API concurrency limits via rotating spoofed headers"
  ];

  const slaTiers = {
    free: {
      name: "Community Tier",
      availability: "99.5% Uptime",
      concurrency: "1 Active Diagnostic Stream",
      rateLimit: "30 Scans / hour",
      supportSla: "Best-effort Community Support",
      liabilityCap: "Zero ($0.00)"
    },
    pro: {
      name: "Pro Telemetry",
      availability: "99.9% Uptime",
      concurrency: "5 Parallel Diagnostic Streams",
      rateLimit: "500 Scans / hour",
      supportSla: "< 4 Hour Response Target",
      liabilityCap: "12 Months Fees Paid"
    },
    enterprise: {
      name: "Enterprise Dedicated",
      availability: "99.99% Financial SLA",
      concurrency: "Unlimited Dedicated Worker Pool",
      rateLimit: "Custom Rate Quotas",
      supportSla: "15-Minute Critical Hotline",
      liabilityCap: "Custom Contractual Indemnity"
    }
  };

  return (
    <div className="space-y-10">
      {/* Terms Header Card */}
      <LazyReveal direction="up">
        <div className="rounded-3xl border border-[#415a77]/30 bg-[#0b192c] p-6 sm:p-8 text-[#f8fafc] shadow-xl">
          <div className="flex items-center gap-2 text-xs font-mono text-sky-300 mb-1">
            <Scale className="h-4 w-4" />
            <span>OPERATING AGREEMENT • REV 2026.8</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#f8fafc] tracking-tight">
            Terms of Service & Acceptable Use
          </h2>
          <p className="mt-2 text-xs text-[#cbd5e1] max-w-3xl leading-relaxed">
            By accessing CatalystLab's automated audit suite, diagnostic consoles, and reporting APIs, you agree to comply with our ethical scanning guidelines and operational terms.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-[#415a77]/25 pt-4 text-xs font-mono text-[#94a3b8]">
            <span className="flex items-center gap-1">
              <Award className="h-3.5 w-3.5 text-sky-300" />
              <span>Report Ownership: 100% User Retained</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-emerald-400" />
              <span>Governing Jurisdiction: Delaware, USA</span>
            </span>
          </div>
        </div>
      </LazyReveal>

      {/* Permitted vs Prohibited Interactive Matrix */}
      <LazyReveal direction="up">
        <div className="rounded-3xl border border-[#e2e8f0] bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="h-5 w-5 text-[#415a77]" />
            <h3 className="text-lg font-bold text-[#0b192c]">Ethical Use & Scanning Authorization Matrix</h3>
          </div>
          <p className="text-xs text-[#415a77] mb-6">
            CatalystLab provides non-destructive synthetic probes. Scans must remain within authorized boundaries.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Permitted */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/40 p-5 space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-xs uppercase tracking-wider">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Permitted Scanning Activities</span>
              </div>
              <ul className="space-y-2.5">
                {permitted.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-emerald-950">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Prohibited */}
            <div className="rounded-2xl border border-rose-500/30 bg-rose-50/40 p-5 space-y-3">
              <div className="flex items-center gap-2 text-rose-800 font-extrabold text-xs uppercase tracking-wider">
                <XCircle className="h-4 w-4 text-rose-600" />
                <span>Strictly Prohibited Exploits</span>
              </div>
              <ul className="space-y-2.5">
                {prohibited.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-rose-950">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </LazyReveal>

      {/* Interactive Service Level Agreement (SLA) & Concurrency Viewer */}
      <LazyReveal direction="up">
        <div className="rounded-3xl border border-[#415a77]/30 bg-[#0b192c] p-6 sm:p-8 text-[#f8fafc] shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#415a77]/25 pb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-sky-300 mb-1">
                <Zap className="h-4 w-4" />
                <span>SLA & UPTIME COMMITMENT</span>
              </div>
              <h3 className="text-xl font-bold text-[#f8fafc]">Service Reliability & Performance Guarantees</h3>
            </div>

            {/* Tier Selector */}
            <div className="flex items-center rounded-2xl bg-[#152238] p-1 border border-[#415a77]/40">
              {(['free', 'pro', 'enterprise'] as const).map((tier) => (
                <button
                  key={tier}
                  onClick={() => setActiveTier(tier)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold capitalize transition-all ${
                    activeTier === tier
                      ? 'bg-sky-500 text-[#07111e] shadow-sm'
                      : 'text-[#94a3b8] hover:text-white'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="rounded-2xl border border-[#415a77]/25 bg-[#091524] p-4">
              <span className="text-[10px] uppercase font-bold text-[#94a3b8]">Availability SLA</span>
              <div className="text-lg font-extrabold text-sky-300 mt-1">
                {slaTiers[activeTier].availability}
              </div>
            </div>

            <div className="rounded-2xl border border-[#415a77]/25 bg-[#091524] p-4">
              <span className="text-[10px] uppercase font-bold text-[#94a3b8]">Diagnostic Concurrency</span>
              <div className="text-lg font-extrabold text-emerald-400 mt-1">
                {slaTiers[activeTier].concurrency}
              </div>
            </div>

            <div className="rounded-2xl border border-[#415a77]/25 bg-[#091524] p-4">
              <span className="text-[10px] uppercase font-bold text-[#94a3b8]">Rate Quota</span>
              <div className="text-lg font-extrabold text-amber-300 mt-1">
                {slaTiers[activeTier].rateLimit}
              </div>
            </div>

            <div className="rounded-2xl border border-[#415a77]/25 bg-[#091524] p-4">
              <span className="text-[10px] uppercase font-bold text-[#94a3b8]">Support Target</span>
              <div className="text-lg font-extrabold text-[#f8fafc] mt-1">
                {slaTiers[activeTier].supportSla}
              </div>
            </div>
          </div>
        </div>
      </LazyReveal>

      {/* Core Legal Terms Specifications */}
      <LazyReveal direction="up">
        <div className="rounded-3xl border border-[#e2e8f0] bg-white p-6 sm:p-8 shadow-sm space-y-6 text-xs text-[#415a77] leading-relaxed">
          <section className="space-y-2">
            <h4 className="text-sm font-bold text-[#0b192c]">1. Intellectual Property & Dossier Ownership</h4>
            <p>
              All synthetic audit dossiers, radar diagrams, and compliance evaluations generated by CatalystLab are the exclusive property of the requesting user. CatalystLab retains all rights, titles, and interests in the underlying diagnostic algorithms, container workers, and source codebase.
            </p>
          </section>

          <section className="space-y-2">
            <h4 className="text-sm font-bold text-[#0b192c]">2. Limitation of Liability</h4>
            <p>
              Diagnostic outputs reflect simulated synthetic requests. Under no circumstance shall CatalystLab or its developers be held liable for third-party hosting outages, DNS propagation anomalies, or misconfigured web firewalls.
            </p>
          </section>

          <section className="space-y-2">
            <h4 className="text-sm font-bold text-[#0b192c]">3. Term & Termination</h4>
            <p>
              Users may terminate their account at any time. CatalystLab reserves the right to suspend API credentials that violate acceptable use or attempt unauthorized probe flood attacks.
            </p>
          </section>
        </div>
      </LazyReveal>
    </div>
  );
};
