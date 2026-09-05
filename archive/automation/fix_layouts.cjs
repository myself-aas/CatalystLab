const fs = require('fs');

function cleanDevSiteLayout() {
  let content = fs.readFileSync('src/components/layout/DevSiteLayout.tsx', 'utf8');
  
  // Remove states
  content = content.replace(/const \[toc, setToc\][\s\S]*?;\n/g, '');
  content = content.replace(/const \[activeTocId, setActiveTocId\][\s\S]*?;\n/g, '');
  
  // Remove TOC collection useEffect
  content = content.replace(/useEffect\(\(\) => \{\n\s*const root = articleRef\.current;[\s\S]*?\}, \[location\.pathname\]\);\n/g, '');
  
  // Remove scroll highlighting useEffect
  content = content.replace(/useEffect\(\(\) => \{\n\s*if \(toc\.length === 0\) return;[\s\S]*?\}, \[toc\]\);\n/g, '');
  
  // Remove scrollToTocSection
  content = content.replace(/const scrollToTocSection = \(id: string\) => \{[\s\S]*?setActiveTocId\(id\);\n\s*\}\n\s*\};\n/g, '');
  
  // Remove TocList
  content = content.replace(/const TocList = \([\s\S]*?<\/nav>\n\s*\);\n/g, '');

  // Remove the aside containing TocList
  content = content.replace(/<aside className="hidden w-\[220px\] shrink-0 xl:block">\n\s*<div className="sticky top-28 max-h-\[calc\(100vh-8rem\)\] overflow-y-auto py-8 pr-4">\{TocList\}<\/div>\n\s*<\/aside>\n/g, '');
  
  fs.writeFileSync('src/components/layout/DevSiteLayout.tsx', content);
}

function cleanDocsLayout() {
  let content = fs.readFileSync('src/components/docs/DocsLayout.tsx', 'utf8');
  
  // Remove states
  content = content.replace(/const \[toc, setToc\][\s\S]*?;\n/g, '');
  content = content.replace(/const \[activeTocId, setActiveTocId\][\s\S]*?;\n/g, '');
  content = content.replace(/const \[mobileTocOpen, setMobileTocOpen\] = useState\(false\);\n/g, '');
  
  // Remove TOC collection useEffect
  content = content.replace(/useEffect\(\(\) => \{\n\s*const root = articleRef\.current;[\s\S]*?\}, \[location\.pathname\]\);\n/g, '');
  
  // Remove scroll highlighting useEffect
  content = content.replace(/useEffect\(\(\) => \{\n\s*if \(toc\.length === 0\) return;[\s\S]*?\}, \[toc\]\);\n/g, '');
  
  // Remove scrollToTocSection
  content = content.replace(/const scrollToTocSection = \(id: string\) => \{[\s\S]*?setMobileTocOpen\(false\);\n\s*\}\n\s*\};\n/g, '');
  
  // Remove TocList
  content = content.replace(/const TocList = toc\.length > 0 && \([\s\S]*?<\/nav>\n\s*\);\n/g, '');

  // Remove the mobile TOC button
  content = content.replace(/\{toc\.length > 0 && \(\n\s*<button[\s\S]*?onClick=\{\(\) => setMobileTocOpen\(\(v\) => !v\)\}[\s\S]*?On this page[\s\S]*?<\/button>\n\s*\)\}/g, '');
  
  // Remove the mobile TOC dropdown
  content = content.replace(/\{mobileTocOpen && \(\n\s*<div className="border-b border-\[#dadce0\] bg-white px-4 py-3 xl:hidden dark:border-white\/10 dark:bg-\[#202124\]">\n\s*\{TocList\}\n\s*<\/div>\n\s*\)\}/g, '');

  // Remove the aside containing TocList
  content = content.replace(/<aside className="hidden w-\[220px\] shrink-0 xl:block">\n\s*<div className="sticky top-28 max-h-\[calc\(100vh-8rem\)\] overflow-y-auto py-8 pr-4">\{TocList\}<\/div>\n\s*<\/aside>\n/g, '');
  
  fs.writeFileSync('src/components/docs/DocsLayout.tsx', content);
}

cleanDevSiteLayout();
cleanDocsLayout();
