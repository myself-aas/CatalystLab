import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { SEOHead } from '../components/common/SEOHead';
import { LEGAL_VERSION, EFFECTIVE_DATE, LEGAL_EMAIL } from '../legal/legalMeta';

interface LegalEntry {
  to: string;
  title: string;
  description: string;
}

const DOCUMENTS: LegalEntry[] = [
  {
    to: '/terms',
    title: 'Terms of Service',
    description:
      'What you may scan, what the scores mean, how billing and cancellation work, and the limits of our liability.',
  },
  {
    to: '/privacy',
    title: 'Privacy Policy',
    description:
      'What we store, where it lives, how long we keep it, and the rights you can exercise over it.',
  },
  {
    to: '/refund',
    title: 'Refund Policy',
    description: 'When a paid plan can be refunded, the windows that apply, and how to ask.',
  },
  {
    to: '/cookies',
    title: 'Cookie Policy',
    description: 'Every item CatalystLab writes to your browser, and how to change your choice.',
  },
  {
    to: '/security',
    title: 'Security Disclosure',
    description: 'How to report a vulnerability in our scanners, the API, or this site.',
  },
];

/**
 * Legal index (/legal).
 *
 * The page used to guess its own identity from the URL and would have shown a
 * Privacy Policy heading with Terms copy for any unknown path. Each policy has
 * its own route, so this page is only an index: one heading, one list, one
 * effective date.
 */
export const LegalPage: React.FC = () => {
  return (
    <div className="min-h-screen ds-page-top bg-background text-foreground">
      <SEOHead
        title="Legal & Compliance — CatalystLab"
        description="Terms, privacy, refunds, cookies and security disclosure for the CatalystLab platform."
        canonicalUrl="https://www.catalystlab.tech/legal"
      />

      <section className="border-b border-border ds-section sm:px-6 lg:px-8">
        <div className="ds-page-shell max-w-3xl space-y-3">
          <h1 className="framer-section-headline flex items-center gap-3 text-foreground">
            <ShieldCheck className="size-7 shrink-0 text-info" aria-hidden="true" />
            Legal &amp; compliance
          </h1>
          <p className="framer-body-text">
            The documents that govern your use of CatalystLab. Version {LEGAL_VERSION},
            effective {EFFECTIVE_DATE}.
          </p>
        </div>
      </section>

      <main className="ds-page-shell ds-section">
        <ul className="grid gap-4 sm:grid-cols-2">
          {DOCUMENTS.map((doc) => (
            <li key={doc.to}>
              <Link
                to={doc.to}
                className="ds-card ds-card-interactive group flex h-full flex-col justify-between gap-3 p-5"
              >
                <span className="space-y-1.5">
                  <span className="block text-base font-medium text-foreground">{doc.title}</span>
                  <span className="block text-sm text-muted-foreground">{doc.description}</span>
                </span>
                <span className="flex items-center gap-1.5 text-sm text-foreground">
                  Read
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-10 border-t border-border pt-6 text-sm text-muted-foreground">
          Questions about a document, or a data request under it? Write to{' '}
          <a href={`mailto:${LEGAL_EMAIL}`} className="text-foreground underline underline-offset-4">
            {LEGAL_EMAIL}
          </a>{' '}
          or use the <Link to="/contact" className="text-foreground underline underline-offset-4">contact form</Link>.
        </p>
      </main>
    </div>
  );
};

export default LegalPage;
