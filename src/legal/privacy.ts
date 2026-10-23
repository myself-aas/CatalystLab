import type { LegalDocumentContent } from './types';
import {
  BREACH_NOTICE_HOURS,
  CHANGE_NOTICE_DAYS,
  CONTACT_PATH,
  CONTACT_RETENTION_DAYS,
  DATA_RESIDENCY,
  EFFECTIVE_DATE,
  GOVERNING_LAW,
  LEGAL_EMAIL,
  LEGAL_ENTITY,
  LEGAL_VERSION,
  MINIMUM_AGE,
  PAYMENT_EVENT_RETENTION_DAYS,
  RETENTION_HARD_CAP_DAYS,
  RIGHTS_RESPONSE_WINDOW,
  SUBPROCESSOR_COUNT,
} from './legalMeta';

export const privacyDocument: LegalDocumentContent = {
  slug: 'privacy',
  title: 'Privacy Policy',
  seoDescription:
    'What CatalystLab collects, why, who processes it, how long we keep it, and what you can ask us to do with it.',
  canonicalPath: '/privacy',
  version: LEGAL_VERSION,
  intro:
    'This policy explains what personal data CatalystLab processes, why, which service providers help us, how long we keep it, and how to make a request. It describes what the software does today.',
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
              text: `The data controller is ${LEGAL_ENTITY}. We do not publish a postal address: every notice and rights request goes to the monitored mailbox ${LEGAL_EMAIL} or through the contact form at ${CONTACT_PATH}, and both are answered. This policy applies to www.catalystlab.tech and the related API and command-line tool. It does not apply to third-party sites that we link to or to third-party services described in section 6.`,
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
              text: 'If you send a message through the contact form, we store your email address, your message (up to 2,000 characters), and related request metadata: a submission timestamp, a deletion timestamp, the first 16 hex characters of a SHA-256 hash of your IP address (never the address itself), your browser user-agent string truncated to 400 characters, and up to six optional form fields.',
            },
          ],
        },
        {
          id: '2.3',
          heading: 'Targets and scan inputs',
          blocks: [
            {
              kind: 'p',
              text: 'When you run a diagnostic, we receive the URL or domain you submit and fetch it from our servers to produce the result. Audit events are stored with your Account only when the analytics store is configured, and they follow the per-plan telemetry retention periods in section 8 (14 to 730 days). For a visitor who does not sign in we keep only the daily usage counters described in section 5.',
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
        'We use information to run the service, keep it secure, answer your requests, and meet legal obligations. We do not sell personal data, and we do not exchange it for anything of value.',
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
              text: `Where a legal basis is required, we rely on: your consent for optional communications and for anything you choose to submit; performance of our contract with you, to run diagnostics, keep your Account and bill a paid plan; our legitimate interests in securing the service, preventing abuse and measuring reliability; and compliance with a legal obligation where the law requires us to keep or disclose a record. You can withdraw consent at any time through ${CONTACT_PATH}, which does not affect processing that already happened.`,
            },
          ],
        },
        {
          id: '3.3',
          heading: 'No sale',
          blocks: [
            {
              kind: 'p',
              text: 'We do not sell personal data and we do not share it for cross-context behavioural advertising. No advertising identifier, advertising cookie or ad-tech SDK is used anywhere in the product. The only recipients of your data are the service providers listed in section 6, each under a written data processing agreement that limits it to acting on our instructions.',
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
              text: 'The web application does not currently send analytics events to our servers, and no third-party analytics or advertising tag is loaded, and no analytics beacon is sent from the browser. Audit telemetry that you trigger is recorded by our own API only when the analytics store is configured, and it is bound to the retention periods in section 8.',
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
              text: 'Our application code does not write cookies. It stores a small number of items in local storage, listed in the annex below. Firebase Authentication keeps your sign-in state in browser storage that the Firebase SDK manages (IndexedDB, with a localStorage fallback where IndexedDB is unavailable). The Cookie Policy at /cookies describes the choices available to you.',
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
              text: `We use the service providers listed in the annex to operate the service. We have a data processing agreement with each of the ${SUBPROCESSOR_COUNT} providers that process personal data on our instructions, and we require them to act only on our instructions, keep the data confidential, and tell us about a personal data breach without undue delay.`,
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
            ['MongoDB (the managed deployment named by MONGODB_URI)', 'Analytics storage', 'Analytics events (section 4)', 'Only when the analytics store is configured'],
            ['Mailgun', 'Transactional email', 'Recipient address, subject and body of the message: sign-in links, plan and billing notices, and replies to contact requests', 'Only when email is configured'],
            ['2Checkout (Verifone) and Dodo Payments, as merchant of record', 'Checkout for paid plans', 'Billing details you enter at checkout, plan, billing cycle, amount and the provider event identifier', 'When paid checkout is configured'],
            ['GitHub', 'Repository connections and webhooks', 'Repository event payloads', 'Only when you connect a repository'],
            ['Slack, Discord, or your own webhook endpoint', 'Alerts you configure', 'Alert content', 'Only when you configure a webhook'],
            [`Oracle Cloud Infrastructure — ${DATA_RESIDENCY}`, 'Application and data hosting', 'Account records, telemetry events and request logs', 'Always'],
            ['Cloudflare', 'DNS, CDN, edge security and the API proxy', 'IP address, requested path, user agent and edge security decisions', 'Always'],
            ['Sentry', 'Error tracking (D10)', 'Error messages, stack traces and the route that failed, after our scrubber removes emails, IP addresses, cookies, headers and credentials; nothing is sent from the browser directly', 'Only when error tracking is configured'],
            ['Upstash Redis', 'Rate-limit and daily quota counters', 'Rate-limit keys and request counts', 'Only when configured'],
            ['Cloudflare DNS-over-HTTPS; crt.sh', 'Domain security checks', 'Domain names you submit', 'When the security audit runs'],
            ['Unsplash; Pexels', 'Images shown on pages', 'Standard request data when images load', 'When those images load'],
          ],
        },
        {
          kind: 'p',
          text: `The ${SUBPROCESSOR_COUNT} categories that process personal data on our instructions under a data processing agreement are: Google Firebase, our MongoDB deployment, Oracle Cloud Infrastructure, Mailgun, the payment providers, Cloudflare, Upstash and Sentry. The remaining rows act on your own configuration (GitHub, Slack, Discord, your webhook endpoint) or serve public assets (Unsplash, Pexels); they are not our processors.`,
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
              text: `${DATA_RESIDENCY}. Our processors are established in the United States, the European Union and Bangladesh. Where a processor is established outside your country we rely on the safeguards the applicable law requires: the standard contractual clauses each provider publishes and, where a provider holds one, a certification such as the EU-US Data Privacy Framework. We do not transfer personal data to any other recipient without telling you first.`,
            },
          ],
        },
      ],
    },
    {
      id: 'retention',
      title: 'How long we keep data',
      summary:
        'We keep data only as long as needed for the purpose. The periods below are enforced in code, not just written down.',
      clauses: [
        {
          id: '8.1',
          blocks: [
            {
              kind: 'p',
              text: `Retention periods are set per data category and enforced in code (server/core/retention.ts), as shown in the annex. Telemetry follows the period attached to your plan — 14 days on Community, 60 on Starter, 90 on Pro, 365 on Team and 730 on Enterprise — with ${RETENTION_HARD_CAP_DAYS} days as an absolute ceiling enforced by a database TTL index. A background sweep runs at most once every six hours per process and deletes anything past its period, including records whose plan can no longer be resolved, which fall back to the 14-day floor.`,
            },
          ],
        },
      ],
      annex: [
        {
          kind: 'table',
          headers: ['Data', 'Where it lives', 'Retention period', 'How it is enforced'],
          rows: [
            ['Account record', 'Firebase Authentication and Firestore', 'Until the account is deleted', 'Deleted on request via legal@catalystlab.tech; provider backups age out on the provider schedule'],
            ['Contact messages', 'Firestore (contact_inquiries)', `${CONTACT_RETENTION_DAYS} days`, 'expireAt field plus the scheduled sweep'],
            ['Analytics and telemetry events', 'MongoDB time-series collection', 'Per plan: 14 / 60 / 90 / 365 / 730 days, capped at 730', 'Scheduled sweep plus a 730-day TTL index'],
            ['Payment events', 'Firestore (payment_events)', `${PAYMENT_EVENT_RETENTION_DAYS} days`, 'expireAt field plus the scheduled sweep'],
            ['Rate-limit and daily usage counters', 'Upstash when configured, otherwise process memory', 'Reset daily at UTC midnight', 'Key expiry, or a process restart'],
            ['API key records', 'Firestore, stored as SHA-256 hashes', 'Until you revoke or delete the key', 'Self-service rotate, revoke and delete endpoints; hashes survive restarts'],
            ['Server request logs', 'Application logs (stdout)', '30 days', 'Authorization headers are redacted before logging; the host log pipeline rotates them. Logs captured in the browser are never sent to us.'],
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
              text: 'Depending on where you live you may have the right to: access the personal data we hold; correct inaccurate data; delete your data; receive a portable copy in a structured, commonly used, machine-readable format; object to processing based on our legitimate interests; restrict processing while a request is reviewed; opt out of any sale or sharing of personal data (we do none); and lodge a complaint with your supervisory authority. You can also withdraw consent where we rely on it, without affecting earlier processing.',
            },
          ],
        },
        {
          id: '10.2',
          heading: 'How to make a request',
          blocks: [
            {
              kind: 'p',
              text: `Send your request through the contact form at ${CONTACT_PATH} or by email to ${LEGAL_EMAIL}. We may ask you to verify your identity before acting. We answer every verified request within ${RIGHTS_RESPONSE_WINDOW}, and we will tell you within that window if we need an extension or if we cannot act.`,
            },
          ],
        },
        {
          id: '10.3',
          heading: 'Current limitation',
          blocks: [
            {
              kind: 'p',
              text: 'Self-service data export and account deletion are not yet available in the product. Requests are handled manually: write to the monitored mailbox, we produce the export or delete the account, and we confirm in writing.',
            },
          ],
        },
      ],
    },
    {
      id: 'children',
      title: 'Children',
      summary: `The service is not directed at children. You must be ${MINIMUM_AGE} or older to create an Account.`,
      clauses: [
        {
          id: '11.1',
          blocks: [
            {
              kind: 'p',
              text: `The Service is intended for people aged ${MINIMUM_AGE} and over. We do not knowingly collect personal data from anyone younger. If we learn that we have collected data from someone below that age, we will delete it and close the account.`,
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
              text: `We will notify a competent supervisory authority within ${BREACH_NOTICE_HOURS} hours of becoming aware of a personal data breach that is likely to result in a risk to your rights. Where the breach is likely to result in a high risk to you, we will also tell you directly without undue delay, using the email address on your Account and a notice on the site. We will describe the incident, its likely impact, the categories and approximate volume of records affected, and the steps we are taking.`,
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
              text: `We will publish each change with a new effective date. The effective date for this version is ${EFFECTIVE_DATE}. For a material change we will give at least ${CHANGE_NOTICE_DAYS} days' notice, through an in-product banner on the affected pages and an email to the address on your Account.`,
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
              text: `Privacy questions and rights requests: use ${CONTACT_PATH} or write to ${LEGAL_EMAIL}. That mailbox is monitored and answered within ${RIGHTS_RESPONSE_WINDOW}. We are not required to appoint a data protection officer under the regimes we have assessed, and none is appointed; the same mailbox handles privacy questions. This policy is governed by ${GOVERNING_LAW}.`,
            },
          ],
        },
      ],
    },
  ],
};
