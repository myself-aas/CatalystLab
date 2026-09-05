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
            className="relative w-full bg-background border border-border rounded-3xl shadow-2xl shadow-black/60 overflow-hidden text-primary-foreground"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 rounded-full transition-colors z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header Accent */}
            <div className="h-2 w-full bg-gradient-to-r from-cyan-400 via-cyan-500 to-emerald-400" />

            <div className="p-6 sm:p-8">
              {isSuccess ? (
                <div className="text-center py-6 space-y-4">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-primary-foreground tracking-tight">
                    You&apos;re on the list!
                  </h3>
                  <p className="text-muted-foreground text-sm">
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
                    <h3 id="newsletter-modal-title" className="text-xl sm:text-2xl font-black text-primary-foreground tracking-tight mb-2">
                      Join the CatalystLab Newsletter
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Get exclusive insights on web performance, zero-day vulnerabilities, and architectural patterns sent directly to your inbox.
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="newsletter-email" className="ds-label block mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                          <Mail className="h-4 w-4" />
                        </div>
                        <input
                          id="newsletter-email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="developer@enterprise.io"
                          className="ds-input pl-10 font-mono text-sm bg-primary/90 text-primary-foreground focus:ring-2 focus:ring-cyan-400"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="ds-btn w-full bg-gradient-to-r from-cyan-400 to-cyan-500 text-foreground font-bold text-sm tracking-wide shadow-lg shadow-cyan-500/20 active:scale-[0.98]"
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
