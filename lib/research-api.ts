import { useAuthStore } from '@/stores/authStore';

export interface Paper {
  id: string;
  title: string;
  authors: string[];
  year: number;
  abstract: string;
  url: string;
  pdfUrl?: string | null;
  citationCount: number;
  source: string;
  doi?: string;
  journal?: string;
}

async function fetchFromProxy(endpoint: string) {
  const user = useAuthStore.getState().user;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  
  if (user) {
    const idToken = await user.getIdToken();
    headers['Authorization'] = `Bearer ${idToken}`;
  }

  const res = await fetch(endpoint, { headers });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    if (res.status === 402 || errorData.code === 'INSUFFICIENT_TOKENS') {
      throw new Error('INSUFFICIENT_TOKENS');
    }
    throw new Error(errorData.error || `Request failed with status ${res.status}`);
  }
  return res;
}

function safeYear(val: any): number {
  if (!val) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const parsed = parseInt(val, 10);
  if (!isNaN(parsed)) return parsed;
  const d = new Date(val);
  if (!isNaN(d.getFullYear())) return d.getFullYear();
  return 0;
}

export async function searchSemanticScholar(query: string): Promise<Paper[]> {
  try {
    const res = await fetchFromProxy(`/api/research/proxy?source=ss&q=${encodeURIComponent(query)}`);
    const data = await res.json();
    return (data.data || []).map((p: any) => ({
      id: p.paperId,
      title: p.title,
      authors: (p.authors || []).map((a: any) => a.name),
      year: safeYear(p.year),
      abstract: p.abstract || '',
      url: p.url,
      pdfUrl: p.openAccessPdf?.url,
      citationCount: p.citationCount || 0,
      source: 'ss',
      doi: p.externalIds?.DOI,
      journal: p.journal?.name
    }));
  } catch (e) {
    console.error("SS Error", e);
    return [];
  }
}

export async function searchOpenAlex(query: string): Promise<Paper[]> {
  try {
    const res = await fetchFromProxy(`/api/research/proxy?source=oa&q=${encodeURIComponent(query)}`);
    const data = await res.json();
    return (data.results || []).map((p: any) => {
      // Reconstruct abstract
      let abstract = '';
      if (p.abstract_inverted_index) {
        const inverted = p.abstract_inverted_index;
        const abstractArr: string[] = [];
        Object.entries(inverted).forEach(([word, positions]) => {
          (positions as number[]).forEach(pos => abstractArr[pos] = word);
        });
        abstract = abstractArr.join(' ');
      }

      return {
        id: p.id,
        title: p.title,
        authors: (p.authorships || []).map((a: any) => a.author.display_name),
        year: safeYear(p.publication_year),
        abstract,
        url: `https://doi.org/${p.doi?.replace('https://doi.org/', '')}`,
        pdfUrl: p.open_access?.oa_url,
        citationCount: p.cited_by_count || 0,
        source: 'oa',
        doi: p.doi?.replace('https://doi.org/', '')
      };
    });
  } catch (e) {
    console.error("OA Error", e);
    return [];
  }
}

export async function searchArxiv(query: string): Promise<Paper[]> {
  try {
    const res = await fetchFromProxy(`/api/research/proxy?source=arxiv&q=${encodeURIComponent(query)}`);
    const text = await res.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, 'text/xml');
    const entries = xml.querySelectorAll('entry');
    return Array.from(entries).map(entry => {
      const title = entry.querySelector('title')?.textContent?.trim() || '';
      const summary = entry.querySelector('summary')?.textContent?.trim() || '';
      const authors = Array.from(entry.querySelectorAll('author name')).map(a => a.textContent || '');
      const published = entry.querySelector('published')?.textContent || '';
      const id = entry.querySelector('id')?.textContent || '';
      const pdfLink = Array.from(entry.querySelectorAll('link')).find(l => l.getAttribute('title') === 'pdf')?.getAttribute('href');

      return {
        id,
        title,
        authors,
        year: safeYear(published),
        abstract: summary,
        url: id,
        pdfUrl: pdfLink,
        citationCount: 0,
        source: 'arxiv'
      };
    });
  } catch (e) {
    console.error("Arxiv Error", e);
    return [];
  }
}

