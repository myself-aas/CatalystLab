import { Paper } from '@/lib/types';

export type CitationFormat =
  | 'bibtex'      // .bib  — LaTeX standard
  | 'ris'         // .ris  — RefMan, Mendeley, Zotero, EndNote
  | 'apa'         // Plain text APA 7th edition
  | 'mla'         // Plain text MLA 9th edition
  | 'chicago'     // Chicago author-date
  | 'harvard'     // Harvard referencing
  | 'vancouver'   // Vancouver / ICMJE (biomedical)
  | 'ieee'        // IEEE citation style
  | 'ama'         // American Medical Association
  | 'nature'      // Nature journal style
  | 'csv'         // .csv spreadsheet
  | 'json'        // .json structured data
  | 'endnote_xml' // .xml for EndNote
  | 'word_bib';   // .xml for MS Word bibliography

export function exportCitations(papers: Paper[], format: CitationFormat): string {
  switch(format) {
    case 'bibtex': return papers.map(toBibTeX).join('\n\n');
    case 'ris': return papers.map(toRIS).join('\n\n');
    case 'apa': return papers.map(toAPA).join('\n\n');
    case 'mla': return papers.map(toMLA).join('\n\n');
    case 'chicago': return papers.map(toChicago).join('\n\n');
    case 'harvard': return papers.map(toHarvard).join('\n\n');
    case 'vancouver': return papers.map(toVancouver).join('\n\n');
    case 'ieee': return papers.map(toIEEE).join('\n\n');
    case 'ama': return papers.map(toAMA).join('\n\n');
    case 'nature': return papers.map(toNature).join('\n\n');
    case 'csv': return toCSV(papers);
    case 'json': return JSON.stringify(papers, null, 2);
    case 'endnote_xml': return toEndNoteXML(papers);
    case 'word_bib': return toWordBib(papers);
    default: return '';
  }
}

function toBibTeX(paper: Paper): string {
  const key = (paper.authors[0]?.split(' ').pop() || 'Unknown') + (paper.year || '');
  return `@article{${key},
  title     = {${paper.title}},
  author    = {${paper.authors.join(' and ')}},
  year      = {${paper.year || 'n.d.'}},
  journal   = {${paper.journal || paper.source}},
  doi       = {${paper.doi || ''}},
  url       = {${paper.url || ''}},
  abstract  = {${paper.abstract?.substring(0, 500) || ''}}
}`;
}

function toRIS(paper: Paper): string {
  const lines = [
    'TY  - JOUR',
    `TI  - ${paper.title}`,
    ...paper.authors.map(a => `AU  - ${a}`),
    `PY  - ${paper.year || ''}`,
    `DO  - ${paper.doi || ''}`,
    `UR  - ${paper.url || ''}`,
    `AB  - ${paper.abstract?.substring(0, 500) || ''}`,
    `JO  - ${paper.journal || ''}`,
    'ER  -'
  ];
  return lines.join('\n');
}

function toAPA(paper: Paper): string {
  const authors = formatAuthorsAPA(paper.authors);
  return `${authors} (${paper.year || 'n.d.'}). ${paper.title}. ${paper.journal || ''}. https://doi.org/${paper.doi}`;
}

function toMLA(paper: Paper): string {
  const authors = formatAuthorsMLA(paper.authors);
  return `${authors}. "${paper.title}." ${paper.journal || ''}, ${paper.year || 'n.d.'}, doi:${paper.doi}.`;
}

function toChicago(paper: Paper): string {
  const authors = formatAuthorsChicago(paper.authors);
  return `${authors}. ${paper.year || 'n.d.'}. "${paper.title}." ${paper.journal || ''}. doi:${paper.doi}.`;
}

function toHarvard(paper: Paper): string {
  const authors = formatAuthorsHarvard(paper.authors);
  return `${authors} (${paper.year || 'n.d.'}) '${paper.title}', ${paper.journal || ''}. Available at: ${paper.url}.`;
}

function toVancouver(paper: Paper): string {
  const authors = formatAuthorsVancouver(paper.authors);
  return `${authors}. ${paper.title}. ${paper.journal || ''}. ${paper.year || 'n.d.'}; doi:${paper.doi}.`;
}

