import { NextRequest, NextResponse } from 'next/server';
import { verifyAndDeductTokens } from '@/lib/tokens-server';
import { TOKEN_COSTS } from '@/lib/tokens-config';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');
  const source = searchParams.get('source');

  if (!query || !source) {
    return NextResponse.json({ error: 'Missing query or source' }, { status: 400 });
  }

  // Enforce tokens
  const tokenResult = await verifyAndDeductTokens(req, TOKEN_COSTS.SEARCH_PROXY);
  if ('error' in tokenResult) {
    return NextResponse.json({ 
      error: tokenResult.error, 
      code: tokenResult.status === 402 ? 'INSUFFICIENT_TOKENS' : 'AUTH_ERROR' 
    }, { status: tokenResult.status });
  }

  try {
    let url = '';
    let options: RequestInit = { method: 'GET' };

    switch (source) {
      case 'ss':
        url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&fields=title,authors,year,abstract,citationCount,openAccessPdf,url,externalIds,journal&limit=5`;
        break;
      case 'oa':
        url = `https://api.openalex.org/works?search=${encodeURIComponent(query)}&per-page=5&select=id,title,authorships,publication_year,cited_by_count,abstract_inverted_index,open_access,doi&mailto=catalystlab@catalystlab.tech`;
        break;
      case 'arxiv':
        url = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&max_results=5&sortBy=relevance`;
        break;
      case 'pm_search':
        url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=5&retmode=json&tool=catalystlab&email=catalystlab@catalystlab.tech`;
        break;
      case 'pm_summary':
        url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${query}&retmode=json`;
        break;
      case 'cr':
        url = `https://api.crossref.org/works?query=${encodeURIComponent(query)}&rows=5&select=DOI,title,author,published,abstract,is-referenced-by-count,container-title,link&mailto=catalystlab@catalystlab.tech`;
        break;
      case 'epmc':
        url = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(query)}&format=json&pageSize=5&resultType=core`;
        break;
      case 'doaj':
        url = `https://doaj.org/api/search/articles/${encodeURIComponent(query)}?pageSize=5`;
        break;
      case 'core':
        url = 'https://api.core.ac.uk/v3/search/works';
        options = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CORE_API_KEY || ''}`
          },
          body: JSON.stringify({ q: query, limit: 5 })
        };
        break;
      case 'unpaywall':
        url = `https://api.unpaywall.org/v2/${query}?email=catalystlab@catalystlab.tech`;
        break;
      default:
        return NextResponse.json({ error: 'Invalid source' }, { status: 400 });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout

    const res = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (source === 'arxiv') {
      const text = await res.text();
      return new NextResponse(text, {
        headers: { 'Content-Type': 'application/xml' }
      });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Proxy error for ${source}:`, error);
    return NextResponse.json({ error: 'Failed to fetch from source' }, { status: 500 });
  }
}
