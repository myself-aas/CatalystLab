import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import { z } from 'zod';
import { parseISO, isValid, parse, subYears, isAfter } from 'date-fns';
import { ResearchResult, validateResearchResult } from './types';

// Backward compatibility alias for parts of the system still using the Name "Paper"
export type Paper = ResearchResult;

const parser = new XMLParser();
const MAX_PER_SOURCE = 5;

/**
 * Extracts a robust publication Date object from a heterogeneous ResearchResult item.
 * Leverages date-fns parsing & falls back to native constructors and publication year.
 */
export function extractPublicationDate(item: ResearchResult): Date | null {
  const dateStr = item.date?.trim();
  if (!dateStr) {
    if (item.year && item.year > 0) {
      try {
        const yearDate = parseISO(`${item.year}-01-01`);
        if (isValid(yearDate)) {
          return yearDate;
        }
      } catch (e) {}
    }
    return null;
  }

  // 1. Try ISO parsing (most common: YYYY-MM-DD, YYYY-MM-DDTHH:mm:ssZ, etc.)
  try {
    const isoDate = parseISO(dateStr);
    if (isValid(isoDate)) {
      return isoDate;
    }
  } catch (err) {}

  // 2. Try parsing standard date formats using date-fns
  const formats = [
    'yyyy-MM-dd',
    'yyyy/MM/dd',
    'yyyy MMM dd',
    'yyyy MMM',
    'yyyy',
    'MMM yyyy',
    'MMM dd, yyyy',
    'MM-dd-yyyy',
    'MM/dd/yyyy'
  ];

  for (const fmt of formats) {
    try {
      const parsedDate = parse(dateStr, fmt, new Date());
      if (isValid(parsedDate)) {
        return parsedDate;
      }
    } catch (err) {}
  }

  // 3. Fallback to Native Date constructor
  try {
    const nativeDate = new Date(dateStr);
    if (isValid(nativeDate)) {
      return nativeDate;
    }
  } catch (err) {}

  // 4. Final fallback to year if available
  if (item.year && item.year > 0) {
    try {
      const fallbackYearDate = parseISO(`${item.year}-01-01`);
      if (isValid(fallbackYearDate)) {
        return fallbackYearDate;
      }
    } catch (err) {}
  }

  return null;
}

/**
 * Filters a collection of ResearchResult papers by dynamic time range.
 * If customDate is not provided, defaults to the last 3 years (relative to current date).
 * Safely discards or warns about records with missing date values to prevent downstream parser failure.
 */
export function filterRecentData(
  results: ResearchResult[],
  customDate?: Date
): ResearchResult[] {
  const minDate = customDate || subYears(new Date(), 3);

  return results.filter((item) => {
    const pubDate = extractPublicationDate(item);
    if (!pubDate) {
      console.warn(`[Time-Gater] Record "${item.title}" discarded: missing or unparseable publicationDate.`);
      return false; // Discard record if publicationDate is missing or unparseable
    }

    // Return true if publication date meets or exceeds our cutoff
    return isAfter(pubDate, minDate) || pubDate.getTime() === minDate.getTime();
  });
}

// === 1. Semantic Scholar ===
async function searchSemanticScholar(query: string): Promise<ResearchResult[]> {
  try {
    const headers: any = {};
    if (process.env.SEMANTIC_SCHOLAR_API_KEY) headers['x-api-key'] = process.env.SEMANTIC_SCHOLAR_API_KEY;
    
    const res = await axios.get(`https://api.semanticscholar.org/graph/v1/paper/search`, {
      params: { query, limit: MAX_PER_SOURCE, fields: 'title,authors,year,url,abstract,citationCount,externalIds,publicationDate' },
      headers,
      timeout: 8000
    });
    return (res.data.data || []).map((p: any) => validateResearchResult({
      id: p.paperId || Math.random().toString(),
      title: p.title || 'Untitled',
      authors: p.authors?.map((a: any) => a.name).join(', ') || 'Unknown',
      year: p.year || 0,
      date: p.publicationDate || (p.year ? `${p.year}-01-01` : undefined),
      source: 'Semantic Scholar',
      url: p.url,
      abstract: p.abstract || '',
      doi: p.externalIds?.DOI,
      citationCount: p.citationCount || 0,
      sourceSpecific: {
        semanticScholar: {
          paperId: p.paperId,
          fieldsOfStudy: p.fieldsOfStudy || [],
          s2Url: p.url,
          isOpenAccess: !!p.externalIds?.DOI
        }
      }
    }));
  } catch (e: any) {
    if (e.response?.status !== 429) {
      console.warn('Semantic Scholar error:', e.message || 'Network error');
    }
    return [];
  }
}

