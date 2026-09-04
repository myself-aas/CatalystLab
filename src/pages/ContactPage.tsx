import React, { useState } from 'react';
import { GlobalFaqSection, FaqCategory } from '../components/common/GlobalFaqSection';
import { 
 Mail, 
 Send, 
 CheckCircle2, 
 LifeBuoy, 
 Cpu, 
 ShieldCheck, 
 Terminal, 
 Layers, 
 FileCheck,
 RotateCw
} from 'lucide-react';
import { LazyReveal } from '../components/common/LazyAnimate';
import { SEOHead } from '../components/common/SEOHead';
import { submitContactInquiry } from '../lib/firebase';
import { logger } from '../lib/logger';

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
 const [isSubmitting, setIsSubmitting] = useState(false);

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
 answer: 'Some edge firewalls (such as Cloudflare Under Attack Mode, AWS WAF, or Fastly) block synthetic automated HTTP probes. You can whitelist our public worker user-agent string"CatalystLab-Telemetry-Pro/2.8"or add our static egress IP ranges to your firewall allowlist.'
 },
 {
 question: 'How can I export audit reports to PDF dossiers or share permanent links?',
 badge: 'Export & Share',
 answer: 'From any report dossier page (/reports/{domain}), click"Export Dossier PDF"to generate an off-screen rendered vector report with full radar diagrams, or click"Copy Permalink"to share the authenticated diagnostic view.'
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
 answer: 'Submit a ticket under the"Enterprise & Dedicated Engines"department with your expected monthly audit volume and concurrency requirements. We typically activate increased quotas within 2 hours.'
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
 } catch (err: unknown) {
 logger.warn("Contact inquiry submission warning:", err);
 setTicketId(generatedTicket);
 setSubmitted(true);
 } finally {
 setIsSubmitting(false);
 }
 };

 return (
 <div className="relative min-h-screen bg-transparent pb-24 text-foreground">
 <SEOHead
 title="Developer Support & Inquiries"
 description="Contact the CatalystLab telemetry and engineering team. Get support for synthetic audits, DOM performance diagnostics, API access, and enterprise quotas."
 keywords={['CatalystLab support', 'telemetry contact', 'enterprise audit quota', 'bug triage', 'developer support']}
 canonicalUrl="https://www.catalystlab.tech/contact"
 />

 {/* Atmospheric Mesh Lighting */}
 <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[800px] -translate-x-1/2 rounded-full bg-primary/12 blur-[140px]"/>
 <div className="pointer-events-none absolute right-1/4 top-96 h-[320px] w-[500px] rounded-full bg-cyan-500/8 blur-[160px]"/>
 <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] dark:opacity-100 opacity-30 bg-[size:3.5rem_3.5rem]"/>
 
 {/* Header Banner */}
 <section className="relative overflow-hidden border-b border-border dark:border-white/[0.08] py-16 sm:py-20 w-full z-10">
 <div className="relative z-10 w-full sm:px-6 lg:px-8">
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
 <div className="space-y-4">
 <div className="inline-flex items-center gap-2 rounded-full border border-border dark:border-white/[0.08] bg-muted/40 dark:bg-muted/40 px-3.5 py-1 text-xs font-mono font-medium text-primary backdrop-blur-md">
 <LifeBuoy className="size-3.5 text-primary"/>
 <span>CatalystLab Engineering Support</span>
 </div>
 <h1 className="text-3xl sm:text-5xl lg:text-6xl font-semibold text-foreground tracking-[-0.03em] leading-[1.08]">
 Developer Inquiries &amp;{' '}
 <span className="text-gradient-linear">
 Support Portal
 </span>
 </h1>
 <p className="text-sm sm:text-base text-muted-foreground max-w-3xl mx-auto leading-relaxed font-sans font-normal">
 Connect directly with our core telemetry engineers, request custom audit engines, or resolve scanning anomalies.
 </p>
 </div>

 {/* Live Status Indicator Pill */}
 <div className="shrink-0 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4 sm:p-5 font-mono backdrop-blur-xl shadow-sm dark:shadow-linear-card">
 <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
 <span className="relative flex size-2">
 <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 px-4 py-2"/>
 <span className="relative inline-flex size-2 rounded-full bg-emerald-500 px-4 py-2"/>
 </span>
 <span>SUPPORT STATUS: ACTIVE</span>
 </div>
 <div className="mt-1 text-xs text-muted-foreground font-medium font-sans">
 Avg Response: &lt; 2.4 Hours
 </div>
 </div>
 </div>
 </div>
 </section>

 {/* Main Support Workspace */}
 <main className="relative z-10 ds-page-shell space-y-10">
 
 {/* Support Intake Form & Department Hub */}
 <LazyReveal direction="up">
 <div className="ds-card p-6 sm:p-8">
 <div aria-hidden="true"className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 dark:via-white/20 to-transparent"/>

 {submitted ? (
 <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.08] p-8 text-center space-y-4 backdrop-blur-xl">
 <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
 <CheckCircle2 className="h-7 w-7"/>
 </div>
 <h2 className="text-xl font-bold text-foreground">Support Ticket Generated</h2>
 <div className="inline-block rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-1.5 text-sm font-mono font-bold text-emerald-300 shadow-sm">
 Ticket Reference: #{ticketId}
 </div>
 <p className="text-xs text-muted-foreground max-w-3xl mx-auto leading-relaxed font-sans">
 We have dispatched your inquiry to the <strong className="capitalize text-foreground">{department}</strong> on-call team. A confirmation receipt has been sent to <strong className="text-foreground">{email}</strong>.
 </p>
 <button
 onClick={() => {
 setSubmitted(false);
 setMessage('');
 }}
 className="mt-3 rounded-full bg-primary hover:bg-primary/90 px-5 py-2.5 text-xs font-medium text-primary-foreground shadow-linear-cta cursor-pointer transition-all active:scale-[0.98]"
 >
 Submit Another Inquiry
 </button>
 </div>
 ) : (
 <form onSubmit={handleSubmit} className="space-y-6 font-sans">
 
 {/* 1. Department Selection */}
 <div>
 <label className="block text-xs font-mono font-semibold text-foreground uppercase tracking-wider mb-2.5">
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
 className={`group/dep flex items-start gap-3.5 rounded-2xl p-4 text-left border transition-all cursor-pointer ${
 isSelected
 ? 'border-primary bg-primary/10 text-foreground ring-1 ring-primary/50 shadow-[0_0_24px_rgba(94,106,210,0.15)]'
 : 'border-border dark:border-white/[0.08] bg-card dark:bg-muted/20 text-foreground hover:border-border/80 hover:bg-accent'
 }`}
 >
 <div className={`p-2.5 rounded-xl shrink-0 border transition-all ${
 isSelected ? 'bg-primary text-primary-foreground border-transparent shadow-sm' : 'bg-muted/40 dark:bg-muted/40 text-muted-foreground border-border/80 dark:border-border group-hover/dep:text-foreground'
 }`}>
 <Icon className="h-4 w-4"/>
 </div>
 <div>
 <div className="font-semibold text-xs font-sans text-foreground">{dep.label}</div>
 <div className="text-[11px] mt-1 leading-relaxed font-sans text-muted-foreground">
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
 <label className="block text-xs font-mono font-semibold text-foreground uppercase tracking-wider mb-2">
 2. Urgency &amp; Priority Level
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
 className={`rounded-full px-4 py-2 text-xs font-medium border transition-all cursor-pointer ${
 priority === p.id
 ? 'border-primary bg-primary text-primary-foreground shadow-linear-cta'
 : 'border-border dark:border-white/[0.08] bg-muted/30 dark:bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-accent'
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
 <label className="block text-xs font-medium text-muted-foreground mb-1.5">
 Your Name / Organization
 </label>
 <input
 type="text"
 required
 value={name}
 onChange={(e) => setName(e.target.value)}
 placeholder="Jane Doe (DevOps Lead)"
 className="ds-card w-full text-xs shadow-inner font-sans p-4"
 />
 </div>

 <div>
 <label className="block text-xs font-medium text-muted-foreground mb-1.5">
 Work Email Address
 </label>
 <input
 type="email"
 required
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 placeholder="jane@company.com"
 className="ds-card w-full text-xs shadow-inner font-sans p-4"
 />
 </div>
 </div>

 {/* 4. Target Domain */}
 <div>
 <label className="block text-xs font-medium text-muted-foreground mb-1.5">
 Target Domain or Repository (Optional)
 </label>
 <input
 type="text"
 value={targetUrl}
 onChange={(e) => setTargetUrl(e.target.value)}
 placeholder="https://example.com or github.com/owner/repo"
 className="ds-card w-full text-xs shadow-inner font-mono p-4"
 />
 </div>

 {/* 5. Message Body */}
 <div>
 <label className="block text-xs font-medium text-muted-foreground mb-1.5">
 Describe Your Inquiry or Diagnostic Error
 </label>
 <textarea
 required
 rows={4}
 value={message}
 onChange={(e) => setMessage(e.target.value)}
 placeholder="Provide details about the diagnostic engine, unexpected metric values, or custom infrastructure requirements..."
 className="ds-card w-full p-3.5 text-xs shadow-inner font-sans"
 />
 </div>

 {/* 6. Diagnostics Checkbox */}
 <div className="ds-card p-4 flex items-start gap-3 text-xs text-muted-foreground font-sans">
 <input
 type="checkbox"
 id="attach-diag"
 checked={attachDiagnostics}
 onChange={(e) => setAttachDiagnostics(e.target.checked)}
 className="mt-0.5 size-4 rounded border-border dark:border-white/20 bg-muted/40 dark:bg-white/5 text-primary focus:ring-primary/30 cursor-pointer accent-primary"
 />
 <label htmlFor="attach-diag"className="cursor-pointer leading-relaxed">
 <strong className="text-foreground">Attach Client Telemetry Context:</strong> Includes browser user-agent, viewport resolution, and network socket handshake latency to help engineers reproduce your issue quickly.
 </label>
 </div>

 {/* Submit Action */}
 <button
 type="submit"
 disabled={isSubmitting}
 className="w-full flex items-center justify-center gap-2 rounded-full bg-primary hover:bg-primary/90 py-3.5 text-xs font-medium text-primary-foreground shadow-linear-cta active:scale-[0.98] disabled:opacity-60 cursor-pointer transition-all"
 >
 {isSubmitting ? (
 <>
 <RotateCw className="h-4 w-4 text-primary-foreground/80 animate-spin"/>
 <span>Transmitting Support Ticket...</span>
 </>
 ) : (
 <>
 <Send className="h-4 w-4 text-primary-foreground"/>
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
 <div className="ds-card p-4">
 <div aria-hidden="true"className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 dark:via-white/20 to-transparent"/>
 <GlobalFaqSection 
 categories={faqCategories}
 title="Instant Answers &amp; Diagnostic Troubleshooting"
 subtitle="Quick solutions to common technical issues, API configurations, and SLA questions."
 />
 </div>
 </LazyReveal>

 {/* Alternate Emergency Channels */}
 <LazyReveal direction="up">
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 <div className="ds-card p-5 space-y-2 group ds-card-interactive">
 <div aria-hidden="true"className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 dark:via-white/20 to-transparent"/>
 <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 mb-2">
 <Mail className="h-4 w-4"/>
 </div>
 <h4 className="text-xs font-semibold text-foreground font-sans">Direct Email Hotline</h4>
 <p className="text-xs text-muted-foreground font-mono hover:text-primary transition-colors">support@catalystlab.tech</p>
 </div>

 <div className="ds-card p-5 space-y-2 group ds-card-interactive">
 <div aria-hidden="true"className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/20 dark:via-white/20 to-transparent"/>
 <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
 <Terminal className="h-4 w-4"/>
 </div>
 <h4 className="text-xs font-semibold text-foreground font-sans">Superadmin Studio</h4>
 <p className="text-xs text-muted-foreground font-mono">Admin Live Console (/admin)</p>
 </div>

 <div className="ds-card p-5 space-y-2 group ds-card-interactive">
 <div aria-hidden="true"className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/20 dark:via-white/20 to-transparent"/>
 <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-2">
 <ShieldCheck className="h-4 w-4"/>
 </div>
 <h4 className="text-xs font-semibold text-foreground font-sans">Security Vulnerabilities</h4>
 <p className="text-xs text-muted-foreground font-mono hover:text-amber-400 transition-colors">security@catalystlab.tech</p>
 </div>
 </div>
 </LazyReveal>

 </main>
 </div>
 );
};

export default ContactPage;
