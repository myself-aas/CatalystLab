import { Paper } from '@/lib/types';

const BASE_URL = 'https://api.crossref.org';

export async function searchCrossRef(query: string, limit = 10): Promise<Paper[]> {
  try {
    const response = await fetch(
      `${BASE_URL}/works?query=${encodeURIComponent(query)}&rows=${limit}&select=DOI,title,author,published,abstract,is-referenced-by-count,container-title,volume,issue,page`
    );
    
    if (!response.ok) return [];
    
    const data = await response.json();
    
    return (data.message?.items || []).map((p: any) => ({
      id: `doi:${p.DOI}`,
      title: p.title?.[0] || '',
      authors: (p.author || []).map((a: any) => `${a.given || ''} ${a.family || ''}`.trim()),
      year: p.published?.['date-parts']?.[0]?.[0] || null,
      abstract: p.abstract?.replace(/<[^>]*>?/gm, '') || null,
      doi: p.DOI || null,
      url: `https://doi.org/${p.DOI}` || null,
      pdf_url: null,
      citation_count: p['is-referenced-by-count'] || 0,
      reference_count: 0,
      source: 'CrossRef',
      external_ids: null,
      fields_of_study: null,
      journal: p['container-title']?.[0] || null,
      volume: p.volume || null,
      issue: p.issue || null,
      pages: p.page || null,
      publisher: null,
      tldr: null,
      credibility_score: null,
      cached_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
  } catch (error) {
    console.error('CrossRef search error:', error);
    return [];
  }
}
