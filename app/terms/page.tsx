'use client';
import React from 'react';
import Link from 'next/link';
import { BrainCircuit, ArrowLeft, FileText, Scale, Cpu, RefreshCw, AlertTriangle } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F4F9F5] text-[#253D2C] selection:bg-[#CFFFDC]">
      {/* Navigation Header */}
      <header className="sticky top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-[#68BA7F]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="w-8 h-8 rounded-[1rem] bg-[#CFFFDC] flex items-center justify-center border border-[#68BA7F]/50">
              <BrainCircuit className="w-5 h-5 text-[#2E6F40]" />
            </div>
            <span className="font-bold text-lg tracking-tight text-[#253D2C]">CatalystLab</span>
          </Link>
          <Link 
            href="/" 
            className="text-sm font-medium text-[#2E6F40] hover:text-[#253D2C] transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="py-20 px-4 sm:px-6 bg-gradient-to-b from-white to-[#F4F9F5] border-b border-[#68BA7F]/10">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#CFFFDC] border border-[#68BA7F]/30 text-[#2E6F40] text-xs font-mono">
            <Scale className="w-3.5 h-3.5" />
            <span>Last Updated: May 26, 2026</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#253D2C]">Terms of Service</h1>
          <p className="text-lg text-[#2E6F40]/80 max-w-2xl mx-auto">
            Operational mandates, user liabilities, and software limits governing your use of our agricultural engineering research operating system.
          </p>
        </div>
      </section>

      {/* Main Content Layout */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <div className="bg-white border border-[#68BA7F]/25 rounded-[2rem] p-8 md:p-12 shadow-sm space-y-12">
          
          {/* Section 1 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-[#2E6F40]">
              <div className="w-8 h-8 rounded-lg bg-[#F4F9F5] flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold tracking-tight">1. Services Framework & Purpose</h2>
            </div>
            <p className="text-[#2E6F40]/90 leading-relaxed text-sm md:text-base">
              Welcome to CatalystLab. By accessing or executing research tools inside this platform, you agree to comply with this Terms of Service agreement. CatalystLab is a high-performance research operating system designed to integrate Artificial Intelligence, IoT, and data-driven modeling into agricultural sustainability and food engineering research.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-[#2E6F40]">
              <div className="w-8 h-8 rounded-lg bg-[#F4F9F5] flex items-center justify-center">
                <Cpu className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold tracking-tight">2. Instrument Usage & Variable Rules</h2>
            </div>
            <p className="text-[#2E6F40]/90 leading-relaxed text-sm">
              When configuring components, hypotheses, and parameters in the <em className="not-italic text-[#2E6F40] font-semibold">Thought Collider</em>:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-[#2E6F40]/80 text-sm">
              <li>Users are constrained to configure <strong className="text-[#253D2C]">up to 5 dynamic components</strong> per experiment.</li>
              <li>You agree not to bypass, stress, or overload the underlying API proxy rates. We run parallel fan-out queries in real time.</li>
              <li>You are solely responsible for ensuring that crop species, metric constants, or soil metrics provided in the system reflect reasonable empirical bounds.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-[#2E6F40]">
              <div className="w-8 h-8 rounded-lg bg-[#F4F9F5] flex items-center justify-center">
                <RefreshCw className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold tracking-tight">3. Orchestrator Limitations & Time-Gating</h2>
            </div>
            <p className="text-[#2E6F40]/90 leading-relaxed text-sm font-medium text-[#2E6F40]">
              The Orchestrator processes queries according to strict technical rules to prevent timeouts and optimize relevance score sorting:
            </p>
            <p className="text-[#2E6F40]/80 leading-relaxed text-sm">
              <strong>The 3-Year Threshold:</strong> To promote breakthrough sustainable agriculture discussions, our parsing model applies a strict 3-year "time-gating" window (focusing on literature published in 2023–2026). Foundational historical materials are bypassed unless required for essential semantic context. You acknowledge that some older publications may therefore not be curated by default.
            </p>
            <p className="text-[#2E6F40]/80 leading-relaxed text-sm">
              <strong>The "Top 3" Rule:</strong> The Orchestrator takes a maximum of 3 papers per active indexing provider, dropping items that fail structural schema validation tests.
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-[#2E6F40]">
              <div className="w-8 h-8 rounded-lg bg-[#F4F9F5] flex items-center justify-center text-rose-600 bg-rose-50">
                <AlertTriangle className="w-4 h-4 text-emerald-700" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-[#2E6F40]">4. AI Synthesis & Citation Disclaimer</h2>
            </div>
            <div className="bg-[#FAFDF6] border border-[#68BA7F]/30 p-5 rounded-2xl space-y-3">
              <p className="text-sm text-[#2E6F40] leading-relaxed">
                Synthesis outputs are compiled using generative artificial intelligence model endpoints (Google Gemini API). Consequently:
              </p>
              <ul className="list-decimal pl-6 space-y-2 text-xs text-[#2E6F40]/80">
                <li>
                  <strong className="text-[#253D2C]">Verification Mandate:</strong> Generative models are secondary tools. Researchers are strictly mandated to manually double-check and verify synthesized findings and citations against primary DOI literature before relying on them.
                </li>
                <li>
                  <strong className="text-[#253D2C]">Hypothesis Liability:</strong> Synthesis findings do not constitute certified agronomical advice, chemical recipes, or legal compliance suggestions for food production pipelines. You bear full risk of any field deployment errors or crop damage.
                </li>
              </ul>
            </div>
          </div>

          {/* Section 5 */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[#253D2C]">5. Plan Billing & Integrations</h2>
            <p className="text-[#2E6F40]/90 leading-relaxed text-sm">
              Our subscriptions (Lab Pro, Institution) are charged monthly. Professional tier users utilizing Bring-Your-Own-Key (BYOK) setups agree that keys must be fully certified and comply with respective provider licenses. CatalystLab reserves the right to suspend any accounts that cause routing instability.
            </p>
          </div>

          {/* Contact footer */}
          <div className="pt-8 border-t border-[#68BA7F]/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs font-mono text-[#2E6F40]/70">
            <span>Governance Jurisdiction: Agricultural Research Standard Tech</span>
            <span>Contact Administrator: shuvo.1807016@bau.edu.bd</span>
          </div>

        </div>
      </main>

      {/* Simple Footer */}
      <footer className="py-8 bg-white border-t border-[#68BA7F]/20 text-center text-xs text-[#2E6F40]/60">
        <p>© 2026 CatalystLab. Terms and limits subject to ongoing agricultural sustainability breakthroughs.</p>
      </footer>
    </div>
  );
}
