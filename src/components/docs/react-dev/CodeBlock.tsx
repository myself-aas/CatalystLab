import React, { useState } from 'react';
import { cn } from '../../../lib/utils';
import { Check, Copy, Terminal } from 'lucide-react';
import { CodeBlockProps } from '../../../types/design-system';

export const CodeBlock: React.FC<CodeBlockProps> = ({ 
  code, 
  language = 'tsx', 
  filename,
  highlightedLines = [],
  showLineNumbers = false,
  className,
  id
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isTerminal = language === 'bash' || language === 'sh' || language === 'terminal';
  const lines = code.trim().split('\n');

  return (
    <div id={id} className={cn("react-code-container group", className)}>
      {/* Code Header */}
      {(filename || isTerminal) && (
        <div className="react-code-header">
          <div className="flex items-center gap-2">
            {isTerminal && <Terminal className="w-4 h-4 text-muted-foreground" />}
            <span className="font-mono">{filename || (isTerminal ? 'Terminal' : '')}</span>
          </div>
          
          <button 
            onClick={handleCopy}
            className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border rounded px-1.5 py-0.5 -mr-1.5"
            aria-label="Copy code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="text-[10px] uppercase font-bold tracking-wider">{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      )}

      {/* Code Body */}
      <div className="relative">
        {!filename && !isTerminal && (
          <button 
            onClick={handleCopy}
            className="absolute top-2.5 right-2.5 p-2 bg-background/10 hover:bg-background/20 rounded-lg text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-all duration-200 focus-visible:opacity-100"
            title="Copy code"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>
        )}
        
        <pre className={cn(
          "p-4 overflow-x-auto text-[13px] leading-relaxed font-mono text-[var(--react-code-text)]",
          showLineNumbers ? "pl-12" : ""
        )}>
          <code>
            {lines.map((line, i) => {
              const lineNumber = i + 1;
              const isHighlighted = highlightedLines.includes(lineNumber);
              
              return (
                <div 
                  key={i} 
                  className={cn(
                    "relative pr-4", 
                    isHighlighted ? "bg-[var(--react-code-line-highlight)] before:absolute before:left-[-16px] before:top-0 before:bottom-0 before:w-1 before:bg-[var(--react-cyan)]" : ""
                  )}
                  style={{
                    marginLeft: showLineNumbers ? '-2rem' : '0',
                    paddingLeft: showLineNumbers ? '2rem' : '0'
                  }}
                >
                  {showLineNumbers && (
                    <span className="absolute left-0 w-8 text-right select-none text-muted-foreground/50 pr-4">
                      {lineNumber}
                    </span>
                  )}
                  <span className={isTerminal && line.startsWith('$') ? "text-cyan-400" : ""}>
                    {line || ' '}
                  </span>
                </div>
              );
            })}
          </code>
        </pre>
      </div>
    </div>
  );
};
