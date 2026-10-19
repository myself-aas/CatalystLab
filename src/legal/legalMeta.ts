/**
 * Shared values used by the legal documents.
 *
 * Every value that needs a business decision is an [ASK USER] placeholder.
 * Do not replace a placeholder with a guess: the legal entity, governing law,
 * and retention periods are decisions for the company and its counsel.
 */

export const LEGAL_DRAFT_VERSION = '0.1-draft';
export const LEGAL_DRAFT_DATE = '2026-10-19';

export const SITE_ORIGIN = 'https://www.catalystlab.tech';

/** The in-app contact form stores inquiries in Firestore (server/routes/contact.ts). */
export const CONTACT_PATH = '/contact';

/** Address found in the codebase. Confirm that the mailbox is monitored before publishing. */
export const LEGAL_EMAIL = 'legal@catalystlab.tech';

export const LEGAL_ENTITY = '[ASK USER: legal entity name; the footer currently shows "CatalystLab Inc."]';
export const LEGAL_ADDRESS = '[ASK USER: registered address]';
export const GOVERNING_LAW = '[ASK USER: governing law and courts]';
export const EFFECTIVE_DATE = '[ASK USER: effective date]';

/** Shown on every legal page until counsel signs off. */
export const DRAFT_NOTICE =
  'Draft for review. This text has not been approved by counsel. Items in amber brackets are open decisions and must be resolved before publication.';
