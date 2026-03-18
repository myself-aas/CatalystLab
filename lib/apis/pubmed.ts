import { Paper } from '@/lib/types';

const SEARCH_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi';
const SUMMARY_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi';

export async function searchPubMed(query: string, limit = 10): Promise<Paper[]> {
  try {
    const searchResponse = await fetch(
      `${SEARCH_URL}?db=pubmed&term=${encodeURIComponent(query)}&retmax=${limit}&retmode=json&tool=catalyst`
    );
    
    if (!searchResponse.ok) return [];
    
    const searchData = await searchResponse.json();
    const ids = searchData.esearchresult?.idlist || [];
    
    if (ids.length === 0) return [];
    
    const summaryResponse = await fetch(
      `${SUMMARY_URL}?db=pubmed&id=${ids.join(',')}&retmode=json`
    );
    
    if (!summaryResponse.ok) return [];
    
    const summaryData = await summaryResponse.json();
    const results = summaryData.result || {};
    
    return ids.map((id: string) => {
      const p = results[id];
      if (!p) return null;
      
      return {
        id: `pubmed:${id}`,
        title: p.title || '',
        authors: (p.authors || []).map((a: any) => a.name),
        year: p.pubdate ? parseInt(p.pubdate.substring(0, 4)) : null,
        abstract: p.abstract || null,
        doi: p.elocationid?.replace('doi: ', '') || null,
        url: `https://pubmed.ncbi.nlm.nih.gov/${id}/` || null,
        pdf_url: null,
        citation_count: 0,
        reference_count: 0,
        source: 'PubMed',
        external_ids: null,
        fields_of_study: null,
        journal: p.fulljournalname || null,
        volume: p.volume || null,
        issue: p.issue || null,
        pages: p.pages || null,
        publisher: null,
        tldr: null,
        credibility_score: null,
        cached_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }).filter(Boolean) as Paper[];
  } catch (error) {
    console.error('PubMed search error:', error);
    return [];
  }
}
