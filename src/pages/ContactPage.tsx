import React, { useState } from 'react';
import { 
  ArrowRight,
  Send,
  RotateCw,
  Cpu,
  Layers,
  FileCheck,
  ShieldCheck,
  Clock,
  Globe,
  Activity
} from 'lucide-react';
import { PageTransition, LazyReveal } from '../components/common/LazyAnimate';
import { motion } from 'motion/react';
import { SEOHead } from '../components/common/SEOHead';
import { submitContactInquiry } from '../lib/firebase';
import { logger } from '../lib/logger';
import { GlobalFaqSection } from '../components/common/GlobalFaqSection';
import { MASTER_FAQ_CATEGORIES } from '../data/faqData';
import type { FaqCategory } from '../components/common/GlobalFaqSection';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const [department, setDepartment] = useState('technical');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const departments = [
    { id: 'technical', label: 'Technical Audit' },
    { id: 'enterprise', label: 'Enterprise Engines' },
    { id: 'billing', label: 'Billing' },
    { id: 'security', label: 'Security' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const id = await submitContactInquiry({
        name,
        email,
        department,
        message,
        metadata: {
          targetUrl: targetUrl || 'Not provided',
          priority: 'medium',
          attachDiagnostics: true
        }
      });
      logger.info('Support ticket transmitted via ContactPage form', { ticketId: id });
      setTicketId(id);
      setSubmitted(true);
    } catch (error) {
      logger.error('Failed to transmit support ticket', error as Error);
      alert('Transmission failed. Please attempt again or reach out to support@catalystlab.tech directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <SEOHead 
        title="Contact Engineering | CatalystLab" 
        description="Direct line to CatalystLab engineering. No sales fluff. Support, enterprise API keys, and custom technical integrations."
      />

      <div data-theme="dark" className="min-h-[100dvh] pt-24 pb-20 px-4 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto flex flex-col gap-16 lg:gap-24">
        
        {/* Split Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start mt-8">
          
          {/* Left Column: Copy & Benchmarks */}
          <div className="flex flex-col gap-8">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-[-0.035em] leading-[1.12] font-semibold tracking-[-0.04em] text-white leading-[1.05] mb-6">
                Direct line to our engineering team.
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed tracking-[-0.01em]">
                No sales fluff. Whether you're debugging an OWASP flag, setting up CI/CD pipeline triggers, or upgrading to Enterprise, you speak directly with the engineers building the engines.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-white/10">
              <div className="flex flex-col gap-2">
                <Clock className="size-5 text-[#0066FF]" />
                <span className="text-2xl font-semibold text-white tracking-[-0.02em]">&lt; 18m</span>
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Avg Response</span>
              </div>
              <div className="flex flex-col gap-2">
                <Globe className="size-5 text-[#00D2FF]" />
                <span className="text-2xl font-semibold text-white tracking-[-0.02em]">38</span>
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Edge PoPs</span>
              </div>
              <div className="flex flex-col gap-2">
                <Activity className="size-5 text-[#00F298]" />
                <span className="text-2xl font-semibold text-white tracking-[-0.02em]">99.99%</span>
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">P95 SLA</span>
              </div>
            </div>
          </div>

          {/* Right Column: Floating Glass Form */}
          <div className="relative group">
            <div className="pointer-events-none absolute -inset-4 bg-gradient-to-br from-[#0066FF]/20 to-transparent opacity-50 blur-3xl rounded-[3rem] z-0 transition-opacity duration-500 group-hover:opacity-70" />
            
            <div className="relative z-10 ds-card bg-surface/90 backdrop-blur-xl border-border rounded-2xl p-6 sm:p-8 shadow-2xl">
              {submitted ? (
                <div className="flex flex-col items-center justify-center text-center py-12 gap-4">
                  <div className="size-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2">
                    <Send className="size-8" />
                  </div>
                  <h3 className="text-2xl font-semibold text-white tracking-[-0.02em]">Transmission Complete</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
                    Ticket <span className="text-white font-mono">{ticketId}</span> dispatched to the {department} queue. A receipt has been sent to {email}.
                  </p>
                  <button 
                    onClick={() => {
                      setSubmitted(false);
                      setMessage('');
                    }}
                    className="mt-6 px-6 py-2.5 rounded-full bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Name</label>
                      <input 
                        type="text" 
                        required 
                        value={name} 
                        onChange={e => setName(e.target.value)}
                        placeholder="Jane Doe"
                        className="ds-input text-white bg-surface border-border focus:border-primary focus:ring-primary"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Work Email</label>
                      <input 
                        type="email" 
                        required 
                        value={email} 
                        onChange={e => setEmail(e.target.value)}
                        placeholder="jane@company.com"
                        className="ds-input text-white bg-surface border-border focus:border-primary focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Topic</label>
                    <div className="grid grid-cols-2 gap-2 relative">
                      {departments.map((dep) => (
                        <button
                          key={dep.id}
                          type="button"
                          onClick={() => setDepartment(dep.id)}
                          className={`relative px-4 py-3 rounded-xl text-sm font-medium transition-colors text-left overflow-hidden border ${
                            department === dep.id 
                              ? 'text-[#0066FF] border-[#0066FF]/30' 
                              : 'bg-surface text-muted-foreground border-border hover:border-border-strong hover:text-white'
                          }`}
                        >
                          {department === dep.id && (
                            <motion.div
                              layoutId="contact-active-topic"
                              className="absolute inset-0 bg-[#0066FF]/10 z-0"
                              transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                            />
                          )}
                          <span className="relative z-10">{dep.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Target Domain (Optional)</label>
                    <input 
                      type="text" 
                      value={targetUrl} 
                      onChange={e => setTargetUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="ds-input text-white bg-surface border-border focus:border-primary focus:ring-primary"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Message</label>
                    <textarea 
                      required 
                      rows={4} 
                      value={message} 
                      onChange={e => setMessage(e.target.value)}
                      placeholder="How can we help?"
                      className="ds-input text-white bg-surface border-border focus:border-primary focus:ring-primary resize-none"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="ds-btn w-full bg-white text-black hover:bg-neutral-200 font-semibold shadow-lg shadow-white/5 active:scale-[0.98] mt-2"
                  >
                    {isSubmitting ? (
                      <>
                        <RotateCw className="size-4 animate-spin" />
                        Transmitting...
                      </>
                    ) : (
                      <>
                        Submit Request
                        <ArrowRight className="size-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* FAQ Section mapped from existing */}
        <LazyReveal direction="up">
          <div className="border-t border-white/10 pt-16 mt-8">
             <GlobalFaqSection  
                categories={MASTER_FAQ_CATEGORIES.slice(0, 3)} 
                title="Instant Answers & Diagnostic Troubleshooting" 
                subtitle="Quick solutions to common technical issues, API configurations, and SLA questions." 
             />
          </div>
        </LazyReveal>

      </div>
    </PageTransition>
  );
};

export default ContactPage;
