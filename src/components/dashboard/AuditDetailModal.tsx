import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Copy, ExternalLink, Terminal, X } from 'lucide-react';
import type { AuditReport } from '../../types';
import { ENGINES_MAP } from '../../data/engines';
import { extractDomainFromUrl } from '../../utils/slugUtils';

export interface AuditDetailModalProps {
  report: AuditReport | null;
  isOpen: boolean;
  onClose: () => void;
  onViewFullReport?: (report: AuditReport) => void;
}

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/**
 * Quick view of one stored audit.
 *
 * It used to invent readings around the real score: a TTFB guessed from the
 * score, "100% HSTS & CSP Active", "HIT (98.4%)" edge cache, "Zero Drift", a
 * "Phase 04 Verified" badge, and a fabricated console transcript when the
 * report had no output. Everything below is either fielded from the stored
 * report or absent.
 */
export const AuditDetailModal: React.FC<AuditDetailModalProps> = ({
  report,
  isOpen,
  onClose,
  onViewFullReport,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!report) return null;

  const engineLabel =
    report.engine === 'master' || report.engine === 'master-audit' || report.engine === 'all'
      ? 'Master audit (8 engines)'
      : report.engine
        ? ENGINES_MAP[report.engine]?.name ?? report.engine
        : 'Audit';

  const hasScore = typeof report.score === 'number';

  const handleCopy = async () => {
    const payload = JSON.stringify(
      {
        id: report.id,
        url: report.url,
        engine: report.engine,
        score: report.score ?? null,
        createdAt: report.createdAt,
        summary: report.summary,
        output: report.output,
      },
      null,
      2,
    );
    try {
      await navigator.clipboard?.writeText(payload);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          id="audit-detail-modal-root"
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-3 sm:p-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="audit-detail-title"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 cursor-pointer bg-background/80"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.24, ease: EASE }}
            className="relative z-10 my-auto flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-border bg-card text-foreground"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">{engineLabel}</p>
                <h2 id="audit-detail-title" className="mt-0.5 truncate text-lg font-semibold text-foreground">
                  {report.title || extractDomainFromUrl(report.url)}
                </h2>
              </div>
              <button
                id="audit-detail-close-btn"
                type="button"
                onClick={onClose}
                className="flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                aria-label="Close the audit quick view"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto p-6">
              <dl className="grid gap-4 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-muted-foreground">Score</dt>
                  <dd className="mt-0.5 font-mono text-2xl tabular-nums text-foreground">
                    {hasScore ? `${report.score}/100` : 'No score'}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-muted-foreground">Audited</dt>
                  <dd className="mt-0.5 text-foreground">
                    {report.createdAt ? new Date(report.createdAt).toLocaleString() : 'Date not recorded'}
                  </dd>
                </div>
              </dl>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Target</p>
                <a
                  href={report.url.startsWith('http') ? report.url : `https://${report.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block truncate text-sm text-foreground underline underline-offset-4"
                >
                  {report.url}
                </a>
              </div>

              {report.summary ? (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Summary</p>
                  <p className="text-sm leading-relaxed text-foreground">{report.summary}</p>
                </div>
              ) : null}

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Terminal className="size-4 text-muted-foreground" aria-hidden="true" />
                    Engine output
                  </h3>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex min-h-11 items-center gap-1.5 rounded-md border border-border px-3 text-xs text-muted-foreground hover:text-foreground"
                  >
                    {copied ? <Check className="size-3.5 text-success" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
                    <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                </div>

                {report.output ? (
                  <pre className="max-h-56 overflow-auto rounded-lg bg-muted/40 p-4 font-mono text-xs leading-relaxed text-foreground">
                    {report.output}
                  </pre>
                ) : (
                  <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                    This report has no stored engine output.
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-muted/20 px-6 py-4">
              <span className="truncate font-mono text-xs text-muted-foreground">
                {report.id ? `Report ${report.id}` : 'Report id not recorded'}
              </span>
              <div className="flex items-center gap-3">
                <button
                  id="audit-detail-close-footer-btn"
                  type="button"
                  onClick={onClose}
                  className="ds-btn ds-btn-secondary h-11 px-4 text-sm"
                >
                  Close
                </button>
                {onViewFullReport ? (
                  <button
                    id="audit-detail-full-report-btn"
                    type="button"
                    onClick={() => {
                      onViewFullReport(report);
                      onClose();
                    }}
                    className="ds-btn ds-btn-primary h-11 px-4 text-sm"
                  >
                    <span>Open full report</span>
                    <ExternalLink className="size-4" aria-hidden="true" />
                  </button>
                ) : null}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AuditDetailModal;
