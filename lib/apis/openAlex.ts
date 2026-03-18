import { Paper } from '@/lib/types';

const BASE_URL = 'https://api.openalex.org';

export async function searchOpenAlex(query: string, limit = 10): Promise<Paper[]> {
  try {
    const response = await fetch(
      `${BASE_URL}/works?search=${encodeURIComponent(query)}&per-page=${limit}&select=id,title,authorships,publication_year,abstract_inverted_index,cited_by_count,doi,open_access,primary_location,concepts,biblio`
    );
    
    if (!response.ok) return [];
    
    const data = await response.json();
    
    return (data.results || []).map((p: any) => ({
      id: p.id || '',
      title: p.title || '',
      authors: (p.authorships || []).map((a: any) => a.author?.display_name),
      year: p.publication_year || null,
      abstract: reconstructAbstract(p.abstract_inverted_index) || null,
      doi: p.doi?.replace('https://doi.org/', '') || null,
      url: p.primary_location?.landing_page_url || null,
      pdf_url: p.open_access?.oa_url || null,
      citation_count: p.cited_by_count || 0,
      reference_count: 0,
      source: 'OpenAlex',
      external_ids: null,
      fields_of_study: (p.concepts || []).map((c: any) => c.display_name),
      journal: p.primary_location?.source?.display_name || null,
      volume: p.biblio?.volume || null,
      issue: p.biblio?.issue || null,
      pages: `${p.biblio?.first_page || ''}-${p.biblio?.last_page || ''}` || null,
      publisher: null,
      tldr: null,
      credibility_score: null,
      cached_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
  } catch (error) {
    console.error('OpenAlex search error:', error);
    return [];
  }
}

function reconstructAbstract(invertedIndex: any): string | undefined {
  if (!invertedIndex) return undefined;
  
  const words: string[] = [];
  Object.entries(invertedIndex).forEach(([word, positions]: [string, any]) => {
    positions.forEach((pos: number) => {
      words[pos] = word;
    });
  });
  
  return words.join(' ');
}
