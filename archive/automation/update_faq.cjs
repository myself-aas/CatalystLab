const fs = require('fs');
let code = fs.readFileSync('src/components/home/FaqAccordion.tsx', 'utf8');

// The terminal body has `overflow-x-auto no-scrollbar relative`. We should ensure touch-pan-x and scrollbar-none 
// (which tailwind supports via custom plugins or just adding the classes directly).
code = code.replace(/className="p-6 sm:p-8 flex-1 overflow-x-auto no-scrollbar relative"/g, 'className="p-6 sm:p-8 flex-1 overflow-x-auto scrollbar-none touch-pan-x relative"');

fs.writeFileSync('src/components/home/FaqAccordion.tsx', code);
