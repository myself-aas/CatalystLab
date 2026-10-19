import type { LegalDocumentContent } from './types';
import { CONTACT_PATH, EFFECTIVE_DATE, LEGAL_DRAFT_VERSION, LEGAL_EMAIL, LEGAL_ENTITY, LEGAL_ADDRESS } from './legalMeta';

export const privacyDocument: LegalDocumentContent = {
  slug: 'privacy',
  title: 'Privacy Policy',
  seoDescription:
    'What CatalystLab collects, why, who processes it, how long we keep it, and what you can ask us to do with it.',
  canonicalPath: '/privacy',
  version: LEGAL_DRAFT_VERSION,
  intro:
    'This policy explains what personal data CatalystLab processes, why, which service providers help us, how long we keep it, and how to make a request. It describes what the software does today. Where a statement depends on a decision the company has not made yet, it is marked as an open item.',
  sections: [
    {
      id: 'controller',
      title: 'Who we are and what this covers',
      summary:
        'This policy covers the CatalystLab website, web app, API, and command-line tool. The operator is named below.',
      clauses: [
        {
          id: '1.1',
          blocks: [
            {
              kind: 'p',
              text: `The data controller is ${LEGAL_ENTITY}, located at ${LEGAL_ADDRESS}. This policy applies to www.catalystlab.tech and the related API and command-line tool. It does not apply to third-party sites that we link to or to third-party services described in section 6.`,
            },
          ],
        },
      ],
    },
    {
      id: 'data-collected',
      title: 'Information we collect',
      summary:
        'We collect account details when you sign in, the messages you send to us, the targets you submit for scanning, and limited technical data needed to run the service.',
      clauses: [
        {
          id: '2.1',
          heading: 'Account information',
          blocks: [
            {
              kind: 'p',
              text: 'When you sign in with Google, GitHub, or an email address and password, Firebase Authentication gives us an account identifier and the profile details that the sign-in provider shares, such as your name and email address.',
            },
          ],
        },
        {
          id: '2.2',
          heading: 'Contact form',
          blocks: [
            {
              kind: 'p',
              text: 'If you send a message through the contact form, we store your email address, your message (up to 2,000 characters), and related request metadata. [ASK USER: list the metadata fields.]',
            },
          ],
        },
        {
          id: '2.3',
          heading: 'Targets and scan inputs',
          blocks: [
            {
              kind: 'p',
              text: 'When you run a diagnostic, we receive the URL or domain you submit and fetch it from our servers to produce the result. [ASK USER: confirm which results and reports are stored with your Account, and for how long.]',
            },
          ],
        },
        {
          id: '2.4',
          heading: 'Technical and usage data',
          blocks: [
            {
              kind: 'p',
              text: 'Our servers process standard request data, such as your IP address and user-agent string, to deliver responses and to enforce usage limits. Server request logs redact authorization headers. Usage analytics are described in section 4.',
            },
          ],
        },
        {
          id: '2.5',
          heading: 'Information from third parties',
          blocks: [
            {
              kind: 'p',
              text: 'If you connect a third-party service, such as a GitHub repository or an alert webhook, we receive the data that service sends us under the connection you set up.',
            },
          ],
        },
      ],
    },
    {
      id: 'purposes',
      title: 'How we use information',
      summary:
        'We use information to run the service, keep it secure, answer your requests, and meet legal obligations. [ASK USER: confirm the no-sale statement.]',
      clauses: [
        {
          id: '3.1',
          heading: 'Purposes',
          blocks: [
            {
              kind: 'ul',
              items: [
                'to create and secure accounts and to sign you in',
                'to run the diagnostics you request and return results',
                'to enforce usage limits and prevent abuse',
                'to answer contact requests and send service messages',
                'to process payments and manage plans, once paid plans are live',
                'to meet legal and tax obligations',
              ],
            },
          ],
        },
        {
          id: '3.2',
          heading: 'Legal basis',
          blocks: [
            {
              kind: 'p',
              text: '[ASK USER: legal basis for each purpose under the regimes that apply, such as GDPR Art. 6 or CCPA notice, decided with counsel.]',
            },
          ],
        },
        {
          id: '3.3',
          heading: 'No sale',
          blocks: [
            {
              kind: 'p',
              text: '[ASK USER: confirm the no-sale and no-sharing statement, and whether any advertising identifiers are used.] We do not currently run advertising trackers in the web application.',
            },
          ],
        },
      ],
    },
    {
      id: 'analytics',
      title: 'Usage analytics',
      summary:
        'The web application does not currently send analytics events. The server has analytics storage that is not yet enabled. If it is enabled, this section explains what it collects.',
      clauses: [
        {
          id: '4.1',
          heading: 'Current state',
          blocks: [
            {
              kind: 'p',
              text: 'The web application does not currently send analytics events to our servers, and no third-party analytics or advertising tags are loaded. [ASK USER: confirm before launch. If analytics will be enabled, this clause must be updated and the cookie preference center must control it.]',
            },
          ],
        },
        {
          id: '4.2',
          heading: 'If analytics is enabled',
          blocks: [
            {
              kind: 'p',
              text: 'Analytics events record the domain, page URL, referrer, browser, operating system, device type, country and city, performance measurements, and an anonymous visitor identifier. The country and city are derived from the IP address when the event arrives. The raw IP address is not stored in the analytics record. The visitor identifier is a one-way hash of the IP address, user agent, domain, and a daily salt.',
            },
          ],
        },
      ],
      annex: [
        {
          kind: 'table',
          headers: ['Field', 'Source', 'Stored'],
          rows: [
            ['domain, url, referrer', 'Page context', 'Yes (if analytics is enabled)'],
            ['browser, os, device', 'User-agent parsing', 'Yes (if analytics is enabled)'],
            ['country, city', 'IP geolocation, at ingestion', 'Yes (if analytics is enabled)'],
            ['visitor_id', 'Hash of IP, user agent, domain, daily salt', 'Yes (if analytics is enabled)'],
            ['session_id, props, vitals', 'Client event', 'Yes (if analytics is enabled)'],
            ['Raw IP address', 'Request', 'Not stored in the analytics record'],
          ],
        },
        {
          kind: 'p',
          text: 'Sources: server/routes/telemetry.ts, src/lib/analyticsEngine.ts (lines 22–25). Analytics events have no expiry in the current code. See section 9.',
        },
      ],
    },
    {
      id: 'cookies',
      title: 'Cookies and browser storage',
      summary:
        'Our application code does not set cookies. It uses browser local storage for a few preferences and identifiers. See the Cookie Policy for details.',
      clauses: [
        {
          id: '5.1',
          blocks: [
            {
              kind: 'p',
              text: 'Our application code does not write cookies. It stores a small number of items in local storage, listed in the annex below. Firebase Authentication keeps your sign-in state in browser storage that the Firebase SDK manages [ASK USER: confirm the storage mechanism]. The Cookie Policy at /cookies describes the choices available to you.',
            },
          ],
        },
      ],
      annex: [
        {
          kind: 'table',
          headers: ['Key', 'Purpose', 'Lifetime'],
          rows: [
            ['catalystlab_cookie_consent', 'Records your cookie preference choice', 'Until you clear browser storage'],
            ['catalyst_visitor_id', 'Anonymous identifier used by the client rate limiter', 'Until you clear browser storage'],
            ['catalyst_bookmarked_blogs', 'Saved blog bookmarks (purpose inferred from key name)', 'Until you clear browser storage'],
            ['catalystlab_newsletter_dismissed', 'Remembers that you dismissed the newsletter prompt (inferred from key name)', 'Until you clear browser storage'],
          ],
        },
        {
          kind: 'p',
          text: 'Source: src/utils/rateLimiter.ts and the stores under src/. The cookie preference center records a choice, but no tracking script reads it yet (see section 4).',
        },
      ],
    },
    {
      id: 'processors',
      title: 'Service providers and third parties',
      summary:
        'We share data with the service providers listed below, and only for the purposes listed. Some are used only when you use a particular feature.',
      clauses: [
        {
          id: '6.1',
          blocks: [
            {
              kind: 'p',
              text: 'We use the service providers listed in the annex to operate the service. We require them to process data only on our instructions. [ASK USER: confirm data processing agreements with each provider.]',
            },
          ],
        },
        {
          id: '6.2',
          heading: 'Domain lookups',
          blocks: [
            {
              kind: 'p',
              text: 'When the security audit runs against a domain you submit, the domain name is sent to Cloudflare’s public DNS-over-HTTPS service and to crt.sh, a certificate transparency search service. Those services receive the domain name, not your account details.',
            },
          ],
        },
      ],
      annex: [
        {
          kind: 'table',
          headers: ['Provider', 'Purpose', 'Data involved', 'When it applies'],
          rows: [
            ['Google Firebase (Authentication, Cloud Firestore)', 'Sign-in, account and app data storage', 'Account identifiers, profile details, app records', 'When you use accounts'],
            ['Google and GitHub (sign-in)', 'Sign-in', 'Profile details shared by the provider', 'When you choose that sign-in method'],
            ['MongoDB [ASK USER: hosting provider and region]', 'Analytics storage', 'Analytics events (section 4)', 'Only when the analytics store is configured'],
            ['Mailgun', 'Email sending', '[ASK USER: which emails are sent, and what data they contain]', 'Only when email is configured'],
            ['2Checkout and Dodo Payments', 'Checkout for paid plans', 'Billing details entered at checkout, plan, amount', 'When paid checkout is live [ASK USER]'],
            ['GitHub', 'Repository connections and webhooks', 'Repository event payloads', 'Only when you connect a repository'],
            ['Slack, Discord, or your own webhook endpoint', 'Alerts you configure', 'Alert content', 'Only when you configure a webhook'],
            ['Upstash Redis', 'Optional rate-limit storage', 'Rate-limit keys and request counts', 'Only when configured'],
            ['Cloudflare DNS-over-HTTPS; crt.sh', 'Domain security checks', 'Domain names you submit', 'When the security audit runs'],
            ['Unsplash; Pexels', 'Images shown on pages', 'Standard request data when images load', 'When those images load'],
          ],
        },
      ],
    },
    {
      id: 'transfers',
      title: 'International transfers',
      summary:
        'Some providers may process data outside your country. We rely on the safeguards described below.',
      clauses: [
        {
          id: '7.1',
          blocks: [
            {
              kind: 'p',
              text: '[ASK USER: hosting regions for each provider, and the transfer mechanism relied on, such as standard contractual clauses.] Where a provider is established outside your country, we aim to use the transfer safeguards the applicable law requires.',
            },
          ],
        },
      ],
    },
    {
      id: 'retention',
      title: 'How long we keep data',
      summary:
        'We keep data only as long as needed for the purpose. The table shows the current behavior and the open decisions.',
      clauses: [
        {
          id: '8.1',
          blocks: [
            {
              kind: 'p',
              text: 'Retention periods are set per data category, as shown in the annex. Where the current software does not enforce a period, the period is an open item. Until it is set, we do not promise a specific deletion date.',
            },
          ],
        },
      ],
      annex: [
        {
          kind: 'table',
          headers: ['Data', 'Where it lives', 'Retention today', 'Open decision'],
          rows: [
            ['Account record', 'Firebase Authentication and Firestore', 'Until the account is deleted', 'Deletion process and any backup period [ASK USER]'],
            ['Contact messages', 'Firestore (contact_inquiries)', 'No expiry in code', 'Retention period [ASK USER]'],
            ['Analytics events (if enabled)', 'MongoDB time-series collection', 'No expiry in code. The pricing data sets per-plan telemetry retention of 14 to 730 days, but nothing enforces it.', 'Enforce the per-plan periods, or set one period [ASK USER]'],
            ['Rate-limit counters', 'Server memory; Upstash if configured', 'Reset daily at UTC midnight and on restart', 'None'],
            ['API key records', 'Server memory', 'Lost on restart; stored as SHA-256 hashes', 'Persistence across restarts [ASK USER]'],
            ['Server request logs', 'Application logs', 'Authorization headers redacted', 'Log retention at the host [ASK USER]'],
            ['Browser storage', 'Your browser', 'Until you clear it', 'None'],
          ],
        },
      ],
    },
    {
      id: 'security',
      title: 'How we protect data',
      summary:
        'We use controls such as server-side token verification, hashed API keys, signed webhooks, and protections against unsafe outbound requests. No system is perfectly secure.',
      clauses: [
        {
          id: '9.1',
          blocks: [
            {
              kind: 'p',
              text: 'We protect data using the controls described in the annex. We review them over time, but we cannot guarantee that unauthorized access will never occur. Report suspected vulnerabilities through the process on our security page at /security.',
            },
          ],
        },
      ],
      annex: [
        {
          kind: 'ul',
          items: [
            'Sign-in tokens are verified on the server with Firebase Admin. Verification fails closed when credentials are missing.',
            'API keys are stored as SHA-256 hashes.',
            'Webhook payloads are verified with an HMAC over the raw body, using a constant-time comparison.',
            'Firestore security rules deny access by default.',
            'Security headers are set with helmet, including a Content Security Policy.',
            'Outbound requests to user-supplied URLs block private and loopback addresses, pin DNS resolution, time out after 10 seconds, cap responses at 5 MB, and re-validate redirects.',
            'Known limitation: some security state lives in server memory and is reset on restart. See the Security page.',
          ],
        },
      ],
    },
    {
      id: 'rights',
      title: 'Your rights and how to use them',
      summary:
        'You can ask what data we hold about you, ask us to correct or delete it, and object to some processing. Today these requests are handled by hand.',
      clauses: [
        {
          id: '10.1',
          heading: 'Rights',
          blocks: [
            {
              kind: 'p',
              text: '[ASK USER: list the rights that apply to your users, such as access, correction, deletion, portability, and objection, and the regimes they come from.] You can also withdraw consent where we rely on it.',
            },
          ],
        },
        {
          id: '10.2',
          heading: 'How to make a request',
          blocks: [
            {
              kind: 'p',
              text: `Send your request through the contact form at ${CONTACT_PATH} or by email to ${LEGAL_EMAIL}. We may ask you to verify your identity before acting. We aim to respond within [ASK USER: response time].`,
            },
          ],
        },
        {
          id: '10.3',
          heading: 'Current limitation',
          blocks: [
            {
              kind: 'p',
              text: '[ASK USER: publish this clause only if it stays true at launch.] Self-service data export and account deletion are not yet available. Requests are handled manually.',
            },
          ],
        },
      ],
    },
    {
      id: 'children',
      title: 'Children',
      summary: 'The service is not directed at children. [ASK USER: confirm the minimum age.]',
      clauses: [
        {
          id: '11.1',
          blocks: [
            {
              kind: 'p',
              text: '[ASK USER: minimum age and the rule for users below it.] If we learn that we have collected data from someone below that age, we will delete it.',
            },
          ],
        },
      ],
    },
    {
      id: 'breach',
      title: 'Security incidents',
      summary: 'If a breach affects your data, we will notify you and the authorities as the law requires.',
      clauses: [
        {
          id: '12.1',
          blocks: [
            {
              kind: 'p',
              text: '[ASK USER: notification timeline for authorities and users, such as 72 hours under GDPR.] We will describe the incident, its likely impact, and the steps we are taking.',
            },
          ],
        },
      ],
    },
    {
      id: 'changes',
      title: 'Changes to this policy',
      summary: 'We update this policy when our practices change. Material changes are announced before they take effect.',
      clauses: [
        {
          id: '13.1',
          blocks: [
            {
              kind: 'p',
              text: `We will publish each change with a new effective date. The effective date for this version is ${EFFECTIVE_DATE}. [ASK USER: notice period and channel for material changes.]`,
            },
          ],
        },
      ],
    },
    {
      id: 'contact',
      title: 'Contact',
      summary: 'Use the contact form or email to reach our privacy team.',
      clauses: [
        {
          id: '14.1',
          blocks: [
            {
              kind: 'p',
              text: `Privacy questions and requests: use ${CONTACT_PATH} or write to ${LEGAL_EMAIL}. [ASK USER: confirm the mailbox is monitored, and name a privacy contact or data protection officer if one is required.]`,
            },
          ],
        },
      ],
    },
  ],
};