// === 2. OpenAlex ===
async function searchOpenAlex(query: string): Promise<ResearchResult[]> {
  try {
    const params: any = { search: query, 'per-page': MAX_PER_SOURCE };
    if (process.env.OPENALEX_EMAIL) params.mailto = process.env.OPENALEX_EMAIL;
    
    const res = await axios.get(`https://api.openalex.org/works`, { params, timeout: 8000 });
    return (res.data.results || []).map((p: any) => validateResearchResult({
      id: p.id || Math.random().toString(),
      title: p.title || 'Untitled',
      authors: p.authorships?.map((a: any) => a.author?.display_name).join(', ') || 'Unknown',
      year: p.publication_year || 0,
      date: p.publication_date,
      source: 'OpenAlex',
      url: p.id,
      abstract: p.abstract_inverted_index ? 'Abstract available on OpenAlex' : '',
      doi: p.doi?.replace('https://doi.org/', ''),
      citationCount: p.cited_by_count || 0,
      sourceSpecific: {
        openalex: {
          isOa: p.open_access?.is_oa || false,
          oaStatus: p.open_access?.oa_status || 'closed',
          concepts: p.concepts?.map((c: any) => ({
            id: c.id,
            name: c.display_name,
            score: c.score
          })) || [],
          hostVenue: p.primary_location?.source?.display_name || ''
        }
      }
    }));
  } catch (e) {
    return [];
  }
}

// === 3. arXiv ===
async function searchArxiv(query: string): Promise<ResearchResult[]> {
  try {
    const res = await axios.get(`https://export.arxiv.org/api/query`, { params: { search_query: `all:${query}`, start: 0, max_results: MAX_PER_SOURCE }, timeout: 8000 });
    const parsed = parser.parse(res.data);
    let entries = parsed.feed?.entry || [];
    if (!Array.isArray(entries)) entries = [entries];
    return entries.map((e: any) => {
      let authors = '';
      if (Array.isArray(e.author)) authors = e.author.map((a: any) => a.name).join(', ');
      else if (e.author) authors = e.author.name;
      
      const categoriesList = Array.isArray(e.category) 
        ? e.category.map((cat: any) => cat.term || cat) 
        : (e.category?.term ? [e.category.term] : []);

      return validateResearchResult({
        id: e.id || Math.random().toString(),
        title: e.title?.replace(/\n/g, ' ') || 'Untitled',
        authors: authors || 'Unknown',
        year: e.published ? new Date(e.published).getFullYear() : 0,
        date: e.published,
        source: 'arXiv',
        url: e.id,
        abstract: e.summary?.replace(/\n/g, ' ') || '',
        doi: '',
        sourceSpecific: {
          arxiv: {
            categories: categoriesList,
            primaryCategory: e.primary_category?.term || e.category?.term || '',
            comment: e.comment || '',
            journalRef: e.journal_ref || ''
          }
        }
      });
    });
  } catch (e: any) {
    return [];
  }
}

// === 4. PubMed ===
const PubMedSearchResponseSchema = z.object({
  esearchresult: z.object({
    idlist: z.array(z.string()).optional()
  }).optional()
});

const PubMedSummaryResponseSchema = z.object({
  result: z.record(z.string(), z.any()).optional()
});

async function searchPubMed(query: string): Promise<ResearchResult[]> {
  const mailtoAddress = process.env.CROSSREF_EMAIL || 'shuvo.1807016@bau.edu.bd';
  try {
    const searchParams: Record<string, any> = { db: 'pubmed', term: query, retmode: 'json', retmax: MAX_PER_SOURCE };
    if (process.env.NCBI_API_KEY) {
      searchParams.api_key = process.env.NCBI_API_KEY;
    }

    const headers = {
      'User-Agent': `CatalystLab/1.0 (mailto:${mailtoAddress}; academic-research-hub/0.1.0)`,
      'Accept': 'application/json'
    };

    const searchRes = await axios.get(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi`, { 
      params: searchParams, 
      headers,
      timeout: 5000 
    });
    
    const parsedSearch = PubMedSearchResponseSchema.parse(searchRes.data);
    const ids = parsedSearch.esearchresult?.idlist || [];
    if (!ids.length) return [];
    
    const summaryParams: Record<string, any> = { db: 'pubmed', id: ids.join(','), retmode: 'json' };
    if (process.env.NCBI_API_KEY) {
      summaryParams.api_key = process.env.NCBI_API_KEY;
    }

    const summaryRes = await axios.get(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi`, { 
      params: summaryParams, 
      headers,
      timeout: 5000 
    });
    
    const parsedSummary = PubMedSummaryResponseSchema.parse(summaryRes.data);
    const result = parsedSummary.result || {};
    
    return ids.map((id: string) => {
      const p = result[id];
      if (!p || typeof p !== 'object') return null;
      
      const pAuthors = Array.isArray(p.authors) 
        ? p.authors.map((a: any) => a.name).filter(Boolean).join(', ') 
        : 'Unknown Author';

      const year = p.pubdate ? parseInt(p.pubdate.substring(0, 4)) || 0 : 0;
      const doiVal = p.elocationid?.startsWith('doi:') 
        ? p.elocationid.replace('doi: ', '').trim() 
        : p.articleids?.find((ai: any) => ai.idtype === 'doi')?.value || '';

      return validateResearchResult({
        id,
        title: p.title || 'Untitled PubMed Index',
        authors: pAuthors,
        year,
        date: p.pubdate,
        source: 'PubMed',
        url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
        doi: doiVal,
        sourceSpecific: {
          pubmed: {
            pmid: id,
            pmcid: p.articleids?.find((ai: any) => ai.idtype === 'pmcid')?.value || '',
            meshTerms: [],
            journal: p.source || ''
          }
        }
      });
    }).filter(Boolean) as ResearchResult[];
  } catch (error: any) {
    console.error('[Worker: PubMed] Data fetching failure:', error?.message || error);
    throw new Error(`PubMed worker failed to executed query against NCBI endpoints. Reason: ${error?.message || 'Unknown network error'}`);
  }
}

