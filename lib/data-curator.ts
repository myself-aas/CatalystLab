import { ResearchResult } from '@/lib/types'; 

/**
 * Curates research results by:
 * 1. Filtering to the last 3 years
 * 2. Grouping by source provider
 * 3. Sorting by relevance (or fallback)
 * 4. Taking the top 3 per source
 */
export function curateData(results: ResearchResult[]): ResearchResult[] {
  // 1. Time-Gate: Filter last 3 years
  const threeYearsAgo = new Date();
  threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

  const filteredByDate = results.filter((item) => 
    item.publicationDate && new Date(item.publicationDate) >= threeYearsAgo
  );

  // 2. Group by Source Provider
  // Using a reduce instead of Object.groupBy for wider compatibility
  const groupedBySource = filteredByDate.reduce((acc, item) => {
    const source = item.source || 'Unknown';
    if (!acc[source]) acc[source] = [];
    acc[source].push(item);
    return acc;
  }, {} as Record<string, ResearchResult[]>);

  // 3. Sort and Slice Top 3 per source
  const curatedResults: ResearchResult[] = [];

  for (const source in groupedBySource) {
    const items = groupedBySource[source] || [];
    
    // Sort by citations (fallback to publication date if missing)
    const sorted = [...items].sort((a, b) => (b.citationCount || 0) - (a.citationCount || 0));
    
    // Take top 3
    const top3 = sorted.slice(0, 3);
    
    console.log(`Orchestration Summary: ${source} retrieved ${items.length} items, curated to ${top3.length}.`);
    
    curatedResults.push(...top3);
  }

  return curatedResults;
}
