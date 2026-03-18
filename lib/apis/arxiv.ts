import { Paper } from '@/lib/types';

const BASE_URL = 'https://export.arxiv.org/api/query';

export async function searchArxiv(query: string, limit = 10): Promise<Paper[]> {
  try {
    const response = await fetch(
      `${BASE_URL}?search_query=all:${encodeURIComponent(query)}&max_results=${limit}&sortBy=relevance`
    );
    
    if (!response.ok) return [];
    
    const text = await response.text();
    
    // Simple XML parsing for Arxiv Atom feed
    const entries = text.split('<entry>');
    entries.shift(); // remove header
    
    return entries.map((entry: string) => {
      const title = entry.match(/<title>(.*?)<\/title>/s)?.[1]?.trim() || '';
      const authors = [...entry.matchAll(/<name>(.*?)<\/name>/g)].map(m => m[1]);
      const year = entry.match(/<published>(.*?)<\/published>/)?.[1]?.substring(0, 4);
      const abstract = entry.match(/<summary>(.*?)<\/summary>/s)?.[1]?.trim();
      const id = entry.match(/<id>(.*?)<\/id>/)?.[1]?.split('/').pop();
      const pdf_url = entry.match(/<link title="pdf" href="(.*?)"/)?.[1];
      const url = entry.match(/<link href="(.*?)"/)?.[1];
      const doi = entry.match(/<arxiv:doi>(.*?)<\/arxiv:doi>/)?.[1];
      
      return {
        id: id || '',
        title,
        authors,
        year: year ? parseInt(year) : null,
        abstract: abstract || null,
        doi: doi || null,
        url: url || null,
        pdf_url: pdf_url || null,
        citation_count: 0,
        reference_count: 0,
        source: 'arXiv',
        external_ids: null,
        fields_of_study: null,
        journal: null,
        volume: null,
        issue: null,
        pages: null,
        publisher: null,
        tldr: null,
        credibility_score: null,
        cached_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    });
  } catch (error) {
    console.error('Arxiv search error:', error);
    return [];
  }
}