// === 5. CORE ===
async function searchCore(query: string): Promise<ResearchResult[]> {
  const apiKey = process.env.CORE_API_KEY || 'OP5A76JuIhpi0lDyKYkxmSHaUXWEG8s9';
  try {
    const res = await axios.get(`https://api.core.ac.uk/v3/search/works`, { params: { q: query, limit: MAX_PER_SOURCE }, headers: { Authorization: `Bearer ${apiKey}` }, timeout: 4000 });
    return (res.data.results || []).map((p: any) => validateResearchResult({
      id: p.id?.toString() || Math.random().toString(),
      title: p.title || 'Untitled',
      authors: p.authors?.map((a: any) => a.name).join(', ') || 'Unknown',
      year: p.yearPublished || 0,
      source: 'CORE',
      url: p.downloadUrl || (p.links?.length > 0 ? p.links[0].url : ''),
      abstract: p.abstract || '',
      doi: p.doi,
      sourceSpecific: {
        core: {
          downloadUrl: p.downloadUrl || '',
          oai: p.oai || ''
        }
      }
    }));
  } catch (e) {
    return [];
  }
}

// === 6. Crossref ===

// Define strict internal Zod schema representing Crossref API's raw message structure
const CrossrefAuthorSchema = z.object({
  given: z.string().optional(),
  family: z.string().optional(),
  name: z.string().optional()
});

const CrossrefItemSchema = z.object({
  DOI: z.string(),
  title: z.array(z.string()).optional(),
  author: z.array(CrossrefAuthorSchema).optional(),
  published: z.object({
    'date-parts': z.array(z.array(z.number())).optional()
  }).optional(),
  publisher: z.string().optional(),
  'container-title': z.array(z.string()).optional(),
  type: z.string().optional(),
  URL: z.string().optional(),
  abstract: z.string().optional(),
  'is-referenced-by-count': z.number().optional()
});

const CrossrefResponseSchema = z.object({
  status: z.string().optional(),
  message: z.object({
    items: z.array(CrossrefItemSchema)
  })
});

