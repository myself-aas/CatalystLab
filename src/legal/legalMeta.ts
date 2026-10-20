/**
 * Shared values used by the legal documents.
 *
 * Every value here is a published owner decision recorded in
 * `docs/plan/decisions.md` (answers #6 and #7, and Q20-Q36, 2026-10-19). No
 * placeholder remains: changing a value here changes every legal page at once,
 * so the documents cannot drift from the decisions.
 *
 * $0-cost posture (answer #7): no registered postal address is published, no
 * data protection officer is appointed, and no third-party analytics or
 * advertising identifier is used. Notices travel through a monitored mailbox.
 */

/** Version shown in the header of every legal page. */
export const LEGAL_VERSION = '1.0';
export const LEGAL_VERSION_DATE = '2026-10-19';

export const SITE_ORIGIN = 'https://www.catalystlab.tech';

/** The in-app contact form stores inquiries in Firestore (server/routes/contact.ts). */
export const CONTACT_PATH = '/contact';

/** Monitored legal mailbox (Q29). This is also the notice address: no postal address is published. */
export const LEGAL_EMAIL = 'legal@catalystlab.tech';

export const LEGAL_ENTITY = 'CatalystLab Inc.';

/** Q33: governing law. */
export const GOVERNING_LAW = "the laws of the People's Republic of Bangladesh";
/** Q35: forum. */
export const GOVERNING_COURTS = 'the courts of Mymensingh, Bangladesh';

/** Q34: the documents take effect on the day they are published. */
export const EFFECTIVE_DATE = LEGAL_VERSION_DATE;

/** Q20: minimum age, and the breach notification window. */
export const MINIMUM_AGE = 18;
export const BREACH_NOTICE_HOURS = 72;

/** Q21: refund window per billing cycle. */
export const REFUND_WINDOW_MONTHLY_DAYS = 7;
export const REFUND_WINDOW_ANNUAL_DAYS = 14;
/** Q21: refund handling service levels, in business days. */
export const REFUND_ACK_BUSINESS_DAYS = 2;
export const REFUND_DECISION_BUSINESS_DAYS = 5;
export const REFUND_PROCESS_BUSINESS_DAYS = 10;

/** Q22: trials need no payment method; cancelling returns the account to Community. */
export const TRIAL_DAYS = 7;

/** Q24: liability cap. */
export const LIABILITY_CAP = 'the fees you paid us in the 12 months before the event that gave rise to the claim';

/** Q25: notice period for material changes to the legal documents or the plans. */
export const CHANGE_NOTICE_DAYS = 30;

/** Q28: response window for data subject rights requests. */
export const RIGHTS_RESPONSE_WINDOW = 'one month';

/** Q26/D9: telemetry retention windows, in days, enforced by server/core/retention.ts. */
export const RETENTION_HARD_CAP_DAYS = 730;
export const CONTACT_RETENTION_DAYS = 365;
export const PAYMENT_EVENT_RETENTION_DAYS = 730;

/** Q36: data residency. */
export const DATA_RESIDENCY =
  'the Oracle Cloud Infrastructure home region you select at signup; account and telemetry data is written to that region first';

/** Q27 + D10: subprocessors, each under a data processing agreement. Sentry (D10) is the eighth. */
export const SUBPROCESSOR_COUNT = 8;

/** Shown on every legal page. Not a draft warning: the text is published as-is. */
export const PUBLICATION_NOTICE = `Version ${LEGAL_VERSION}, effective ${EFFECTIVE_DATE}. Questions about any clause, and every rights request, go to ${LEGAL_EMAIL}; that mailbox is monitored and answered.`;
