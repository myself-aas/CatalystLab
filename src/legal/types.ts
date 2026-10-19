/**
 * Content model for the public legal documents (Terms, Privacy, Refund).
 *
 * Each document is layered:
 *   Layer 1 — `summary`: plain-language overview of the section.
 *   Layer 2 — `clauses`: the full binding text.
 *   Layer 3 — `annex`:   technical detail (data flows, tables, limits).
 *
 * Any unresolved fact is written as an `[ASK USER: ...]` marker inside the
 * text. The renderer highlights these so they cannot be published by accident.
 */

export type LegalBlock =
  | { kind: 'p'; text: string }
  | { kind: 'ul'; items: string[] }
  | { kind: 'ol'; items: string[] }
  | { kind: 'table'; headers: string[]; rows: string[][] }
  /** Rendered from `src/data/pricingData.ts` so prices cannot drift from the pricing page. */
  | { kind: 'plan-table' };

export interface LegalClause {
  id: string;
  heading?: string;
  blocks: LegalBlock[];
}

export interface LegalSection {
  id: string;
  title: string;
  /** Layer 1: plain-language summary, 1–3 sentences. */
  summary: string;
  /** Layer 2: numbered clauses that form the binding text. */
  clauses: LegalClause[];
  /** Layer 3: optional technical annex, shown collapsed. */
  annex?: LegalBlock[];
}

export interface LegalDocumentContent {
  slug: 'terms' | 'privacy' | 'refund';
  title: string;
  seoDescription: string;
  canonicalPath: string;
  intro: string;
  version: string;
  sections: LegalSection[];
}
