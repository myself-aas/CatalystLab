'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { Fingerprint, Workflow, Network } from 'lucide-react';

const INSTRUMENTS = [
  // Zone A — Idea Catalyst
  { id: 'thought-collider', name: 'Thought Collider', desc: 'Crash two divergent scientific premises to spark a hybrid breakthrough.', zone: 'Zone A — Idea Catalyst' },
  { id: 'research-multiverse', name: 'Research Multiverse', desc: 'Flip core paradigms to map out alternative experimental universes.', zone: 'Zone A — Idea Catalyst' },
  { id: 'concept-alchemy', name: 'Concept Alchemy', desc: 'Synthesize distinct academic concepts into rare conceptual reactions.', zone: 'Zone A — Idea Catalyst' },
  { id: 'assumption-excavator', name: 'Assumption Excavator', desc: 'Unearth implicit biases and logical leaps buried within your thesis.', zone: 'Zone A — Idea Catalyst' },
  { id: 'divergent-dialectic', name: 'Divergent Dialectic', desc: 'Formulate thesis and antithesis to achieve high-order cognitive synthesis.', zone: 'Zone A — Idea Catalyst' },
  { id: 'phenomenon-prism', name: 'Phenomenon Prism', desc: 'Refract a singular raw observation into multi-disciplinary theoretical spectrums.', zone: 'Zone A — Idea Catalyst' },
  { id: 'paradigm-disruptor', name: 'Paradigm Disruptor', desc: 'Stress-test orthodox models with extreme edge cases to reveal hidden flaws.', zone: 'Zone A — Idea Catalyst' },

  // Zone B — Analytical Foundry
  { id: 'pressure-chamber', name: 'Pressure Chamber', desc: 'Subject your core hypothesis to adversarial peer-review critiques.', zone: 'Zone B — Analytical Foundry' },
  { id: 'contradiction-finder', name: 'Contradiction Finder', desc: 'Locate logical gaps and conflicting findings in current literature.', zone: 'Zone B — Analytical Foundry' },
  { id: 'metaphorical-bridge', name: 'Metaphorical Bridge', desc: 'Map complex scientific problems into simpler cross-domain analogies.', zone: 'Zone B — Analytical Foundry' },
  { id: 'boundary-scalpel', name: 'Boundary Scalpel', desc: 'Dissect and delineate the limit of applicability of current theories.', zone: 'Zone B — Analytical Foundry' },
  { id: 'methodological-replicator', name: 'Methodological Replicator', desc: 'Refine experimental designs by simulating counter-controls.', zone: 'Zone B — Analytical Foundry' },
  { id: 'vulnerability-auditor', name: 'Vulnerability Auditor', desc: 'Discover systemic vulnerabilities, blindspots, and edge failures in your plan.', zone: 'Zone B — Analytical Foundry' },
  { id: 'heuristic-decoupler', name: 'Heuristic Decoupler', desc: 'Separate historical dogma from fundamental first-principles constraints.', zone: 'Zone B — Analytical Foundry' },

  // Zone C — Strategic Discovery
  { id: 'temporal-telescope', name: 'Temporal Telescope', desc: 'Project a field\'s evolution 5, 20, and 50 years into the future.', zone: 'Zone C — Strategic Discovery' },
  { id: 'serendipity-radar', name: 'Serendipity Radar', desc: 'Identify adjacent, unlooked-for breakthrough sectors relevant to you.', zone: 'Zone C — Strategic Discovery' },
  { id: 'horizon-mapper', name: 'Horizon Mapper', desc: 'Chart paths from theoretical breakthroughs to industrial utility.', zone: 'Zone C — Strategic Discovery' },
  { id: 'interdisciplinary-loom', name: 'Interdisciplinary Loom', desc: 'Weave distant academic fields together to form a novel research fabric.', zone: 'Zone C — Strategic Discovery' },
  { id: 'literature-navigator', name: 'Literature Navigator', desc: 'Reveal hidden pathways between disconnected clusters of scientific citation.', zone: 'Zone C — Strategic Discovery' },
  { id: 'cognitive-cartographer', name: 'Cognitive Cartographer', desc: 'Map out empty intellectual territory waiting for pioneering research.', zone: 'Zone C — Strategic Discovery' },
  { id: 'vanguard-signal', name: 'Vanguard Signal', desc: 'Detect micro-trends and early movements in pre-print publications.', zone: 'Zone C — Strategic Discovery' }
];

export default function InstrumentsPage() {
  const [activeZone, setActiveZone] = useState('Zone A — Idea Catalyst');

  const tabs = [
    { id: 'Zone A — Idea Catalyst', label: 'Zone A', icon: <Fingerprint className="w-4 h-4" /> },
    { id: 'Zone B — Analytical Foundry', label: 'Zone B', icon: <Workflow className="w-4 h-4" /> },
    { id: 'Zone C — Strategic Discovery', label: 'Zone C', icon: <Network className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight text-[#253D2C]">Research Instruments</h1>
        <p className="text-[#2E6F40]/80 max-w-2xl">
          Select an instrument to begin. CatalystLab will automatically search academic sources in parallel while processing your request.
        </p>
      </div>

      <div className="space-y-8">
        <div className="self-start relative bg-white/60 p-1.5 rounded-2xl inline-flex flex-wrap gap-1 border border-[#68BA7F]/20 shadow-sm backdrop-blur-md overflow-hidden overflow-x-auto max-w-full">
          {tabs.map((tab) => {
            const isActive = activeZone === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveZone(tab.id)}
                className={`relative flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-[14px] text-sm font-medium transition-colors duration-300 ${
                  isActive ? 'text-[#1E4D2B]' : 'text-[#2E6F40]/70 hover:text-[#2E6F40] hover:bg-[#68BA7F]/10'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="m3-expressive-tab"
                    className="absolute inset-0 bg-[#CFFFDC] rounded-[14px] shadow-sm border border-[#68BA7F]/20"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2 whitespace-nowrap">
                  {tab.icon}
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeZone}
              initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-[#253D2C] pb-2 flex items-center gap-3 border-b border-[#68BA7F]/30 pb-2">
                  {activeZone}
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {INSTRUMENTS.filter(i => i.zone === activeZone).map(inst => (
                    <Link 
                      key={inst.id} 
                      href={`/instruments/${inst.id}`}
                      className="p-6 rounded-[1.5rem] bg-white border border-[#68BA7F]/30 hover:border-[#68BA7F]/60 hover:shadow-lg hover:-translate-y-1 transition-all group block shadow-lg"
                    >
                      <h3 className="text-lg font-bold text-[#253D2C] mb-2 group-hover:text-[#2E6F40] transition-colors">{inst.name}</h3>
                      <p className="text-sm text-[#2E6F40]/80">{inst.desc}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
