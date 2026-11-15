/**
 * Styled replacements for the HTML elements MDX emits. The site does not ship
 * `@tailwindcss/typography`, so without these an article renders with
 * Tailwind's reset (unsized headings, bullet-less lists). The classes mirror
 * `src/components/common/MarkdownRenderer.tsx` so MDX posts match the rest of
 * the site's long-form content.
 */
import type { ComponentPropsWithoutRef } from 'react';
import type { MDXComponents } from 'mdx/types';
import { sanitizeHref } from '@/lib/sanitizeHref';
import { resolveBlogAsset } from '../lib/assets';

const BODY = 'text-base leading-relaxed text-foreground dark:text-muted-foreground';

function Anchor({ href = '', children, ...rest }: ComponentPropsWithoutRef<'a'>) {
  const safe = sanitizeHref(href);
  if (!safe) return <span>{children}</span>;
  const external = /^https?:\/\//i.test(safe);
  return (
    <a
      {...rest}
      href={safe}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="font-semibold text-cyan-700 underline hover:text-cyan-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 dark:text-cyan-400 dark:hover:text-cyan-300"
    >
      {children}
    </a>
  );
}

function Image({ src, alt = '', ...rest }: ComponentPropsWithoutRef<'img'>) {
  return (
    <img
      {...rest}
      src={typeof src === 'string' ? resolveBlogAsset(src) : src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className="my-6 w-full rounded-2xl border border-border"
    />
  );
}

export const elementComponents: MDXComponents = {
  h1: (props) => <h2 {...props} className="mb-4 mt-8 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl" />,
  h2: (props) => (
    <h2 {...props} className="mb-4 mt-8 border-b border-border pb-2 text-xl font-extrabold tracking-tight text-foreground sm:text-2xl" />
  ),
  h3: (props) => <h3 {...props} className="mb-3 mt-6 text-lg font-bold tracking-tight text-foreground sm:text-xl" />,
  h4: (props) => <h4 {...props} className="mb-2 mt-5 text-base font-bold text-foreground" />,
  p: (props) => <p {...props} className={`my-3 ${BODY}`} />,
  ul: (props) => <ul {...props} className={`my-4 list-disc space-y-2 pl-6 ${BODY}`} />,
  ol: (props) => <ol {...props} className={`my-4 list-decimal space-y-2 pl-6 ${BODY}`} />,
  li: (props) => <li {...props} className="marker:text-cyan-600 dark:marker:text-cyan-400" />,
  strong: (props) => <strong {...props} className="font-bold text-foreground" />,
  a: Anchor,
  img: Image,
  code: (props) => (
    <code
      {...props}
      className="rounded border border-border bg-accent px-1.5 py-0.5 font-mono text-sm font-semibold text-foreground dark:bg-muted dark:text-cyan-300"
    />
  ),
  blockquote: (props) => (
    <blockquote {...props} className={`my-6 border-l-4 border-border pl-4 italic ${BODY}`} />
  ),
  hr: (props) => <hr {...props} className="my-8 border-border" />,
  table: (props) => (
    <div className="my-6 overflow-x-auto rounded-xl border border-border">
      <table {...props} className="w-full border-collapse text-left text-sm" />
    </div>
  ),
  th: (props) => <th {...props} className="border-b border-border bg-muted/40 px-3 py-2 font-semibold text-foreground" />,
  td: (props) => <td {...props} className="border-b border-border px-3 py-2 align-top text-foreground dark:text-muted-foreground" />,
};
