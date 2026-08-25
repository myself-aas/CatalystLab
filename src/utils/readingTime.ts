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

export function calculateReadingTime(content?: string, excerpt?: string): ReadingTimeResult {
  const text = (content || excerpt || '').trim();
  const words = text ? text.split(/\s+/).length : 0;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return { words, chars: text.length, minutes, seconds: minutes * 60, readTime: `${minutes} min read`, codeBlocksCount: 0, imagesCount: 0 };
}

export function getArticleReadingTime(post?: Partial<BlogPost> | null): string {
  if (post?.readTime) return post.readTime.includes('read') ? post.readTime : `${post.readTime} read`;
  return calculateReadingTime(post?.content, post?.excerpt).readTime;
}
