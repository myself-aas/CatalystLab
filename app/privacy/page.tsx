'use client';
import React from 'react';
import Link from 'next/link';
import { BrainCircuit, ArrowLeft, Shield, Lock, Eye, Database, Globe } from 'lucide-react';

export default function PrivacyPage() {
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
            <Shield className="w-3.5 h-3.5" />
            <span>Effective Date: May 26, 2026</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#253D2C]">Privacy Policy</h1>
          <p className="text-lg text-[#2E6F40]/80 max-w-2xl mx-auto">
            How CatalystLab collects, processes, and protects agricultural research hypotheses, key integrations, and literature synthesis datasets.
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
                <Database className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold tracking-tight">1. Research Data Collection Boundaries</h2>
            </div>
            <p className="text-[#2E6F40]/90 leading-relaxed text-sm md:text-base">
              CatalystLab is built exclusively for sustainable agricultural and food engineering research. Unlike typical general-purpose applications, we enforce strict containment parameters over what we harvest:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-[#2E6F40]/80 text-sm">
              <li>
                <strong className="text-[#253D2C]">Hypothesis Variables:</strong> Custom components, slider ranges, constants, and variables modeled inside the <em className="not-italic text-[#2E6F40] font-semibold">Thought Collider</em> are stored in secure session caches and your synchronized database layout to withstand connection loss.
              </li>
              <li>
                <strong className="text-[#253D2C]">Indexing Literature:</strong> Metadata, research abstracts, and citations harvested recursively from our 17 parallel academic index providers (including OpenAlex, PubMed, and Semantic Scholar) are stored with query filters, enabling immediate deduplication.
              </li>
              <li>
                <strong className="text-[#253D2C]">Personal Credentials:</strong> When using custom or Bring-Your-Own (BYO) API keys for LLM synthesis, these secrets remain in the isolated secure backend. We never transfer client credentials directly to third-party endpoints.
              </li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-[#2E6F40]">
              <div className="w-8 h-8 rounded-lg bg-[#F4F9F5] flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold tracking-tight">2. Zero LLM Training Guarantee</h2>
            </div>
            <p className="text-[#2E6F40]/90 leading-relaxed text-sm">
              We understand the sensitive proprietary nature of innovative chemical compositions, genetic crop modifications, or food-pipeline engineering hypotheses. 
            </p>
            <div className="bg-[#FAFDF6] border-l-4 border-[#2E6F40] p-4 rounded-r-xl">
              <p className="text-sm text-[#2E6F40] font-medium leading-relaxed">
                <strong>Zero Leak Policy:</strong> All telemetry logs and synthesis requests processed by Google Gemini (1.5 Pro and Flash) bypass general foundational training caches. Your variables, agricultural inputs, and synthesized reports are isolated and will never be used to train global generative AI structures.
              </p>
            </div>
          </div>

          {/* Section 3 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-[#2E6F40]">
              <div className="w-8 h-8 rounded-lg bg-[#F4F9F5] flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold tracking-tight">3. Parallel Index Fan-Out Rules</h2>
            </div>
            <p className="text-[#2E6F40]/90 leading-relaxed text-sm">
              To fetch references fast, the Orchestrator runs parallel API fetches to 17 concurrent servers. During this reaction:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-[#2E6F40]/80 text-sm">
              <li>No personal information (e.g., your email, account name, identifier details) is exposed to external citation servers.</li>
              <li>Only sanitized scientific search strings derived through AI automated keywords mapping are transmitted.</li>
              <li>External APIs (such as Europe PMC, DOAJ, arXiv) only detect the secure server proxy address of CatalystLab.</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-[#2E6F40]">
              <div className="w-8 h-8 rounded-lg bg-[#F4F9F5] flex items-center justify-center">
                <Eye className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold tracking-tight">4. Storage, Retention, and Deletion</h2>
            </div>
            <p className="text-[#2E6F40]/90 leading-relaxed text-sm">
              All stored drafts, academic blogs, and research templates are persisted utilizing cloud architecture managed with Firebase Firestore.
            </p>
            <p className="text-[#2E6F40]/80 text-sm">
              You can permanently delete any saved research results, drafts, or account profiles at any time through the <Link href="/settings" className="text-[#2E6F40] font-bold hover:underline">Settings Panel</Link> within the application workspace. Deleted datasets are immediately pruned from current active nodes and permanently overwritten within 30 days.
            </p>
          </div>

          {/* Contact footer */}
          <div className="pt-8 border-t border-[#68BA7F]/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs font-mono text-[#2E6F40]/70">
            <span>Security Status: Secure</span>
            <span>Queries or Data Audits: shuvo.1807016@bau.edu.bd</span>
          </div>

        </div>
      </main>

      {/* Simple Footer */}
      <footer className="py-8 bg-white border-t border-[#68BA7F]/20 text-center text-xs text-[#2E6F40]/60">
        <p>© 2026 CatalystLab. Under strict agricultural data container isolation policies.</p>
      </footer>
    </div>
  );
}
