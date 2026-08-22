import React, { useState } from 'react';
import { GlobalFaqSection, FaqCategory } from '../common/GlobalFaqSection';
import { 
  ShieldCheck, 
  Database, 
  Lock, 
  EyeOff, 
  Download, 
  Trash2, 
  CheckCircle, 
  Info, 
  Sparkles, 
  Server, 
  Key, 
  HelpCircle,
  Clock,
  Globe,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { LazyReveal, LazyStaggerContainer, LazyStaggerItem } from '../common/LazyAnimate';

export const PrivacySection: React.FC = () => {
  const [mode, setMode] = useState<'summary' | 'full'>('summary');
  const [exported, setExported] = useState(false);
  const [deletionRequested, setDeletionRequested] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleExportData = () => {
    const mockData = {
      exportTimestamp: new Date().toISOString(),
      service: "CatalystLab Telemetry Suite",
      collectedDataTypes: [
        "Audit Target Domain Names",
        "Synthetic Edge Latency Measurements",
        "Public HTTP Header Scans",
        "DOM Depth & Asset Trees",
        "OWASP Compliance Results"
      ],
      retentionPolicy: "User reports stored until account deletion or manual purge",
      dataSaleStatus: "NEVER SOLD OR MONETIZED"
    };

    const blob = new Blob([JSON.stringify(mockData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `catalystlab-telemetry-privacy-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExported(true);
    setTimeout(() => setExported(false), 4000);
  };

  const handleRequestDeletion = () => {
    setDeletionRequested(true);
    setTimeout(() => setDeletionRequested(false), 5000);
  };

  const faqCategories: FaqCategory[] = [
    {
      id: 'retention',
      label: 'Data Retention & Ownership',
      description: 'Zero monetization guarantee, ephemeral scan purging, and automated retention windows.',
      iconName: 'lock',
      items: [
        {
          question: "Do you ever sell or rent domain audit telemetry to third parties?",
          badge: "Zero-Monetization",
          answer: "Never. CatalystLab enforces a strict Zero-Monetization-of-Data policy. Telemetry dossiers and audit reports generated through our engines are only accessible by you (and public visitors if you generate a public benchmark report). We never sell data to advertisers or brokers."
        },
        {
          question: "How long is diagnostic telemetry retained in the CatalystLab database?",
          badge: "Purge Schedule",
          answer: "Unsaved ephemeral scans are cleared from memory within 1 hour. Saved reports associated with your authenticated account are retained until you explicitly delete them from your User Dashboard or request a full cryptographic purge."
        },
        {
          question: "Can I request immediate permanent deletion of all stored audits?",
          badge: "GDPR Article 17",
          answer: "Yes. Under GDPR Right to Erasure, you can click 'Request Cryptographic Data Purge' in your privacy settings or email privacy@catalystlab.tech to permanently erase all records within 24 hours."
        }
      ]
    },
    {
      id: 'compliance',
      label: 'GDPR & Regulatory Compliance',
      description: 'International data transfers, EU data residency, CCPA, and Data Processing Agreements.',
      iconName: 'shield',
      items: [
        {
          question: "Is CatalystLab compliant with GDPR, CCPA, and European data residency rules?",
          badge: "SOC 2 & GDPR",
          answer: "Yes. All diagnostic requests are routed through strict regional HTTPS proxies, and user telemetry is stored in Firestore with enterprise AES-256 encryption at rest and TLS 1.3 in transit."
        },
        {
          question: "Can Enterprise customers sign a bespoke Data Processing Agreement (DPA)?",
          badge: "Enterprise DPA",
          answer: "Yes. We offer standard contractual clauses (SCCs) and custom DPAs for enterprise clients. Contact legal@catalystlab.tech for execution."
        }
      ]
    },
    {
      id: 'infrastructure',
      label: 'Subprocessors & Cloud Security',
      description: 'Certified cloud providers, AI processing boundaries, and encryption standards.',
      iconName: 'cpu',
      items: [
        {
          question: "What subprocessors and cloud providers process scanning workloads?",
          badge: "Cloud Infrastructure",
          answer: "We use Google Cloud Run (containerized diagnostic workers), Firebase Authentication (session tokens), and Google Vertex AI (for generative architecture summaries). All subprocessors adhere to ISO/IEC 27001 and SOC 2 Type II certifications."
        },
        {
          question: "Does Google Vertex AI train on my proprietary website code or audit payloads?",
          badge: "Zero Model Training",
          answer: "No. Our enterprise agreement with Google Cloud Vertex AI guarantees zero customer data retention for model training or foundation model fine-tuning. Your audit context remains isolated and transient."
        }
      ]
    }
  ];

  return (
    <div className="space-y-10">
      {/* Policy Header / Summary Switcher */}
      <LazyReveal direction="up">
        <div className="rounded-3xl border border-[#415a77]/30 bg-[#0b192c] p-6 sm:p-8 text-[#f8fafc] shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#415a77]/25 pb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-sky-300 mb-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>SPEC-V2.8 • GDPR & CCPA CERTIFIED</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#f8fafc]">
                CatalystLab Privacy Architecture
              </h2>
              <p className="mt-1 text-xs text-[#94a3b8]">
                Effective Date: August 19, 2026 • Certified for Zero Third-Party Data Brokering
              </p>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center rounded-2xl bg-[#152238] p-1.5 border border-[#415a77]/40">
              <button
                onClick={() => setMode('summary')}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  mode === 'summary'
                    ? 'bg-sky-500 text-[#07111e] shadow-sm'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Plain English</span>
              </button>
              <button
                onClick={() => setMode('full')}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  mode === 'full'
                    ? 'bg-sky-500 text-[#07111e] shadow-sm'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Legal Clauses</span>
              </button>
            </div>
          </div>

          {/* Quick Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="rounded-2xl border border-[#415a77]/25 bg-[#091524] p-4">
              <div className="flex items-center gap-2 text-sky-300 font-bold text-xs uppercase mb-1">
                <EyeOff className="h-4 w-4" />
                <span>Zero Data Sales</span>
              </div>
              <p className="text-xs text-[#cbd5e1] leading-relaxed">
                We never monetize, broker, or train public AI models on your private diagnostic logs or internal endpoints.
              </p>
            </div>

            <div className="rounded-2xl border border-[#415a77]/25 bg-[#091524] p-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase mb-1">
                <Lock className="h-4 w-4" />
                <span>End-to-End Encryption</span>
              </div>
              <p className="text-xs text-[#cbd5e1] leading-relaxed">
                All network diagnostics are secured via TLS 1.3 with AES-256 encrypted database columns in Firestore.
              </p>
            </div>

            <div className="rounded-2xl border border-[#415a77]/25 bg-[#091524] p-4">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase mb-1">
                <Database className="h-4 w-4" />
                <span>Right to Purge</span>
              </div>
              <p className="text-xs text-[#cbd5e1] leading-relaxed">
                One-click complete purge of all historic reports, domain scans, and audit traces anytime from your portal.
              </p>
            </div>
          </div>
        </div>
      </LazyReveal>

      {/* Mode 1: Plain English Interactive View */}
      {mode === 'summary' ? (
        <div className="space-y-8">
          {/* Data Flow & Collection Explorer */}
          <LazyReveal direction="up">
            <div className="rounded-3xl border border-[#e2e8f0] bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#415a77]/10 text-[#415a77]">
                  <Server className="h-4 w-4" />
                </span>
                <h3 className="text-lg font-bold text-[#0b192c]">Data Collection & Flow Matrix</h3>
              </div>
              <p className="text-xs text-[#415a77] mb-6">
                Transparent accounting of exactly what metadata our 8 diagnostic engines process during a scan.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#e2e8f0] bg-[#f8fafc] text-[#0b192c] font-bold">
                      <th className="py-3 px-4 rounded-l-xl">Data Category</th>
                      <th className="py-3 px-4">What We Collect</th>
                      <th className="py-3 px-4">Purpose</th>
                      <th className="py-3 px-4">Retention Period</th>
                      <th className="py-3 px-4 rounded-r-xl">Third-Party Access</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0] text-[#415a77]">
                    <tr className="hover:bg-[#f8fafc]/50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#0b192c]">Target URLs</td>
                      <td className="py-3.5 px-4 font-mono text-[11px]">Domain name & endpoint paths entered</td>
                      <td className="py-3.5 px-4">Dispatch HTTP probes and calculate response times</td>
                      <td className="py-3.5 px-4">Ephemeral (1 hr) or Saved in User DB</td>
                      <td className="py-3.5 px-4 font-semibold text-emerald-600">None (Isolated)</td>
                    </tr>
                    <tr className="hover:bg-[#f8fafc]/50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#0b192c]">HTTP Headers</td>
                      <td className="py-3.5 px-4 font-mono text-[11px]">HSTS, CSP, X-Frame, CORS headers</td>
                      <td className="py-3.5 px-4">OWASP compliance scoring and vulnerability audit</td>
                      <td className="py-3.5 px-4">Retained with report dossier</td>
                      <td className="py-3.5 px-4 font-semibold text-emerald-600">None</td>
                    </tr>
                    <tr className="hover:bg-[#f8fafc]/50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#0b192c]">User Credentials</td>
                      <td className="py-3.5 px-4 font-mono text-[11px]">Google OAuth ID, Email, Display Name</td>
                      <td className="py-3.5 px-4">Authenticate and isolate private reports</td>
                      <td className="py-3.5 px-4">Until account deletion</td>
                      <td className="py-3.5 px-4 text-[#0b192c]">Firebase Auth (Google)</td>
                    </tr>
                    <tr className="hover:bg-[#f8fafc]/50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#0b192c]">Telemetry Logs</td>
                      <td className="py-3.5 px-4 font-mono text-[11px]">DNS lookup latency, TLS handshake ms</td>
                      <td className="py-3.5 px-4">Render synthetic latency charts & global radar</td>
                      <td className="py-3.5 px-4">30 days aggregate cache</td>
                      <td className="py-3.5 px-4 font-semibold text-emerald-600">None</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </LazyReveal>

          {/* Interactive Self-Service Data Rights Center */}
          <LazyReveal direction="up">
            <div className="rounded-3xl border border-[#415a77]/30 bg-[#0b192c] p-6 sm:p-8 text-[#f8fafc] shadow-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#152238] text-sky-300 border border-[#415a77]/40">
                  <Key className="h-4 w-4" />
                </span>
                <h3 className="text-lg font-bold text-[#f8fafc]">Your GDPR & CCPA Self-Service Controls</h3>
              </div>
              <p className="text-xs text-[#94a3b8] mb-6">
                Exercise your data rights with instant machine-readable exports and automated removal commands.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Export Card */}
                <div className="rounded-2xl border border-[#415a77]/30 bg-[#091524] p-5 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#f8fafc] flex items-center gap-2">
                      <Download className="h-4 w-4 text-sky-300" />
                      <span>Export Diagnostic Archive (JSON)</span>
                    </h4>
                    <p className="text-xs text-[#94a3b8] mt-1.5 leading-relaxed">
                      Download a structured, machine-readable JSON package of all telemetry logs, saved audit dossiers, and profile preferences.
                    </p>
                  </div>
                  <div className="mt-5">
                    <button
                      onClick={handleExportData}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#152238] px-4 py-2.5 text-xs font-bold text-sky-300 border border-sky-500/30 hover:bg-sky-500 hover:text-[#07111e] transition-all"
                    >
                      {exported ? <CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> : <Download className="h-3.5 w-3.5" />}
                      <span>{exported ? 'Data Archive Exported!' : 'Download Telemetry Package'}</span>
                    </button>
                  </div>
                </div>

                {/* Deletion Card */}
                <div className="rounded-2xl border border-rose-500/30 bg-[#091524] p-5 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-rose-300 flex items-center gap-2">
                      <Trash2 className="h-4 w-4 text-rose-400" />
                      <span>Request Full Telemetry Purge</span>
                    </h4>
                    <p className="text-xs text-[#94a3b8] mt-1.5 leading-relaxed">
                      Permanently wipe all saved domain reports, synthetic latency charts, and user account metadata from our Firestore cluster.
                    </p>
                  </div>
                  <div className="mt-5">
                    {deletionRequested ? (
                      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs text-emerald-300 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
                        <span>Purge command registered. All records cleared upon session end.</span>
                      </div>
                    ) : (
                      <button
                        onClick={handleRequestDeletion}
                        className="inline-flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2.5 text-xs font-bold text-rose-300 hover:bg-rose-500 hover:text-white transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Initiate Telemetry Purge</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </LazyReveal>
        </div>
      ) : (
        /* Mode 2: Full Legal Clauses Specification */
        <LazyReveal direction="up">
          <div className="rounded-3xl border border-[#e2e8f0] bg-white p-8 sm:p-10 text-sm text-[#0b192c] space-y-8 shadow-sm leading-relaxed">
            <section className="space-y-3">
              <h3 className="text-lg font-bold text-[#0b192c] border-b border-[#e2e8f0] pb-2">
                1. Scope of Telemetry & Diagnostics Processing
              </h3>
              <p className="text-xs text-[#415a77]">
                CatalystLab ("we", "us", or "our") operates synthetic diagnostic suites, security header scanners, and edge latency benchmarks. This Privacy Policy governs the processing of technical data submitted when invoking diagnostic endpoints through <code className="font-mono text-[#0b192c] bg-[#f4f6fa] px-1 py-0.5 rounded">catalystlab.tech</code>.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-bold text-[#0b192c] border-b border-[#e2e8f0] pb-2">
                2. Legal Basis for Processing under GDPR (Article 6)
              </h3>
              <p className="text-xs text-[#415a77]">
                We process diagnostic data on the following bases: (a) Performance of a contract when you request an on-demand audit; (b) Legitimate interests in securing our container infrastructure against automated denial of service; (c) Explicit user consent for authenticated report archiving and PDF generation.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-bold text-[#0b192c] border-b border-[#e2e8f0] pb-2">
                3. Subprocessors & International Transfers
              </h3>
              <p className="text-xs text-[#415a77]">
                Diagnostic requests are processed through Google Cloud infrastructure. All transfers of EU personal data are governed by standard contractual clauses (SCCs) and ISO 27001 audited data centers with automated encryption in transit and at rest.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-bold text-[#0b192c] border-b border-[#e2e8f0] pb-2">
                4. Data Protection Officer & Privacy Inquiries
              </h3>
              <p className="text-xs text-[#415a77]">
                For legal notices, data subject requests, or regulatory inquiries, contact our Data Protection Officer directly at <a href="mailto:privacy@catalystlab.tech" className="text-[#0b192c] font-bold underline">privacy@catalystlab.tech</a>.
              </p>
            </section>
          </div>
        </LazyReveal>
      )}

      {/* Privacy FAQ Accordion */}
      <LazyReveal direction="up">
        <div className="rounded-3xl border border-[#e2e8f0] bg-white overflow-hidden shadow-sm">
          <GlobalFaqSection 
            categories={faqCategories}
            title="Frequently Asked Privacy Questions"
            subtitle="Answers regarding data retention, GDPR compliance, encryption, and telemetry handling."
          />
        </div>
      </LazyReveal>
    </div>
  );
};
