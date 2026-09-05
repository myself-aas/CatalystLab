import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, Check } from 'lucide-react';

export interface CopyButtonProps {
  text: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
  id?: string;
  title?: string;
  variant?: 'default' | 'terminal' | 'ghost' | 'icon' | 'pill' | 'minimal';
  onCopy?: () => void;
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  label,
  copiedLabel = 'Copied!',
  className = '',
  id,
  title = 'Copy to clipboard',
  variant = 'default',
  onCopy,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      onCopy?.();
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => {
      setCopied(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const baseStyles =
    'relative inline-flex items-center justify-center font-medium transition-colors select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066FF]/50 cursor-pointer';

  const variantStyles = {
    default:
      'px-3 py-1.5 rounded-lg text-xs bg-white/10 hover:bg-white/20 text-white border border-white/10 hover:border-white/20',
    terminal:
      'px-3 py-1.5 rounded-md text-xs font-mono bg-white/10 hover:bg-white/15 text-white/90 border border-white/10 shadow-sm',
    icon:
      'p-1.5 rounded-md text-xs text-[#999999] hover:text-white hover:bg-white/10',
    ghost:
      'p-1.5 rounded-md text-xs text-[#999999] hover:text-white hover:bg-white/10',
    pill:
      'px-3.5 py-1.5 rounded-full text-xs bg-white/10 hover:bg-white/20 text-white border border-white/12',
    minimal:
      'p-1 text-xs text-[#999999] hover:text-white transition-colors',
  };

  return (
    <motion.button
      type="button"
      id={id}
      title={title}
      aria-label={copied ? copiedLabel : label || title}
      onClick={handleCopy}
      whileTap={{ scale: 0.92 }}
      animate={copied ? { scale: [1, 1.06, 1] } : { scale: 1 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span
            key="check"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-1.5 text-emerald-400"
          >
            <Check className="size-3.5 shrink-0 text-emerald-400" />
            {copiedLabel && <span className="font-mono text-xs">{copiedLabel}</span>}
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-1.5"
          >
            <Copy className="size-3.5 shrink-0 text-white/70" />
            {label && <span>{label}</span>}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export default CopyButton;
