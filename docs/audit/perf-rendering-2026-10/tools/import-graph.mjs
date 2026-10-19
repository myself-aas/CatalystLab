import fs from 'node:fs'; import path from 'node:path';
const root = path.resolve(process.cwd(), 'src');
const exts = ['', '.tsx', '.ts', '/index.tsx', '/index.ts'];
function resolve(from, spec) {
  if (!spec.startsWith('.') && !spec.startsWith('@/')) return null;
  const base = spec.startsWith('@/') ? path.join(root, spec.slice(2)) : path.resolve(path.dirname(from), spec);
  for (const e of exts) { const p = base + e; if (fs.existsSync(p) && fs.statSync(p).isFile()) return p; }
  return null;
}
// static imports only (strip dynamic import() calls)
const staticImports = (src) => {
  const re = /(?:^|\n)\s*import\s+(?:type\s+)?[^'";]*?from\s*['"]([^'"]+)['"]|(?:^|\n)\s*import\s*['"]([^'"]+)['"]|export\s+\*\s+from\s*['"]([^'"]+)['"]|export\s+\{[^}]*\}\s*from\s*['"]([^'"]+)['"]/g;
  const out = []; let m; while ((m = re.exec(src))) out.push(m[1] || m[2] || m[3] || m[4]); return out;
};
const seen = new Map(); const parent = new Map();
const queue = [path.join(root, 'main.tsx')];
while (queue.length) {
  const f = queue.shift(); if (seen.has(f)) continue; seen.set(f, true);
  if (f.includes('/tests/')) continue;
  const src = fs.readFileSync(f, 'utf8');
  for (const s of staticImports(src)) { const r = resolve(f, s); if (r && !seen.has(r)) { parent.set(r, f); queue.push(r); } }
}
const targets = ['recharts', 'd3', 'firebase/'];
const hits = [];
for (const f of seen.keys()) {
  const src = fs.readFileSync(f, 'utf8');
  if (targets.some(t => new RegExp(`from\\s*['"]${t}`).test(src) || src.includes(`from "${t}`) || src.includes(`from '${t}`))) {
    const chain = []; let c = f; while (c) { chain.unshift(path.relative(root, c)); c = parent.get(c); }
    hits.push(chain.join('  ->  '));
  }
}
console.log('eager modules reached:', seen.size);
console.log(hits.slice(0, 12).join('\n'));
// which eager module pulls each heavy library
for (const lib of ['recharts', 'firebase', 'd3-', 'motion/react', 'cobe', 'three']) {
  const found = [...seen.keys()].filter(f => { const s = fs.readFileSync(f, 'utf8'); return new RegExp(`from\\s*['"]${lib}`).test(s); });
  console.log(lib, '->', found.map(f => path.relative(root, f)).join(', ') || '(none)');
}
