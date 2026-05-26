import React from 'react';
import Link from 'next/link';
import { ArrowRight, BrainCircuit, Search, Zap, ExternalLink, ShieldCheck, FileText, Database } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-[#68BA7F]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[1rem] bg-[#CFFFDC] flex items-center justify-center border border-[#68BA7F]/50">
              <BrainCircuit className="w-5 h-5 text-[#2E6F40]" />
            </div>
            <span className="font-bold text-lg tracking-tight text-[#253D2C]">CatalystLab</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#2E6F40]/80">
            <a href="#features" className="hover:text-[#253D2C] transition-colors">Features</a>
            <a href="#instruments" className="hover:text-[#253D2C] transition-colors">Instruments</a>
            <a href="#sources" className="hover:text-[#253D2C] transition-colors">Sources</a>
            <Link href="/blogs" className="hover:text-[#253D2C] transition-colors">Blogs</Link>
            <a href="#pricing" className="hover:text-[#253D2C] transition-colors">Pricing</a>
          </nav>
          
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-[#253D2C]/80 hover:text-[#253D2C] transition-colors">
              Log in
            </Link>
            <Link href="/dashboard" className="text-sm font-medium bg-[#2E6F40] text-white px-4 py-2 rounded-[1rem] hover:bg-[#253D2C] transition-colors flex items-center gap-2">
              <span>Try for free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 bg-[#F4F9F5]">
        <div className="max-w-4xl mx-auto text-center space-y-8 mt-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#CFFFDC] border border-[#68BA7F]/50 text-[#2E6F40] text-sm font-medium font-mono">
            <Zap className="w-4 h-4" />
            <span>v1.3.7 — Now with Gemini 2.5 Flash</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-[#253D2C] leading-tight">
            Think at the <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2E6F40] to-[#68BA7F]">edge of knowledge</span>
          </h1>
          
          <p className="text-xl text-[#2E6F40]/80 max-w-2xl mx-auto leading-relaxed">
            AI-powered research brainstorming and parallel literature discovery for serious researchers. 
            Stop searching. Start synthesizing.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/dashboard" className="w-full sm:w-auto text-base font-medium bg-[#2E6F40] text-white px-8 py-3.5 rounded-[1.25rem] hover:bg-[#253D2C] transition-all shadow-[0_0_20px_rgba(46,111,64,0.2)] hover:shadow-[0_0_30px_rgba(46,111,64,0.3)] flex items-center justify-center gap-2">
              <span>Enter CatalystLab</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Two Pillars Section */}
      <section id="features" className="py-24 px-4 sm:px-6 bg-white border-y border-[#68BA7F]/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            
            {/* THINk */}
            <div className="space-y-6">
              <div className="w-12 h-12 rounded-[1.25rem] bg-[#CFFFDC] flex items-center justify-center border border-[#68BA7F]/50">
                <BrainCircuit className="w-6 h-6 text-[#2E6F40]" />
              </div>
              <h2 className="text-3xl font-bold text-[#253D2C] tracking-tight">THINK</h2>
              <p className="text-lg text-[#2E6F40]/80 leading-relaxed">
                20 structured AI brainstorming instruments that help researchers pressure-test ideas, find contradictions, explore assumptions, generate hypotheses, and discover research gaps.
              </p>
              <ul className="space-y-3 pt-4">
                {['Thought Collider', 'Research Multiverse', 'Contradiction Finder', 'Assumption Archaeology'].map(i => (
                  <li key={i} className="flex items-center gap-3 text-[#253D2C]/80 font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#68BA7F]"></div>
                    {i}
                  </li>
                ))}
              </ul>
            </div>

            {/* DISCOVER */}
            <div className="space-y-6">
              <div className="w-12 h-12 rounded-[1.25rem] bg-[#CFFFDC] flex items-center justify-center border border-[#68BA7F]/50">
                <Search className="w-6 h-6 text-[#2E6F40]" />
              </div>
              <h2 className="text-3xl font-bold text-[#253D2C] tracking-tight">DISCOVER</h2>
              <p className="text-lg text-[#2E6F40]/80 leading-relaxed">
                Every time you run an instrument, CatalystLab automatically extracts your research concepts and searches 9 free academic databases in parallel, surfacing relevant literature instantly.
              </p>
              <ul className="space-y-3 pt-4">
                {['Parallel API fan-out to 9 sources', 'AI automated search query generation', 'Session saving to Firestore', '14 citation export formats'].map(i => (
                  <li key={i} className="flex items-center gap-3 text-[#253D2C]/80 font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#68BA7F]"></div>
                    {i}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </section>

      <section id="instruments" className="py-24 px-4 sm:px-6 bg-[#F4F9F5]">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#253D2C]">21 specialized research instruments</h2>
            <p className="text-lg text-[#2E6F40]/80">Divided into three zones of cognitive assistance to accelerate scientific discovery.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 pt-8">
            <div className="p-6 rounded-[1.5rem] bg-white border border-[#68BA7F]/30 shadow-lg space-y-4">
              <h3 className="text-xl font-bold text-[#253D2C]">Zone A — Idea Catalyst</h3>
              <p className="text-sm text-[#2E6F40]/80">Brainstorming, paradigm breaking, and lateral synthesis (7 tools).</p>
              <div className="pt-4 border-t border-[#68BA7F]/20 text-sm text-[#253D2C]/80 space-y-2">
                <p><strong>Thought Collider:</strong> Hybrid premise breakthroughs.</p>
                <p><strong>Research Multiverse:</strong> Alternate hypothesis universes.</p>
                <p><strong>Concept Alchemy:</strong> Conceptual synthesis reaction.</p>
              </div>
            </div>
            
            <div className="p-6 rounded-[1.5rem] bg-white border border-[#68BA7F]/30 shadow-lg space-y-4">
              <h3 className="text-xl font-bold text-[#253D2C]">Zone B — Analytical Foundry</h3>
              <p className="text-sm text-[#2E6F40]/80">Pressure testing, bias unearthing, and contradiction search (7 tools).</p>
              <div className="pt-4 border-t border-[#68BA7F]/20 text-sm text-[#253D2C]/80 space-y-2">
                <p><strong>Pressure Chamber:</strong> Adversarial critiques.</p>
                <p><strong>Contradiction Finder:</strong> Conflict and gap identification.</p>
                <p><strong>Boundary Scalpel:</strong> Limit of applicability parsing.</p>
              </div>
            </div>

            <div className="p-6 rounded-[1.5rem] bg-white border border-[#68BA7F]/30 shadow-lg space-y-4">
              <h3 className="text-xl font-bold text-[#253D2C]">Zone C — Strategic Discovery</h3>
              <p className="text-sm text-[#2E6F40]/80">Macro-trend forecasting, serendipity radar, and field mapping (7 tools).</p>
              <div className="pt-4 border-t border-[#68BA7F]/20 text-sm text-[#253D2C]/80 space-y-2">
                <p><strong>Temporal Telescope:</strong> Multi-decade field projections.</p>
                <p><strong>Serendipity Radar:</strong> Discovery of adjacent breakthrough domains.</p>
                <p><strong>Horizon Mapper:</strong> Bridge theory to commercial value.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sources Grid */}
      <section id="sources" className="py-24 px-4 sm:px-6 bg-white border-y border-[#68BA7F]/30">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#253D2C]">Connected to 9 academic APIs</h2>
            <p className="text-lg text-[#2E6F40]/80">We search over 250M+ open access papers, preprints, and publications in parallel.</p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-center">
            {['Semantic Scholar', 'OpenAlex', 'arXiv', 'PubMed', 'CORE', 'Crossref', 'Europe PMC', 'DOAJ', 'Unpaywall'].map(s => (
              <div key={s} className="px-6 py-3 rounded-full bg-[#F4F9F5] border border-[#68BA7F]/30 text-[#253D2C]/80 font-medium shadow-lg">
                {s}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4 sm:px-6 bg-[#F4F9F5]">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tight text-[#253D2C]">Simple, transparent pricing</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-[1.5rem] bg-white border border-[#68BA7F]/30 shadow-lg space-y-4">
              <h3 className="font-bold text-[#253D2C]">Free</h3>
              <div className="text-3xl font-bold text-[#253D2C]">$0<span className="text-lg text-[#2E6F40]/70 font-normal">/mo</span></div>
              <ul className="text-sm text-[#2E6F40]/80 space-y-2">
                <li>5 runs/day</li>
                <li>3 academic sources</li>
              </ul>
            </div>
            <div className="p-6 rounded-[1.5rem] bg-[#CFFFDC]/40 border border-[#68BA7F]/50 shadow-lg space-y-4 relative">
              <div className="absolute top-0 right-6 -translate-y-1/2 bg-[#2E6F40] text-white text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded">Popular</div>
              <h3 className="font-bold text-[#253D2C]">Researcher</h3>
              <div className="text-3xl font-bold text-[#253D2C]">$9<span className="text-lg text-[#2E6F40] font-normal">/mo</span></div>
              <ul className="text-sm text-[#2E6F40] space-y-2">
                <li>Unlimited runs</li>
                <li>All 9 sources</li>
              </ul>
            </div>
            <div className="p-6 rounded-[1.5rem] bg-white border border-[#68BA7F]/30 shadow-lg space-y-4">
              <h3 className="font-bold text-[#253D2C]">Lab Pro</h3>
              <div className="text-3xl font-bold text-[#253D2C]">$19<span className="text-lg text-[#2E6F40]/70 font-normal">/mo</span></div>
              <ul className="text-sm text-[#2E6F40]/80 space-y-2">
                <li>BYO API key support</li>
                <li>Priority search fan-out</li>
              </ul>
            </div>
            <div className="p-6 rounded-[1.5rem] bg-white border border-[#68BA7F]/30 shadow-lg space-y-4">
              <h3 className="font-bold text-[#253D2C]">Institution</h3>
              <div className="text-3xl font-bold text-[#253D2C]">$49<span className="text-lg text-[#2E6F40]/70 font-normal">/mo</span></div>
              <ul className="text-sm text-[#2E6F40]/80 space-y-2">
                <li>Team sub-accounts</li>
                <li>Shared living reviews</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 border-t border-[#68BA7F]/30 bg-white mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-[#253D2C]/80">
            <BrainCircuit className="w-5 h-5" />
            <span className="font-bold">CatalystLab</span>
            <span className="text-sm ml-2">© 2026</span>
          </div>
          <div className="flex gap-6 text-sm text-[#2E6F40]/70">
            <Link href="/privacy" className="hover:text-[#253D2C] transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-[#253D2C] transition-colors">Terms</Link>
            <a href="https://github.com/myself-aas/CatalystLab" target="_blank" rel="noreferrer" className="hover:text-[#253D2C] transition-colors flex items-center gap-1">
              GitHub <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
