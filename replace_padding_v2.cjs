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

const padRegex = /\b(p[ytb]-[1-9][0-9]*|sm:p[ytb]-[1-9][0-9]*|lg:p[ytb]-[1-9][0-9]*|md:p[ytb]-[1-9][0-9]*)\b/g;
// Padding targets we want to convert to ds-section
const targetPaddings = new Set([
  '10', '12', '14', '16', '18', '20', '24', '28', '32'
]);

walkDir('src/pages', (filePath) => {
  if (filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let original = content;

    // We will look for className="...".
    // If it has one of the target paddings, and it's a structural component, we replace with ds-section.
    // Instead of parsing AST, we can just replace the regex.
    
    let modified = content.replace(/className="([^"]+)"/g, (match, classStr) => {
      let classes = classStr.split(/\s+/);
      let needsDsSection = false;
      let newClasses = [];
      
      classes.forEach(c => {
        let isLargePadding = false;
        let matchPad = c.match(/^(?:sm:|md:|lg:|xl:)?p[ytb]-([0-9]+)$/);
        if (matchPad && targetPaddings.has(matchPad[1])) {
          isLargePadding = true;
        }
        
        if (isLargePadding) {
          needsDsSection = true;
        } else {
          newClasses.push(c);
        }
      });
      
      if (needsDsSection && !newClasses.includes('ds-section')) {
        newClasses.push('ds-section');
      }
      
      return `className="${newClasses.join(' ')}"`;
    });

    if (original !== modified) {
      fs.writeFileSync(filePath, modified, 'utf-8');
      console.log(`Updated ${filePath}`);
    }
  }
});
