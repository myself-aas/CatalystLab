const fs = require('fs');
let code = fs.readFileSync('src/pages/docs/SystemOverviewDoc.tsx', 'utf8');

// Replace standard tailwind color text classes with the specific hex codes requested
code = code.replace(/text-foreground/g, 'text-[#EDEDED]');
code = code.replace(/text-muted-foreground/g, 'text-[#A1A1AA]');

// Add a blockquote warning callout
const warningCallout = `
        {/* Key Architectural Tenets */}
        <section className="space-y-4">
          <h2 className="text-2xl font-display font-medium text-[#EDEDED]">Four Core Principles</h2>
          
          <blockquote className="border-l-[3px] border-[#FF9900] bg-[#FF9900]/5 p-4 my-6 rounded-r-lg">
            <p className="text-[#EDEDED] m-0 text-sm flex items-center gap-2 font-medium">
              <ShieldCheck className="size-4 text-[#FF9900]" />
              <strong>Architectural Warning:</strong> CatalystLab is a strict non-evaluating telemetry layer. It never stores payload data locally and operates in a purely ephemeral streaming context to ensure compliance with SOC2 Type II constraints.
            </p>
          </blockquote>
`;
code = code.replace(/\{\/\* Key Architectural Tenets \*\/\}\s*<section className="space-y-4">\s*<h2 className="text-2xl font-display font-medium text-\[#EDEDED\]">Four Core Principles<\/h2>/, warningCallout);

fs.writeFileSync('src/pages/docs/SystemOverviewDoc.tsx', code);
