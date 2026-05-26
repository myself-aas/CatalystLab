import { z } from 'zod';

/**
 * Zod validation schema for the unified Academic Research Result.
 * Handles metadata, content (findings/methodology), and source-specific fields.
 */
export const ResearchResultSchema = z.object({
  id: z.preprocess((val) => (val === null || val === undefined || val === '') ? Math.random().toString(36).substring(2, 11) : String(val), z.string()).describe('Unique identifier for the research result across academic databases'),
  title: z.preprocess((val) => (val === null || val === undefined || val === '') ? 'Untitled' : String(val), z.string().default('Untitled')).describe('Title of the publication, article, or dataset'),
  authors: z.preprocess((val) => (val === null || val === undefined || val === '') ? 'Unknown' : String(val), z.string().default('Unknown')).describe('Formatted list of authors or maintainers'),
  year: z.preprocess((val) => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
      const parsed = parseInt(val, 10);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }, z.number().default(0)).describe('Year of publication or metadata modification'),
  date: z.preprocess((val) => (val === null || val === undefined || val === '') ? undefined : String(val), z.string().optional()).describe('Exact ISO date string of publication if available'),
  doi: z.preprocess((val) => (val === null || val === undefined || val === '') ? undefined : String(val), z.string().optional()).describe('Digital Object Identifier for academic indexing'),
  url: z.preprocess((val) => (val === null || val === undefined || val === '') ? undefined : String(val), z.string().optional()).describe('Primary external link to the full text or metadata index'),
  source: z.preprocess((val) => (val === null || val === undefined || val === '') ? 'Unknown' : String(val), z.string()).describe('Retrieval source engine (e.g., OpenAlex, Semantic Scholar, arXiv, PubMed, etc.)'),
  
  // Content extraction block
  abstract: z.preprocess((val) => (val === null || val === undefined) ? '' : String(val), z.string().optional().default('')).describe('Condensed descriptive summary or abstract'),
  findings: z.array(z.string()).optional().default([]).describe('Synthesized core discoveries or conclusions'),
  
  methodology: z.object({
    description: z.string().optional().default('').describe('Brief summary of scientific methods used'),
    studyDesign: z.string().optional().default('').describe('Type of study design (e.g., RCT, cohort survey, modeling)'),
    sampleSize: z.number().optional().describe('Size of population or data points analyzed')
  }).optional().default({}),

  citationCount: z.number().optional().default(0).describe('Number of external citations registered'),

  // Source-Specific Metadata Block
  sourceSpecific: z.object({
    // arXiv (Physical Sciences, Computer Science preprints)
    arxiv: z.object({
      categories: z.array(z.string()).optional(),
      primaryCategory: z.string().optional(),
      comment: z.string().optional(),
      journalRef: z.string().optional()
    }).optional(),

    // PubMed (Life Sciences, Biomedical journals)
    pubmed: z.object({
      pmid: z.string().optional(),
      pmcid: z.string().optional(),
      meshTerms: z.array(z.string()).optional(),
      journal: z.string().optional()
    }).optional(),

    // OpenAlex (Global Open Research Index)
    openalex: z.object({
      isOa: z.boolean().optional(),
      oaStatus: z.string().optional(),
      concepts: z.array(z.object({
        id: z.string(),
        name: z.string(),
        score: z.number()
      })).optional(),
      hostVenue: z.string().optional()
    }).optional(),

    // Semantic Scholar (AI-powered academic search)
    semanticScholar: z.object({
      paperId: z.string().optional(),
      fieldsOfStudy: z.array(z.string()).optional(),
      s2Url: z.string().optional(),
      isOpenAccess: z.boolean().optional()
    }).optional(),

    // HDX (Humanitarian Data Exchange / UN OCHA)
    hdx: z.object({
      datasetName: z.string().optional(),
      organization: z.string().optional(),
      maintainer: z.string().optional(),
      location: z.string().optional(),
      humanitarianIndicators: z.array(z.object({
        indicatorCode: z.string().optional(),
        name: z.string().optional(),
        value: z.any().optional(),
        unit: z.string().optional(),
        year: z.number().optional()
      })).optional()
    }).optional(),

    // Crossref (Global DOI registration agency)
    crossref: z.object({
      publisher: z.string().optional(),
      containerTitle: z.string().optional(),
      type: z.string().optional(),
      isReferencedByCount: z.number().optional()
    }).optional(),

    // Unpaywall (Open Access tracker)
    unpaywall: z.object({
      isOa: z.boolean().optional(),
      oaStatus: z.string().optional(),
      bestOaLocationUrl: z.string().optional(),
      hasPdf: z.boolean().optional()
    }).optional(),

    // NASA ADS (Astrophysics, Space Sciences data system)
    nasaAds: z.object({
      bibcode: z.string().optional(),
      database: z.array(z.string()).optional(),
      keywords: z.array(z.string()).optional()
    }).optional(),

    // Zenodo (General discipline research repository)
    zenodo: z.object({
      license: z.string().optional(),
      conceptRecId: z.string().optional(),
      community: z.string().optional()
    }).optional(),

    // Figshare (Academic data deposit service)
    figshare: z.object({
      handle: z.string().optional(),
      categories: z.array(z.string()).optional(),
      tags: z.array(z.string()).optional()
    }).optional(),

    // OpenAIRE (European scholarly communication infrastructure)
    openaire: z.object({
      projectConnection: z.array(z.string()).optional(),
      openAccessRoute: z.string().optional()
    }).optional(),

    // CORE (Open Access research aggregator)
    core: z.object({
      downloadUrl: z.string().optional(),
      oai: z.string().optional()
    }).optional(),

    // Exa AI (Neural semantic search web index)
    exa: z.object({
      highlights: z.array(z.string()).optional(),
      score: z.number().optional()
    }).optional(),

    // Tavily (Search engine for AI agents)
    tavily: z.object({
      score: z.number().optional(),
      rawContent: z.string().optional()
    }).optional()
  }).optional().default({})
});

