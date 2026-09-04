import React from 'react';
import { sanitizeHref } from '../../lib/sanitizeHref';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  // Parse markdown lines into structured elements
  const lines = (content || '').split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];
  let codeBlockLang = '';
  let inList = false;
  let listItems: string[] = [];

  const flushList = (key: string) => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={key} className="my-4 space-y-2 list-disc list-inside text-foreground dark:text-muted-foreground text-base leading-relaxed">
          {listItems.map((item, idx) => (
            <li key={idx} className="marker:text-cyan-600 dark:marker:text-cyan-400">
              {renderInline(item)}
            </li>
          ))}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  const renderInline = (text: string): React.ReactNode => {
    // Basic inline formatting: **bold**, *italic*, `code`, [link](url)
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let keyIdx = 0;

    while (remaining.length > 0) {
      // Inline code `code`
      const codeMatch = remaining.match(/^`([^`]+)`/);
      if (codeMatch) {
        parts.push(
          <code key={keyIdx++} className="rounded bg-accent dark:bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground dark:text-cyan-300 border border-border dark:border-border font-semibold">
            {codeMatch[1]}
          </code>
        );
        remaining = remaining.slice(codeMatch[0].length);
        continue;
      }

      // Bold **text**
      const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
      if (boldMatch) {
        parts.push(
          <strong key={keyIdx++} className="font-bold text-foreground dark:text-primary-foreground">
            {boldMatch[1]}
          </strong>
        );
        remaining = remaining.slice(boldMatch[0].length);
        continue;
      }

      // Link [text](url)
      const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        const safeHref = sanitizeHref(linkMatch[2]);
        if (safeHref) {
          parts.push(
            <a
              key={keyIdx++}
              href={safeHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-700 dark:text-cyan-400 underline font-semibold hover:text-cyan-900 dark:hover:text-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
            >
              {linkMatch[1]}
            </a>
          );
        } else {
          parts.push(linkMatch[1]);
        }
        remaining = remaining.slice(linkMatch[0].length);
        continue;
      }

      // Plain char
      const nextSpecial = remaining.search(/[`*\[]/);
      if (nextSpecial === -1) {
        parts.push(remaining);
        break;
      } else if (nextSpecial === 0) {
        // Unmatched marker
        parts.push(remaining[0]);
        remaining = remaining.slice(1);
      } else {
        parts.push(remaining.slice(0, nextSpecial));
        remaining = remaining.slice(nextSpecial);
      }
    }

    return <>{parts}</>;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Fenced Code Block toggle
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // Flush code block
        elements.push(
          <div key={`code-${i}`} className="my-5 overflow-hidden rounded-xl border border-border/80 bg-muted/40 shadow-xl">
            {codeBlockLang && (
              <div className="flex items-center justify-between border-b border-border bg-card px-4 py-1.5 text-xs font-mono text-cyan-400">
                <span className="font-bold">{codeBlockLang}</span>
                <span className="text-muted-foreground text-[11px]">code snippet</span>
              </div>
            )}
            <pre className="overflow-x-auto p-4 font-mono text-sm text-foreground leading-relaxed">
              <code>{codeBlockContent.join('\n')}</code>
            </pre>
          </div>
        );
        codeBlockContent = [];
        codeBlockLang = '';
        inCodeBlock = false;
      } else {
        flushList(`list-before-code-${i}`);
        inCodeBlock = true;
        codeBlockLang = line.trim().replace(/^```/, '');
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    // Unordered List
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      inList = true;
      listItems.push(line.trim().replace(/^[-*]\s+/, ''));
      continue;
    } else if (inList) {
      flushList(`list-${i}`);
    }

    // Numbered List
    const numMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      elements.push(
        <div key={`num-${i}`} className="my-2 flex items-start gap-2.5 text-base text-foreground dark:text-muted-foreground leading-relaxed">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/15 text-xs font-bold font-mono text-cyan-700 dark:text-cyan-400 border border-cyan-500/30">
            {numMatch[1]}
          </span>
          <div className="pt-0.5">{renderInline(numMatch[2])}</div>
        </div>
      );
      continue;
    }

    // Headings
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={`h3-${i}`} className="mt-6 mb-3 text-lg sm:text-xl font-bold text-foreground dark:text-primary-foreground tracking-tight">
          {renderInline(line.replace('### ', ''))}
        </h3>
      );
      continue;
    }

    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={`h2-${i}`} className="mt-8 mb-4 text-xl sm:text-2xl font-extrabold text-foreground dark:text-primary-foreground tracking-tight border-b border-border dark:border-border pb-2">
          {renderInline(line.replace('## ', ''))}
        </h2>
      );
      continue;
    }

    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={`h1-${i}`} className="mt-8 mb-4 text-2xl sm:text-3xl font-extrabold text-foreground dark:text-primary-foreground tracking-tight">
          {renderInline(line.replace('# ', ''))}
        </h1>
      );
      continue;
    }

    // Empty line
    if (!line.trim()) {
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={`p-${i}`} className="my-3 text-base sm:text-base text-foreground dark:text-muted-foreground leading-relaxed">
        {renderInline(line)}
      </p>
    );
  }

  flushList('list-end');

  return <div className={`prose max-w-none ${className}`}>{elements}</div>;
};
