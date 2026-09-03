import React from 'react';
import { 
  Info, 
  AlertTriangle, 
  BookOpen, 
  Wrench, 
  Trophy, 
  CheckCircle2, 
  Lightbulb 
} from 'lucide-react';
import { 
  CalloutProps, 
  NoteProps, 
  PitfallProps, 
  DeepDiveProps, 
  WipProps, 
  ChallengeProps 
} from '../../../types/design-system';
import { cn } from '../../../lib/utils';

export const Note: React.FC<NoteProps> = ({ title, children, className, type = 'primary', id }) => {
  return (
    <div id={id} className={cn('react-callout react-callout-note', className)}>
      <div className="flex items-center gap-2 mb-2">
        <Info className="w-5 h-5 text-[var(--callout-note-text)]" />
        <strong className="text-[var(--callout-note-text)] font-semibold text-lg">
          {title || 'Note'}
        </strong>
      </div>
      <div className="text-[var(--react-text-primary)] leading-relaxed prose prose-cyan dark:prose-invert">
        {children}
      </div>
    </div>
  );
};

export const Pitfall: React.FC<PitfallProps> = ({ title, children, className, level = 'warning', id }) => {
  return (
    <div id={id} className={cn('react-callout react-callout-pitfall', className)}>
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="w-5 h-5 text-[var(--callout-pitfall-text)]" />
        <strong className="text-[var(--callout-pitfall-text)] font-semibold text-lg">
          {title || 'Pitfall'}
        </strong>
      </div>
      <div className="text-[var(--react-text-primary)] leading-relaxed prose prose-red dark:prose-invert">
        {children}
      </div>
    </div>
  );
};

export const DeepDive: React.FC<DeepDiveProps> = ({ title, children, className, defaultExpanded = false, badge, id }) => {
  return (
    <details 
      id={id} 
      className={cn('react-callout react-callout-deepdive group [&_summary::-webkit-details-marker]:hidden', className)}
      open={defaultExpanded}
    >
      <summary className="flex items-center justify-between cursor-pointer list-none">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[var(--callout-deepdive-text)]" />
          <strong className="text-[var(--callout-deepdive-text)] font-semibold text-lg">
            Deep Dive: {title}
          </strong>
        </div>
        <div className="flex items-center gap-3">
          {badge && (
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-[var(--callout-deepdive-text)] text-white opacity-80">
              {badge}
            </span>
          )}
          <span className="text-[var(--callout-deepdive-text)] transition-transform duration-200 group-open:rotate-180">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </div>
      </summary>
      <div className="mt-4 pt-4 border-t border-[var(--callout-deepdive-border)]/20 text-[var(--react-text-primary)] leading-relaxed prose prose-indigo dark:prose-invert">
        {children}
      </div>
    </details>
  );
};

export const Wip: React.FC<WipProps> = ({ title, children, className, version, id }) => {
  return (
    <div id={id} className={cn('react-callout react-callout-wip', className)}>
      <div className="flex items-center gap-2 mb-2">
        <Wrench className="w-5 h-5 text-[var(--callout-wip-text)]" />
        <strong className="text-[var(--callout-wip-text)] font-semibold text-lg">
          {title || 'Under Construction'}
        </strong>
        {version && (
          <span className="ml-2 px-2 py-0.5 text-xs font-mono rounded bg-[var(--callout-wip-text)] text-white opacity-80">
            v{version}
          </span>
        )}
      </div>
      <div className="text-[var(--react-text-primary)] leading-relaxed prose prose-amber dark:prose-invert">
        {children}
      </div>
    </div>
  );
};

export const Challenge: React.FC<ChallengeProps> = ({ number, title, children, hint, solution }) => {
  return (
    <div className="my-8 border-2 border-[var(--callout-challenge-border)] rounded-2xl overflow-hidden bg-[var(--react-wash)]">
      <div className="bg-[var(--callout-challenge-bg)] px-6 py-4 flex items-center gap-3 border-b border-[var(--callout-challenge-border)]/30">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--callout-challenge-border)] text-white font-bold">
          {number || <Trophy className="w-4 h-4" />}
        </div>
        <h3 className="text-xl font-bold text-[var(--callout-challenge-text)] m-0">
          {title}
        </h3>
      </div>
      
      <div className="p-6 text-[var(--react-text-primary)] prose dark:prose-invert max-w-none">
        {children}
        
        {hint && (
          <details className="mt-6 group">
            <summary className="flex items-center gap-2 cursor-pointer text-[var(--react-text-secondary)] hover:text-[var(--react-text-primary)] font-medium list-none">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              <span>Show hint</span>
              <span className="transition-transform duration-200 group-open:rotate-180">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </summary>
            <div className="mt-3 pl-7 py-2 border-l-2 border-yellow-500/30 text-sm">
              {hint}
            </div>
          </details>
        )}
        
        {solution && (
          <details className="mt-4 group bg-background rounded-xl border border-border">
            <summary className="flex items-center justify-between p-4 cursor-pointer list-none font-semibold text-foreground hover:bg-muted/50 rounded-xl transition-colors">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Show solution</span>
              </div>
              <span className="transition-transform duration-200 group-open:rotate-180 text-muted-foreground">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </summary>
            <div className="p-6 pt-2 border-t border-border">
              {solution}
            </div>
          </details>
        )}
      </div>
    </div>
  );
};
