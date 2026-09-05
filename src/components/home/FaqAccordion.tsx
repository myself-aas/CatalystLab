import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus, Terminal } from 'lucide-react';
import { SectionHeader } from './SectionHeader';
import { CopyButton } from '../ui/CopyButton';
import { onSpotlightMouseMove } from '../../hooks/useSpotlight';

const FAQ_ITEMS = [
  {
    category: 'Edge Mesh',
    q: 'How do you measure TTFB without an SDK?',
    a: 'We resolve your domain via 42 Anycast PoPs simultaneously, measuring the exact TCP and TLS 1.3 0-RTT handshake latencies from the edge, exactly as your users experience them.',
  },
  {
    category: 'Security',
    q: 'Does this replace OWASP ZAP?',
    a: 'No. CatalystLab acts as a rapid, passive diagnostic layer. We inspect transport security, strict CSP nonces, and headers. We do not perform active penetration testing or payload injection.',
  },
  {
    category: 'AI Schema',
    q: 'What is the LLM-Kinase engine looking for?',
    a: 'It scans for valid /llms.txt manifests, checks robots.txt for AI crawler policies (like GPTBot), and evaluates your DOM depth and JSON-LD for RAG ingestion readiness.',
  },
  {
    category: 'Billing',
    q: 'How is the Enterprise API billed?',
    a: 'Enterprise API access is billed per 10,000 synthetic requests. You can trigger programmatic audits during your CI/CD pipeline via GitHub Actions or our CLI.',
  },
];

const CATEGORIES = ['All', 'Edge Mesh', 'Security', 'AI Schema', 'Billing'];

const CURL_SNIPPET = `curl -sSL https://api.catalystlab.tech/v2/audit \\
    -H "Authorization: Bearer cl_live_xxx" \\
    -d '{"domain": "target.io", "engines": "all", "auto_patch": true}'`;

export const FaqAccordion: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filteredFaqs = FAQ_ITEMS.filter(
    (item) => activeCategory === 'All' || item.category === activeCategory
  );

  return (
    <section className="relative overflow-hidden py-16 md:py-24 lg:py-32">
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <SectionHeader
          eyebrow={
            <>
              <Terminal className="size-3.5 text-[#0066FF]" />
              <span>Programmatic Access</span>
            </>
          }
          title="Interactive technical FAQ."
        />

        <div className="lg:grid lg:grid-cols-12 gap-8 mt-12">
          {/* Left Column: FAQ (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Category Pills */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    setOpenIndex(null);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                    activeCategory === cat
                      ? 'bg-white text-black border-white'
                      : 'bg-white/5 text-muted-foreground border-white/10 hover:border-white/30 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Accordions */}
            <div className="flex flex-col gap-3">
              {filteredFaqs.map((faq, idx) => {
                const isOpen = openIndex === idx;
                return (
                  <div
                    key={idx}
                    className="border border-white/10 bg-surface rounded-2xl overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between p-4 sm:p-5 text-left"
                    >
                      <span className="font-semibold text-white sm:text-lg tracking-[-0.01em]">
                        {faq.q}
                      </span>
                      <div className="shrink-0 ml-4 flex items-center justify-center size-6 rounded-full bg-white/5 text-white/50">
                        {isOpen ? <Minus className="size-3.5 text-white" /> : <Plus className="size-3.5" />}
                      </div>
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        >
                          <div className="px-4 sm:px-5 pb-5 text-muted-foreground text-sm leading-relaxed border-t border-white/5 pt-4">
                            {faq.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Code Playground (7 cols) */}
          <div className="lg:col-span-7 mt-8 lg:mt-0">
            <div
              onMouseMove={onSpotlightMouseMove}
              className="bg-background border border-white/10 rounded-2xl md:rounded-3xl overflow-hidden h-full flex flex-col shadow-2xl relative group transition-[transform,border-color] duration-200 ease-out hover:-translate-y-[2px] hover:border-white/25"
            >
              <div
                className="pointer-events-none absolute inset-0 rounded-2xl md:rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ background: 'var(--glow-card-subsurface)' }}
              />
              {/* Terminal Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-surface relative z-10">
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-full bg-red-500/20 border border-red-500/50" />
                  <div className="size-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                  <div className="size-3 rounded-full bg-green-500/20 border border-green-500/50" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-white/10 text-white text-xs font-mono rounded-md">
                    Bash
                  </div>
                </div>
              </div>

              {/* Terminal Body */}
              <div className="p-6 sm:p-8 flex-1 overflow-x-auto no-scrollbar relative z-10">
                <pre className="font-mono text-xs sm:text-[13px] leading-relaxed text-[#00D2FF]">
                  <code>
<span className="text-white/40">$</span> curl -sSL https://api.catalystlab.tech/v2/audit \
    -H <span className="text-emerald-400">"Authorization: Bearer cl_live_xxx"</span> \
    -d <span className="text-emerald-400">'{'{"domain": "target.io", "engines": "all", "auto_patch": true}'}'</span>
                  </code>
                </pre>
              </div>

              {/* Terminal Footer */}
              <div className="p-4 border-t border-white/10 bg-surface flex justify-end relative z-10">
                <CopyButton
                  text={CURL_SNIPPET}
                  variant="terminal"
                  label="Copy Command"
                  copiedLabel="Copied!"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FaqAccordion;
