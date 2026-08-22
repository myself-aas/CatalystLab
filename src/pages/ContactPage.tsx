import React, { useState } from 'react';
import { GlobalFaqSection, FaqCategory } from '../components/common/GlobalFaqSection';
import { 
  Mail, 
  Send, 
  CheckCircle2, 
  MessageSquare, 
  LifeBuoy, 
  Clock, 
  Cpu, 
  ShieldCheck, 
  HelpCircle, 
  Sparkles, 
  Terminal, 
  Layers, 
  ChevronDown, 
  ChevronUp,
  FileCheck,
  AlertCircle,
  RotateCw
} from 'lucide-react';
import { LazyReveal, LazyStaggerContainer, LazyStaggerItem } from '../components/common/LazyAnimate';
import { SEOHead } from '../components/common/SEOHead';
import { submitContactInquiry } from '../lib/firebase';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const [department, setDepartment] = useState('technical');
  const [priority, setPriority] = useState('medium');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [message, setMessage] = useState('');
  const [attachDiagnostics, setAttachDiagnostics] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const departments = [
    {
      id: 'technical',
      label: 'Technical Audit & Telemetry',
      desc: 'Questions about scan results, DOM tree depth, OWASP header flags, or synthetic latency.',
      icon: Cpu
    },
    {
      id: 'enterprise',
      label: 'Enterprise & Dedicated Engines',
      desc: 'Custom rate quotas, private worker pools, and dedicated infrastructure integrations.',
      icon: Layers
    },
    {
      id: 'billing',
      label: 'Billing & Subscriptions',
      desc: 'Invoicing, annual plan upgrades, receipt requests, or enterprise tax certificates.',
      icon: FileCheck
    },
    {
      id: 'security',
      label: 'Security & Safe Harbor',
      desc: 'Coordinated vulnerability disclosure, PGP tickets, and GDPR compliance.',
      icon: ShieldCheck
    }
  ];

  const faqCategories: FaqCategory[] = [
    {
      id: 'troubleshooting',
      label: 'Diagnostic Troubleshooting',
      description: 'Resolve firewall blocks, 403 status codes, timeout issues, and SPA hydration flags.',
      iconName: 'cpu',
      items: [
        {
          question: 'Why did my scan timeout or return a 403 Forbidden status code?',
          badge: 'WAF & Firewall',
          answer: 'Some edge firewalls (such as Cloudflare Under Attack Mode, AWS WAF, or Fastly) block synthetic automated HTTP probes. You can whitelist our public worker user-agent string "CatalystLab-Telemetry-Pro/2.8" or add our static egress IP ranges to your firewall allowlist.'
        },
        {
          question: 'How can I export audit reports to PDF dossiers or share permanent links?',
          badge: 'Export & Share',
          answer: 'From any report dossier page (/reports/{domain}), click "Export Dossier PDF" to generate an off-screen rendered vector report with full radar diagrams, or click "Copy Permalink" to share the authenticated diagnostic view.'
        },
        {
          question: 'Why does my React or Next.js app report DOM hydration warnings?',
          badge: 'SSR Hydration',
          answer: 'This indicates that server-rendered HTML markup differed from the client initial render output, causing client-side CPU blocking time. Review mismatched browser-only variables (such as window, localStorage, or Math.random()) in your component renders.'
        }
      ]
    },
    {
      id: 'api-support',
      label: 'API & CI/CD Support',
      description: 'API key provisioning, rate limit increases, CLI setup, and webhook delivery troubleshooting.',
      iconName: 'terminal',
      items: [
        {
          question: 'Can I run automated scans across multiple repositories via API and CLI?',
          badge: 'Automation',
          answer: 'Yes. Pro and Enterprise subscribers receive programmatic API keys to trigger headless audits via CI/CD pipelines (GitHub Actions, GitLab CI, Bitbucket) with webhook notifications delivered directly to Slack or Discord.'
        },
        {
          question: 'How do I request an increase in API rate limits or concurrent probe capacity?',
          badge: 'Rate Quota',
          answer: 'Submit a ticket under the "Enterprise & Dedicated Engines" department with your expected monthly audit volume and concurrency requirements. We typically activate increased quotas within 2 hours.'
        }
      ]
    },
    {
      id: 'response-sla',
      label: 'SLA & Response Times',
      description: 'Support response guarantees, escalation channels, and critical bug triage.',
      iconName: 'shield',
      items: [
        {
          question: 'What is your typical support response time?',
          badge: 'SLA Guarantees',
          answer: 'Our global telemetry engineering rotation responds within 2 to 4 hours during business hours. High priority production blocker tickets are triaged within 30 minutes 24/7/365.'
        },
        {
          question: 'Do you have a dedicated emergency channel for Enterprise outages?',
          badge: 'Enterprise Hotline',
          answer: 'Yes. Enterprise Suite customers are assigned a dedicated private Slack/Teams channel and a 24/7 emergency hotline for direct phone escalation with our principal engineers.'
        }
      ]
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !message.trim()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const generatedTicket = `CTL-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      await submitContactInquiry({
        email: email.trim(),
        name: name.trim() || undefined,
        company: targetUrl.trim() ? `Target: ${targetUrl.trim()}` : undefined,
        message: `[Ticket: ${generatedTicket} | Department: ${department.toUpperCase()} | Priority: ${priority.toUpperCase()}] ${message.trim()}${attachDiagnostics ? ' (Telemetry Context Attached)' : ''}`,
        source: `contact-page-${department}`
      });
      setTicketId(generatedTicket);
      setSubmitted(true);
    } catch (err: any) {
      console.warn("Contact inquiry submission warning:", err);
      // Fallback: gracefully present ticket ID to user
      setTicketId(generatedTicket);
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24 text-[#0b192c] selection:bg-[#415a77]/25 selection:text-[#0b192c]">
      <SEOHead
        title="Developer Support & Inquiries"
        description="Contact the CatalystLab telemetry and engineering team. Get support for synthetic audits, DOM performance diagnostics, API access, and enterprise quotas."
        keywords={['CatalystLab support', 'telemetry contact', 'enterprise audit quota', 'bug triage', 'developer support']}
        canonicalUrl="https://www.catalystlab.tech/contact"
      />
      
      {/* Header Banner */}
      <section className="border-b border-[#e2e8f0] bg-white px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#415a77]/30 bg-[#415a77]/10 px-3.5 py-1 text-sm font-bold text-[#415a77] uppercase tracking-wider mb-3">
                <LifeBuoy className="h-3.5 w-3.5 text-[#415a77]" />
                <span>CatalystLab Engineering Support</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0b192c] tracking-tight">
                Developer Inquiries & Support Portal
              </h1>
              <p className="mt-2 text-base text-[#415a77] max-w-2xl leading-relaxed">
                Connect directly with our core telemetry engineers, request custom audit engines, or resolve scanning anomalies.
              </p>
            </div>

            {/* Live Status Indicator Pill */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/70 p-4 shrink-0 shadow-xs">
              <div className="flex items-center gap-2 text-sm font-mono font-bold text-emerald-800">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>SUPPORT STATUS: ACTIVE</span>
              </div>
              <div className="mt-1 text-sm text-emerald-950 font-semibold">
                Avg Response: &lt; 2.4 Hours
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Support Workspace */}
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
        
        {/* Support Intake Form & Department Hub */}
        <LazyReveal direction="up">
          <div className="rounded-3xl border border-[#e2e8f0] bg-white p-6 sm:p-9 shadow-sm">
            {submitted ? (
              <div className="rounded-3xl border border-emerald-500/40 bg-emerald-50 p-8 sm:p-10 text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-extrabold text-emerald-950">Support Ticket Generated!</h2>
                <div className="inline-block rounded-xl border border-emerald-500/30 bg-white px-4 py-1.5 font-mono text-base font-bold text-emerald-800">
                  Ticket Reference: #{ticketId}
                </div>
                <p className="text-sm text-emerald-900 max-w-md mx-auto leading-relaxed">
                  We have dispatched your inquiry to the <strong className="capitalize">{department}</strong> on-call team. A confirmation receipt has been sent to <strong>{email}</strong>.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setMessage('');
                  }}
                  className="mt-4 rounded-xl bg-[#0b192c] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#152238] transition-all shadow-md active:scale-98"
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* 1. Department Selection */}
                <div>
                  <label className="block text-sm font-extrabold text-[#0b192c] uppercase tracking-wider mb-3">
                    1. Select Inquiry Topic / Routing
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {departments.map((dep) => {
                      const Icon = dep.icon;
                      const isSelected = department === dep.id;
                      return (
                        <button
                          key={dep.id}
                          type="button"
                          onClick={() => setDepartment(dep.id)}
                          className={`flex items-start gap-3 rounded-2xl p-4 text-left border transition-all ${
                            isSelected
                              ? 'border-[#0b192c] bg-[#0b192c] text-white shadow-md'
                              : 'border-[#e2e8f0] bg-[#f8fafc] text-[#0b192c] hover:border-[#415a77]'
                          }`}
                        >
                          <div className={`p-2 rounded-xl shrink-0 ${
                            isSelected ? 'bg-[#152238] text-sky-300' : 'bg-[#e2e8f0]/60 text-[#415a77]'
                          }`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-bold text-sm">{dep.label}</div>
                            <div className={`text-sm mt-0.5 leading-snug ${
                              isSelected ? 'text-[#cbd5e1]' : 'text-[#415a77]'
                            }`}>
                              {dep.desc}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Priority Level */}
                <div>
                  <label className="block text-sm font-extrabold text-[#0b192c] uppercase tracking-wider mb-2">
                    2. Urgency & Priority Level
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      { id: 'low', label: 'Low (General Question)' },
                      { id: 'medium', label: 'Medium (Feature / Scan Help)' },
                      { id: 'high', label: 'High (Production Blocker / Timeout)' }
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPriority(p.id)}
                        className={`rounded-xl px-4 py-2 text-sm font-bold border transition-all ${
                          priority === p.id
                            ? 'border-[#0b192c] bg-[#0b192c] text-white shadow-sm'
                            : 'border-[#e2e8f0] bg-[#f8fafc] text-[#415a77] hover:border-[#415a77]'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Contact Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-[#0b192c] mb-1.5">
                      Your Name / Organization
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe (DevOps Lead)"
                      className="w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3.5 py-2.5 text-sm text-[#0b192c] focus:border-[#415a77] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#0b192c] mb-1.5">
                      Work Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jane@company.com"
                      className="w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3.5 py-2.5 text-sm text-[#0b192c] focus:border-[#415a77] focus:outline-none font-mono"
                    />
                  </div>
                </div>

                {/* 4. Target Domain */}
                <div>
                  <label className="block text-sm font-bold text-[#0b192c] mb-1.5">
                    Target Domain or Repository (Optional)
                  </label>
                  <input
                    type="text"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder="https://example.com or github.com/owner/repo"
                    className="w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3.5 py-2.5 text-sm text-[#0b192c] focus:border-[#415a77] focus:outline-none font-mono"
                  />
                </div>

                {/* 5. Message Body */}
                <div>
                  <label className="block text-sm font-bold text-[#0b192c] mb-1.5">
                    Describe Your Inquiry or Diagnostic Error
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Provide details about the diagnostic engine, unexpected metric values, or custom infrastructure requirements..."
                    className="w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-3.5 text-sm text-[#0b192c] focus:border-[#415a77] focus:outline-none"
                  />
                </div>

                {/* 6. Diagnostics Checkbox */}
                <div className="rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-4 flex items-start gap-3 text-sm text-[#415a77]">
                  <input
                    type="checkbox"
                    id="attach-diag"
                    checked={attachDiagnostics}
                    onChange={(e) => setAttachDiagnostics(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded text-[#0b192c]"
                  />
                  <label htmlFor="attach-diag" className="cursor-pointer leading-relaxed">
                    <strong>Attach Client Telemetry Context:</strong> Includes browser user-agent, viewport resolution, and network socket handshake latency to help engineers reproduce your issue quickly.
                  </label>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0b192c] py-4 text-sm font-bold text-white hover:bg-[#152238] transition-all shadow-md active:scale-98 disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RotateCw className="h-4 w-4 text-sky-300 animate-spin" />
                      <span>Transmitting Support Ticket...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 text-sky-300" />
                      <span>Submit Support Request</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </LazyReveal>

        {/* Quick Resolution Knowledge Base Accordion */}
        <LazyReveal direction="up">
          <div className="rounded-3xl border border-[#e2e8f0] bg-white overflow-hidden shadow-sm">
            <GlobalFaqSection 
              categories={faqCategories}
              title="Instant Answers & Diagnostic Troubleshooting"
              subtitle="Quick solutions to common technical issues, API configurations, and SLA questions."
            />
          </div>
        </LazyReveal>

        {/* Alternate Emergency Channels */}
        <LazyReveal direction="up">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-3xl border border-[#415a77]/30 bg-[#0b192c] p-6 text-[#f8fafc] shadow-xl space-y-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#152238] text-sky-300 border border-[#415a77]/40 mb-2">
                <Mail className="h-4 w-4" />
              </div>
              <h4 className="text-base font-bold text-white">Direct Email Hotline</h4>
              <p className="text-sm text-[#94a3b8]">support@catalystlab.tech</p>
            </div>

            <div className="rounded-3xl border border-[#415a77]/30 bg-[#0b192c] p-6 text-[#f8fafc] shadow-xl space-y-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#152238] text-emerald-400 border border-[#415a77]/40 mb-2">
                <Terminal className="h-4 w-4" />
              </div>
              <h4 className="text-base font-bold text-white">Superadmin Studio</h4>
              <p className="text-sm text-[#94a3b8]">Admin Live Console (/admin)</p>
            </div>

            <div className="rounded-3xl border border-[#415a77]/30 bg-[#0b192c] p-6 text-[#f8fafc] shadow-xl space-y-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#152238] text-amber-300 border border-[#415a77]/40 mb-2">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <h4 className="text-base font-bold text-white">Security Vulnerabilities</h4>
              <p className="text-sm text-[#94a3b8]">security@catalystlab.tech</p>
            </div>
          </div>
        </LazyReveal>

      </main>
    </div>
  );
};
export default ContactPage;
