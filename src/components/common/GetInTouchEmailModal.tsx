import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Mail, 
  Send, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Building2, 
  User, 
  MessageSquare,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { submitContactInquiry } from '../../lib/firebase';
import { logger } from '../../lib/logger';

interface GetInTouchEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: string;
  sourceContext?: string;
}

export interface GetInTouchModalEventDetail {
  topic?: string;
  sourceContext?: string;
}

export const openGetInTouchModal = (topic?: string, sourceContext?: string) => {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent<GetInTouchModalEventDetail>('catalyst:open-get-in-touch', {
      detail: { topic, sourceContext }
    });
    window.dispatchEvent(event);
  }
};

export const GetInTouchEmailModal: React.FC<GetInTouchEmailModalProps> = ({
  isOpen,
  onClose,
  initialTopic = 'general',
  sourceContext = 'get-in-touch-popup'
}) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');
  const [topic, setTopic] = useState(initialTopic);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [inquiryId, setInquiryId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Reset form states when modal opens
  useEffect(() => {
    if (isOpen) {
      setSubmitted(false);
      setErrorMessage('');
      setTopic(initialTopic);
    }
  }, [isOpen, initialTopic]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage('Please enter a valid email format (e.g., name@company.com).');
      return;
    }

    setIsSubmitting(true);

    try {
      const fullMessage = message.trim() 
        ? `[Topic: ${topic}] ${message.trim()}`
        : `[Topic: ${topic}] Inquiry submitted via Get in Touch pop-up.`;

      const id = await submitContactInquiry({
        email: email.trim().toLowerCase(),
        name: name.trim() || undefined,
        company: company.trim() || undefined,
        message: fullMessage,
        source: sourceContext
      });

      setInquiryId(id);
      setSubmitted(true);
    } catch (err: unknown) {
      logger.error('Failed to submit email inquiry:', err);
      setErrorMessage('Could not complete submission. Please verify your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const topics = [
    { id: 'general', label: 'General Inquiry' },
    { id: 'enterprise_api', label: 'Enterprise API & SLA' },
    { id: 'audit_remediation', label: 'Audit Remediation' },
    { id: 'telemetry_digest', label: 'Weekly Telemetry Digest' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          id="get-in-touch-modal-root"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        >
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#070b12]/80 backdrop-blur-md cursor-pointer"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="relative w-full max-w-lg rounded-3xl border border-border bg-[#0d1b2a] p-6 sm:p-8 text-primary-foreground shadow-2xl z-10 overflow-hidden"
          >
            {/* Ambient Radial Highlight */}
            <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-[#38bdf8]/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-[#34d399]/10 blur-3xl" />

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-5 right-5 rounded-full p-2 text-muted-foreground hover:bg-[#162a45] hover:text-primary-foreground transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Close Pop-up"
            >
              <X className="h-5 w-5" />
            </button>

            {submitted ? (
              /* Success State */
              <div className="py-6 text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-[#34d399] border border-emerald-500/40 shadow-inner">
                  <CheckCircle2 className="h-8 w-8" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl sm:text-2xl font-black text-primary-foreground tracking-tight">
                    Thank You for Getting in Touch!
                  </h3>
                  <p className="text-sm sm:text-base text-[#8ea8c3] max-w-xs mx-auto leading-relaxed">
                    Your contact information has been stored in the database. Our telemetry team will reach out shortly.
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-[#070b12]/60 px-3.5 py-1.5 font-mono text-sm text-emerald-400">
                  <span>Reference ID:</span>
                  <span className="font-bold text-primary-foreground">{inquiryId || 'inq_confirmed'}</span>
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full rounded-xl bg-[#c5d3e8] hover:bg-background text-foreground py-3 text-sm font-mono font-bold transition-all shadow-md active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Done & Close
                  </button>
                </div>
              </div>
            ) : (
              /* Form State */
              <div>
                {/* Header */}
                <div className="mb-5 space-y-1.5 pr-6">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-[#38bdf8]/40 bg-[#38bdf8]/10 px-3 py-0.5 text-sm font-mono text-[#38bdf8]">
                    <Sparkles className="h-3 w-3" />
                    <span>Direct Telemetry Contact</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-primary-foreground tracking-tight">
                    Get in Touch with CatalystLab
                  </h3>
                  <p className="text-sm text-[#8ea8c3] leading-relaxed">
                    Leave your email to discuss synthetic audits, enterprise API access, or receive weekly performance digests.
                  </p>
                </div>

                {errorMessage && (
                  <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-950/40 px-3.5 py-2 text-sm text-rose-300">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Topic Selector Pills */}
                  <div>
                    <label className="block text-sm font-mono font-semibold uppercase tracking-wider text-[#8ea8c3] mb-1.5">
                      Inquiry Topic
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {topics.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setTopic(t.id)}
                          className={`rounded-xl px-2.5 py-1.5 text-left text-sm font-mono transition-all border cursor-pointer ${
                            topic === t.id
                              ? 'border-[#38bdf8] bg-[#38bdf8]/15 text-primary-foreground font-bold shadow-xs'
                              : 'border-border bg-background/60 text-[#8ea8c3] hover:border-[#415a77] hover:text-primary-foreground'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Email Input (Required) */}
                  <div>
                    <label className="block text-sm font-mono font-semibold uppercase tracking-wider text-[#8ea8c3] mb-1">
                      Work Email <span className="text-[#38bdf8]">*</span>
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#8ea8c3]">
                        <Mail className="h-4 w-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        className="w-full rounded-xl border border-border bg-background py-2.5 pl-9 pr-3 text-sm sm:text-base font-mono text-primary-foreground placeholder-[#8ea8c3] focus:border-[#38bdf8] focus:outline-none focus:ring-1 focus:ring-[#38bdf8]/30 transition-all"
                      />
                    </div>
                  </div>

                  {/* Name & Company (Optional 2-Col Grid) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-mono font-semibold uppercase tracking-wider text-[#8ea8c3] mb-1">
                        Your Name (Optional)
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#8ea8c3]">
                          <User className="h-3.5 w-3.5" />
                        </div>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Alex Mercer"
                          className="w-full rounded-xl border border-border bg-background py-2 pl-8 pr-3 text-sm font-mono text-primary-foreground placeholder-[#8ea8c3] focus:border-[#38bdf8] focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-mono font-semibold uppercase tracking-wider text-[#8ea8c3] mb-1">
                        Company / Domain (Optional)
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#8ea8c3]">
                          <Building2 className="h-3.5 w-3.5" />
                        </div>
                        <input
                          type="text"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          placeholder="acme-corp.com"
                          className="w-full rounded-xl border border-border bg-background py-2 pl-8 pr-3 text-sm font-mono text-primary-foreground placeholder-[#8ea8c3] focus:border-[#38bdf8] focus:outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Message Input (Optional) */}
                  <div>
                    <label className="block text-sm font-mono font-semibold uppercase tracking-wider text-[#8ea8c3] mb-1">
                      Message / Notes (Optional)
                    </label>
                    <div className="relative">
                      <textarea
                        rows={2}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Tell us what you're building or what questions you have..."
                        className="w-full rounded-xl border border-border bg-background p-2.5 text-sm font-mono text-primary-foreground placeholder-[#8ea8c3] focus:border-[#38bdf8] focus:outline-none transition-all resize-none"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#c5d3e8] hover:bg-background text-foreground py-3 text-sm font-mono font-bold transition-all shadow-md active:scale-[0.98] disabled:opacity-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-foreground" />
                        <span>Saving to Database...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5 text-foreground" />
                        <span>Submit & Store in Database</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Privacy Badge */}
                <div className="mt-4 flex items-center justify-center gap-1.5 text-sm font-mono text-[#8ea8c3]">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#34d399]" />
                  <span>Encrypted Firestore storage • Zero spam guarantee</span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default GetInTouchEmailModal;
