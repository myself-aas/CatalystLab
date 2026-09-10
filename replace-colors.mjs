import fs from 'fs';
import path from 'path';

const REPLACEMENTS = [
  { regex: /\[#0066FF\]/g, replacement: '[var(--accent-framer-blue)]' },
  { regex: /\[#00D2FF\]/g, replacement: '[var(--accent-cyan-edge)]' },
  { regex: /\[#00F298\]/g, replacement: '[var(--accent-emerald-vital)]' },
  { regex: /\[#8A2BE2\]/g, replacement: '[var(--accent-violet-synth)]' },
  { regex: /\[#FF9900\]/g, replacement: '[var(--accent-amber-sec)]' },
  { regex: /\[#999999\]/g, replacement: '[var(--text-secondary)]' },
  { regex: /\[var\(--theme-slate-50\)]/g, replacement: '[var(--bg-surface-elevated)]' },
  { regex: /\[var\(--theme-slate-900\)]\/5/g, replacement: 'white/5' },
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
