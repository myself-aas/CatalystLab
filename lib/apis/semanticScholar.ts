import { Paper } from '@/lib/types';

const BASE_URL = 'https://api.semanticscholar.org/graph/v1';

export async function searchSemanticScholar(query: string, limit = 10): Promise<Paper[]> {
  try {
    const response = await fetch(
      `${BASE_URL}/paper/search?query=${encodeURIComponent(query)}&fields=title,authors,year,abstract,citationCount,referenceCount,externalIds,openAccessPdf,url,fieldsOfStudy,journal,publicationTypes&limit=${limit}`
    );
    
    if (!response.ok) return [];
    
    const data = await response.json();
    
    return (data.data || []).map((p: any) => ({
      id: p.paperId,
      title: p.title,
      authors: (p.authors || []).map((a: any) => a.name),
      year: p.year,
      abstract: p.abstract,
      doi: p.externalIds?.DOI,
      url: p.url,
      pdf_url: p.openAccessPdf?.url,
      citation_count: p.citationCount || 0,
      reference_count: p.referenceCount || 0,
      source: 'Semantic Scholar',
      external_ids: p.externalIds,
      fields_of_study: p.fieldsOfStudy,
      journal: p.journal?.name,
      volume: p.journal?.volume,
      issue: p.journal?.issue,
      pages: p.journal?.pages,
    }));
  } catch (error) {
    console.error('Semantic Scholar search error:', error);
    return [];
  }
}

export async function getPaperCitations(id: string, limit = 30): Promise<any[]> {
  try {
    const response = await fetch(
      `${BASE_URL}/paper/${id}/citations?fields=title,year,citationCount,authors&limit=${limit}`
    );
    if (!response.ok) return [];
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    return [];
  }
}

export async function getPaperReferences(id: string, limit = 30): Promise<any[]> {
  try {
    const response = await fetch(
      `${BASE_URL}/paper/${id}/references?fields=title,year,citationCount,authors&limit=${limit}`
    );
    if (!response.ok) return [];
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    return [];
  }
}
