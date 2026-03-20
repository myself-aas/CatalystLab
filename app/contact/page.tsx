'use client';

import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { BottomNav } from '@/components/BottomNav';
import { Mail, Linkedin, Github, Twitter, Globe, MessageSquare, Send } from 'lucide-react';

export default function ContactPage() {
  const contactLinks = [
    {
      label: 'Professional Email',
      value: 'shuvo.1807016@bau.edu.bd', // I will swap this for your legal/contact one as requested
      display: 'contact@catalystlab.tech',
      icon: <Mail className="text-blue-400" />,
      href: 'mailto:contact@catalystlab.tech',
    },
    {
      label: 'LinkedIn',
      value: 'Professional Network',
      display: 'in/me-aas',
      icon: <Linkedin className="text-blue-500" />,
      href: 'https://www.linkedin.com/in/me-aas/',
    },
    {
      label: 'GitHub',
      value: 'Project Repository',
      display: 'github.com/myself-aas',
      icon: <Github className="text-white" />,
      href: 'https://github.com/myself-aas/',
    },
    {
      label: 'X (Twitter)',
      value: 'Latest Updates',
      display: '@myself_aas',
      icon: <Twitter className="text-sky-400" />,
      href: 'https://x.com/myself_aas',
    },
  ];

  return (
    <div className="flex min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] font-sans">
      <Sidebar />

      <main className="flex-1 md:ml-[220px] pb-20 md:pb-0">
        <TopBar title="Get in Touch" />

        <div className="max-w-6xl mx-auto px-6 py-12">
          <header className="mb-16 text-center lg:text-left">
            <h1 className="text-5xl font-black tracking-tight mb-4 bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
              Contact Us
            </h1>
            <p className="text-lg text-[var(--text-tertiary)] max-w-2xl">
              Have questions about CatalystLab, research instruments, or potential collaborations?
              Reach out through any of the channels below.
            </p>
          </header>

          <div className="grid lg:grid-cols-3 gap-8">

            {/* Left Column: Connection Cards */}
            <div className="lg:col-span-1 space-y-4">
              {contactLinks.map((link, idx) => (
                <a
                  key={idx}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md hover:bg-white/[0.06] hover:border-blue-500/50 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-white/5 group-hover:scale-110 transition-transform">
                      {link.icon}
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] font-bold">
                        {link.label}
                      </p>
                      <p className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-white transition-colors">
                        {link.display}
                      </p>
                    </div>
                  </div>
                </a>
              ))}

              {/* Portfolio Link Special Card */}
              <a
                href="https://myself-aas.github.io/portfolio/"
                target="_blank"
                className="flex items-center justify-between p-5 rounded-2xl bg-blue-600/10 border border-blue-500/20 group hover:bg-blue-600/20 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Globe size={20} className="text-blue-400" />
                  <span className="text-sm font-bold">View Portfolio</span>
                </div>
                <div className="text-blue-400 group-hover:translate-x-1 transition-transform">→</div>
              </a>
            </div>

            {/* Right Column: Contact Form UI */}
            <div className="lg:col-span-2 p-8 md:p-10 rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-hidden">
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full" />

              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <MessageSquare className="text-blue-400" /> Send a Message
                </h3>

                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-[var(--text-tertiary)] ml-1">Full Name</label>
                      <input
                        type="text"
                        placeholder="Ashif Ahmed"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-[var(--text-tertiary)] ml-1">Email Address</label>
                      <input
                        type="email"
                        placeholder="you@example.com"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-[var(--text-tertiary)] ml-1">Message</label>
                    <textarea
                      rows={5}
                      placeholder="How can we help you with your research?"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
                    />
                  </div>

                  <button className="w-full md:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-600/20">
                    <Send size={18} />
                    Send Message
                  </button>
                </form>
              </div>
            </div>

          </div>

          <footer className="mt-16 pt-8 border-t border-white/10 text-center">
            <p className="text-sm text-[var(--text-tertiary)] italic">
              Based in Dhaka, Bangladesh — Operating globally.
            </p>
          </footer>
        </div>

        <BottomNav />
      </main>
    </div>
  );
}