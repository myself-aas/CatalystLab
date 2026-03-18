'use client';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { BottomNav } from '@/components/BottomNav';

export default function TermsPage() {
  return (
    <div className="flex min-h-screen bg-[var(--bg-canvas)]">
      <Sidebar />
      <main className="flex-1 md:ml-[220px] pb-20 md:pb-0">
        <TopBar title="Terms of Service" />
        <div className="max-w-3xl mx-auto p-8 markdown-body">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-6">Terms of Service</h1>
          <p className="text-[var(--text-tertiary)] mb-8">Effective Date: March 18, 2026</p>
          
          <p>These Terms of Service (&quot;Terms&quot;) govern your access to and use of CatalystLab, available at https://catalystlab.tech (the &quot;Service&quot;), operated by CatalystLab (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;).</p>
          
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mt-8 mb-4">01 Acceptance of Terms</h2>
          <p>By accessing or using CatalystLab, you confirm that you are at least 13 years of age, have read and agreed to these Terms, and will comply with all applicable laws.</p>
          
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mt-8 mb-4">02 Description of Service</h2>
          <p>CatalystLab is an AI-powered research brainstorming and literature discovery web application providing 20 AI instruments, automatic literature discovery, session saving, and a dedicated search interface.</p>

          <h2 className="text-xl font-semibold text-[var(--text-primary)] mt-8 mb-4">03 User Accounts</h2>
          <p>To access certain features, you must create an account and keep your credentials confidential. You are responsible for all activities under your account.</p>

          <h2 className="text-xl font-semibold text-[var(--text-primary)] mt-8 mb-4">04 Acceptable Use</h2>
          <p>CatalystLab is for legitimate academic and research purposes. Prohibited uses include submitting PII without consent, reverse engineering, academic fraud, or overwhelming our infrastructure.</p>

          <h2 className="text-xl font-semibold text-[var(--text-primary)] mt-8 mb-4">05 API Keys &amp; Third-Party Services</h2>
          <p>You must provide your own Google Gemini API key. We are not responsible for third-party services (Google, Semantic Scholar, etc.).</p>

          <h2 className="text-xl font-semibold text-[var(--text-primary)] mt-8 mb-4">06 Subscriptions &amp; Payments</h2>
          <p>Payments are processed by Paddle. We offer free and paid plans. Refunds are available within 7 days of initial purchase.</p>

          <h2 className="text-xl font-semibold text-[var(--text-primary)] mt-8 mb-4">07 Intellectual Property</h2>
          <p>You retain ownership of your content. We do not use your content to train AI models. AI-generated outputs are provided for your use without warranty.</p>

          <h2 className="text-xl font-semibold text-[var(--text-primary)] mt-8 mb-4">08 Disclaimer of Warranties</h2>
          <p>The Service is provided &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; without warranties of any kind.</p>

          <h2 className="text-xl font-semibold text-[var(--text-primary)] mt-8 mb-4">09 Limitation of Liability</h2>
          <p>CatalystLab shall not be liable for indirect, incidental, or consequential damages. Our total liability is limited to the greater of the amount paid in the last 12 months or $50.</p>

          <h2 className="text-xl font-semibold text-[var(--text-primary)] mt-8 mb-4">10 Indemnification</h2>
          <p>You agree to indemnify CatalystLab against claims arising from your use of the Service or violation of these Terms.</p>

          <h2 className="text-xl font-semibold text-[var(--text-primary)] mt-8 mb-4">11 Governing Law &amp; Disputes</h2>
          <p>These Terms are governed by the laws of Bangladesh. Disputes shall be resolved through good-faith negotiation or binding arbitration.</p>

          <h2 className="text-xl font-semibold text-[var(--text-primary)] mt-8 mb-4">12 Changes to Terms</h2>
          <p>We may update these Terms with at least 14 days&apos; notice.</p>

          <h2 className="text-xl font-semibold text-[var(--text-primary)] mt-8 mb-4">13 Termination</h2>
          <p>We may terminate access for breach of Terms, legal requirements, or security risks.</p>

          <h2 className="text-xl font-semibold text-[var(--text-primary)] mt-8 mb-4">15 Contact</h2>
          <p>For questions, contact legal@nexuslab.tech.</p>
        </div>
        <BottomNav />
      </main>
    </div>
  );
}
