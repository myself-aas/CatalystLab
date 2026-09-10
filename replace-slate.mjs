import fs from 'fs';
import path from 'path';

const REPLACEMENTS = [
  { regex: /\[var\(--theme-slate-900\)]\/10/g, replacement: 'white/10' },
  { regex: /\[var\(--theme-slate-900\)]/g, replacement: 'white' },
  { regex: /\[var\(--theme-slate-50\)]/g, replacement: 'black' },
];

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let newContent = content;
      for (const { regex, replacement } of REPLACEMENTS) {
        newContent = newContent.replace(regex, replacement);
      }
      if (newContent !== content) {
        console.log(`Updated ${fullPath}`);
        fs.writeFileSync(fullPath, newContent);
      }
    }
  }
}

processDir('./src');
