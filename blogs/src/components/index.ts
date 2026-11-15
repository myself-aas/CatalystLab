import type { MDXComponents } from 'mdx/types';
import { Callout } from './Callout';
import { CodeBlock } from './CodeBlock';
import { elementComponents } from './elements';
import { Tab, Tabs } from './Tabs';

export { Callout, CodeBlock, Tab, Tabs };

/**
 * Everything an `.mdx` post can use without importing it. Pass to a compiled
 * post as `<Content components={mdxComponents} />`. Add new custom components
 * here and document them in `blogs/instructions/component-usage.md`.
 */
export const mdxComponents: MDXComponents = {
  ...elementComponents,
  pre: CodeBlock,
  Callout,
  Tabs,
  Tab,
};
