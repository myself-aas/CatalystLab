import { Paper } from './research-api';

export type CitationFormat =
  | 'bibtex' | 'ris' | 'apa' | 'mla' | 'chicago' | 'harvard' | 'vancouver'
  | 'ieee' | 'ama' | 'nature' | 'csv' | 'json' | 'endnote_xml' | 'word_bib';

export function generateBibTeX(paper: Paper): string {
  const id = (paper.authors[0]?.split(' ').pop() || 'paper').toLowerCase() + (paper.year || '');
  return `@article{${id},
  title={${paper.title}},
  author={${paper.authors.join(' and ')}},
  year={${paper.year || 'n.d.'}},
  journal={${paper.journal || 'Research Paper'}},
  url={${paper.url}}
}`;
}

export function generateAPA(paper: Paper): string {
  const year = paper.year || 'n.d.';
  const authors = paper.authors.map(a => {
    const parts = a.split(' ');
    const last = parts.pop();
    const firstInitial = parts[0]?.charAt(0);
    return last + (firstInitial ? `, ${firstInitial}.` : '');
  }).join(', ');
  return `${authors} (${year}). ${paper.title}. ${paper.journal || ''}. ${paper.url}`;
}

export function generateMLA(paper: Paper): string {
  const authors = paper.authors.join(', ');
  return `${authors}. "${paper.title}." ${paper.journal || ''}, ${paper.year || ''}, ${paper.url}.`;
}

export function generateChicago(paper: Paper): string {
  const authors = paper.authors.join(', ');
  return `${authors}. "${paper.title}." ${paper.journal || ''} (${paper.year || ''}). ${paper.url}.`;
}

export function generateHarvard(paper: Paper): string {
  const authors = paper.authors.join(', ');
  return `${authors} (${paper.year || ''}) '${paper.title}', ${paper.journal || ''}. Available at: ${paper.url}.`;
}

export function generateVancouver(paper: Paper): string {
  return `${paper.title}. ${paper.journal || ''}. ${paper.year || ''};${paper.url}.`;
}

export function generateIEEE(paper: Paper): string {
  return `[1] ${paper.authors.join(', ')}, "${paper.title}," ${paper.journal || ''}, ${paper.year || ''}. [Online]. Available: ${paper.url}.`;
}

export function generateAMA(paper: Paper): string {
  return `${paper.authors.join(', ')}. ${paper.title}. ${paper.journal || ''}. Published ${paper.year || ''}. Accessed ${new Date().toLocaleDateString()}. ${paper.url}.`;
}

export function generateNature(paper: Paper): string {
  return `${paper.authors.join(', ')}. ${paper.title}. ${paper.journal || ''} ${paper.year || ''}. ${paper.url}.`;
}

export function generateRIS(paper: Paper): string {
  return `TY  - JOUR\nTI  - ${paper.title}\nAU  - ${paper.authors.join('\nAU  - ')}\nPY  - ${paper.year || ''}\nUR  - ${paper.url}\nER  -`;
}

export function generateCSV(paper: Paper): string {
  return `Title,Authors,Year,Journal,URL\n"${paper.title}","${paper.authors.join('; ')}",${paper.year || ''},"${paper.journal || ''}","${paper.url}"`;
}

export function generateJSON(paper: Paper): string {
  return JSON.stringify(paper, null, 2);
}

export function generateEndNoteXML(paper: Paper): string {
  return `<xml><records><record><title>${paper.title}</title><authors>${paper.authors.join('; ')}</authors></record></records></xml>`;
}

export function generateWordBib(paper: Paper): string {
  return `<b:BibTeX xmlns:b="http://schemas.openxmlformats.org/officeDocument/2006/bibliography"><b:Source><b:Title>${paper.title}</b:Title></b:Source></b:BibTeX>`;
}

export function exportCitations(paper: Paper, format: CitationFormat): string {
  switch(format) {
    case 'bibtex': return generateBibTeX(paper);
    case 'ris': return generateRIS(paper);
    case 'apa': return generateAPA(paper);
    case 'mla': return generateMLA(paper);
    case 'chicago': return generateChicago(paper);
    case 'harvard': return generateHarvard(paper);
    case 'vancouver': return generateVancouver(paper);
    case 'ieee': return generateIEEE(paper);
    case 'ama': return generateAMA(paper);
    case 'nature': return generateNature(paper);
    case 'csv': return generateCSV(paper);
    case 'json': return generateJSON(paper);
    case 'endnote_xml': return generateEndNoteXML(paper);
    case 'word_bib': return generateWordBib(paper);
    default: return generateAPA(paper);
  }
}