async function searchCrossref(query: string): Promise<ResearchResult[]> {
  const mailtoAddress = process.env.CROSSREF_EMAIL || 'shuvo.1807016@bau.edu.bd';
  try {
    const params: Record<string, any> = { query, rows: MAX_PER_SOURCE };
    if (process.env.CROSSREF_EMAIL) {
      params.mailto = process.env.CROSSREF_EMAIL;
    }

    // Configure headers to comply strictly with the Crossref Polite Pool policy
    const headers = {
      'User-Agent': `CatalystLab/1.0 (mailto:${mailtoAddress}; academic-research-hub/0.1.0)`,
      'Accept': 'application/json'
    };

    const res = await axios.get(`https://api.crossref.org/works`, { 
      params, 
      headers, 
      timeout: 5000 
    });

    // Validate the incoming raw JSON payload structure with Zod to enforce integrity
    const parsedResponse = CrossrefResponseSchema.parse(res.data);
    const items = parsedResponse.message?.items || [];

    return items.map((p) => {
      const year = p.published?.['date-parts']?.[0]?.[0] || 0;
      const dateParts = p.published?.['date-parts']?.[0];
      let crossrefDate: string | undefined = undefined;
      if (Array.isArray(dateParts) && dateParts.length > 0) {
        const y = dateParts[0];
        const m = dateParts[1] ? String(dateParts[1]).padStart(2, '0') : '01';
        const d = dateParts[2] ? String(dateParts[2]).padStart(2, '0') : '01';
        crossrefDate = `${y}-${m}-${d}`;
      }
      
      const formattedAuthors = p.author?.map((auth) => {
        if (auth.given && auth.family) return `${auth.given} ${auth.family}`;
        return auth.name || auth.family || auth.given || 'Unknown';
      }).join(', ') || 'Unknown Author';

      return validateResearchResult({
        id: p.DOI,
        title: p.title?.[0] || 'Untitled Publication',
        authors: formattedAuthors,
        year,
        date: crossrefDate,
        source: 'Crossref',
        url: p.URL || `https://doi.org/${p.DOI}`,
        abstract: p.abstract || '',
        doi: p.DOI,
        citationCount: p['is-referenced-by-count'] || 0,
        sourceSpecific: {
          crossref: {
            publisher: p.publisher || '',
            containerTitle: p['container-title']?.[0] || '',
            type: p.type || '',
            isReferencedByCount: p['is-referenced-by-count'] || 0
          }
        }
      });
    });
  } catch (error: any) {
    // Return a standard compliant error object or throw a descriptive error so the Orchestrator can trigger fallbacks
    console.error('[Worker: Crossref] Polite Pool retrieval failure:', error?.message || error);
    throw new Error(`Crossref worker failed to execute search query. Reason: ${error?.message || 'Unknown network error'}`);
  }
}

// === 7. Europe PMC ===
async function searchEuropePmc(query: string): Promise<ResearchResult[]> {
  try {
    const res = await axios.get(`https://www.ebi.ac.uk/europepmc/webservices/rest/search`, { params: { query, format: 'json', resultType: 'lite', pageSize: MAX_PER_SOURCE }, timeout: 4000 });
    return (res.data.resultList?.result || []).map((p: any) => validateResearchResult({
      id: p.id || Math.random().toString(),
      title: p.title || 'Untitled',
      authors: p.authorString || 'Unknown',
      year: parseInt(p.pubYear) || 0,
      date: p.firstPublicationDate || p.pubYear,
      source: 'Europe PMC',
      url: `https://europepmc.org/article/${p.source}/${p.id}`,
      abstract: p.abstractText || '',
      doi: p.doi,
      citationCount: p.citedByCount || 0,
      sourceSpecific: {
        crossref: {
          containerTitle: p.journalTitle || '',
          type: p.pubType?.[0] || ''
        }
      }
    }));
  } catch (e) {
    return [];
  }
}

// === 8. DOAJ ===
async function searchDoaj(query: string): Promise<ResearchResult[]> {
  try {
    const res = await axios.get(`https://doaj.org/api/v1/search/articles/${encodeURIComponent(query)}`, { params: { pageSize: MAX_PER_SOURCE }, timeout: 4000 });
    return (res.data.results || []).map((p: any) => {
      const bibjson = p.bibjson || {};
      return validateResearchResult({
        id: p.id || Math.random().toString(),
        title: bibjson.title || 'Untitled',
        authors: bibjson.author?.map((a: any) => a.name).join(', ') || 'Unknown',
        year: bibjson.year ? parseInt(bibjson.year) : 0,
        date: bibjson.year ? `${bibjson.year}-01-01` : undefined,
        source: 'DOAJ',
        url: bibjson.link?.find((l: any) => l.type === 'fulltext')?.url || '',
        abstract: bibjson.abstract || '',
        doi: bibjson.identifier?.find((i: any) => i.type === 'doi')?.id || ''
      });
    });
  } catch (e: any) {
    return [];
  }
}

// === 9. Zenodo ===
async function searchZenodo(query: string): Promise<ResearchResult[]> {
  try {
    const res = await axios.get(`https://zenodo.org/api/records`, { params: { q: query, size: MAX_PER_SOURCE }, timeout: 4000 });
    return (res.data.hits?.hits || []).map((p: any) => validateResearchResult({
      id: p.id?.toString() || Math.random().toString(),
      title: p.metadata?.title || 'Untitled',
      authors: p.metadata?.creators?.map((a: any) => a.name).join(', ') || 'Unknown',
      year: p.metadata?.publication_date ? parseInt(p.metadata.publication_date.substring(0, 4)) : 0,
      date: p.metadata?.publication_date,
      source: 'Zenodo',
      url: p.links?.html || '',
      abstract: p.metadata?.description?.replace(/<[^>]+>/g, '') || '',
      doi: p.metadata?.doi || '',
      sourceSpecific: {
        zenodo: {
          license: p.metadata?.license?.id || '',
          conceptRecId: p.conceptrecid?.toString() || '',
          community: p.metadata?.communities?.[0]?.id || ''
        }
      }
    }));
  } catch (e) {
    return [];
  }
}

