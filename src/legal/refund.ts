import type { LegalDocumentContent } from './types';
import { CONTACT_PATH, LEGAL_DRAFT_VERSION, LEGAL_EMAIL } from './legalMeta';

export const refundDocument: LegalDocumentContent = {
  slug: 'refund',
  title: 'Refund Policy',
  seoDescription:
    'How refunds, cancellations, trials, and billing errors work for CatalystLab paid plans, with the steps to request one.',
  canonicalPath: '/refund',
  version: LEGAL_DRAFT_VERSION,
  intro:
    'This policy explains when you can get your money back for a CatalystLab paid plan, how to ask for it, and how long it takes. The Community plan is free and is not charged. Where the process depends on a provider or a decision the company has not made yet, the policy says so.',
  sections: [
    {
      id: 'scope',
      title: 'Scope and plans',
      summary:
        'This policy covers the paid plans Starter, Pro, Team, and Enterprise, and any add-on purchases. The Community plan is free.',
      clauses: [
        {
          id: '1.1',
          blocks: [
            {
              kind: 'p',
              text: 'This policy applies to purchases made on www.catalystlab.tech. It does not change your statutory rights under the consumer law that applies where you live.',
            },
          ],
        },
        {
          id: '1.2',
          heading: 'Prices',
          blocks: [
            {
              kind: 'p',
              text: 'The prices in the annex are the monthly list prices. The price shown at checkout, for the billing cycle you choose, is the price you pay. [ASK USER: confirm the annual prices. The checkout server and the pricing page currently disagree.]',
            },
          ],
        },
      ],
      annex: [{ kind: 'plan-table' }],
    },
    {
      id: 'trials',
      title: 'Free plan and trials',
      summary:
        'You are never charged for the Community plan. Paid plans include a 7-day trial, one per account.',
      clauses: [
        {
          id: '2.1',
          heading: 'Community plan',
          blocks: [{ kind: 'p', text: 'The Community plan has no charge and no refund.' }],
        },
        {
          id: '2.2',
          heading: 'Trials',
          blocks: [
            {
              kind: 'p',
              text: 'Starter, Pro, Team, and Enterprise include a 7-day trial, which can be used once per account. [ASK USER: confirm whether a payment method is required to start a trial, and whether any charge is made during the trial.] If you cancel before the trial ends, you will not be charged.',
            },
          ],
        },
      ],
    },
    {
      id: 'eligibility',
      title: 'When you can get a refund',
      summary:
        'You can request a refund within the refund window if you have not used the paid features in a material way. [ASK USER: confirm the refund commitment.] Other cases are reviewed individually.',
      clauses: [
        {
          id: '3.1',
          heading: 'Refund window',
          blocks: [
            {
              kind: 'p',
              text: '[ASK USER: refund window for monthly plans, for example 7 days from the first paid charge.] [ASK USER: refund window for annual plans, for example 14 days.] Requests made after the window are reviewed individually.',
            },
          ],
        },
        {
          id: '3.2',
          heading: 'Eligible cases',
          blocks: [
            {
              kind: 'ul',
              items: [
                'You were charged within the refund window and have not used the paid features in a material way.',
                'You were charged twice for the same billing period.',
                'You were charged a different amount from the price shown at checkout (see section 6).',
                'A fault on our side stopped you from using the paid features for a substantial part of the billing period, and we could not fix it within a reasonable time.',
              ],
            },
          ],
        },
        {
          id: '3.3',
          heading: 'Not eligible',
          blocks: [
            {
              kind: 'ul',
              items: [
                'Requests made after the refund window, unless section 3.2 applies.',
                'Charges for usage that already consumed compute, where the usage is material. [ASK USER: define "material".]',
                'Accounts suspended or terminated for breach of the Terms of Service.',
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'request',
      title: 'How to request a refund',
      summary:
        'Sign in, send us a request with your order details, and we will confirm the decision in writing.',
      clauses: [
        {
          id: '4.1',
          heading: 'Steps',
          blocks: [
            {
              kind: 'ol',
              items: [
                'Sign in to the account that made the purchase.',
                `Send a request through the contact form at ${CONTACT_PATH} with the subject "Refund request", or write to ${LEGAL_EMAIL}.`,
                'Include the account email address, the plan, the billing date, the amount charged, and the reason for the request. Attach the order or receipt ID if you have it.',
                'We confirm receipt within [ASK USER: acknowledgment time, for example 2 business days].',
                'We review the request and reply with a decision within [ASK USER: decision time, for example 5 business days].',
                'If approved, we ask the payment provider to refund the original payment method. Your plan moves to the Community plan at the same time.',
                'You receive a written confirmation of the refund amount and the expected date it reaches your account.',
              ],
            },
          ],
        },
        {
          id: '4.2',
          heading: 'Refund amount',
          blocks: [
            {
              kind: 'p',
              text: 'An approved refund covers the amount charged for the disputed billing period, minus any non-refundable charges listed in section 3.3. [ASK USER: confirm whether payment provider fees are refunded.]',
            },
          ],
        },
      ],
    },
    {
      id: 'processing',
      title: 'How refunds are paid out',
      summary:
        'Refunds go back to the original payment method. The payment provider sets the final timing.',
      clauses: [
        {
          id: '5.1',
          blocks: [
            {
              kind: 'p',
              text: '[ASK USER: name the merchant of record for each payment provider (2Checkout and Dodo Payments are both integrated in the code).] Refunds are issued by the payment provider that processed the original charge. Processing time depends on the provider and your bank, typically [ASK USER: expected processing time] after approval.',
            },
          ],
        },
      ],
      annex: [
        {
          kind: 'p',
          text: '[ASK USER: internal reviewer note, remove before publication.] Current state: the checkout server creates payment sessions for 2Checkout and Dodo Payments. Webhooks for both providers verify the signature and return success, but do not yet grant or revoke plans (server/routes/payments.ts). Until paid activation is implemented, refunds must be handled manually. [ASK USER: confirm the manual refund procedure before paid plans open.]',
        },
      ],
    },
    {
      id: 'cancellation',
      title: 'Cancelling a subscription',
      summary:
        'You can stop renewal at any time. Cancelling does not refund the current period unless section 3 applies.',
      clauses: [
        {
          id: '6.1',
          heading: 'Stopping renewal',
          blocks: [
            {
              kind: 'p',
              text: 'You can stop renewal at any time. [ASK USER: describe the self-service cancellation path. The current build supports moving to the Community plan, but no cancellation route exists yet.] Until then, send a cancellation request through the contact form.',
            },
          ],
        },
        {
          id: '6.2',
          heading: 'Access after cancelling',
          blocks: [
            {
              kind: 'p',
              text: 'Your paid features remain available until the end of the period you have paid for. After that, your plan moves to the Community plan. [ASK USER: confirm this rule.]',
            },
          ],
        },
      ],
    },
    {
      id: 'billing-errors',
      title: 'Billing errors and price differences',
      summary:
        'If you are charged more than the price you were shown, we refund the difference. If we charge you twice, we refund the duplicate.',
      clauses: [
        {
          id: '7.1',
          blocks: [
            {
              kind: 'p',
              text: 'If the amount charged differs from the price shown at checkout, we will refund the difference in full. If you were charged more than once for the same period, we will refund the duplicate charge in full. To report either, use the steps in section 4.',
            },
          ],
        },
      ],
    },
    {
      id: 'disputes',
      title: 'Chargebacks and disputes',
      summary:
        'Please contact us before you file a chargeback. Most problems can be fixed faster directly.',
      clauses: [
        {
          id: '8.1',
          blocks: [
            {
              kind: 'p',
              text: 'If you believe a charge is wrong, contact us first. We will review it promptly. Filing a chargeback while a request is open may delay the refund and suspend your account until the dispute is resolved.',
            },
          ],
        },
      ],
    },
    {
      id: 'changes',
      title: 'Changes and contact',
      summary:
        'We may update this policy. The version in force at the time of purchase applies to that purchase.',
      clauses: [
        {
          id: '9.1',
          blocks: [
            {
              kind: 'p',
              text: `We may update this policy. Changes apply to purchases made after the effective date. Questions: use ${CONTACT_PATH} or write to ${LEGAL_EMAIL}. [ASK USER: confirm the mailbox is monitored.]`,
            },
          ],
        },
      ],
    },
  ],
};
