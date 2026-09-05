import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, Play, FastForward, RotateCcw, FileCode, CheckCircle2 } from 'lucide-react';
import { CopyButton } from './CopyButton';

export interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  autoStartTypewriter?: boolean;
  typewriterSpeedMs?: number; // ms per character
  showLineNumbers?: boolean;
  enableScanline?: boolean;
  className?: string;
  id?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'typescript',
  filename = 'catalystlab.config.ts',
  autoStartTypewriter = true,
  typewriterSpeedMs = 12,
  showLineNumbers = true,
  enableScanline = false,
  className = '',
  id,
}) => {
  const [displayedLength, setDisplayedLength] = useState(autoStartTypewriter ? 0 : code.length);
  const [isTyping, setIsTyping] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const blockId = id || `code-block-${filename.replace(/[^a-z0-9]/gi, '-')}`;

  // IntersectionObserver to auto-start typewriter when scrolled into view
  useEffect(() => {
    if (!autoStartTypewriter) return;

    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsTyping(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [autoStartTypewriter]);

  useEffect(() => {
    if (!isTyping) return;

    if (displayedLength >= code.length) {
      setIsTyping(false);
      return;
    }

    const timer = setTimeout(() => {
      // Step by 1-3 characters to keep typing natural and performant
      const step = Math.min(3, code.length - displayedLength);
      setDisplayedLength((prev) => prev + step);
    }, typewriterSpeedMs);

    return () => clearTimeout(timer);
  }, [isTyping, displayedLength, code.length, typewriterSpeedMs]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFastForward = () => {
    setDisplayedLength(code.length);
    setIsTyping(false);
  };

  const handleReplay = () => {
    setDisplayedLength(0);
    setIsTyping(true);
  };

  const visibleCode = code.slice(0, displayedLength);
  const lines = visibleCode.split('\n');

  // Basic syntax color tokenizer for presentation
  const renderHighlightedLine = (lineText: string) => {
    // Comments
    if (lineText.trim().startsWith('//') || lineText.trim().startsWith('#')) {
      return <span className="text-muted-foreground italic">{lineText}</span>;
    }

    // Rough syntax tokenization for keywords & strings
    const parts = lineText.split(/(".*?"|'.*?'|`.*?`|\b(?:import|export|const|let|var|function|return|async|await|interface|type|from|true|false|null|if|else)\b)/g);

    return (
      <>
        {parts.map((part, i) => {
          if (!part) return null;
          if (part.startsWith('"') || part.startsWith("'") || part.startsWith('`')) {
            return (
              <span key={i} className="text-emerald-400">
                {part}
              </span>
            );
          }
          if (
            ['import', 'export', 'const', 'let', 'var', 'function', 'return', 'async', 'await', 'interface', 'type', 'from'].includes(
              part
            )
          ) {
            return (
              <span key={i} className="text-cyan-400 font-semibold">
                {part}
              </span>
            );
          }
          if (['true', 'false', 'null'].includes(part)) {
            return (
              <span key={i} className="text-amber-500">
                {part}
              </span>
            );
          }
          if (/\b\d+\b/.test(part)) {
            return (
              <span key={i} className="text-purple-500">
                {part}
              </span>
            );
          }
          return <span key={i} className="text-muted-foreground">{part}</span>;
        })}
      </>
    );
  };

  return (
    <div
      ref={containerRef}
      id={blockId}
      className={`relative rounded-xl border border-border bg-card shadow-[0_8px_32px_rgba(0,0,0,0.6)] overflow-hidden font-mono text-xs sm:text-sm ${className}`}
    >
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-muted/40 border-b border-border/80 select-none">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>

          <div className="flex items-center gap-1.5 ml-2 text-muted-foreground text-xs font-semibold">
            <FileCode className="w-3.5 h-3.5 text-primary" />
            <span className="text-muted-foreground">{filename}</span>
          </div>

          <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary text-muted-foreground border border-border uppercase">
            {language}
          </span>
        </div>

        {/* Typewriter & Action Controls */}
        <div className="flex items-center gap-1.5">
          {isTyping ? (
            <button
              type="button"
              id={`${blockId}-fast-forward`}
              onClick={handleFastForward}
              title="Fast Forward Typing"
              className="flex items-center gap-1 px-2 py-1 rounded bg-muted hover:bg-muted/80 text-[11px] text-primary transition-colors"
            >
              <FastForward className="w-3 h-3" />
              <span className="hidden sm:inline">Skip</span>
            </button>
          ) : (
            <button
              type="button"
              id={`${blockId}-replay`}
              onClick={handleReplay}
              title="Replay Typewriter Effect"
              className="flex items-center gap-1 px-2 py-1 rounded bg-muted hover:bg-muted/80 text-[11px] text-muted-foreground transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Replay</span>
            </button>
          )}

          <CopyButton
            text={code}
            id={`${blockId}-copy`}
            title="Copy Code to Clipboard"
            label="Copy"
            copiedLabel="Copied"
          />
        </div>
      </div>

      {/* Code Body with Line Numbers */}
      <div
        className={`relative p-4 overflow-x-auto max-h-[480px] leading-relaxed ${
          enableScanline ? 'scanline-overlay' : ''
        }`}
      >
        <pre className="m-0 p-0 font-mono text-muted-foreground">
          <code>
            {lines.map((line, idx) => (
              <div key={idx} className="flex items-start">
                {showLineNumbers && (
                  <span
                    aria-hidden="true"
                    className="w-8 shrink-0 text-right pr-4 text-muted-foreground select-none text-xs tabular-nums"
                  >
                    {idx + 1}
                  </span>
                )}
                <span className="flex-1 whitespace-pre">
                  {renderHighlightedLine(line)}
                  {/* Cursor on the currently typing line */}
                  {isTyping && idx === lines.length - 1 && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                      className="inline-block w-2 h-4 bg-cyan-400 align-middle ml-0.5"
                    />
                  )}
                </span>
              </div>
            ))}
          </code>
        </pre>
      </div>

      {/* Subtle Bottom Glow Strip */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
    </div>
  );
};

export default CodeBlock;
