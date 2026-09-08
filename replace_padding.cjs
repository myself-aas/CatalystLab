const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const targetClasses = [
  'py-16', 'py-20', 'py-24', 'pt-16', 'pt-20', 'pt-24', 'pb-16', 'pb-20', 'pb-24', 'py-12', 'py-10', 'py-14',
  'sm:py-20', 'sm:pb-20', 'sm:pb-24', 'sm:pb-16', 'sm:py-16', 'sm:py-18', 'sm:pb-12'
];

walkDir('src/pages', (filePath) => {
  if (filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let original = content;

    // Replace on <section className="...">
    // Replace on <main className="...">
    // Replace on <div ... className="... min-h-screen ...">
    // Replace on <div className="ds-page-shell ...">

    // A simpler regex to remove those specific classes and add ds-section where appropriate.
    // Instead of complex parsing, let's just replace occurrences of the target padding classes with ds-section
    // BUT only if they are large paddings and we don't want to duplicate ds-section.
    
    let modified = content;
    
    // For min-h-screen wrappers, replace pb-20, pb-24 etc. with ds-page-shell or nothing if it doesn't make sense?
    // Actually, ds-section is for padding block. So on sections/mains it's perfect.
    // Let's replace those padding classes with 'ds-section'
    
    targetClasses.forEach(cls => {
      // Find className="..." containing the class
      let regex = new RegExp(`\\b${cls}\\b`, 'g');
      modified = modified.replace(regex, '');
    });
    
    // Clean up multiple spaces
    modified = modified.replace(/  +/g, ' ');
    modified = modified.replace(/className="\s+/g, 'className="');
    modified = modified.replace(/\s+"/g, '"');
    
    if (original !== modified) {
      fs.writeFileSync(filePath, modified, 'utf-8');
      console.log(`Updated ${filePath}`);
    }
  }
});
