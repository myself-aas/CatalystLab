'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { BottomNav } from '@/components/BottomNav';
import {
  Scale, BookOpen, UserCircle, AlertTriangle,
  Cpu, CreditCard, Copyright, ShieldAlert,
  Gavel, RefreshCw, XCircle, Mail, Zap
} from 'lucide-react';

export default function TermsPage() {
  const [activeSection, setActiveSection] = useState('01');

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('section');
      const scrollPosition = window.scrollY + 150;

      sections.forEach((section) => {
        if (scrollPosition >= section.offsetTop) {
          setActiveSection(section.id);
        }
      });
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: '01', title: 'Acceptance' },
    { id: '02', title: 'The Service' },
    { id: '03', title: 'User Accounts' },
    { id: '04', title: 'Acceptable Use' },
    { id: '05', title: 'API & Third-Party' },
    { id: '06', title: 'Payments' },
    { id: '07', title: 'IP Rights' },
    { id: '08', title: 'Warranties' },
    { id: '09', title: 'Liability' },
    { id: '10', title: 'Indemnity' },
    { id: '11', title: 'Disputes' },
  ];

  return (
    <div className="flex min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] font-sans">
      <Sidebar />

      <main className="flex-1 md:ml-[220px] pb-20 md:pb-0">
        <TopBar title="Terms of Service" />

        <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12">

          {/* Sticky Navigation */}
          <aside className="hidden lg:block w-64 sticky top-28 h-fit">
            <div className="space-y-1 border-l border-white/10 pl-4">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`block py-2 text-sm transition-all duration-300 ${activeSection === item.id
                      ? 'text-blue-400 font-semibold translate-x-2'
                      : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                    }`}
                >
                  <span className="mr-2 opacity-50 font-mono text-xs">{item.id}</span>
                  {item.title}
                </a>
              ))}
            </div>
          </aside>

          {/* Glassmorphic Content Container */}
          <div className="flex-1 space-y-12 relative">
            <header className="mb-16">
              <h1 className="text-5xl font-black tracking-tight mb-4 bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
                Terms of Service
              </h1>
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-[var(--text-tertiary)]">
                <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                Effective: March 18, 2026
              </div>
            </header>

            {/* 01 Acceptance */}
            <section id="01" className="scroll-mt-32 p-8 rounded-3xl bg-white/[0.03] backdrop-blur-md border border-white/10 shadow-2xl">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-blue-400">
                <Scale size={24} /> 01 Acceptance of Terms
              </h2>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                By accessing CatalystLab, you confirm you are at least **13 years of age**, have read these Terms, and agree to comply with all applicable laws. Use of the service constitutes a binding legal agreement.
              </p>
            </section>

            {/* 02 Service */}
            <section id="02" className="scroll-mt-32">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3"><Zap size={24} /> 02 Description of Service</h2>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                CatalystLab is an AI-powered research platform providing 20+ instruments, literature discovery, and session management. We reserve the right to modify or pause features to maintain service integrity.
              </p>
            </section>

            {/* 03 & 04 Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              <section id="03" className="scroll-mt-32 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                <h3 className="font-bold mb-3 flex items-center gap-2 text-purple-400"><UserCircle size={20} /> 03 User Accounts</h3>
                <p className="text-sm text-[var(--text-tertiary)]">Confidentiality of credentials is your responsibility. CatalystLab is not liable for unauthorized access resulting from your failure to protect your password.</p>
              </section>

              <section id="04" className="scroll-mt-32 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                <h3 className="font-bold mb-3 flex items-center gap-2 text-orange-400"><AlertTriangle size={20} /> 04 Acceptable Use</h3>
                <p className="text-sm text-[var(--text-tertiary)]">Prohibited: Reverse engineering, academic fraud, submitting PII without consent, or bypassing infrastructure limits.</p>
              </section>
            </div>

            {/* 05 API Keys */}
            <section id="05" className="scroll-mt-32 border-l-4 border-blue-500/20 pl-6 py-2">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3"><Cpu size={24} /> 05 API & Third-Party</h2>
              <p className="text-[var(--text-secondary)]">
                Users must provide their own **Google Gemini API keys**. We are not responsible for third-party billing, service availability (Google, CORE, Semantic Scholar), or data accuracy provided by these external sources.
              </p>
            </section>

            {/* 06 Payments */}
            <section id="06" className="scroll-mt-32 p-8 rounded-3xl bg-green-600/5 border border-green-500/10">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 text-green-400"><CreditCard size={24} /> 06 Subscriptions</h2>
              <p className="text-[var(--text-secondary)] mb-4">Payments are processed via **Paddle**. We offer a 7-day refund window for initial purchases. Plan details and pricing are subject to change with notice.</p>
            </section>

            {/* 07 Intellectual Property */}
            <section id="07" className="scroll-mt-32">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3"><Copyright size={24} /> 07 Intellectual Property</h2>
              <div className="bg-white/5 rounded-2xl p-6">
                <p className="text-[var(--text-secondary)] mb-4 italic">"You own what you create."</p>
                <p className="text-sm text-[var(--text-tertiary)]">You retain all rights to your inputs. We do NOT use your data to train AI models. CatalystLab owns the software, UI, and branding.</p>
              </div>
            </section>

            {/* 08, 09, 10 - Critical Disclaimers */}
            <div className="space-y-6">
              <section id="08" className="scroll-mt-32 p-6 rounded-xl bg-white/[0.01] border border-white/5">
                <h3 className="font-bold mb-2 uppercase text-xs tracking-widest text-[var(--text-tertiary)]">08 Disclaimer of Warranties</h3>
                <p className="text-sm text-[var(--text-secondary)]">The Service is provided **"AS IS"** and **"AS AVAILABLE"** without warranties of any kind, express or implied.</p>
              </section>

              <section id="09" className="scroll-mt-32 p-6 rounded-xl bg-red-900/10 border border-red-500/20">
                <h3 className="font-bold mb-2 uppercase text-xs tracking-widest text-red-400">09 Limitation of Liability</h3>
                <p className="text-sm text-[var(--text-secondary)]">Total liability is limited to the amount paid in the last 12 months or $50 USD. We are not liable for incidental or consequential damages.</p>
              </section>

              <section id="10" className="scroll-mt-32 p-6 rounded-xl bg-white/[0.01] border border-white/5">
                <h3 className="font-bold mb-2 uppercase text-xs tracking-widest text-[var(--text-tertiary)]">10 Indemnification</h3>
                <p className="text-sm text-[var(--text-secondary)]">You agree to defend and hold CatalystLab harmless from any claims arising from your breach of these terms or misuse of the platform.</p>
              </section>
            </div>

            {/* 11 Governing Law */}
            <section id="11" className="scroll-mt-32 p-8 rounded-3xl bg-blue-600/10 border border-blue-500/20">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 text-blue-300"><Gavel size={24} /> 11 Governing Law</h2>
              <p className="text-[var(--text-secondary)]">
                These terms are governed by the laws of **Bangladesh**. Disputes shall be settled through good-faith negotiation or binding arbitration in appropriate jurisdictions.
              </p>
            </section>

            {/* Footer Sections 12-15 */}
            <footer className="pt-12 mt-12 border-t border-white/10 grid md:grid-cols-3 gap-8">
              <div id="12">
                <h4 className="font-bold mb-2 flex items-center gap-2 text-sm"><RefreshCw size={16} /> 12 Changes</h4>
                <p className="text-xs text-[var(--text-tertiary)]">14 days notice for material updates.</p>
              </div>
              <div id="13">
                <h4 className="font-bold mb-2 flex items-center gap-2 text-sm"><XCircle size={16} /> 13 Termination</h4>
                <p className="text-xs text-[var(--text-tertiary)]">Access may be revoked for breach of terms or security risk.</p>
              </div>
              <div id="15" className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                <Mail className="text-blue-400" size={20} />
                <div>
                  <h4 className="text-xs font-bold">15 Contact</h4>
                  <p className="text-[10px] text-blue-400">legal@catalystlab.tech</p>
                </div>
              </div>
            </footer>
          </div>
        </div>
        <BottomNav />
      </main>
    </div>
  );
}