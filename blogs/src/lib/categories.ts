/** Allowed `category` values. Dependency-free so list views can import it cheaply. */
export const BLOG_CATEGORIES = [
  'Core Performance',
  'Edge Latency',
  'AI & LLMO',
  'SecOps',
  'Sustainability',
  'Compliance & Security',
  'Architecture',
  'AI Search',
  'Release Notes',
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];
