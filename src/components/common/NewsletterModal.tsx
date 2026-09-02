import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Sparkles, X, CheckCircle2, ArrowRight } from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { logger } from '../../lib/logger';

export interface NewsletterModalProps {
  defaultOpen?: boolean;
}

export const NewsletterModal: React.FC<NewsletterModalProps> = ({ defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasDismissed, setHasDismissed] = useState(false);

  useEffect(() => {
    if (defaultOpen) {
      setIsOpen(true);
      return;
    }
    // Give visitors ample time (45s) to explore before showing a discreet prompt.
    const timer = setTimeout(() => {
      const dismissed = localStorage.getItem('catalystlab_newsletter_dismissed');
      if (!dismissed) {
        setIsOpen(true);
      }
    }, 45000);

    return () => clearTimeout(timer);
  }, [defaultOpen]);

  const handleClose = () => {
    setIsOpen(false);
    setHasDismissed(true);
    localStorage.setItem('catalystlab_newsletter_dismissed', 'true');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      if (db) {
        await addDoc(collection(db, 'newsletter_subscribers'), {
          email,
          source: 'newsletter_modal',
          subscribedAt: serverTimestamp(),
        });
      } else {
        // Fallback for demo
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      setIsSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 3000);
    } catch (error) {
      logger.error('Error saving subscriber:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full p-4 sm:p-0 pointer-events-auto">
          {/* Floating Card Content */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="newsletter-modal-title"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full bg-[#0d1b2a] border border-[#415a77]/60 rounded-3xl shadow-2xl shadow-black/60 overflow-hidden text-white"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-full transition-colors z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header Accent */}
            <div className="h-2 w-full bg-gradient-to-r from-[#00F0FF] via-[#06B6D4] to-[#00FF66]" />

            <div className="p-6 sm:p-8">
              {isSuccess ? (
                <div className="text-center py-6 space-y-4">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    You&apos;re on the list!
                  </h3>
                  <p className="text-slate-400 text-sm">
                    Keep an eye on your inbox for the latest performance insights and updates.
                  </p>
                </div>
              ) : (
                <>
                  {/* Icon & Title */}
                  <div className="mb-6">
                    <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 mb-4">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <h3 id="newsletter-modal-title" className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2">
                      Join the CatalystLab Newsletter
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Get exclusive insights on web performance, zero-day vulnerabilities, and architectural patterns sent directly to your inbox.
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="newsletter-email" className="block text-xs font-mono font-bold text-slate-300 mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                          <Mail className="h-4 w-4" />
                        </div>
                        <input
                          id="newsletter-email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="developer@enterprise.io"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/90 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#00F0FF] focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#00F0FF] to-[#06B6D4] text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
                    >
                      <span>{isSubmitting ? 'Joining...' : 'Subscribe to Telemetry'}</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
