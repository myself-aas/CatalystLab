import { TableOfContentsItem } from '../types/design-system';

/**
 * Extracts H2 and H3 headings from an HTML container element or string
 */
export function extractHeadingsFromElement(element: HTMLElement | null): TableOfContentsItem[] {
  if (!element) return [];

  const headingNodes = element.querySelectorAll('h2, h3');
  const items: TableOfContentsItem[] = [];

  headingNodes.forEach((node) => {
    const text = node.textContent?.replace(/#/g, '').trim() || '';
    if (!text) return;

    let id = node.id;
    if (!id) {
      id = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      node.id = id;
    }

    const level = node.tagName.toLowerCase() === 'h2' ? 2 : 3;
    items.push({ id, title: text, level });
  });

  return items;
}

/**
 * Hook or helper to observe which heading is currently active in the viewport
 */
export function useActiveHeading(headingIds: string[]): string {
  const [activeId, setActiveId] = React.useState<string>('');

  React.useEffect(() => {
    if (headingIds.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      {
        rootMargin: '0px 0px -70% 0px',
        threshold: 0.1,
      }
    );

    headingIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headingIds]);

  return activeId || headingIds[0] || '';
}

import React from 'react';