// === 10. DataCite ===
async function searchDataCite(query: string): Promise<ResearchResult[]> {
  try {
    const res = await axios.get(`https://api.datacite.org/dois`, { params: { query, 'page[size]': MAX_PER_SOURCE }, timeout: 4000 });
    return (res.data.data || []).map((p: any) => validateResearchResult({
      id: p.id || Math.random().toString(),
      title: p.attributes?.titles?.[0]?.title || 'Untitled',
      authors: p.attributes?.creators?.map((a: any) => a.name).join(', ') || 'Unknown',
      year: p.attributes?.publicationYear || 0,
      date: p.attributes?.published || p.attributes?.created || (p.attributes?.publicationYear ? `${p.attributes.publicationYear}-01-01` : undefined),
      source: 'DataCite',
      url: p.attributes?.url || `https://doi.org/${p.id}`,
      abstract: p.attributes?.descriptions?.[0]?.description || '',
      doi: p.id || ''
    }));
  } catch (e) {
    return [];
  }
}

// === 11. Unpaywall ===
async function searchUnpaywall(query: string): Promise<ResearchResult[]> {
  const email = process.env.UNPAYWALL_EMAIL;
  if (!email) return [];
  try {
    const res = await axios.get(`https://api.unpaywall.org/v2/search`, { params: { query, email }, timeout: 4000 });
    return (res.data.results || []).map((p: any) => {
      const metadata = p.response || {};
      return validateResearchResult({
        id: metadata.doi || Math.random().toString(),
        title: metadata.title || 'Untitled',
        authors: metadata.z_authors?.map((a: any) => a.family).join(', ') || 'Unknown',
        year: metadata.year || 0,
        date: metadata.published_date || (metadata.year ? `${metadata.year}-01-01` : undefined),
        source: 'Unpaywall',
        url: metadata.best_oa_location?.url_for_landing_page || metadata.best_oa_location?.url_for_pdf || `https://doi.org/${metadata.doi}`,
        abstract: '',
        doi: metadata.doi || '',
        sourceSpecific: {
          unpaywall: {
            isOa: metadata.is_oa || false,
            oaStatus: metadata.oa_status || 'closed',
            bestOaLocationUrl: metadata.best_oa_location?.url || '',
            hasPdf: !!metadata.best_oa_location?.url_for_pdf
          }
        }
      });
    });
  } catch (e) {
    return [];
  }
}

// === 12. Figshare ===
const FigshareAuthorSchema = z.object({
  id: z.number().optional(),
  full_name: z.string().optional()
});

const FigshareCategorySchema = z.object({
  id: z.number().optional(),
  title: z.union([z.string(), z.number()]).optional()
});

const FigshareWorkItemSchema = z.object({
  id: z.number().or(z.string()).optional(),
  title: z.string().optional(),
  doi: z.string().optional(),
  handle: z.string().optional(),
  url: z.string().optional(),
  url_public_html: z.string().optional(),
  published_date: z.string().optional(),
  authors: z.array(FigshareAuthorSchema).optional(),
  categories: z.array(FigshareCategorySchema).optional(),
  tags: z.array(z.string()).optional(),
  description: z.string().optional()
});

const FigshareResponseSchema = z.array(FigshareWorkItemSchema);

async function searchFigshare(query: string): Promise<ResearchResult[]> {
  const mailtoAddress = process.env.CROSSREF_EMAIL || 'shuvo.1807016@bau.edu.bd';
  try {
    const headers: any = {
      'User-Agent': `CatalystLab/1.0 (mailto:${mailtoAddress}; academic-research-hub/0.1.0)`,
      'Accept': 'application/json'
    };
    if (process.env.FIGSHARE_API_KEY) {
      headers['Authorization'] = `token ${process.env.FIGSHARE_API_KEY}`;
    }
    
    const res = await axios.post(
      `https://api.figshare.com/v2/articles/search`,
      { search_for: query, limit: MAX_PER_SOURCE },
      { headers, timeout: 5000 }
    );

    const dataArray = Array.isArray(res.data) ? res.data : [];
    const parsed = FigshareResponseSchema.parse(dataArray);

    return parsed.map((p) => validateResearchResult({
      id: p.id?.toString() || Math.random().toString(),
      title: p.title || 'Untitled Figshare Contribution',
      authors: p.authors?.map((a) => a.full_name).filter(Boolean).join(', ') || 'Unknown Author',
      year: p.published_date ? parseInt(p.published_date.substring(0, 4)) || 0 : 0,
      date: p.published_date,
      source: 'Figshare',
      url: p.url_public_html || p.url || '',
      abstract: p.description || '',
      doi: p.doi || '',
      sourceSpecific: {
        figshare: {
          handle: p.handle || '',
          categories: p.categories?.map((cat) => cat.title?.toString() || '') || [],
          tags: p.tags || []
        }
      }
    }));
  } catch (error: any) {
    console.error('[Worker: Figshare] Works search retrieval failure:', error?.message || error);
    throw new Error(`Figshare worker failed to execute search query on /works endpoint. Reason: ${error?.message || 'Unknown network error'}`);
  }
}

