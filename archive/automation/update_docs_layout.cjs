const fs = require('fs');
let code = fs.readFileSync('src/components/docs/DocsLayout.tsx', 'utf8');

// The <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed text-white"> needs scrollbar-none touch-pan-x
code = code.replace(/<pre className="overflow-x-auto p-4 text-\[13px\] leading-relaxed text-white">/g, '<pre className="overflow-x-auto scrollbar-none touch-pan-x p-4 text-[13px] leading-relaxed text-[#00D2FF] font-mono">');

fs.writeFileSync('src/components/docs/DocsLayout.tsx', code);
