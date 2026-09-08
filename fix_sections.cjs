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

    // Clean up dangling "sm:", "md:", "lg:", "xl:" 
    content = content.replace(/\s+(sm:|md:|lg:|xl:)\s+/g, ' ');
    content = content.replace(/\s+(sm:|md:|lg:|xl:)"/g, '"');

    // Add ds-section to <section ...> that lack it
    // Most sections in pages should have ds-section if they don't have it and are big sections
    content = content.replace(/<section className="([^"]+)"/g, (match, classStr) => {
      let classes = classStr.split(/\s+/).filter(c => c.trim() !== '');
      if (!classes.includes('ds-section')) {
        // If it's a section, give it ds-section. But wait, what if it's a small section like in BlogPostPage?
        // Let's just add it if it's a section. The user wants consistent vertical rhythm on all routes.
        classes.push('ds-section');
      }
      return `<section className="${classes.join(' ')}"`;
    });
    
    // Some divs also acted as sections, e.g., <div className="ds-page-shell"> which lost their py-16.
    content = content.replace(/<main className="([^"]+)"/g, (match, classStr) => {
      let classes = classStr.split(/\s+/).filter(c => c.trim() !== '');
      if (classes.includes('ds-page-shell') && !classes.includes('ds-section')) {
        classes.push('ds-section');
      }
      return `<main className="${classes.join(' ')}"`;
    });
    
    // Top level wrappers often had min-h-screen ds-page-top
    // No, min-h-screen should NOT have ds-section because ds-section adds padding block, and the wrapper just needs ds-page-top or nothing.
    // The sections INSIDE the wrapper are what needs padding block.

    if (original !== content) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`Fixed ${filePath}`);
    }
  }
});
