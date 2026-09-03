import React from 'react';
import { ArrowRight, Play, RotateCw, X, Zap } from 'lucide-react';

interface EngineInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading?: boolean;
  buttonText?: string;
  loadingText?: string;
  placeholder?: string;
  disabled?: boolean;
  inputId?: string;
}

export const EngineInput: React.FC<EngineInputProps> = ({
  value,
  onChange,
  onSubmit,
  isLoading = false,
  buttonText = 'Start Master Audit',
  loadingText = 'Executing...',
  placeholder = 'https://your-domain.com',
  disabled = false,
  inputId = 'engine-url-input',
}) => {
  return (
    <form
      onSubmit={onSubmit}
      className="group flex w-full flex-col gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.04] p-1.5 shadow-linear-card backdrop-blur-xl transition-all duration-300 focus-within:border-[#5E6AD2]/50 focus-within:ring-2 focus-within:ring-[#5E6AD2]/20 sm:flex-row"
    >
      <div className="flex flex-1 items-center px-4 py-2">
        <Zap className="mr-3 size-4 shrink-0 text-[#8A8F98]" />
        <input
          id={inputId}
          type="text"
          aria-label={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={isLoading}
          required
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className="w-full min-w-0 border-none bg-transparent text-sm font-normal text-[#EDEDEF] placeholder:text-[#8A8F98]/70 outline-none sm:text-base"
        />
        {value && !isLoading && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="rounded-md p-1 text-[#8A8F98] transition-colors hover:bg-white/[0.06] hover:text-[#EDEDEF]"
            title="Clear input"
            aria-label="Clear input"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
      <button
        type="submit"
        disabled={disabled || isLoading}
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#5E6AD2] px-6 py-3 text-sm font-medium text-white shadow-linear-cta transition-all duration-200 hover:bg-[#6872D9] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? (
          <RotateCw className="size-4 animate-spin" />
        ) : (
          <Play className="size-3.5 fill-current" />
        )}
        <span className="whitespace-nowrap">{isLoading ? loadingText : buttonText}</span>
        {!isLoading && <ArrowRight className="size-4 opacity-80" />}
      </button>
    </form>
  );
};

export default EngineInput;
