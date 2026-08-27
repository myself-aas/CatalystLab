import React, { useState, useRef, useEffect, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, CornerDownLeft, Loader2, X, Globe, Shield, Sparkles, Check } from 'lucide-react';

export interface TerminalInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  placeholder?: string;
  promptPrefix?: string;
  isLoading?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  statusMessage?: string;
  variant?: 'default' | 'hero' | 'compact';
  badgeText?: string;
  className?: string;
  id?: string;
}

export const TerminalInput: React.FC<TerminalInputProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = 'Enter target domain (e.g., https://stripe.com or nextjs.org)...',
  promptPrefix = 'catalystlab@telemetry:~$',
  isLoading = false,
  disabled = false,
  autoFocus = false,
  statusMessage,
  variant = 'default',
  badgeText,
  className = '',
  id,
}) => {
  const generatedId = useId();
  const inputId = id || `terminal-input-${generatedId}`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [protocol, setProtocol] = useState<'https://' | 'http://'>('https://');

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!value.trim() || isLoading || disabled) return;

    let cleanUrl = value.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `${protocol}${cleanUrl}`;
    }
    onSubmit(cleanUrl);
  };

  const handleClear = () => {
    onChange('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const isHero = variant === 'hero';
  const isCompact = variant === 'compact';

  return (
    <div
      id={`container-${inputId}`}
      className={`w-full transition-all duration-300 ${className}`}
    >
      {/* Screen Reader Announcements */}
      <span className="sr-only" id={`${inputId}-description`}>
        Enter a target domain or URL to launch the 8-engine telemetry diagnostics. Press Enter to execute.
      </span>

      {/* Terminal Command Line Container */}
      <div
        onClick={() => inputRef.current?.focus()}
        className={`relative group rounded-xl transition-all duration-300 cursor-text ${
          isFocused
            ? 'border-[#06B6D4] shadow-[0_0_25px_rgba(6,182,212,0.35)] bg-[#0A0F1D]/95'
            : 'border-slate-800/90 hover:border-slate-700 bg-[#090D16]/90 shadow-[0_4px_20px_rgba(0,0,0,0.5)]'
        } border backdrop-blur-xl ${
          isHero ? 'p-2 sm:p-3' : isCompact ? 'p-1.5' : 'p-2'
        }`}
      >
        {/* Terminal Header Bar (for Hero & Default) */}
        {!isCompact && (
          <div className="flex items-center justify-between px-3 pt-1 pb-2 border-b border-slate-800/60 mb-2 select-none">
            <div className="flex items-center gap-2">
              {/* Traffic light LEDs */}
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]/80 shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]/80 shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]/80 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
              </div>
              <span className="text-[11px] font-mono text-slate-500 tracking-wider flex items-center gap-1.5 ml-2">
                <Terminal className="w-3 h-3 text-[#06B6D4]" />
                <span>TELEMETRY_SHELL_v2.4</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              {badgeText && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#06B6D4]/10 text-[#06B6D4] border border-[#06B6D4]/30">
                  {badgeText}
                </span>
              )}
              <span className="text-[10px] font-mono text-slate-500">
                PORT:3000 • TLS:ACTIVE
              </span>
            </div>
          </div>
        )}

        {/* Command Line Input Row */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 px-2">
          {/* Prompt Indicator */}
          <div aria-hidden="true" className="flex items-center gap-1.5 shrink-0 select-none text-xs sm:text-sm font-mono font-bold">
            <span className="text-[#10B981] hidden sm:inline">{promptPrefix}</span>
            <span className="text-[#06B6D4] font-bold">&gt;</span>
            <span className="text-slate-600 font-mono">\</span>
            <span className="text-slate-400 font-mono">_</span>
          </div>

          {/* Protocol Toggle (Desktop only) */}
          <button
            type="button"
            id={`${inputId}-protocol-toggle`}
            aria-label={`Protocol toggle: currently ${protocol}`}
            onClick={(e) => {
              e.stopPropagation();
              setProtocol((prev) => (prev === 'https://' ? 'http://' : 'https://'));
            }}
            className="hidden md:flex items-center gap-1 px-2 py-1 rounded bg-slate-800/80 border border-slate-700/60 text-[11px] font-mono text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            title="Toggle Protocol"
          >
            <Shield className="w-2.5 h-2.5 text-[#10B981]" aria-hidden="true" />
            <span>{protocol}</span>
          </button>

          {/* Interactive Text Input */}
          <div className="relative flex-1 flex items-center">
            <input
              ref={inputRef}
              id={inputId}
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder}
              disabled={disabled || isLoading}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              aria-label="Target domain or URL for telemetry audit"
              aria-describedby={`${inputId}-description`}
              aria-busy={isLoading}
              className={`w-full bg-transparent text-slate-100 placeholder-slate-400 font-mono focus:outline-none transition-colors ${
                isHero
                  ? 'text-sm sm:text-base py-2'
                  : isCompact
                  ? 'text-xs sm:text-sm py-1'
                  : 'text-xs sm:text-sm py-1.5'
              }`}
            />

            {/* Custom Terminal Blinking Cursor */}
            {isFocused && !value && !isLoading && (
              <span
                aria-hidden="true"
                className="pointer-events-none w-2 h-4 sm:h-5 bg-[#00F0FF] animate-pulse ml-0.5 inline-block opacity-80"
              />
            )}
          </div>

          {/* Action Buttons: Clear & Submit */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Clear Input */}
            {value && !isLoading && (
              <button
                type="button"
                id={`${inputId}-clear`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                aria-label="Clear input value"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Submit / Execute Command Button */}
            <button
              type="submit"
              id={`${inputId}-submit`}
              disabled={!value.trim() || isLoading || disabled}
              aria-label="Execute Telemetry Audit Scan"
              className={`flex items-center gap-2 font-mono font-bold rounded-lg transition-all select-none ${
                isHero
                  ? 'px-3.5 sm:px-5 py-2 text-xs sm:text-sm'
                  : isCompact
                  ? 'px-2.5 py-1 text-xs'
                  : 'px-3 sm:px-4 py-1.5 text-xs'
              } ${
                !value.trim() || disabled
                  ? 'bg-slate-800/80 text-slate-500 border border-slate-700/40 cursor-not-allowed'
                  : isLoading
                  ? 'bg-[#06B6D4]/20 text-[#06B6D4] border border-[#06B6D4]/40 cursor-wait'
                  : 'bg-gradient-to-r from-[#06B6D4] via-[#10B981] to-[#00FF66] text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(16,185,129,0.6)] hover:brightness-110 active:scale-95'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#06B6D4]" aria-hidden="true" />
                  <span className="hidden sm:inline">DISPATCHING...</span>
                  <span className="sm:hidden">SCAN</span>
                </>
              ) : (
                <>
                  <span className="hidden md:inline text-[11px] opacity-80" aria-hidden="true">&gt; EXECUTE</span>
                  <span className="flex items-center gap-1" aria-hidden="true">
                    <span>↵</span>
                    <span className="hidden sm:inline">Enter</span>
                  </span>
                  <CornerDownLeft className="w-3 h-3 sm:hidden" aria-hidden="true" />
                  <span className="sr-only">Execute audit</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Live Status Message / Telemetry Hint */}
        <AnimatePresence>
          {statusMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 pt-2 px-3 border-t border-slate-800/50 flex items-center justify-between text-[11px] font-mono text-slate-400"
            >
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4] animate-ping" />
                <span>{statusMessage}</span>
              </div>
              <span className="text-slate-500 hidden sm:inline">8 Micro-Analyzers Ready</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TerminalInput;
