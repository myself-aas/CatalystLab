const fs = require('fs');
let code = fs.readFileSync('src/pages/ToolPage.tsx', 'utf8');

const regex = /<SEOHead[\s\S]*?<div className="mb-8 flex items-center justify-between">[\s\S]*?<\/Link>/m;
const replacement = `<SEOHead
        title={\`\${meta.catalystName || meta.name} Catalyst\`}
        description={meta.description}
        canonicalUrl={\`https://www.catalystlab.tech/tool/\${engineType}\`}
      />
      <section className="relative overflow-hidden border-b border-white/[0.06] px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-[#5E6AD2]/15 blur-[140px]" />
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <div className="mb-8 flex justify-end">`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/pages/ToolPage.tsx', code);
