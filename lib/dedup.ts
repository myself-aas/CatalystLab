import { Paper } from '@/lib/types';

export function deduplicatePapers(papers: Paper[]): Paper[] {
  const seenDois = new Set<string>();
  const seenTitles = new Set<string>();
  const uniquePapers: Paper[] = [];

  for (const paper of papers) {
    const normalizedTitle = paper.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    if (paper.doi) {
      if (seenDois.has(paper.doi)) {
        // Find existing paper and merge data if needed
        const existingIndex = uniquePapers.findIndex(p => p.doi === paper.doi);
        if (existingIndex !== -1) {
          uniquePapers[existingIndex] = mergePaperData(uniquePapers[existingIndex], paper);
        }
        continue;
      }
      seenDois.add(paper.doi);
    }

    if (seenTitles.has(normalizedTitle)) {
      const existingIndex = uniquePapers.findIndex(p => 
        p.title.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedTitle
      );
      if (existingIndex !== -1) {
        uniquePapers[existingIndex] = mergePaperData(uniquePapers[existingIndex], paper);
      }
      continue;
    }
    
    seenTitles.add(normalizedTitle);
    uniquePapers.push(paper);
  }

  return uniquePapers;
}

function mergePaperData(p1: Paper, p2: Paper): Paper {
  return {
    ...p1,
    abstract: p1.abstract || p2.abstract,
    pdf_url: p1.pdf_url || p2.pdf_url,
    citation_count: Math.max(p1.citation_count || 0, p2.citation_count || 0),
    year: p1.year || p2.year,
    doi: p1.doi || p2.doi,
    fields_of_study: Array.from(new Set([...(p1.fields_of_study || []), ...(p2.fields_of_study || [])])),
  };
}