// === 13. HDX (Humanitarian Data Exchange) ===
async function searchHdx(query: string): Promise<ResearchResult[]> {
  try {
    const res = await axios.get(`https://data.humdata.org/api/3/action/package_search`, { params: { q: query, rows: MAX_PER_SOURCE }, timeout: 4000 });
    return (res.data.result?.results || []).map((p: any) => validateResearchResult({
      id: p.id || Math.random().toString(),
      title: p.title || 'Untitled',
      authors: p.maintainer || p.organization?.title || 'Unknown',
      year: p.metadata_modified ? parseInt(p.metadata_modified.substring(0, 4)) : 0,
      date: p.metadata_modified,
      source: 'HDX',
      url: `https://data.humdata.org/dataset/${p.name}`,
      abstract: p.notes || '',
      doi: '',
      sourceSpecific: {
        hdx: {
          datasetName: p.name || '',
          organization: p.organization?.title || '',
          maintainer: p.maintainer || '',
          location: p.location || '',
          humanitarianIndicators: [
            {
              indicatorCode: p.indicator_code || '',
              name: p.title || '',
              value: p.total_downloads || p.dataset_preview || 0,
              unit: 'downloads',
              year: p.metadata_modified ? parseInt(p.metadata_modified.substring(0, 4)) : 0
            }
          ]
        }
      }
    }));
  } catch (e) {
    return [];
  }
}

// === 14. OpenAIRE ===
async function searchOpenAire(query: string): Promise<ResearchResult[]> {
  try {
    const res = await axios.get(`https://api.openaire.eu/search/publications`, { params: { title: query, size: MAX_PER_SOURCE, format: 'json' }, timeout: 4000 });
    const results = res.data?.response?.results?.result || [];
    const arr = Array.isArray(results) ? results : [results];
    return arr.map((p: any) => {
      const metadata = p.metadata?.['oaf:entity']?.['oaf:result'] || {};
      const creators = metadata.creator;
      const authorsList = Array.isArray(creators) ? creators.map((c: any) => c.$ || c).join(', ') : (creators?.$ || creators || 'Unknown');
      
      return validateResearchResult({
        id: metadata.originalId?.replace('oai:','') || Math.random().toString(),
        title: Array.isArray(metadata.title) ? metadata.title[0]?.$ : (metadata.title?.$ || 'Untitled'),
        authors: authorsList || 'Unknown',
        year: metadata.dateofacceptance ? parseInt(metadata.dateofacceptance.substring(0, 4)) : 0,
        date: metadata.dateofacceptance,
        source: 'OpenAIRE',
        url: Array.isArray(metadata.url) ? metadata.url[0]?.$ : (metadata.url?.$ || ''),
        abstract: Array.isArray(metadata.description) ? metadata.description[0]?.$ : (metadata.description?.$ || ''),
        doi: '',
        sourceSpecific: {
          openaire: {
            projectConnection: Array.isArray(metadata.project) ? metadata.project.map((pj: any) => pj.name?.$ || pj.name || '') : [],
            openAccessRoute: metadata.bestaccessright?.classid || ''
          }
        }
      });
    });
  } catch (e) {
    return [];
  }
}

// === 15. NASA ADS ===
async function searchNasaAds(query: string): Promise<ResearchResult[]> {
  const apiKey = process.env.NASA_ADS_API_KEY;
  if (!apiKey) return [];
  try {
    const res = await axios.get(`https://api.adsabs.harvard.edu/v1/search/query`, {
      params: { q: query, rows: MAX_PER_SOURCE, fl: 'id,title,author,year,abstract,doi,bibcode' },
      headers: { Authorization: `Bearer ${apiKey}` },
      timeout: 4000
    });
    return (res.data.response?.docs || []).map((p: any) => validateResearchResult({
      id: p.id || Math.random().toString(),
      title: p.title?.[0] || 'Untitled',
      authors: p.author?.join(', ') || 'Unknown',
      year: parseInt(p.year) || 0,
      date: p.pubdate || (p.year ? `${p.year}-01-01` : undefined),
      source: 'NASA ADS',
      url: p.bibcode ? `https://ui.adsabs.harvard.edu/abs/${p.bibcode}/abstract` : '',
      abstract: p.abstract || '',
      doi: p.doi?.[0] || '',
      sourceSpecific: {
        nasaAds: {
          bibcode: p.bibcode || '',
          database: p.database || [],
          keywords: p.keyword || []
        }
      }
    }));
  } catch (e) {
    return [];
  }
}

