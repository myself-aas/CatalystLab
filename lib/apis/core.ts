import { Paper } from '@/lib/types';

const BASE_URL = 'https://api.core.ac.uk/v3';

export async function searchCore(query: string, limit = 10): Promise<Paper[]> {
  const apiKey = process.env.CORE_API_KEY;
  if (!apiKey) return [];
  
  try {
    const response = await fetch(`${BASE_URL}/search/works`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ q: query, limit })
    });
    
    if (!response.ok) return [];
    
    const data = await response.json();
    
    return (data.results || []).map((p: any) => ({
      id: p.id || '',
      title: p.title || '',
      authors: (p.authors || []).map((a: any) => a.name),
      year: p.yearPublished ? parseInt(p.yearPublished) : null,
      abstract: p.abstract || null,
      doi: p.doi || null,
      url: p.downloadUrl || null,
      pdf_url: p.downloadUrl || null,
      citation_count: 0,
      reference_count: 0,
      source: 'CORE',
      external_ids: null,
      fields_of_study: null,
      journal: p.journals?.[0]?.title || null,
      volume: null,
      issue: null,
      pages: null,
      publisher: p.publisher || null,
      tldr: null,
      credibility_score: null,
      cached_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
  } catch (error) {
    console.error('CORE search error:', error);
    return [];
  }
}
