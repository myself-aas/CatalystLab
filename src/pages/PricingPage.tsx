import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Shield, Sparkles, Server, ArrowRight, HelpCircle } from 'lucide-react';
import { LazyReveal, LazyStaggerContainer, LazyStaggerItem } from '../components/common/LazyAnimate';
import { SEOHead } from '../components/common/SEOHead';
import { Breadcrumbs } from '../components/common/Breadcrumbs';

export const PricingPage: React.FC = () => {
  const [annual, setAnnual] = useState(true);

  const plans = [
    {
      id: 'community',
      name: 'Community',
      tagline: 'Ideal for independent developers & hobby projects',
      priceMonthly: 0,
      priceAnnual: 0,
      badge: 'Free Forever',
      highlighted: false,
      features: [
        'Unlimited On-Demand 8-Engine Scans',
        'Website Health & DOM Depth Analysis',
        'OWASP SecOps Security Posture Check',
        'AI & LLM Readiness Inspector (/llms.txt)',
        'Repository Hygiene Git Scanner',
        'Instant Public Shareable URLs',
        'Community Support via GitHub',
      ],
      ctaText: 'Start Free Scan',
      ctaLink: '/',
    },
    {
      id: 'pro',
      name: 'Pro Telemetry',
      tagline: 'For fast-growing products & digital engineering teams',
      priceMonthly: 29,
      priceAnnual: 24,
      badge: 'Most Popular',
      highlighted: true,
      features: [
        'Everything in Community, plus:',
        'Automated 180-Minute Health Probes',
        'Continuous Edge Latency Radar (12 PoPs)',
        'Full PDF & JSON Telemetry Dossiers',
        'LLMO Citation & Perplexity Visibility',
        'Eco-Carbon Hosting Certification',
        'Webhook Alerts (Slack, Discord, Email)',
        'Historical Trend Analysis (90 Days)',
      ],
      ctaText: 'Start Pro Trial',
      ctaLink: '/contact',
    },
    {
      id: 'enterprise',
      name: 'Enterprise Suite',
      tagline: 'For enterprises needing custom CI/CD pipelines & SLA',
      priceMonthly: 199,
      priceAnnual: 169,
      badge: 'Dedicated Scale',
      highlighted: false,
      features: [
        'Everything in Pro, plus:',
        'Private Subdomain & Internal IP Scanning',
        'Automated CI/CD GitHub Actions & GitLab Runners',
        'Custom OWASP Compliance Policies',
        'White-Label Audit Reports with Custom Branding',
        'Dedicated High-Frequency Edge Nodes',
        '99.99% Uptime SLA & Dedicated Architect',
        'SSO / SAML Authentication & Team RBAC',
      ],
      ctaText: 'Contact Enterprise',
      ctaLink: '/contact',
    },
  ];

  const faqs = [
    {
      q: 'How does the on-demand scan work?',
      a: 'CatalystLab executes real-time multi-dimensional probes across 8 specialized diagnostic engines without requiring any client-side JavaScript agent installation.',
    },
    {
      q: 'Can I switch between monthly and annual plans?',
      a: 'Yes, you can upgrade, downgrade, or cancel your subscription at any time directly from your user dashboard.',
    },
    {
      q: 'Are the audit reports public or private?',
      a: 'By default, on-demand scans generate shareable permalinks for developer collaboration. Pro and Enterprise tiers include private scan settings and password protection.',
    },
    {
      q: 'Do you offer custom API integrations for CI/CD pipelines?',
      a: 'Yes! Enterprise plans include full programmatic REST API access, CLI runner utilities, and native GitHub Action workflows.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24 text-[#0b192c]">
      <SEOHead
        title="Pricing & Diagnostic Tier Plans"
        description="Transparent telemetry pricing. Unlimited free on-demand 8-engine audits, Pro automated hourly probes, and Enterprise CI/CD pipelines."
        keywords={['CatalystLab pricing', 'telemetry API plans', 'web audit pricing', 'enterprise web vitals monitoring']}
        canonicalUrl="https://www.catalystlab.tech/pricing"
      />

      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-[#ebe9e6] bg-[#f4f6fa] py-14 sm:py-16">
        <LazyReveal direction="down" className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Breadcrumbs
              items={[
                { label: 'Pricing Plans' }
              ]}
            />
          </div>

          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#415a77]/30 bg-[#415a77]/10 px-3.5 py-1 text-xs font-bold text-[#415a77] mb-6">
              <Sparkles className="h-3.5 w-3.5 text-[#415a77]" />
              <span>Transparent, Scalable Engineering Pricing</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-[#0b192c] sm:text-5xl lg:text-6xl">
              Precision Web Health & Telemetry Plans
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-[#415a77] sm:text-lg">
              Choose the diagnostic tier suited for your engineering workflow. From instant on-demand audits to enterprise CI/CD monitoring.
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <span className={`text-sm font-bold ${!annual ? 'text-[#0b192c]' : 'text-[#415a77]'}`}>
              Monthly
            </span>
            <button
              onClick={() => setAnnual(!annual)}
              className="relative h-7 w-14 rounded-full bg-[#ebe9e6] p-1 transition-colors border border-[#415a77]/20"
              aria-label="Toggle annual billing"
            >
              <div
                className={`h-5 w-5 rounded-full bg-[#0b192c] transition-transform ${
                  annual ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
            <div className="flex items-center gap-1.5">
              <span className={`text-sm font-bold ${annual ? 'text-[#0b192c]' : 'text-[#415a77]'}`}>
                Annual
              </span>
              <span className="rounded-full bg-[#415a77]/15 px-2 py-0.5 text-[11px] font-bold text-[#415a77] border border-[#415a77]/30">
                Save 20%
              </span>
            </div>
          </div>
        </LazyReveal>
      </section>

      {/* Pricing Cards Grid */}
      <main className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
        <LazyStaggerContainer className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-6 items-stretch" staggerDelay={0.12}>
          {plans.map((plan) => {
            const price = annual ? plan.priceAnnual : plan.priceMonthly;
            return (
              <LazyStaggerItem
                key={plan.id}
                className={`relative flex flex-col justify-between rounded-3xl p-8 sm:p-9 transition-all duration-300 ${
                  plan.highlighted
                    ? 'border-2 border-[#93c5fd]/50 bg-[#091729] text-[#f8fafc] shadow-2xl shadow-sky-950/40 lg:-translate-y-2'
                    : 'border border-[#415a77]/30 bg-[#0b192c] text-[#f8fafc] shadow-xl hover:border-[#415a77]/60 hover:shadow-2xl'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-8">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-extrabold tracking-wide uppercase shadow-md ${
                        plan.highlighted
                          ? 'bg-gradient-to-r from-sky-400 to-[#c5d3e8] text-[#0b192c]'
                          : 'border border-[#415a77]/50 bg-[#152238] text-[#c5d3e8]'
                      }`}
                    >
                      {plan.highlighted && <Sparkles className="h-3 w-3" />}
                      <span>{plan.badge}</span>
                    </span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-extrabold text-[#f8fafc] tracking-tight">{plan.name}</h3>
                  </div>
                  <p className="mt-2 text-xs text-[#94a3b8] leading-relaxed min-h-[32px]">{plan.tagline}</p>

                  <div className="mt-6 flex items-baseline gap-1.5">
                    <span className="text-4xl font-extrabold text-[#f8fafc] sm:text-5xl tracking-tight">
                      ${price}
                    </span>
                    <span className="text-sm font-medium text-[#94a3b8]">
                      {plan.priceMonthly === 0 ? 'free forever' : '/ month'}
                    </span>
                  </div>
                  {annual && plan.priceMonthly > 0 ? (
                    <p className="mt-1 text-xs text-sky-300 font-semibold">Billed annually (${price * 12}/yr)</p>
                  ) : (
                    <div className="h-4 mt-1" />
                  )}

                  <div className="mt-8 border-t border-[#415a77]/25 pt-6">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#93c5fd]">
                      Included Capabilities:
                    </p>
                    <ul className="mt-4 space-y-3.5">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-[#e2e8f0]">
                          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#152238] border border-[#415a77]/40 text-[#93c5fd] mt-0.5">
                            <Check className="h-3 w-3 stroke-[3]" />
                          </div>
                          <span className="leading-snug">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-[#415a77]/20">
                  <Link
                    to={plan.ctaLink}
                    className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all duration-200 shadow-md active:scale-98 ${
                      plan.highlighted
                        ? 'bg-sky-500 text-[#07111e] hover:bg-sky-400 font-extrabold shadow-sky-500/20'
                        : 'border border-[#415a77]/40 bg-[#152238] text-[#f8fafc] hover:bg-[#1e2f4a] hover:border-[#415a77]/70'
                    }`}
                  >
                    <span>{plan.ctaText}</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </LazyStaggerItem>
            );
          })}
        </LazyStaggerContainer>

        {/* Capabilities, Restrictions & Routing Matrix */}
        <LazyReveal direction="up" className="mt-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0b192c]">Capabilities, Restrictions & Routing Matrix</h2>
            <p className="mt-2 text-sm text-[#415a77]">Detailed architectural breakdown of telemetry features, application routes, and tier-based resource limits.</p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#415a77]/30 bg-[#0b192c] shadow-2xl">
            <table className="w-full text-left border-collapse text-xs text-[#f8fafc]">
              <thead>
                <tr className="border-b border-[#415a77]/40 bg-[#152238] text-[#c5d3e8] uppercase font-semibold">
                  <th className="p-4">Telemetry Capability / Feature</th>
                  <th className="p-4">Required Tier</th>
                  <th className="p-4">App Routing Endpoint</th>
                  <th className="p-4">Operational Limits & Restrictions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#415a77]/20">
                <tr className="hover:bg-[#152238]/40 transition-colors">
                  <td className="p-4 font-bold">On-Demand 8-Engine Scans</td>
                  <td className="p-4"><span className="rounded-md bg-sky-500/15 text-sky-400 px-2 py-0.5 font-bold">Community</span></td>
                  <td className="p-4 font-mono text-[#c5d3e8]">/ (Master) & /health, /latency, etc.</td>
                  <td className="p-4 text-[#c5d3e8]">10 scans per day per IP. Public permalinks only.</td>
                </tr>
                <tr className="hover:bg-[#152238]/40 transition-colors">
                  <td className="p-4 font-bold">Automated 60-Minute Health Probes</td>
                  <td className="p-4"><span className="rounded-md bg-purple-500/15 text-purple-400 px-2 py-0.5 font-bold">Pro Telemetry</span></td>
                  <td className="p-4 font-mono text-[#c5d3e8]">/dashboard</td>
                  <td className="p-4 text-[#c5d3e8]">Up to 50 monitored targets with 60-min interval checks.</td>
                </tr>
                <tr className="hover:bg-[#152238]/40 transition-colors">
                  <td className="p-4 font-bold">Continuous Edge Latency Radar (12 PoPs)</td>
                  <td className="p-4"><span className="rounded-md bg-purple-500/15 text-purple-400 px-2 py-0.5 font-bold">Pro Telemetry</span></td>
                  <td className="p-4 font-mono text-[#c5d3e8]">/latency</td>
                  <td className="p-4 text-[#c5d3e8]">Synthetic anycast ping simulation across 12 global regions.</td>
                </tr>
                <tr className="hover:bg-[#152238]/40 transition-colors">
                  <td className="p-4 font-bold">Full PDF & JSON Telemetry Dossiers</td>
                  <td className="p-4"><span className="rounded-md bg-purple-500/15 text-purple-400 px-2 py-0.5 font-bold">Pro Telemetry</span></td>
                  <td className="p-4 font-mono text-[#c5d3e8]">/report/:id</td>
                  <td className="p-4 text-[#c5d3e8]">Export full canvas dossiers to downloadable PDF or raw JSON.</td>
                </tr>
                <tr className="hover:bg-[#152238]/40 transition-colors">
                  <td className="p-4 font-bold">LLMO Citation & Perplexity Visibility</td>
                  <td className="p-4"><span className="rounded-md bg-purple-500/15 text-purple-400 px-2 py-0.5 font-bold">Pro Telemetry</span></td>
                  <td className="p-4 font-mono text-[#c5d3e8]">/llmo</td>
                  <td className="p-4 text-[#c5d3e8]">AI answer engine indexability scoring and llms.txt validation.</td>
                </tr>
                <tr className="hover:bg-[#152238]/40 transition-colors">
                  <td className="p-4 font-bold">Eco-Carbon Hosting Certification</td>
                  <td className="p-4"><span className="rounded-md bg-purple-500/15 text-purple-400 px-2 py-0.5 font-bold">Pro Telemetry</span></td>
                  <td className="p-4 font-mono text-[#c5d3e8]">/eco-audit</td>
                  <td className="p-4 text-[#c5d3e8]">Green Web Foundation verification and CO2 per page view.</td>
                </tr>
                <tr className="hover:bg-[#152238]/40 transition-colors">
                  <td className="p-4 font-bold">Webhook Alerts (Slack, Discord, Email)</td>
                  <td className="p-4"><span className="rounded-md bg-purple-500/15 text-purple-400 px-2 py-0.5 font-bold">Pro Telemetry</span></td>
                  <td className="p-4 font-mono text-[#c5d3e8]">/admin/monitoring</td>
                  <td className="p-4 text-[#c5d3e8]">Instant incident dispatch on downtime or SSL expiry warnings.</td>
                </tr>
                <tr className="hover:bg-[#152238]/40 transition-colors">
                  <td className="p-4 font-bold">Historical Trend Analysis (90 Days)</td>
                  <td className="p-4"><span className="rounded-md bg-purple-500/15 text-purple-400 px-2 py-0.5 font-bold">Pro Telemetry</span></td>
                  <td className="p-4 font-mono text-[#c5d3e8]">/dashboard</td>
                  <td className="p-4 text-[#c5d3e8]">90-day time-series telemetry charts and score regressions.</td>
                </tr>
                <tr className="hover:bg-[#152238]/40 transition-colors">
                  <td className="p-4 font-bold">Private Subdomain & Internal IP Scanning</td>
                  <td className="p-4"><span className="rounded-md bg-amber-500/15 text-amber-400 px-2 py-0.5 font-bold">Enterprise Suite</span></td>
                  <td className="p-4 font-mono text-[#c5d3e8]">/admin</td>
                  <td className="p-4 text-[#c5d3e8]">VPN-bound and internal staging IP inspection support.</td>
                </tr>
                <tr className="hover:bg-[#152238]/40 transition-colors">
                  <td className="p-4 font-bold">Automated CI/CD GitHub & GitLab Runners</td>
                  <td className="p-4"><span className="rounded-md bg-amber-500/15 text-amber-400 px-2 py-0.5 font-bold">Enterprise Suite</span></td>
                  <td className="p-4 font-mono text-[#c5d3e8]">/docs#webhooks</td>
                  <td className="p-4 text-[#c5d3e8]">Quality gate action scripts to block bad deployments.</td>
                </tr>
                <tr className="hover:bg-[#152238]/40 transition-colors">
                  <td className="p-4 font-bold">Custom OWASP Compliance Policies</td>
                  <td className="p-4"><span className="rounded-md bg-amber-500/15 text-amber-400 px-2 py-0.5 font-bold">Enterprise Suite</span></td>
                  <td className="p-4 font-mono text-[#c5d3e8]">/compliance</td>
                  <td className="p-4 text-[#c5d3e8]">Tailored CSP, HSTS, and header enforcement rule sets.</td>
                </tr>
                <tr className="hover:bg-[#152238]/40 transition-colors">
                  <td className="p-4 font-bold">White-Label Audit Reports with Branding</td>
                  <td className="p-4"><span className="rounded-md bg-amber-500/15 text-amber-400 px-2 py-0.5 font-bold">Enterprise Suite</span></td>
                  <td className="p-4 font-mono text-[#c5d3e8]">/reports/:slug</td>
                  <td className="p-4 text-[#c5d3e8]">Custom agency logos, color themes, and domain masking.</td>
                </tr>
                <tr className="hover:bg-[#152238]/40 transition-colors">
                  <td className="p-4 font-bold">Dedicated High-Frequency Edge Nodes</td>
                  <td className="p-4"><span className="rounded-md bg-amber-500/15 text-amber-400 px-2 py-0.5 font-bold">Enterprise Suite</span></td>
                  <td className="p-4 font-mono text-[#c5d3e8]">/latency</td>
                  <td className="p-4 text-[#c5d3e8]">Sub-millisecond dedicated telemetry worker nodes.</td>
                </tr>
                <tr className="hover:bg-[#152238]/40 transition-colors">
                  <td className="p-4 font-bold">99.99% Uptime SLA & Dedicated Architect</td>
                  <td className="p-4"><span className="rounded-md bg-amber-500/15 text-amber-400 px-2 py-0.5 font-bold">Enterprise Suite</span></td>
                  <td className="p-4 font-mono text-[#c5d3e8]">/contact</td>
                  <td className="p-4 text-[#c5d3e8]">Financial-grade uptime guarantee and priority support.</td>
                </tr>
                <tr className="hover:bg-[#152238]/40 transition-colors">
                  <td className="p-4 font-bold">SSO / SAML Authentication & Team RBAC</td>
                  <td className="p-4"><span className="rounded-md bg-amber-500/15 text-amber-400 px-2 py-0.5 font-bold">Enterprise Suite</span></td>
                  <td className="p-4 font-mono text-[#c5d3e8]">/admin</td>
                  <td className="p-4 text-[#c5d3e8]">Okta, Azure AD, Google Workspace SAML with role permissions.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </LazyReveal>

        {/* Enterprise Callout Banner */}
        <LazyReveal direction="up" className="mt-16 rounded-2xl border border-[#415a77]/30 bg-[#0b192c] p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl text-[#f8fafc]">
          <div>
            <div className="flex items-center gap-2 text-[#c5d3e8] font-bold text-sm mb-1">
              <Server className="h-4 w-4" />
              <span>Custom Enterprise Infrastructure</span>
            </div>
            <h3 className="text-2xl font-bold text-[#f8fafc]">Need On-Premises or Private Cloud Telemetry?</h3>
            <p className="mt-2 text-sm text-[#ebe9e6] max-w-2xl">
              We deploy containerized CatalystLab audit runners directly into your VPC (GCP, AWS, Azure, or Kubernetes) with air-gapped security compliance.
            </p>
          </div>
          <Link
            to="/contact"
            className="shrink-0 rounded-xl bg-[#415a77] px-6 py-3 text-sm font-bold text-[#f8fafc] hover:bg-[#52718e] transition-colors shadow-md"
          >
            Speak with Engineering
          </Link>
        </LazyReveal>

        {/* FAQ Section */}
        <div className="mt-20">
          <LazyReveal direction="down" className="text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0b192c]">Frequently Asked Questions</h2>
            <p className="mt-2 text-sm text-[#415a77]">Everything you need to know about CatalystLab telemetry plans.</p>
          </LazyReveal>

          <LazyStaggerContainer className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto" staggerDelay={0.08}>
            {faqs.map((faq, idx) => (
              <LazyStaggerItem key={idx} className="rounded-2xl border border-[#415a77]/30 bg-[#0b192c] p-6 text-[#f8fafc] shadow-lg">
                <h4 className="text-base font-bold text-[#f8fafc] flex items-start gap-2">
                  <HelpCircle className="h-4 w-4 text-[#c5d3e8] shrink-0 mt-1" />
                  <span>{faq.q}</span>
                </h4>
                <p className="mt-3 text-sm text-[#ebe9e6] leading-relaxed">{faq.a}</p>
              </LazyStaggerItem>
            ))}
          </LazyStaggerContainer>
        </div>
      </main>
    </div>
  );
};
export default PricingPage;