export type ResearchResult = z.infer<typeof ResearchResultSchema>;

/**
 * Validates a single raw research result object using Zod and handles safe parsing.
 * Prepopulates fallback structures to guarantee runtime robustness.
 */
export function validateResearchResult(data: unknown): ResearchResult {
  const result = ResearchResultSchema.safeParse(data);
  if (result.success) {
    return result.data;
  }
  
  // Custom fallback generation on parse mismatch to ensure absolute zero-crash guarantees
  console.warn('ResearchResult validation failed. Emitting sanitized schema format.', result.error.format());
  const fallbackObj = (data && typeof data === 'object') ? (data as any) : {};
  return {
    id: fallbackObj.id?.toString() || Math.random().toString(),
    title: fallbackObj.title?.toString() || 'Untitled',
    authors: fallbackObj.authors?.toString() || 'Unknown',
    year: parseInt(fallbackObj.year) || 0,
    date: fallbackObj.date?.toString(),
    doi: fallbackObj.doi?.toString(),
    url: fallbackObj.url?.toString(),
    source: fallbackObj.source?.toString() || 'Fallback Validation Parse',
    abstract: fallbackObj.abstract?.toString() || '',
    findings: Array.isArray(fallbackObj.findings) ? fallbackObj.findings.map(String) : [],
    methodology: {
      description: fallbackObj.methodology?.description?.toString() || '',
      studyDesign: fallbackObj.methodology?.studyDesign?.toString() || '',
      sampleSize: typeof fallbackObj.methodology?.sampleSize === 'number' ? fallbackObj.methodology.sampleSize : undefined
    },
    citationCount: typeof fallbackObj.citationCount === 'number' ? fallbackObj.citationCount : 0,
    sourceSpecific: fallbackObj.sourceSpecific || {}
  };
}

/**
 * Validates a collection of heterogeneous raw research results.
 */
export function validateResearchResults(data: unknown): ResearchResult[] {
  if (!Array.isArray(data)) return [];
  return data.map(validateResearchResult);
}
