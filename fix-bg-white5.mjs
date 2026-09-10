import fs from 'fs';
import path from 'path';

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('bg-white/5')) {
        let newContent = content.replace(/bg-white\/5/g, 'bg-[var(--bg-surface)]');
        fs.writeFileSync(fullPath, newContent);
        console.log(`Updated bg-white/5 in ${fullPath}`);
      }
    }
  }
}

processDir('./src');
