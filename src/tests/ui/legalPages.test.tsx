import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TermsPage } from '../../pages/TermsPage';
import { PrivacyPage } from '../../pages/PrivacyPage';
import { RefundPage } from '../../pages/RefundPage';
import { termsDocument } from '../../legal/terms';
import { privacyDocument } from '../../legal/privacy';
import { refundDocument } from '../../legal/refund';
import { CANONICAL } from '../../navigation';
import type { LegalDocumentContent } from '../../legal/types';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

/** Every text fragment of a document, including annexes, flattened to a string. */
function documentText(doc: LegalDocumentContent): string {
  const parts: string[] = [doc.title, doc.intro, doc.seoDescription];
  for (const section of doc.sections) {
    parts.push(section.title, section.summary);
    for (const clause of section.clauses) {
      if (clause.heading) parts.push(clause.heading);
      for (const block of clause.blocks) parts.push(JSON.stringify(block));
    }
    for (const block of section.annex ?? []) parts.push(JSON.stringify(block));
  }
  return parts.join('\n');
}

const documents: Array<{ name: string; doc: LegalDocumentContent; Page: React.FC }> = [
  { name: 'Terms', doc: termsDocument, Page: TermsPage },
  { name: 'Privacy', doc: privacyDocument, Page: PrivacyPage },
  { name: 'Refund', doc: refundDocument, Page: RefundPage },
];

describe('legal document content model', () => {
  it.each(documents)('$name has unique section ids and clause ids', ({ doc }) => {
    const sectionIds = doc.sections.map((s) => s.id);
    expect(new Set(sectionIds).size).toBe(sectionIds.length);

    const clauseIds = doc.sections.flatMap((s) => s.clauses.map((c) => c.id));
    expect(clauseIds.length).toBeGreaterThan(0);
    expect(new Set(clauseIds).size).toBe(clauseIds.length);
  });

  it.each(documents)('$name gives every section a plain-language summary', ({ doc }) => {
    for (const section of doc.sections) {
      expect(section.summary.trim().length).toBeGreaterThan(20);
      expect(section.clauses.length).toBeGreaterThan(0);
    }
  });

  it.each(documents)('$name has no unresolved [ASK USER] marker left', ({ doc }) => {
    // Every open item was resolved by an owner decision (docs/plan/decisions.md,
    // answers #6 and #7 plus Q20-Q36, 2026-10-19). A marker reappearing here
    // means published copy is asserting something nobody has decided.
    expect(documentText(doc)).not.toContain('[ASK USER');
    expect(documentText(doc)).not.toContain('${'); // un-interpolated template literal
  });

  it.each(documents)('$name carries the decided legal values', ({ doc }) => {
    const all = documentText(doc);
    // Q29/#7: notices go to a monitored mailbox, no postal address is published.
    expect(all).toContain('legal@catalystlab.tech');
    expect(all).not.toContain('[ASK USER: registered address]');
    // Every document states when it took effect (Q34: effective on publication).
    expect(all).toContain('2026-10-19');
  });

  it('publishes the decisions the owner made', () => {
    const terms = documentText(termsDocument);
    const privacy = documentText(privacyDocument);
    const refund = documentText(refundDocument);

    // Q33/Q35: governing law and forum.
    expect(terms).toContain("laws of the People's Republic of Bangladesh");
    expect(terms).toContain('courts of Mymensingh');
    // Q20: minimum age and breach notification window.
    expect(terms).toContain('18 years old');
    expect(privacy).toContain('72 hours');
    expect(privacy).toContain('18 and over');
    // Q21: refund windows and handling service levels.
    expect(refund).toContain('7 days of the charge');
    expect(refund).toContain('14 days of the charge');
    expect(refund).toContain('2 business days');
    expect(refund).toContain('5 business days');
    expect(refund).toContain('10 business days');
    // Q24: liability cap. Q25: notice period. Q28: rights response window.
    expect(terms).toContain('fees you paid us in the 12 months before the event');
    expect(terms).toContain('30 days');
    expect(privacy).toContain('one month');
    // Q27: no advertising identifiers; subprocessors under a DPA.
    expect(privacy).toContain('advertising identifier');
    expect(privacy).toContain('data processing agreement');
    // Q26/D9: retention is enforced, per plan.
    expect(privacy).toContain('14 days on Community');
    expect(privacy).toContain('730');
    expect(privacy).toContain('365');
  });

  it('does not reintroduce claims the code cannot support', () => {
    const all = documents.map((d) => documentText(d.doc)).join('\n');
    const forbidden = [
      'certified',
      'CERTIFIED',
      '99.99',
      'Financial SLA',
      'zero third-party',
      'one-click purge',
      'Cryptographic purge',
      'Ephemeral (1 hr)',
      'Google OAuth only',
    ];
    for (const phrase of forbidden) {
      expect(all.includes(phrase)).toBe(false);
    }
  });
});

describe.each(documents)('$name page', ({ doc, Page }) => {
  it('renders the title, every section, and the draft notice', () => {
    const { container } = render(<Page />, { wrapper });
    const h1 = container.querySelector('h1');
    expect(h1?.textContent).toBe(doc.title);
    for (const section of doc.sections) {
      expect(container.querySelector(`#${section.id}`)).not.toBeNull();
    }
    expect(container.querySelector('[role="note"]')?.textContent).toContain('Version 1.0');
  });

  it('renders no [ASK USER] marker anywhere on the page', () => {
    const { container } = render(<Page />, { wrapper });
    // The highlighter still exists for future drafts; a published page shows none.
    expect(container.querySelectorAll('mark[data-ask-user="true"]').length).toBe(0);
    expect(container.textContent ?? '').not.toContain('[ASK USER');
  });

  it('keeps technical annexes collapsed by default', () => {
    const { container } = render(<Page />, { wrapper });
    const annexes = doc.sections.filter((s) => s.annex && s.annex.length > 0).length;
    const details = container.querySelectorAll('details');
    expect(details.length).toBe(annexes);
    details.forEach((d) => expect(d.hasAttribute('open')).toBe(false));
  });
});

describe('legal page wiring', () => {
  it('exposes the refund route in the canonical navigation map', () => {
    expect(CANONICAL.refund).toBe('/refund');
    expect(CANONICAL.terms).toBe('/terms');
    expect(CANONICAL.privacy).toBe('/privacy');
    expect(CANONICAL.cookies).toBe('/cookies');
  });

  it('renders plan prices from the pricing data, not hard-coded copy', () => {
    const { container } = render(<RefundPage />, { wrapper });
    const text = container.textContent ?? '';
    expect(text).toContain('Starter');
    expect(text).toContain('$9 / month');
    expect(text).toContain('$99 / month');
    // The annual column used to be an [ASK USER] marker; it now shows the
    // annual totals that server/core/pricing.ts charges.
    expect(text).toContain('$84 billed yearly ($7 / month)');
    expect(text).toContain('$948 billed yearly ($79 / month)');
    expect(text).not.toContain('[ASK USER');
  });
});
