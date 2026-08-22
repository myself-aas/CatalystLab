import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LazyReveal } from '../common/LazyAnimate';
import { ChevronDown, HelpCircle, ArrowRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FaqItem {
  question: string;
  answer: string;
  tag: string;
}

export const FaqAccordion: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      tag: 'Engines',
      question: 'How does CatalystLab run 8 diagnostic engines in parallel?',
      answer: 'When an audit is initiated, our backend dispatches 8 asynchronous micro-services concurrently (AST hygiene, OWASP defense headers, 42-PoP edge TTFB, Sustainable Web carbon modeling, DOM tree recursion, and /llms.txt AI search readiness). All 8 engines execute in parallel, synthesizing results in under 2 seconds.'
    },
    {
      tag: 'CI/CD',
      question: 'Can I integrate CatalystLab into GitHub Actions or CI/CD pipelines?',
      answer: 'Yes. CatalystLab provides a lightweight CLI tool (`npx catalystlab audit https://example.com`) and REST API endpoints (`/api/run-engine`). You can automate pull request regression tests and fail builds if security scores or Core Web Vitals fall below thresholds.'
    },
    {
      tag: 'AI Readiness',
      question: 'What is the Generative Engine Optimization (LLMO) index?',
      answer: 'The LLMO index evaluates how easily your web domain can be ingested by AI search engines like Perplexity, ChatGPT, and Claude. It validates /llms.txt manifests, robots.txt bot rules, Schema.org JSON-LD structured data, and semantic hierarchy for vector chunking.'
    },
    {
      tag: 'Security',
      question: 'Does CatalystLab store or inspect private application data?',
      answer: 'No. CatalystLab operates strictly via non-invasive synthetic telemetry probes against public network interfaces and headers. We never inspect user sessions, passwords, cookies, or private payloads.'
    }
  ];

  const toggleFaq = (index: number) => {
    setOpenIdx(openIdx === index ? null : index);
  };

  return (
    <section className="py-12 lg:py-14 bg-brand-navy text-white relative overflow-hidden border-b border-brand-slate/30">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-8">
          <LazyReveal direction="up">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-slate/50 bg-brand-oxford px-3.5 py-1 text-sm font-mono text-brand-periwinkle mb-2.5">
              <HelpCircle className="h-3 w-3 text-[#38bdf8]" />
              <span>Developer FAQ</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-sm sm:text-base text-[#8ea8c3] max-w-lg mx-auto leading-relaxed">
              Key answers regarding our 8-engine architecture, CI/CD integrations, and security guarantees.
            </p>
          </LazyReveal>
        </div>

        {/* Clean Accordion List */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="bg-brand-oxford border border-brand-slate/30 rounded-2xl overflow-hidden transition-all duration-300 hover:border-sky-500/50 hover:shadow-xl hover:shadow-sky-900/10 hover:-translate-y-0.5"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-[#112239]/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-[#38bdf8] bg-brand-navy px-2 py-0.5 rounded border border-brand-slate/40 shrink-0 font-bold">
                      {faq.tag}
                    </span>
                    <span className="text-sm sm:text-base font-bold text-white leading-snug">
                      {faq.question}
                    </span>
                  </div>

                  <div className={`p-1 rounded-lg bg-brand-navy text-brand-periwinkle border border-brand-slate/40 transition-transform duration-200 shrink-0 ${
                    isOpen ? 'rotate-180 text-[#38bdf8]' : ''
                  }`}>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <div className="p-4 pt-1 text-sm text-[#8ea8c3] leading-relaxed border-t border-brand-slate/20 bg-[#091422]/60">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Clean Docs Link */}
        <div className="mt-6 pt-4 border-t border-brand-slate/30 flex items-center justify-between text-sm font-mono text-[#8ea8c3]">
          <div className="flex items-center gap-2">
            <BookOpen className="h-3.5 w-3.5 text-[#38bdf8]" />
            <span>Looking for detailed API specs?</span>
          </div>
          <Link
            to="/docs"
            className="text-[#38bdf8] hover:text-white font-bold flex items-center gap-1 text-sm transition-colors"
          >
            <span>Documentation</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

      </div>
    </section>
  );
};

export default FaqAccordion;

