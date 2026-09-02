import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Scale, 
  ShieldAlert, 
  Clock, 
  Award, 
  Zap
} from 'lucide-react';
import { LazyReveal } from '../common/LazyAnimate';

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
    <div className="space-y-8 font-mono">
      {/* Terms Header Card */}
      <LazyReveal direction="up">
        <div className="rounded-2xl border border-border bg-background p-6 sm:p-8 text-foreground shadow-sm">
          <div className="flex items-center gap-2 text-xs text-amber-600 mb-1">
            <Scale className="h-4 w-4" />
            <span>OPERATING AGREEMENT • REV 2026.8</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight font-sans">
            Terms of Service &amp; Acceptable Use
          </h2>
          <p className="mt-2 text-xs text-muted-foreground max-w-3xl leading-relaxed font-sans">
            By accessing CatalystLab&apos;s automated audit suite, diagnostic consoles, and reporting APIs, you agree to comply with our ethical scanning guidelines and operational terms.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Award className="h-3.5 w-3.5 text-amber-600" />
              <span>Report Ownership: 100% User Retained</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-emerald-600" />
              <span>Governing Jurisdiction: Delaware, USA</span>
            </span>
          </div>
        </div>
      </LazyReveal>

      {/* Permitted vs Prohibited Interactive Matrix */}
      <LazyReveal direction="up">
        <div className="rounded-2xl border border-border bg-background p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-1.5">
            <ShieldAlert className="h-4 w-4 text-amber-600" />
            <h3 className="text-base font-bold text-foreground font-sans">Ethical Use &amp; Scanning Authorization Matrix</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-5 font-sans">
            CatalystLab provides non-destructive synthetic probes. Scans must remain within authorized boundaries.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Permitted */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-2.5">
              <div className="flex items-center gap-1.5 text-emerald-700 font-extrabold text-xs uppercase tracking-wider">
                <CheckCircle2 className="h-4 w-4" />
                <span>Permitted Scanning Activities</span>
              </div>
              <ul className="space-y-2">
                {permitted.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-foreground font-sans">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Prohibited */}
            <div className="rounded-xl border border-red-200 bg-red-50/50 p-4 space-y-2.5">
              <div className="flex items-center gap-1.5 text-red-700 font-extrabold text-xs uppercase tracking-wider">
                <XCircle className="h-4 w-4 text-red-600" />
                <span>Strictly Prohibited Exploits</span>
              </div>
              <ul className="space-y-2">
                {prohibited.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-foreground font-sans">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
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
        <div className="rounded-2xl border border-border bg-background p-6 sm:p-8 text-foreground shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
            <div>
              <div className="flex items-center gap-2 text-xs text-amber-600 mb-1">
                <Zap className="h-3.5 w-3.5" />
                <span>SLA &amp; UPTIME COMMITMENT</span>
              </div>
              <h3 className="text-base font-bold text-foreground font-sans">Service Reliability &amp; Performance Guarantees</h3>
            </div>

            {/* Tier Selector */}
            <div className="flex items-center rounded-xl bg-accent p-1 border border-border">
              {(['free', 'pro', 'enterprise'] as const).map((tier) => (
                <button
                  key={tier}
                  onClick={() => setActiveTier(tier)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold capitalize transition-all cursor-pointer ${
                    activeTier === tier
                      ? 'bg-background text-foreground border border-border shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
            <div className="rounded-xl border border-border bg-muted p-3.5">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Availability SLA</span>
              <div className="text-base font-extrabold text-amber-600 mt-0.5">
                {slaTiers[activeTier].availability}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-muted p-3.5">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Diagnostic Concurrency</span>
              <div className="text-base font-extrabold text-emerald-600 mt-0.5">
                {slaTiers[activeTier].concurrency}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-muted p-3.5">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Rate Quota</span>
              <div className="text-base font-extrabold text-amber-600 mt-0.5">
                {slaTiers[activeTier].rateLimit}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-muted p-3.5">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Support Target</span>
              <div className="text-base font-extrabold text-foreground mt-0.5">
                {slaTiers[activeTier].supportSla}
              </div>
            </div>
          </div>
        </div>
      </LazyReveal>

      {/* Core Legal Terms Specifications */}
      <LazyReveal direction="up">
        <div className="rounded-2xl border border-border bg-background p-6 sm:p-8 shadow-sm space-y-4 text-xs text-muted-foreground leading-relaxed">
          <section className="space-y-1.5">
            <h4 className="text-sm font-bold text-foreground font-sans">1. Intellectual Property &amp; Dossier Ownership</h4>
            <p className="font-sans">
              All synthetic audit dossiers, radar diagrams, and compliance evaluations generated by CatalystLab are the exclusive property of the requesting user. CatalystLab retains all rights, titles, and interests in the underlying diagnostic algorithms, container workers, and source codebase.
            </p>
          </section>

          <section className="space-y-1.5">
            <h4 className="text-sm font-bold text-foreground font-sans">2. Limitation of Liability</h4>
            <p className="font-sans">
              Diagnostic outputs reflect simulated synthetic requests. Under no circumstance shall CatalystLab or its developers be held liable for third-party hosting outages, DNS propagation anomalies, or misconfigured web firewalls.
            </p>
          </section>

          <section className="space-y-1.5">
            <h4 className="text-sm font-bold text-foreground font-sans">3. Term &amp; Termination</h4>
            <p className="font-sans">
              Users may terminate their account at any time. CatalystLab reserves the right to suspend API credentials that violate acceptable use or attempt unauthorized probe flood attacks.
            </p>
          </section>
        </div>
      </LazyReveal>
    </div>
  );
};
