const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    if (fs.statSync(dirPath).isDirectory()) {
      walkDir(dirPath, callback);
    } else {
      callback(dirPath);
    }
  });
}

walkDir('src', (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let original = content;

    // Badges replacement logic:
    // If we see border-white/10 and bg-white/5 (or vice-versa) AND text-[#0066FF]
    // we replace the border/bg classes with the proper ones.
    
    // #0066FF
    content = content.replace(/border-white\/10\s+bg-white\/5\s+([^>]*?)text-\[\#0066FF\]/g, 'border-[#0066FF]/20 bg-[#0066FF]/10 $1text-[#0066FF]');
    content = content.replace(/bg-white\/5\s+border-white\/10\s+([^>]*?)text-\[\#0066FF\]/g, 'bg-[#0066FF]/10 border-[#0066FF]/20 $1text-[#0066FF]');
    
    content = content.replace(/border-white\/10\s+bg-white\/5\s+([^>]*?)text-primary/g, 'border-primary/20 bg-primary/10 $1text-primary');
    content = content.replace(/bg-white\/5\s+border-white\/10\s+([^>]*?)text-primary/g, 'bg-primary/10 border-primary/20 $1text-primary');

    // cyan-400
    content = content.replace(/border-white\/10\s+bg-white\/5\s+([^>]*?)text-cyan-/g, 'border-cyan-500/20 bg-cyan-500/10 $1text-cyan-');
    content = content.replace(/bg-white\/5\s+border-white\/10\s+([^>]*?)text-cyan-/g, 'bg-cyan-500/10 border-cyan-500/20 $1text-cyan-');

    // emerald-400
    content = content.replace(/border-white\/10\s+bg-white\/5\s+([^>]*?)text-emerald-/g, 'border-emerald-500/20 bg-emerald-500/10 $1text-emerald-');
    content = content.replace(/bg-white\/5\s+border-white\/10\s+([^>]*?)text-emerald-/g, 'bg-emerald-500/10 border-emerald-500/20 $1text-emerald-');

    if (original !== content) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`Updated badges in ${filePath}`);
    }
  }
});