// === 16. Exa AI ===
async function searchExa(query: string): Promise<ResearchResult[]> {
  const apiKey = process.env.EXA_API_KEY;
  if (!apiKey) return [];
  try {
    const res = await axios.post(`https://api.exa.ai/search`, {
      query: query,
      numResults: MAX_PER_SOURCE,
      type: "neural",
      category: "research paper"
    }, {
      headers: { 'x-api-key': apiKey },
      timeout: 4000
    });
    
    return (res.data.results || []).map((p: any) => validateResearchResult({
      id: p.id || Math.random().toString(),
      title: p.title || 'Untitled',
      authors: p.author || 'Unknown',
      year: p.publishedDate ? parseInt(p.publishedDate.substring(0, 4)) : 0,
      date: p.publishedDate,
      source: 'Exa AI',
      url: p.url || '',
      abstract: p.text?.substring(0, 500) || '',
      doi: '',
      sourceSpecific: {
        exa: {
          highlights: p.highlights || [],
          score: p.score || 0
        }
      }
    }));
  } catch (e) {
    return [];
  }
}

// === 17. Tavily ===
const TavilyResultSchema = z.object({
  title: z.string().optional(),
  url: z.string().optional(),
  content: z.string().optional(),
  score: z.number().optional()
});

const TavilyResponseSchema = z.object({
  query: z.string().optional(),
  results: z.array(TavilyResultSchema)
});

async function searchTavily(query: string): Promise<ResearchResult[]> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return [];
  
  const mailtoAddress = process.env.CROSSREF_EMAIL || 'shuvo.1807016@bau.edu.bd';
  
  try {
    const headers = {
      'User-Agent': `CatalystLab/1.0 (mailto:${mailtoAddress}; academic-research-hub/0.1.0)`,
      'Accept': 'application/json'
    };

    const res = await axios.post(`https://api.tavily.com/search`, {
      api_key: apiKey,
      query: query,
      search_depth: "basic",
      include_answer: false,
      max_results: MAX_PER_SOURCE
    }, {
      headers,
      timeout: 5000
    });
    
    const parsedResponse = TavilyResponseSchema.parse(res.data);
    const items = parsedResponse.results || [];
    
    return items.map((p) => validateResearchResult({
      id: p.url || Math.random().toString(),
      title: p.title || 'Untitled Web Reference',
      authors: 'Web Crawler Node',
      year: new Date().getFullYear(),
      source: 'Tavily',
      url: p.url || '',
      abstract: p.content || '',
      doi: '',
      sourceSpecific: {
        tavily: {
          score: p.score || 0,
          rawContent: p.content || ''
        }
      }
    }));
  } catch (error: any) {
    console.error('[Worker: Tavily] Search execution failure:', error?.message || error);
    throw new Error(`Tavily worker failed to execute search query. Reason: ${error?.message || 'Unknown network error'}`);
  }
}

// === Orchestrator ===
export async function searchAllSources(query: string): Promise<ResearchResult[]> {
  const promises = [
    searchSemanticScholar(query),
    searchOpenAlex(query),
    searchArxiv(query),
    searchPubMed(query),
    searchCore(query),
    searchCrossref(query),
    searchEuropePmc(query),
    searchDoaj(query),
    searchZenodo(query),
    searchDataCite(query),
    searchUnpaywall(query),
    searchFigshare(query),
    searchHdx(query),
    searchOpenAire(query),
    searchNasaAds(query),
    searchExa(query),
    searchTavily(query)
  ];
  
  const results = await Promise.allSettled(promises);
  let allPapers: ResearchResult[] = [];
  
  results.forEach(res => {
    if (res.status === 'fulfilled') {
      allPapers = [...allPapers, ...res.value];
    }
  });

  // Deduplicate
  let unique: ResearchResult[] = [];
  let seenDois = new Set();
  let seenTitles = new Set();
  
  for (const paper of allPapers) {
    if (paper.doi && seenDois.has(paper.doi)) continue;
    const titleKey = paper.title.toLowerCase().trim().substring(0, 50);
    if (seenTitles.has(titleKey)) continue;
    
    if (paper.doi) seenDois.add(paper.doi);
    seenTitles.add(titleKey);
    unique.push(paper);
  }

  // Sort
  unique.sort((a, b) => {
    if (b.year !== a.year) return b.year - a.year;
    return (b.citationCount || 0) - (a.citationCount || 0);
  });
  
  return unique.slice(0, 30); // Max 30 top papers
}

