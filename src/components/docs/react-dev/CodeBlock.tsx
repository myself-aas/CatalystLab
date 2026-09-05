import React from 'react';
import { cn } from '../../../lib/utils';
import { Terminal } from 'lucide-react';
import { CodeBlockProps } from '../../../types/design-system';
import { CopyButton } from '../../ui/CopyButton';

export const CodeBlock: React.FC<CodeBlockProps> = ({ 
  code, 
  language = 'tsx', 
  filename,
  highlightedLines = [],
  showLineNumbers = false,
  className,
  id
}) => {
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
          
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <CopyButton
              text={code}
              variant="terminal"
              label="Copy"
              copiedLabel="Copied"
              className="py-0.5 px-2 text-[10px]"
            />
          </div>
        </div>
      )}

      {/* Code Body */}
      <div className="relative">
        {!filename && !isTerminal && (
          <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
            <CopyButton
              text={code}
              variant="icon"
              title="Copy code"
            />
          </div>
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
