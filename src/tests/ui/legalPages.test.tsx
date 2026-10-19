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

  it.each(documents)('$name marks all open items with [ASK USER]', ({ doc }) => {
    // Any claim the code cannot back must stay open. Each document has at least one open item.
    expect(documentText(doc)).toContain('[ASK USER');
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
    expect(container.querySelector('[role="note"]')?.textContent).toContain('Draft for review');
  });

  it('highlights every [ASK USER] marker and leaves no raw markers in plain text', () => {
    const { container } = render(<Page />, { wrapper });
    const marks = container.querySelectorAll('mark[data-ask-user="true"]');
    expect(marks.length).toBeGreaterThan(0);
    marks.forEach((m) => expect(m.textContent?.startsWith('[ASK USER')).toBe(true));

    // Any element whose own text node contains a marker must be a <mark>.
    const elements = Array.from(container.querySelectorAll('*'));
    for (const el of elements) {
      const ownText = Array.from(el.childNodes)
        .filter((n) => n.nodeType === 3)
        .map((n) => n.textContent ?? '')
        .join('');
      if (ownText.includes('[ASK USER')) {
        expect(el.tagName).toBe('MARK');
      }
    }
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
  });
});