function toIEEE(paper: Paper): string {
  const authors = formatAuthorsIEEE(paper.authors);
  return `${authors}, "${paper.title}," ${paper.journal || ''}, vol. ${paper.volume || ''}, no. ${paper.issue || ''}, pp. ${paper.pages || ''}, ${paper.year || 'n.d.'}.`;
}

function toAMA(paper: Paper): string {
  const authors = formatAuthorsAMA(paper.authors);
  return `${authors}. ${paper.title}. ${paper.journal || ''}. ${paper.year || 'n.d.'};${paper.volume || ''}(${paper.issue || ''}):${paper.pages || ''}. doi:${paper.doi}.`;
}

function toNature(paper: Paper): string {
  const authors = formatAuthorsNature(paper.authors);
  return `${authors}. ${paper.title}. ${paper.journal || ''} ${paper.volume || ''}, ${paper.pages || ''} (${paper.year || 'n.d.'}).`;
}

function toCSV(papers: Paper[]): string {
  const header = 'Title,Authors,Year,Journal,DOI,URL,Citations,Abstract';
  const rows = papers.map(p =>
    [p.title, p.authors.join('; '), p.year, p.journal, p.doi, p.url,
     p.citation_count, p.abstract?.substring(0,200)]
    .map(v => `"${String(v || '').replace(/"/g, '""')}"`)
    .join(',')
  );
  return [header, ...rows].join('\n');
}

function toEndNoteXML(papers: Paper[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?><records>${papers.map(p => `
  <record>
    <titles><title>${p.title}</title></titles>
    <authors>${p.authors.map(a => `<author>${a}</author>`).join('')}</authors>
    <dates><year>${p.year}</year></dates>
    <periodical><full-title>${p.journal}</full-title></periodical>
    <electronic-resource-num>${p.doi}</electronic-resource-num>
  </record>`).join('')}</records>`;
}

function toWordBib(papers: Paper[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?><b:Sources xmlns:b="http://schemas.openxmlformats.org/officeDocument/2006/bibliography">${papers.map(p => `
  <b:Source>
    <b:Tag>${p.id}</b:Tag>
    <b:SourceType>JournalArticle</b:SourceType>
    <b:Title>${p.title}</b:Title>
    <b:Year>${p.year}</b:Year>
    <b:JournalName>${p.journal}</b:JournalName>
    <b:Author><b:Author><b:NameList>${p.authors.map(a => `<b:Person><b:Last>${a.split(' ').pop()}</b:Last><b:First>${a.split(' ').shift()}</b:First></b:Person>`).join('')}</b:NameList></b:Author></b:Author>
  </b:Source>`).join('')}</b:Sources>`;
}

// Helper formatting functions
function formatAuthorsAPA(authors: string[]): string {
  if (authors.length === 0) return 'n.d.';
  if (authors.length === 1) return authors[0];
  if (authors.length === 2) return `${authors[0]} & ${authors[1]}`;
  return `${authors.slice(0, -1).join(', ')}, & ${authors[authors.length - 1]}`;
}

function formatAuthorsMLA(authors: string[]): string {
  if (authors.length === 0) return 'n.d.';
  if (authors.length === 1) return authors[0];
  if (authors.length === 2) return `${authors[0]} and ${authors[1]}`;
  return `${authors[0]}, et al`;
}

function formatAuthorsChicago(authors: string[]): string {
  return formatAuthorsAPA(authors);
}

function formatAuthorsHarvard(authors: string[]): string {
  return formatAuthorsAPA(authors);
}

function formatAuthorsVancouver(authors: string[]): string {
  if (authors.length > 6) return `${authors.slice(0, 6).join(', ')}, et al`;
  return authors.join(', ');
}

function formatAuthorsIEEE(authors: string[]): string {
  if (authors.length > 3) return `${authors[0]} et al.`;
  return authors.join(', ');
}

function formatAuthorsAMA(authors: string[]): string {
  return formatAuthorsVancouver(authors);
}

function formatAuthorsNature(authors: string[]): string {
  if (authors.length > 5) return `${authors[0]} et al.`;
  return authors.join(', ');
}
