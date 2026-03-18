'use client';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { BottomNav } from '@/components/BottomNav';

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen bg-[var(--bg-canvas)]">
      <Sidebar />
      <main className="flex-1 md:ml-[220px] pb-20 md:pb-0">
        <TopBar title="Privacy Policy" />
        <div className="max-w-3xl mx-auto p-8 markdown-body">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-6">Privacy Policy</h1>
          <p className="text-[var(--text-tertiary)] mb-8">Effective Date: March 18, 2026</p>
          
          <p>CatalystLab (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates the catalystlab.tech web application (the &quot;Service&quot;). This Privacy Policy explains what information we collect, why we collect it, how we use and protect it, and your rights as a user.</p>
          
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mt-8 mb-4">01 Information We Collect</h2>
          <h3 className="text-lg font-medium text-[var(--text-primary)] mt-6 mb-2">1.1 Information You Provide Directly</h3>
          <p>When you use CatalystLab, you may provide us with the following:</p>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Account information:</strong> your name, email address, and password when you create an account.</li>
            <li><strong>Profile information:</strong> your institution, research field, position, and academic interests.</li>
            <li><strong>Research inputs:</strong> text, hypotheses, abstracts, research questions, or any content you enter into CatalystLab instruments.</li>
            <li><strong>API keys:</strong> your Gemini API key and optionally your CORE API key.</li>
            <li><strong>Payment information:</strong> processed by Paddle.</li>
            <li><strong>Communications:</strong> emails or messages you send to our support team.</li>
          </ul>

          <h3 className="text-lg font-medium text-[var(--text-primary)] mt-6 mb-2">1.2 Information Collected Automatically</h3>
          <p>When you use the Service, we may automatically collect:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Usage data, device and browser information, IP address, and cookies/local storage for authentication.</li>
          </ul>

          <h2 className="text-xl font-semibold text-[var(--text-primary)] mt-8 mb-4">02 How We Use Your Information</h2>
          <p>We use the information for Service Delivery, Account Management, and Product Improvement.</p>

          <h2 className="text-xl font-semibold text-[var(--text-primary)] mt-8 mb-4">03 Data Storage &amp; Retention</h2>
          <p>CatalystLab uses Supabase as our database and authentication provider. API keys are stored only in your browser&apos;s localStorage.</p>

          <h2 className="text-xl font-semibold text-[var(--text-primary)] mt-8 mb-4">04 Sharing of Your Information</h2>
          <p>We do not sell, rent, or trade your personal information. We share data only with trusted third-party providers (Supabase, Google Gemini API, Paddle, Vercel) as necessary to operate CatalystLab.</p>

          <h2 className="text-xl font-semibold text-[var(--text-primary)] mt-8 mb-4">05 Cookies &amp; Local Storage</h2>
          <p>We use strictly necessary cookies for authentication and localStorage for your preferences and saved sessions.</p>

          <h2 className="text-xl font-semibold text-[var(--text-primary)] mt-8 mb-4">06 Your Rights &amp; Choices</h2>
          <p>You have rights regarding access, correction, deletion, data portability, withdrawal of consent, and opting out of analytics. Contact us at legal@nexuslab.tech.</p>

          <h2 className="text-xl font-semibold text-[var(--text-primary)] mt-8 mb-4">07 Children&apos;s Privacy</h2>
          <p>CatalystLab is not directed to individuals under the age of 13.</p>

          <h2 className="text-xl font-semibold text-[var(--text-primary)] mt-8 mb-4">08 International Data Transfers</h2>
          <p>CatalystLab is operated by an individual based in Bangladesh. Data may be stored in the US or EU.</p>

          <h2 className="text-xl font-semibold text-[var(--text-primary)] mt-8 mb-4">09 Security</h2>
          <p>We implement industry-standard security measures, including TLS 1.3 encryption, RLS policies, and bcrypt password hashing.</p>

          <h2 className="text-xl font-semibold text-[var(--text-primary)] mt-8 mb-4">10 Changes to This Policy</h2>
          <p>We may update this policy. Material changes will be notified by email and dashboard notice at least 14 days in advance.</p>

          <h2 className="text-xl font-semibold text-[var(--text-primary)] mt-8 mb-4">11 Contact</h2>
          <p>For privacy inquiries, contact legal@nexuslab.tech.</p>
        </div>
        <BottomNav />
      </main>
    </div>
  );
}
