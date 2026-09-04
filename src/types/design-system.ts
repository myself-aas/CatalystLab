export type CalloutVariant = 'note' | 'pitfall' | 'deepdive' | 'wip' | 'challenge' | 'solution';

export interface CalloutProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export interface NoteProps extends CalloutProps {
  type?: 'primary' | 'secondary' | 'cyan';
}

export interface PitfallProps extends CalloutProps {
  level?: 'critical' | 'warning';
}

export interface DeepDiveProps extends CalloutProps {
  title: string;
  defaultExpanded?: boolean;
  badge?: string;
}

export interface WipProps extends CalloutProps {
  version?: string;
}

export interface ChallengeProps {
  number?: number;
  title: string;
  children: React.ReactNode;
  hint?: React.ReactNode;
  solution?: React.ReactNode;
}

export interface NavItem {
  id: string;
  path: string;
  title: string;
  badge?: string;
  icon?: string;
  isExternal?: boolean;
}

export interface NavGroup {
  group: string;
  items: NavItem[];
}

export interface SearchResultItem {
  id: string;
  title: string;
  path: string;
  category: 'Documentation' | 'Diagnostic Engines' | 'API Reference' | 'Articles' | 'Tools';
  description?: string;
  badge?: string;
}

export interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  highlightedLines?: number[];
  showLineNumbers?: boolean;
  autoStartTypewriter?: boolean;
  className?: string;
  id?: string;
  runnableCommand?: string;
}

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  content: React.ReactNode;
  badge?: string;
}
