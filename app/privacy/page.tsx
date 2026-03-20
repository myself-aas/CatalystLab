'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { BottomNav } from '@/components/BottomNav';
import { Shield, Lock, Eye, Globe, UserCheck, Mail } from 'lucide-react';

export default function PrivacyPage() {
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
    { id: '01', title: 'Collection' },
    { id: '02', title: 'Usage' },
    { id: '03', title: 'Storage' },
    { id: '04', title: 'Sharing' },
    { id: '05', title: 'Cookies' },
    { id: '06', title: 'Your Rights' },
    { id: '07', title: 'Children' },
    { id: '08', title: 'International' },
    { id: '09', title: 'Security' },
  ];

  return (
    <div className="flex min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] font-sans">
      <Sidebar />

      <main className="flex-1 md:ml-[220px] pb-20 md:pb-0">
        <TopBar title="Privacy Protocol" />

        <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12">

          {/* Interactive Sticky Navigation */}
          <aside className="hidden lg:block w-56 sticky top-28 h-fit">
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
          <div className="flex-1 space-y-10 relative">
            <header className="mb-16">
              <h1 className="text-5xl font-black tracking-tight mb-4 bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
                Privacy Policy
              </h1>
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-[var(--text-tertiary)]">
                <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                Last Modified: March 18, 2026
              </div>
            </header>

            {/* Section 01 & 02 */}
            <section id="01" className="scroll-mt-32 p-8 rounded-3xl bg-white/[0.03] backdrop-blur-md border border-white/10 shadow-2xl">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-blue-400">
                <Eye size={24} /> 01 Information Collection
              </h2>
              <div className="grid sm:grid-cols-2 gap-6 leading-relaxed text-[var(--text-secondary)]">
                <div className="space-y-3">
                  <h3 className="font-semibold text-white">Directly Provided</h3>
                  <p className="text-sm">Account details, Research abstracts, API keys (local), and payment info via Paddle.</p>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-white">Automated Systems</h3>
                  <p className="text-sm">Usage logs, IP addresses, and device signatures for security and optimization.</p>
                </div>
              </div>
            </section>

            <section id="02" className="scroll-mt-32">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3"><Lock size={24} /> 02 How We Use Data</h2>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                We process data to maintain your account, facilitate research through Gemini/CORE APIs, and refine the CatalystLab interface.
              </p>
            </section>

            {/* Section 03, 04, 05 */}
            <div className="grid md:grid-cols-3 gap-6">
              <section id="03" className="scroll-mt-32 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                <h3 className="font-bold mb-3 text-purple-400">03 Storage</h3>
                <p className="text-sm text-[var(--text-tertiary)]">Supabase handles our database. API keys reside in your browser's LocalStorage.</p>
              </section>

              <section id="04" className="scroll-mt-32 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                <h3 className="font-bold mb-3 text-green-400">04 Sharing</h3>
                <p className="text-sm text-[var(--text-tertiary)]">No rentals or sales. Data shared only with Supabase, Google, Paddle, and Vercel.</p>
              </section>

              <section id="05" className="scroll-mt-32 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                <h3 className="font-bold mb-3 text-orange-400">05 Cookies</h3>
                <p className="text-sm text-[var(--text-tertiary)]">Strictly necessary session cookies and preference-based LocalStorage only.</p>
              </section>
            </div>

            {/* Section 06: Your Rights - Interactive Grid */}
            <section id="06" className="scroll-mt-32">
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-3"><UserCheck size={24} /> 06 Your Rights & Choices</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['Access', 'Correction', 'Deletion', 'Portability'].map((right) => (
                  <div key={right} className="p-4 text-center rounded-xl bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 hover:border-blue-500/50 transition-colors">
                    <span className="text-xs font-medium uppercase tracking-widest">{right}</span>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-sm text-[var(--text-tertiary)]">Contact legal@catalystlab.tech to exercise these rights.</p>
            </section>

            {/* Section 07, 08 */}
            <section id="07" className="scroll-mt-32 border-t border-white/10 pt-10">
              <h2 className="text-xl font-bold mb-4 italic">07 Children's Privacy</h2>
              <p className="text-[var(--text-secondary)] text-sm">CatalystLab is not intended for users under 13. We do not knowingly collect such data.</p>
            </section>

            <section id="08" className="scroll-mt-32">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3"><Globe size={24} /> 08 International Transfers</h2>
              <p className="text-[var(--text-secondary)] leading-relaxed bg-blue-500/5 p-6 rounded-2xl border border-blue-500/10">
                Operated from **Bangladesh**. Data is processed globally via US/EU-based infrastructure (Vercel/Supabase) ensuring standard contractual clauses for protection.
              </p>
            </section>

            {/* Section 09, 10, 11 */}
            <section id="09" className="scroll-mt-32 p-8 rounded-3xl bg-blue-600/10 border border-blue-500/20">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-blue-300">
                <Shield size={24} /> 09 Security Architecture
              </h2>
              <ul className="grid sm:grid-cols-2 gap-4 text-sm font-mono text-blue-200/70">
                <li>• TLS 1.3 Encryption</li>
                <li>• Supabase RLS Policies</li>
                <li>• Bcrypt Password Hashing</li>
                <li>• Automated Threat Detection</li>
              </ul>
            </section>

            <footer className="pt-12 mt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-start gap-8">
              <div id="10" className="max-w-xs">
                <h4 className="font-bold mb-2">10 Policy Updates</h4>
                <p className="text-xs text-[var(--text-tertiary)]">Material changes notified via dashboard 14 days in advance.</p>
              </div>
              <div id="11" className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                <Mail className="text-blue-400" />
                <div>
                  <h4 className="text-sm font-bold">Contact Legal</h4>
                  <p className="text-xs text-blue-400">legal@catalystlab.tech</p>
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