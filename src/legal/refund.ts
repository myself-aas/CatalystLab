import type { LegalDocumentContent } from './types';
import {
  CHANGE_NOTICE_DAYS,
  CONTACT_PATH,
  EFFECTIVE_DATE,
  LEGAL_EMAIL,
  LEGAL_VERSION,
  REFUND_ACK_BUSINESS_DAYS,
  REFUND_DECISION_BUSINESS_DAYS,
  REFUND_PROCESS_BUSINESS_DAYS,
  REFUND_WINDOW_ANNUAL_DAYS,
  REFUND_WINDOW_MONTHLY_DAYS,
  TRIAL_DAYS,
} from './legalMeta';

export const refundDocument: LegalDocumentContent = {
  slug: 'refund',
  title: 'Refund Policy',
  seoDescription:
    'How refunds, cancellations, trials, and billing errors work for CatalystLab paid plans, with the steps to request one.',
  canonicalPath: '/refund',
  version: LEGAL_VERSION,
  intro:
    `This policy explains when you can get your money back for a CatalystLab paid plan, how to ask for it, and how long it takes. The Community plan is free and is not charged. Every window and service level below is a decided commitment, not a placeholder. This version took effect on ${EFFECTIVE_DATE}.`,
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
              text: 'The prices in the annex are the monthly list prices. The annex also shows the annual total, and both figures are rendered from the same data that drives checkout, so they cannot disagree. The price shown at checkout, for the billing cycle you choose, is the price you pay.',
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
              text: `Starter, Pro, Team, and Enterprise include a ${TRIAL_DAYS}-day trial, which can be used once per account. No payment method is required to start a trial and no charge is made during it. If you cancel before the trial ends, you will not be charged.`,
            },
          ],
        },
      ],
    },
    {
      id: 'eligibility',
      title: 'When you can get a refund',
      summary:
        'You can request a refund within the refund window if you have not used the paid features in a material way, and in that case the refund is granted as of right. Material use is judged against the entitlement you paid for: as a rule, if you have consumed more than half of the quota included in your plan during the paid period, we treat the plan as materially used. Where your usage sits close to that line, we decide in your favour. Other cases are reviewed individually.',
      clauses: [
        {
          id: '3.1',
          heading: 'Refund window',
          blocks: [
            {
              kind: 'p',
              text: `For a monthly plan you can request a refund within ${REFUND_WINDOW_MONTHLY_DAYS} days of the charge. For an annual plan, within ${REFUND_WINDOW_ANNUAL_DAYS} days of the charge. Both windows start on the date of the first paid charge for that plan. Requests made after the window are reviewed individually.`,
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
                'Charges for usage that already consumed compute, where that usage exceeds half of the quota included in the paid plan.',
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
                `We confirm receipt within ${REFUND_ACK_BUSINESS_DAYS} business days.`,
                `We review the request and reply with a decision within ${REFUND_DECISION_BUSINESS_DAYS} business days.`,
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
              text: 'An approved refund covers the amount charged for the disputed billing period, minus any non-refundable charges listed in section 3.3. Payment provider fees are not deducted from your refund; we absorb them.',
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
              text: `2Checkout (Verifone) and Dodo Payments each act as merchant of record for the checkout they processed; the provider named on your receipt is the one that refunds you. Refunds are issued by that provider and reach you up to ${REFUND_PROCESS_BUSINESS_DAYS} business days after approval, depending on the provider and your bank.`,
            },
          ],
        },
      ],
      annex: [
        {
          kind: 'p',
          text: 'Current state: the checkout server creates payment sessions for 2Checkout and Dodo Payments, and verified webhook events for both providers grant, renew, cancel or refund a plan and write an audit record for every event they accept (server/core/subscriptions.ts). A refund event moves the plan back to Community and records the refund; the money itself is returned by the payment provider that processed the charge.',
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
              text: 'You can stop renewal at any time by sending a cancellation request through the contact form or by writing to the monitored legal mailbox, and you can move to the Community plan yourself from your dashboard.',
            },
          ],
        },
        {
          id: '6.2',
          heading: 'Access after cancelling',
          blocks: [
            {
              kind: 'p',
              text: 'Your paid features remain available until the end of the period you have paid for. After that, your plan moves to the Community plan automatically and no further charge is made.',
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
              text: `We may update this policy. Changes apply to purchases made after the effective date, and we give at least ${CHANGE_NOTICE_DAYS} days' notice for a material change. Questions: use ${CONTACT_PATH} or write to ${LEGAL_EMAIL}, which is monitored and answered.`,
            },
          ],
        },
      ],
    },
  ],
};
