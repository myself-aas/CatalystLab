const fs = require('fs');
const glob = require('glob'); // Note: we can just use fs.readdirSync if glob is not installed, but let's just do a child_process approach or raw fs.

const dir = 'src/pages/docs';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const path = `${dir}/${file}`;
  let code = fs.readFileSync(path, 'utf8');
  
  // Replace: border-X-200 bg-X-50 text-X-800
  // regex: border-([a-z]+)-200 bg-\1-50 py-0.5 text-xs font-semibold text-\1-800
  code = code.replace(/border-([a-z]+)-200 bg-\1-50 (py-0\.5 text-xs font-semibold) text-\1-800/g, 'border-$1-500/20 bg-$1-500/10 $2 text-$1-400');
  
  // Scoring matrix boxes: border-X-200 bg-X-50/50
  code = code.replace(/border-([a-z]+)-200 bg-\1-50\/50/g, 'border-$1-500/30 bg-$1-500/10');
  
  // Architecture numbered bubbles: bg-sky-100 text-sky-800 -> bg-sky-500/20 text-sky-400
  code = code.replace(/bg-([a-z]+)-100 text-\1-800/g, 'border border-$1-500/30 bg-$1-500/20 text-$1-400');
  
  fs.writeFileSync(path, code);
}
console.log('Fixed doc colors');
