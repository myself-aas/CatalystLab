import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      <section className="border-b border-slate-800 bg-slate-900/40 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="text-3xl font-extrabold text-white">Contact & Support</h1>
          <p className="mt-2 text-sm text-slate-400">
            Have questions about audit results, enterprise custom engines, or API access? Reach out directly.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-xl px-4 py-10 sm:px-6 lg:px-8">
        {submitted ? (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-8 text-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-white">Message Received!</h2>
            <p className="mt-1 text-xs text-slate-400">Our engineering team will respond within 24 hours.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Your Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@company.com"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Message / Inquiries
              </label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your question or diagnostic feature request..."
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-500 py-3 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/20"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Send Message</span>
            </button>
          </form>
        )}
      </main>
    </div>
  );
};
