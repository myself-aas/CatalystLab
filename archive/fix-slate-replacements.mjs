import fs from 'fs';
import path from 'path';

function fixFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/bg-white\/10/g, 'bg-[var(--bg-panel-hover)]');
  // Wait, I also replaced `[var(--theme-slate-900)]` with `white`
  // so `text-white` was created in places where it should be `text-[var(--text-primary)]`.
  // I already did `sed` for Sidebar, but let's check NavbarSearch.tsx
  fs.writeFileSync(file, content);
  console.log('Fixed', file);
}

fixFile('src/components/layout/NavbarSearch.tsx');
fixFile('src/components/layout/Sidebar.tsx');