/**
 * Executes an individual worker with auto-retry logic specifically designed for handling 
 * 429 (Too Many Requests) rate limiting issues via customized exponential backoff.
 */
async function executeWithRetry(
  sourceName: string,
  fetcher: () => Promise<ResearchResult[]>,
  retries = 2,
  delay = 1000
): Promise<ResearchResult[]> {
  try {
    return await fetcher();
  } catch (error: any) {
    const isRateLimited = error.response?.status === 429 || error.status === 429;
    if (isRateLimited && retries > 0) {
      console.warn(`[Orchestrator] Source "${sourceName}" rate-limited (429). Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return executeWithRetry(sourceName, fetcher, retries - 1, delay * 2);
    }
    console.warn(`[Orchestrator] Source "${sourceName}" failed permanently: ${error.message || error}`);
    return [];
  }
}

/**
 * Modular Orchestrator-Worker pattern to query dynamic, enabled academic API sources simultaneously.
 * Implements strict parallel worker dispatching (Promise.allSettled), 
 * automatic 429 exponential backoff retry fallback, and absolute Zod-schema validation integrity.
 */
export async function orchestrateSearchSources(
  query: string,
  enabledSources: string[],
  customDate?: Date,
  timeGatingEnabled = true
): Promise<ResearchResult[]> {
  const sourcesMap: Record<string, (q: string) => Promise<ResearchResult[]>> = {
    'Semantic Scholar': searchSemanticScholar,
    'OpenAlex': searchOpenAlex,
    'arXiv': searchArxiv,
    'PubMed': searchPubMed,
    'CORE': searchCore,
    'Crossref': searchCrossref,
    'Europe PMC': searchEuropePmc,
    'DOAJ': searchDoaj,
    'Zenodo': searchZenodo,
    'DataCite': searchDataCite,
    'Unpaywall': searchUnpaywall,
    'Figshare': searchFigshare,
    'HDX': searchHdx,
    'OpenAIRE': searchOpenAire,
    'NASA ADS': searchNasaAds,
    'Exa AI': searchExa,
    'Tavily': searchTavily
  };

  // Filter which workers to run. If none are explicitly provided, default to a robust, high-performance
  // subset of 6 core databases to optimize latency, avoid rate-limiting, and prevent connection gateway timeouts.
  const workersToRun = enabledSources.length > 0 
    ? enabledSources.filter(src => src in sourcesMap)
    : ['OpenAlex', 'arXiv', 'Semantic Scholar', 'PubMed', 'Crossref', 'Zenodo'];

  if (workersToRun.length === 0) {
    return [];
  }

  // Dispatch all workers concurrently
  const workerPromises = workersToRun.map(sourceName => {
    const fetcherFn = sourcesMap[sourceName];
    return executeWithRetry(sourceName, () => fetcherFn(query));
  });

  const settleResults = await Promise.allSettled(workerPromises);
  let aggregatedResults: ResearchResult[] = [];

  settleResults.forEach((res, index) => {
    const sourceName = workersToRun[index];
    if (res.status === 'fulfilled') {
      const parsedAndValidated = res.value.map(item => {
        // Zod validation fallback logic ensures robust data structure pipeline
        return validateResearchResult(item);
      });
      aggregatedResults = [...aggregatedResults, ...parsedAndValidated];
    } else {
      console.error(`[Orchestrator] Fatal worker exception for: ${sourceName}`, res.reason);
    }
  });

  // Apply time-gating logic layer immediately after API workers finish but BEFORE deduplication and sorting starts
  if (timeGatingEnabled) {
    const preFilterCount = aggregatedResults.length;
    aggregatedResults = filterRecentData(aggregatedResults, customDate);
    console.log(`[Time-Gater] Recency filter complete. Retained ${aggregatedResults.length} of ${preFilterCount} publications.`);
  }

  // Unique validation deduplication pass
  const uniqueItems: ResearchResult[] = [];
  const registeredDois = new Set<string>();
  const registeredTitles = new Set<string>();

  for (const item of aggregatedResults) {
    if (item.doi) {
      const cleanDoi = item.doi.toLowerCase().trim();
      if (registeredDois.has(cleanDoi)) continue;
      registeredDois.add(cleanDoi);
    }
    const normalizedTitle = item.title.toLowerCase().trim().substring(0, 50);
    if (registeredTitles.has(normalizedTitle)) continue;
    registeredTitles.add(normalizedTitle);

    uniqueItems.push(item);
  }

  // Sort logically; priority descending year, secondary descending citation count
  uniqueItems.sort((a, b) => {
    if (b.year !== a.year) return b.year - a.year;
    return (b.citationCount || 0) - (a.citationCount || 0);
  });

  return uniqueItems.slice(0, 40);
}

