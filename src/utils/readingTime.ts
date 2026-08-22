import type { BlogPost } from '../types';

export interface ReadingTimeResult {
  words: number;
  chars: number;
  minutes: number;
  seconds: number;
  readTime: string;
  codeBlocksCount: number;
  imagesCount: number;
}

/**
 * Calculates estimated reading time for technical articles based on content length,
 * code blocks, and images.
 * 
 * Standard technical reading speed is ~200 words per minute for prose,
 * with slower digestion for code blocks and diagrams.
 */
export function calculateReadingTime(
  content?: string,
  excerpt?: string
): ReadingTimeResult {
  const rawContent = (content || '').trim();
  const rawExcerpt = (excerpt || '').trim();
  const combined = rawContent || rawExcerpt;

  if (!combined) {
    return {
      words: 0,
      chars: 0,
      minutes: 1,
      seconds: 30,
      readTime: '1 min read',
      codeBlocksCount: 0,
      imagesCount: 0
    };
  }

  // Count code blocks (``` ... ```)
  const codeBlockMatches = rawContent.match(/```[\s\S]*?```/g) || [];
  const codeBlocksCount = codeBlockMatches.length;

  // Count images (![...](...))
  const imageMatches = rawContent.match(/!\[.*?\]\(.*?\)/g) || [];
  const imagesCount = imageMatches.length;

  // Clean content for word counting: remove code blocks, html tags, markdown formatting
  let cleanText = rawContent
    .replace(/```[\s\S]*?```/g, ' ') // replace code blocks
    .replace(/`.*?`/g, ' ') // replace inline code
    .replace(/!\[.*?\]\(.*?\)/g, ' ') // replace images
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // replace links with link text
    .replace(/[#*`_~>\-+=|\\{}[\]()!]/g, ' ') // strip markdown symbols
    .replace(/<[^>]*>/g, ' ') // strip html
    .trim();

  // Words count
  const wordsArray = cleanText.split(/\s+/).filter(Boolean);
  const words = wordsArray.length;
  const chars = cleanText.length;

  // Reading time calculation:
  // - 200 words per minute for clean prose
  // - +12 seconds (~0.2 mins) per code block
  // - +10 seconds (~0.16 mins) per image diagram
  const proseMinutes = words / 200;
  const codeBlockMinutes = codeBlocksCount * 0.2;
  const imageMinutes = imagesCount * 0.16;

  const totalMinutesFloat = proseMinutes + codeBlockMinutes + imageMinutes;
  const totalSeconds = Math.round(totalMinutesFloat * 60);
  
  // Minimum 1 min read for any non-empty article
  const minutes = Math.max(1, Math.ceil(totalMinutesFloat));

  return {
    words,
    chars,
    minutes,
    seconds: Math.max(30, totalSeconds),
    readTime: `${minutes} min read`,
    codeBlocksCount,
    imagesCount
  };
}

/**
 * Returns accurate reading time string for any article object.
 * Automatically recalculates from post.content when available.
 */
export function getArticleReadingTime(post?: Partial<BlogPost> | null): string {
  if (!post) return '5 min read';

  // If content is provided, calculate dynamically from text length
  if (post.content && post.content.trim().length > 0) {
    return calculateReadingTime(post.content, post.excerpt).readTime;
  }

  // If post has a valid stored readTime
  if (post.readTime && post.readTime.trim()) {
    const clean = post.readTime.trim();
    if (clean.toLowerCase().includes('read')) {
      return clean;
    }
    return `${clean} read`;
  }

  // Fallback estimation from excerpt length
  if (post.excerpt && post.excerpt.trim().length > 0) {
    const words = post.excerpt.trim().split(/\s+/).length;
    const est = Math.max(1, Math.ceil(words / 40));
    return `${est} min read`;
  }

  return '5 min read';
}
