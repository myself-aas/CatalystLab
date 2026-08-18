import React, { useState } from 'react';
<<<<<<< HEAD
import { Send, CheckCircle2, MessageSquare, Mail } from 'lucide-react';
=======
import { Send, CheckCircle2 } from 'lucide-react';
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-[#f8fafc] pb-20 text-[#0b192c] selection:bg-[#c5d3e8] selection:text-[#0b192c]">
      <section className="border-b border-[#e2e8f0] bg-white px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#415a77]/30 bg-[#415a77]/10 px-3.5 py-1 text-xs font-semibold text-[#415a77] mb-3">
            <Mail className="h-3.5 w-3.5" />
            <span>Developer Inquiries & Support</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#0b192c] tracking-tight sm:text-4xl">
            Contact & Support
          </h1>
          <p className="mt-2 text-sm text-[#415a77]">
            Have questions about audit results, enterprise custom engines, or programmatic API access? Reach out directly.
=======
    <div className="min-h-screen bg-slate-950 pb-20">
      <section className="border-b border-slate-800 bg-slate-900/40 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="text-3xl font-extrabold text-white">Contact & Support</h1>
          <p className="mt-2 text-sm text-slate-400">
            Have questions about audit results, enterprise custom engines, or API access? Reach out directly.
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-xl px-4 py-10 sm:px-6 lg:px-8">
        {submitted ? (
<<<<<<< HEAD
          <div className="rounded-3xl border border-[#415a77]/30 bg-[#0b192c] p-8 text-center text-[#f8fafc] shadow-xl">
            <CheckCircle2 className="h-10 w-10 text-[#c5d3e8] mx-auto mb-3" />
            <h2 className="text-xl font-bold text-[#f8fafc]">Message Received!</h2>
            <p className="mt-2 text-xs text-[#c5d3e8]">Our engineering team will respond within 24 hours.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-3xl border border-[#415a77]/30 bg-[#0b192c] p-6 sm:p-8 space-y-5 shadow-2xl text-[#f8fafc]">
            <div>
              <label className="block text-xs font-semibold text-[#c5d3e8] uppercase tracking-wider mb-2">
=======
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-8 text-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-white">Message Received!</h2>
            <p className="mt-1 text-xs text-slate-400">Our engineering team will respond within 24 hours.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
                Your Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@company.com"
<<<<<<< HEAD
                className="w-full rounded-xl border border-[#415a77]/40 bg-[#152238] px-4 py-3 text-sm text-[#f8fafc] placeholder:text-[#c5d3e8]/40 focus:border-[#c5d3e8] focus:outline-none font-mono"
=======
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none"
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
              />
            </div>

            <div>
<<<<<<< HEAD
              <label className="block text-xs font-semibold text-[#c5d3e8] uppercase tracking-wider mb-2">
=======
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
                Message / Inquiries
              </label>
              <textarea
                required
<<<<<<< HEAD
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your question, custom engine requirement, or diagnostic request..."
                className="w-full rounded-xl border border-[#415a77]/40 bg-[#152238] px-4 py-3 text-sm text-[#f8fafc] placeholder:text-[#c5d3e8]/40 focus:border-[#c5d3e8] focus:outline-none"
=======
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your question or diagnostic feature request..."
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none"
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
              />
            </div>

            <button
              type="submit"
<<<<<<< HEAD
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#415a77] py-3.5 text-xs font-bold text-[#f8fafc] hover:bg-[#33475e] transition-all shadow-md active:scale-98"
            >
              <Send className="h-4 w-4 text-[#c5d3e8]" />
=======
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-500 py-3 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/20"
            >
              <Send className="h-3.5 w-3.5" />
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
              <span>Send Message</span>
            </button>
          </form>
        )}
      </main>
    </div>
  );
};
<<<<<<< HEAD

=======
>>>>>>> 27f0589ba0205dcb9d45199d494f95d0965f28b4
