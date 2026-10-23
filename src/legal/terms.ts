import type { LegalDocumentContent } from './types';
import {
  CHANGE_NOTICE_DAYS,
  CONTACT_PATH,
  EFFECTIVE_DATE,
  GOVERNING_COURTS,
  GOVERNING_LAW,
  LIABILITY_CAP,
  LEGAL_EMAIL,
  LEGAL_ENTITY,
  LEGAL_VERSION,
  MINIMUM_AGE,
  TRIAL_DAYS,
} from './legalMeta';

export const termsDocument: LegalDocumentContent = {
  slug: 'terms',
  title: 'Terms of Service',
  seoDescription:
    'The terms that govern use of CatalystLab: accounts, plans and trials, acceptable use of diagnostic scans, and liability.',
  canonicalPath: '/terms',
  version: LEGAL_VERSION,
  intro:
    `These terms are the agreement between you and the operator of CatalystLab. They cover accounts, plans, acceptable use of diagnostic scans, and the limits on what we promise. Read the summary at the top of each section first. The numbered clauses are the binding text. This version took effect on ${EFFECTIVE_DATE}.`,
  sections: [
    {
      id: 'definitions',
      title: 'Definitions and parties',
      summary: 'Defines the words used in these terms and identifies who you are contracting with.',
      clauses: [
        {
          id: '1.1',
          blocks: [
            {
              kind: 'p',
              text: `"CatalystLab", "we", "us" means ${LEGAL_ENTITY}. We do not publish a postal address; ${LEGAL_EMAIL} is our monitored mailbox and our address for notices.`,
            },
            {
              kind: 'p',
              text: '"Service" means the CatalystLab website at www.catalystlab.tech, its web application, its application programming interface (API), its command-line interface, and the diagnostic engines and reports they produce.',
            },
            {
              kind: 'p',
              text: '"Target" means any website, domain, URL, or repository that you submit to the Service for analysis.',
            },
            {
              kind: 'p',
              text: '"Account" means a registered user profile, which may be signed in with Google, GitHub, or an email address and password.',
            },
            {
              kind: 'p',
              text: '"Plan" means the Community (free) tier or a paid tier listed on the pricing page.',
            },
          ],
        },
      ],
    },
    {
      id: 'acceptance',
      title: 'Acceptance and eligibility',
      summary:
        'By using the Service you agree to these terms. If you use it for an organization, you confirm you can bind that organization.',
      clauses: [
        {
          id: '2.1',
          heading: 'Agreement',
          blocks: [
            {
              kind: 'p',
              text: 'By creating an Account, starting a trial, or using the Service without an Account, you agree to these terms and to the Privacy Policy and Refund Policy linked from the footer.',
            },
          ],
        },
        {
          id: '2.2',
          heading: 'Eligibility',
          blocks: [
            {
              kind: 'p',
              text: `You must be able to form a binding contract in your jurisdiction and be at least ${MINIMUM_AGE} years old. If you use the Service for an organization, you confirm that you are authorized to bind that organization.`,
            },
          ],
        },
      ],
    },
    {
      id: 'accounts',
      title: 'Accounts and security',
      summary:
        'Keep your sign-in secure. You are responsible for activity under your Account and API keys.',
      clauses: [
        {
          id: '3.1',
          heading: 'Sign-in methods',
          blocks: [
            {
              kind: 'p',
              text: 'Accounts are created and signed in through Firebase Authentication, using Google, GitHub, or an email address and password. We do not control those providers’ own terms or security.',
            },
          ],
        },
        {
          id: '3.2',
          heading: 'Responsibility',
          blocks: [
            {
              kind: 'p',
              text: 'You are responsible for keeping your credentials and API keys confidential. Tell us promptly at the contact address below if you believe an Account or key has been compromised. You are responsible for all activity under your Account and keys until you report the problem.',
            },
          ],
        },
        {
          id: '3.3',
          heading: 'Accurate information',
          blocks: [{ kind: 'p', text: 'You must provide accurate account information and keep it up to date.' }],
        },
      ],
      annex: [
        {
          kind: 'p',
          text: 'API keys are issued per Account, stored as SHA-256 hashes in Firestore so they survive restarts, and can be rotated, revoked or deleted by you at any time. Daily quota usage is counted in Upstash when it is configured and in process memory otherwise; either way the counter resets at UTC midnight.',
        },
      ],
    },
    {
      id: 'plans',
      title: 'Plans, trials, and billing',
      summary:
        'The Community plan is free. Paid plans are priced as shown on the pricing page. Eligible paid plans include a 7-day trial, one per Account.',
      clauses: [
        {
          id: '4.1',
          heading: 'Plans',
          blocks: [
            {
              kind: 'p',
              text: 'Plan names, included daily allowances, and prices are shown on the pricing page at the time of purchase. The price you see at checkout is the price you pay.',
            },
          ],
        },
        {
          id: '4.2',
          heading: 'Trials',
          blocks: [
            {
              kind: 'p',
              text: `Starter, Pro, Team, and Enterprise include a ${TRIAL_DAYS}-day trial, which can be used once per Account. No payment method is required to start a trial and nothing is charged during it. If you take no action when the trial ends your Account moves to the Community plan; if you choose a paid plan, billing starts on the day you complete checkout.`,
            },
          ],
        },
        {
          id: '4.3',
          heading: 'Billing',
          blocks: [
            {
              kind: 'p',
              text: `Paid plans are billed monthly or annually, as selected at checkout. All prices are in US dollars and exclude any applicable taxes, duties or levies, which remain your responsibility. The merchant of record is the payment provider that processed your checkout (2Checkout/Verifone or Dodo Payments); it calculates and remits tax where it is required to. Payment is processed by that provider and we never see or store your full card number. A paid plan renews automatically for successive periods of the same length until you cancel, and we will tell you about a price increase at least ${CHANGE_NOTICE_DAYS} days before it applies to your renewal.`,
            },
          ],
        },
        {
          id: '4.4',
          heading: 'Changes to plans',
          blocks: [
            {
              kind: 'p',
              text: 'You may move from a paid plan to the Community plan at any time. Changes to plans and prices apply from the next billing period. Refunds are covered by the Refund Policy.',
            },
          ],
        },
      ],
      annex: [
        { kind: 'p', text: 'Plan prices below are rendered from the same pricing data that drives the pricing page and checkout (src/data/pricingData.ts and server/core/pricing.ts), so the three cannot disagree. The annual figure is the total charged once per year.' },
        { kind: 'plan-table' },
      ],
    },
    {
      id: 'usage',
      title: 'Usage limits and fair use',
      summary:
        'Each plan has a daily allowance and short-term burst limits. Exceeding them returns an error until the limit resets.',
      clauses: [
        {
          id: '5.1',
          heading: 'Allowances',
          blocks: [
            {
              kind: 'p',
              text: 'Each plan includes a daily allowance of compute units. A single engine run uses one unit. The master audit, which runs eight engines, uses ten units. Allowances and burst limits are enforced by the server and may be changed with notice on the pricing page.',
            },
          ],
        },
        {
          id: '5.2',
          heading: 'Fair use',
          blocks: [
            {
              kind: 'p',
              text: 'You must not try to bypass, multiply, or evade allowances, including by creating accounts or rotating visitor identifiers to obtain more units.',
            },
          ],
        },
      ],
      annex: [
        {
          kind: 'table',
          headers: ['Tier', 'Daily compute units'],
          rows: [
            ['Visitor (no account)', '20'],
            ['Community (free)', '50'],
            ['Starter', '150'],
            ['Pro', '500'],
            ['Team', '1,500'],
            ['Enterprise', '5,000'],
            ['API key (Pro API)', '500'],
          ],
        },
        {
          kind: 'p',
          text: 'Burst limits are 15 requests per minute for visitors, 45 for signed-in users, and 120 per API key. Source: server/core/rateLimit.ts. Burst limits use Upstash when it is configured. Otherwise they use in-memory counters. Daily units reset at UTC midnight. These are the values the API enforces and the same numbers are published on the pricing page.',
        },
      ],
    },
    {
      id: 'acceptable-use',
      title: 'Acceptable use and authorized targets',
      summary:
        'Only submit targets you own or have written permission to test. Do not use the Service to attack, harass, or break the law.',
      clauses: [
        {
          id: '6.1',
          heading: 'Authorization for targets',
          blocks: [
            {
              kind: 'p',
              text: 'You may submit a Target only if you own it or have written authorization from its owner to analyze it. You are responsible for every Target you submit, including the consequences of the analysis.',
            },
          ],
        },
        {
          id: '6.2',
          heading: 'Prohibited conduct',
          blocks: [
            { kind: 'p', text: 'You must not use the Service to:' },
            {
              kind: 'ul',
              items: [
                'analyze a Target without the authorization described in clause 6.1, or use results to plan an attack',
                'attempt to reach internal, private, or loopback network addresses through the Service',
                'overload, scrape at scale, or interfere with the Service or other users',
                'circumvent authentication, rate limits, or security controls',
                'upload or transmit malware, or content that is unlawful or infringes others’ rights',
                'resell or sublicense access without a written agreement with us',
              ],
            },
          ],
        },
        {
          id: '6.3',
          heading: 'Enforcement',
          blocks: [
            {
              kind: 'p',
              text: 'We may suspend or terminate access, without notice where the law allows, if we reasonably believe you have breached this section. We may cooperate with lawful requests from authorities.',
            },
          ],
        },
      ],
      annex: [
        {
          kind: 'p',
          text: 'Engine fetches of Targets go through the server’s guarded fetch helper. The helper blocks private and loopback addresses, pins DNS resolution, enforces a 10-second timeout and a 5 MB response cap, and re-validates each redirect (src/lib/networkSecurity.ts). These controls reduce risk but do not replace your obligation in clause 6.1.',
        },
      ],
    },
    {
      id: 'content',
      title: 'Your content and results',
      summary:
        'You keep your rights to what you submit. Scores and reports are informational. You should verify them before acting on them.',
      clauses: [
        {
          id: '7.1',
          heading: 'Your content',
          blocks: [
            {
              kind: 'p',
              text: 'You keep your rights in the Targets, URLs, and other content you submit. You grant us a limited licence to process that content to provide the Service to you.',
            },
          ],
        },
        {
          id: '7.2',
          heading: 'Results',
          blocks: [
            {
              kind: 'p',
              text: 'Scores, findings, and reports are generated automatically from public data and heuristics. They may be incomplete or inaccurate. They are not professional security, legal, or accessibility advice, and you should verify them before acting on them.',
            },
          ],
        },
      ],
    },
    {
      id: 'third-parties',
      title: 'Third-party services and integrations',
      summary:
        'Some features send data to third-party services, such as GitHub, Slack, Discord, and payment providers. Those services have their own terms.',
      clauses: [
        {
          id: '8.1',
          blocks: [
            {
              kind: 'p',
              text: 'Features that connect to third parties, including repository integrations, alert webhooks, payment checkout, and external data sources, are subject to those parties’ terms. We are not responsible for their availability or conduct.',
            },
          ],
        },
      ],
    },
    {
      id: 'service-level',
      title: 'Availability and changes to the Service',
      summary:
        'We work to keep the Service running, but we do not promise uptime. We may change or discontinue features with notice.',
      clauses: [
        {
          id: '9.1',
          heading: 'No uptime commitment',
          blocks: [
            {
              kind: 'p',
              text: 'We offer no uptime commitment and no service level agreement on any plan, including Enterprise, except where one is agreed in a separate written contract with you. Except where expressly agreed in writing, the Service is provided on an as-available basis. Planned maintenance is announced in advance; we do not offer service credits for downtime.',
            },
          ],
        },
        {
          id: '9.2',
          heading: 'Changes',
          blocks: [
            {
              kind: 'p',
              text: 'We may change, add, or remove features. We will give reasonable notice of material changes that reduce paid functionality.',
            },
          ],
        },
      ],
    },
    {
      id: 'ip',
      title: 'Intellectual property',
      summary:
        'We own the CatalystLab software, engines, and branding. You own your content. Nothing here transfers ownership of either.',
      clauses: [
        {
          id: '10.1',
          blocks: [
            {
              kind: 'p',
              text: 'The Service, including its software, engines, documentation, and brand, is owned by us or our licensors. These terms do not grant you any right in those materials except the limited right to use the Service under them.',
            },
          ],
        },
      ],
    },
    {
      id: 'warranties',
      title: 'Disclaimers',
      summary: 'The Service is provided as-is, to the extent the law allows.',
      clauses: [
        {
          id: '11.1',
          blocks: [
            {
              kind: 'p',
              text: 'To the maximum extent permitted by law, the Service is provided “as is” and “as available”, without warranties of any kind, express or implied, including merchantability, fitness for a particular purpose, and non-infringement.',
            },
          ],
        },
      ],
    },
    {
      id: 'liability',
      title: 'Limitation of liability',
      summary:
        'To the extent the law allows, our liability is limited. The cap and exclusions are open decisions for counsel.',
      clauses: [
        {
          id: '12.1',
          blocks: [
            {
              kind: 'p',
              text: 'To the maximum extent permitted by law, we are not liable for indirect, incidental, special, consequential, or punitive damages, or for lost profits, data, or goodwill.',
            },
          ],
        },
        {
          id: '12.2',
          blocks: [
            {
              kind: 'p',
              text: `To the maximum extent permitted by law, our total liability for all claims relating to the Service is limited to ${LIABILITY_CAP}. Nothing in these terms limits liability that cannot be limited under applicable law.`,
            },
          ],
        },
      ],
    },
    {
      id: 'indemnity',
      title: 'Indemnity',
      summary: 'If your Target analysis causes a claim against us, you agree to cover our reasonable costs.',
      clauses: [
        {
          id: '13.1',
          blocks: [
            {
              kind: 'p',
              text: 'You agree to defend and indemnify us, and our officers, employees and agents, against third-party claims and reasonable legal fees arising from: your breach of these terms, including clause 6.1; the Targets you submit or the way you use the results; your violation of applicable law; or your violation of the rights of a third party. We will notify you of a claim promptly, let you control its defence and settlement, and will not settle in a way that admits fault for you without your prior consent. This indemnity does not apply to a claim arising solely from our breach of these terms.',
            },
          ],
        },
      ],
    },
    {
      id: 'termination',
      title: 'Termination',
      summary:
        'You can stop using the Service at any time. We can suspend or end access for breach. Some obligations survive termination.',
      clauses: [
        {
          id: '14.1',
          heading: 'By you',
          blocks: [
            {
              kind: 'p',
              text: 'You may stop using the Service at any time and may move to the Community plan at any time. Paid-plan cancellation and refunds follow the Refund Policy: you can cancel by writing to the monitored legal mailbox or through the contact form, and you can move to the Community plan yourself from your dashboard. Cancellation stops the next renewal; paid features stay available until the end of the period you already paid for.',
            },
          ],
        },
        {
          id: '14.2',
          heading: 'By us',
          blocks: [
            {
              kind: 'p',
              text: 'We may suspend or terminate your access for breach of these terms, with notice where practical.',
            },
          ],
        },
        {
          id: '14.3',
          heading: 'Survival',
          blocks: [
            {
              kind: 'p',
              text: 'Sections 6, 7, 10, 11, 12, 13, and 16 survive termination.',
            },
          ],
        },
      ],
    },
    {
      id: 'changes',
      title: 'Changes to these terms',
      summary: 'We may update these terms. Material changes will be announced before they take effect.',
      clauses: [
        {
          id: '15.1',
          blocks: [
            {
              kind: 'p',
              text: `We may update these terms. We will publish the new version with a new effective date and give at least ${CHANGE_NOTICE_DAYS} days' notice for material changes, through an in-product banner and an email to the address on your Account. Continued use after the effective date means you accept the changes.`,
            },
          ],
        },
      ],
    },
    {
      id: 'law',
      title: 'Governing law and disputes',
      summary: 'These terms are governed by the law stated below. Please contact us first to resolve a dispute.',
      clauses: [
        {
          id: '16.1',
          blocks: [
            {
              kind: 'p',
              text: `These terms are governed by ${GOVERNING_LAW}, without regard to its conflict of laws rules. Before either side files a claim, we will both try to resolve the dispute informally for 30 days by writing to ${LEGAL_EMAIL}. If that does not resolve it, the courts of ${GOVERNING_COURTS} have exclusive jurisdiction and both parties submit to their personal jurisdiction. Nothing in these terms removes a mandatory consumer protection right under the law of the country where you live.`,
            },
          ],
        },
      ],
    },
    {
      id: 'contact',
      title: 'Contact',
      summary: 'Send legal questions and notices through the contact form or by email.',
      clauses: [
        {
          id: '17.1',
          blocks: [
            {
              kind: 'p',
              text: `Use the contact form at ${CONTACT_PATH} or write to ${LEGAL_EMAIL}. That mailbox is monitored and is our address for formal notices: we do not publish a postal address, and a notice sent to that mailbox is treated as delivered when we acknowledge it, or two business days after it is sent if we do not answer.`,
            },
          ],
        },
      ],
    },
  ],
};
