import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, OctagonAlert, type LucideIcon } from 'lucide-react';

export type CalloutType = 'info' | 'warning' | 'danger' | 'success';

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  children: ReactNode;
}

// Accent rule (AGENTS.md §4): 10% background, 20% border of the semantic token.
const VARIANTS: Record<CalloutType, { className: string; Icon: LucideIcon; label: string }> = {
  info: { className: 'bg-info/10 border-info/20 text-info', Icon: Info, label: 'Note' },
  warning: { className: 'bg-warning/10 border-warning/20 text-warning', Icon: AlertTriangle, label: 'Warning' },
  danger: { className: 'bg-danger/10 border-danger/20 text-danger', Icon: OctagonAlert, label: 'Danger' },
  success: { className: 'bg-success/10 border-success/20 text-success', Icon: CheckCircle2, label: 'Tip' },
};

export function Callout({ type = 'info', title, children }: CalloutProps) {
  const { className, Icon, label } = VARIANTS[type] ?? VARIANTS.info;
  return (
    <aside
      role="note"
      aria-label={title ?? label}
      data-callout={type}
      className={`my-6 flex gap-3 rounded-2xl border p-4 ${className}`}
    >
      <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
      <div className="min-w-0 flex-1 text-foreground [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
        {title && <p className="mb-1 font-semibold text-foreground">{title}</p>}
        {children}
      </div>
    </aside>
  );
}