export async function searchPubMed(query: string): Promise<Paper[]> {
  try {
    const searchRes = await fetch(`/api/research/proxy?source=pm_search&q=${encodeURIComponent(query)}`);
    const searchData = await searchRes.json();
    const ids = searchData.esearchresult.idlist;
    if (!ids || ids.length === 0) return [];

    const summaryRes = await fetchFromProxy(`/api/research/proxy?source=pm_summary&q=${ids.join(',')}`);
    const summaryData = await summaryRes.json();
    return ids.map((id: string) => {
      const p = summaryData.result[id];
      return {
        id,
        title: p.title,
        authors: (p.authors || []).map((a: any) => a.name),
        year: safeYear(p.pubdate),
        abstract: '', // PubMed summary doesn't include abstract, would need efetch
        url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
        citationCount: 0,
        source: 'pm'
      };
    });
  } catch (e) {
    console.error("PubMed Error", e);
    return [];
  }
}

export async function searchCrossref(query: string): Promise<Paper[]> {
  try {
    const res = await fetchFromProxy(`/api/research/proxy?source=cr&q=${encodeURIComponent(query)}`);
    const data = await res.json();
    return (data.message.items || []).map((p: any) => ({
      id: p.DOI,
      title: p.title?.[0] || '',
      authors: (p.author || []).map((a: any) => `${a.given} ${a.family}`),
      year: safeYear(p.published?.['date-parts']?.[0]?.[0]),
      abstract: p.abstract?.replace(/<[^>]*>/g, '') || '',
      url: `https://doi.org/${p.DOI}`,
      pdfUrl: p.link?.[0]?.URL,
      citationCount: p['is-referenced-by-count'] || 0,
      source: 'cr',
      doi: p.DOI,
      journal: p['container-title']?.[0]
    }));
  } catch (e) {
    console.error("Crossref Error", e);
    return [];
  }
}

export async function searchEuropePMC(query: string): Promise<Paper[]> {
  try {
    const res = await fetchFromProxy(`/api/research/proxy?source=epmc&q=${encodeURIComponent(query)}`);
    const data = await res.json();
    return (data.resultList.result || []).map((p: any) => ({
      id: p.id,
      title: p.title,
      authors: (p.authorString || '').split(', '),
      year: safeYear(p.pubYear),
      abstract: p.abstractText || '',
      url: `https://europepmc.org/article/${p.source}/${p.id}`,
      pdfUrl: p.fullTextUrlList?.fullTextUrl?.[0]?.url,
      citationCount: p.citationCount || 0,
      source: 'epmc',
      doi: p.doi
    }));
  } catch (e) {
    console.error("EPMC Error", e);
    return [];
  }
}

export async function searchDOAJ(query: string): Promise<Paper[]> {
  try {
    const res = await fetchFromProxy(`/api/research/proxy?source=doaj&q=${encodeURIComponent(query)}`);
    const data = await res.json();
    return (data.results || []).map((p: any) => ({
      id: p.bibjson?.identifier?.[0]?.id || Math.random().toString(),
      title: p.bibjson?.title || '',
      authors: (p.bibjson?.author || []).map((a: any) => a.name),
      year: safeYear(p.bibjson?.year),
      abstract: p.bibjson?.abstract || '',
      url: p.bibjson?.link?.[0]?.url,
      pdfUrl: p.bibjson?.link?.find((l: any) => l.type === 'fulltext')?.url,
      citationCount: 0,
      source: 'doaj',
      journal: p.bibjson?.journal?.title
    }));
  } catch (e) {
    console.error("DOAJ Error", e);
    return [];
  }
}

