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

walkDir('src/pages', (filePath) => {
  if (filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let original = content;

    const canonicalLighting = `<div className="absolute inset-0 bg-[radial-gradient(#222_1px,transparent_1px)] bg-[size:24px_24px] opacity-20 pointer-events-none" />
<div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(0,102,255,0.12)_0%,transparent_70%)] pointer-events-none" />`;

    // 1. Replace the specific -translate-x-1/2 ones (Pricing, About)
    content = content.replace(/<div className="pointer-events-none absolute left-1\/2 top-0 h-\[\d+px\] w-\[\d+px\] -translate-x-1\/2 rounded-full bg-\[radial-gradient\(ellipse_60%_50%_at_50%_40%,rgba\(0,102,255,0\.12\)_0%,transparent_70%\)\]"\s*\/>/g, canonicalLighting);

    // 2. Replace existing single absolute inset-0 ones that don't have the grid scrim
    // We match the exact string and if we don't see the grid scrim before or after it, we replace it.
    const patternInset0 = /<div className="absolute inset-0 bg-\[radial-gradient\(ellipse_60%_50%_at_50%_40%,rgba\(0,102,255,0\.12\)_0%,transparent_70%\)\] pointer-events-none(?: z-0)?"\s*\/>/g;
    
    // We will do a simple replace, but to avoid duplicates, we first strip existing grid scrims that are exactly the canonical string (or close)
    content = content.replace(/<div className="absolute inset-0 bg-\[radial-gradient\(#222_1px,transparent_1px\)\] \[background-size:24px_24px\] opacity-40 pointer-events-none" \/>\n?/g, '');
    content = content.replace(/<div className="absolute inset-0 bg-\[radial-gradient\(#222_1px,transparent_1px\)\] bg-\[size:24px_24px\] opacity-20 pointer-events-none" \/>\n?/g, '');
    
    content = content.replace(patternInset0, canonicalLighting);

    if (original !== content) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`Updated ambient lighting in ${filePath}`);
    }
  }
});
