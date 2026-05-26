'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { BrainCircuit, ArrowLeft, Github, Terminal, Copy, Check, GitFork, Cpu, Layers, Star, ExternalLink, Settings } from 'lucide-react';

export default function GitHubPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const steps = [
    {
      title: 'Clone Repository',
      desc: 'Download the source files from the official CatalystLab repository.',
      cmd: 'git clone https://github.com/myself-aas/CatalystLab.git\ncd CatalystLab',
      id: 'clone'
    },
    {
      title: 'Install Dependencies',
      desc: 'Install the packages from package.json in your local node environment.',
      cmd: 'npm install',
      id: 'install'
    },
    {
      title: 'Environment Configuration',
      desc: 'Set up your server secrets. Open .env and add your Gemini API key.',
      cmd: 'cp .env.example .env\n# Edit .env and enter:\n# GEMINI_API_KEY=your_gemini_api_key',
      id: 'env'
    },
    {
      title: 'Compile and Execute',
      desc: 'Run the development server natively or build the full production client bundle.',
      cmd: 'npm run dev',
      id: 'run'
    }
  ];

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
            <Github className="w-3.5 h-3.5" />
            <span>Open Source Project codebase</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#253D2C]">GitHub Developer Portal</h1>
          <p className="text-lg text-[#2E6F40]/80 max-w-2xl mx-auto">
            Take a deep dive under the hood of our agricultural research operating system. Clean architecture, robust orchestrator pipelines, and beautiful React UI.
          </p>
          <div className="flex justify-center gap-4 pt-2">
            <a 
              href="https://github.com/myself-aas/CatalystLab" 
              target="_blank" 
              rel="noreferrer" 
              className="px-5 py-2.5 bg-[#253D2C] hover:bg-black text-white text-sm font-bold rounded-xl shadow-lg flex items-center gap-2 transition-all"
            >
              <Github className="w-4 h-4" />
              <span>Go to Repository</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* Main Interactive Grid */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-16 space-y-12">
        
        {/* Core Stats / Meta Cards */}
        <div className="grid sm:grid-cols-3 gap-6">
          <div className="bg-white border border-[#68BA7F]/20 p-6 rounded-2xl flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#F4F9F5] text-[#2E6F40] flex items-center justify-center shrink-0 border border-[#64B97B]/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#253D2C]">Stack Architecture</h3>
              <p className="text-xs text-[#2E6F40]/80 mt-1">Next.js 15, React, Firebase Firestore, Tailwind CSS, Google Gemini 1.5</p>
            </div>
          </div>
          <div className="bg-white border border-[#68BA7F]/20 p-6 rounded-2xl flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#F4F9F5] text-[#2E6F40] flex items-center justify-center shrink-0 border border-[#64B97B]/20">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#253D2C]">Orchestrated Sources</h3>
              <p className="text-xs text-[#2E6F40]/80 mt-1">Parallel fan-out queries spanning 17 concurrent citation indexing nodes</p>
            </div>
          </div>
          <div className="bg-white border border-[#68BA7F]/20 p-6 rounded-2xl flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#F4F9F5] text-[#2E6F40] flex items-center justify-center shrink-0 border border-[#64B97B]/20">
              <GitFork className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#253D2C]">Open For Contributions</h3>
              <p className="text-xs text-[#2E6F40]/80 mt-1">Pull requests for new providers (ServiceFactory, Zod Schemas) always welcome</p>
            </div>
          </div>
        </div>

        {/* Technical Specification Showcase */}
        <div className="bg-white border border-[#68BA7F]/20 rounded-[2rem] p-8 md:p-12 shadow-sm space-y-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-[#253D2C]">The Orchestrator Architecture</h2>
            <p className="text-[#2E6F40]/80 leading-relaxed text-sm md:text-base">
              The core engine of CatalystLab operates on a customized pipeline dividing workloads into 3 layered phases:
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-[#FAFDF6] border border-[#68BA7F]/20 space-y-2">
              <div className="text-xs font-mono font-bold text-[#2E6F40] uppercase tracking-wide">Phase 1</div>
              <h4 className="font-bold text-[#253D2C]">Retrieval & Validation</h4>
              <p className="text-xs text-[#2E6F40]/70 leading-relaxed">
                Client issues a concept collision. Parallel requests are spawned to index nodes. Every payload raw result is piped through Zod schema check blocks (e.g. ResearchResultSchema) before admission.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-[#FAFDF6] border border-[#68BA7F]/20 space-y-2">
              <div className="text-xs font-mono font-bold text-[#2E6F40] uppercase tracking-wide">Phase 2</div>
              <h4 className="font-bold text-[#253D2C]">Curated Filtering</h4>
              <p className="text-xs text-[#2E6F40]/70 leading-relaxed">
                Applies the strict 3-year threshold limit. All papers outside 2023–2026 are purged. Surviving items are grouped by provider, sorted by relevance score, taking exactly the top 3 items per provider.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-[#FAFDF6] border border-[#68BA7F]/20 space-y-2">
              <div className="text-xs font-mono font-bold text-[#2E6F40] uppercase tracking-wide">Phase 3</div>
              <h4 className="font-bold text-[#253D2C]">Dynamic Synthesis</h4>
              <p className="text-xs text-[#2E6F40]/70 leading-relaxed">
                Constructs a consolidated scientific context. Passes data block to Google Gemini endpoints, which performs semantic parsing of experimental variable bounds defined in the Collider.
              </p>
            </div>
          </div>
        </div>

        {/* Getting Started Guide */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-[#253D2C]">Local Setup Guide</h2>
            <p className="text-[#2E6F40]/80 text-sm">Clone, configure environment variables, and build the agricultural research lab locally in a matter of minutes.</p>
          </div>

          <div className="space-y-4">
            {steps.map((step, idx) => (
              <div key={idx} className="bg-white border border-[#68BA7F]/20 rounded-2xl p-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                <div className="space-y-1 max-w-sm md:max-w-md">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#CFFFDC] text-[#2E6F40] flex items-center justify-center font-mono text-xs font-bold shrink-0">{idx + 1}</span>
                    <h3 className="font-bold text-sm text-[#253D2C]">{step.title}</h3>
                  </div>
                  <p className="text-xs text-[#2E6F40]/70 pl-7">{step.desc}</p>
                </div>
                
                {/* Code Terminal Box */}
                <div className="w-full md:w-auto shrink-0 flex items-center gap-3 bg-[#FAFDF6] border border-[#68BA7F]/30 rounded-xl px-4 py-3 font-mono text-xs text-[#2E6F40] justify-between relative group/term">
                  <div className="flex items-center gap-2 pr-4 overflow-x-auto whitespace-pre select-all scrollbar-none">
                    <Terminal className="w-3.5 h-3.5 text-[#68BA7F]" />
                    <span>{step.cmd}</span>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(step.cmd, step.id)}
                    className="p-1.5 rounded-lg hover:bg-[#CFFFDC] text-[#2E6F40] transition-colors shrink-0"
                    title="Copy command"
                  >
                    {copiedId === step.id ? <Check className="w-3.5 h-3.5 text-[#2E6F40]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="py-12 bg-white border-t border-[#68BA7F]/20 text-center text-xs text-[#2E6F40]/60 space-y-2">
        <p>© 2026 CatalystLab. Released open source for sustainable global environmental engineering.</p>
        <p className="font-mono text-[10px]">Repository: myself-aas/CatalystLab</p>
      </footer>
    </div>
  );
}