export async function searchCore(query: string): Promise<Paper[]> {
  try {
    const res = await fetchFromProxy(`/api/research/proxy?source=core&q=${encodeURIComponent(query)}`);
    const data = await res.json();
    return (data.results || []).map((p: any) => ({
      id: p.id?.toString() || Math.random().toString(),
      title: p.title || '',
      authors: (p.authors || []).map((a: any) => a.name),
      year: safeYear(p.yearPublished),
      abstract: p.abstract || '',
      url: p.downloadUrl || p.identifiers?.find((i: string) => i.startsWith('http')) || '',
      pdfUrl: p.downloadUrl,
      citationCount: 0,
      source: 'core'
    }));
  } catch (e) {
    console.error("CORE Error", e);
    return [];
  }
}

export async function enrichWithUnpaywall(doi: string): Promise<string | null> {
  try {
    const res = await fetchFromProxy(`/api/research/proxy?source=unpaywall&q=${encodeURIComponent(doi)}`);
    const data = await res.json();
    return data.best_oa_location?.url_for_pdf || null;
  } catch (e) {
    return null;
  }
}

export async function searchSelected(query: string, sources: string[]): Promise<Paper[]> {
  const searchFunctions: Record<string, (q: string) => Promise<Paper[]>> = {
    'Semantic Scholar': searchSemanticScholar,
    'OpenAlex': searchOpenAlex,
    'arXiv': searchArxiv,
    'PubMed': searchPubMed,
    'CORE': searchCore,
    'Crossref': searchCrossref,
    'Europe PMC': searchEuropePMC,
    'DOAJ': searchDOAJ
  };

  const selectedFunctions = sources
    .filter(s => searchFunctions[s])
    .map(s => searchFunctions[s](query));

  const results = await Promise.allSettled(selectedFunctions);

  const allPapers: Paper[] = [];
  results.forEach(res => {
    if (res.status === 'fulfilled') {
      allPapers.push(...res.value);
    }
  });

  // Deduplicate by DOI or Title
  const seen = new Set();
  const uniquePapers = allPapers.filter(p => {
    const key = p.doi || p.title.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Rank: has pdf > citation count > year
  const rankedPapers = uniquePapers.sort((a, b) => {
    const aScore = (a.pdfUrl ? 3 : 0) + (a.citationCount > 10 ? 2 : 0) + (a.year > 2020 ? 1 : 0);
    const bScore = (b.pdfUrl ? 3 : 0) + (b.citationCount > 10 ? 2 : 0) + (b.year > 2020 ? 1 : 0);
    return bScore - aScore;
  });

  // Enrich with Unpaywall
  const enrichedPapers = await Promise.all(rankedPapers.map(async (p) => {
    if (p.doi && !p.pdfUrl) {
      const pdfUrl = await enrichWithUnpaywall(p.doi);
      if (pdfUrl) {
        return { ...p, pdfUrl };
      }
    }
    return p;
  }));

  return enrichedPapers;
}

export async function searchAll(query: string): Promise<Paper[]> {
  return searchSelected(query, [
    'Semantic Scholar', 'OpenAlex', 'arXiv', 'PubMed', 'CORE', 'Crossref', 'Europe PMC', 'DOAJ'
  ]);
}

export async function getPaperById(id: string): Promise<Paper | null> {
  try {
    // Try Semantic Scholar first
    const res = await fetch(`https://api.semanticscholar.org/graph/v1/paper/${encodeURIComponent(id)}?fields=title,authors,year,abstract,citationCount,openAccessPdf,url,externalIds,journal`);
    if (res.ok) {
      const p = await res.json();
      return {
        id: p.paperId,
        title: p.title,
        authors: (p.authors || []).map((a: any) => a.name),
        year: safeYear(p.year),
        abstract: p.abstract || '',
        url: p.url,
        pdfUrl: p.openAccessPdf?.url,
        citationCount: p.citationCount || 0,
        source: 'ss',
        doi: p.externalIds?.DOI,
        journal: p.journal?.name
      };
    }
    return null;
  } catch (e) {
    console.error("getPaperById Error", e);
    return null;
  }
}
