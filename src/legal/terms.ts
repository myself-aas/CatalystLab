import type { LegalDocumentContent } from './types';
import { GOVERNING_LAW, LEGAL_DRAFT_VERSION, LEGAL_EMAIL, LEGAL_ENTITY, LEGAL_ADDRESS, CONTACT_PATH } from './legalMeta';

export const termsDocument: LegalDocumentContent = {
  slug: 'terms',
  title: 'Terms of Service',
  seoDescription:
    'The terms that govern use of CatalystLab: accounts, plans and trials, acceptable use of diagnostic scans, and liability.',
  canonicalPath: '/terms',
  version: LEGAL_DRAFT_VERSION,
  intro:
    'These terms are the agreement between you and the operator of CatalystLab. They cover accounts, plans, acceptable use of diagnostic scans, and the limits on what we promise. Read the summary at the top of each section first. The numbered clauses are the binding text.',
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
              text: `"CatalystLab", "we", "us" means ${LEGAL_ENTITY}, located at ${LEGAL_ADDRESS}.`,
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
              text: 'You must be able to form a binding contract in your jurisdiction. [ASK USER: minimum age, for example 18, or 13 with parental consent.] If you use the Service for an organization, you confirm that you are authorized to bind that organization.',
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
          text: 'API keys are issued per Account. Keys can be rotated. Keys and quotas are held in server memory in the current build, so they are reset when the service restarts. [ASK USER: confirm whether keys will persist across restarts before publication.]',
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
              text: 'Starter, Pro, Team, and Enterprise include a 7-day trial. A trial can be used once per Account. [ASK USER: confirm whether a payment method is required to start a trial, and when billing begins after the trial ends.]',
            },
          ],
        },
        {
          id: '4.3',
          heading: 'Billing',
          blocks: [
            {
              kind: 'p',
              text: 'Paid plans are billed monthly or annually, as selected at checkout. [ASK USER: billing currency, tax handling, renewal notice period, and the merchant of record for each payment provider.] Payment is processed by a third-party payment provider, and we do not store full card numbers.',
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
        { kind: 'p', text: '[ASK USER: internal reviewer note, remove before publication.] Plan prices below come from the pricing data in the application. Annual prices are under review because checkout and the pricing page currently disagree.' },
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
          text: 'Burst limits are 15 requests per minute for visitors, 45 for signed-in users, and 120 per API key. Source: server/core/rateLimit.ts. Burst limits use Upstash when it is configured. Otherwise they use in-memory counters. Daily units reset at UTC midnight. [ASK USER: confirm that these values are the published values.]',
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
              text: '[ASK USER: state whether any availability commitment is offered, and to which plans. No uptime commitment is implemented in the current code.] Except where expressly agreed in writing, the Service is provided on an as-available basis.',
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
              text: 'To the maximum extent permitted by law, our total liability for all claims relating to the Service is limited to [ASK USER: liability cap, for example the fees paid in the 12 months before the claim, or a fixed amount]. Nothing in these terms limits liability that cannot be limited under applicable law.',
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
              text: '[ASK USER: indemnity scope.] You agree to defend and indemnify us against third-party claims arising from your breach of these terms, including clause 6.1, or from Targets you submit.',
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
              text: 'You may stop using the Service at any time and may move to the Community plan at any time. Paid-plan cancellation and refunds follow the Refund Policy. [ASK USER: confirm the self-service cancellation path; the current build supports only the downgrade to the Community plan.]',
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
              text: 'We may update these terms. We will publish the new version with a new effective date and give [ASK USER: notice period] for material changes. Continued use after the effective date means you accept the changes.',
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
              text: `These terms are governed by ${GOVERNING_LAW}. [ASK USER: dispute resolution steps, such as informal resolution, arbitration, or courts.]`,
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
              text: `Use the contact form at ${CONTACT_PATH} or write to ${LEGAL_EMAIL}. [ASK USER: confirm the legal mailbox is monitored, and add a postal address for formal notices.]`,
            },
          ],
        },
      ],
    },
  ],
};
