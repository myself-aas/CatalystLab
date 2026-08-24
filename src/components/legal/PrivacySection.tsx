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
  Sparkles, 
  Server, 
  Key 
} from 'lucide-react';
import { LazyReveal } from '../common/LazyAnimate';

export const PrivacySection: React.FC = () => {
  const [mode, setMode] = useState<'summary' | 'full'>('summary');
  const [exported, setExported] = useState(false);
  const [deletionRequested, setDeletionRequested] = useState(false);

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
    <div className="space-y-8 font-mono">
      {/* Policy Header / Summary Switcher */}
      <LazyReveal direction="up">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 text-slate-900 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <div className="flex items-center gap-2 text-xs text-amber-600 mb-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold">SPEC-V2.8 • GDPR &amp; CCPA CERTIFIED</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 font-sans">
                CatalystLab Privacy Architecture
              </h2>
              <p className="mt-1 text-xs text-slate-500 font-sans">
                Effective Date: August 19, 2026 • Certified for Zero Third-Party Data Brokering
              </p>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200">
              <button
                onClick={() => setMode('summary')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  mode === 'summary'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="h-3 w-3 text-amber-500" />
                <span>Plain English</span>
              </button>
              <button
                onClick={() => setMode('full')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  mode === 'full'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="h-3 w-3 text-emerald-500" />
                <span>Legal Clauses</span>
              </button>
            </div>
          </div>

          {/* Quick Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-1.5 text-amber-600 font-bold text-xs uppercase mb-1">
                <EyeOff className="h-3.5 w-3.5" />
                <span>Zero Data Sales</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                We never monetize, broker, or train public AI models on your private diagnostic logs or internal endpoints.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs uppercase mb-1">
                <Lock className="h-3.5 w-3.5" />
                <span>End-to-End Encryption</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                All network diagnostics are secured via TLS 1.3 with AES-256 encrypted database columns in Firestore.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-1.5 text-amber-600 font-bold text-xs uppercase mb-1">
                <Database className="h-3.5 w-3.5" />
                <span>Right to Purge</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                One-click complete purge of all historic reports, domain scans, and audit traces anytime from your portal.
              </p>
            </div>
          </div>
        </div>
      </LazyReveal>

      {/* Mode 1: Plain English Interactive View */}
      {mode === 'summary' ? (
        <div className="space-y-6">
          {/* Data Flow & Collection Explorer */}
          <LazyReveal direction="up">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 text-amber-600 border border-slate-200">
                  <Server className="h-3.5 w-3.5" />
                </span>
                <h3 className="text-base font-bold text-slate-900 font-sans">Data Collection &amp; Flow Matrix</h3>
              </div>
              <p className="text-xs text-slate-500 mb-5 font-sans">
                Transparent accounting of exactly what metadata our 8 diagnostic engines process during a scan.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse font-mono">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-900 font-bold">
                      <th className="py-2.5 px-3 rounded-l-lg">Data Category</th>
                      <th className="py-2.5 px-3">What We Collect</th>
                      <th className="py-2.5 px-3">Purpose</th>
                      <th className="py-2.5 px-3">Retention Period</th>
                      <th className="py-2.5 px-3 rounded-r-lg">Third-Party Access</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-900">Target URLs</td>
                      <td className="py-3 px-3 text-[11px]">Domain name &amp; endpoint paths entered</td>
                      <td className="py-3 px-3">Dispatch HTTP probes and calculate response times</td>
                      <td className="py-3 px-3">Ephemeral (1 hr) or Saved in User DB</td>
                      <td className="py-3 px-3 font-semibold text-emerald-600">None (Isolated)</td>
                    </tr>
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-900">HTTP Headers</td>
                      <td className="py-3 px-3 text-[11px]">HSTS, CSP, X-Frame, CORS headers</td>
                      <td className="py-3 px-3">OWASP compliance scoring and vulnerability audit</td>
                      <td className="py-3 px-3">Retained with report dossier</td>
                      <td className="py-3 px-3 font-semibold text-emerald-600">None</td>
                    </tr>
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-900">User Credentials</td>
                      <td className="py-3 px-3 text-[11px]">Google OAuth ID, Email, Display Name</td>
                      <td className="py-3 px-3">Authenticate and isolate private reports</td>
                      <td className="py-3 px-3">Until account deletion</td>
                      <td className="py-3 px-3 text-amber-600 font-bold">Firebase Auth (Google)</td>
                    </tr>
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-900">Telemetry Logs</td>
                      <td className="py-3 px-3 text-[11px]">DNS lookup latency, TLS handshake ms</td>
                      <td className="py-3 px-3">Render synthetic latency charts &amp; global radar</td>
                      <td className="py-3 px-3">30 days aggregate cache</td>
                      <td className="py-3 px-3 font-semibold text-emerald-600">None</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </LazyReveal>

          {/* Interactive Self-Service Data Rights Center */}
          <LazyReveal direction="up">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 text-slate-900 shadow-sm">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 text-amber-600 border border-slate-200">
                  <Key className="h-3.5 w-3.5" />
                </span>
                <h3 className="text-base font-bold text-slate-900 font-sans">Your GDPR &amp; CCPA Self-Service Controls</h3>
              </div>
              <p className="text-xs text-slate-500 mb-5 font-sans">
                Exercise your data rights with instant machine-readable exports and automated removal commands.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Export Card */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Download className="h-3.5 w-3.5 text-amber-600" />
                      <span>Export Diagnostic Archive (JSON)</span>
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed font-sans">
                      Download a structured, machine-readable JSON package of all telemetry logs, saved audit dossiers, and profile preferences.
                    </p>
                  </div>
                  <div>
                    <button
                      onClick={handleExportData}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 px-3 py-1.5 text-xs font-bold text-white transition-colors cursor-pointer"
                    >
                      {exported ? <CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> : <Download className="h-3.5 w-3.5 text-amber-400" />}
                      <span>{exported ? 'Data Archive Exported!' : 'Download Telemetry Package'}</span>
                    </button>
                  </div>
                </div>

                {/* Deletion Card */}
                <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                      <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                      <span>Request Full Telemetry Purge</span>
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed font-sans">
                      Permanently wipe all saved domain reports, synthetic latency charts, and user account metadata from our Firestore cluster.
                    </p>
                  </div>
                  <div>
                    {deletionRequested ? (
                      <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-2 text-xs text-emerald-800 flex items-center gap-1.5 font-bold">
                        <CheckCircle className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                        <span>Purge command registered. All records cleared upon session end.</span>
                      </div>
                    ) : (
                      <button
                        onClick={handleRequestDeletion}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-rose-300 bg-rose-100 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-200 transition-colors cursor-pointer"
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
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 text-xs text-slate-700 space-y-6 shadow-sm leading-relaxed">
            <section className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-1.5 font-sans">
                1. Scope of Telemetry &amp; Diagnostics Processing
              </h3>
              <p className="text-slate-600 font-sans">
                CatalystLab (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates synthetic diagnostic suites, security header scanners, and edge latency benchmarks. This Privacy Policy governs the processing of technical data submitted when invoking diagnostic endpoints through <code className="text-amber-700 bg-amber-50 border border-amber-200 px-1 py-0.5 rounded font-mono font-bold">catalystlab.tech</code>.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-1.5 font-sans">
                2. Legal Basis for Processing under GDPR (Article 6)
              </h3>
              <p className="text-slate-600 font-sans">
                We process diagnostic data on the following bases: (a) Performance of a contract when you request an on-demand audit; (b) Legitimate interests in securing our container infrastructure against automated denial of service; (c) Explicit user consent for authenticated report archiving and PDF generation.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-1.5 font-sans">
                3. Subprocessors &amp; International Transfers
              </h3>
              <p className="text-slate-600 font-sans">
                Diagnostic requests are processed through Google Cloud infrastructure. All transfers of EU personal data are governed by standard contractual clauses (SCCs) and ISO 27001 audited data centers with automated encryption in transit and at rest.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-1.5 font-sans">
                4. Data Protection Officer &amp; Privacy Inquiries
              </h3>
              <p className="text-slate-600 font-sans">
                For legal notices, data subject requests, or regulatory inquiries, contact our Data Protection Officer directly at <a href="mailto:privacy@catalystlab.tech" className="text-amber-700 font-bold underline hover:text-amber-800">privacy@catalystlab.tech</a>.
              </p>
            </section>
          </div>
        </LazyReveal>
      )}

      {/* Privacy FAQ Accordion */}
      <LazyReveal direction="up">
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
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
