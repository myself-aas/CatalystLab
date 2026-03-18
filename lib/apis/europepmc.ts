import { Paper } from '@/lib/types';

const BASE_URL = 'https://www.ebi.ac.uk/europepmc/webservices/rest';

export async function searchEuropePMC(query: string, limit = 10): Promise<Paper[]> {
  try {
    const response = await fetch(
      `${BASE_URL}/search?query=${encodeURIComponent(query)}&format=json&pageSize=${limit}&resultType=core`
    );
    
    if (!response.ok) return [];
    
    const data = await response.json();
    
    return (data.resultList?.result || []).map((p: any) => ({
      id: `pmc:${p.id}`,
      title: p.title || '',
      authors: (p.authorList?.author || []).map((a: any) => a.fullName),
      year: p.pubYear ? parseInt(p.pubYear) : null,
      abstract: p.abstractText || null,
      doi: p.doi || null,
      url: `https://europepmc.org/article/${p.source}/${p.id}` || null,
      pdf_url: p.fullTextUrlList?.fullTextUrl?.[0]?.url || null,
      citation_count: p.citedByCount || 0,
      reference_count: 0,
      source: 'Europe PMC',
      external_ids: null,
      fields_of_study: null,
      journal: p.journalTitle || null,
      volume: p.journalVolume || null,
      issue: p.journalIssue || null,
      pages: p.pageInfo || null,
      publisher: null,
      tldr: null,
      credibility_score: null,
      cached_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Europe PMC search error:', error);
    return [];
  }
}
