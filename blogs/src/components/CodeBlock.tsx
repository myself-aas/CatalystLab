import { isValidElement, useState, type ReactNode } from 'react';
import { Check, Copy } from 'lucide-react';

interface CodeBlockProps {
  children?: ReactNode;
}

/** Replaces MDX's `<pre>`: language header, copy button, scrollable body. */
export function CodeBlock({ children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const code = isValidElement<{ className?: string; children?: ReactNode }>(children) ? children.props : undefined;
  const language = /language-([\w-]+)/.exec(code?.className ?? '')?.[1];
  const text = typeof code?.children === 'string' ? code.children.replace(/\n$/, '') : '';

  const copy = () => {
    if (!text || !navigator.clipboard) return;
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="my-5 overflow-hidden rounded-xl border border-border/80 bg-muted/40 shadow-xl">
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-1.5 font-mono text-xs">
        <span className="font-bold text-cyan-700 dark:text-cyan-400">{language ?? 'code'}</span>
        {text && (
          <button
            type="button"
            onClick={copy}
            aria-label={copied ? 'Copied' : 'Copy code'}
            className="ds-btn ds-btn-ghost flex items-center gap-1 text-[11px] text-muted-foreground"
          >
            {copied ? <Check aria-hidden="true" className="size-3.5" /> : <Copy aria-hidden="true" className="size-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        )}
      </div>
      <pre className="overflow-x-auto scrollbar-none touch-pan-x p-4 font-mono text-sm leading-relaxed text-foreground">
        <code>{code?.children ?? children}</code>
      </pre>
    </div>
  );
}
