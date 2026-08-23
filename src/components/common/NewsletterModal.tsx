import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Sparkles, X, CheckCircle2, ArrowRight } from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export const NewsletterModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasDismissed, setHasDismissed] = useState(false);

  useEffect(() => {
    // Give visitors time to orient themselves before showing a non-critical prompt.
    const timer = setTimeout(() => {
      const dismissed = localStorage.getItem('catalystlab_newsletter_dismissed');
      if (!dismissed) {
        setIsOpen(true);
      }
    }, 15000);

    return () => clearTimeout(timer);
  }, []);

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
      console.error('Error saving subscriber:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-white/80 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="newsletter-modal-title"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-surface-muted border border-gray-200 rounded-3xl shadow-2xl shadow-black/50 overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-brand-slate hover:text-white bg-white/50 hover:bg-white rounded-full transition-colors z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header Accent */}
            <div className="h-2 w-full bg-gradient-to-r from-sky-500 via-emerald-400 to-purple-500" />

            <div className="p-6 sm:p-8">
              {isSuccess ? (
                <div className="text-center py-6 space-y-4">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight">                      You&apos;re on the list!
</h3>
                  <p className="text-gray-500 text-sm">
                    Keep an eye on your inbox for the latest performance insights and updates.
                  </p>
                </div>
              ) : (
                <>
                  {/* Icon & Title */}
                  <div className="mb-6">
                    <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-r from-brand-periwinkle via-brand-slate to-brand-periwinkle-light text-primary mb-4">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <h3 id="newsletter-modal-title" className="text-xl sm:text-2xl font-black text-primary tracking-tight mb-2">
                      Join the CatalystLab Newsletter
                    </h3>
                    <p className="text-sm text-muted leading-relaxed">
                      Get exclusive insights on web performance, zero-day vulnerabilities, and architectural patterns sent directly to your inbox.
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-brand-slate-hover">
                          <Mail className="h-5 w-5" />
                        </div>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@company.com"
                          className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-base font-mono text-white placeholder-brand-slate focus:border-[#38bdf8] focus:outline-none focus:ring-1 focus:ring-[#38bdf8]/30 transition-all"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-periwinkle hover:bg-white text-brand-navy py-3.5 text-sm font-mono font-bold transition-all shadow-md active:scale-98 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                    >
                      {isSubmitting ? (
                        <span>Subscribing...</span>
                      ) : (
                        <>
                          <span>Subscribe Now</span>
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </form>
                  
                  <p className="text-center text-xs text-brand-slate mt-5 font-mono">
                    No spam. Unsubscribe at any time.
                  </p>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default NewsletterModal;
