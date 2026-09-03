const fs = require('fs');

let content = fs.readFileSync('src/components/docs/DocsLayout.tsx', 'utf8');

// Remove the mobile TOC dropdown
content = content.replace(/\{mobileTocOpen && toc\.length > 0 && \(\n\s*<div className="border-b border-\[#dadce0\] bg-white px-4 py-3 xl:hidden dark:border-white\/10 dark:bg-\[#202124\]">\n\s*\{TocList\}\n\s*<\/div>\n\s*\)\}/g, '');

fs.writeFileSync('src/components/docs/DocsLayout.tsx', content);
