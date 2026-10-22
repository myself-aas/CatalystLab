import React from 'react';
import { ShieldAlert, ListTree } from 'lucide-react';
import { SEOHead } from '../common/SEOHead';
import { ALL_PLANS_LIST } from '../../data/pricingData';
import type { LegalBlock, LegalDocumentContent } from '../../legal/types';
import { PUBLICATION_NOTICE, LEGAL_VERSION, EFFECTIVE_DATE, SITE_ORIGIN } from '../../legal/legalMeta';

/**
 * Splits text on [ASK USER: ...] markers. Odd indices are the captured markers,
 * so they can be highlighted and cannot be mistaken for finished copy.
 */
const ASK_USER_PATTERN = /(\[ASK USER[^\]]*\])/;

export const RenderText: React.FC<{ text: string }> = ({ text }) => (
  <>
    {text.split(ASK_USER_PATTERN).map((part, i) =>
      i % 2 === 1 ? (
        <mark
          key={i}
          data-ask-user="true"
          className="rounded bg-warning/10 px-1 text-warning not-italic"
        >
          {part}
        </mark>
      ) : (
        <React.Fragment key={i}>{part}</React.Fragment>
      ),
    )}
  </>
);

const PlanTable: React.FC = () => (
  <div className="overflow-x-auto">
    <table className="w-full text-left text-sm">
      <thead className="text-xs text-muted-foreground">
        <tr>
          <th className="py-2 pr-4 font-medium">Plan</th>
          <th className="py-2 pr-4 font-medium">Monthly list price</th>
          <th className="py-2 pr-4 font-medium">Annual price</th>
          <th className="py-2 font-medium">Free trial</th>
        </tr>
      </thead>
      <tbody>
        {ALL_PLANS_LIST.map((plan) => (
          <tr key={plan.id} className="border-t border-border">
            <td className="py-2 pr-4 text-foreground">{plan.name}</td>
            <td className="py-2 pr-4">{plan.priceMonthly === 0 ? 'Free' : `$${plan.priceMonthly} / month`}</td>
            <td className="py-2 pr-4">
              {plan.priceMonthly === 0
                ? '—'
                : `$${plan.annualBillingTotal} billed yearly ($${plan.priceAnnualMonthly} / month)`}
            </td>
            <td className="py-2">{plan.trialDays > 0 ? `${plan.trialDays} days` : 'None'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Block: React.FC<{ block: LegalBlock }> = ({ block }) => {
  switch (block.kind) {
    case 'p':
      return <p className="framer-body-text text-sm leading-relaxed"><RenderText text={block.text} /></p>;
    case 'ul':
      return (
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed">
          {block.items.map((item, i) => <li key={i}><RenderText text={item} /></li>)}
        </ul>
      );
    case 'ol':
      return (
        <ol className="list-decimal space-y-1.5 pl-5 text-sm leading-relaxed">
          {block.items.map((item, i) => <li key={i}><RenderText text={item} /></li>)}
        </ol>
      );
    case 'table':
      return (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-xs text-muted-foreground">
              <tr>
                {block.headers.map((h) => <th key={h} className="py-2 pr-4 font-medium">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, r) => (
                <tr key={r} className="border-t border-border align-top">
                  {row.map((cell, c) => <td key={c} className="py-2 pr-4"><RenderText text={cell} /></td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'plan-table':
      return <PlanTable />;
    default:
      return null;
  }
};

export const LegalDocumentView: React.FC<{ doc: LegalDocumentContent }> = ({ doc }) => {
  const [tocOpen, setTocOpen] = React.useState(false);

  return (
  <div className="min-h-screen ds-page-top bg-background text-foreground">
    <SEOHead
      title={`${doc.title} | CatalystLab`}
      description={doc.seoDescription}
      canonicalUrl={`${SITE_ORIGIN}${doc.canonicalPath}`}
    />

    <section className="border-b border-border sm:px-6 lg:px-8 ds-section">
      <div className="mx-auto max-w-6xl space-y-4">
        <p className="font-mono text-xs text-muted-foreground">
          Version {doc.version || LEGAL_VERSION} · Effective <RenderText text={EFFECTIVE_DATE} />
        </p>
        <h1 className="framer-section-headline text-foreground">{doc.title}</h1>
        <p className="framer-body-text max-w-3xl"><RenderText text={doc.intro} /></p>
        {PUBLICATION_NOTICE ? (
          <div
            role="note"
            className="flex items-start gap-2 rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground"
          >
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{PUBLICATION_NOTICE}</span>
          </div>
        ) : null}
      </div>
    </section>

    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[240px_1fr] lg:px-8">
      <nav aria-label={`${doc.title} sections`} className="lg:sticky lg:top-24 lg:h-fit">
        <div className="lg:hidden">
          <button
            type="button"
            aria-expanded={tocOpen}
            aria-controls="legal-toc-mobile"
            onClick={() => setTocOpen((open) => !open)}
            className="flex min-h-11 w-full items-center gap-2 text-sm font-medium text-foreground"
          >
            <ListTree className="h-4 w-4" aria-hidden="true" /> Contents
            <span className="ml-auto text-xs text-muted-foreground">{doc.sections.length} sections</span>
          </button>
          {tocOpen && (
            <ol id="legal-toc-mobile" className="mt-3 space-y-2 text-sm">
              {doc.sections.map((s, i) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    onClick={() => setTocOpen(false)}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <span className="mr-2 font-mono text-xs">{i + 1}.</span>
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          )}
        </div>
        <p className="mb-3 hidden items-center gap-2 text-sm font-medium text-foreground lg:flex">
          <ListTree className="h-4 w-4" aria-hidden="true" /> Contents
        </p>
        <ol className="hidden space-y-1.5 text-sm lg:block">
          {doc.sections.map((s, i) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="text-muted-foreground transition-colors hover:text-foreground">
                <span className="mr-2 font-mono text-xs">{i + 1}.</span>
                {s.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <main className="min-w-0 space-y-6">
        {doc.sections.map((section) => (
          <section key={section.id} id={section.id} className="ds-card scroll-mt-28 space-y-5 p-6">
            <h2 className="framer-card-title text-foreground">{section.title}</h2>

            {/* Plain-language summary leads the section; no nested container. */}
            <p className="text-base leading-relaxed text-muted-foreground">
              <RenderText text={section.summary} />
            </p>

            {section.clauses.map((clause) => (
              <div key={clause.id} id={`c-${clause.id}`} className="space-y-2 scroll-mt-28">
                <p className="text-xs font-mono text-muted-foreground">
                  <span className="mr-2">{clause.id}</span>
                  {clause.heading ? <span className="font-sans text-sm font-medium text-foreground">{clause.heading}</span> : null}
                </p>
                {clause.blocks.map((block, b) => <Block key={b} block={block} />)}
              </div>
            ))}

            {section.annex && section.annex.length > 0 && (
              <details className="group rounded-lg border border-border p-4">
                <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                  Technical annex
                </summary>
                <div className="mt-4 space-y-4">
                  {section.annex.map((block, b) => <Block key={b} block={block} />)}
                </div>
              </details>
            )}
          </section>
        ))}
      </main>
    </div>
  </div>
  );
};

export default LegalDocumentView;
