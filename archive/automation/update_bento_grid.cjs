const fs = require('fs');
let code = fs.readFileSync('src/components/home/EnzymeGrid.tsx', 'utf8');

// The prompt specifies:
// Tablet Landscape (768px - 1024px): md:grid-cols-6 Asymmetric bento
// Desktop (>1024px): lg:grid-cols-12 master bento
// So grid should be: grid-cols-1 md:grid-cols-6 lg:grid-cols-12

const newGridClass = `<div className="grid grid-cols-1 gap-5 md:grid-cols-6 lg:grid-cols-12">`;
code = code.replace(/<div className="grid grid-cols-1 gap-5 md:grid-cols-12">/, newGridClass);

const newSpans = `const BENTO_CARDS = [
  { id: 'migration', span: 'md:col-span-6 lg:col-span-8 lg:row-span-2' },
  { id: 'health', span: 'md:col-span-3 lg:col-span-4' },
  { id: 'latency', span: 'md:col-span-3 lg:col-span-4' },
  { id: 'compliance', span: 'md:col-span-6 lg:col-span-8' },
  { id: 'eco', span: 'md:col-span-2 lg:col-span-4' },
  { id: 'ai_ready', span: 'md:col-span-2 lg:col-span-4' },
  { id: 'llmo', span: 'md:col-span-2 lg:col-span-4' },
];`;

code = code.replace(/const BENTO_CARDS = \[[\s\S]*?\];/, newSpans);

fs.writeFileSync('src/components/home/EnzymeGrid.tsx', code);
