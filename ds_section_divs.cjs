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

    // Check for <div className="ds-page-shell"> and add ds-section if it's missing
    content = content.replace(/<div className="([^"]+)"/g, (match, classStr) => {
      let classes = classStr.split(/\s+/).filter(c => c.trim() !== '');
      if (classes.includes('ds-page-shell') && !classes.includes('ds-section')) {
        classes.push('ds-section');
      }
      return `<div className="${classes.join(' ')}"`;
    });

    if (original !== content) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`Fixed DIVs in ${filePath}`);
    }
  }
});
